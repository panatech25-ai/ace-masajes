import React from 'react';
import { Clock, Check, Sparkles, Activity, Flame, Droplets, HeartPulse, Smile } from 'lucide-react';

const iconMap = {
  Sparkles: Sparkles,
  Activity: Activity,
  Flame: Flame,
  Droplets: Droplets,
  HeartPulse: HeartPulse,
  Smile: Smile
};

export default function ServiceSelector({ services, selectedService, onSelectService, onNext }) {
  return (
    <div className="space-y-6">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-spa-100 text-spa-800">
          <Sparkles className="w-3.5 h-3.5 text-spa-600" />
          Paso 1 de 4
        </span>
        <h2 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-stone-900">
          Elige tu Experiencia de Masaje
        </h2>
        <p className="text-stone-600 text-sm sm:text-base">
          Selecciona el tratamiento que tu cuerpo y alma necesitan para renovar tu bienestar.
        </p>
      </div>

      {/* Grid of Services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 pt-2">
        {services.map((service) => {
          const IconComponent = iconMap[service.icon] || Sparkles;
          const isSelected = selectedService?.id === service.id;

          return (
            <div
              key={service.id}
              onClick={() => onSelectService(service)}
              className={`relative rounded-2xl p-5 sm:p-6 cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? 'bg-white ring-2 ring-spa-700 shadow-xl shadow-spa-900/10 scale-[1.02]'
                  : 'bg-white/80 hover:bg-white border border-stone-200/80 hover:border-spa-300 shadow-sm hover:shadow-md'
              }`}
            >
              {isSelected && (
                <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-spa-700 text-white flex items-center justify-center shadow-md animate-scale-in">
                  <Check className="w-4 h-4" />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-spa-700 text-white'
                        : 'bg-spa-50 text-spa-700'
                    }`}
                  >
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700">
                    {service.category || 'Bienestar'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-stone-900 mb-2 font-serif-luxury">
                  {service.name}
                </h3>
                <p className="text-stone-600 text-xs sm:text-sm leading-relaxed mb-6">
                  {service.description}
                </p>
              </div>

              <div className="pt-4 border-t border-stone-100 flex items-center justify-between mt-auto">
                <div className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-stone-500">
                  <Clock className="w-4 h-4 text-spa-600" />
                  <span>{service.duration} min</span>
                </div>

                <div className="text-right">
                  <span className="text-xs text-stone-400 block font-normal">Valor</span>
                  <span className="text-lg sm:text-xl font-bold text-spa-950 font-serif-luxury">
                    ${Number(service.price).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating or Bottom Continue Button */}
      <div className="flex justify-end pt-4">
        <button
          disabled={!selectedService}
          onClick={onNext}
          className={`px-8 py-3.5 rounded-2xl text-sm font-bold shadow-md transition-all flex items-center gap-2 ${
            selectedService
              ? 'bg-spa-800 text-white hover:bg-spa-900 hover:shadow-lg shadow-spa-900/20 active:scale-95'
              : 'bg-stone-200 text-stone-400 cursor-not-allowed'
          }`}
        >
          Continuar a Fecha y Horario
          <Check className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
