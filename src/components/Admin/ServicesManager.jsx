import React, { useState } from 'react';
import { api } from '../../api';
import { Sparkles, Clock, DollarSign, Plus, Edit2, Trash2, Check, X, Tag } from 'lucide-react';

export default function ServicesManager({ services, onRefresh }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration: 60,
    price: 20000,
    category: 'Terapéutico',
    icon: 'Sparkles',
    active: true
  });
  const [loading, setLoading] = useState(false);

  const openCreateModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      duration: 60,
      price: 20000,
      category: 'Terapéutico',
      icon: 'Sparkles',
      active: true
    });
    setModalOpen(true);
  };

  const openEditModal = (srv) => {
    setEditingService(srv);
    setFormData({
      name: srv.name,
      description: srv.description || '',
      duration: srv.duration,
      price: srv.price,
      category: srv.category || 'General',
      icon: srv.icon || 'Sparkles',
      active: srv.active !== false
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editingService) {
        await api.updateService(editingService.id, formData);
      } else {
        await api.createService(formData);
      }
      setModalOpen(false);
      onRefresh();
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('¿Eliminar este servicio de masajes?')) return;
    try {
      await api.deleteService(id);
      onRefresh();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const handleToggleActive = async (srv) => {
    try {
      await api.updateService(srv.id, { active: !srv.active });
      onRefresh();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-stone-200/80 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-stone-900 font-serif-luxury">
            Servicios y Tratamientos
          </h3>
          <p className="text-xs text-stone-500">
            Administra los tipos de masajes, duraciones y tarifas disponibles para los clientes
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="px-4 py-2.5 rounded-xl bg-spa-800 hover:bg-spa-900 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4" />
          Agregar Servicio
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {services.map((srv) => (
          <div
            key={srv.id}
            className={`rounded-3xl p-5 sm:p-6 border transition-all flex flex-col justify-between ${
              srv.active
                ? 'bg-white border-stone-200/80 shadow-xs'
                : 'bg-stone-100/70 border-stone-200 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-spa-100 text-spa-800">
                  {srv.category}
                </span>

                <button
                  type="button"
                  onClick={() => handleToggleActive(srv)}
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full transition-colors ${
                    srv.active
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-stone-200 text-stone-600'
                  }`}
                >
                  {srv.active ? 'Activo' : 'Pausado'}
                </button>
              </div>

              <h4 className="text-xl font-bold text-stone-900 font-serif-luxury mb-1">
                {srv.name}
              </h4>
              <p className="text-stone-600 text-xs leading-relaxed mb-4">
                {srv.description}
              </p>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-1 text-xs text-stone-500 font-medium">
                <Clock className="w-3.5 h-3.5 text-spa-600" />
                {srv.duration} min
              </div>

              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-spa-950 font-serif-luxury">
                  ${Number(srv.price).toLocaleString('es-AR')}
                </span>

                <button
                  type="button"
                  onClick={() => openEditModal(srv)}
                  className="p-1.5 text-stone-500 hover:text-spa-800 hover:bg-spa-50 rounded-lg transition-all"
                  title="Editar"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(srv.id)}
                  className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                  title="Eliminar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-stone-100 relative animate-scale-in">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-stone-100">
              <h3 className="text-lg font-bold text-stone-900 font-serif-luxury">
                {editingService ? 'Editar Servicio' : 'Nuevo Servicio de Masaje'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-2 text-stone-400 hover:text-stone-700 rounded-full"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Nombre del Masaje
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej: Masaje Descontracturante Profundo"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 font-medium focus:outline-hidden focus:border-spa-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                  Descripción / Beneficios
                </label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Beneficios para el cuerpo y mente..."
                  className="w-full px-3.5 py-2 rounded-xl border border-stone-200 font-medium focus:outline-hidden focus:border-spa-600 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Duración (minutos)
                  </label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    step="5"
                    min="15"
                    max="180"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 font-medium focus:outline-hidden focus:border-spa-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Precio ($ ARS)
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    step="500"
                    min="0"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 font-medium focus:outline-hidden focus:border-spa-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-200 font-medium focus:outline-hidden bg-white"
                  >
                    <option value="Terapéutico">Terapéutico</option>
                    <option value="Relajación">Relajación</option>
                    <option value="Holístico">Holístico</option>
                    <option value="Estético">Estético</option>
                  </select>
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.active}
                      onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                      className="w-4 h-4 rounded text-spa-700 focus:ring-spa-500"
                    />
                    <span className="text-xs font-bold text-stone-700">Disponible para reservas</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-600 hover:bg-stone-100 text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 rounded-xl bg-spa-800 hover:bg-spa-900 text-white text-xs font-bold shadow-xs disabled:opacity-50"
                >
                  {editingService ? 'Guardar Cambios' : 'Crear Servicio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
