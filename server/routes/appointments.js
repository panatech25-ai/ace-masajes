import express from 'express';
import { db } from '../database.js';
import { authMiddleware } from '../middleware/auth.js';
import { sendWhatsAppMessage } from '../services/whatsapp.js';

const router = express.Router();

// Helper: Get today's date string (YYYY-MM-DD) in Argentina timezone (UTC-3)
function getArgentinaTodayStr() {
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Argentina/Buenos_Aires',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });
  return formatter.format(new Date());
}

// Helper: Get current minutes from midnight in Argentina timezone
function getArgentinaCurrentMinutes() {
  const timeFormatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'America/Argentina/Buenos_Aires',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
  const [h, m] = timeFormatter.format(new Date()).split(':').map(Number);
  return h * 60 + m;
}

// Helper: parse HH:mm to minutes from midnight
function timeToMinutes(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  return h * 60 + m;
}

// Helper: minutes to HH:mm
function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

// Helper: Add minutes to HH:mm
function addMinutesToTime(timeStr, minutesToAdd) {
  const mins = timeToMinutes(timeStr) + minutesToAdd;
  return minutesToTime(mins);
}

// GET /api/appointments/availability?date=YYYY-MM-DD&service_id=xxx
router.get('/availability', (req, res) => {
  try {
    const { date, service_id } = req.query;

    if (!date) {
      return res.status(400).json({ error: 'Parámetro date es requerido (YYYY-MM-DD).' });
    }

    const scheduleConfig = db.getScheduleConfig();
    const blockedDates = db.getBlockedDates();
    const services = db.getServices();

    // Find service duration
    let duration = 60;
    if (service_id) {
      const srv = services.find((s) => s.id === service_id);
      if (srv) duration = srv.duration;
    }

    const [year, month, day] = date.split('-').map(Number);
    // Construct local date to get correct day of week
    const targetDate = new Date(year, month - 1, day);
    const dayOfWeek = targetDate.getDay(); // 0 = Domingo, 1 = Lunes, etc.

    const dayConfig = scheduleConfig.days.find((d) => d.day_of_week === dayOfWeek);

    // If day is not a working day
    if (!dayConfig || !dayConfig.is_working) {
      return res.json({
        date,
        day_name: dayConfig ? dayConfig.day_name : 'Cerrado',
        is_working: false,
        reason: 'El establecimiento se encuentra cerrado este día.',
        slots: []
      });
    }

    // Check all-day block
    const allDayBlock = blockedDates.find((b) => b.date === date && b.all_day);
    if (allDayBlock) {
      return res.json({
        date,
        day_name: dayConfig.day_name,
        is_working: false,
        reason: allDayBlock.reason || 'Día no disponible por feriado o receso.',
        slots: []
      });
    }

    // Existing appointments on this date (confirmed or pending)
    const existingAppointments = db.getAppointments({ date }).filter(
      (a) => a.status === 'confirmed' || a.status === 'pending'
    );

    // Blocked partial-day slots
    const partialBlocks = blockedDates.filter((b) => b.date === date && !b.all_day);

    const slotInterval = scheduleConfig.slot_interval || 15;
    const buffer = scheduleConfig.buffer_between_slots || 15;
    const minAdvanceHours = scheduleConfig.min_advance_hours || 1;

    const openMins = timeToMinutes(dayConfig.open_time || '09:00');
    const closeMins = timeToMinutes(dayConfig.close_time || '20:00');

    let breakStartMins = -1;
    let breakEndMins = -1;
    if (dayConfig.has_break && dayConfig.break_start && dayConfig.break_end) {
      breakStartMins = timeToMinutes(dayConfig.break_start);
      breakEndMins = timeToMinutes(dayConfig.break_end);
    }

    // Use Argentina timezone (America/Argentina/Buenos_Aires - UTC-3)
    // to accurately calculate today and current hour on cloud servers (Vercel)
    const todayStr = getArgentinaTodayStr();
    const isToday = date === todayStr;
    const isPastDate = date < todayStr;

    if (isPastDate) {
      return res.json({
        date,
        day_name: dayConfig ? dayConfig.day_name : '',
        is_working: false,
        reason: 'No es posible reservar turnos en fechas pasadas.',
        slots: []
      });
    }

    const currentMinutesToday = getArgentinaCurrentMinutes();
    const minBookingMinutes = currentMinutesToday + minAdvanceHours * 60;

    const slots = [];

    for (let startMins = openMins; startMins + duration <= closeMins; startMins += slotInterval) {
      const endMins = startMins + duration;

      // If today, check advance notice and past slots
      if (isToday && startMins < minBookingMinutes) {
        continue;
      }

      // Check break overlap
      if (dayConfig.has_break && breakStartMins !== -1 && breakEndMins !== -1) {
        if (startMins < breakEndMins && endMins > breakStartMins) {
          continue;
        }
      }

      // Check partial blocks overlap
      let isBlocked = false;
      for (const block of partialBlocks) {
        const blkStart = timeToMinutes(block.start_time);
        const blkEnd = timeToMinutes(block.end_time);
        if (startMins < blkEnd && endMins > blkStart) {
          isBlocked = true;
          break;
        }
      }
      if (isBlocked) continue;

      // Check existing appointments overlap (including buffer after each appointment)
      let hasConflict = false;
      for (const app of existingAppointments) {
        const appStart = timeToMinutes(app.time);
        const appDuration = app.service_duration || 60;
        const appEndWithBuffer = appStart + appDuration + buffer;

        // An appointment occupies [appStart, appEndWithBuffer]
        // Our new appointment + buffer occupies [startMins, endMins + buffer]
        // Check if [startMins, endMins] overlaps with [appStart - buffer, appEnd]
        if (startMins < (appStart + appDuration) && (startMins + duration + buffer) > appStart) {
          hasConflict = true;
          break;
        }
      }

      if (!hasConflict) {
        slots.push({
          time: minutesToTime(startMins),
          endTime: minutesToTime(endMins),
          duration
        });
      }
    }

    res.json({
      date,
      day_name: dayConfig.day_name,
      is_working: true,
      working_hours: `${dayConfig.open_time} - ${dayConfig.close_time}`,
      slots
    });
  } catch (err) {
    console.error('Error calculating availability:', err);
    res.status(500).json({ error: 'Error al calcular disponibilidad.' });
  }
});

// Helper: Calculate recurring dates sequence
function calculateRecurrenceDates(startDateStr, type, count, customInterval = 1) {
  const dates = [];
  const [startYear, startMonth, startDay] = startDateStr.split('-').map(Number);

  for (let i = 0; i < count; i++) {
    if (i === 0) {
      dates.push(startDateStr);
      continue;
    }

    let d;
    if (type === 'weekly') {
      d = new Date(startYear, startMonth - 1, startDay + (7 * i * customInterval));
    } else if (type === 'biweekly') {
      d = new Date(startYear, startMonth - 1, startDay + (14 * i));
    } else if (type === 'monthly') {
      d = new Date(startYear, (startMonth - 1) + (i * customInterval), startDay);
    } else if (type === 'custom_days') {
      const step = parseInt(customInterval, 10) || 7;
      d = new Date(startYear, startMonth - 1, startDay + (step * i));
    } else {
      d = new Date(startYear, startMonth - 1, startDay + (7 * i));
    }

    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    dates.push(`${y}-${m}-${day}`);
  }

  return dates;
}

// POST /api/appointments (Public client booking or admin booking, with recurrence support)
router.post('/', async (req, res) => {
  try {
    const {
      service_id,
      date,
      time,
      client_name,
      client_address,
      client_phone,
      client_notes,
      source,
      recurrence
    } = req.body;

    // Validations
    if (!service_id || !date || !time || !client_name || !client_phone || !client_address) {
      return res.status(400).json({
        error: 'Por favor complete todos los campos obligatorios: Servicio, Fecha, Hora, Nombre, Dirección y Teléfono.'
      });
    }

    const service = db.getServiceById(service_id);
    if (!service) {
      return res.status(404).json({ error: 'El servicio seleccionado no existe.' });
    }

    // Disallow booking past dates or past hours for today (unless admin)
    if (source !== 'admin') {
      const todayStr = getArgentinaTodayStr();
      if (date < todayStr) {
        return res.status(400).json({ error: 'No se pueden agendar turnos en fechas pasadas.' });
      }
      if (date === todayStr) {
        const currentMins = getArgentinaCurrentMinutes();
        const slotMins = timeToMinutes(time);
        if (slotMins <= currentMins) {
          return res.status(400).json({
            error: 'El horario seleccionado ya pasó para el día de hoy. Por favor elija un horario para mañana o una fecha posterior.'
          });
        }
      }
    }

    const endTime = addMinutesToTime(time, service.duration);
    const scheduleConfig = db.getScheduleConfig();
    const buffer = scheduleConfig.buffer_between_slots || 15;
    const newStartMins = timeToMinutes(time);

    // Check if recurrence requested
    const isRecurring = recurrence && recurrence.enabled && parseInt(recurrence.count, 10) > 1;
    const recurrenceCount = isRecurring ? parseInt(recurrence.count, 10) : 1;
    const recurrenceType = isRecurring ? (recurrence.type || 'weekly') : null;
    const customInterval = isRecurring ? (parseInt(recurrence.interval, 10) || 1) : 1;

    const datesToBook = isRecurring
      ? calculateRecurrenceDates(date, recurrenceType, recurrenceCount, customInterval)
      : [date];

    const seriesId = isRecurring ? `ser_${Date.now()}_${Math.random().toString(36).substr(2, 4)}` : null;
    const createdAppointments = [];
    const skippedDates = [];

    for (let i = 0; i < datesToBook.length; i++) {
      const bookDate = datesToBook[i];

      // Check conflict for each date
      const existing = db.getAppointments({ date: bookDate }).filter(
        (a) => a.status === 'confirmed' || a.status === 'pending'
      );

      let conflict = false;
      for (const app of existing) {
        const appStart = timeToMinutes(app.time);
        const appDuration = app.service_duration || 60;
        if (newStartMins < (appStart + appDuration) && (newStartMins + service.duration + buffer) > appStart) {
          conflict = true;
          break;
        }
      }

      // If initial date has conflict, return error
      if (i === 0 && conflict) {
        return res.status(409).json({
          error: `El horario ${time} hs para la primera fecha (${bookDate}) ya está ocupado. Elija otro horario.`
        });
      }

      // If subsequent recurring date has conflict and source is not admin, record skipped
      if (conflict && source !== 'admin') {
        skippedDates.push(bookDate);
        continue;
      }

      const recurrenceLabel = isRecurring
        ? `${recurrenceType === 'weekly' ? 'Semanal' : recurrenceType === 'biweekly' ? 'Quincenal' : recurrenceType === 'monthly' ? 'Mensual' : 'Personalizado'} (${i + 1}/${datesToBook.length})`
        : null;

      const app = db.createAppointment({
        series_id: seriesId,
        recurrence_type: recurrenceType,
        recurrence_index: i + 1,
        recurrence_total: datesToBook.length,
        recurrence_rule: recurrenceLabel,
        service_id: service.id,
        service_name: service.name,
        service_duration: service.duration,
        service_price: service.price,
        client_name,
        client_address,
        client_phone,
        client_notes: client_notes || '',
        date: bookDate,
        time,
        end_time: endTime,
        status: 'confirmed',
        source: source || 'web'
      });

      createdAppointments.push(app);
    }

    const primaryAppointment = createdAppointments[0];

    // Dispatch WhatsApp confirmation
    let whatsappResult = null;
    try {
      whatsappResult = await sendWhatsAppMessage({
        type: 'confirmation',
        appointment: primaryAppointment
      });
      db.updateAppointment(primaryAppointment.id, { confirmation_sent: 1 });
    } catch (waErr) {
      console.warn('Error dispatching WhatsApp confirmation:', waErr.message);
    }

    res.status(201).json({
      success: true,
      message: isRecurring
        ? `¡Se agendaron ${createdAppointments.length} turnos recurrentes con éxito!`
        : '¡Turno registrado con éxito!',
      appointment: primaryAppointment,
      appointments: createdAppointments,
      series_id: seriesId,
      total_booked: createdAppointments.length,
      skipped_dates: skippedDates,
      whatsapp: whatsappResult
    });
  } catch (err) {
    console.error('Error creating appointment:', err);
    res.status(500).json({ error: err.message || 'Error al registrar el turno.' });
  }
});

// GET /api/appointments (Admin: list / search / filter)
router.get('/', authMiddleware, (req, res) => {
  try {
    const { date, startDate, endDate, status, search } = req.query;
    const appointments = db.getAppointments({ date, startDate, endDate, status, search });
    res.json(appointments);
  } catch (err) {
    console.error('Error fetching appointments:', err);
    res.status(500).json({ error: 'Error al obtener turnos.' });
  }
});

// GET /api/appointments/stats/summary (Admin summary KPIs)
router.get('/stats/summary', authMiddleware, (req, res) => {
  try {
    const all = db.getAppointments();
    const todayStr = new Date().toISOString().split('T')[0];

    const todayAppointments = all.filter((a) => a.date === todayStr);
    const confirmedToday = todayAppointments.filter((a) => a.status === 'confirmed').length;
    const pendingToday = todayAppointments.filter((a) => a.status === 'pending').length;

    // Current week appointments
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay() + 1); // Monday
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday

    const startOfWeekStr = startOfWeek.toISOString().split('T')[0];
    const endOfWeekStr = endOfWeek.toISOString().split('T')[0];

    const weekAppointments = all.filter(
      (a) => a.date >= startOfWeekStr && a.date <= endOfWeekStr && a.status !== 'cancelled'
    );

    const totalRevenue = all
      .filter((a) => a.status === 'completed')
      .reduce((sum, a) => sum + (Number(a.service_price) || 0), 0);

    const estimatedWeekRevenue = weekAppointments.reduce(
      (sum, a) => sum + (Number(a.service_price) || 0),
      0
    );

    res.json({
      today_total: todayAppointments.length,
      today_confirmed: confirmedToday,
      today_pending: pendingToday,
      week_total: weekAppointments.length,
      week_estimated_revenue: estimatedWeekRevenue,
      total_completed_revenue: totalRevenue,
      all_time_total: all.length,
      recent_appointments: all.slice(-10).reverse()
    });
  } catch (err) {
    console.error('Error fetching summary stats:', err);
    res.status(500).json({ error: 'Error al obtener estadísticas.' });
  }
});

// GET /api/appointments/lookup (Public: lookup appointments by phone for "Mis Turnos")
router.get('/lookup', (req, res) => {
  try {
    const { phone } = req.query;
    if (!phone || !phone.trim()) {
      return res.status(400).json({ error: 'Debe ingresar un número de teléfono para buscar.' });
    }

    const cleanPhone = phone.replace(/[^\d]/g, '');
    if (cleanPhone.length < 6) {
      return res.status(400).json({ error: 'Ingrese al menos 6 dígitos del número de teléfono.' });
    }

    const all = db.getAppointments();
    // Filter matching appointments flexibly (ignoring prefixes like 54, 9, 0, 15)
    const matching = all.filter((a) => {
      if (!a.client_phone) return false;
      const aClean = a.client_phone.replace(/[^\d]/g, '');
      return aClean.includes(cleanPhone) || cleanPhone.includes(aClean) || aClean.endsWith(cleanPhone) || cleanPhone.endsWith(aClean);
    });

    // Return safe public subset
    const safeResults = matching.map((a) => ({
      id: a.id,
      date: a.date,
      time: a.time,
      end_time: a.end_time,
      service_name: a.service_name,
      service_duration: a.service_duration,
      service_price: a.service_price,
      client_name: a.client_name,
      client_phone: a.client_phone,
      client_address: a.client_address,
      status: a.status,
      recurrence_rule: a.recurrence_rule,
      created_at: a.created_at
    }));

    res.json(safeResults);
  } catch (err) {
    console.error('Error looking up appointments:', err);
    res.status(500).json({ error: 'Error al buscar los turnos.' });
  }
});

// GET /api/appointments/:id
router.get('/:id', (req, res) => {
  try {
    const appointment = db.getAppointmentById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Turno no encontrado.' });
    }
    res.json(appointment);
  } catch (err) {
    res.status(500).json({ error: 'Error al buscar el turno.' });
  }
});

// PUT /api/appointments/:id (Admin: update appointment)
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const existing = db.getAppointmentById(id);
    if (!existing) {
      return res.status(404).json({ error: 'Turno no encontrado.' });
    }

    const updates = req.body;
    
    // If service changed, update duration and end_time
    if (updates.service_id && updates.service_id !== existing.service_id) {
      const srv = db.getServiceById(updates.service_id);
      if (srv) {
        updates.service_name = srv.name;
        updates.service_duration = srv.duration;
        updates.service_price = srv.price;
        if (updates.time || existing.time) {
          updates.end_time = addMinutesToTime(updates.time || existing.time, srv.duration);
        }
      }
    } else if (updates.time && !updates.end_time) {
      updates.end_time = addMinutesToTime(updates.time, existing.service_duration || 60);
    }

    const updated = db.updateAppointment(id, updates);
    res.json(updated);
  } catch (err) {
    console.error('Error updating appointment:', err);
    res.status(500).json({ error: 'Error al actualizar el turno.' });
  }
});

// DELETE /api/appointments/:id (Admin: delete appointment or entire series)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const { id } = req.params;
    const { delete_series } = req.query;

    const appointment = db.getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Turno no encontrado.' });
    }

    if (delete_series === 'true' && appointment.series_id) {
      db.deleteAppointmentSeries(appointment.series_id);
      return res.json({ success: true, message: 'Todos los turnos de la serie recurrente han sido eliminados.' });
    }

    const success = db.deleteAppointment(id);
    if (!success) {
      return res.status(404).json({ error: 'Turno no encontrado.' });
    }
    res.json({ success: true, message: 'Turno eliminado correctamente.' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar el turno.' });
  }
});

// POST /api/appointments/:id/send-whatsapp (Admin: manually send WhatsApp)
router.post('/:id/send-whatsapp', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { type = 'custom', customMessage } = req.body;

    const appointment = db.getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Turno no encontrado.' });
    }

    const result = await sendWhatsAppMessage({
      type,
      appointment,
      customMessage
    });

    res.json(result);
  } catch (err) {
    console.error('Error sending WhatsApp message:', err);
    res.status(500).json({ error: err.message || 'Error al enviar WhatsApp.' });
  }
});

// POST /api/appointments/:id/cancel (Public/Admin: cancel appointment)
router.post('/:id/cancel', async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = db.getAppointmentById(id);
    if (!appointment) {
      return res.status(404).json({ error: 'Turno no encontrado.' });
    }

    const updated = db.updateAppointment(id, {
      status: 'cancelled',
      cancellation_reason: reason || 'Cancelado por el usuario'
    });

    // Send cancellation WhatsApp notice
    try {
      await sendWhatsAppMessage({
        type: 'cancellation',
        appointment: updated
      });
    } catch (waErr) {
      console.warn('Error sending cancellation WhatsApp:', waErr.message);
    }

    res.json({ success: true, message: 'Turno cancelado exitosamente.', appointment: updated });
  } catch (err) {
    res.status(500).json({ error: 'Error al cancelar el turno.' });
  }
});

export default router;
