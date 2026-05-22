'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { useRouter } from 'next/navigation';
import { User, Lock, Eye, EyeOff, ShieldCheck, AlertCircle, Key, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
  const { login, isLoggedIn, isInitialized, activeRole } = useApp();
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // If already logged in, redirect to active role page
  useEffect(() => {
    if (isInitialized && isLoggedIn) {
      if (activeRole === 'admin') {
        router.push('/dashboard');
      } else if (activeRole === 'housekeeping') {
        router.push('/housekeeping');
      } else {
        router.push('/reception');
      }
    }
  }, [isLoggedIn, isInitialized, activeRole, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!username.trim() || !password) {
      setError('Por favor, completa todos los campos.');
      return;
    }

    setLoading(true);

    // Simulate dynamic network check for premium feel
    setTimeout(() => {
      const success = login(username.trim().toLowerCase(), password);
      if (success) {
        // Redirection is handled by the useEffect above
      } else {
        setError('Usuario o contraseña incorrectos. Revisa las credenciales de demostración.');
        setLoading(false);
      }
    }, 700);
  };

  const autofill = (user: string, pass: string) => {
    setUsername(user);
    setPassword(pass);
    setError(null);
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center space-y-4">
          <div className="h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-400">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 px-4 py-12 relative overflow-hidden">
      {/* Background ambient glowing lights */}
      <div className="absolute top-1/4 left-1/4 h-80 w-80 sm:h-96 sm:w-96 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 h-80 w-80 sm:h-96 sm:w-96 bg-violet-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>

      <div className="bg-white/5 border border-white/10 backdrop-blur-xl shadow-2xl rounded-3xl p-8 sm:p-10 w-full max-w-md relative z-10 text-white slide-up">
        {/* Brand logo & header */}
        <div className="flex flex-col items-center mb-8">
          <div className="h-12 w-12 bg-white text-indigo-950 rounded-2xl flex items-center justify-center shadow-lg font-extrabold text-2xl tracking-tight mb-3">
            H
          </div>
          <h2 className="font-extrabold text-2xl tracking-tight text-white">HOTELFLOW</h2>
          <p className="text-xs text-indigo-300 font-semibold tracking-widest uppercase mt-1">PMS & CRM SYSTEM</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-500/15 border border-rose-500/30 rounded-2xl p-4 flex items-start space-x-3 text-rose-200 text-xs mb-6 slide-up">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Error de ingreso</span>
              <p className="mt-0.5 text-rose-300/90 leading-relaxed">{error}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
              Usuario / Rol
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-4.5 w-4.5 text-slate-400" />
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ej: admin, reception..."
                className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:bg-white/10 rounded-2xl pl-11 pr-4 py-3.5 text-sm placeholder-slate-500 outline-none transition-all"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                Contraseña
              </label>
            </div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-4.5 w-4.5 text-slate-400" />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/10 focus:border-indigo-500/50 focus:bg-white/10 rounded-2xl pl-11 pr-11 py-3.5 text-sm placeholder-slate-500 outline-none transition-all"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-white transition"
                disabled={loading}
              >
                {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs uppercase tracking-widest py-4 px-6 rounded-2xl transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/35 flex items-center justify-center space-x-2 disabled:opacity-55 disabled:cursor-not-allowed group cursor-pointer"
          >
            {loading ? (
              <>
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Iniciando sesión...</span>
              </>
            ) : (
              <>
                <span>Acceder al Sistema</span>
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        {/* Demo Credentials Helper Card */}
        <div className="mt-8 pt-6 border-t border-white/10">
          <div className="flex items-center space-x-2 text-[10px] font-bold text-indigo-300 uppercase tracking-widest mb-3">
            <Key className="h-3.5 w-3.5" />
            <span>Credenciales de Demostración</span>
          </div>
          <div className="grid grid-cols-1 gap-2.5">
            <button
              onClick={() => autofill('admin', 'admin123')}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-left transition group cursor-pointer"
            >
              <div>
                <span className="text-[11px] font-bold text-slate-200 block">Administración Completa</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Usuario: admin / Clave: admin123</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-400 group-hover:text-indigo-300 transition-all opacity-0 group-hover:opacity-100 pr-1">Autocompletar</span>
            </button>

            <button
              onClick={() => autofill('reception', 'recep123')}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-left transition group cursor-pointer"
            >
              <div>
                <span className="text-[11px] font-bold text-slate-200 block">Recepción y Limpieza</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Usuario: reception / Clave: recep123</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-400 group-hover:text-indigo-300 transition-all opacity-0 group-hover:opacity-100 pr-1">Autocompletar</span>
            </button>

            <button
              onClick={() => autofill('housekeeping', 'clean123')}
              className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 hover:bg-white/10 text-left transition group cursor-pointer"
            >
              <div>
                <span className="text-[11px] font-bold text-slate-200 block">Personal de Limpieza</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Usuario: housekeeping / Clave: clean123</span>
              </div>
              <span className="text-[10px] font-bold text-indigo-400 group-hover:text-indigo-300 transition-all opacity-0 group-hover:opacity-100 pr-1">Autocompletar</span>
            </button>
          </div>
        </div>

        {/* Back to Web button */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs text-slate-400 hover:text-white transition-all underline underline-offset-4"
          >
            Volver a la Web Principal
          </Link>
        </div>
      </div>
    </div>
  );
}
