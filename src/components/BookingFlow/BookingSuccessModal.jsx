import React, { useState } from 'react';
import { CheckCircle2, Copy, Check, Calendar, Clock, MapPin, Sparkles, User, RefreshCw, X, MessageSquare } from 'lucide-react';

export default function BookingSuccessModal({
  appointment,
  onClose,
  onReset
}) {
  const [copiedPhone, setCopiedPhone] = useState(false);

  if (!appointment) return null;

  // Format friendly date
  const [year, month, day] = appointment.date.split('-').map(Number);
  const dateObj = new Date(year, month - 1, day);
  const friendlyDate = dateObj.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const businessPhone = '+54 9 341 514-8958';

  const handleCopyPhone = () => {
    navigator.clipboard.writeText('+5493415148958');
    setCopiedPhone(true);
    setTimeout(() => setCopiedPhone(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-100 relative animate-scale-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-3 mb-6">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div>
            <span className="text-xs uppercase tracking-widest text-spa-600 font-bold">
              ¡Turno Registrado con Éxito!
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900 mt-1">
              Tu reserva en ACE Masajes está agendada
            </h2>
            <p className="text-xs sm:text-sm text-stone-500 font-medium">
              Alma, Cuerpo, Espíritu
            </p>
          </div>
        </div>

        {/* Details Card */}
        <div className="bg-stone-50 rounded-2xl p-5 border border-stone-200/80 space-y-3 text-sm">
          <div className="flex items-center justify-between border-b border-stone-200/60 pb-2.5">
            <div className="flex items-center gap-2 text-stone-600">
              <User className="w-4 h-4 text-spa-700" />
              <span className="font-semibold text-stone-800">{appointment.client_name}</span>
            </div>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
              Turno Agendado
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="flex items-center gap-2 text-stone-700">
              <Sparkles className="w-4 h-4 text-gold-500 shrink-0" />
              <div>
                <span className="text-[11px] text-stone-400 block">Servicio</span>
                <span className="font-bold text-xs sm:text-sm text-stone-900">
                  {appointment.service_name}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-stone-700">
              <Clock className="w-4 h-4 text-spa-600 shrink-0" />
              <div>
                <span className="text-[11px] text-stone-400 block">Horario</span>
                <span className="font-bold text-xs sm:text-sm text-stone-900">
                  {appointment.time} hs ({appointment.service_duration} min)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-stone-700 sm:col-span-2">
              <Calendar className="w-4 h-4 text-spa-600 shrink-0" />
              <div>
                <span className="text-[11px] text-stone-400 block">Fecha</span>
                <span className="font-bold text-xs sm:text-sm text-stone-900 capitalize">
                  {friendlyDate}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-stone-700 sm:col-span-2">
              <MapPin className="w-4 h-4 text-spa-600 shrink-0" />
              <div>
                <span className="text-[11px] text-stone-400 block">Dirección registrada</span>
                <span className="font-medium text-xs sm:text-sm text-stone-800">
                  {appointment.client_address || 'Dirección no especificada'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Informative WhatsApp Notice (No direct opening) */}
        <div className="mt-6 space-y-3">
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/90 space-y-2">
            <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-950">
              <MessageSquare className="w-4.5 h-4.5 text-amber-700 shrink-0" />
              <span>Paso final: Envío del comprobante de seña ($10.000)</span>
            </div>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              Para dejar asegurado tu lugar, por favor realiza la transferencia bancaria y envía el comprobante por WhatsApp al número del negocio:
            </p>
            <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-amber-200 text-xs sm:text-sm">
              <span className="font-mono font-bold text-stone-900">{businessPhone}</span>
              <button
                type="button"
                onClick={handleCopyPhone}
                className="px-2.5 py-1 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-900 font-semibold text-xs transition-colors flex items-center gap-1.5"
              >
                {copiedPhone ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar Número
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 30 minute reminder guarantee banner */}
          <div className="bg-spa-50 border border-spa-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-spa-900">
            <span className="text-xl shrink-0">🔔</span>
            <div>
              <strong className="block text-spa-950 font-bold mb-0.5">
                Recordatorio programado
              </strong>
              Recibirás un recordatorio <strong>30 minutos antes</strong> de la fecha y hora de tu turno.
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-stone-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onReset}
            className="text-xs font-semibold text-stone-500 hover:text-stone-800 flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Reservar otro turno
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-spa-800 hover:bg-spa-900 text-white text-xs font-bold transition-all shadow-sm"
          >
            Finalizar y Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
