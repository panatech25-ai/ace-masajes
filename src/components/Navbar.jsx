import React, { useState } from 'react';
import { Sparkles, Calendar, Clock, User, Shield, Menu, X, Phone, HeartHandshake } from 'lucide-react';

export default function Navbar({ onNavigate, currentView, isAdminLoggedIn, onOpenAdminLogin, onLogout, onOpenMyBookings }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Name */}
          <div 
            onClick={() => onNavigate('booking')} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-spa-800 to-spa-600 flex items-center justify-center text-white shadow-md shadow-spa-800/20 group-hover:scale-105 transition-transform duration-300">
              <Sparkles className="w-6 h-6 text-gold-300" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-baseline gap-1.5">
                <span className="font-serif-luxury text-2xl sm:text-3xl font-bold tracking-tight text-spa-950">
                  ACE
                </span>
                <span className="font-sans text-sm font-semibold tracking-wider uppercase text-spa-700">
                  Masajes
                </span>
              </div>
              <span className="text-[11px] sm:text-xs font-medium text-stone-500 tracking-wide">
                Alma, Cuerpo, Espíritu
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1.5">
            <button
              onClick={() => onNavigate('booking')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                currentView === 'booking'
                  ? 'bg-spa-100 text-spa-900 font-semibold'
                  : 'text-stone-600 hover:text-spa-800 hover:bg-stone-100/70'
              }`}
            >
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-spa-600" />
                Reservar Turno
              </span>
            </button>

            <button
              onClick={onOpenMyBookings}
              className="px-4 py-2 rounded-xl text-sm font-medium text-stone-600 hover:text-spa-800 hover:bg-stone-100/70 transition-all"
            >
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-stone-500" />
                Mis Turnos
              </span>
            </button>

            <div className="h-5 w-px bg-stone-300 mx-2" />

            {isAdminLoggedIn ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('admin')}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    currentView === 'admin'
                      ? 'bg-spa-800 text-white shadow-sm'
                      : 'bg-stone-100 text-stone-800 hover:bg-stone-200'
                  }`}
                >
                  <Shield className="w-4 h-4 text-gold-400" />
                  Panel Administrador
                </button>
                <button
                  onClick={onLogout}
                  className="p-2 text-stone-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"
                  title="Cerrar Sesión"
                >
                  <User className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAdminLogin}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider text-stone-600 hover:text-spa-900 hover:bg-stone-100/80 transition-all flex items-center gap-1.5 border border-stone-200"
              >
                <Shield className="w-3.5 h-3.5 text-spa-600" />
                Admin
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => onNavigate('booking')}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-spa-800 text-white flex items-center gap-1.5 shadow-xs"
            >
              <Calendar className="w-3.5 h-3.5 text-gold-300" />
              Turnos
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-stone-600 hover:bg-stone-100"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-stone-200 bg-white/95 backdrop-blur-md px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <button
            onClick={() => {
              onNavigate('booking');
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${
              currentView === 'booking'
                ? 'bg-spa-100 text-spa-900 font-semibold'
                : 'text-stone-700 hover:bg-stone-50'
            }`}
          >
            <Calendar className="w-5 h-5 text-spa-700" />
            Reservar Turno Online
          </button>

          <button
            onClick={() => {
              onOpenMyBookings();
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-stone-700 hover:bg-stone-50"
          >
            <Clock className="w-5 h-5 text-stone-600" />
            Consultar Mis Turnos
          </button>

          <div className="pt-2 border-t border-stone-100">
            {isAdminLoggedIn ? (
              <div className="space-y-1">
                <button
                  onClick={() => {
                    onNavigate('admin');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-spa-800 text-white"
                >
                  <Shield className="w-5 h-5 text-gold-400" />
                  Ir al Panel de Administración
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-red-600 hover:bg-red-50"
                >
                  <User className="w-4 h-4" />
                  Cerrar Sesión Admin
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  onOpenAdminLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider text-stone-700 bg-stone-100 hover:bg-stone-200"
              >
                <Shield className="w-4 h-4 text-spa-700" />
                Acceso Administrador
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
