// Mikyaj Backend Database Store & Repository Layer
// Conforms to Mikyaj Engineering Specification Rev. 5 (Section 9) & SRS v2.1 (Section 8)

import { 
  User, 
  CustomerProfile, 
  Staff, 
  StaffQualification, 
  StaffSchedule, 
  StaffBreakLeave, 
  BranchHours, 
  Category, 
  Service, 
  Booking, 
  BookingItem, 
  BookingStatusHistory, 
  BookingReservation, 
  Review, 
  NotificationOutbox, 
  NotificationLog, 
  ProcessedWebhookEvent, 
  IdempotencyKey, 
  AuditLog, 
  SalonPolicyConfig,
  BookingStatus,
  NotificationChannel,
  OutboxStatus,
  RefundStatus
} from './types';
import { 
  SERVICES, 
  STYLISTS, 
  BRANCHES, 
  INITIAL_BOOKINGS, 
  INITIAL_CUSTOMERS, 
  INITIAL_AUDIT_LOGS, 
  INITIAL_NOTIFICATION_OUTBOX,
  SALON_POLICIES 
} from '../src/data/salonData';

export class MikyajDatabase {
  public users: User[] = [];
  public customerProfiles: CustomerProfile[] = [];
  public staff: Staff[] = [];
  public staffQualifications: StaffQualification[] = [];
  public staffSchedules: StaffSchedule[] = [];
  public staffBreaksLeave: StaffBreakLeave[] = [];
  public branchHours: BranchHours[] = [];
  public categories: Category[] = [];
  public services: Service[] = [];
  public bookings: Booking[] = [];
  public bookingItems: BookingItem[] = [];
  public bookingStatusHistory: BookingStatusHistory[] = [];
  public bookingReservations: BookingReservation[] = [];
  public reviews: Review[] = [];
  public notificationOutbox: NotificationOutbox[] = [];
  public notificationLogs: NotificationLog[] = [];
  public processedWebhookEvents: ProcessedWebhookEvent[] = [];
  public idempotencyKeys: IdempotencyKey[] = [];
  public auditLogs: AuditLog[] = [];
  public policies: SalonPolicyConfig = { ...SALON_POLICIES };

  // Mutex lock to simulate serializable transaction locking (DEC-032, ARCH-004)
  private transactionMutex = Promise.resolve();

  constructor() {
    this.seedInitialData();
  }

  public reset() {
    this.seedInitialData();
  }

  public seedInitialData() {
    // 1. Users (Owner & Standard Admin)
    this.users = [
      {
        id: 'usr-owner-001',
        email: 'hayat.rahman@mikyaj.pk',
        phone: '+923001234567',
        passwordHash: '$2b$10$wN1r10s1/gqgC9m5.kF2f.K1Z3sZ10k5v1a4b9c1d2e3f4g5h6i7j', // bcrypt placeholder
        role: 'OWNER',
        permissions: {
          viewFinancials: true,
          overridePolicies: true,
          manageStaff: true,
          manageServices: true,
          manageSettings: true,
          resendNotifications: true
        },
        createdAt: '2025-01-01T00:00:00.000Z',
        updatedAt: '2025-01-01T00:00:00.000Z'
      },
      {
        id: 'usr-admin-002',
        email: 'amina.desk@mikyaj.pk',
        phone: '+923007654321',
        passwordHash: '$2b$10$wN1r10s1/gqgC9m5.kF2f.K1Z3sZ10k5v1a4b9c1d2e3f4g5h6i7j',
        role: 'ADMIN',
        permissions: {
          viewFinancials: false, // Owner-flagged only (FR-A-CUST-01, DEC-003, §7)
          overridePolicies: true,
          manageStaff: true,
          manageServices: true,
          manageSettings: false,
          resendNotifications: true
        },
        createdAt: '2025-01-02T00:00:00.000Z',
        updatedAt: '2025-01-02T00:00:00.000Z'
      },
      {
        id: 'usr-cust-003',
        email: 'hayat.khan@gmail.com',
        phone: '+923008456789',
        passwordHash: '$2b$10$wN1r10s1/gqgC9m5.kF2f.K1Z3sZ10k5v1a4b9c1d2e3f4g5h6i7j',
        role: 'CUSTOMER',
        permissions: {
          viewFinancials: false,
          overridePolicies: false,
          manageStaff: false,
          manageServices: false,
          manageSettings: false,
          resendNotifications: false
        },
        createdAt: '2025-02-01T10:00:00.000Z',
        updatedAt: '2025-02-01T10:00:00.000Z'
      }
    ];

    // 2. Categories
    this.categories = [
      { id: 'cat-hair', name: 'Hair & Styling', slug: 'hair-styling', orderIndex: 1, description: 'Haircuts, styling, blow dry, keratin treatments', createdAt: '2025-01-01T00:00:00.000Z' },
      { id: 'cat-skin', name: 'Skin & Facial', slug: 'skin-facial', orderIndex: 2, description: 'Hydra facials, organic glow, whitening cleansers', createdAt: '2025-01-01T00:00:00.000Z' },
      { id: 'cat-bridal', name: 'Bridal & Party Makeup', slug: 'bridal-makeup', orderIndex: 3, description: 'HD signature bridal, barat, mehndi, walima makeover', createdAt: '2025-01-01T00:00:00.000Z' },
      { id: 'cat-nails', name: 'Nails & Spa', slug: 'nails-spa', orderIndex: 4, description: 'Luxury manicure, pedicure, paraffin & gel extensions', createdAt: '2025-01-01T00:00:00.000Z' },
      { id: 'cat-threading', name: 'Threading & Waxing', slug: 'threading-waxing', orderIndex: 5, description: 'Full face threading, fruit wax, rican wax', createdAt: '2025-01-01T00:00:00.000Z' }
    ];

    // 3. Services (PKR integer pricing, active soft delete BR-C-018)
    this.services = SERVICES.map((s, idx) => ({
      id: s.id,
      categoryId: (s.category as string === 'Haircut & Styling' || s.category as string === 'Hair') ? 'cat-hair' : s.category as string === 'Facial' ? 'cat-skin' : s.category as string === 'Bridal' ? 'cat-bridal' : s.category as string === 'Nail Art' ? 'cat-nails' : 'cat-threading',
      category: s.category,
      title: s.title,
      slug: s.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      duration: s.duration,
      price: s.price, // in PKR (DEC-023)
      description: s.description,
      imageUrl: s.imageUrl,
      active: s.active !== false,
      popular: s.popular || false,
      rating: s.rating || 5.0,
      reviewsCount: s.reviewsCount || 10,
      included: s.included || ['Professional consultation', 'Premium imported beauty cosmetics', 'Finishing touch'],
      createdAt: new Date(Date.now() - (idx * 86400000)).toISOString(),
      updatedAt: new Date().toISOString()
    }));

    // 4. Staff records with deterministic created_at tie-breaker (DEC-005, AUD-02)
    this.staff = STYLISTS.map((sty, idx) => ({
      id: sty.id,
      name: sty.name,
      role: sty.role,
      experience: sty.experience,
      experienceYears: parseInt(sty.experience) || 4,
      rating: sty.rating,
      reviewsCount: sty.reviewsCount,
      avatarUrl: sty.avatarUrl,
      bookable: sty.availableToday !== false,
      createdAt: new Date(Date.now() - (100 - idx) * 86400000).toISOString(), // Deterministic created_at
      updatedAt: new Date().toISOString()
    }));

    // Staff qualifications mapping
    this.staffQualifications = [];
    this.staff.forEach(st => {
      this.services.forEach(srv => {
        this.staffQualifications.push({
          id: `sq-${st.id}-${srv.id}`,
          staffId: st.id,
          serviceId: srv.id,
          createdAt: '2025-01-01T00:00:00.000Z'
        });
      });
    });

    // 5. Staff Schedules & Branch Hours (Asia/Karachi timezone DEC-022)
    this.branchHours = [0, 1, 2, 3, 4, 5, 6].map(day => ({
      id: `bh-gulberg-${day}`,
      branchId: 'gulberg',
      dayOfWeek: day,
      openTime: '10:00',
      closeTime: '20:00',
      isClosed: false,
      timezone: 'Asia/Karachi'
    }));

    this.staffSchedules = [];
    this.staff.forEach(st => {
      [0, 1, 2, 3, 4, 5, 6].forEach(day => {
        this.staffSchedules.push({
          id: `ss-${st.id}-${day}`,
          staffId: st.id,
          dayOfWeek: day,
          startTime: '10:00',
          endTime: '20:00',
          isWorking: day !== 1 // Monday off
        });
      });
    });

    // 6. Customer Profiles
    this.customerProfiles = INITIAL_CUSTOMERS.map(c => ({
      id: c.id,
      userId: c.id === 'cust-01' ? 'usr-cust-003' : null,
      name: c.name,
      email: c.email,
      phone: c.phone,
      totalBookings: c.totalBookings,
      totalSpendPKR: c.totalSpendPKR,
      notes: c.notes,
      createdAt: '2025-02-01T00:00:00.000Z',
      updatedAt: '2025-02-01T00:00:00.000Z'
    }));

    // 7. Bookings & Status History
    this.bookings = INITIAL_BOOKINGS.map(b => ({
      id: b.id,
      reference: b.reference || b.id,
      customerId: 'cust-01',
      guestName: b.customerName,
      guestEmail: b.customerEmail,
      guestPhone: b.customerPhone,
      serviceId: b.serviceId,
      serviceTitle: b.serviceTitle,
      serviceCategory: b.serviceCategory,
      stylistId: b.stylistId,
      stylistName: b.stylistName,
      branchId: b.branchId || 'gulberg',
      branchName: b.branchName || 'Gulberg Flagship',
      branchAddress: b.branchAddress || 'Main Boulevard, Gulberg III, Lahore',
      bookingDate: b.date,
      startTime: b.time,
      endTime: '11:30 AM',
      duration: b.duration,
      totalPrice: b.totalAmount || b.servicePrice,
      currency: 'PKR',
      tax: b.tax || 0,
      specialRequests: b.specialRequests,
      status: b.status as BookingStatus,
      rescheduleCount: b.rescheduleCount || 0,
      refundStatus: (b.refundStatus as RefundStatus) || 'none',
      cancellationReason: b.cancellationReason,
      createdAt: b.createdAt,
      updatedAt: b.updatedAt || b.createdAt,
      imageUrl: b.imageUrl,
      emailStatus: (b.emailStatus === 'RETRY' ? 'FAILED' : b.emailStatus) as any,
      whatsAppStatus: (b.whatsAppStatus === 'RETRY' ? 'FAILED' : b.whatsAppStatus) as any
    }));

    // Seed status history for each booking
    this.bookingStatusHistory = [];
    this.bookings.forEach(b => {
      this.bookingStatusHistory.push({
        id: `bsh-${b.id}-1`,
        bookingId: b.id,
        fromStatus: 'DRAFT',
        toStatus: 'PENDING',
        actor: `Customer: ${b.guestName}`,
        reason: 'Online booking form submission',
        timestamp: b.createdAt
      });
      if (b.status === 'ACCEPTED' || b.status === 'COMPLETED' || b.status === 'IN_PROGRESS') {
        this.bookingStatusHistory.push({
          id: `bsh-${b.id}-2`,
          bookingId: b.id,
          fromStatus: 'PENDING',
          toStatus: 'ACCEPTED',
          actor: 'Admin: Hayat Rahman',
          reason: 'Slot verified and confirmed',
          timestamp: new Date(new Date(b.createdAt).getTime() + 120000).toISOString()
        });
      }
      if (b.status === 'COMPLETED') {
        this.bookingStatusHistory.push({
          id: `bsh-${b.id}-3`,
          bookingId: b.id,
          fromStatus: 'ACCEPTED',
          toStatus: 'COMPLETED',
          actor: 'Admin: Amina Front Desk',
          reason: 'Service completed successfully',
          timestamp: new Date(new Date(b.createdAt).getTime() + 3600000).toISOString()
        });
      }
      if (b.status === 'CANCELLED') {
        this.bookingStatusHistory.push({
          id: `bsh-${b.id}-4`,
          bookingId: b.id,
          fromStatus: 'ACCEPTED',
          toStatus: 'CANCELLED',
          actor: `Customer: ${b.guestName}`,
          reason: b.cancellationReason || 'Cancelled within 24-hour self-service window',
          timestamp: new Date(new Date(b.createdAt).getTime() + 300000).toISOString()
        });
      }
    });

    // 8. Reviews
    this.reviews = [
      {
        id: 'rev-001',
        bookingId: 'bkg-003',
        customerId: 'cust-01',
        rating: 5,
        comment: 'Outstanding Hydra Facial! My skin has never felt softer. Sana was meticulous and polite.',
        isModerated: true,
        createdAt: '2025-06-02T16:45:00.000Z'
      }
    ];

    // 9. Notification Outbox (with sample in each worker state DEC-011, §14.3)
    this.notificationOutbox = INITIAL_NOTIFICATION_OUTBOX.map(n => ({
      id: n.id,
      bookingEventId: `evt-${n.bookingId}`,
      bookingId: n.bookingId,
      bookingRef: n.bookingRef,
      channel: n.channel,
      event: n.event,
      templateName: n.templateName,
      recipient: n.recipient,
      payload: { bookingRef: n.bookingRef },
      status: (n.status === 'RETRY' ? 'FAILED' : n.status) as OutboxStatus,
      attemptCount: n.attemptCount,
      maxAttempts: 5,
      nextAttemptAt: n.nextAttemptAt || null,
      lockedBy: null,
      lockedAt: null,
      lastError: n.lastError || null,
      createdAt: n.createdAt,
      sentAt: n.sentAt || null
    }));

    // 10. Audit logs (Append-only DEC-020)
    this.auditLogs = INITIAL_AUDIT_LOGS.map(a => ({
      id: a.id,
      actorId: a.actorId,
      actorName: a.actorName,
      actorRole: a.actorRole as 'Owner' | 'Admin' | 'Customer',
      action: a.action,
      entityType: a.entityType as any,
      entityId: a.entityId,
      reason: a.reason,
      beforeState: a.beforeState,
      afterState: a.afterState,
      timestamp: a.timestamp
    }));
  }

  // Atomic Transaction Executor
  public async executeTransaction<T>(work: () => Promise<T>): Promise<T> {
    const prev = this.transactionMutex;
    let release: () => void;
    this.transactionMutex = new Promise<void>(resolve => {
      release = resolve;
    });

    await prev;
    try {
      return await work();
    } finally {
      release!();
    }
  }

  // Append-only audit logger (DEC-020, AUD-08)
  public logAudit(
    actorId: string,
    actorName: string,
    actorRole: 'Owner' | 'Admin' | 'Customer',
    action: string,
    entityType: 'Booking' | 'Service' | 'Staff' | 'Setting' | 'Notification' | 'Customer',
    entityId: string,
    reason?: string,
    beforeState?: string,
    afterState?: string
  ): AuditLog {
    const logItem: AuditLog = {
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      actorId,
      actorName,
      actorRole,
      action,
      entityType,
      entityId,
      reason,
      beforeState,
      afterState,
      timestamp: new Date().toISOString()
    };
    this.auditLogs.unshift(logItem);
    return logItem;
  }
}

// Global Singleton DB instance
export const db = new MikyajDatabase();
