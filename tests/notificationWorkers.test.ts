import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../server/db';
import { NotificationWorkerManager } from '../server/notificationWorker';
import { NotificationOutbox } from '../server/types';

describe('Notification Outbox & Channel Independence Test Suite (Spec §14, §15, §18.4, AC-07a/b/c)', () => {
  let worker: NotificationWorkerManager;

  beforeEach(() => {
    db.reset();
    worker = new NotificationWorkerManager();
  });

  it('maintains independent delivery state: email failure does not affect WhatsApp delivery (AC-07a)', async () => {
    const booking = db.bookings[0];

    // Seed outbox with 1 email job and 1 whatsapp job for the same booking
    const emailJob: NotificationOutbox = {
      id: 'outbox-test-email',
      bookingEventId: 'evt-1',
      bookingId: booking.id,
      bookingRef: booking.reference,
      channel: 'email',
      event: 'booking_created',
      templateName: 'booking_created_email',
      recipient: 'customer@example.com',
      payload: { bookingRef: booking.reference },
      status: 'PENDING',
      attemptCount: 0,
      maxAttempts: 5,
      nextAttemptAt: null,
      lockedBy: null,
      lockedAt: null,
      sentAt: null,
      lastError: null,
      createdAt: new Date().toISOString()
    };

    const waJob: NotificationOutbox = {
      id: 'outbox-test-wa',
      bookingEventId: 'evt-1',
      bookingId: booking.id,
      bookingRef: booking.reference,
      channel: 'whatsapp',
      event: 'booking_created',
      templateName: 'booking_created_wa',
      recipient: '+923001234567',
      payload: { bookingRef: booking.reference },
      status: 'PENDING',
      attemptCount: 0,
      maxAttempts: 5,
      nextAttemptAt: null,
      lockedBy: null,
      lockedAt: null,
      sentAt: null,
      lastError: null,
      createdAt: new Date().toISOString()
    };

    db.notificationOutbox.push(emailJob, waJob);

    // Simulate an email outage failure (attempt 1)
    emailJob.attemptCount = 1;
    worker.handleJobFailure(emailJob, 'Resend SMTP Connection Timeout');

    expect(emailJob.status).toBe('FAILED');
    expect(emailJob.lastError).toBe('Resend SMTP Connection Timeout');
    expect(emailJob.nextAttemptAt).not.toBeNull();

    // Verify WhatsApp job remains unaffected in PENDING state
    expect(waJob.status).toBe('PENDING');
    expect(waJob.attemptCount).toBe(0);
    expect(waJob.lastError).toBeNull();
  });

  it('transitions to DEAD_LETTER after 5 failed attempts (DEC-006, DEC-027)', () => {
    const job: NotificationOutbox = {
      id: 'outbox-dlq-test',
      bookingEventId: 'evt-2',
      bookingId: 'book-1',
      bookingRef: 'MK-882910',
      channel: 'whatsapp',
      event: 'booking_created',
      templateName: 'booking_created_wa',
      recipient: '+923001234567',
      payload: {},
      status: 'PENDING',
      attemptCount: 4,
      maxAttempts: 5,
      nextAttemptAt: null,
      lockedBy: null,
      lockedAt: null,
      sentAt: null,
      lastError: null,
      createdAt: new Date().toISOString()
    };

    // Simulate 5th attempt failure
    job.attemptCount = 5;
    worker.handleJobFailure(job, 'Meta API 131056: Rate limit hit');

    expect(job.status).toBe('DEAD_LETTER');
    expect(job.nextAttemptAt).toBeNull();
    expect(job.lastError).toBe('Meta API 131056: Rate limit hit');
  });

  it('manual resend is strictly channel-scoped and does not duplicate other channels (AC-07c, DEC-027)', async () => {
    const dlqJob: NotificationOutbox = {
      id: 'outbox-dlq-wa',
      bookingEventId: 'evt-3',
      bookingId: 'book-1',
      bookingRef: 'MK-123456',
      channel: 'whatsapp',
      event: 'booking_created',
      templateName: 'booking_created_wa',
      recipient: '+923001234567',
      payload: {},
      status: 'DEAD_LETTER',
      attemptCount: 5,
      maxAttempts: 5,
      nextAttemptAt: null,
      lockedBy: null,
      lockedAt: null,
      sentAt: null,
      lastError: 'Meta API rate limit',
      createdAt: new Date().toISOString()
    };

    const sentEmailJob: NotificationOutbox = {
      id: 'outbox-sent-email',
      bookingEventId: 'evt-3',
      bookingId: 'book-1',
      bookingRef: 'MK-123456',
      channel: 'email',
      event: 'booking_created',
      templateName: 'booking_created_email',
      recipient: 'cust@example.com',
      payload: {},
      status: 'SENT',
      attemptCount: 1,
      maxAttempts: 5,
      nextAttemptAt: null,
      lockedBy: null,
      lockedAt: null,
      sentAt: new Date().toISOString(),
      lastError: null,
      createdAt: new Date().toISOString()
    };

    db.notificationOutbox.push(dlqJob, sentEmailJob);

    // Resend the WhatsApp job
    const resendSuccess = await worker.manualResend('outbox-dlq-wa', 'Admin Saira');
    expect(resendSuccess).toBe(true);

    // Assert WhatsApp is resent and SENT
    expect(dlqJob.status).toBe('SENT');
    expect(dlqJob.attemptCount).toBe(1);

    // Assert Email job was NOT modified or re-triggered
    expect(sentEmailJob.status).toBe('SENT');
    expect(sentEmailJob.attemptCount).toBe(1);
  });
});
