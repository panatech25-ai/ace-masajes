import axios from 'axios';
import { db } from '../database.js';

/**
 * Format date for friendly Spanish display
 */
export function formatFriendlyDate(dateStr) {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return dateObj.toLocaleDateString('es-ES', options);
}

/**
 * Clean and format phone number for WhatsApp
 */
export function sanitizePhoneNumber(phone) {
  if (!phone) return '';
  let cleaned = phone.replace(/[^\d+]/g, '');
  
  // If starts with 0 (e.g. 011 -> 11), remove leading 0
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  
  // If no plus and does not start with country code (e.g., 11XXXXXXXX in Argentina)
  if (!cleaned.startsWith('+')) {
    if (cleaned.startsWith('54')) {
      cleaned = `+${cleaned}`;
    } else if (cleaned.length === 10 || cleaned.length === 11) {
      // Assuming Argentina (+54 9)
      cleaned = `+549${cleaned}`;
    } else {
      cleaned = `+${cleaned}`;
    }
  }
  
  return cleaned;
}

/**
 * Replace placeholders in message templates
 */
export function renderTemplate(template, appointment, settings) {
  if (!template) return '';
  
  const friendlyDate = formatFriendlyDate(appointment.date);
  
  return template
    .replace(/{cliente}/g, appointment.client_name || 'Estimado/a cliente')
    .replace(/{servicio}/g, appointment.service_name || 'Masaje')
    .replace(/{fecha}/g, friendlyDate)
    .replace(/{fecha_corta}/g, appointment.date || '')
    .replace(/{hora}/g, appointment.time || '')
    .replace(/{duracion}/g, `${appointment.service_duration || 60} min`)
    .replace(/{precio}/g, `$${Number(appointment.service_price || 0).toLocaleString('es-AR')}`)
    .replace(/{direccion}/g, appointment.client_address || 'Sin especificar')
    .replace(/{telefono}/g, appointment.client_phone || '')
    .replace(/{direccion_negocio}/g, settings.business_address || 'Espacio ACE Masajes')
    .replace(/{telefono_negocio}/g, settings.business_phone || '');
}

/**
 * Build Direct WhatsApp URL (wa.me)
 */
export function buildWhatsAppDirectLink(phone, message) {
  const cleanPhone = sanitizePhoneNumber(phone).replace('+', '');
  const encodedText = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedText}`;
}

/**
 * Dispatch WhatsApp notification
 */
export async function sendWhatsAppMessage({ type, appointment, customMessage = null }) {
  const settings = db.getSettings();
  const phone = sanitizePhoneNumber(appointment.client_phone);

  if (!phone) {
    throw new Error('El teléfono del cliente es inválido o no existe.');
  }

  // Determine template
  let rawTemplate = customMessage;
  if (!rawTemplate) {
    if (type === 'confirmation') rawTemplate = settings.template_confirmation;
    else if (type === 'reminder_30m') rawTemplate = settings.template_reminder;
    else if (type === 'cancellation') rawTemplate = settings.template_cancellation;
    else rawTemplate = 'Notificación de ACE Masajes';
  }

  const message = renderTemplate(rawTemplate, appointment, settings);
  const directLink = buildWhatsAppDirectLink(phone, message);

  // If WhatsApp automated integration is disabled or set to 'direct'
  if (!settings.whatsapp_enabled || settings.whatsapp_provider === 'direct') {
    db.addNotificationLog({
      appointment_id: appointment.id,
      type,
      recipient_phone: phone,
      recipient_name: appointment.client_name,
      message,
      status: 'ready_direct',
      provider: 'direct_link'
    });

    return {
      success: true,
      mode: 'direct',
      message,
      directLink,
      phone
    };
  }

  // Automated providers
  try {
    if (settings.whatsapp_provider === 'meta') {
      if (!settings.whatsapp_meta_token || !settings.whatsapp_meta_phone_number_id) {
        throw new Error('Falta configurar Token o Phone Number ID de Meta WhatsApp API');
      }

      await axios.post(
        `https://graph.facebook.com/v19.0/${settings.whatsapp_meta_phone_number_id}/messages`,
        {
          messaging_product: 'whatsapp',
          to: phone.replace('+', ''),
          type: 'text',
          text: { body: message }
        },
        {
          headers: {
            Authorization: `Bearer ${settings.whatsapp_meta_token}`,
            'Content-Type': 'application/json'
          }
        }
      );
    } else if (settings.whatsapp_provider === 'twilio') {
      if (!settings.whatsapp_twilio_account_sid || !settings.whatsapp_twilio_auth_token) {
        throw new Error('Faltan credenciales de Twilio (Account SID / Auth Token)');
      }

      const from = settings.whatsapp_twilio_from_number.startsWith('whatsapp:')
        ? settings.whatsapp_twilio_from_number
        : `whatsapp:${settings.whatsapp_twilio_from_number}`;
      const to = `whatsapp:${phone}`;

      const auth = Buffer.from(
        `${settings.whatsapp_twilio_account_sid}:${settings.whatsapp_twilio_auth_token}`
      ).toString('base64');

      const params = new URLSearchParams();
      params.append('From', from);
      params.append('To', to);
      params.append('Body', message);

      await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${settings.whatsapp_twilio_account_sid}/Messages.json`,
        params,
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
    } else if (settings.whatsapp_provider === 'webhook') {
      if (!settings.whatsapp_webhook_url) {
        throw new Error('Falta configurar la URL del Webhook');
      }

      await axios.post(
        settings.whatsapp_webhook_url,
        {
          phone: phone.replace('+', ''),
          name: appointment.client_name,
          message,
          type,
          appointment
        },
        { headers: { 'Content-Type': 'application/json' }, timeout: 8000 }
      );
    }

    db.addNotificationLog({
      appointment_id: appointment.id,
      type,
      recipient_phone: phone,
      recipient_name: appointment.client_name,
      message,
      status: 'sent',
      provider: settings.whatsapp_provider
    });

    return {
      success: true,
      mode: 'automated',
      provider: settings.whatsapp_provider,
      message,
      directLink,
      phone
    };
  } catch (error) {
    const errorMsg = error.response?.data?.error?.message || error.message;
    console.error(`Error sending WhatsApp via ${settings.whatsapp_provider}:`, errorMsg);

    db.addNotificationLog({
      appointment_id: appointment.id,
      type,
      recipient_phone: phone,
      recipient_name: appointment.client_name,
      message,
      status: 'failed',
      provider: settings.whatsapp_provider,
      error: errorMsg
    });

    return {
      success: false,
      mode: 'fallback_direct',
      error: errorMsg,
      message,
      directLink,
      phone
    };
  }
}
