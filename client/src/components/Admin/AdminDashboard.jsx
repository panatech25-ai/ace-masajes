import React from 'react';
import {
  Calendar,
  Clock,
  TrendingUp,
  Users,
  CheckCircle,
  AlertCircle,
  Plus,
  MessageCircle,
  Phone,
  ArrowUpRight,
  Sparkles,
  MapPin
} from 'lucide-react';
import { api } from '../../api';

export default function AdminDashboard({
  stats,
  appointments,
  onOpenNewAppointment,
  onEditAppointment,
  onNavigateTab,
  onRefresh
}) {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((a) => a.date === todayStr);

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.updateAppointment(appId, { status: newStatus });
      onRefresh();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner & Action */}
      <div className="bg-gradient-to-r from-spa-900 to-spa-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
        <div className="space-y-2 z-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-gold-300">
            Panel de Control
          </span>
          <h2 className="text-3xl sm:text-4xl font-serif-luxury font-bold text-white">
            ACE Masajes
          </h2>
          <p className="text-xs sm:text-sm text-spa-200">
            Alma, Cuerpo, Espíritu • Gestión integral de turnos y recordatorios automáticos
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 z-10">
          <button
            type="button"
            onClick={onOpenNewAppointment}
            className="px-5 py-3 rounded-2xl bg-gold-400 hover:bg-gold-500 text-spa-950 font-bold text-xs sm:text-sm shadow-md shadow-gold-500/20 active:scale-95 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Nuevo Turno Manual
          </button>
        </div>

        {/* Decorative background glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-spa-600/20 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        
        {/* Turnos Hoy */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Turnos de Hoy
            </span>
            <div className="text-3xl font-bold text-stone-900 font-serif-luxury">
              {stats?.today_total || 0}
            </div>
            <div className="text-[11px] font-medium text-emerald-700 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              {stats?.today_confirmed || 0} confirmados
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-spa-100 text-spa-800 flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
        </div>

        {/* Turnos Esta Semana */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Esta Semana
            </span>
            <div className="text-3xl font-bold text-stone-900 font-serif-luxury">
              {stats?.week_total || 0}
            </div>
            <div className="text-[11px] font-medium text-stone-500">
              Turnos programados
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        {/* Ingresos Estimados Semana */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Estimado Semana
            </span>
            <div className="text-2xl sm:text-3xl font-bold text-spa-950 font-serif-luxury">
              ${Number(stats?.week_estimated_revenue || 0).toLocaleString('es-AR')}
            </div>
            <div className="text-[11px] font-medium text-spa-700">
              Proyección de reservas
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        {/* Total Histórico */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200/80 shadow-xs flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Total Histórico
            </span>
            <div className="text-3xl font-bold text-stone-900 font-serif-luxury">
              {stats?.all_time_total || 0}
            </div>
            <div className="text-[11px] font-medium text-stone-500">
              Turnos registrados
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-700 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* TODAY'S APPOINTMENTS ACTION FEED */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-spa-800 text-gold-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-900 font-serif-luxury">
                Turnos Programados para Hoy
              </h3>
              <p className="text-xs text-stone-500">
                {todayAppointments.length} turnos para la jornada de hoy
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('appointments')}
            className="text-xs font-bold text-spa-800 hover:text-spa-950 flex items-center gap-1"
          >
            Ver todos los turnos <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="py-10 text-center text-stone-400 space-y-2">
            <Calendar className="w-8 h-8 mx-auto text-stone-300" />
            <p className="text-xs font-medium">No hay turnos registrados para el día de hoy.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {todayAppointments.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-2xl border border-stone-200 bg-stone-50/70 hover:bg-stone-50 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-spa-950 font-serif-luxury">
                    {app.time} hs
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      app.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : app.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : app.status === 'cancelled'
                        ? 'bg-stone-200 text-stone-600 line-through'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {app.status}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-stone-900 text-sm">
                    {app.client_name}
                  </h4>
                  <p className="text-xs text-stone-600">
                    {app.service_name} (${Number(app.service_price).toLocaleString('es-AR')})
                  </p>
                  <p className="text-[11px] text-stone-500 flex items-center gap-1 mt-1 truncate">
                    <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                    {app.client_address || 'Sin dirección'}
                  </p>
                </div>

                <div className="pt-2 border-t border-stone-200 flex items-center justify-between">
                  <a
                    href={`https://wa.me/${app.client_phone.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    <MessageCircle className="w-3.5 h-3.5 fill-current" />
                    WhatsApp
                  </a>

                  <div className="flex items-center gap-1.5">
                    {app.status === 'confirmed' && (
                      <button
                        type="button"
                        onClick={() => handleStatusChange(app.id, 'completed')}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold"
                      >
                        Completar
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onEditAppointment(app)}
                      className="px-2.5 py-1 rounded-lg bg-stone-200 hover:bg-stone-300 text-stone-800 text-[11px] font-semibold"
                    >
                      Editar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
