// Email HTML and Text Template Generator (Resend API Compatible)
// Conforms to Mikyaj Engineering Specification Rev. 5 (§14.1, §14.2, DEC-012, DEC-013)

import { BookingNotificationContext } from './metaWhatsApp';

export interface EmailRenderOutput {
  subject: string;
  html: string;
  text: string;
}

export function renderEmailTemplate(
  templateName: string,
  ctx: BookingNotificationContext
): EmailRenderOutput {
  switch (templateName) {
    case 'booking_created_email':
      return {
        subject: `[Mikyaj] Booking Received - Reference: ${ctx.bookingRef}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #f0e6e8; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #9d174d; margin: 0; font-size: 24px;">MIKYAJ BEAUTY LOUNGE</h1>
              <p style="color: #6b7280; margin-top: 4px; font-size: 14px;">Booking Confirmation & Details</p>
            </div>
            <p>Dear <strong>${ctx.customerName}</strong>,</p>
            <p>Thank you for choosing Mikyaj. We have received your booking request:</p>
            <div style="background-color: #fdf2f8; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 4px 0;"><strong>Booking Reference:</strong> <span style="color: #9d174d; font-weight: bold;">${ctx.bookingRef}</span></p>
              <p style="margin: 4px 0;"><strong>Service:</strong> ${ctx.serviceTitle}</p>
              <p style="margin: 4px 0;"><strong>Date:</strong> ${ctx.date}</p>
              <p style="margin: 4px 0;"><strong>Time:</strong> ${ctx.startTime}</p>
              <p style="margin: 4px 0;"><strong>Stylist:</strong> ${ctx.stylistName}</p>
              <p style="margin: 4px 0;"><strong>Locked Price:</strong> PKR ${ctx.price.toLocaleString()}</p>
            </div>
            <p style="font-size: 13px; color: #6b7280;">Please arrive 10 minutes prior to your appointment. Need to modify or cancel? You can self-service manage your booking online up to 24 hours in advance.</p>
          </div>
        `,
        text: `Mikyaj Beauty Lounge\n\nDear ${ctx.customerName},\nYour booking request (${ctx.bookingRef}) for ${ctx.serviceTitle} on ${ctx.date} at ${ctx.startTime} with ${ctx.stylistName} has been received.\nLocked Total: PKR ${ctx.price}.\nCancellation allowed up to 24 hours before your slot.`
      };

    case 'booking_accepted_email':
      return {
        subject: `[Mikyaj] Booking Confirmed! - Reference: ${ctx.bookingRef}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #d1fae5; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 24px;">
              <h1 style="color: #065f46; margin: 0; font-size: 24px;">APPOINTMENT CONFIRMED</h1>
            </div>
            <p>Dear <strong>${ctx.customerName}</strong>,</p>
            <p>Your appointment has been confirmed by our management team.</p>
            <div style="background-color: #ecfdf5; padding: 16px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 4px 0;"><strong>Reference:</strong> ${ctx.bookingRef}</p>
              <p style="margin: 4px 0;"><strong>Service:</strong> ${ctx.serviceTitle}</p>
              <p style="margin: 4px 0;"><strong>Date:</strong> ${ctx.date} at ${ctx.startTime}</p>
              <p style="margin: 4px 0;"><strong>Stylist:</strong> ${ctx.stylistName}</p>
            </div>
            <p>We look forward to pampering you at Mikyaj!</p>
          </div>
        `,
        text: `Mikyaj Beauty Lounge\n\nDear ${ctx.customerName},\nYour booking ${ctx.bookingRef} for ${ctx.serviceTitle} on ${ctx.date} at ${ctx.startTime} with ${ctx.stylistName} is CONFIRMED.`
      };

    case 'booking_cancelled_email':
      return {
        subject: `[Mikyaj] Booking Cancelled - Reference: ${ctx.bookingRef}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #fee2e2; border-radius: 12px;">
            <h2 style="color: #991b1b; margin-top: 0;">Booking Cancelled</h2>
            <p>Dear <strong>${ctx.customerName}</strong>,</p>
            <p>Your booking <strong>${ctx.bookingRef}</strong> for ${ctx.serviceTitle} on ${ctx.date} at ${ctx.startTime} has been cancelled.</p>
            <p><strong>Reason:</strong> ${ctx.cancellationReason || 'Requested by customer'}</p>
          </div>
        `,
        text: `Dear ${ctx.customerName},\nYour booking ${ctx.bookingRef} for ${ctx.serviceTitle} has been cancelled. Reason: ${ctx.cancellationReason || 'Requested by customer'}.`
      };

    case 'booking_rescheduled_email':
      return {
        subject: `[Mikyaj] Booking Rescheduled - Reference: ${ctx.bookingRef}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e0e7ff; border-radius: 12px;">
            <h2 style="color: #3730a3; margin-top: 0;">Booking Rescheduled</h2>
            <p>Dear <strong>${ctx.customerName}</strong>,</p>
            <p>Your appointment has been successfully rescheduled to:</p>
            <p><strong>New Date & Time:</strong> ${ctx.date} at ${ctx.startTime}</p>
            <p><strong>Stylist:</strong> ${ctx.stylistName}</p>
          </div>
        `,
        text: `Dear ${ctx.customerName},\nYour booking ${ctx.bookingRef} is rescheduled to ${ctx.date} at ${ctx.startTime} with ${ctx.stylistName}.`
      };

    default:
      return {
        subject: `[Mikyaj] Notification for Booking ${ctx.bookingRef}`,
        html: `<p>Notification update for your booking ${ctx.bookingRef}.</p>`,
        text: `Notification update for your booking ${ctx.bookingRef}.`
      };
  }
}
