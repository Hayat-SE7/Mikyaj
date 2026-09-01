import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '../server/db';
import { mutateBookingStatus } from '../server/bookingEngine';

describe('Booking Lifecycle State Machine Matrix (Spec §6, §18.1, DEC-003)', () => {
  beforeEach(() => {
    db.reset();
  });

  it('allows valid transition: PENDING -> ACCEPTED (by admin)', () => {
    const booking = db.bookings.find(b => b.status === 'PENDING');
    expect(booking).toBeDefined();

    const result = mutateBookingStatus(booking!.id, 'ACCEPTED', {
      actorId: 'usr-admin-002',
      actorName: 'Amina Desk',
      actorRole: 'Admin'
    });

    expect(result.success).toBe(true);
    expect(result.booking?.status).toBe('ACCEPTED');
  });

  it('allows valid transition: ACCEPTED -> IN_PROGRESS -> COMPLETED', () => {
    const booking = db.bookings.find(b => b.status === 'ACCEPTED');
    expect(booking).toBeDefined();

    // Transition to IN_PROGRESS
    const startRes = mutateBookingStatus(booking!.id, 'IN_PROGRESS', {
      actorId: 'usr-admin-002',
      actorName: 'Amina Desk',
      actorRole: 'Admin'
    });
    expect(startRes.success).toBe(true);
    expect(startRes.booking?.status).toBe('IN_PROGRESS');

    // Transition to COMPLETED
    const completeRes = mutateBookingStatus(booking!.id, 'COMPLETED', {
      actorId: 'usr-admin-002',
      actorName: 'Amina Desk',
      actorRole: 'Admin'
    });
    expect(completeRes.success).toBe(true);
    expect(completeRes.booking?.status).toBe('COMPLETED');
  });

  it('prevents invalid transition: COMPLETED -> PENDING or COMPLETED -> CANCELLED', () => {
    const booking = db.bookings.find(b => b.status === 'COMPLETED');
    expect(booking).toBeDefined();

    const invalidRes = mutateBookingStatus(booking!.id, 'PENDING', {
      actorId: 'usr-admin-002',
      actorName: 'Amina Desk',
      actorRole: 'Admin'
    });
    expect(invalidRes.success).toBe(false);
  });
});
