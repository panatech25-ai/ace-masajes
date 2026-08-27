import React, { useState } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
  isToday
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, User, Plus } from 'lucide-react';

export default function AppointmentsCalendar({
  appointments,
  onEditAppointment,
  onNewAppointmentAtDate
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const rows = [];
  let days = [];
  let day = startDate;

  // Group appointments by date 'YYYY-MM-DD'
  const appointmentsByDate = {};
  for (const app of appointments) {
    if (!appointmentsByDate[app.date]) {
      appointmentsByDate[app.date] = [];
    }
    appointmentsByDate[app.date].push(app);
  }

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const dateKey = format(cloneDay, 'yyyy-MM-dd');
      const isCurrentMonth = isSameMonth(cloneDay, monthStart);
      const isDayToday = isToday(cloneDay);
      const dayAppointments = appointmentsByDate[dateKey] || [];

      days.push(
        <div
          key={cloneDay.toISOString()}
          className={`min-h-[110px] sm:min-h-[130px] p-1.5 sm:p-2 border-b border-r border-stone-200/80 flex flex-col transition-colors ${
            !isCurrentMonth
              ? 'bg-stone-50/50 text-stone-400'
              : isDayToday
              ? 'bg-spa-50/30'
              : 'bg-white'
          }`}
        >
          {/* Day Number Header & Quick Add */}
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                isDayToday
                  ? 'bg-spa-800 text-white shadow-xs'
                  : 'text-stone-700'
              }`}
            >
              {format(cloneDay, 'd')}
            </span>

            {isCurrentMonth && (
              <button
                type="button"
                onClick={() => onNewAppointmentAtDate(dateKey)}
                className="opacity-0 group-hover:opacity-100 hover:opacity-100 p-1 text-stone-400 hover:text-spa-800 rounded transition-opacity"
                title="Agregar turno"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* List of appointments */}
          <div className="space-y-1 overflow-y-auto max-h-[85px] pr-0.5">
            {dayAppointments.map((app) => (
              <button
                key={app.id}
                type="button"
                onClick={() => onEditAppointment(app)}
                className={`w-full text-left p-1 sm:p-1.5 rounded-lg text-[10px] sm:text-xs font-semibold truncate transition-all block ${
                  app.status === 'confirmed'
                    ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200 border-l-2 border-emerald-600'
                    : app.status === 'completed'
                    ? 'bg-blue-100 text-blue-900 hover:bg-blue-200 border-l-2 border-blue-600'
                    : app.status === 'cancelled'
                    ? 'bg-stone-200 text-stone-500 line-through'
                    : 'bg-amber-100 text-amber-900 hover:bg-amber-200 border-l-2 border-amber-600'
                }`}
              >
                <div className="font-bold flex items-center gap-1">
                  <span>{app.time}</span>
                  <span className="truncate">{app.client_name}</span>
                  {app.recurrence_rule && <span className="text-[9px] shrink-0">🔄</span>}
                </div>
                <div className="text-[9px] font-normal text-stone-600 truncate hidden sm:block">
                  {app.service_name} {app.recurrence_rule && `(${app.recurrence_index}/${app.recurrence_total})`}
                </div>
              </button>
            ))}
          </div>
        </div>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7" key={day.toISOString()}>
        {days}
      </div>
    );
    days = [];
  }

  return (
    <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
      {/* Month Navigation */}
      <div className="p-4 sm:p-6 border-b border-stone-200 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-spa-700" />
          <h3 className="text-xl font-bold text-stone-900 capitalize font-serif-luxury">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h3>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={prevMonth}
            className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-all"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentMonth(new Date())}
            className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-700 transition-all"
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={nextMonth}
            className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 transition-all"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center bg-stone-50 border-b border-stone-200 py-2.5">
        {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((d, i) => (
          <div key={i} className="text-xs font-bold text-stone-500 uppercase tracking-wider">
            <span className="hidden sm:inline">{d}</span>
            <span className="sm:hidden">{d.slice(0, 1)}</span>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="border-l border-t border-stone-200/80">{rows}</div>
    </div>
  );
}
