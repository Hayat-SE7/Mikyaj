-- Mikyaj Beauty Parlor Database Initial Migration
-- Target: PostgreSQL 14+

-- Create Enums
CREATE TYPE "Role" AS ENUM ('CUSTOMER', 'ADMIN', 'OWNER');
CREATE TYPE "BookingStatus" AS ENUM ('DRAFT', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'REJECTED', 'RESCHEDULE_REQUESTED', 'RESCHEDULED');
CREATE TYPE "NotificationChannel" AS ENUM ('email', 'whatsapp');
CREATE TYPE "OutboxStatus" AS ENUM ('PENDING', 'CLAIMED', 'PROCESSING', 'SENT', 'FAILED', 'DEAD_LETTER');
CREATE TYPE "RefundStatus" AS ENUM ('none', 'partial', 'full', 'pending');

-- Users Table
CREATE TABLE "users" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) UNIQUE,
    "phone" VARCHAR(50) UNIQUE,
    "password_hash" VARCHAR(255),
    "role" "Role" NOT NULL DEFAULT 'CUSTOMER',
    "permissions" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Customer Profiles
CREATE TABLE "customer_profiles" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID UNIQUE REFERENCES "users"("id") ON DELETE SET NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50) NOT NULL,
    "total_bookings" INTEGER NOT NULL DEFAULT 0,
    "total_spend_pkr" INTEGER NOT NULL DEFAULT 0,
    "notes" JSONB DEFAULT '[]'::jsonb,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "idx_customer_profiles_phone" ON "customer_profiles"("phone");
CREATE INDEX "idx_customer_profiles_email" ON "customer_profiles"("email");

-- Staff Table
CREATE TABLE "staff" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL,
    "role" VARCHAR(255) NOT NULL,
    "experience" VARCHAR(50) NOT NULL,
    "experience_years" INTEGER NOT NULL DEFAULT 3,
    "rating" NUMERIC(3,2) NOT NULL DEFAULT 5.00,
    "reviews_count" INTEGER NOT NULL DEFAULT 0,
    "avatar_url" TEXT NOT NULL,
    "bookable" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Categories
CREATE TABLE "categories" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(255) NOT NULL UNIQUE,
    "slug" VARCHAR(255) NOT NULL UNIQUE,
    "order_index" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Services
CREATE TABLE "services" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "category_id" UUID NOT NULL REFERENCES "categories"("id"),
    "title" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL UNIQUE,
    "duration" INTEGER NOT NULL,
    "price" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT TRUE,
    "popular" BOOLEAN NOT NULL DEFAULT FALSE,
    "rating" NUMERIC(3,2) NOT NULL DEFAULT 5.00,
    "reviews_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "idx_services_category_id" ON "services"("category_id");

-- Staff Qualifications
CREATE TABLE "staff_qualifications" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "staff_id" UUID NOT NULL REFERENCES "staff"("id") ON DELETE CASCADE,
    "service_id" UUID NOT NULL REFERENCES "services"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "uq_staff_service" UNIQUE ("staff_id", "service_id")
);

-- Staff Schedules
CREATE TABLE "staff_schedules" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "staff_id" UUID NOT NULL REFERENCES "staff"("id") ON DELETE CASCADE,
    "day_of_week" SMALLINT NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "is_working" BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT "uq_staff_schedule_day" UNIQUE ("staff_id", "day_of_week")
);

-- Staff Breaks & Leaves
CREATE TABLE "staff_breaks_leave" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "staff_id" UUID NOT NULL REFERENCES "staff"("id") ON DELETE CASCADE,
    "type" VARCHAR(20) NOT NULL,
    "start_datetime" TIMESTAMPTZ NOT NULL,
    "end_datetime" TIMESTAMPTZ NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "idx_staff_breaks_range" ON "staff_breaks_leave"("staff_id", "start_datetime", "end_datetime");

-- Branch Operating Hours
CREATE TABLE "branch_hours" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "branch_id" VARCHAR(50) NOT NULL,
    "day_of_week" SMALLINT NOT NULL,
    "open_time" VARCHAR(5) NOT NULL,
    "close_time" VARCHAR(5) NOT NULL,
    "is_closed" BOOLEAN NOT NULL DEFAULT FALSE,
    "timezone" VARCHAR(50) NOT NULL DEFAULT 'Asia/Karachi',
    CONSTRAINT "uq_branch_hours_day" UNIQUE ("branch_id", "day_of_week")
);

-- Bookings Table (Core)
CREATE TABLE "bookings" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "reference" VARCHAR(20) NOT NULL UNIQUE,
    "customer_id" UUID REFERENCES "customer_profiles"("id") ON DELETE SET NULL,
    "guest_name" VARCHAR(255) NOT NULL,
    "guest_email" VARCHAR(255) NOT NULL,
    "guest_phone" VARCHAR(50) NOT NULL,
    "service_id" UUID NOT NULL REFERENCES "services"("id"),
    "stylist_id" UUID NOT NULL REFERENCES "staff"("id"),
    "branch_id" VARCHAR(50) NOT NULL,
    "booking_date" DATE NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "duration" INTEGER NOT NULL,
    "total_price" INTEGER NOT NULL,
    "currency" VARCHAR(10) NOT NULL DEFAULT 'PKR',
    "tax" INTEGER NOT NULL DEFAULT 0,
    "special_requests" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "reschedule_count" INTEGER NOT NULL DEFAULT 0,
    "refund_status" "RefundStatus" NOT NULL DEFAULT 'none',
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "idx_bookings_date" ON "bookings"("booking_date");
CREATE INDEX "idx_bookings_stylist_date" ON "bookings"("stylist_id", "booking_date");
CREATE INDEX "idx_bookings_status" ON "bookings"("status");

-- Booking Items
CREATE TABLE "booking_items" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL REFERENCES "bookings"("id") ON DELETE CASCADE,
    "service_id" UUID NOT NULL REFERENCES "services"("id"),
    "staff_id" UUID NOT NULL REFERENCES "staff"("id"),
    "price" INTEGER NOT NULL,
    "duration" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Booking Status History
CREATE TABLE "booking_status_history" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL REFERENCES "bookings"("id") ON DELETE CASCADE,
    "from_status" "BookingStatus" NOT NULL,
    "to_status" "BookingStatus" NOT NULL,
    "actor" VARCHAR(255) NOT NULL,
    "reason" TEXT,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "idx_booking_status_history_booking_id" ON "booking_status_history"("booking_id");

-- Booking Reservations (Hold lock)
CREATE TABLE "booking_reservations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "slot_key" VARCHAR(255) NOT NULL UNIQUE,
    "staff_id" UUID NOT NULL,
    "booking_date" DATE NOT NULL,
    "start_time" VARCHAR(5) NOT NULL,
    "end_time" VARCHAR(5) NOT NULL,
    "expires_at" TIMESTAMPTZ NOT NULL
);

-- Reviews
CREATE TABLE "reviews" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "booking_id" UUID NOT NULL UNIQUE REFERENCES "bookings"("id") ON DELETE CASCADE,
    "customer_id" UUID,
    "rating" SMALLINT NOT NULL CHECK ("rating" >= 1 AND "rating" <= 5),
    "comment" TEXT,
    "is_moderated" BOOLEAN NOT NULL DEFAULT TRUE,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notification Outbox (Independent channels)
CREATE TABLE "notification_outbox" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "booking_event_id" VARCHAR(255) NOT NULL,
    "booking_id" UUID NOT NULL REFERENCES "bookings"("id") ON DELETE CASCADE,
    "booking_ref" VARCHAR(20) NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "event" VARCHAR(100) NOT NULL,
    "template_name" VARCHAR(100) NOT NULL,
    "recipient" VARCHAR(255) NOT NULL,
    "payload" JSONB NOT NULL,
    "status" "OutboxStatus" NOT NULL DEFAULT 'PENDING',
    "attempt_count" INTEGER NOT NULL DEFAULT 0,
    "next_attempt_at" TIMESTAMPTZ,
    "locked_by" VARCHAR(100),
    "locked_at" TIMESTAMPTZ,
    "last_error" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "sent_at" TIMESTAMPTZ,
    CONSTRAINT "uq_event_channel" UNIQUE ("booking_event_id", "channel")
);
CREATE INDEX "idx_notification_outbox_status_channel" ON "notification_outbox"("status", "channel");
CREATE INDEX "idx_notification_outbox_next_attempt" ON "notification_outbox"("next_attempt_at");

-- Notification Log
CREATE TABLE "notification_log" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "outbox_id" UUID NOT NULL REFERENCES "notification_outbox"("id") ON DELETE CASCADE,
    "channel" "NotificationChannel" NOT NULL,
    "status" "OutboxStatus" NOT NULL,
    "error" TEXT,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Processed Webhook Events
CREATE TABLE "processed_webhook_events" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "provider_event_id" VARCHAR(255) NOT NULL UNIQUE,
    "channel" VARCHAR(50) NOT NULL,
    "processed_at" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Idempotency Keys (24h TTL)
CREATE TABLE "idempotency_keys" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "key" VARCHAR(255) NOT NULL UNIQUE,
    "response_status" INTEGER NOT NULL,
    "response_body" JSONB NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "expires_at" TIMESTAMPTZ NOT NULL
);
CREATE INDEX "idx_idempotency_keys_expires" ON "idempotency_keys"("expires_at");

-- Audit Logs (Append-only)
CREATE TABLE "audit_logs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "actor_id" VARCHAR(255) NOT NULL,
    "actor_name" VARCHAR(255) NOT NULL,
    "actor_role" VARCHAR(50) NOT NULL,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50) NOT NULL,
    "entity_id" VARCHAR(255) NOT NULL,
    "reason" TEXT,
    "before_state" TEXT,
    "after_state" TEXT,
    "timestamp" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX "idx_audit_logs_entity" ON "audit_logs"("entity_type", "entity_id");
CREATE INDEX "idx_audit_logs_timestamp" ON "audit_logs"("timestamp");
