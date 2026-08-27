import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  User,
  MapPin,
  Phone,
  MessageCircle,
  Edit2,
  Trash2,
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Sparkles,
  Send,
  MoreVertical,
  ChevronDown
} from 'lucide-react';
import { api } from '../../api';

export default function AppointmentsTable({
  appointments,
  services,
  onEdit,
  onRefresh,
  onOpenNew
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all'); // 'all', 'today', 'upcoming'
  const [selectedAppointmentForWhatsApp, setSelectedAppointmentForWhatsApp] = useState(null);
  const [customMsg, setCustomMsg] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgResult, setMsgResult] = useState(null);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering
  const filteredAppointments = appointments.filter((app) => {
    // Search
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const match =
        app.client_name?.toLowerCase().includes(q) ||
        app.client_phone?.toLowerCase().includes(q) ||
        app.client_address?.toLowerCase().includes(q) ||
        app.service_name?.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Status filter
    if (statusFilter !== 'all' && app.status !== statusFilter) {
      return false;
    }

    // Date filter
    if (dateFilter === 'today' && app.date !== todayStr) return false;
    if (dateFilter === 'upcoming' && app.date < todayStr) return false;

    return true;
  });

  // Fast status change
  const handleQuickStatusChange = async (appId, newStatus) => {
    try {
      await api.updateAppointment(appId, { status: newStatus });
      onRefresh();
    } catch (err) {
      alert('Error al actualizar estado: ' + err.message);
    }
  };

  const handleDelete = async (appId) => {
    if (!confirm('¿Eliminar este turno permanentemente?')) return;
    try {
      await api.deleteAppointment(appId);
      onRefresh();
    } catch (err) {
      alert('Error al eliminar: ' + err.message);
    }
  };

  const handleSendWhatsAppCustom = async (type) => {
    if (!selectedAppointmentForWhatsApp) return;
    setSendingMsg(true);
    setMsgResult(null);

    try {
      const res = await api.sendWhatsApp(
        selectedAppointmentForWhatsApp.id,
        type,
        type === 'custom' ? customMsg : null
      );
      setMsgResult({ success: true, link: res.directLink, message: res.message });
    } catch (err) {
      setMsgResult({ success: false, error: err.message });
    } finally {
      setSendingMsg(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Search input */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por cliente, teléfono o dirección..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-xs sm:text-sm font-medium focus:outline-hidden focus:border-spa-600 focus:ring-2 focus:ring-spa-100"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 bg-white focus:outline-hidden"
          >
            <option value="all">📅 Todas las Fechas</option>
            <option value="today">☀️ Solo Hoy</option>
            <option value="upcoming">⏳ Próximos</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-stone-200 text-xs font-semibold text-stone-700 bg-white focus:outline-hidden"
          >
            <option value="all">🔘 Todos los Estados</option>
            <option value="confirmed">🟢 Confirmados</option>
            <option value="pending">🟡 Pendientes</option>
            <option value="completed">🔵 Completados</option>
            <option value="cancelled">🔴 Cancelados</option>
          </select>

          <button
            type="button"
            onClick={onOpenNew}
            className="px-4 py-2 rounded-xl bg-spa-800 hover:bg-spa-900 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all ml-auto md:ml-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            Nuevo Turno
          </button>
        </div>
      </div>

      {/* Appointments List / Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="py-16 text-center text-stone-500 space-y-2">
            <Calendar className="w-10 h-10 mx-auto text-stone-300" />
            <p className="text-sm font-semibold">No se encontraron turnos con los filtros actuales.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Fecha y Hora</th>
                  <th className="py-3.5 px-4 sm:px-6">Cliente & Contacto</th>
                  <th className="py-3.5 px-4 sm:px-6">Dirección</th>
                  <th className="py-3.5 px-4 sm:px-6">Servicio & Valor</th>
                  <th className="py-3.5 px-4 sm:px-6">Estado</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {filteredAppointments.map((app) => {
                  const isToday = app.date === todayStr;

                  return (
                    <tr
                      key={app.id}
                      className={`hover:bg-spa-50/40 transition-colors ${
                        isToday ? 'bg-spa-50/20' : ''
                      }`}
                    >
                      {/* Date & Time */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className={`font-bold text-sm ${isToday ? 'text-spa-900' : 'text-stone-800'}`}>
                            {app.time} hs
                          </span>
                          <span className="text-xs text-stone-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-spa-600" />
                            {app.date} {isToday && <span className="text-[10px] font-bold text-spa-700 bg-spa-100 px-1 rounded">HOY</span>}
                          </span>
                          {app.recurrence_rule && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-spa-800 bg-spa-100 px-1.5 py-0.5 rounded-md mt-1 w-fit">
                              🔄 {app.recurrence_rule}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Client */}
                      <td className="py-4 px-4 sm:px-6">
                        <div className="flex flex-col">
                          <span className="font-bold text-stone-900 font-serif-luxury text-base">
                            {app.client_name}
                          </span>
                          <a
                            href={`https://wa.me/${app.client_phone.replace(/[^\d]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-emerald-700 hover:underline flex items-center gap-1 font-mono mt-0.5"
                          >
                            <Phone className="w-3 h-3" />
                            {app.client_phone}
                          </a>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="py-4 px-4 sm:px-6 max-w-xs">
                        <div className="flex items-start gap-1 text-stone-600 text-xs">
                          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0 mt-0.5" />
                          <span className="truncate">{app.client_address || 'Sin especificar'}</span>
                        </div>
                        {app.client_notes && (
                          <span className="text-[11px] text-stone-400 italic block truncate mt-0.5">
                            "{app.client_notes}"
                          </span>
                        )}
                      </td>

                      {/* Service & Price */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <div className="flex flex-col">
                          <span className="font-semibold text-stone-800">
                            {app.service_name}
                          </span>
                          <span className="text-xs text-spa-800 font-bold">
                            ${Number(app.service_price).toLocaleString('es-AR')} ({app.service_duration}m)
                          </span>
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                        <select
                          value={app.status}
                          onChange={(e) => handleQuickStatusChange(app.id, e.target.value)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border cursor-pointer focus:outline-hidden ${
                            app.status === 'confirmed'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                              : app.status === 'completed'
                              ? 'bg-blue-50 text-blue-800 border-blue-200'
                              : app.status === 'cancelled'
                              ? 'bg-stone-100 text-stone-600 border-stone-300 line-through'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <option value="confirmed">Confirmado</option>
                          <option value="pending">Pendiente</option>
                          <option value="completed">Completado</option>
                          <option value="cancelled">Cancelado</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Send WhatsApp Modal button */}
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedAppointmentForWhatsApp(app);
                              setMsgResult(null);
                            }}
                            className="p-2 text-emerald-600 hover:text-emerald-800 hover:bg-emerald-50 rounded-xl transition-all"
                            title="Enviar WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4 fill-current" />
                          </button>

                          {/* Edit */}
                          <button
                            type="button"
                            onClick={() => onEdit(app)}
                            className="p-2 text-stone-500 hover:text-spa-800 hover:bg-spa-50 rounded-xl transition-all"
                            title="Editar Turno"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleDelete(app.id)}
                            className="p-2 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* WhatsApp Trigger Modal */}
      {selectedAppointmentForWhatsApp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-100 relative animate-scale-in">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <MessageCircle className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-stone-900">
                    Enviar WhatsApp
                  </h3>
                  <p className="text-xs text-stone-500">
                    A {selectedAppointmentForWhatsApp.client_name} ({selectedAppointmentForWhatsApp.client_phone})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAppointmentForWhatsApp(null)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleSendWhatsAppCustom('confirmation')}
                  disabled={sendingMsg}
                  className="p-3 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left text-xs font-medium transition-all"
                >
                  <span className="font-bold block text-stone-900 mb-1">🌿 Confirmación</span>
                  Envía el mensaje de bienvenida y confirmación de turno.
                </button>

                <button
                  type="button"
                  onClick={() => handleSendWhatsAppCustom('reminder_30m')}
                  disabled={sendingMsg}
                  className="p-3 rounded-xl border border-stone-200 hover:border-emerald-500 hover:bg-emerald-50/50 text-left text-xs font-medium transition-all"
                >
                  <span className="font-bold block text-stone-900 mb-1">🔔 Recordatorio 30m</span>
                  Envía el aviso previo de que faltan 30 minutos.
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  O escribe un mensaje personalizado:
                </label>
                <textarea
                  rows="3"
                  value={customMsg}
                  onChange={(e) => setCustomMsg(e.target.value)}
                  placeholder="Hola! Te escribimos de ACE Masajes..."
                  className="w-full p-3 rounded-xl border border-stone-200 text-xs font-medium focus:outline-hidden focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
                />
              </div>

              {customMsg && (
                <button
                  type="button"
                  onClick={() => handleSendWhatsAppCustom('custom')}
                  disabled={sendingMsg}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  Enviar Mensaje Personalizado
                </button>
              )}

              {/* Direct link fallback */}
              {msgResult && (
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
                  <p className="font-bold text-emerald-800">
                    Mensaje generado correctamente.
                  </p>
                  {msgResult.link && (
                    <a
                      href={msgResult.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition-all shadow-xs"
                    >
                      <MessageCircle className="w-4 h-4 fill-current" />
                      Abrir en WhatsApp Web / App
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
