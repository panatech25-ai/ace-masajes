import React, { useState } from 'react';
import { Users, Phone, MapPin, Calendar, DollarSign, MessageCircle, Search, Sparkles, ChevronRight, History } from 'lucide-react';

export default function ClientsView({ clients, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientHistory, setSelectedClientHistory] = useState(null);

  const filteredClients = clients.filter((c) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.toLowerCase();
    return (
      c.name?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q) ||
      c.address?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
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

        <div className="text-xs font-semibold text-stone-500">
          Total de clientes registrados: <strong className="text-stone-900">{clients.length}</strong>
        </div>
      </div>

      {/* Clients Table */}
      <div className="bg-white rounded-3xl border border-stone-200/80 shadow-xs overflow-hidden">
        {filteredClients.length === 0 ? (
          <div className="py-16 text-center text-stone-500 space-y-2">
            <Users className="w-10 h-10 mx-auto text-stone-300" />
            <p className="text-sm font-semibold">No se encontraron clientes registrados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-stone-50/80 border-b border-stone-200 text-stone-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Cliente</th>
                  <th className="py-3.5 px-4 sm:px-6">Contacto / WhatsApp</th>
                  <th className="py-3.5 px-4 sm:px-6">Dirección Registrada</th>
                  <th className="py-3.5 px-4 sm:px-6 text-center">Turnos Totales</th>
                  <th className="py-3.5 px-4 sm:px-6">Total Abonado</th>
                  <th className="py-3.5 px-4 sm:px-6">Última Visita</th>
                  <th className="py-3.5 px-4 sm:px-6 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium">
                {filteredClients.map((client, idx) => (
                  <tr key={idx} className="hover:bg-spa-50/40 transition-colors">
                    {/* Name */}
                    <td className="py-4 px-4 sm:px-6">
                      <span className="font-bold text-stone-900 font-serif-luxury text-base block">
                        {client.name}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap">
                      <a
                        href={`https://wa.me/${client.phone.replace(/[^\d]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:underline flex items-center gap-1.5 font-mono text-xs font-semibold"
                      >
                        <MessageCircle className="w-3.5 h-3.5 fill-current text-emerald-600" />
                        {client.phone}
                      </a>
                    </td>

                    {/* Address */}
                    <td className="py-4 px-4 sm:px-6 max-w-xs">
                      <span className="text-stone-600 truncate block">
                        {client.address || 'Sin especificar'}
                      </span>
                    </td>

                    {/* Total Bookings */}
                    <td className="py-4 px-4 sm:px-6 text-center whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-full bg-spa-100 text-spa-900 font-bold text-xs">
                        {client.total_appointments} sesiones
                      </span>
                    </td>

                    {/* Total Spent */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap font-bold text-stone-900">
                      ${Number(client.total_spent || 0).toLocaleString('es-AR')}
                    </td>

                    {/* Last Visit */}
                    <td className="py-4 px-4 sm:px-6 whitespace-nowrap text-stone-500">
                      {client.last_appointment_date}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedClientHistory(client)}
                        className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold inline-flex items-center gap-1 transition-all"
                      >
                        <History className="w-3.5 h-3.5" />
                        Historial
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Client History Modal */}
      {selectedClientHistory && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-100 relative animate-scale-in">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
              <div>
                <h3 className="text-xl font-bold text-stone-900 font-serif-luxury">
                  Historial de {selectedClientHistory.name}
                </h3>
                <p className="text-xs text-stone-500">
                  {selectedClientHistory.phone} • {selectedClientHistory.address}
                </p>
              </div>
              <button
                onClick={() => setSelectedClientHistory(null)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {selectedClientHistory.history.map((h, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-stone-50 border border-stone-200 text-xs flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-stone-900 block text-sm">
                      {h.service_name}
                    </span>
                    <span className="text-stone-500">
                      {h.date} a las {h.time} hs
                    </span>
                  </div>

                  <div className="text-right">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase block mb-1 ${
                        h.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : h.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {h.status}
                    </span>
                    <span className="font-bold text-spa-900">
                      ${Number(h.price || 0).toLocaleString('es-AR')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
