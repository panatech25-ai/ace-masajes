import React from 'react';
import { CheckCircle2, MessageCircle, Calendar, Clock, MapPin, Sparkles, User, RefreshCw, X } from 'lucide-react';

export default function BookingSuccessModal({
  appointment,
  whatsappData,
  onClose,
  onReset
}) {
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

  const directLink = whatsappData?.directLink;

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
              ¡Reserva Exitosa!
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif-luxury font-bold text-stone-900 mt-1">
              Tu turno en ACE Masajes está confirmado
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
              Confirmado
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
                  {appointment.client_address || 'Espacio ACE Masajes'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* WhatsApp Call to Action */}
        <div className="mt-6 space-y-3">
          {directLink && (
            <a
              href={directLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-3 text-center"
            >
              <MessageCircle className="w-6 h-6 fill-current" />
              Abrir WhatsApp y Enviar Confirmación
            </a>
          )}

          {/* 30 minute reminder guarantee banner */}
          <div className="bg-spa-50 border border-spa-200/80 rounded-2xl p-4 flex items-start gap-3 text-xs text-spa-900">
            <span className="text-xl shrink-0">🔔</span>
            <div>
              <strong className="block text-spa-950 font-bold mb-0.5">
                Recordatorio automático programado
              </strong>
              Te enviaremos un mensaje de WhatsApp <strong>30 minutos antes</strong> de la fecha y hora de tu sesión para que no olvides tu turno.
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
            className="px-5 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold transition-all"
          >
            Finalizar
          </button>
        </div>
      </div>
    </div>
  );
}
