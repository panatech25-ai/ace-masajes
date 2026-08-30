import express from 'express';
import { db } from '../database.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendWhatsAppMessage } from '../services/whatsapp.js';
import { checkUpcomingReminders } from '../services/scheduler.js';

const router = express.Router();

// GET /api/settings (Public: returns public business info; Admin: returns full config)
router.get('/', (req, res) => {
  try {
    const settings = db.getSettings();
    // If request has valid auth token, return all, else sanitize secrets
    const authHeader = req.headers.authorization;
    const isAuth = authHeader && authHeader.startsWith('Bearer ');

    if (!isAuth) {
      return res.json({
        business_name: settings.business_name,
        tagline: settings.tagline,
        business_phone: settings.business_phone,
        business_address: settings.business_address,
        whatsapp_enabled: settings.whatsapp_enabled
      });
    }

    res.json(settings);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener configuraciones.' });
  }
});

// PUT /api/settings (Admin: update business settings and WhatsApp configs)
router.put('/', authMiddleware, (req, res) => {
  try {
    const updated = db.updateSettings(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar configuraciones.' });
  }
});

// GET /api/settings/logs (Admin: get WhatsApp notification logs)
router.get('/logs', authMiddleware, (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 100;
    const logs = db.getNotificationLogs(limit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener registros de notificaciones.' });
  }
});

// POST /api/settings/test-whatsapp (Admin: send test WhatsApp message)
router.post('/test-whatsapp', authMiddleware, async (req, res) => {
  try {
    const { phone, message } = req.body;
    if (!phone) {
      return res.status(400).json({ error: 'Número de teléfono requerido.' });
    }

    const testAppointment = {
      id: 'test_demo',
      client_name: 'Cliente de Prueba',
      client_phone: phone,
      client_address: 'Calle Falsa 123',
      service_name: 'Masaje Descontracturante',
      service_duration: 60,
      service_price: 22000,
      date: new Date().toISOString().split('T')[0],
      time: '15:30'
    };

    const result = await sendWhatsAppMessage({
      type: 'custom',
      appointment: testAppointment,
      customMessage: message || '🌿 *ACE Masajes (Alma, Cuerpo, Espíritu)*: Este es un mensaje de prueba del sistema de turnos.'
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message || 'Error al enviar mensaje de prueba.' });
  }
});

// POST /api/settings/run-scheduler-now (Admin: force run 30-min reminder check)
router.post('/run-scheduler-now', authMiddleware, async (req, res) => {
  try {
    await checkUpcomingReminders();
    res.json({ success: true, message: 'Verificación de recordatorios ejecutada correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al ejecutar verificación de recordatorios.' });
  }
});

// GET /api/settings/clients/all (Admin: directory of clients)
router.get('/clients/all', authMiddleware, (req, res) => {
  try {
    const clients = db.getClients();
    res.json(clients);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener clientes.' });
  }
});

// DELETE /api/settings/clients/clear (Admin: clear all registered clients & appointments)
router.delete('/clients/clear', authMiddleware, async (req, res) => {
  try {
    await db.clearAllAppointmentsAndLogs();
    res.json({ success: true, message: 'Todos los registros de clientes y turnos han sido eliminados correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar los registros de clientes.' });
  }
});

// DELETE /api/settings/clients/:phone (Admin: delete specific client)
router.delete('/clients/:phone', authMiddleware, async (req, res) => {
  try {
    const { phone } = req.params;
    await db.deleteClientByPhone(phone);
    res.json({ success: true, message: 'Cliente eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el cliente.' });
  }
});

export default router;
