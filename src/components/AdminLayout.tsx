'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useApp, HotelNotification } from '@/context/AppContext';
import {
  LayoutDashboard,
  Bed,
  Sparkles,
  Bell,
  MapPin,
  CalendarDays,
  ShoppingBag,
  ExternalLink,
  ChevronDown,
  Check,
  Menu,
  X,
  AlertTriangle,
  Info,
  CheckCircle,
  HelpCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const {
    sedes,
    currentSede,
    setCurrentSede,
    activeRole,
    setActiveRole,
    notifications,
    clearNotification,
    clearAllNotifications,
    rooms
  } = useApp();

  const pathname = usePathname();
  const router = useRouter();
  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showSedeDropdown, setShowSedeDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Mapa de Habitaciones', href: '/reception', icon: Bed, roles: ['reception', 'admin'] },
    { name: 'Dashboard Admin', href: '/dashboard', icon: LayoutDashboard, roles: ['admin'] },
    { name: 'Housekeeping', href: '/housekeeping', icon: Sparkles, roles: ['housekeeping', 'admin', 'reception'] },
  ];

  const unreadNotifications = notifications.filter(n => !n.read);

  const getNotifIcon = (type: HotelNotification['type']) => {
    switch (type) {
      case 'alert':
        return <AlertTriangle className="h-5 w-5 text-rose-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'success':
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      default:
        return <Info className="h-5 w-5 text-indigo-500" />;
    }
  };

  const getNotifBg = (type: HotelNotification['type']) => {
    switch (type) {
      case 'alert':
        return 'bg-rose-50 border-rose-100';
      case 'warning':
        return 'bg-amber-50 border-amber-100';
      case 'success':
        return 'bg-emerald-50 border-emerald-100';
      default:
        return 'bg-indigo-50 border-indigo-100';
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50/50">
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 p-6 space-y-8 shrink-0">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3 px-2">
          <div className="h-9 w-9 bg-brand-dark rounded-xl flex items-center justify-center text-white shadow-sm font-bold text-lg">
            H
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-slate-900 block">HOTELFLOW</span>
            <span className="text-xs text-indigo-600 font-medium tracking-wider uppercase block -mt-1">PMS & CRM</span>
          </div>
        </div>

        {/* Sede Selector */}
        <div className="relative">
          <button
            onClick={() => setShowSedeDropdown(!showSedeDropdown)}
            className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl text-sm font-medium text-slate-700 transition border border-slate-100"
          >
            <div className="flex items-center space-x-2.5 truncate">
              <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
              <span className="truncate text-slate-800">{currentSede?.name}</span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 shrink-0 ml-1" />
          </button>
          
          <AnimatePresence>
            {showSedeDropdown && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSedeDropdown(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: 0.15 }}
                  className="absolute left-0 right-0 mt-1 bg-white border border-slate-100 rounded-xl shadow-lg z-20 overflow-hidden py-1"
                >
                  {sedes.map((sede) => (
                    <button
                      key={sede.id}
                      onClick={() => {
                        setCurrentSede(sede);
                        setShowSedeDropdown(false);
                      }}
                      className="w-full flex items-center justify-between px-4 py-2 text-sm text-left hover:bg-slate-50 text-slate-700 transition"
                    >
                      <span className={currentSede?.id === sede.id ? 'font-semibold text-slate-950' : ''}>
                        {sede.name}
                      </span>
                      {currentSede?.id === sede.id && (
                        <Check className="h-4 w-4 text-indigo-600" />
                      )}
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 space-y-1">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-2">
            Navegación
          </div>
          {navigation
            .filter((item) => item.roles.includes(activeRole) || activeRole === 'admin')
            .map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-brand-dark text-white shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <item.icon
                    className={`h-5 w-5 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  <span>{item.name}</span>
                </Link>
              );
            })}

          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-3 pt-6 mb-2">
            Enlaces Externos
          </div>
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition"
          >
            <div className="flex items-center space-x-3">
              <CalendarDays className="h-5 w-5 text-slate-400" />
              <span>Reserva Online (Web)</span>
            </div>
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
          </Link>
          <div className="px-3 pt-2">
            <span className="text-[10px] text-slate-400 block">QR de Habitaciones:</span>
            <div className="mt-1 space-y-1 max-h-32 overflow-y-auto border border-slate-100 rounded-lg p-1 bg-slate-50">
              {rooms.map((room) => (
                <Link
                  key={room.id}
                  href={`/room/${room.number}`}
                  target="_blank"
                  className="flex items-center justify-between px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-white hover:text-indigo-600 rounded transition border border-transparent hover:border-slate-100"
                >
                  <span>Habitación {room.number}</span>
                  <ExternalLink className="h-3 w-3 opacity-60" />
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Demo Mode Badge */}
        <div className="bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 text-center">
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-800 mb-1.5">
            Demo Local Storage
          </span>
          <p className="text-[11px] text-indigo-900 leading-normal">
            Toda la información se persiste en tu navegador.
          </p>
        </div>
      </aside>

      {/* Header and Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-100 flex items-center justify-between px-6 shrink-0 z-20">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-50 rounded-xl"
            >
              <Menu className="h-5 w-5" />
            </button>
            <h1 className="text-sm font-semibold text-slate-800 hidden md:block">
              {pathname === '/reception' && 'Recepción / Mapa en Vivo'}
              {pathname === '/dashboard' && 'Panel Administrativo'}
              {pathname === '/housekeeping' && 'Gestión de Limpieza & Mantenimiento'}
            </h1>
          </div>

          {/* Quick Role Switcher Header & Alerts */}
          <div className="flex items-center space-x-4">
            {/* Role quick switch tabs */}
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-150">
              <button
                onClick={() => {
                  setActiveRole('reception');
                  router.push('/reception');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeRole === 'reception'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Recepción
              </button>
              <button
                onClick={() => {
                  setActiveRole('admin');
                  router.push('/dashboard');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeRole === 'admin'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Admin
              </button>
              <button
                onClick={() => {
                  setActiveRole('housekeeping');
                  router.push('/housekeeping');
                }}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  activeRole === 'housekeeping'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Limpieza
              </button>
            </div>

            {/* Notification Center */}
            <div className="relative">
              <button
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="p-2 text-slate-600 hover:bg-slate-50 rounded-xl relative transition"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications.length > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-rose-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold leading-none pulse-soft">
                    {unreadNotifications.length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {showNotifDropdown && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setShowNotifDropdown(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden"
                    >
                      <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-900">Alertas en tiempo real</span>
                        {notifications.length > 0 && (
                          <button
                            onClick={clearAllNotifications}
                            className="text-[11px] text-indigo-600 hover:text-indigo-800 font-medium"
                          >
                            Limpiar todo
                          </button>
                        )}
                      </div>
                      <div className="divide-y divide-slate-50 max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-8 text-center text-slate-400">
                            <Bell className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                            <p className="text-xs font-medium">No hay notificaciones activas</p>
                          </div>
                        ) : (
                          notifications.map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-3.5 flex items-start space-x-3 border-l-4 transition hover:bg-slate-55 ${getNotifBg(
                                notif.type
                              )}`}
                            >
                              <div className="shrink-0 mt-0.5">{getNotifIcon(notif.type)}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-semibold text-slate-900">{notif.title}</p>
                                <p className="text-[11px] text-slate-600 leading-normal mt-0.5">
                                  {notif.message}
                                </p>
                                <span className="text-[9px] text-slate-400 block mt-1">
                                  {notif.timestamp}
                                </span>
                              </div>
                              <button
                                onClick={() => clearNotification(notif.id)}
                                className="text-slate-400 hover:text-slate-600 p-1"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">
          {children}
        </main>
      </div>

      {/* Mobile Menu Backdrop & Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black z-30 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-64 bg-white z-40 p-6 flex flex-col space-y-6 md:hidden shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                    H
                  </div>
                  <span className="font-bold text-base text-slate-900">HOTELFLOW</span>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Sede selector */}
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Sede
                </span>
                <select
                  value={currentSede?.id}
                  onChange={(e) => {
                    const match = sedes.find(s => s.id === e.target.value);
                    if (match) setCurrentSede(match);
                  }}
                  className="w-full text-xs font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-2.5 outline-none"
                >
                  {sedes.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              {/* Sidebar Nav */}
              <nav className="flex-1 space-y-1">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Navegación
                </div>
                {navigation
                  .filter((item) => item.roles.includes(activeRole) || activeRole === 'admin')
                  .map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                        }`}
                      >
                        <item.icon className="h-5 w-5 shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    );
                  })}

                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider pt-6 mb-2">
                  Enlaces Externos
                </div>
                <Link
                  href="/"
                  target="_blank"
                  className="flex items-center justify-between px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 rounded-xl"
                >
                  <div className="flex items-center space-x-3">
                    <CalendarDays className="h-5 w-5 text-slate-400" />
                    <span>Reserva Online</span>
                  </div>
                  <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
                </Link>
              </nav>

              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 text-center">
                <span className="text-[10px] font-bold text-indigo-800">Demo Local Storage</span>
                <p className="text-[11px] text-indigo-900 mt-1">
                  Persistencia local activa en el navegador.
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
