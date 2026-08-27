import express from 'express';
import { db } from '../database.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

// GET /api/services (Public: active only, Admin with ?all=true: all)
router.get('/', (req, res) => {
  try {
    const showAll = req.query.all === 'true';
    const services = db.getServices(!showAll);
    res.json(services);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener los servicios.' });
  }
});

// POST /api/services (Admin: create service)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, description, duration, price, active, category, icon } = req.body;
    if (!name || !duration || price === undefined) {
      return res.status(400).json({ error: 'Nombre, duración y precio son campos requeridos.' });
    }

    const created = db.createService({
      name,
      description,
      duration,
      price,
      active,
      category,
      icon
    });

    res.status(201).json(created);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear el servicio.' });
  }
});

// PUT /api/services/:id (Admin: update service)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const updated = db.updateService(id, req.body);
    if (!updated) {
      return res.status(404).json({ error: 'Servicio no encontrado.' });
    }
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar el servicio.' });
  }
});

// DELETE /api/services/:id (Admin: delete service)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const success = db.deleteService(id);
    if (!success) {
      return res.status(404).json({ error: 'Servicio no encontrado.' });
    }
    res.json({ success: true, message: 'Servicio eliminado con éxito.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el servicio.' });
  }
});

export default router;
