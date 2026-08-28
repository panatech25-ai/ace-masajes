import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import {
  X,
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  MessageSquare,
  Shield,
  Loader2,
  Sparkles,
  Trash2,
  Repeat,
  Info,
  Check
} from 'lucide-react';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { es } from 'date-fns/locale';

export default function AppointmentModal({
  isOpen,
  onClose,
  appointment, // if provided, we are editing; if null, creating new
  services,
  onSaved,
  onDelete
}) {
  const [formData, setFormData] = useState({
    service_id: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    client_name: '',
    client_address: '',
    client_phone: '',
    client_notes: '',
    status: 'confirmed'
  });

  // Recurrence state (for new appointments)
  const [recurrence, setRecurrence] = useState({
    enabled: false,
    type: 'weekly', // 'weekly' | 'biweekly' | 'monthly' | 'custom_days'
    count: 4, // 4 sessions by default
    interval: 1 // interval for weeks or custom days
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteChoiceOpen, setDeleteChoiceOpen] = useState(false);

  useEffect(() => {
    if (appointment) {
      setFormData({
        service_id: appointment.service_id || '',
        date: appointment.date || new Date().toISOString().split('T')[0],
        time: appointment.time || '10:00',
        client_name: appointment.client_name || '',
        client_address: appointment.client_address || '',
        client_phone: appointment.client_phone || '',
        client_notes: appointment.client_notes || '',
        status: appointment.status || 'confirmed'
      });
      setRecurrence({ enabled: false, type: 'weekly', count: 4, interval: 1 });
    } else {
      setFormData({
        service_id: services[0]?.id || '',
        date: new Date().toISOString().split('T')[0],
        time: '10:00',
        client_name: '',
        client_address: '',
        client_phone: '',
        client_notes: '',
        status: 'confirmed'
      });
      setRecurrence({ enabled: false, type: 'weekly', count: 4, interval: 1 });
    }
    setDeleteChoiceOpen(false);
  }, [appointment, services, isOpen]);

  if (!isOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // Preview generated dates for recurrence
  const getRecurringDatesPreview = () => {
    if (!recurrence.enabled || !formData.date) return [];
    const count = parseInt(recurrence.count, 10) || 1;
    const [y, m, d] = formData.date.split('-').map(Number);
    const startDate = new Date(y, m - 1, d);

    const dates = [];
    for (let i = 0; i < count; i++) {
      let targetDate;
      if (recurrence.type === 'weekly') {
        targetDate = addWeeks(startDate, i * (parseInt(recurrence.interval, 10) || 1));
      } else if (recurrence.type === 'biweekly') {
        targetDate = addWeeks(startDate, i * 2);
      } else if (recurrence.type === 'monthly') {
        targetDate = addMonths(startDate, i * (parseInt(recurrence.interval, 10) || 1));
      } else if (recurrence.type === 'custom_days') {
        const step = parseInt(recurrence.interval, 10) || 7;
        targetDate = addDays(startDate, i * step);
      } else {
        targetDate = addWeeks(startDate, i);
      }

      dates.push({
        dateStr: format(targetDate, 'yyyy-MM-dd'),
        friendly: format(targetDate, "EEEE d 'de' MMMM", { locale: es })
      });
    }
    return dates;
  };

  const previewDates = getRecurringDatesPreview();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (appointment) {
        // Update existing
        await api.updateAppointment(appointment.id, formData);
      } else {
        // Create new manual appointment (with recurrence if enabled)
        await api.createAppointment({
          ...formData,
          source: 'admin',
          recurrence: recurrence.enabled ? recurrence : null
        });
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err.message || 'Error al guardar el turno.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (deleteSeries = false) => {
    if (onDelete && appointment) {
      onDelete(appointment.id, deleteSeries);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-100 relative animate-scale-in max-h-[92vh] overflow-y-auto">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-spa-100 text-spa-800 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900 font-serif-luxury">
              {appointment ? 'Modificar Turno' : 'Nuevo Turno Manual'}
            </h3>
            <p className="text-xs text-stone-500">
              {appointment
                ? `Editando turno de ${appointment.client_name} ${appointment.recurrence_rule ? `• ${appointment.recurrence_rule}` : ''}`
                : 'Registra un turno o plan recurrente por llamada o presencial'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-800 text-xs font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Service Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Servicio de Masaje
            </label>
            <select
              value={formData.service_id}
              onChange={(e) => handleChange('service_id', e.target.value)}
              required
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 text-sm font-medium focus:outline-hidden focus:border-spa-600 focus:ring-2 focus:ring-spa-100 bg-white"
            >
              {services.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.duration} min - ${Number(s.price).toLocaleString('es-AR')})
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Fecha {recurrence.enabled ? '(Fecha de inicio)' : ''}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm font-medium focus:outline-hidden focus:border-spa-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Horario (HH:MM)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Clock className="w-4 h-4" />
                </div>
                <input
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm font-medium focus:outline-hidden focus:border-spa-600"
                />
              </div>
            </div>
          </div>

          {/* RECURRENCE SECTION (When creating a new appointment) */}
          {!appointment && (
            <div className="p-4 rounded-2xl bg-spa-50/70 border border-spa-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={recurrence.enabled}
                    onChange={(e) => setRecurrence({ ...recurrence, enabled: e.target.checked })}
                    className="w-4 h-4 rounded text-spa-700 focus:ring-spa-500"
                  />
                  <span className="text-xs font-bold text-spa-950 flex items-center gap-1.5">
                    <Repeat className="w-3.5 h-3.5 text-spa-700" />
                    Repetir turno periódicamente (Semanal, Mensual o personalizado)
                  </span>
                </label>
              </div>

              {recurrence.enabled && (
                <div className="space-y-3 pt-2 border-t border-spa-200/60 text-xs">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Frecuencia de repetición
                      </label>
                      <select
                        value={recurrence.type}
                        onChange={(e) => setRecurrence({ ...recurrence, type: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-medium focus:outline-hidden focus:border-spa-600"
                      >
                        <option value="weekly">Semanal (mismo día de cada semana)</option>
                        <option value="biweekly">Quincenal (cada 2 semanas)</option>
                        <option value="monthly">Mensual (mismo día de cada mes)</option>
                        <option value="custom_days">Cada X días</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Cantidad de sesiones
                      </label>
                      <select
                        value={recurrence.count}
                        onChange={(e) => setRecurrence({ ...recurrence, count: parseInt(e.target.value, 10) })}
                        className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-white font-medium focus:outline-hidden focus:border-spa-600"
                      >
                        <option value="2">2 sesiones</option>
                        <option value="4">4 sesiones (1 mes aprox.)</option>
                        <option value="8">8 sesiones (2 meses aprox.)</option>
                        <option value="12">12 sesiones (3 meses aprox.)</option>
                        <option value="16">16 sesiones (4 meses aprox.)</option>
                      </select>
                    </div>
                  </div>

                  {recurrence.type === 'custom_days' && (
                    <div>
                      <label className="block font-bold text-stone-700 mb-1">
                        Repetir cada cuántos días:
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="90"
                        value={recurrence.interval}
                        onChange={(e) => setRecurrence({ ...recurrence, interval: e.target.value })}
                        className="w-full p-2 rounded-xl border border-stone-200 bg-white font-medium"
                      />
                    </div>
                  )}

                  {/* Dates preview */}
                  <div className="bg-white/80 p-3 rounded-xl border border-spa-200 space-y-1">
                    <span className="text-[11px] font-bold text-spa-900 block">
                      🗓️ Fechas a reservar ({previewDates.length} turnos a las {formData.time} hs):
                    </span>
                    <div className="max-h-28 overflow-y-auto space-y-0.5 text-[11px] text-stone-600">
                      {previewDates.map((p, idx) => (
                        <div key={idx} className="flex items-center gap-1.5 capitalize">
                          <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                          <strong className="text-stone-800">Sesión {idx + 1}:</strong> {p.friendly} ({p.dateStr})
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Client Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Nombre y Apellido
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={formData.client_name}
                  onChange={(e) => handleChange('client_name', e.target.value)}
                  placeholder="Ej: Marcelo Ruiz"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm font-medium focus:outline-hidden focus:border-spa-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Teléfono / WhatsApp
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-emerald-600">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={formData.client_phone}
                  onChange={(e) => handleChange('client_phone', e.target.value)}
                  placeholder="11 5555 1234"
                  required
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm font-medium focus:outline-hidden focus:border-spa-600"
                />
              </div>
            </div>
          </div>

          {/* Client Address */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Dirección
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={formData.client_address}
                onChange={(e) => handleChange('client_address', e.target.value)}
                placeholder="Ej: Av. Callao 1520"
                required
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-stone-200 text-sm font-medium focus:outline-hidden focus:border-spa-600"
              />
            </div>
          </div>

          {/* Status & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Estado del Turno
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleChange('status', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm font-medium focus:outline-hidden focus:border-spa-600 bg-white"
              >
                <option value="confirmed">Confirmado</option>
                <option value="pending">Pendiente</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                Observaciones
              </label>
              <input
                type="text"
                value={formData.client_notes}
                onChange={(e) => handleChange('client_notes', e.target.value)}
                placeholder="Preferencias o dolencias..."
                className="w-full px-3 py-2.5 rounded-xl border border-stone-200 text-sm font-medium focus:outline-hidden focus:border-spa-600"
              />
            </div>
          </div>

          {/* Delete Options Dialog (if part of recurring series) */}
          {deleteChoiceOpen && appointment?.series_id && (
            <div className="p-4 rounded-2xl bg-red-50 border border-red-200 space-y-2 text-xs">
              <strong className="text-red-900 block font-bold">
                Este turno forma parte de una serie recurrente ({appointment.recurrence_rule || 'Recurrente'}).
              </strong>
              <p className="text-red-700">¿Qué deseas eliminar?</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => handleDelete(false)}
                  className="px-3 py-1.5 rounded-lg bg-red-600 text-white font-bold hover:bg-red-700"
                >
                  Eliminar solo este turno individual
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(true)}
                  className="px-3 py-1.5 rounded-lg bg-red-800 text-white font-bold hover:bg-red-900"
                >
                  Eliminar TODOS los turnos de la serie
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteChoiceOpen(false)}
                  className="px-3 py-1.5 rounded-lg bg-stone-200 text-stone-700 font-bold hover:bg-stone-300"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 border-t border-stone-100 flex items-center justify-between">
            {appointment && onDelete && !deleteChoiceOpen ? (
              <button
                type="button"
                onClick={() => {
                  if (appointment.series_id) {
                    setDeleteChoiceOpen(true);
                  } else {
                    handleDelete(false);
                  }
                }}
                className="text-red-600 hover:text-red-800 text-xs font-bold flex items-center gap-1.5 p-2 rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar Turno
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-bold transition-all"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 rounded-xl bg-spa-800 hover:bg-spa-900 text-white text-xs font-bold shadow-md shadow-spa-900/10 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {appointment
                  ? 'Guardar Cambios'
                  : recurrence.enabled
                  ? `Agendar ${recurrence.count} Turnos Recurrentes`
                  : 'Crear Turno'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
