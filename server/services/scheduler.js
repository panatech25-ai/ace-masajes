import cron from 'node-cron';
import { db } from '../database.js';
import { sendWhatsAppMessage } from './whatsapp.js';

let cronTask = null;

/**
 * Check and process 30-minute upcoming appointment reminders
 */
export async function checkUpcomingReminders() {
  try {
    const data = db.get();
    const appointments = data.appointments || [];
    const now = new Date();

    const upcomingAppointments = appointments.filter((app) => {
      // Must be confirmed and reminder not yet sent
      if (app.status !== 'confirmed' || app.reminder_sent === 1) {
        return false;
      }

      // Parse appointment date & time
      // app.date is 'YYYY-MM-DD', app.time is 'HH:mm'
      const [year, month, day] = app.date.split('-').map(Number);
      const [hours, minutes] = app.time.split(':').map(Number);
      const appDateTime = new Date(year, month - 1, day, hours, minutes, 0);

      // Difference in minutes
      const diffMs = appDateTime.getTime() - now.getTime();
      const diffMinutes = diffMs / (1000 * 60);

      // Trigger if between 0 and 35 minutes away (targets ~30 mins before)
      return diffMinutes > 0 && diffMinutes <= 35;
    });

    if (upcomingAppointments.length > 0) {
      console.log(`[Scheduler ⏰] Encontrados ${upcomingAppointments.length} turnos para recordar en ~30min.`);
    }

    for (const app of upcomingAppointments) {
      console.log(`[Scheduler ⏰] Enviando recordatorio de 30min para ${app.client_name} (${app.time} hs)...`);
      
      const result = await sendWhatsAppMessage({
        type: 'reminder_30m',
        appointment: app
      });

      // Mark reminder as sent
      db.updateAppointment(app.id, {
        reminder_sent: 1,
        reminder_sent_at: new Date().toISOString(),
        reminder_status: result.success ? 'sent' : 'failed'
      });

      console.log(`[Scheduler ⏰] Recordatorio procesado para ${app.client_name}: ${result.success ? 'ÉXITO' : 'FALLO'}`);
    }
  } catch (error) {
    console.error('[Scheduler ❌] Error al verificar recordatorios de turnos:', error);
  }
}

/**
 * Start cron scheduler (runs every minute)
 */
export function startScheduler() {
  if (cronTask) {
    console.log('[Scheduler] El scheduler ya se encuentra en ejecución.');
    return;
  }

  console.log('[Scheduler 🚀] Iniciando servicio de recordatorios automáticos (revisión cada 1 minuto)...');
  
  // Run immediately on start
  checkUpcomingReminders();

  // Run every minute
  cronTask = cron.schedule('* * * * *', () => {
    checkUpcomingReminders();
  });
}

export function stopScheduler() {
  if (cronTask) {
    cronTask.stop();
    cronTask = null;
    console.log('[Scheduler] Scheduler detenido.');
  }
}
