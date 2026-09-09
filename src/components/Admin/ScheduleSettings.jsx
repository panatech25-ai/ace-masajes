import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Clock, Calendar, Shield, Save, Plus, Trash2, CheckCircle2, AlertCircle, CheckSquare, Sun, Moon } from 'lucide-react';

const ALL_30MIN_SLOTS = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
  '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
  '20:00', '20:30', '21:00', '21:30'
];

export default function ScheduleSettings({ onRefresh }) {
  const [config, setConfig] = useState(null);
  const [blockedDates, setBlockedDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const [newBlocked, setNewBlocked] = useState({
    date: new Date().toISOString().split('T')[0],
    all_day: true,
    reason: 'Feriado / Receso'
  });

  const loadData = async () => {
    try {
      const data = await api.getSchedule();
      setConfig(data.config);
      setBlockedDates(data.blocked || []);
    } catch (err) {
      console.error('Error loading schedule:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDayChange = (index, field, value) => {
    const newDays = [...config.days];
    newDays[index] = { ...newDays[index], [field]: value };
    setConfig({ ...config, days: newDays });
  };

  const handleToggleSlot = (dayIndex, timeStr) => {
    const newDays = [...config.days];
    const currentSlots = Array.isArray(newDays[dayIndex].slots) ? newDays[dayIndex].slots : [];
    let updatedSlots;
    if (currentSlots.includes(timeStr)) {
      updatedSlots = currentSlots.filter((t) => t !== timeStr);
    } else {
      updatedSlots = [...currentSlots, timeStr].sort();
    }
    newDays[dayIndex] = { ...newDays[dayIndex], slots: updatedSlots };
    setConfig({ ...config, days: newDays });
  };

  const handleSetDaySlots = (dayIndex, newSlots) => {
    const newDays = [...config.days];
    newDays[dayIndex] = { ...newDays[dayIndex], slots: [...newSlots].sort() };
    setConfig({ ...config, days: newDays });
  };

  const handleSelectAllSlots = (dayIndex) => {
    handleSetDaySlots(dayIndex, ALL_30MIN_SLOTS);
  };

  const handleClearDaySlots = (dayIndex) => {
    handleSetDaySlots(dayIndex, []);
  };

  const handleSelectMorningSlots = (dayIndex) => {
    const morningSlots = ALL_30MIN_SLOTS.filter((t) => {
      const [h] = t.split(':').map(Number);
      return h < 13;
    });
    const current = config.days[dayIndex].slots || [];
    const merged = Array.from(new Set([...current, ...morningSlots]));
    handleSetDaySlots(dayIndex, merged);
  };

  const handleSelectAfternoonSlots = (dayIndex) => {
    const afternoonSlots = ALL_30MIN_SLOTS.filter((t) => {
      const [h] = t.split(':').map(Number);
      return h >= 13;
    });
    const current = config.days[dayIndex].slots || [];
    const merged = Array.from(new Set([...current, ...afternoonSlots]));
    handleSetDaySlots(dayIndex, merged);
  };

  const handleSelectAccordingToHours = (dayIndex) => {
    const day = config.days[dayIndex];
    const openParts = (day.open_time || '09:00').split(':').map(Number);
    const closeParts = (day.close_time || '20:00').split(':').map(Number);
    const openM = openParts[0] * 60 + openParts[1];
    const closeM = closeParts[0] * 60 + closeParts[1];

    let bStart = -1, bEnd = -1;
    if (day.has_break && day.break_start && day.break_end) {
      const bs = day.break_start.split(':').map(Number);
      const be = day.break_end.split(':').map(Number);
      bStart = bs[0] * 60 + bs[1];
      bEnd = be[0] * 60 + be[1];
    }

    const calculated = ALL_30MIN_SLOTS.filter((t) => {
      const [h, m] = t.split(':').map(Number);
      const slotM = h * 60 + m;
      if (slotM < openM || slotM > closeM - 30) return false;
      if (bStart !== -1 && bEnd !== -1 && slotM < bEnd && (slotM + 30) > bStart) {
        return false;
      }
      return true;
    });
    handleSetDaySlots(dayIndex, calculated);
  };

  const handleGeneralChange = (field, value) => {
    setConfig({ ...config, [field]: parseInt(value, 10) || 0 });
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(null);
    try {
      await api.updateScheduleConfig(config);
      setSuccessMsg('Horarios y disponibilidad guardados con éxito.');
      setTimeout(() => setSuccessMsg(null), 3000);
      if (onRefresh) onRefresh();
    } catch (err) {
      alert('Error al guardar: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddBlocked = async (e) => {
    e.preventDefault();
    try {
      await api.addBlockedDate(newBlocked);
      loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleDeleteBlocked = async (id) => {
    try {
      await api.deleteBlockedDate(id);
      loadData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  if (loading || !config) {
    return <div className="p-8 text-center text-xs text-stone-500">Cargando configuración de horarios...</div>;
  }

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-stone-900 font-serif-luxury">
            Horarios de Atención y Disponibilidad
          </h3>
          <p className="text-xs text-stone-500">
            Define los días de apertura, intervalos de descanso y bloqueo de feriados
          </p>
        </div>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-semibold flex items-center gap-2 border border-emerald-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          {successMsg}
        </div>
      )}

      {/* Form of Hours by Day */}
      <form onSubmit={handleSaveConfig} className="space-y-6">
        
        {/* General Buffer & Advance Settings */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs">
          <h4 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-spa-700" />
            Parámetros de Turnos y Descansos
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Tiempo de descanso entre sesiones (minutos)
              </label>
              <input
                type="number"
                value={config.buffer_between_slots}
                onChange={(e) => handleGeneralChange('buffer_between_slots', e.target.value)}
                min="0"
                step="5"
                className="w-full p-2.5 rounded-xl border border-stone-200 font-medium focus:outline-hidden"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Tiempo para higienizar camilla y ventilar el espacio.
              </p>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Anticipación mínima para reservar (horas)
              </label>
              <input
                type="number"
                value={config.min_advance_hours}
                onChange={(e) => handleGeneralChange('min_advance_hours', e.target.value)}
                min="0"
                className="w-full p-2.5 rounded-xl border border-stone-200 font-medium focus:outline-hidden"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Evita reservas de último minuto.
              </p>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                Días de anticipación máxima
              </label>
              <input
                type="number"
                value={config.max_advance_days}
                onChange={(e) => handleGeneralChange('max_advance_days', e.target.value)}
                min="1"
                className="w-full p-2.5 rounded-xl border border-stone-200 font-medium focus:outline-hidden"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                Límite de días visibles en el calendario.
              </p>
            </div>
          </div>
        </div>

        {/* Days of Week Table */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs space-y-4">
          <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-spa-700" />
            Días y Horarios Semanales
          </h4>

          <div className="space-y-4">
            {config.days.map((day, idx) => {
              const activeSlotsCount = day.slots?.length || 0;
              return (
                <div
                  key={day.day_of_week}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-4 ${
                    day.is_working
                      ? 'bg-white border-stone-200/90 shadow-2xs'
                      : 'bg-stone-50 border-stone-200/60 opacity-60'
                  }`}
                >
                  {/* Day Header & Operating Hours */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-3 min-w-[170px]">
                      <input
                        type="checkbox"
                        checked={day.is_working}
                        onChange={(e) => handleDayChange(idx, 'is_working', e.target.checked)}
                        className="w-4 h-4 rounded text-spa-700 cursor-pointer"
                        id={`day-${day.day_of_week}`}
                      />
                      <label htmlFor={`day-${day.day_of_week}`} className="font-bold text-stone-900 cursor-pointer text-sm">
                        {day.day_name}
                      </label>
                      {day.is_working && (
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          activeSlotsCount > 0 ? 'bg-spa-100 text-spa-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {activeSlotsCount} {activeSlotsCount === 1 ? 'turno' : 'turnos'}
                        </span>
                      )}
                    </div>

                    {day.is_working ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          <span className="text-stone-500 font-medium">De</span>
                          <input
                            type="time"
                            value={day.open_time}
                            onChange={(e) => handleDayChange(idx, 'open_time', e.target.value)}
                            className="px-2 py-1.5 rounded-lg border border-stone-200 bg-white font-medium"
                          />
                          <span className="text-stone-500 font-medium">a</span>
                          <input
                            type="time"
                            value={day.close_time}
                            onChange={(e) => handleDayChange(idx, 'close_time', e.target.value)}
                            className="px-2 py-1.5 rounded-lg border border-stone-200 bg-white font-medium"
                          />
                        </div>

                        <div className="h-4 w-px bg-stone-300 hidden sm:block" />

                        <div className="flex items-center gap-2">
                          <label className="flex items-center gap-1 cursor-pointer text-stone-600">
                            <input
                              type="checkbox"
                              checked={day.has_break}
                              onChange={(e) => handleDayChange(idx, 'has_break', e.target.checked)}
                              className="w-3.5 h-3.5 rounded text-spa-700"
                            />
                            <span>Pausa</span>
                          </label>

                          {day.has_break && (
                            <div className="flex items-center gap-1">
                              <input
                                type="time"
                                value={day.break_start}
                                onChange={(e) => handleDayChange(idx, 'break_start', e.target.value)}
                                className="px-2 py-1 rounded-lg border border-stone-200 bg-white text-[11px]"
                              />
                              <span className="text-stone-400">-</span>
                              <input
                                type="time"
                                value={day.break_end}
                                onChange={(e) => handleDayChange(idx, 'break_end', e.target.value)}
                                className="px-2 py-1 rounded-lg border border-stone-200 bg-white text-[11px]"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-stone-400">
                        Cerrado todo el día
                      </span>
                    )}
                  </div>

                  {/* 30-minute Slots Selection Grid */}
                  {day.is_working && (
                    <div className="pt-3 border-t border-stone-100 space-y-2.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-semibold text-stone-700 flex items-center gap-1.5">
                          <CheckSquare className="w-3.5 h-3.5 text-spa-700" />
                          Seleccionar turnos de 30 min para ofrecer a clientes:
                        </span>
                        <div className="flex flex-wrap items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleSelectAllSlots(idx)}
                            className="px-2 py-1 text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors"
                            title="Seleccionar todos los 28 turnos posibles"
                          >
                            Todos
                          </button>
                          <button
                            type="button"
                            onClick={() => handleClearDaySlots(idx)}
                            className="px-2 py-1 text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors"
                            title="Deseleccionar todos"
                          >
                            Ninguno
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectMorningSlots(idx)}
                            className="px-2 py-1 text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors flex items-center gap-1"
                            title="Agregar turnos de 08:00 a 12:30"
                          >
                            <Sun className="w-3 h-3 text-amber-500" />
                            Mañana
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectAfternoonSlots(idx)}
                            className="px-2 py-1 text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-md transition-colors flex items-center gap-1"
                            title="Agregar turnos de 13:00 a 21:30"
                          >
                            <Moon className="w-3 h-3 text-indigo-500" />
                            Tarde
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectAccordingToHours(idx)}
                            className="px-2 py-1 text-[11px] font-medium bg-spa-100 hover:bg-spa-200 text-spa-900 rounded-md transition-colors flex items-center gap-1"
                            title="Calcular según el horario De/A y pausa almuerzo"
                          >
                            <Clock className="w-3 h-3 text-spa-700" />
                            Según Horario
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 sm:grid-cols-7 md:grid-cols-14 gap-1.5">
                        {ALL_30MIN_SLOTS.map((slot) => {
                          const isChecked = (day.slots || []).includes(slot);
                          return (
                            <label
                              key={slot}
                              className={`px-1.5 py-1.5 rounded-lg border text-[11px] cursor-pointer select-none transition-all flex items-center justify-center gap-1 ${
                                isChecked
                                  ? 'bg-spa-50 border-spa-400 text-spa-900 font-bold shadow-2xs'
                                  : 'bg-stone-50/50 border-stone-200 text-stone-400 hover:bg-white hover:text-stone-600'
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isChecked}
                                onChange={() => handleToggleSlot(idx, slot)}
                                className="w-3 h-3 rounded text-spa-700 focus:ring-spa-600 border-stone-300 cursor-pointer"
                              />
                              <span>{slot}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-3 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 rounded-xl bg-spa-800 hover:bg-spa-900 text-white font-bold text-xs shadow-xs flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Guardar Configuración de Horarios
            </button>
          </div>
        </div>
      </form>

      {/* Blocked Dates & Holidays */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs space-y-4">
        <h4 className="text-sm font-bold text-stone-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-spa-700" />
          Bloqueo de Feriados, Vacaciones o Días Especiales
        </h4>

        {/* Add Block Form */}
        <form onSubmit={handleAddBlocked} className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs">
          <div className="flex items-center gap-2">
            <label className="font-bold text-stone-700">Fecha a bloquear:</label>
            <input
              type="date"
              value={newBlocked.date}
              onChange={(e) => setNewBlocked({ ...newBlocked, date: e.target.value })}
              required
              className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white font-medium"
            />
          </div>

          <div className="flex items-center gap-2">
            <label className="font-bold text-stone-700">Motivo:</label>
            <input
              type="text"
              value={newBlocked.reason}
              onChange={(e) => setNewBlocked({ ...newBlocked, reason: e.target.value })}
              placeholder="Ej: Feriado Nacional"
              className="px-3 py-1.5 rounded-lg border border-stone-200 bg-white font-medium"
            />
          </div>

          <button
            type="submit"
            className="px-4 py-1.5 rounded-lg bg-spa-800 text-white font-bold hover:bg-spa-900 flex items-center gap-1 ml-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            Bloquear Fecha
          </button>
        </form>

        {/* List of blocked dates */}
        {blockedDates.length > 0 && (
          <div className="space-y-2 pt-2">
            {blockedDates.map((b) => (
              <div
                key={b.id}
                className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-amber-700" />
                  <span className="font-bold text-stone-900">{b.date}</span>
                  <span className="text-stone-600">— {b.reason}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteBlocked(b.id)}
                  className="p-1.5 text-stone-400 hover:text-red-600 rounded"
                  title="Desbloquear"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
