import { db } from './database.js';
import { checkUpcomingReminders } from './services/scheduler.js';
import { sendWhatsAppMessage, sanitizePhoneNumber, renderTemplate } from './services/whatsapp.js';

function formatLocalDate(d) {
  const year = d.getFullYear();
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const day = d.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatLocalTime(d) {
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');
  return `${hours}:${minutes}`;
}

async function runTests() {
  console.log('🧪 Iniciando batería de pruebas del sistema ACE Masajes...\n');

  // 1. Test Services
  const services = db.getServices(true);
  console.log(`✅ 1. Servicios cargados: ${services.length} disponibles.`);
  if (services.length === 0) throw new Error('No hay servicios disponibles');

  // 2. Test Phone Sanitization
  const rawPhone = '11 5555-1234';
  const cleanPhone = sanitizePhoneNumber(rawPhone);
  console.log(`✅ 2. Sanitización de teléfono: "${rawPhone}" -> "${cleanPhone}"`);
  if (!cleanPhone.startsWith('+54')) throw new Error('Teléfono mal sanitizado');

  // 3. Test Template Rendering
  const mockApp = {
    id: 'test_123',
    client_name: 'María Gómez',
    client_address: 'Av. Corrientes 1500, 3A',
    client_phone: '+5491155551234',
    service_name: 'Masaje Descontracturante',
    service_duration: 60,
    service_price: 22000,
    date: '2026-08-27',
    time: '16:00'
  };
  const settings = db.getSettings();
  const rendered = renderTemplate(settings.template_confirmation, mockApp, settings);
  console.log('✅ 3. Renderizado de plantilla WhatsApp:');
  console.log('   ---------------------------------------------');
  console.log('   ' + rendered.split('\n').join('\n   '));
  console.log('   ---------------------------------------------');
  if (!rendered.includes('María Gómez') || !rendered.includes('Masaje Descontracturante')) {
    throw new Error('Plantilla no reemplazó variables correctamente');
  }

  // 4. Test WhatsApp Dispatch (Direct Mode)
  const waResult = await sendWhatsAppMessage({
    type: 'confirmation',
    appointment: mockApp
  });
  console.log(`✅ 4. Enlace directo de WhatsApp generado:\n   ${waResult.directLink}`);

  // 5. Test Scheduler 30-min Reminder Trigger
  console.log('\n⏰ 5. Probando Scheduler de Recordatorios a 30 Minutos...');
  const now = new Date();
  // Target appointment 28 minutes from now in local time
  const targetTime = new Date(now.getTime() + 28 * 60 * 1000);
  const targetDateStr = formatLocalDate(targetTime);
  const targetTimeStr = formatLocalTime(targetTime);

  const upcomingApp = db.createAppointment({
    service_id: services[0].id,
    service_name: services[0].name,
    service_duration: services[0].duration,
    service_price: services[0].price,
    client_name: 'Cliente Prueba Recordatorio',
    client_address: 'Calle Salud 123',
    client_phone: '+5491144445555',
    date: targetDateStr,
    time: targetTimeStr,
    status: 'confirmed'
  });

  console.log(`   Turno creado para ${targetDateStr} a las ${targetTimeStr} hs (en 28 minutos)...`);
  console.log(`   Estado reminder_sent inicial: ${upcomingApp.reminder_sent}`);

  // Trigger reminder check
  await checkUpcomingReminders();

  const refreshedApp = db.getAppointmentById(upcomingApp.id);
  console.log(`   Estado reminder_sent posterior: ${refreshedApp.reminder_sent}`);
  if (refreshedApp.reminder_sent !== 1) {
    throw new Error('El scheduler no detectó ni marcó el recordatorio');
  }
  console.log('✅ 5. Recordatorio de 30 minutos verificado con éxito!');

  // Cleanup test appointment
  db.deleteAppointment(upcomingApp.id);

  console.log('\n🎉 ¡TODAS LAS PRUEBAS AUTOMATIZADAS PASARON EXITOSAMENTE!');
}

runTests().catch((err) => {
  console.error('❌ Error en pruebas:', err);
  process.exit(1);
});
