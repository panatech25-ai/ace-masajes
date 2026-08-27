import React, { useState } from 'react';
import { api } from '../../api';
import { Shield, Lock, User, AlertCircle, Loader2, Sparkles, X } from 'lucide-react';

export default function AdminLogin({ isOpen, onClose, onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const data = await api.login(username, password);
      localStorage.setItem('ace_admin_token', data.token);
      onLoginSuccess(data.user);
      onClose();
    } catch (err) {
      setError(err.message || 'Credenciales inválidas. Por favor verifique usuario y contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-950/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-stone-100 relative animate-scale-in">
        
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 rounded-2xl bg-spa-800 text-gold-300 flex items-center justify-center mx-auto shadow-md shadow-spa-900/20">
            <Shield className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-serif-luxury font-bold text-stone-900">
            Panel Administrador
          </h2>
          <p className="text-xs text-stone-500">
            ACE Masajes • Alma, Cuerpo, Espíritu
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Usuario
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuario administrador"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium focus:outline-hidden focus:border-spa-600 focus:ring-2 focus:ring-spa-100"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 text-sm font-medium focus:outline-hidden focus:border-spa-600 focus:ring-2 focus:ring-spa-100"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-spa-800 hover:bg-spa-900 text-white font-bold text-sm shadow-md shadow-spa-900/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              'Ingresar al Panel'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
