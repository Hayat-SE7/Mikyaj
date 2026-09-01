// Server-side Domain Types
// Conforms to Mikyaj Engineering Specification Rev. 5 & SRS v2.1

export type Role = 'CUSTOMER' | 'ADMIN' | 'OWNER';

export type BookingStatus = 
  | 'DRAFT'
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'REJECTED'
  | 'RESCHEDULE_REQUESTED'
  | 'RESCHEDULED';

export type NotificationChannel = 'email' | 'whatsapp';

export type OutboxStatus = 
  | 'PENDING'
  | 'CLAIMED'
  | 'PROCESSING'
  | 'SENT'
  | 'FAILED'
  | 'DEAD_LETTER';

export type RefundStatus = 'none' | 'partial' | 'full' | 'pending';

export interface User {
  id: string;
  email: string | null;
  phone: string | null;
  passwordHash: string | null;
  role: Role;
  permissions?: {
    viewFinancials: boolean;
    overridePolicies: boolean;
    manageStaff: boolean;
    manageServices: boolean;
    manageSettings: boolean;
    resendNotifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CustomerProfile {
  id: string;
  userId: string | null;
  name: string;
  email: string;
  phone: string; // Normalized E.164
  totalBookings: number;
  totalSpendPKR: number; // Only accessible to Owner (FR-A-CUST-01)
  notes?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Staff {
  id: string;
  name: string;
  role: string;
  experience: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  avatarUrl: string;
  bookable: boolean;
  createdAt: string; // Deterministic tie-breaker (DEC-005, AUD-02)
  updatedAt: string;
}

export interface StaffQualification {
  id: string;
  staffId: string;
  serviceId: string;
  createdAt: string;
}

export interface StaffSchedule {
  id: string;
  staffId: string;
  dayOfWeek: number; // 0=Sunday, 6=Saturday
  startTime: string;
  endTime: string;
  isWorking: boolean;
}

export interface StaffBreakLeave {
  id: string;
  staffId: string;
  type: 'BREAK' | 'LEAVE';
  startDatetime: string;
  endDatetime: string;
  reason?: string;
  createdAt: string;
}

export interface BranchHours {
  id: string;
  branchId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
  timezone: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  orderIndex: number;
  description?: string;
  createdAt: string;
}

export interface Service {
  id: string;
  categoryId: string;
  category: string;
  title: string;
  slug: string;
  duration: number;
  price: number; // PKR integer
  description: string;
  imageUrl: string;
  active: boolean; // Soft delete
  popular: boolean;
  rating: number;
  reviewsCount: number;
  included: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  reference: string; // MK-XXXXXX (DEC-024, AUD-03)
  customerId?: string | null;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  serviceId: string;
  serviceTitle: string;
  serviceCategory: string;
  stylistId: string;
  stylistName: string;
  branchId: string;
  branchName: string;
  branchAddress: string;
  bookingDate: string; // YYYY-MM-DD
  startTime: string;   // HH:MM
  endTime: string;     // HH:MM
  duration: number;
  totalPrice: number;  // locked at confirmation (BR-C-017, DEC-023)
  currency: string;
  tax: number;
  specialRequests?: string;
  status: BookingStatus;
  rescheduleCount: number;
  refundStatus: RefundStatus;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
  imageUrl?: string;
  emailStatus?: 'SENT' | 'FAILED' | 'PENDING' | 'DEAD_LETTER';
  whatsAppStatus?: 'SENT' | 'FAILED' | 'PENDING' | 'DEAD_LETTER';
}

export interface BookingItem {
  id: string;
  bookingId: string;
  serviceId: string;
  staffId: string;
  price: number;
  duration: number;
  createdAt: string;
}

export interface BookingStatusHistory {
  id: string;
  bookingId: string;
  fromStatus: BookingStatus;
  toStatus: BookingStatus;
  actor: string;
  reason?: string; // mandatory on override (BR-C-008, AUD-08)
  timestamp: string;
}

export interface BookingReservation {
  id: string;
  slotKey: string;
  staffId: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  expiresAt: string;
}

export interface Review {
  id: string;
  bookingId: string; // unique (BR-C-009, BR-014)
  customerId?: string | null;
  rating: number; // 1-5
  comment?: string;
  isModerated: boolean;
  createdAt: string;
}

export interface NotificationOutbox {
  id: string;
  bookingEventId: string;
  bookingId: string;
  bookingRef: string;
  channel: NotificationChannel;
  event: string;
  templateName: string;
  recipient: string;
  payload: Record<string, any>;
  status: OutboxStatus;
  attemptCount: number;
  maxAttempts: number;
  nextAttemptAt: string | null;
  lockedBy: string | null;
  lockedAt: string | null;
  lastError: string | null;
  createdAt: string;
  sentAt: string | null;
}

export interface NotificationLog {
  id: string;
  outboxId: string;
  channel: NotificationChannel;
  status: OutboxStatus;
  error?: string;
  timestamp: string;
}

export interface ProcessedWebhookEvent {
  id: string;
  providerEventId: string;
  channel: string;
  processedAt: string;
}

export interface IdempotencyKey {
  id: string;
  key: string; // UUID v4
  responseStatus: number;
  responseBody: any;
  createdAt: string;
  expiresAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: 'Owner' | 'Admin' | 'Customer';
  action: string;
  entityType: 'Booking' | 'Service' | 'Staff' | 'Setting' | 'Notification' | 'Customer';
  entityId: string;
  reason?: string;
  beforeState?: string;
  afterState?: string;
  timestamp: string;
}

export interface SalonPolicyConfig {
  cancellationWindowHours: number; // 24
  maxReschedules: number; // 2
  slotIncrementMinutes: number; // 30
  serviceBufferMinutes: number; // 15
  taxRatePercent: number; // 5% GST
  currency: 'PKR';
  timezone: 'Asia/Karachi';
  emailNotificationsEnabled: boolean;
  whatsAppNotificationsEnabled: boolean;
  reminderTimingHoursBefore: number;
}
