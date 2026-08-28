import React, { useState, useEffect } from 'react';
import { api } from '../../api';
import AdminDashboard from './AdminDashboard';
import AppointmentsCalendar from './AppointmentsCalendar';
import AppointmentsTable from './AppointmentsTable';
import ClientsView from './ClientsView';
import ServicesManager from './ServicesManager';
import ScheduleSettings from './ScheduleSettings';
import WhatsAppConfig from './WhatsAppConfig';
import AppointmentModal from './AppointmentModal';
import {
  LayoutDashboard,
  Calendar,
  ListOrdered,
  Users,
  Sparkles,
  Clock,
  MessageCircle,
  LogOut,
  ExternalLink,
  Plus,
  ShieldCheck,
  RefreshCw
} from 'lucide-react';

export default function AdminLayout({ user, onLogout, onNavigateToBooking }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [appointments, setAppointments] = useState([]);
  const [services, setServices] = useState([]);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Appointment Modal state
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [appsRes, srvsRes, stRes, clsRes] = await Promise.allSettled([
        api.getAdminAppointments(),
        api.getServices(true), // all services
        api.getAdminStats(),
        api.getClients()
      ]);

      if (appsRes.status === 'fulfilled' && Array.isArray(appsRes.value)) {
        setAppointments(appsRes.value);
      }
      if (srvsRes.status === 'fulfilled' && Array.isArray(srvsRes.value)) {
        setServices(srvsRes.value);
      }
      if (stRes.status === 'fulfilled' && stRes.value) {
        setStats(stRes.value);
      }
      if (clsRes.status === 'fulfilled' && Array.isArray(clsRes.value)) {
        setClients(clsRes.value);
      }

      if (appsRes.status === 'rejected' && appsRes.reason?.status === 401) {
        onLogout();
      }
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleOpenNewAppointment = (date = null) => {
    setEditingAppointment(date ? { date } : null);
    setAppointmentModalOpen(true);
  };

  const handleOpenEditAppointment = (app) => {
    setEditingAppointment(app);
    setAppointmentModalOpen(true);
  };

  const handleDeleteAppointment = async (id, deleteSeries = false) => {
    try {
      await api.deleteAppointment(id, deleteSeries);
      setAppointmentModalOpen(false);
      loadAllData();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const tabs = [
    { id: 'dashboard', label: 'Resumen', icon: LayoutDashboard },
    { id: 'calendar', label: 'Calendario', icon: Calendar },
    { id: 'appointments', label: 'Turnos', icon: ListOrdered },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'services', label: 'Servicios', icon: Sparkles },
    { id: 'schedule', label: 'Horarios', icon: Clock },
    { id: 'whatsapp', label: 'WhatsApp', icon: MessageCircle }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] pb-16">
      
      {/* Top Admin Sub-Header / Navigation */}
      <div className="bg-white border-b border-stone-200 sticky top-20 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="flex items-center justify-between py-3 border-b border-stone-100 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-stone-800">
                Panel de Control • {user?.name || 'Administrador'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={loadAllData}
                className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition-colors"
                title="Actualizar datos"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              </button>

              <button
                type="button"
                onClick={onNavigateToBooking}
                className="px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Ver Página Web
              </button>

              <button
                type="button"
                onClick={onLogout}
                className="px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <LogOut className="w-3.5 h-3.5" />
                Cerrar Sesión
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="flex items-center gap-1 overflow-x-auto py-2 no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;

              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                    isActive
                      ? 'bg-spa-800 text-white shadow-xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-gold-300' : 'text-stone-500'}`} />
                  {tab.label}
                  {tab.id === 'appointments' && appointments.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-spa-700 text-gold-300' : 'bg-stone-200 text-stone-700'
                    }`}>
                      {appointments.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Contents */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8">
        {activeTab === 'dashboard' && (
          <AdminDashboard
            stats={stats}
            appointments={appointments}
            onOpenNewAppointment={() => handleOpenNewAppointment()}
            onEditAppointment={handleOpenEditAppointment}
            onNavigateTab={setActiveTab}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'calendar' && (
          <AppointmentsCalendar
            appointments={appointments}
            onEditAppointment={handleOpenEditAppointment}
            onNewAppointmentAtDate={(date) => handleOpenNewAppointment(date)}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentsTable
            appointments={appointments}
            services={services}
            onEdit={handleOpenEditAppointment}
            onRefresh={loadAllData}
            onOpenNew={() => handleOpenNewAppointment()}
          />
        )}

        {activeTab === 'clients' && (
          <ClientsView
            clients={clients}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'services' && (
          <ServicesManager
            services={services}
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'schedule' && (
          <ScheduleSettings
            onRefresh={loadAllData}
          />
        )}

        {activeTab === 'whatsapp' && (
          <WhatsAppConfig />
        )}
      </main>

      {/* Appointment Create/Edit Modal */}
      {appointmentModalOpen && (
        <AppointmentModal
          isOpen={appointmentModalOpen}
          onClose={() => setAppointmentModalOpen(false)}
          appointment={editingAppointment}
          services={services}
          onSaved={loadAllData}
          onDelete={handleDeleteAppointment}
        />
      )}
    </div>
  );
}
