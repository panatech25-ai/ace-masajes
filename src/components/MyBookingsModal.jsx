import React, { useState } from 'react';
import { api } from '../api';
import { Clock, Phone, Search, X, Calendar, MapPin, Sparkles, AlertCircle, Trash2, Loader2, CheckCircle2 } from 'lucide-react';

export default function MyBookingsModal({ isOpen, onClose }) {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelSuccess, setCancelSuccess] = useState(null);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError(null);
    setCancelSuccess(null);

    try {
      // Find appointments matching phone via public lookup
      const clean = phone.replace(/[^\d]/g, '');
      const results = await api.lookupAppointments(clean);
      setAppointments(results);
    } catch (err) {
      setError(err.message || 'Error al consultar los turnos. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (id) => {
    if (!confirm('¿Estás seguro de que deseas cancelar este turno?')) return;
    setCancellingId(id);
    setError(null);
    try {
      await api.cancelAppointment(id, 'Cancelado por el cliente desde la web');
      setCancelSuccess('El turno ha sido cancelado con éxito.');
      // Refresh list
      handleSearch();
    } catch (err) {
      setError('Error al cancelar el turno: ' + err.message);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-100 relative animate-scale-in">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-spa-100 text-spa-800 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-stone-900 font-serif-luxury">
              Consultar Mis Turnos
            </h3>
            <p className="text-xs text-stone-500">
              Ingresa tu número de teléfono para ver o gestionar tus reservas
            </p>
          </div>
        </div>

        {/* Search Input */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-6">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej: 11 5555 1234"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium focus:outline-hidden focus:border-spa-600 focus:ring-2 focus:ring-spa-100"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !phone.trim()}
            className="px-5 py-2.5 rounded-xl bg-spa-800 text-white hover:bg-spa-900 text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Buscar
          </button>
        </form>

        {/* Alerts */}
        {cancelSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            {cancelSuccess}
          </div>
        )}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            {error}
          </div>
        )}

        {/* Results */}
        {appointments !== null && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {appointments.length === 0 ? (
              <p className="text-center py-8 text-xs text-stone-500">
                No se encontraron turnos registrados para ese número de teléfono.
              </p>
            ) : (
              appointments.map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl border border-stone-200 bg-stone-50 space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-stone-900 font-serif-luxury">
                      {app.service_name}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-semibold uppercase text-[10px] ${
                        app.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : app.status === 'completed'
                          ? 'bg-blue-100 text-blue-800'
                          : app.status === 'cancelled'
                          ? 'bg-stone-200 text-stone-600 line-through'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {app.status === 'confirmed' ? 'Confirmado' : app.status === 'cancelled' ? 'Cancelado' : app.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-stone-600">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-spa-600" />
                      {app.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-spa-600" />
                      {app.time} hs
                    </span>
                  </div>

                  {app.status === 'confirmed' && (
                    <div className="pt-2 border-t border-stone-200/60 flex justify-end">
                      <button
                        type="button"
                        disabled={cancellingId === app.id}
                        onClick={() => handleCancelBooking(app.id)}
                        className="text-red-600 hover:text-red-800 font-semibold flex items-center gap-1 transition-colors"
                      >
                        {cancellingId === app.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                        Cancelar este turno
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
