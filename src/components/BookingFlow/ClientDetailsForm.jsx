import React, { useState } from 'react';
import { User, MapPin, Phone, MessageSquare, ShieldCheck, ArrowLeft, Loader2, Sparkles, Calendar, Clock } from 'lucide-react';

export default function ClientDetailsForm({
  formData,
  onChange,
  onSubmit,
  onBack,
  selectedService,
  selectedDateFriendly,
  selectedTime,
  loading
}) {
  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};
    if (!formData.client_name?.trim()) {
      newErrors.client_name = 'El nombre y apellido es obligatorio.';
    }
    if (!formData.client_address?.trim()) {
      newErrors.client_address = 'La dirección es obligatoria.';
    }
    if (!formData.client_phone?.trim()) {
      newErrors.client_phone = 'El teléfono es obligatorio para enviar la confirmación y recordatorio por WhatsApp.';
    } else if (formData.client_phone.replace(/[^\d]/g, '').length < 8) {
      newErrors.client_phone = 'Por favor ingrese un número de teléfono válido con código de área (ej. 341 514-8958).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSubmit();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-spa-100 text-spa-800">
          <Sparkles className="w-3.5 h-3.5 text-spa-600" />
          Paso 3 de 4
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-stone-900">
          Tus Datos de Contacto
        </h2>
        <p className="text-stone-600 text-sm sm:text-base">
          Ingresa tus datos para registrar tu turno y recibir la confirmación inmediata por WhatsApp.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Nombre y Apellido */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Nombre y Apellido <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <User className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="client_name"
                  value={formData.client_name || ''}
                  onChange={(e) => onChange('client_name', e.target.value)}
                  placeholder="Ej: Laura González"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-medium text-stone-800 focus:outline-hidden transition-all ${
                    errors.client_name
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-stone-200 bg-stone-50/50 focus:border-spa-600 focus:bg-white focus:ring-2 focus:ring-spa-100'
                  }`}
                />
              </div>
              {errors.client_name && (
                <p className="text-xs font-medium text-red-600 mt-1">{errors.client_name}</p>
              )}
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Dirección <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <input
                  type="text"
                  name="client_address"
                  value={formData.client_address || ''}
                  onChange={(e) => onChange('client_address', e.target.value)}
                  placeholder="Ej: Córdoba 1450, Depto 2A"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-medium text-stone-800 focus:outline-hidden transition-all ${
                    errors.client_address
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-stone-200 bg-stone-50/50 focus:border-spa-600 focus:bg-white focus:ring-2 focus:ring-spa-100'
                  }`}
                />
              </div>
              {errors.client_address && (
                <p className="text-xs font-medium text-red-600 mt-1">{errors.client_address}</p>
              )}
            </div>

            {/* Teléfono / WhatsApp */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Teléfono / WhatsApp <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-emerald-600">
                  <Phone className="w-5 h-5" />
                </div>
                <input
                  type="tel"
                  name="client_phone"
                  value={formData.client_phone || ''}
                  onChange={(e) => onChange('client_phone', e.target.value)}
                  placeholder="Ej: 341 514 8958 (con código de área)"
                  className={`w-full pl-11 pr-4 py-3 rounded-xl border text-sm font-medium text-stone-800 focus:outline-hidden transition-all ${
                    errors.client_phone
                      ? 'border-red-400 bg-red-50/30 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                      : 'border-stone-200 bg-stone-50/50 focus:border-spa-600 focus:bg-white focus:ring-2 focus:ring-spa-100'
                  }`}
                />
              </div>
              <p className="text-[11px] text-stone-500 mt-1 flex items-center gap-1">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                Te enviaremos la confirmación inmediata y un recordatorio 30 minutos antes por WhatsApp.
              </p>
              {errors.client_phone && (
                <p className="text-xs font-medium text-red-600 mt-1">{errors.client_phone}</p>
              )}
            </div>

            {/* Notas Adicionales */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                Notas / Zonas de dolor o preferencias <span className="text-stone-400 font-normal">(Opcional)</span>
              </label>
              <div className="relative">
                <div className="absolute top-3 left-3.5 pointer-events-none text-stone-400">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <textarea
                  rows="3"
                  name="client_notes"
                  value={formData.client_notes || ''}
                  onChange={(e) => onChange('client_notes', e.target.value)}
                  placeholder="Ej: Dolor en cervicales y espalda alta, preferencia por presión media..."
                  className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-sm font-medium text-stone-800 focus:outline-hidden focus:border-spa-600 focus:bg-white focus:ring-2 focus:ring-spa-100 transition-all resize-none"
                />
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="pt-4 flex items-center justify-between gap-4">
              <button
                type="button"
                onClick={onBack}
                className="px-5 py-3 rounded-xl text-stone-600 hover:text-stone-900 hover:bg-stone-100 text-sm font-semibold transition-all flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver
              </button>

              <button
                type="submit"
                className="px-8 py-3.5 rounded-2xl bg-spa-800 text-white hover:bg-spa-900 shadow-md shadow-spa-900/20 active:scale-95 text-sm font-bold transition-all flex items-center gap-2"
              >
                <span>Continuar a Seña y Confirmación</span>
                <span className="text-gold-300">→</span>
              </button>
            </div>
          </form>
        </div>

        {/* Summary Side Card */}
        <div className="lg:col-span-5 bg-gradient-to-b from-spa-900 to-spa-950 text-white rounded-3xl p-6 sm:p-7 shadow-xl space-y-6">
          <div className="border-b border-spa-800 pb-4">
            <span className="text-xs uppercase tracking-widest text-gold-300 font-semibold">
              Resumen de tu Turno
            </span>
            <h3 className="text-2xl font-serif-luxury font-bold text-white mt-1">
              ACE Masajes
            </h3>
            <p className="text-xs text-spa-200">
              Alma, Cuerpo, Espíritu
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-spa-800/80 flex items-center justify-center shrink-0 text-gold-300">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-spa-300 block">Tratamiento</span>
                <span className="font-bold text-white text-base">
                  {selectedService?.name}
                </span>
                <span className="text-xs text-spa-200 block">
                  {selectedService?.duration} minutos de sesión
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-spa-800/80 flex items-center justify-center shrink-0 text-gold-300">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-spa-300 block">Fecha</span>
                <span className="font-bold text-white text-sm capitalize">
                  {selectedDateFriendly}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-spa-800/80 flex items-center justify-center shrink-0 text-gold-300">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs text-spa-300 block">Horario</span>
                <span className="font-bold text-white text-sm">
                  {selectedTime} hs
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-spa-800/80 flex items-baseline justify-between">
            <span className="text-sm font-medium text-spa-200">
              Total de la sesión
            </span>
            <span className="text-2xl sm:text-3xl font-serif-luxury font-bold text-gold-300">
              ${Number(selectedService?.price || 0).toLocaleString('es-AR')}
            </span>
          </div>

          <div className="bg-spa-800/40 rounded-2xl p-3.5 border border-spa-700/50 text-[11px] text-spa-200 leading-relaxed">
            🌿 <strong>Compromiso ACE:</strong> Te enviaremos un recordatorio automático por WhatsApp 30 minutos antes para tu comodidad.
          </div>
        </div>
      </div>
    </div>
  );
}
