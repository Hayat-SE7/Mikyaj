// Independent Notification Background Outbox Engine
// Conforms to Mikyaj Engineering Specification Rev. 5 (§14, §15, DEC-011, DEC-012, ARCH-017)

import { db } from './db';
import { NotificationOutbox, OutboxStatus } from './types';

// Retry schedule in milliseconds: 1m -> 5m -> 30m -> 2h -> 12h (DEC-007, AUD-07)
const RETRY_DELAYS_MS = [
  1 * 60 * 1000,       // Attempt 1: 1 min
  5 * 60 * 1000,       // Attempt 2: 5 min
  30 * 60 * 1000,      // Attempt 3: 30 min
  2 * 60 * 60 * 1000,  // Attempt 4: 2 hours
  12 * 60 * 60 * 1000  // Attempt 5: 12 hours
];

export class NotificationWorkerManager {
  private emailInterval: NodeJS.Timeout | null = null;
  private whatsAppInterval: NodeJS.Timeout | null = null;

  public startWorkers() {
    // Separate intervals running independently (DEC-011, DEC-012, DEC-028)
    this.emailInterval = setInterval(() => this.processChannel('email'), 5000);
    this.whatsAppInterval = setInterval(() => this.processChannel('whatsapp'), 5000);
  }

  public stopWorkers() {
    if (this.emailInterval) clearInterval(this.emailInterval);
    if (this.whatsAppInterval) clearInterval(this.whatsAppInterval);
  }

  // Process a single channel independently
  public async processChannel(channel: 'email' | 'whatsapp') {
    const now = new Date();
    
    // Find pending jobs due for processing
    const candidates = db.notificationOutbox.filter(job => {
      if (job.channel !== channel) return false;
      if (job.status !== 'PENDING' && job.status !== 'FAILED') return false;
      if (job.nextAttemptAt && new Date(job.nextAttemptAt) > now) return false;
      return true;
    });

    for (const job of candidates) {
      await this.executeJob(job);
    }
  }

  // Execute an individual outbox job
  private async executeJob(job: NotificationOutbox) {
    job.status = 'PROCESSING';
    job.attemptCount += 1;

    try {
      // Dispatch simulation (in production: Resend API for email, Meta Cloud API for WhatsApp)
      const simulatedSuccess = true;

      if (simulatedSuccess) {
        job.status = 'SENT';
        job.sentAt = new Date().toISOString();
        job.lastError = null;

        // Update corresponding booking flag
        const booking = db.bookings.find(b => b.id === job.bookingId);
        if (booking) {
          if (job.channel === 'email') booking.emailStatus = 'SENT';
          if (job.channel === 'whatsapp') booking.whatsAppStatus = 'SENT';
        }

        db.notificationLogs.push({
          id: `log-${Date.now()}`,
          outboxId: job.id,
          channel: job.channel,
          status: 'SENT',
          timestamp: new Date().toISOString()
        });
      }
    } catch (err: any) {
      this.handleJobFailure(job, err?.message || 'Provider connection error');
    }
  }

  // Handle failure & compute next retry or transition to DEAD_LETTER (DEC-006, DEC-007, §14.3)
  public handleJobFailure(job: NotificationOutbox, errorMessage: string) {
    job.lastError = errorMessage;

    if (job.attemptCount >= 5) {
      // Reached 5 attempts -> transition to DEAD_LETTER (DEC-006, DEC-027)
      job.status = 'DEAD_LETTER';
      job.nextAttemptAt = null;

      // Update booking status badge
      const booking = db.bookings.find(b => b.id === job.bookingId);
      if (booking) {
        if (job.channel === 'email') booking.emailStatus = 'DEAD_LETTER';
        if (job.channel === 'whatsapp') booking.whatsAppStatus = 'DEAD_LETTER';
      }
    } else {
      // Compute next retry from the most recent failure (AUD-07, DEC-007)
      const delay = RETRY_DELAYS_MS[job.attemptCount - 1] || 60000;
      job.status = 'FAILED';
      job.nextAttemptAt = new Date(Date.now() + delay).toISOString();
    }

    db.notificationLogs.push({
      id: `log-${Date.now()}`,
      outboxId: job.id,
      channel: job.channel,
      status: job.status,
      error: errorMessage,
      timestamp: new Date().toISOString()
    });
  }

  // Manual Resend of a Dead-Lettered Job (DEC-027, FR-A-BOOK-08)
  public async manualResend(outboxId: string, adminActor: string): Promise<boolean> {
    const job = db.notificationOutbox.find(j => j.id === outboxId);
    if (!job) return false;

    // Reset attempts and status for this specific channel only (DEC-011, DEC-027)
    job.status = 'PENDING';
    job.attemptCount = 0;
    job.nextAttemptAt = new Date().toISOString();
    job.lastError = null;

    db.logAudit(
      'admin-actor',
      adminActor,
      'Admin',
      'NOTIFICATION_RESEND',
      'Notification',
      job.bookingRef,
      `Manual resend initiated for ${job.channel.toUpperCase()} outbox job (${job.templateName})`
    );

    await this.executeJob(job);
    return true;
  }
}

export const notificationWorkers = new NotificationWorkerManager();
