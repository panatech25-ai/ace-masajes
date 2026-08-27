import React, { useState, useEffect } from 'react';
import { api } from './api';
import Navbar from './components/Navbar';
import BookingWizard from './components/BookingFlow/BookingWizard';
import AdminLayout from './components/Admin/AdminLayout';
import AdminLogin from './components/Admin/AdminLogin';
import MyBookingsModal from './components/MyBookingsModal';
import { Sparkles, MapPin, Phone, Clock, Heart, Shield } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState('booking'); // 'booking' | 'admin'
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [adminUser, setAdminUser] = useState(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const [myBookingsModalOpen, setMyBookingsModalOpen] = useState(false);

  // Check existing login session
  useEffect(() => {
    async function verifyAuth() {
      const token = localStorage.getItem('ace_admin_token');
      if (token) {
        try {
          const res = await api.getMe();
          setIsAdminLoggedIn(true);
          setAdminUser(res.user);
        } catch (err) {
          localStorage.removeItem('ace_admin_token');
          setIsAdminLoggedIn(false);
          setAdminUser(null);
        }
      }
    }
    verifyAuth();
  }, []);

  const handleLoginSuccess = (user) => {
    setIsAdminLoggedIn(true);
    setAdminUser(user);
    setCurrentView('admin');
  };

  const handleLogout = () => {
    localStorage.removeItem('ace_admin_token');
    setIsAdminLoggedIn(false);
    setAdminUser(null);
    setCurrentView('booking');
  };

  const handleOpenAdmin = () => {
    if (isAdminLoggedIn) {
      setCurrentView('admin');
    } else {
      setLoginModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAF7F2] text-stone-800">
      
      {/* Navigation */}
      <Navbar
        currentView={currentView}
        onNavigate={(view) => {
          if (view === 'admin' && !isAdminLoggedIn) {
            setLoginModalOpen(true);
          } else {
            setCurrentView(view);
          }
        }}
        isAdminLoggedIn={isAdminLoggedIn}
        onOpenAdminLogin={() => setLoginModalOpen(true)}
        onLogout={handleLogout}
        onOpenMyBookings={() => setMyBookingsModalOpen(true)}
      />

      {/* Main View Area */}
      <div className="grow">
        {currentView === 'booking' ? (
          <BookingWizard />
        ) : (
          <AdminLayout
            user={adminUser}
            onLogout={handleLogout}
            onNavigateToBooking={() => setCurrentView('booking')}
          />
        )}
      </div>

      {/* Elegant Spa Footer */}
      <footer className="bg-stone-900 text-white mt-16 border-t border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Brand column */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-spa-800 flex items-center justify-center text-gold-300">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <span className="font-serif-luxury text-2xl font-bold tracking-wide">
                    ACE Masajes
                  </span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-stone-400 leading-relaxed font-light">
                <em>Alma, Cuerpo, Espíritu.</em> Espacio dedicado a la relajación, la armonía y la recuperación muscular mediante terapias y masajes profesionales.
              </p>
            </div>

            {/* Quick Contact & Info */}
            <div className="space-y-2 text-xs sm:text-sm text-stone-400">
              <h4 className="font-bold text-white uppercase text-xs tracking-wider mb-2">
                Atención y Reservas
              </h4>
              <p className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-spa-400 shrink-0" />
                Lunes a Sábados: 09:00 a 20:00 hs
              </p>
              <a
                href="https://wa.me/5493415148958"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-emerald-400 font-semibold hover:underline"
              >
                <Phone className="w-4 h-4 shrink-0" />
                WhatsApp: +54 9 341 514-8958
              </a>
            </div>

            {/* Admin access & details */}
            <div className="space-y-3 text-xs sm:text-sm text-stone-400 md:text-right">
              <h4 className="font-bold text-white uppercase text-xs tracking-wider">
                Gestión
              </h4>
              <div>
                <button
                  onClick={handleOpenAdmin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white text-xs font-semibold transition-all border border-stone-700"
                >
                  <Shield className="w-3.5 h-3.5 text-gold-400" />
                  {isAdminLoggedIn ? 'Ir al Panel Admin' : 'Acceso Administrador'}
                </button>
              </div>
              <p className="text-[11px] text-stone-500">
                © {new Date().getFullYear()} ACE Masajes • Todos los derechos reservados.
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Admin Login Modal */}
      <AdminLogin
        isOpen={loginModalOpen}
        onClose={() => setLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Client "Mis Turnos" Lookup Modal */}
      <MyBookingsModal
        isOpen={myBookingsModalOpen}
        onClose={() => setMyBookingsModalOpen(false)}
      />
    </div>
  );
}
