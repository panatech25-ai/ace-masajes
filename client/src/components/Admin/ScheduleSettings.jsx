import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import { Clock, Calendar, Shield, Save, Plus, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';

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

          <div className="space-y-3">
            {config.days.map((day, idx) => (
              <div
                key={day.day_of_week}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
                  day.is_working
                    ? 'bg-stone-50/60 border-stone-200'
                    : 'bg-stone-100/40 border-stone-200/60 opacity-60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-[130px]">
                  <input
                    type="checkbox"
                    checked={day.is_working}
                    onChange={(e) => handleDayChange(idx, 'is_working', e.target.checked)}
                    className="w-4 h-4 rounded text-spa-700"
                    id={`day-${day.day_of_week}`}
                  />
                  <label htmlFor={`day-${day.day_of_week}`} className="font-bold text-stone-900 cursor-pointer text-sm">
                    {day.day_name}
                  </label>
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
                        <span>Pausa almuerzo</span>
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
            ))}
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
