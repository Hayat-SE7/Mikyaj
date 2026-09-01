export type ServiceCategory =
  | 'All Services'
  | 'Hair'
  | 'Makeup'
  | 'Skincare'
  | 'Nail Art'
  | 'Bridal'
  | 'Facial'
  | 'Body Spa'
  | 'Threading';

export type BookingStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'ACCEPTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'REJECTED'
  | 'CANCELLED'
  | 'NO_SHOW'
  | 'RESCHEDULE_REQUESTED'
  | 'RESCHEDULED';

export type NotificationChannel = 'email' | 'whatsapp';

export type NotificationJobStatus =
  | 'PENDING'
  | 'CLAIMED'
  | 'PROCESSING'
  | 'SENT'
  | 'FAILED'
  | 'RETRY'
  | 'DEAD_LETTER';

export interface NotificationOutboxItem {
  id: string;
  bookingId: string;
  bookingRef: string;
  channel: NotificationChannel;
  event:
    | 'booking_created'
    | 'booking_accepted'
    | 'booking_rejected'
    | 'booking_reminder'
    | 'booking_cancelled'
    | 'booking_rescheduled'
    | 'booking_completed'
    | 'review_request';
  templateName: string;
  recipient: string; // email address or phone number
  status: NotificationJobStatus;
  attemptCount: number;
  maxAttempts: number; // default 5 (DEC-006)
  nextAttemptAt?: string;
  lastError?: string;
  createdAt: string;
  sentAt?: string;
  lockedBy?: string;
  lockedAt?: string;
}

export interface BookingStatusHistoryItem {
  id: string;
  bookingId: string;
  fromStatus: BookingStatus;
  toStatus: BookingStatus;
  actor: string; // e.g. 'Customer: Hayat Khan', 'Admin: Front Desk', 'Owner: Hayat Rahman'
  reason?: string; // mandatory on overrides (BR-C-008, AUD-08)
  notes?: string;
  timestamp: string;
}

export interface ServiceItem {
  id: string;
  slug?: string;
  title: string;
  category: ServiceCategory;
  description: string;
  duration: number; // in minutes
  price: number; // in PKR (DEC-023)
  rating: number;
  reviewsCount: number;
  imageUrl: string;
  popular?: boolean;
  featuredDiscount?: number; // e.g. 20 for 20% off
  included: string[];
  active: boolean; // soft-delete/deactivation support (BR-C-018, DEC-021)
}

export interface Stylist {
  id: string;
  name: string;
  role: string;
  experience: string;
  experienceYears?: number;
  rating: number;
  reviewsCount: number;
  avatarUrl: string;
  specialty: string[];
  specialities?: string[];
  availableToday: boolean;
  available?: boolean;
  bookable?: boolean;
  createdAt?: string; // tie-breaker order (DEC-005, AUD-02)
  currentActiveWorkload?: number;
  workingHours?: string;
  breaks?: string;
  leavePeriods?: { start: string; end: string; reason: string }[];
  qualifiedServiceIds?: string[];
}

export interface Branch {
  id: string;
  name: string;
  city: string;
  address: string;
  phone: string;
  hours: string;
  rating: number;
  isFlagship?: boolean;
  holidays?: string[];
  timezone?: string; // 'Asia/Karachi' (DEC-022)
}

export interface TimeSlot {
  time: string;
  period: 'Morning' | 'Afternoon' | 'Evening';
  available: boolean;
  spotsLeft?: number;
}

export interface Review {
  id: string;
  bookingId: string;
  bookingRef: string;
  customerName: string;
  serviceTitle: string;
  rating: number; // 1-5
  comment: string;
  createdAt: string;
  isModerated?: boolean;
}

export interface Booking {
  id: string; // UUID
  reference: string; // MK-XXXXXX (BR-C-016, DEC-024)
  serviceId: string;
  serviceTitle: string;
  serviceCategory: ServiceCategory;
  servicePrice: number; // PKR
  tax: number; // 5% GST
  totalAmount: number; // PKR
  duration: number;
  date: string; // YYYY-MM-DD
  time: string;
  branchId: string;
  branchName: string;
  branchAddress: string;
  stylistId: string;
  stylistName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  isGuest?: boolean;
  specialRequests?: string;
  status: BookingStatus;
  createdAt: string;
  updatedAt?: string;
  imageUrl: string;
  rescheduleCount: number; // max 2 self-service (BR-C-020, DEC-004)
  isWalkIn?: boolean; // BR-C-019
  refundStatus?: 'none' | 'partial' | 'full' | 'pending';
  cancellationReason?: string;
  adminOverrideReason?: string;
  statusHistory: BookingStatusHistoryItem[];
  emailStatus: NotificationJobStatus;
  whatsAppStatus: NotificationJobStatus;
  review?: Review;
}

export interface PackageOffer {
  id: string;
  title: string;
  tagline: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  duration: string;
  imageUrl: string;
  servicesIncluded: string[];
  badge: string;
  validTill: string;
}

export interface CustomerNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  unread: boolean;
  type: 'booking' | 'offer' | 'reminder';
  channel?: NotificationChannel;
  bookingRef?: string;
}

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  totalBookings: number;
  bookingCount?: number;
  totalSpendPKR: number; // visible to owner-flagged admins only (FR-A-CUST-01)
  totalSpent?: number;
  lastVisit: string;
  notes: string[];
  isGuest: boolean;
  createdAt: string;
}

export interface AuditLogItem {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: string; // 'Owner' | 'Admin' | 'Customer'
  action: string; // e.g. 'POLICY_OVERRIDE_CANCELLATION', 'STAFF_SCHEDULE_UPDATE', 'MANUAL_NOTIFICATION_RESEND'
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
  slotIncrementMinutes: number; // 15 or 30
  serviceBufferMinutes: number; // 15
  taxRatePercent: number; // 5% GST
  currency: 'PKR';
  timezone: 'Asia/Karachi';
  emailNotificationsEnabled: boolean;
  whatsAppNotificationsEnabled: boolean;
  reminderTimingHoursBefore: number; // 24
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role?: 'ADMIN' | 'OWNER';
  isOwner: boolean; // DEC-003, DEC-020, §7
  branchId?: string;
  permissions?: {
    viewFinancials: boolean;
    overridePolicies: boolean;
    manageStaff: boolean;
    manageServices: boolean;
    manageSettings: boolean;
    moderateReviews: boolean;
  };
}


