import express from 'express';
import { db } from '../database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/schedule (Public/Admin: get schedule and blocked dates)
router.get('/', (req, res) => {
  try {
    const config = db.getScheduleConfig();
    const blocked = db.getBlockedDates();
    res.json({ config, blocked });
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener la configuración de horarios.' });
  }
});

// PUT /api/schedule/config (Admin: update working hours & rules)
router.put('/config', authMiddleware, (req, res) => {
  try {
    const updated = db.updateScheduleConfig(req.body);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar horarios.' });
  }
});

// POST /api/schedule/blocked (Admin: add blocked date/time)
router.post('/blocked', authMiddleware, (req, res) => {
  try {
    const { date, all_day, start_time, end_time, reason } = req.body;
    if (!date) {
      return res.status(400).json({ error: 'La fecha es requerida.' });
    }

    const blocked = db.addBlockedDate({
      date,
      all_day,
      start_time,
      end_time,
      reason
    });

    res.status(201).json(blocked);
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar fecha bloqueada.' });
  }
});

// DELETE /api/schedule/blocked/:id (Admin: remove blocked date)
router.delete('/blocked/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    db.deleteBlockedDate(id);
    res.json({ success: true, message: 'Bloqueo eliminado con éxito.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar fecha bloqueada.' });
  }
});

export default router;
