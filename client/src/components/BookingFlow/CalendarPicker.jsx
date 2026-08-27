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
  isBefore,
  startOfToday,
  isAfter
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Zap } from 'lucide-react';

export default function CalendarPicker({ selectedDate, onSelectDate }) {
  const today = startOfToday();
  const [currentMonth, setCurrentMonth] = useState(today);

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => {
    if (!isSameMonth(currentMonth, today)) {
      setCurrentMonth(subMonths(currentMonth, 1));
    }
  };

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // Monday start
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

  const rows = [];
  let days = [];
  let day = startDate;

  // Selected date as Date object
  const selectedDateObj = selectedDate ? new Date(selectedDate + 'T00:00:00') : null;

  while (day <= endDate) {
    for (let i = 0; i < 7; i++) {
      const cloneDay = day;
      const isPast = isBefore(cloneDay, today);
      const isCurrentMonth = isSameMonth(cloneDay, monthStart);
      const isSelected = selectedDateObj && isSameDay(cloneDay, selectedDateObj);
      const isDayToday = isSameDay(cloneDay, today);

      days.push(
        <button
          key={cloneDay.toISOString()}
          type="button"
          disabled={isPast}
          onClick={() => {
            if (!isPast) {
              onSelectDate(format(cloneDay, 'yyyy-MM-dd'));
            }
          }}
          className={`h-11 sm:h-12 w-full rounded-xl flex flex-col items-center justify-center text-xs sm:text-sm font-medium transition-all relative ${
            isPast
              ? 'text-stone-300 cursor-not-allowed bg-transparent'
              : isSelected
              ? 'bg-spa-800 text-white font-bold shadow-md shadow-spa-900/20 scale-105 z-10'
              : isDayToday
              ? 'bg-spa-100 text-spa-950 font-bold border border-spa-300 hover:bg-spa-200'
              : !isCurrentMonth
              ? 'text-stone-400 hover:bg-stone-100'
              : 'text-stone-800 hover:bg-spa-50 hover:text-spa-800'
          }`}
        >
          <span>{format(cloneDay, 'd')}</span>
          {isDayToday && !isSelected && (
            <span className="w-1.5 h-1.5 rounded-full bg-spa-600 absolute bottom-1.5" />
          )}
        </button>
      );
      day = addDays(day, 1);
    }
    rows.push(
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5" key={day.toISOString()}>
        {days}
      </div>
    );
    days = [];
  }

  // Quick select helper dates
  const tomorrow = addDays(today, 1);
  const dayAfterTomorrow = addDays(today, 2);

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200/80 shadow-sm space-y-4">
      {/* Quick Date Shortcuts */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <span className="text-xs font-semibold text-stone-400 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
          <Zap className="w-3.5 h-3.5 text-gold-500" />
          Directo:
        </span>
        <button
          type="button"
          onClick={() => {
            onSelectDate(format(today, 'yyyy-MM-dd'));
            setCurrentMonth(today);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
            selectedDate === format(today, 'yyyy-MM-dd')
              ? 'bg-spa-800 text-white'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          Hoy
        </button>
        <button
          type="button"
          onClick={() => {
            onSelectDate(format(tomorrow, 'yyyy-MM-dd'));
            setCurrentMonth(tomorrow);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
            selectedDate === format(tomorrow, 'yyyy-MM-dd')
              ? 'bg-spa-800 text-white'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          Mañana
        </button>
        <button
          type="button"
          onClick={() => {
            onSelectDate(format(dayAfterTomorrow, 'yyyy-MM-dd'));
            setCurrentMonth(dayAfterTomorrow);
          }}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
            selectedDate === format(dayAfterTomorrow, 'yyyy-MM-dd')
              ? 'bg-spa-800 text-white'
              : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
          }`}
        >
          Pasado Mañana
        </button>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-2">
          <CalendarIcon className="w-5 h-5 text-spa-700" />
          <h3 className="text-lg font-bold text-stone-800 capitalize font-serif-luxury">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h3>
        </div>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={prevMonth}
            disabled={isSameMonth(currentMonth, today)}
            className="p-2 rounded-xl text-stone-600 hover:bg-stone-100 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5" />
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
      <div className="grid grid-cols-7 gap-1 text-center border-b border-stone-100 pb-2">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d, i) => (
          <div key={i} className="text-[11px] sm:text-xs font-bold text-stone-400 uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="space-y-1">{rows}</div>
    </div>
  );
}
