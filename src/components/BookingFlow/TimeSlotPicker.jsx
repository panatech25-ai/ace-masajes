import React from 'react';
import { Clock, Sun, Moon, AlertCircle, Loader2 } from 'lucide-react';

export default function TimeSlotPicker({
  selectedTime,
  onSelectTime,
  availability,
  loading,
  selectedDateFriendly
}) {
  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center space-y-3">
        <Loader2 className="w-8 h-8 text-spa-600 animate-spin" />
        <p className="text-sm font-medium text-stone-600">
          Consultando disponibilidad en tiempo real...
        </p>
      </div>
    );
  }

  if (!availability || !availability.is_working) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h4 className="text-lg font-bold text-stone-900 font-serif-luxury">
          Día No Disponible
        </h4>
        <p className="text-sm text-stone-600 max-w-xs">
          {availability?.reason || 'El establecimiento no atiende en la fecha seleccionada. Por favor elija otro día.'}
        </p>
      </div>
    );
  }

  const slots = availability.slots || [];

  if (slots.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-stone-200/80 shadow-sm flex flex-col items-center justify-center min-h-[300px] text-center space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center">
          <Clock className="w-6 h-6" />
        </div>
        <h4 className="text-lg font-bold text-stone-900 font-serif-luxury">
          Horarios Agotados
        </h4>
        <p className="text-sm text-stone-600 max-w-xs">
          No quedan turnos disponibles para este día. Por favor seleccione otra fecha en el calendario.
        </p>
      </div>
    );
  }

  // Split into Morning (< 13:00) and Afternoon (>= 13:00)
  const morningSlots = slots.filter((s) => parseInt(s.time.split(':')[0], 10) < 13);
  const afternoonSlots = slots.filter((s) => parseInt(s.time.split(':')[0], 10) >= 13);

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
        <div>
          <h4 className="text-base font-bold text-stone-900">
            Horarios Disponibles
          </h4>
          <p className="text-xs text-stone-500 capitalize">
            {selectedDateFriendly}
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-spa-100 text-spa-800">
          {slots.length} turnos libres
        </span>
      </div>

      {/* Morning Slots */}
      {morningSlots.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
            <Sun className="w-4 h-4 text-amber-500" />
            Turno Mañana
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {morningSlots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              return (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => onSelectTime(slot.time)}
                  className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-spa-800 text-white shadow-md shadow-spa-900/20 scale-105'
                      : 'bg-stone-50 hover:bg-spa-50 text-stone-800 hover:text-spa-900 border border-stone-200/80 hover:border-spa-300'
                  }`}
                >
                  <span>{slot.time} hs</span>
                  <span className={`text-[10px] font-normal ${isSelected ? 'text-spa-200' : 'text-stone-400'}`}>
                    hasta {slot.endTime}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Afternoon Slots */}
      {afternoonSlots.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-500 uppercase tracking-wider">
            <Moon className="w-4 h-4 text-spa-600" />
            Turno Tarde / Noche
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
            {afternoonSlots.map((slot) => {
              const isSelected = selectedTime === slot.time;
              return (
                <button
                  key={slot.time}
                  type="button"
                  onClick={() => onSelectTime(slot.time)}
                  className={`py-2.5 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex flex-col items-center justify-center ${
                    isSelected
                      ? 'bg-spa-800 text-white shadow-md shadow-spa-900/20 scale-105'
                      : 'bg-stone-50 hover:bg-spa-50 text-stone-800 hover:text-spa-900 border border-stone-200/80 hover:border-spa-300'
                  }`}
                >
                  <span>{slot.time} hs</span>
                  <span className={`text-[10px] font-normal ${isSelected ? 'text-spa-200' : 'text-stone-400'}`}>
                    hasta {slot.endTime}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
