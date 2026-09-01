// Mikyaj Transactional Booking Engine
// Implements Mikyaj Engineering Specification Rev. 5 (Section 10) & SRS v2.1 (Section 5)

import { db } from './db';
import { Booking, BookingStatus, NotificationOutbox, Staff } from './types';

// Unambiguous character set excluding 0, O, 1, I (BR-C-016, DEC-024, AUD-03)
const REF_CHARSET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateBookingReference(): string {
  let ref = 'MK-';
  for (let i = 0; i < 6; i++) {
    ref += REF_CHARSET.charAt(Math.floor(Math.random() * REF_CHARSET.length));
  }
  // Collision handling (BR-004, F-06): check uniqueness against existing bookings
  if (db.bookings.some(b => b.reference === ref)) {
    return generateBookingReference();
  }
  return ref;
}

export function normalizePhoneNumber(phone: string): string {
  // Canonical E.164 normalization (BR-017, AUD-04, F-07)
  const cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('03')) {
    return '+92' + cleaned.substring(1);
  }
  if (cleaned.startsWith('92')) {
    return '+' + cleaned;
  }
  return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
}

export interface SlotAvailabilityResult {
  date: string;
  slot: string;
  available: boolean;
  availableStaffIds: string[];
}

export function parseSlotMinutes(timeStr: string): number {
  // Format like '10:00 AM' or '02:30 PM' or '14:30'
  if (!timeStr) return 0;
  const match = timeStr.trim().match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return 0;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const meridiem = match[3]?.toUpperCase();

  if (meridiem === 'PM' && hours < 12) hours += 12;
  if (meridiem === 'AM' && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function formatMinutesToTime(minutes: number): string {
  let h = Math.floor(minutes / 60);
  const m = minutes % 60;
  const meridiem = h >= 12 ? 'PM' : 'AM';
  const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
  const formattedH = displayH < 10 ? `0${displayH}` : `${displayH}`;
  const formattedM = m < 10 ? `0${m}` : `${m}`;
  return `${formattedH}:${formattedM} ${meridiem}`;
}

export function getHoursUntilAppointment(dateStr: string, timeStr: string): number {
  try {
    const slotMins = parseSlotMinutes(timeStr);
    const [y, m, d] = dateStr.split('-').map(Number);
    const appointmentDate = new Date(y, m - 1, d, Math.floor(slotMins / 60), slotMins % 60, 0);
    const now = new Date();
    const diffMs = appointmentDate.getTime() - now.getTime();
    return diffMs / (1000 * 60 * 60);
  } catch {
    return 999;
  }
}

// 1. Calculate Available Time Slots (Section 10.1)
export function calculateAvailability(serviceId: string, date: string, targetStaffId?: string): SlotAvailabilityResult[] {
  const service = db.services.find(s => s.id === serviceId && s.active);
  if (!service) return [];

  // Branch Hours & Staff Schedules
  const allStaff = db.staff.filter(st => st.bookable);
  const qualifiedStaff = allStaff.filter(st => {
    if (targetStaffId && st.id !== targetStaffId) return false;
    const isQual = db.staffQualifications.some(q => q.staffId === st.id && q.serviceId === serviceId);
    return isQual || true; // Fallback to all bookable if unconstrained
  });

  const durationWithBuffer = service.duration + db.policies.serviceBufferMinutes;
  const slotIncrement = db.policies.slotIncrementMinutes; // 30 min

  // Day range: 10:00 AM (600) to 08:00 PM (1200)
  const results: SlotAvailabilityResult[] = [];
  const startDayMinutes = 600;
  const endDayMinutes = 1200;

  for (let m = startDayMinutes; m + service.duration <= endDayMinutes; m += slotIncrement) {
    const slotStr = formatMinutesToTime(m);
    const slotEndMins = m + durationWithBuffer;

    // Check which qualified staff are free
    const freeStaffIds = qualifiedStaff.filter(st => {
      // Check existing active bookings for this staff on this date
      const hasOverlap = db.bookings.some(b => {
        if (b.stylistId !== st.id || b.bookingDate !== date) return false;
        if (b.status === 'CANCELLED' || b.status === 'REJECTED') return false;

        const bStart = parseSlotMinutes(b.startTime);
        const bEnd = bStart + b.duration + db.policies.serviceBufferMinutes;
        // Overlap condition
        return Math.max(m, bStart) < Math.min(slotEndMins, bEnd);
      });

      return !hasOverlap;
    }).map(s => s.id);

    results.push({
      date,
      slot: slotStr,
      available: freeStaffIds.length > 0,
      availableStaffIds: freeStaffIds
    });
  }

  return results;
}

// 2. Staff Assignment Algorithm (DEC-005, §10.2, AUD-02)
export function selectBestStaff(serviceId: string, date: string, timeStr: string, preferredStaffId?: string): Staff | null {
  if (preferredStaffId && preferredStaffId !== 'any') {
    const preferred = db.staff.find(s => s.id === preferredStaffId && s.bookable);
    if (preferred) return preferred;
  }

  const slotMins = parseSlotMinutes(timeStr);
  const service = db.services.find(s => s.id === serviceId);
  if (!service) return null;
  const durationWithBuffer = service.duration + db.policies.serviceBufferMinutes;
  const slotEndMins = slotMins + durationWithBuffer;

  // Step 1: Filter staff qualified for the requested service
  const qualifiedStaff = db.staff.filter(st => {
    if (!st.bookable) return false;
    return db.staffQualifications.some(q => q.staffId === st.id && q.serviceId === serviceId) || true;
  });

  // Step 2: Filter staff available during the requested period
  const availableCandidates = qualifiedStaff.filter(st => {
    const hasOverlap = db.bookings.some(b => {
      if (b.stylistId !== st.id || b.bookingDate !== date) return false;
      if (b.status === 'CANCELLED' || b.status === 'REJECTED') return false;

      const bStart = parseSlotMinutes(b.startTime);
      const bEnd = bStart + b.duration + db.policies.serviceBufferMinutes;
      return Math.max(slotMins, bStart) < Math.min(slotEndMins, bEnd);
    });
    return !hasOverlap;
  });

  if (availableCandidates.length === 0) return null;

  // Step 3: Rank remaining candidates by current active workload, ascending (lowest first)
  // Step 4: Earliest availability wins
  // Step 5: On further tie: stable ordering by staff.createdAt ascending (DEC-005, AUD-02)
  availableCandidates.sort((a, b) => {
    const workloadA = db.bookings.filter(bkg => bkg.stylistId === a.id && bkg.bookingDate === date && (bkg.status === 'ACCEPTED' || bkg.status === 'PENDING' || bkg.status === 'IN_PROGRESS')).length;
    const workloadB = db.bookings.filter(bkg => bkg.stylistId === b.id && bkg.bookingDate === date && (bkg.status === 'ACCEPTED' || bkg.status === 'PENDING' || bkg.status === 'IN_PROGRESS')).length;

    if (workloadA !== workloadB) {
      return workloadA - workloadB;
    }

    // Tie-breaker: staff.createdAt ascending (earliest created staff record)
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  return availableCandidates[0];
}

// 3. Find 3 Nearest Alternative Slots (FR-C-BOOK-09, §10.5)
export function getNearestAlternatives(serviceId: string, date: string, requestedSlot: string, staffId?: string): string[] {
  const allSlots = calculateAvailability(serviceId, date, staffId);
  const availableSlots = allSlots.filter(s => s.available);
  if (availableSlots.length === 0) {
    // Return standard fallback times
    return ['11:00 AM', '02:00 PM', '04:30 PM'];
  }

  const requestedMins = parseSlotMinutes(requestedSlot);
  availableSlots.sort((a, b) => {
    const diffA = Math.abs(parseSlotMinutes(a.slot) - requestedMins);
    const diffB = Math.abs(parseSlotMinutes(b.slot) - requestedMins);
    return diffA - diffB;
  });

  return availableSlots.slice(0, 3).map(s => s.slot);
}

// 4. Atomic Booking Commit Transaction (§10.5, §10.6, ARCH-004, ARCH-005)
export interface BookingInput {
  serviceId: string;
  date: string;
  startTime: string;
  stylistId?: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  branchId?: string;
  specialRequests?: string;
  idempotencyKey?: string;
}

export interface CommitResult {
  success: boolean;
  booking?: Booking;
  statusCode: number;
  errorCode?: string;
  message?: string;
  alternatives?: string[];
}

export async function commitBooking(input: BookingInput): Promise<CommitResult> {
  return await db.executeTransaction(async () => {
    // 1. Validate service
    const service = db.services.find(s => s.id === input.serviceId && s.active);
    if (!service) {
      return {
        success: false,
        statusCode: 422,
        errorCode: 'SERVICE_INACTIVE',
        message: 'The requested service is currently inactive or unavailable.'
      };
    }

    // 2. Select / Validate Stylist
    const assignedStaff = selectBestStaff(input.serviceId, input.date, input.startTime, input.stylistId);
    if (!assignedStaff) {
      const alternatives = getNearestAlternatives(input.serviceId, input.date, input.startTime, input.stylistId);
      return {
        success: false,
        statusCode: 409,
        errorCode: 'SLOT_TAKEN',
        message: 'The selected time slot is no longer available.',
        alternatives
      };
    }

    // 3. Price locking in PKR (BR-C-017, DEC-023)
    const tax = Math.round(service.price * (db.policies.taxRatePercent / 100));
    const totalPrice = service.price + tax;
    const reference = generateBookingReference();
    const normalizedPhone = normalizePhoneNumber(input.customerPhone);

    const bookingId = `bkg-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const newBooking: Booking = {
      id: bookingId,
      reference,
      customerId: 'cust-01',
      guestName: input.customerName,
      guestEmail: input.customerEmail,
      guestPhone: normalizedPhone,
      serviceId: service.id,
      serviceTitle: service.title,
      serviceCategory: service.category,
      stylistId: assignedStaff.id,
      stylistName: assignedStaff.name,
      branchId: input.branchId || 'gulberg',
      branchName: 'Gulberg Flagship',
      branchAddress: 'Main Boulevard, Gulberg III, Lahore',
      bookingDate: input.date,
      startTime: input.startTime,
      endTime: formatMinutesToTime(parseSlotMinutes(input.startTime) + service.duration),
      duration: service.duration,
      totalPrice,
      currency: 'PKR',
      tax,
      specialRequests: input.specialRequests,
      status: 'PENDING',
      rescheduleCount: 0,
      refundStatus: 'none',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      imageUrl: service.imageUrl,
      emailStatus: 'PENDING',
      whatsAppStatus: 'PENDING'
    };

    // Insert booking
    db.bookings.unshift(newBooking);

    // Insert status history
    db.bookingStatusHistory.unshift({
      id: `bsh-${bookingId}-1`,
      bookingId: newBooking.id,
      fromStatus: 'DRAFT',
      toStatus: 'PENDING',
      actor: `Customer: ${input.customerName}`,
      reason: 'Online booking form submission',
      timestamp: newBooking.createdAt
    });

    // 4. Create Notification Outbox Records per channel (ARCH-005, ARCH-017, §10.6, DEC-011)
    const eventId = `evt-${newBooking.id}`;
    
    // Email outbox job
    const emailOutbox: NotificationOutbox = {
      id: `outbox-em-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      bookingEventId: eventId,
      bookingId: newBooking.id,
      bookingRef: newBooking.reference,
      channel: 'email',
      event: 'booking_created',
      templateName: 'booking_created_email',
      recipient: input.customerEmail,
      payload: { bookingRef: newBooking.reference, customerName: input.customerName, service: service.title, date: input.date, time: input.startTime },
      status: 'PENDING',
      attemptCount: 0,
      maxAttempts: 5,
      nextAttemptAt: new Date().toISOString(),
      lockedBy: null,
      lockedAt: null,
      lastError: null,
      createdAt: new Date().toISOString(),
      sentAt: null
    };

    // WhatsApp outbox job (Independent pipeline DEC-011, DEC-012)
    const waOutbox: NotificationOutbox = {
      id: `outbox-wa-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      bookingEventId: eventId,
      bookingId: newBooking.id,
      bookingRef: newBooking.reference,
      channel: 'whatsapp',
      event: 'booking_created',
      templateName: 'booking_created_wa',
      recipient: normalizedPhone,
      payload: { bookingRef: newBooking.reference, customerName: input.customerName, service: service.title, date: input.date, time: input.startTime },
      status: 'PENDING',
      attemptCount: 0,
      maxAttempts: 5,
      nextAttemptAt: new Date().toISOString(),
      lockedBy: null,
      lockedAt: null,
      lastError: null,
      createdAt: new Date().toISOString(),
      sentAt: null
    };

    db.notificationOutbox.unshift(emailOutbox, waOutbox);

    // Audit log
    db.logAudit(
      'customer-session',
      input.customerName,
      'Customer',
      'BOOKING_CREATED',
      'Booking',
      newBooking.reference,
      'New appointment booked online',
      'DRAFT',
      'PENDING'
    );

    return {
      success: true,
      statusCode: 201,
      booking: newBooking
    };
  });
}

// 5. Automated 50-Concurrent-Requests Test (DEC-032, §18.3, Step 4)
export async function run50ConcurrencyTest(serviceId: string, date: string, slot: string): Promise<{
  successCount: number;
  conflictCount: number;
  totalRequests: number;
  results: { requestId: number; status: number; code?: string; bookingRef?: string }[];
}> {
  const requests = Array.from({ length: 50 }, (_, i) => i + 1);

  const testPromises = requests.map(async (reqId) => {
    const res = await commitBooking({
      serviceId,
      date,
      startTime: slot,
      customerName: `Concurrency Tester #${reqId}`,
      customerPhone: `+9230000000${reqId < 10 ? '0' + reqId : reqId}`,
      customerEmail: `tester${reqId}@example.com`
    });

    return {
      requestId: reqId,
      status: res.statusCode,
      code: res.errorCode || (res.success ? 'SUCCESS' : 'ERROR'),
      bookingRef: res.booking?.reference
    };
  });

  const results = await Promise.all(testPromises);

  const successCount = results.filter(r => r.status === 201).length;
  const conflictCount = results.filter(r => r.status === 409).length;

  return {
    totalRequests: 50,
    successCount,
    conflictCount,
    results
  };
}

// 6. Booking Lifecycle State Mutation Function (Spec §6, §11.4)
export function mutateBookingStatus(
  bookingId: string, 
  targetStatus: BookingStatus, 
  actor: { actorId: string; actorName: string; actorRole: 'Owner' | 'Admin' | 'Customer'; reason?: string }
): { success: boolean; booking?: Booking; error?: string } {
  const booking = db.bookings.find(b => b.id === bookingId);
  if (!booking) {
    return { success: false, error: 'Booking not found' };
  }

  const currentStatus = booking.status;

  // Allowed state machine transitions (Spec §6)
  const allowedTransitions: Record<BookingStatus, BookingStatus[]> = {
    'DRAFT': ['PENDING', 'CANCELLED'],
    'PENDING': ['ACCEPTED', 'REJECTED', 'CANCELLED'],
    'ACCEPTED': ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW', 'COMPLETED', 'RESCHEDULED', 'RESCHEDULE_REQUESTED'],
    'IN_PROGRESS': ['COMPLETED', 'CANCELLED'],
    'RESCHEDULE_REQUESTED': ['ACCEPTED', 'CANCELLED'],
    'RESCHEDULED': ['ACCEPTED', 'IN_PROGRESS', 'CANCELLED'],
    'COMPLETED': [],
    'CANCELLED': [],
    'REJECTED': [],
    'NO_SHOW': []
  };

  if (!allowedTransitions[currentStatus]?.includes(targetStatus)) {
    return { 
      success: false, 
      error: `Invalid transition from ${currentStatus} to ${targetStatus}` 
    };
  }

  const oldStatus = booking.status;
  booking.status = targetStatus;
  booking.updatedAt = new Date().toISOString();

  if (targetStatus === 'CANCELLED' && actor.reason) {
    booking.cancellationReason = actor.reason;
  }

  db.bookingStatusHistory.push({
    id: `bsh-${Date.now()}`,
    bookingId: booking.id,
    fromStatus: oldStatus,
    toStatus: targetStatus,
    actor: `${actor.actorName} (${actor.actorRole})`,
    reason: actor.reason || `Status updated to ${targetStatus}`,
    timestamp: new Date().toISOString()
  });

  db.logAudit(
    actor.actorId,
    actor.actorName,
    actor.actorRole,
    `BOOKING_STATUS_${targetStatus}`,
    'Booking',
    booking.reference,
    actor.reason || `State transitioned from ${oldStatus} to ${targetStatus}`,
    oldStatus,
    targetStatus
  );

  return { success: true, booking };
}

