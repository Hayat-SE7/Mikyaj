// WhatsApp Meta Cloud API Payload Builder & Template Validator
// Conforms to Mikyaj Engineering Specification Rev. 5 (§15.1, §15.2, DEC-001, DEC-014, AUD-06)
// Reference: Meta Business WhatsApp Cloud API Graph API v20.0+

export interface MetaWhatsAppPayload {
  messaging_product: 'whatsapp';
  recipient_type: 'individual';
  to: string; // E.164 without leading plus for Meta Cloud API or with plus
  type: 'template';
  template: {
    name: string;
    language: {
      code: string; // e.g. 'en_US' or 'en'
    };
    components: Array<{
      type: 'header' | 'body' | 'button';
      sub_type?: 'url' | 'quick_reply';
      index?: string | number;
      parameters: Array<{
        type: 'text' | 'currency' | 'date_time' | 'payload';
        text?: string;
        payload?: string;
      }>;
    }>;
  };
}

export type WhatsAppTemplateKey =
  | 'booking_created_wa'
  | 'booking_accepted_wa'
  | 'booking_rejected_wa'
  | 'booking_cancelled_wa'
  | 'booking_rescheduled_wa'
  | 'booking_reminder_wa'
  | 'review_request_wa';

export interface BookingNotificationContext {
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  serviceTitle: string;
  category: string;
  date: string;
  startTime: string;
  stylistName: string;
  price: number;
  cancellationReason?: string;
  rejectionReason?: string;
  rescheduleReason?: string;
}

/**
 * Builds standard Meta Cloud API Graph API JSON payload for all 7 approved WhatsApp templates.
 */
export function buildMetaWhatsAppPayload(
  templateKey: WhatsAppTemplateKey,
  ctx: BookingNotificationContext
): MetaWhatsAppPayload {
  // Normalize E.164 phone: strip any '+' or spaces for Meta payload recipient
  const cleanPhone = ctx.customerPhone.replace(/[^0-9]/g, '');

  switch (templateKey) {
    case 'booking_created_wa':
      return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'template',
        template: {
          name: 'booking_created_wa',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: ctx.customerName },
                { type: 'text', text: ctx.bookingRef },
                { type: 'text', text: ctx.serviceTitle },
                { type: 'text', text: ctx.date },
                { type: 'text', text: ctx.startTime },
                { type: 'text', text: `PKR ${ctx.price.toLocaleString()}` }
              ]
            }
          ]
        }
      };

    case 'booking_accepted_wa':
      return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'template',
        template: {
          name: 'booking_accepted_wa',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: ctx.customerName },
                { type: 'text', text: ctx.bookingRef },
                { type: 'text', text: ctx.serviceTitle },
                { type: 'text', text: ctx.date },
                { type: 'text', text: ctx.startTime },
                { type: 'text', text: ctx.stylistName }
              ]
            }
          ]
        }
      };

    case 'booking_rejected_wa':
      return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'template',
        template: {
          name: 'booking_rejected_wa',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: ctx.customerName },
                { type: 'text', text: ctx.bookingRef },
                { type: 'text', text: ctx.serviceTitle },
                { type: 'text', text: ctx.rejectionReason || 'Staff schedule emergency' }
              ]
            }
          ]
        }
      };

    case 'booking_cancelled_wa':
      return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'template',
        template: {
          name: 'booking_cancelled_wa',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: ctx.customerName },
                { type: 'text', text: ctx.bookingRef },
                { type: 'text', text: ctx.serviceTitle },
                { type: 'text', text: ctx.date },
                { type: 'text', text: ctx.startTime },
                { type: 'text', text: ctx.cancellationReason || 'Requested by customer' }
              ]
            }
          ]
        }
      };

    case 'booking_rescheduled_wa':
      return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'template',
        template: {
          name: 'booking_rescheduled_wa',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: ctx.customerName },
                { type: 'text', text: ctx.bookingRef },
                { type: 'text', text: ctx.serviceTitle },
                { type: 'text', text: ctx.date },
                { type: 'text', text: ctx.startTime },
                { type: 'text', text: ctx.stylistName }
              ]
            }
          ]
        }
      };

    case 'booking_reminder_wa':
      return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'template',
        template: {
          name: 'booking_reminder_wa',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: ctx.customerName },
                { type: 'text', text: ctx.bookingRef },
                { type: 'text', text: ctx.serviceTitle },
                { type: 'text', text: ctx.date },
                { type: 'text', text: ctx.startTime }
              ]
            }
          ]
        }
      };

    case 'review_request_wa':
      return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: cleanPhone,
        type: 'template',
        template: {
          name: 'review_request_wa',
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: ctx.customerName },
                { type: 'text', text: ctx.bookingRef },
                { type: 'text', text: ctx.serviceTitle }
              ]
            }
          ]
        }
      };
  }
}
