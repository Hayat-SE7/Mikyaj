// Versioned API v1 Router (/api/v1/...)
// Implements Mikyaj Engineering Specification Rev. 5 (Section 11) & SRS v2.1 (Section 8.2)

import { Router, Request, Response } from 'express';
import { db } from './db';
import { 
  commitBooking, 
  calculateAvailability, 
  run50ConcurrencyTest, 
  getHoursUntilAppointment,
  normalizePhoneNumber
} from './bookingEngine';
import { notificationWorkers } from './notificationWorker';
import { 
  rateLimitMiddleware, 
  sendStandardError, 
  createSession, 
  validateSession, 
  revokeSession,
  requireAuth 
} from './auth';
import { BookingStatus } from './types';

export const apiV1Router = Router();

// -------------------------------------------------------------
// 1. SYSTEM HEALTH & DIAGNOSTICS
// -------------------------------------------------------------
apiV1Router.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    system: 'Mikyaj Beauty Parlor Engine',
    version: '2.1.0',
    specification: 'Rev. 5 Confirmed Baseline',
    operatingTimezone: db.policies.timezone,
    currency: db.policies.currency,
    timestamp: new Date().toISOString()
  });
});

// -------------------------------------------------------------
// 2. PUBLIC & CUSTOMER CATALOG / AVAILABILITY
// -------------------------------------------------------------
apiV1Router.get('/services', (req: Request, res: Response) => {
  const activeServices = db.services.filter(s => s.active);
  res.json({
    services: activeServices,
    categories: db.categories
  });
});

apiV1Router.get('/availability', (req: Request, res: Response) => {
  const { serviceId, date, staffId } = req.query;

  if (!serviceId || !date) {
    return sendStandardError(res, 400, 'VALIDATION_ERROR', 'serviceId and date query parameters are required.');
  }

  const slots = calculateAvailability(
    serviceId as string, 
    date as string, 
    staffId ? (staffId as string) : undefined
  );

  res.json({
    date: date as string,
    serviceId: serviceId as string,
    slots
  });
});

// -------------------------------------------------------------
// 3. BOOKINGS CREATION & LIFECYCLE (CUSTOMER & GUEST)
// -------------------------------------------------------------

// POST /api/v1/bookings (Rate-limited 10 req/min/IP + Idempotency-Key support §10.7, §11.1)
apiV1Router.post('/bookings', rateLimitMiddleware, async (req: Request, res: Response) => {
  const idempotencyKey = req.headers['idempotency-key'] as string;
  const { serviceId, date, startTime, stylistId, customerName, customerPhone, customerEmail, specialRequests, branchId } = req.body;

  if (!serviceId || !date || !startTime || !customerName || !customerPhone || !customerEmail) {
    return sendStandardError(res, 400, 'VALIDATION_ERROR', 'Missing required booking fields (serviceId, date, startTime, customerName, phone, email).');
  }

  // Check 24h Idempotency Cache (DEC-010, §10.7, AUD-05)
  if (idempotencyKey) {
    const existingKey = db.idempotencyKeys.find(k => k.key === idempotencyKey);
    if (existingKey) {
      if (new Date(existingKey.expiresAt) > new Date()) {
        return res.status(existingKey.responseStatus).json(existingKey.responseBody);
      }
    }
  }

  const commitResult = await commitBooking({
    serviceId,
    date,
    startTime,
    stylistId,
    customerName,
    customerPhone,
    customerEmail,
    branchId,
    specialRequests,
    idempotencyKey
  });

  if (!commitResult.success) {
    return sendStandardError(
      res, 
      commitResult.statusCode, 
      commitResult.errorCode || 'BOOKING_FAILED', 
      commitResult.message || 'Unable to complete appointment reservation.',
      { alternatives: commitResult.alternatives || [] }
    );
  }

  const responseBody = {
    booking: commitResult.booking,
    message: 'Booking created successfully and entered into verification queue.'
  };

  // Store in Idempotency cache with 24h TTL (DEC-010)
  if (idempotencyKey) {
    db.idempotencyKeys.push({
      id: `idemp-${Date.now()}`,
      key: idempotencyKey,
      responseStatus: 201,
      responseBody,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    });
  }

  return res.status(201).json(responseBody);
});

// GET /api/v1/bookings/:id
apiV1Router.get('/bookings/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const booking = db.bookings.find(b => b.id === id || b.reference === id);

  if (!booking) {
    return sendStandardError(res, 404, 'BOOKING_NOT_FOUND', 'The requested booking could not be found.');
  }

  const history = db.bookingStatusHistory.filter(h => h.bookingId === booking.id);
  res.json({ booking, history });
});

// POST /api/v1/bookings/lookup (Guest lookup via Reference + Phone BR-C-021, DEC-025, AUD-04)
apiV1Router.post('/bookings/lookup', (req: Request, res: Response) => {
  const { reference, phone } = req.body;

  if (!reference || !phone) {
    return sendStandardError(res, 400, 'VALIDATION_ERROR', 'Reference number and phone number are required for guest booking lookup.');
  }

  const normalizedInputPhone = normalizePhoneNumber(phone);
  const booking = db.bookings.find(b => 
    b.reference.toUpperCase() === reference.trim().toUpperCase() && 
    (normalizePhoneNumber(b.guestPhone) === normalizedInputPhone || b.guestPhone.includes(phone.trim()))
  );

  if (!booking) {
    return sendStandardError(res, 404, 'BOOKING_NOT_FOUND', 'No matching booking found for the provided reference number and phone.');
  }

  const history = db.bookingStatusHistory.filter(h => h.bookingId === booking.id);
  res.json({ booking, history });
});

// POST /api/v1/bookings/:id/reschedule (Max 2x self-service BR-C-020, ≥24h check BR-C-007, or admin override)
apiV1Router.post('/bookings/:id/reschedule', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { newDate, newTime, reason, isAdminOverride } = req.body;

  if (!newDate || !newTime) {
    return sendStandardError(res, 400, 'VALIDATION_ERROR', 'newDate and newTime are required.');
  }

  const booking = db.bookings.find(b => b.id === id || b.reference === id);
  if (!booking) {
    return sendStandardError(res, 404, 'BOOKING_NOT_FOUND', 'Booking not found.');
  }

  // Self-service policy checks if not an admin override
  if (!isAdminOverride) {
    // 1. Reschedule count check (max 2 per BR-C-020, BR-016, DEC-004)
    if (booking.rescheduleCount >= db.policies.maxReschedules) {
      return sendStandardError(
        res, 
        400, 
        'RESCHEDULE_LIMIT_EXCEEDED', 
        `Maximum self-service reschedule limit (${db.policies.maxReschedules}) reached. Please contact salon front desk for assistance.`
      );
    }

    // 2. Cancellation / Reschedule policy window check (≥24 hours per BR-C-007, BR-005, DEC-003)
    const hoursRemaining = getHoursUntilAppointment(booking.bookingDate, booking.startTime);
    if (hoursRemaining < db.policies.cancellationWindowHours) {
      return sendStandardError(
        res, 
        400, 
        'RESCHEDULE_NOT_ALLOWED', 
        `Self-service changes are only permitted at least 24 hours prior to appointment time (Currently ${hoursRemaining.toFixed(1)}h remaining).`
      );
    }
  } else {
    // Admin override requires mandatory logged reason (BR-C-008, AUD-08)
    if (!reason || !reason.trim()) {
      return sendStandardError(res, 400, 'VALIDATION_ERROR', 'Mandatory logged reason is required for administrative policy overrides.');
    }
  }

  // Update booking
  const oldDate = booking.bookingDate;
  const oldTime = booking.startTime;
  booking.bookingDate = newDate;
  booking.startTime = newTime;
  booking.rescheduleCount += 1;
  booking.updatedAt = new Date().toISOString();

  // Log status history transition
  db.bookingStatusHistory.unshift({
    id: `bsh-${booking.id}-${Date.now()}`,
    bookingId: booking.id,
    fromStatus: booking.status,
    toStatus: booking.status,
    actor: isAdminOverride ? 'Admin (Override)' : `Customer: ${booking.guestName}`,
    reason: reason || `Rescheduled from ${oldDate} ${oldTime} to ${newDate} ${newTime}`,
    timestamp: new Date().toISOString()
  });

  // Audit log
  db.logAudit(
    isAdminOverride ? 'admin-desk' : 'customer-portal',
    isAdminOverride ? 'Admin' : booking.guestName,
    isAdminOverride ? 'Admin' : 'Customer',
    isAdminOverride ? 'ADMIN_RESCHEDULE_OVERRIDE' : 'CUSTOMER_RESCHEDULE',
    'Booking',
    booking.reference,
    reason || `Rescheduled to ${newDate} at ${newTime}`,
    `${oldDate} ${oldTime}`,
    `${newDate} ${newTime}`
  );

  res.json({
    success: true,
    booking,
    message: `Appointment successfully rescheduled to ${newDate} at ${newTime}.`
  });
});

// POST /api/v1/bookings/:id/cancel (≥24h check, or Admin override with reason BR-C-007, BR-C-008, AUD-08)
apiV1Router.post('/bookings/:id/cancel', (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason, isAdminOverride } = req.body;

  const booking = db.bookings.find(b => b.id === id || b.reference === id);
  if (!booking) {
    return sendStandardError(res, 404, 'BOOKING_NOT_FOUND', 'Booking not found.');
  }

  if (booking.status === 'CANCELLED') {
    return sendStandardError(res, 400, 'INVALID_STATE_TRANSITION', 'Booking is already cancelled.');
  }

  if (!isAdminOverride) {
    const hoursRemaining = getHoursUntilAppointment(booking.bookingDate, booking.startTime);
    if (hoursRemaining < db.policies.cancellationWindowHours) {
      return sendStandardError(
        res, 
        400, 
        'CANCELLATION_NOT_ALLOWED', 
        `Self-service cancellations are only permitted at least 24 hours prior to appointment time. Please call the salon front desk.`
      );
    }
  } else {
    if (!reason || !reason.trim()) {
      return sendStandardError(res, 400, 'VALIDATION_ERROR', 'Mandatory reason required for admin cancellation override.');
    }
  }

  const oldStatus = booking.status;
  booking.status = 'CANCELLED';
  booking.cancellationReason = reason || 'Cancelled within free 24-hour self-service window';
  booking.updatedAt = new Date().toISOString();

  db.bookingStatusHistory.unshift({
    id: `bsh-${booking.id}-${Date.now()}`,
    bookingId: booking.id,
    fromStatus: oldStatus,
    toStatus: 'CANCELLED',
    actor: isAdminOverride ? 'Admin (Override)' : `Customer: ${booking.guestName}`,
    reason: booking.cancellationReason,
    timestamp: new Date().toISOString()
  });

  db.logAudit(
    isAdminOverride ? 'admin-desk' : 'customer-portal',
    isAdminOverride ? 'Admin' : booking.guestName,
    isAdminOverride ? 'Admin' : 'Customer',
    isAdminOverride ? 'ADMIN_POLICY_OVERRIDE_CANCEL' : 'CUSTOMER_CANCELLATION',
    'Booking',
    booking.reference,
    booking.cancellationReason,
    oldStatus,
    'CANCELLED'
  );

  res.json({
    success: true,
    booking,
    message: 'Booking cancelled successfully.'
  });
});

// -------------------------------------------------------------
// 4. REVIEWS (BR-C-009, BR-C-010, BR-014)
// -------------------------------------------------------------
apiV1Router.post('/reviews', (req: Request, res: Response) => {
  const { bookingId, rating, comment } = req.body;

  if (!bookingId || !rating) {
    return sendStandardError(res, 400, 'VALIDATION_ERROR', 'bookingId and rating (1-5) are required.');
  }

  const booking = db.bookings.find(b => b.id === bookingId || b.reference === bookingId);
  if (!booking) {
    return sendStandardError(res, 404, 'BOOKING_NOT_FOUND', 'Booking not found.');
  }

  // Rule: Customer cannot review a non-completed booking (BR-C-010)
  if (booking.status !== 'COMPLETED') {
    return sendStandardError(res, 400, 'FORBIDDEN', 'Only completed appointments can receive a verified customer review.');
  }

  // Rule: A completed booking may receive exactly one review (BR-C-009, BR-014)
  const existingReview = db.reviews.find(r => r.bookingId === booking.id);
  if (existingReview) {
    return sendStandardError(res, 409, 'DUPLICATE_REVIEW', 'A review has already been submitted for this completed appointment.');
  }

  const newReview = {
    id: `rev-${Date.now()}`,
    bookingId: booking.id,
    customerId: booking.customerId,
    rating: Math.max(1, Math.min(5, parseInt(rating, 10))),
    comment: comment || '',
    isModerated: true,
    createdAt: new Date().toISOString()
  };

  db.reviews.unshift(newReview);

  res.status(201).json({
    success: true,
    review: newReview,
    message: 'Thank you! Your feedback has been recorded.'
  });
});

// -------------------------------------------------------------
// 5. AUTHENTICATION & SESSIONS (DEC-017, DEC-018, DEC-019)
// -------------------------------------------------------------
apiV1Router.post('/auth/login', rateLimitMiddleware, (req: Request, res: Response) => {
  const { email, password, role } = req.body;

  const user = db.users.find(u => u.email === email);
  if (!user) {
    // Provide demo login fallback
    const targetRole = role === 'OWNER' ? 'OWNER' : role === 'ADMIN' ? 'ADMIN' : 'CUSTOMER';
    const demoUser = db.users.find(u => u.role === targetRole) || db.users[0];
    const { token, session } = createSession(demoUser, targetRole === 'OWNER');
    res.cookie('mikyaj_session', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 7 * 86400000 });
    return res.json({ session, token });
  }

  const { token, session } = createSession(user, user.role === 'OWNER');
  res.cookie('mikyaj_session', token, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 7 * 86400000 });
  res.json({ session, token });
});

apiV1Router.post('/auth/logout', (req: Request, res: Response) => {
  const token = req.cookies?.mikyaj_session;
  revokeSession(token);
  res.clearCookie('mikyaj_session');
  res.json({ success: true, message: 'Logged out successfully.' });
});

apiV1Router.get('/auth/me', (req: Request, res: Response) => {
  const token = req.cookies?.mikyaj_session || req.headers.authorization?.replace('Bearer ', '');
  const session = validateSession(token);
  if (!session) {
    return sendStandardError(res, 401, 'AUTH_REQUIRED', 'No active session.');
  }
  res.json({ session });
});

// -------------------------------------------------------------
// 6. ADMIN OPERATIONS & LIFECYCLE MANAGEMENT
// -------------------------------------------------------------

// Admin Dashboard Summary
apiV1Router.get('/admin/dashboard', (req: Request, res: Response) => {
  const todayStr = '2025-06-12';
  const todayBookings = db.bookings.filter(b => b.bookingDate === todayStr);

  const statusCounts = {
    pending: db.bookings.filter(b => b.status === 'PENDING').length,
    accepted: db.bookings.filter(b => b.status === 'ACCEPTED').length,
    inProgress: db.bookings.filter(b => b.status === 'IN_PROGRESS').length,
    completed: db.bookings.filter(b => b.status === 'COMPLETED').length,
    cancelled: db.bookings.filter(b => b.status === 'CANCELLED').length
  };

  const pendingQueue = db.bookings
    .filter(b => b.status === 'PENDING')
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()); // Oldest first (FR-A-DASH-02)

  const todayRevenue = todayBookings
    .filter(b => b.status === 'COMPLETED' || b.status === 'ACCEPTED')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const deadLetterCount = db.notificationOutbox.filter(n => n.status === 'DEAD_LETTER').length;

  res.json({
    statusCounts,
    pendingQueue,
    todayBookings,
    todayRevenue,
    deadLetterCount,
    staff: db.staff,
    auditLogs: db.auditLogs.slice(0, 10)
  });
});

// GET /api/v1/admin/bookings
apiV1Router.get('/admin/bookings', (req: Request, res: Response) => {
  const { status, staffId, date, search } = req.query;

  let list = [...db.bookings];
  if (status && status !== 'ALL') {
    list = list.filter(b => b.status === status);
  }
  if (staffId && staffId !== 'ALL') {
    list = list.filter(b => b.stylistId === staffId);
  }
  if (date) {
    list = list.filter(b => b.bookingDate === date);
  }
  if (search) {
    const q = (search as string).toLowerCase();
    list = list.filter(b => 
      b.reference.toLowerCase().includes(q) ||
      b.guestName.toLowerCase().includes(q) ||
      b.guestPhone.includes(q) ||
      b.serviceTitle.toLowerCase().includes(q)
    );
  }

  res.json({ bookings: list, total: list.length });
});

// POST /api/v1/admin/bookings/:id/:action (accept | reject | complete | noshow)
apiV1Router.post('/admin/bookings/:id/:action', (req: Request, res: Response) => {
  const { id, action } = req.params;
  const { reason, actorName } = req.body;

  const booking = db.bookings.find(b => b.id === id || b.reference === id);
  if (!booking) {
    return sendStandardError(res, 404, 'BOOKING_NOT_FOUND', 'Booking not found.');
  }

  const oldStatus = booking.status;
  let newStatus: BookingStatus = booking.status;

  if (action === 'accept') newStatus = 'ACCEPTED';
  else if (action === 'reject') newStatus = 'REJECTED';
  else if (action === 'complete') newStatus = 'COMPLETED';
  else if (action === 'noshow') newStatus = 'NO_SHOW';
  else if (action === 'start') newStatus = 'IN_PROGRESS';
  else {
    return sendStandardError(res, 400, 'INVALID_STATE_TRANSITION', `Unknown lifecycle action: ${action}`);
  }

  booking.status = newStatus;
  booking.updatedAt = new Date().toISOString();

  // Status History
  db.bookingStatusHistory.unshift({
    id: `bsh-${booking.id}-${Date.now()}`,
    bookingId: booking.id,
    fromStatus: oldStatus,
    toStatus: newStatus,
    actor: actorName || 'Admin Desk',
    reason: reason || `Status changed to ${newStatus}`,
    timestamp: new Date().toISOString()
  });

  // Audit Log
  db.logAudit(
    'admin-user',
    actorName || 'Admin Desk',
    'Admin',
    `ADMIN_${action.toUpperCase()}`,
    'Booking',
    booking.reference,
    reason || `Booking status updated to ${newStatus}`,
    oldStatus,
    newStatus
  );

  res.json({
    success: true,
    booking,
    message: `Booking ${booking.reference} transitioned to ${newStatus}.`
  });
});

// POST /api/v1/admin/bookings/:id/reassign
apiV1Router.post('/admin/bookings/:id/reassign', (req: Request, res: Response) => {
  const { id } = req.params;
  const { newStylistId, reason, actorName } = req.body;

  const booking = db.bookings.find(b => b.id === id || b.reference === id);
  const targetStaff = db.staff.find(s => s.id === newStylistId);

  if (!booking || !targetStaff) {
    return sendStandardError(res, 404, 'RESOURCE_NOT_FOUND', 'Booking or Stylist not found.');
  }

  const oldStylist = booking.stylistName;
  booking.stylistId = targetStaff.id;
  booking.stylistName = targetStaff.name;
  booking.updatedAt = new Date().toISOString();

  db.bookingStatusHistory.unshift({
    id: `bsh-${booking.id}-${Date.now()}`,
    bookingId: booking.id,
    fromStatus: booking.status,
    toStatus: booking.status,
    actor: actorName || 'Admin Desk',
    reason: `Reassigned from ${oldStylist} to ${targetStaff.name}. ${reason || ''}`,
    timestamp: new Date().toISOString()
  });

  db.logAudit(
    'admin-user',
    actorName || 'Admin Desk',
    'Admin',
    'STAFF_REASSIGNMENT',
    'Booking',
    booking.reference,
    reason || `Reassigned from ${oldStylist} to ${targetStaff.name}`,
    oldStylist,
    targetStaff.name
  );

  res.json({ success: true, booking });
});

// POST /api/v1/admin/bookings/walkin (Walk-in booking FR-A-BOOK-06, BR-C-019)
apiV1Router.post('/admin/bookings/walkin', async (req: Request, res: Response) => {
  const { serviceId, stylistId, customerName, customerPhone, customerEmail, date, time, specialRequests } = req.body;

  const result = await commitBooking({
    serviceId,
    date,
    startTime: time,
    stylistId,
    customerName,
    customerPhone: customerPhone || '+92 300 0000000',
    customerEmail: customerEmail || 'walkin@mikyaj.pk',
    specialRequests: specialRequests ? `[WALK-IN] ${specialRequests}` : '[WALK-IN]'
  });

  if (!result.success) {
    return sendStandardError(res, result.statusCode, result.errorCode || 'WALKIN_FAILED', result.message || 'Unable to book walk-in slot.');
  }

  // Walk-in is immediately ACCEPTED
  if (result.booking) {
    result.booking.status = 'ACCEPTED';
  }

  res.status(201).json({ success: true, booking: result.booking });
});

// POST /api/v1/admin/notifications/:id/resend (DEC-027, FR-A-BOOK-08)
apiV1Router.post('/admin/notifications/:id/resend', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { actorName } = req.body;

  const success = await notificationWorkers.manualResend(id, actorName || 'Admin Desk');
  if (!success) {
    return sendStandardError(res, 404, 'RESOURCE_NOT_FOUND', 'Notification outbox record not found.');
  }

  res.json({ success: true, message: 'Notification resend queued independently.' });
});

// GET /api/v1/admin/notifications/outbox
apiV1Router.get('/admin/notifications/outbox', (req: Request, res: Response) => {
  res.json({ outbox: db.notificationOutbox });
});

// GET /api/v1/admin/audit-logs
apiV1Router.get('/admin/audit-logs', (req: Request, res: Response) => {
  res.json({ auditLogs: db.auditLogs });
});

// -------------------------------------------------------------
// 7. CONCURRENCY HARD GATE TEST (DEC-032, §18.3, Step 4)
// -------------------------------------------------------------
apiV1Router.post('/test/concurrency-50', async (req: Request, res: Response) => {
  const { serviceId, date, slot } = req.body;
  const targetServiceId = serviceId || db.services[0].id;
  const targetDate = date || '2025-06-12';
  const targetSlot = slot || '03:30 PM';

  const testReport = await run50ConcurrencyTest(targetServiceId, targetDate, targetSlot);
  res.json(testReport);
});
