'use client';

import React, { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useApp } from '@/context/AppContext';
import { Room, Guest, Product, Booking } from '@/lib/db';
import {
  UserPlus,
  LogOut,
  Sparkles,
  Wrench,
  Clock,
  Plus,
  Check,
  CreditCard,
  User,
  Shield,
  Smartphone,
  Phone,
  Search,
  ChevronRight,
  AlertOctagon,
  Eye,
  Info,
  Volume2,
  CalendarDays,
  Mail
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReceptionPage() {
  const {
    rooms,
    roomTypes,
    guests,
    stays,
    products,
    consumptions,
    incidents,
    checkIn,
    checkOut,
    extendStay,
    addRoomServiceOrder,
    deliverOrder,
    startRoomCleanup,
    finishRoomCleanup,
    reportIncident,
    resolveIncident,
    toggleNoDisturb,
    activeRole,
    registerStayPayment,
    bookings,
    updateBookingStatus
  } = useApp();

  // Filters
  const [filterFloor, setFilterFloor] = useState<number | 'all'>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  
  // Web Bookings States
  const [showBookingsDrawer, setShowBookingsDrawer] = useState(false);
  const [selectedBookingForCheckIn, setSelectedBookingForCheckIn] = useState<Booking | null>(null);
  const [overridePrice, setOverridePrice] = useState<number | null>(null);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Record<string, string>>({});
  
  // Selection
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [showCheckInModal, setShowCheckInModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  
  // Check-In Form
  const [guestName, setGuestName] = useState('');
  const [guestDni, setGuestDni] = useState('');
  const [guestPhone, setGuestPhone] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestAddress, setGuestAddress] = useState('');
  const [guestNotes, setGuestNotes] = useState('');
  const [companionName, setCompanionName] = useState('');
  const [companionDni, setCompanionDni] = useState('');
  const [stayDuration, setStayDuration] = useState<number>(6); // Default 6h
  const [customDuration, setCustomDuration] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState('Efectivo');
  const [isPrepaid, setIsPrepaid] = useState(true);
  
  // Manual Consumption Form
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [productQty, setProductQty] = useState<number>(1);

  // Incident Form inside Room
  const [incidentDesc, setIncidentDesc] = useState('');
  const [incidentPriority, setIncidentPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');

  // Trigger search guest by DNI
  const handleDniSearch = () => {
    const existing = guests.find((g) => g.document_id === guestDni);
    if (existing) {
      setGuestName(existing.name);
      setGuestPhone(existing.phone || '');
      setGuestEmail(existing.email || '');
      setGuestAddress(existing.address || '');
      setGuestNotes(existing.notes || '');
    }
  };

  const getDurationHours = () => {
    return stayDuration === -1 ? Number(customDuration) || 1 : stayDuration;
  };

  // Pricing helper
  const getStayCost = (room: Room, hours: number) => {
    const type = roomTypes.find((t) => t.id === room.type_id);
    if (!type) return 0;
    if (hours <= 6) return type.price_6h || 0;
    if (hours <= 12) return type.price_12h || 0;
    if (hours <= 24) return type.price_24h || 0;
    return (type.price_24h || 0) + (hours - 24) * (type.price_custom_hour || 0);
  };

  const currentDurationHours = getDurationHours();
  const calculatedRoomCost = overridePrice !== null
    ? overridePrice
    : (selectedRoom ? getStayCost(selectedRoom, currentDurationHours) : 0);

  // Active stay data for selected room
  const activeStay = selectedRoom
    ? stays.find((s) => s.id === selectedRoom.current_stay_id && s.status === 'active')
    : null;

  const activeGuest = activeStay
    ? guests.find((g) => g.id === activeStay.guest_id)
    : null;

  const activeConsumptions = activeStay
    ? consumptions.filter((c) => c.stay_id === activeStay.id)
    : [];

  const consumptionsTotal = activeConsumptions.reduce(
    (acc, c) => acc + (c.quantity || 0) * (c.unit_price || 0),
    0
  );

  // Bill calculations for payment desegregation
  const pendingConsumptionsCost = activeConsumptions
    .filter((c) => c.payment_status !== 'paid')
    .reduce((acc, c) => acc + (c.quantity || 0) * (c.unit_price || 0), 0);

  const roomPendingCost = (activeStay && !activeStay.room_paid) ? (activeStay.room_cost || 0) : 0;
  const totalPending = roomPendingCost + pendingConsumptionsCost;
  const totalPaid = activeStay ? (activeStay.total_paid || 0) : 0;
  const totalBill = activeStay ? ((activeStay.room_cost || 0) + consumptionsTotal) : 0;

  // Real-time ticking remaining hours for rendering
  const [timeTicker, setTimeTicker] = useState(new Date().getTime());
  useEffect(() => {
    const timer = setInterval(() => setTimeTicker(new Date().getTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getRemainingTimeStr = (expectedCheckoutIso: string) => {
    const expected = new Date(expectedCheckoutIso).getTime();
    const diff = expected - timeTicker;
    if (diff <= 0) return 'Expirado';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const getStayProgress = (checkInIso: string, expectedCheckoutIso: string) => {
    const start = new Date(checkInIso).getTime();
    const end = new Date(expectedCheckoutIso).getTime();
    const total = end - start;
    const elapsed = timeTicker - start;
    return Math.min(100, Math.max(0, (elapsed / total) * 105));
  };

  // Filter logic
  const filteredRooms = rooms.filter((r) => {
    const matchFloor = filterFloor === 'all' || r.floor === filterFloor;
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    return matchFloor && matchStatus;
  });

  const getStatusColor = (status: Room['status']) => {
    switch (status) {
      case 'Disponible':
        return { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700', dot: 'bg-emerald-500 status-dot-green' };
      case 'Ocupada':
        return { bg: 'bg-indigo-50/50', border: 'border-indigo-150', text: 'text-indigo-800', dot: 'bg-indigo-600 status-dot-blue' };
      case 'Limpieza':
        return { bg: 'bg-amber-50', border: 'border-amber-100', text: 'text-amber-700', dot: 'bg-amber-500 status-dot-yellow' };
      case 'Mantenimiento':
        return { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700', dot: 'bg-rose-500 status-dot-red' };
      case 'Reservada':
        return { bg: 'bg-indigo-50/20', border: 'border-indigo-100', text: 'text-indigo-600', dot: 'bg-indigo-400' };
      default:
        return { bg: 'bg-slate-100', border: 'border-slate-200', text: 'text-slate-600', dot: 'bg-slate-400' };
    }
  };

  const resetCheckInForm = () => {
    setGuestName('');
    setGuestDni('');
    setGuestPhone('');
    setGuestEmail('');
    setGuestAddress('');
    setGuestNotes('');
    setCompanionName('');
    setCompanionDni('');
    setStayDuration(6);
    setCustomDuration('');
    setPaymentMethod('Efectivo');
    setIsPrepaid(true);
    setSelectedBookingForCheckIn(null);
    setOverridePrice(null);
  };

  const handleCloseCheckInModal = () => {
    setShowCheckInModal(false);
    setSelectedRoom(null);
    resetCheckInForm();
  };

  // Submit Check-In
  const handleCheckInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoom || !guestName || !guestDni) return;

    checkIn(
      selectedRoom.id,
      {
        name: guestName,
        document_id: guestDni,
        phone: guestPhone,
        email: guestEmail,
        address: guestAddress,
        notes: guestNotes,
      },
      currentDurationHours,
      calculatedRoomCost,
      paymentMethod,
      companionName || undefined,
      companionDni || undefined,
      isPrepaid
    );

    if (selectedBookingForCheckIn) {
      updateBookingStatus(selectedBookingForCheckIn.id, 'checked_in');
    }

    handleCloseCheckInModal();
  };

  // Submit manual product consumption
  const handleAddConsumption = () => {
    if (!selectedRoom || !selectedRoom.current_stay_id || !selectedProduct) return;

    const prod = products.find((p) => p.id === selectedProduct);
    if (prod && productQty > prod.stock) {
      alert(`No hay suficiente stock disponible. Stock actual: ${prod.stock} u`);
      return;
    }

    addRoomServiceOrder(selectedRoom.id, selectedProduct, productQty);
    setSelectedProduct('');
    setProductQty(1);
  };

  // Submit incident reporting
  const handleAddIncident = () => {
    if (!selectedRoom || !incidentDesc) return;
    reportIncident(selectedRoom.id, incidentDesc, incidentPriority);
    setIncidentDesc('');
    setShowDetailsModal(false);
    setSelectedRoom(null);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Filters and Search Bar */}
        <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
          {/* Status Tabs */}
          <div className="flex bg-slate-50 p-1 rounded-xl text-xs font-semibold border border-slate-100 w-full md:w-auto overflow-x-auto">
            {['all', 'Disponible', 'Ocupada', 'Limpieza', 'Mantenimiento', 'Reservada'].map((status) => (
              <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-3 py-1.5 rounded-lg capitalize whitespace-nowrap transition-all ${
                  filterStatus === status
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200/50'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {status === 'all' ? 'Ver Todos' : status}
              </button>
            ))}
          </div>

          {/* Floor selector */}
          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <button
              onClick={() => setShowBookingsDrawer(true)}
              className="flex items-center space-x-2 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition relative mr-2"
            >
              <CalendarDays className="h-4 w-4" />
              <span>Reservas Web</span>
              {bookings.filter(b => b.status === 'confirmed').length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-extrabold text-white shadow-sm ring-2 ring-white animate-pulse">
                  {bookings.filter(b => b.status === 'confirmed').length}
                </span>
              )}
            </button>

            <span className="text-xs text-slate-400 font-bold uppercase tracking-wide">Piso:</span>
            <select
              value={filterFloor}
              onChange={(e) => setFilterFloor(e.target.value === 'all' ? 'all' : Number(e.target.value))}
              className="text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 min-w-32"
            >
              <option value="all">Todos los pisos</option>
              <option value={1}>1er Piso</option>
              <option value={2}>2do Piso</option>
              <option value={3}>3er Piso</option>
            </select>
          </div>
        </div>

        {/* Room Board Map */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredRooms.map((room) => {
            const statusConfig = getStatusColor(room.status);
            const type = roomTypes.find((t) => t.id === room.type_id);
            const stay = stays.find((s) => s.id === room.current_stay_id && s.status === 'active');
            const pendingConsumptions = stay
              ? consumptions.filter((c) => c.stay_id === stay.id && c.status === 'pending')
              : [];
            const hasPendingOrders = pendingConsumptions.length > 0;

            const cardBorder = hasPendingOrders
              ? 'border-amber-400 ring-2 ring-amber-300/40 shadow-[0_0_18px_rgba(245,158,11,0.55)]'
              : statusConfig.border;
            const cardBg = hasPendingOrders ? 'bg-amber-50/45' : statusConfig.bg;

            return (
              <motion.div
                key={room.id}
                layoutId={`room-card-${room.id}`}
                onClick={() => {
                  setSelectedRoom(room);
                  if (room.status === 'Disponible') {
                    setShowCheckInModal(true);
                  } else {
                    setShowDetailsModal(true);
                  }
                }}
                className={`rounded-2xl border ${cardBorder} ${cardBg} p-4 flex flex-col justify-between h-48 cursor-pointer relative overflow-hidden transition-all glass-card-hover group ${
                  hasPendingOrders ? 'animate-[pulse_3s_infinite]' : 'shadow-sm hover:shadow-md'
                }`}
              >
                {/* Stay progress bar behind room cards */}
                {room.status === 'Ocupada' && stay && !hasPendingOrders && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-200 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${getStayProgress(stay.check_in_time, stay.expected_check_out_time)}%` }}
                      className="h-full bg-indigo-500 rounded-full"
                    />
                  </div>
                )}

                {/* Top: Number & Type */}
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-bold tracking-tight text-slate-800 flex items-center gap-1.5">
                      {room.number}
                      {hasPendingOrders && (
                        <span className="inline-flex items-center space-x-0.5 text-[9px] font-extrabold bg-amber-500 text-white px-1.5 py-0.5 rounded-full animate-bounce shadow-sm border border-amber-300">
                          <span>🔔</span>
                          <span>{pendingConsumptions.reduce((sum, c) => sum + c.quantity, 0)}</span>
                        </span>
                      )}
                    </span>
                    <span className="inline-flex items-center text-[10px] font-semibold tracking-wider uppercase bg-white border border-slate-100 text-slate-500 px-2 py-0.5 rounded-md">
                      Piso {room.floor}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium block mt-1">
                    {type?.name}
                  </span>
                </div>

                {/* Live Info details */}
                <div className="space-y-1.5 z-10">
                  {hasPendingOrders && (
                    <div className="bg-amber-100/90 border border-amber-300 p-2 rounded-xl flex items-center space-x-1.5 text-amber-900 font-bold text-[10px] shadow-sm">
                      <span className="animate-bounce">🍽️</span>
                      <span>Room Service pendiente</span>
                    </div>
                  )}

                  {room.status === 'Ocupada' && stay && !hasPendingOrders && (
                    <div className="bg-white/80 border border-slate-100 p-1.5 rounded-lg flex items-center space-x-1.5">
                      <Clock className="h-3 w-3 text-indigo-500 shrink-0" />
                      <span className="text-[10px] font-bold text-slate-700 font-mono tracking-tight shrink-0">
                        {getRemainingTimeStr(stay.expected_check_out_time)}
                      </span>
                    </div>
                  )}

                  {room.status === 'Limpieza' && (
                    <div className="flex items-center space-x-1.5 text-amber-600 font-semibold text-[10px]">
                      <Sparkles className="h-3 w-3 animate-spin shrink-0" />
                      <span>Limpieza pendiente</span>
                    </div>
                  )}

                  {room.status === 'Mantenimiento' && (
                    <div className="flex items-center space-x-1.5 text-rose-600 font-semibold text-[10px]">
                      <Wrench className="h-3 w-3 shrink-0" />
                      <span>Pendiente reparación</span>
                    </div>
                  )}

                  {room.no_disturb && (
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-500 text-white uppercase tracking-wider">
                      No Molestar
                    </span>
                  )}
                </div>

                {/* Footer: status pill */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100/50 mt-2">
                  <div className="flex items-center space-x-1.5">
                    <span className={`h-2 w-2 rounded-full ${statusConfig.dot}`} />
                    <span className={`text-[10px] font-bold uppercase tracking-wider ${statusConfig.text}`}>
                      {room.status}
                    </span>
                  </div>
                  
                  {/* Price info for quick glance */}
                  <span className="text-[10px] text-slate-400 font-medium">
                    S/ {type?.price_6h} / 6h
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* --- MODAL 1: CHECK-IN --- */}
        <AnimatePresence>
          {showCheckInModal && selectedRoom && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={handleCloseCheckInModal} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl border border-slate-100 w-full max-w-2xl z-10 overflow-hidden shadow-2xl relative my-auto max-h-[90vh] flex flex-col"
              >
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Check-In Habitación {selectedRoom.number}
                    </h3>
                    <p className="text-xs text-slate-500">Asigna un huésped y calcula su tiempo de hospedaje.</p>
                  </div>
                  <button
                    onClick={handleCloseCheckInModal}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl"
                  >
                    Esc
                  </button>
                </div>

                <form onSubmit={handleCheckInSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto">
                  {/* Vincular Reserva Web */}
                  {bookings.filter(b => b.status === 'confirmed' && b.room_type_id === selectedRoom.type_id).length > 0 && (
                    <div className="col-span-full bg-indigo-50/50 border border-indigo-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm mb-2 animate-fade-in">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-indigo-100 rounded-xl text-indigo-700">
                          <CalendarDays className="h-5 w-5" />
                        </div>
                        <div>
                          <span className="text-xs font-bold text-slate-800 block">¿Vincular a una Reserva Web?</span>
                          <span className="text-[10px] text-slate-500 block">Importa automáticamente los datos del huésped desde su reserva online.</span>
                        </div>
                      </div>
                      <select
                        value={selectedBookingForCheckIn?.id || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (!val) {
                            setSelectedBookingForCheckIn(null);
                            setOverridePrice(null);
                            resetCheckInForm();
                          } else {
                            const booking = bookings.find(b => b.id === val);
                            if (booking) {
                              setSelectedBookingForCheckIn(booking);
                              setOverridePrice(booking.total_price);
                              setGuestName(booking.name);
                              setGuestEmail(booking.email);
                              setGuestPhone(booking.phone);
                              // Calculate duration
                              const checkInMs = new Date(booking.check_in_date).getTime();
                              const checkOutMs = new Date(booking.check_out_date).getTime();
                              const diffMs = checkOutMs - checkInMs;
                              const durationHours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
                              if (durationHours === 6 || durationHours === 12 || durationHours === 24) {
                                setStayDuration(durationHours);
                                setCustomDuration('');
                              } else {
                                setStayDuration(-1);
                                setCustomDuration(durationHours.toString());
                              }
                            }
                          }
                        }}
                        className="text-xs font-bold p-2.5 bg-white border border-slate-200 rounded-xl outline-none text-slate-700 min-w-[200px]"
                      >
                        <option value="">-- No vincular --</option>
                        {bookings
                          .filter(b => b.status === 'confirmed' && b.room_type_id === selectedRoom.type_id)
                          .map(b => (
                            <option key={b.id} value={b.id}>
                              {b.name} - S/ {b.total_price}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}

                  {/* Left Column: Guest Data (CRM) */}
                  <div className="space-y-4">
                    <div className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                      Datos del Huésped
                    </div>
                    
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                        DNI / Documento
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          required
                          value={guestDni}
                          onChange={(e) => setGuestDni(e.target.value)}
                          placeholder="ej. 45829104"
                          className="flex-1 text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={handleDniSearch}
                          className="px-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600 rounded-xl text-xs flex items-center transition"
                        >
                          <Search className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={guestName}
                        onChange={(e) => setGuestName(e.target.value)}
                        placeholder="ej. Carlos Mendoza"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                          Teléfono
                        </label>
                        <input
                          type="text"
                          value={guestPhone}
                          onChange={(e) => setGuestPhone(e.target.value)}
                          placeholder="+51 987..."
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                          Correo
                        </label>
                        <input
                          type="email"
                          value={guestEmail}
                          onChange={(e) => setGuestEmail(e.target.value)}
                          placeholder="carlos@..."
                          className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                        Observaciones
                      </label>
                      <textarea
                        value={guestNotes}
                        onChange={(e) => setGuestNotes(e.target.value)}
                        placeholder="Notas adicionales o requerimientos..."
                        rows={2}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
                      />
                    </div>

                    {/* Acompañante */}
                    <div className="border-t border-slate-100 pt-4 space-y-3">
                      <div className="text-xs font-bold text-indigo-700 uppercase tracking-wide">
                        Datos del Acompañante (Opcional)
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                            DNI Acompañante
                          </label>
                          <input
                            type="text"
                            value={companionDni}
                            onChange={(e) => setCompanionDni(e.target.value)}
                            placeholder="ej. 76543210"
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                            Nombre Acompañante
                          </label>
                          <input
                            type="text"
                            value={companionName}
                            onChange={(e) => setCompanionName(e.target.value)}
                            placeholder="ej. Ana Mendoza"
                            className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Time & Billing */}
                  <div className="space-y-4 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-indigo-700 uppercase tracking-wide mb-3">
                        Tiempo de Hospedaje
                      </div>
                      
                      {/* Duration grid selector */}
                      <div className="grid grid-cols-3 gap-2">
                        {[6, 12, 24].map((h) => (
                          <button
                            key={h}
                            type="button"
                            onClick={() => {
                              setStayDuration(h);
                              setCustomDuration('');
                            }}
                            className={`py-2 border rounded-xl text-xs font-bold transition-all ${
                              stayDuration === h
                                ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            {h} Horas
                          </button>
                        ))}
                      </div>

                      {/* Custom hour input */}
                      <div className="mt-3">
                        <button
                          type="button"
                          onClick={() => setStayDuration(-1)}
                          className={`w-full py-1.5 border rounded-xl text-[11px] font-semibold mb-2 transition-all ${
                            stayDuration === -1
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-700 font-bold'
                              : 'bg-slate-50 border-transparent text-slate-500'
                          }`}
                        >
                          Usar tiempo personalizado
                        </button>
                        {stayDuration === -1 && (
                          <div className="flex space-x-2 items-center">
                            <input
                              type="number"
                              value={customDuration}
                              onChange={(e) => setCustomDuration(e.target.value)}
                              placeholder="ej. 36"
                              className="w-20 text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg outline-none"
                            />
                            <span className="text-xs text-slate-500 font-medium">horas de estadía</span>
                          </div>
                        )}
                      </div>

                      {/* Calculation results */}
                      <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-150 space-y-2">
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Hora de ingreso:</span>
                          <span className="font-semibold text-slate-800">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Salida estimada:</span>
                          <span className="font-semibold text-indigo-600">
                            {new Date(
                              Date.now() + currentDurationHours * 60 * 60 * 1000
                            ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} (
                            {new Date(
                              Date.now() + currentDurationHours * 60 * 60 * 1000
                            ).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                            )
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Payment methods & Confirm */}
                    <div className="border-t border-slate-100 pt-4 space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                          Método de Pago
                        </label>
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          {['Efectivo', 'Tarjeta', 'Transferencia'].map((method) => (
                            <button
                              key={method}
                              type="button"
                              onClick={() => setPaymentMethod(method)}
                              className={`py-1.5 border rounded-lg text-[10px] font-bold transition-all ${
                                paymentMethod === method
                                  ? 'bg-slate-900 border-slate-900 text-white'
                                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                              }`}
                            >
                              {method}
                            </button>
                          ))}
                        </div>
                        <label className="flex items-center space-x-2.5 cursor-pointer bg-slate-50 hover:bg-slate-100/80 p-2.5 rounded-xl border border-slate-200/50 transition">
                          <input
                            type="checkbox"
                            checked={isPrepaid}
                            onChange={(e) => setIsPrepaid(e.target.checked)}
                            className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 h-4.5 w-4.5 accent-indigo-600 cursor-pointer"
                          />
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">Pago anticipado de hospedaje</span>
                            <span className="text-[10px] text-slate-550 block -mt-0.5">El huésped cancela la habitación al ingresar</span>
                          </div>
                        </label>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-left">
                          <span className="text-[10px] text-slate-400 font-bold block">TARIFA CALCULADA</span>
                          <span className="text-xl font-bold text-slate-900">S/ {(calculatedRoomCost || 0).toFixed(2)}</span>
                        </div>
                        <button
                          type="submit"
                          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-md"
                        >
                          Confirmar Ingreso
                        </button>
                      </div>
                    </div>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- MODAL 2: ROOM DETAILS / CHECK-OUT / SERVICE --- */}
        <AnimatePresence>
          {showDetailsModal && selectedRoom && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => { setShowDetailsModal(false); setSelectedRoom(null); }} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="bg-white rounded-3xl border border-slate-100 w-full max-w-3xl z-10 overflow-hidden shadow-2xl relative my-auto"
              >
                <div className="px-6 py-4 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-bold text-base text-slate-900">
                      Habitación {selectedRoom.number}
                    </h3>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-700">
                      {selectedRoom.status}
                    </span>
                    {selectedRoom.no_disturb && (
                      <span className="bg-rose-500 text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                        No Molestar
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => { setShowDetailsModal(false); setSelectedRoom(null); }}
                    className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                  >
                    Cerrar
                  </button>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 max-h-[550px] overflow-y-auto">
                  {/* Left panel: Guest info & bill details (Col span 7) */}
                  <div className="md:col-span-7 space-y-6">
                    {/* Guest info card */}
                    {activeGuest && activeStay ? (
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] text-indigo-700 font-bold block">HUESPED PRINCIPAL</span>
                            <h4 className="font-bold text-sm text-slate-900">{activeGuest.name}</h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">DNI: {activeGuest.document_id} | Cel: {activeGuest.phone || 'N/A'}</p>
                          </div>
                          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-semibold px-2 py-0.5 rounded">
                            {activeStay.duration_hours} horas
                          </span>
                        </div>
                        {activeGuest.notes && (
                          <div className="border-t border-slate-200/50 pt-2 text-[11px] text-slate-600 italic">
                            &quot;{activeGuest.notes}&quot;
                          </div>
                        )}

                        {/* Companion Info */}
                        {(activeStay.companion_name || activeStay.companion_dni) && (
                          <div className="border-t border-slate-200/50 pt-2.5">
                            <span className="text-[10px] text-indigo-700 font-bold block">ACOMPAÑANTE</span>
                            <h4 className="font-bold text-sm text-slate-900">
                              {activeStay.companion_name || 'Sin nombre registrado'}
                            </h4>
                            {activeStay.companion_dni && (
                              <p className="text-[11px] text-slate-500 mt-0.5">
                                DNI: {activeStay.companion_dni}
                              </p>
                            )}
                          </div>
                        )}
                        
                        {/* Countdown card */}
                        <div className="flex items-center space-x-2 pt-2 border-t border-slate-200/50 text-xs">
                          <Clock className="h-4 w-4 text-indigo-600" />
                          <span className="text-slate-500 font-medium">Salida:</span>
                          <span className="font-bold font-mono text-slate-800">
                            {getRemainingTimeStr(activeStay.expected_check_out_time)}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                        <Info className="h-5 w-5 mx-auto text-slate-400 mb-2" />
                        <span className="text-xs text-slate-500 font-medium block">
                          No hay un hospedaje activo registrado.
                        </span>
                      </div>
                    )}

                    {/* Room service consumables details */}
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                          Consumos y Servicios
                        </h4>
                        {activeConsumptions.length > 0 && (
                          <div className="flex space-x-2 text-[10px] font-bold">
                            <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                              Pendientes: {activeConsumptions.filter(c => c.status === 'pending').length}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-250 animate-pulse">
                              Despachados: {activeConsumptions.filter(c => c.status === 'delivered').length}
                            </span>
                          </div>
                        )}
                      </div>

                      {activeConsumptions.length === 0 ? (
                        <p className="text-xs text-slate-400 italic bg-slate-50 border border-slate-100 rounded-xl p-3 text-center">
                          No se han registrado consumos en esta estadía.
                        </p>
                      ) : (
                        <div className="space-y-4">
                          {/* Pending Section */}
                          {activeConsumptions.some((c) => c.status === 'pending') && (
                            <div className="border border-amber-200 bg-amber-50/5 rounded-2xl p-3 space-y-2">
                              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider block mb-1">
                                Pedidos por Entregar (Pendientes)
                              </span>
                              <div className="space-y-2 max-h-36 overflow-y-auto">
                                {activeConsumptions
                                  .filter((c) => c.status === 'pending')
                                  .map((cons) => {
                                    const p = products.find((prod) => prod.id === cons.product_id);
                                    const isPaid = cons.payment_status === 'paid';
                                    return (
                                      <div
                                        key={cons.id}
                                        className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-b-0"
                                      >
                                        <div>
                                          <span className="font-bold text-slate-800 bg-amber-100 px-1.5 py-0.5 rounded mr-1">
                                            {cons.quantity}x
                                          </span>{' '}
                                          <span className="text-slate-700 font-semibold">{p?.name || 'Producto'}</span>
                                          <span className={`ml-2 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                            isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                                          }`}>
                                            {isPaid ? 'Pagado' : 'Pendiente'}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                          <span className="font-semibold text-slate-800">S/ {((cons.quantity * cons.unit_price) || 0).toFixed(2)}</span>
                                          <button
                                            onClick={() => deliverOrder(cons.id)}
                                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-[10px] font-bold transition-all shadow-sm flex items-center space-x-1"
                                          >
                                            <span>🚚</span> <span>Despachar</span>
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}

                          {/* Delivered Section */}
                          {activeConsumptions.some((c) => c.status === 'delivered') && (
                            <div className="border border-slate-150 rounded-2xl p-3 bg-slate-50/40 space-y-2">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block mb-1">
                                Pedidos Despachados
                              </span>
                              <div className="space-y-2 max-h-36 overflow-y-auto">
                                {activeConsumptions
                                  .filter((c) => c.status === 'delivered')
                                  .map((cons) => {
                                    const p = products.find((prod) => prod.id === cons.product_id);
                                    const isPaid = cons.payment_status === 'paid';
                                    return (
                                      <div
                                        key={cons.id}
                                        className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 last:border-b-0 opacity-80"
                                      >
                                        <div>
                                          <span className="font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded mr-1">
                                            {cons.quantity}x
                                          </span>{' '}
                                          <span className="text-slate-500 line-through">{p?.name || 'Producto'}</span>
                                          <span className={`ml-2 text-[9px] font-bold px-1.5 py-0.2 rounded uppercase ${
                                            isPaid ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                                          }`}>
                                            {isPaid ? 'Pagado' : 'Pendiente'}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-3">
                                          <span className="font-medium text-slate-500">S/ {((cons.quantity * cons.unit_price) || 0).toFixed(2)}</span>
                                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">
                                            ✓ Despachado
                                          </span>
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Live account details */}
                    {activeStay && (
                      <div className="border-t border-slate-150 pt-4 space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-200/50 mt-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">Desglose de Cuenta</span>
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Hospedaje ({activeStay.duration_hours} Horas):</span>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-slate-800">S/ {(activeStay.room_cost || 0).toFixed(2)}</span>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              activeStay.room_paid
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {activeStay.room_paid ? '✓ Pagado' : '⚠️ Pendiente'}
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-between text-xs text-slate-600">
                          <span>Consumos y Extras:</span>
                          <div className="flex items-center space-x-1.5">
                            <span className="font-semibold text-slate-800">S/ {(consumptionsTotal || 0).toFixed(2)}</span>
                            {consumptionsTotal > 0 && (
                              <span className="text-[9px] text-slate-500 font-medium">
                                ({activeConsumptions.filter(c => c.payment_status === 'paid').length} de {activeConsumptions.length} pagados)
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="border-t border-slate-200/60 my-2 pt-2 space-y-1">
                          <div className="flex justify-between text-xs text-emerald-750 font-semibold">
                            <span>Monto Pagado:</span>
                            <span>S/ {(totalPaid || 0).toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-amber-700 font-semibold">
                            <span>Monto Pendiente:</span>
                            <span className="flex items-center gap-1.5">
                              S/ {(totalPending || 0).toFixed(2)}
                              {totalPending > 0 && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-200 pt-2.5 mt-2">
                            <span>Total General (Acumulado):</span>
                            <span className="text-indigo-650 font-bold">S/ {(totalBill || 0).toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Right panel: Operations (Col span 5) */}
                  <div className="md:col-span-5 space-y-6 border-t md:border-t-0 md:border-l border-slate-100 md:pl-6 pt-6 md:pt-0">
                    
                    {/* Extension options */}
                    {activeStay && (
                      <div>
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2.5">
                          Extender Estadía
                        </h4>
                        <div className="grid grid-cols-3 gap-2">
                          {[1, 2, 6].map((h) => {
                            const extCost = getStayCost(selectedRoom, h);
                            return (
                              <button
                                key={h}
                                onClick={() => extendStay(selectedRoom.id, h, extCost)}
                                className="py-2 border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold transition flex flex-col items-center"
                              >
                                <span>+{h} Hora{h > 1 ? 's' : ''}</span>
                                <span className="text-[9px] font-semibold opacity-75">S/ {extCost}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* No disturb & Cleaning controls */}
                    <div className="space-y-2">
                      <button
                        onClick={() => toggleNoDisturb(selectedRoom.id)}
                        className={`w-full py-2 border rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 ${
                          selectedRoom.no_disturb
                            ? 'bg-rose-600 border-rose-600 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <span>{selectedRoom.no_disturb ? 'Desactivar No Molestar' : 'Activar No Molestar'}</span>
                      </button>

                      {selectedRoom.status === 'Limpieza' && (
                        <div className="space-y-2 w-full">
                          <button
                            onClick={() => {
                              startRoomCleanup(selectedRoom.id);
                              setShowDetailsModal(false);
                            }}
                            className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition"
                          >
                            Iniciar Limpieza
                          </button>
                          <button
                            onClick={() => {
                              finishRoomCleanup(selectedRoom.id);
                              setShowDetailsModal(false);
                            }}
                            className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition"
                          >
                            Finalizar y Marcar Disponible
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Add Room Service Order */}
                    {activeStay && (
                      <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-3">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Registrar Consumo</span>
                        <div className="space-y-2">
                          <select
                            value={selectedProduct}
                            onChange={(e) => setSelectedProduct(e.target.value)}
                            className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl outline-none"
                          >
                            <option value="">Seleccionar Producto...</option>
                            {products
                              .filter((p) => p.stock > 0)
                              .map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name} (S/ {(p.price || 0).toFixed(2)}) - {p.stock} u
                                </option>
                              ))}
                          </select>
                          <div className="flex space-x-2">
                            <input
                              type="number"
                              min={1}
                              max={selectedProduct ? (products.find((p) => p.id === selectedProduct)?.stock || 1) : 1}
                              value={productQty}
                              onChange={(e) => setProductQty(Number(e.target.value))}
                              className="w-16 text-xs p-2 bg-white border border-slate-200 rounded-xl outline-none"
                            />
                            <button
                              onClick={handleAddConsumption}
                              disabled={!selectedProduct}
                              className="flex-1 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition flex items-center justify-center space-x-1"
                            >
                              <Plus className="h-4 w-4" /> <span>Cargar a Cuenta</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Report Incident / Maintenance block */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Reportar Incidencia</span>
                      <input
                        type="text"
                        value={incidentDesc}
                        onChange={(e) => setIncidentDesc(e.target.value)}
                        placeholder="ej. Falla en ducha, TV rota..."
                        className="w-full text-xs p-2 bg-white border border-slate-200 rounded-xl outline-none"
                      />
                      <div className="flex space-x-2">
                        <select
                          value={incidentPriority}
                          onChange={(e) => setIncidentPriority(e.target.value as any)}
                          className="text-[11px] p-2 bg-white border border-slate-200 rounded-xl outline-none text-slate-600 flex-1"
                        >
                          <option value="low">Prioridad Baja</option>
                          <option value="medium">Media</option>
                          <option value="high">Alta</option>
                          <option value="critical">Crítica</option>
                        </select>
                        <button
                          onClick={handleAddIncident}
                          disabled={!incidentDesc}
                          className="bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold px-3 py-2 rounded-xl transition"
                        >
                          Reportar
                        </button>
                      </div>
                    </div>

                    {/* Resolve Incident if room is in Maintenance */}
                    {selectedRoom.status === 'Mantenimiento' && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide">Incidencias Activas</h4>
                        <div className="space-y-1">
                          {incidents
                            .filter((i) => i.room_id === selectedRoom.id && i.status !== 'resolved')
                            .map((inc) => (
                              <div key={inc.id} className="p-2 border border-slate-150 rounded-lg text-xs bg-white">
                                <p className="font-semibold text-slate-800">{inc.description}</p>
                                <div className="flex items-center justify-between mt-1 text-[10px]">
                                  <span className="text-rose-600 capitalize font-bold">{inc.priority}</span>
                                  <button
                                    onClick={() => {
                                      resolveIncident(inc.id);
                                      setShowDetailsModal(false);
                                    }}
                                    className="text-emerald-700 font-bold hover:underline"
                                  >
                                    Marcar Resuelta
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    )}

                    {/* Record Payment of Pendings Button */}
                    {activeStay && totalPending > 0 && (
                      <div className="pt-2">
                        <button
                          onClick={() => {
                            registerStayPayment(activeStay.id);
                          }}
                          className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow-sm"
                        >
                          <span>💳</span>
                          <span>Registrar Pago de Extras (S/ {(totalPending || 0).toFixed(2)})</span>
                        </button>
                      </div>
                    )}

                    {/* Check-Out Action Button */}
                    {activeStay && (
                      <div className="border-t border-slate-100 pt-4">
                        <button
                          onClick={() => {
                            checkOut(selectedRoom.id);
                            setShowDetailsModal(false);
                            setSelectedRoom(null);
                          }}
                          className="w-full py-3 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 shadow"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Procesar Check-Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* --- DRAWER: WEB BOOKINGS --- */}
        <AnimatePresence>
          {showBookingsDrawer && (
            <div className="fixed inset-0 z-50 overflow-hidden">
              {/* Backdrop */}
              <div 
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity" 
                onClick={() => setShowBookingsDrawer(false)} 
              />
              
              {/* Drawer Container */}
              <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="w-screen max-w-md bg-white border-l border-slate-100 shadow-2xl flex flex-col h-full"
                >
                  {/* Header */}
                  <div className="px-6 py-5 bg-slate-50 border-b border-slate-150 flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
                        <CalendarDays className="h-5 w-5 text-indigo-600" />
                        Reservas Web Activas
                      </h3>
                      <p className="text-xs text-slate-500">
                        Gestiona y realiza el ingreso de los huéspedes de la web.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowBookingsDrawer(false)}
                      className="p-1.5 text-slate-400 hover:text-slate-650 rounded-xl transition"
                    >
                      Cerrar
                    </button>
                  </div>

                  {/* Bookings List */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {bookings.filter(b => b.status === 'confirmed').length === 0 ? (
                      <div className="text-center py-12 px-4">
                        <CalendarDays className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                        <h4 className="text-sm font-semibold text-slate-700">No hay reservas web pendientes</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          Las reservas que realicen los clientes en el portal web aparecerán aquí en tiempo real.
                        </p>
                      </div>
                    ) : (
                      bookings
                        .filter(b => b.status === 'confirmed')
                        .map((booking) => {
                          const type = roomTypes.find(t => t.id === booking.room_type_id);
                          // Find available rooms of this type
                          const availableRoomsOfType = rooms.filter(
                            r => r.type_id === booking.room_type_id && r.status === 'Disponible'
                          );
                          const chosenRoomId = selectedRoomForBooking[booking.id] || '';
                          
                          // Format dates
                          const checkInDate = new Date(booking.check_in_date);
                          const checkOutDate = new Date(booking.check_out_date);
                          
                          return (
                            <div
                              key={booking.id}
                              className="bg-white border border-slate-150 rounded-2xl p-4 space-y-3.5 shadow-sm hover:shadow-md transition-all"
                            >
                              {/* Header info */}
                              <div className="flex items-start justify-between">
                                <div>
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-100 text-[10px] font-bold text-indigo-700">
                                    Habitación {type?.name || 'Estándar'}
                                  </span>
                                  <h4 className="font-bold text-sm text-slate-900 mt-1">{booking.name}</h4>
                                </div>
                                <span className="text-sm font-extrabold text-slate-800">
                                  S/ {(booking.total_price || 0).toFixed(2)}
                                </span>
                              </div>

                              {/* Contact & Date Details */}
                              <div className="space-y-1.5 text-xs text-slate-650 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                                <div className="flex items-center gap-2">
                                  <Phone className="h-3 w-3 text-slate-400 shrink-0" />
                                  <a href={`tel:${booking.phone}`} className="hover:underline hover:text-indigo-650">
                                    {booking.phone}
                                  </a>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Mail className="h-3 w-3 text-slate-450 shrink-0" />
                                  <a href={`mailto:${booking.email}`} className="hover:underline hover:text-indigo-650 truncate">
                                    {booking.email}
                                  </a>
                                </div>
                                <div className="flex items-center gap-2 mt-1 pt-1.5 border-t border-slate-200/50">
                                  <Clock className="h-3 w-3 text-indigo-500 shrink-0" />
                                  <span className="font-semibold text-slate-800">
                                    {checkInDate.toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                  </span>
                                  <span className="text-slate-400">al</span>
                                  <span className="font-semibold text-slate-800">
                                    {checkOutDate.toLocaleDateString([], { day: 'numeric', month: 'short' })}
                                  </span>
                                  <span className="text-[10px] text-slate-400 ml-auto">
                                    ({Math.max(1, Math.round((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60)))}h)
                                  </span>
                                </div>
                              </div>

                              {/* Room Assignment section */}
                              <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">
                                  Asignar Habitación Disponible
                                </label>
                                {availableRoomsOfType.length === 0 ? (
                                  <div className="p-2.5 bg-rose-50 border border-rose-100 rounded-xl text-[11px] text-rose-700 font-semibold flex items-center gap-1.5">
                                    <AlertOctagon className="h-4 w-4 shrink-0" />
                                    No hay habitaciones {type?.name} disponibles
                                  </div>
                                ) : (
                                  <select
                                    value={chosenRoomId}
                                    onChange={(e) => setSelectedRoomForBooking(prev => ({
                                      ...prev,
                                      [booking.id]: e.target.value
                                    }))}
                                    className="w-full text-xs p-2.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-semibold text-slate-800"
                                  >
                                    <option value="">-- Seleccionar Habitación --</option>
                                    {availableRoomsOfType.map(r => (
                                      <option key={r.id} value={r.id}>
                                        Habitación {r.number} (Piso {r.floor})
                                      </option>
                                    ))}
                                  </select>
                                )}
                              </div>

                              {/* Actions */}
                              <div className="flex gap-2 pt-1">
                                <button
                                  onClick={() => {
                                    if (confirm(`¿Estás seguro de cancelar la reserva de ${booking.name}?`)) {
                                      updateBookingStatus(booking.id, 'cancelled');
                                    }
                                  }}
                                  className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-650 rounded-xl text-xs font-semibold transition"
                                >
                                  Cancelar
                                </button>
                                <button
                                  disabled={!chosenRoomId}
                                  onClick={() => {
                                    const rm = rooms.find(r => r.id === chosenRoomId);
                                    if (rm) {
                                      // Pre-fill Check-in form
                                      setSelectedRoom(rm);
                                      setSelectedBookingForCheckIn(booking);
                                      setOverridePrice(booking.total_price);
                                      setGuestName(booking.name);
                                      setGuestEmail(booking.email);
                                      setGuestPhone(booking.phone);
                                      
                                      // Calculate duration
                                      const checkInMs = new Date(booking.check_in_date).getTime();
                                      const checkOutMs = new Date(booking.check_out_date).getTime();
                                      const diffMs = checkOutMs - checkInMs;
                                      const durationHours = Math.max(1, Math.round(diffMs / (1000 * 60 * 60)));
                                      
                                      if (durationHours === 6 || durationHours === 12 || durationHours === 24) {
                                        setStayDuration(durationHours);
                                        setCustomDuration('');
                                      } else {
                                        setStayDuration(-1);
                                        setCustomDuration(durationHours.toString());
                                      }
                                      
                                      // Open check-in modal and close drawer
                                      setShowCheckInModal(true);
                                      setShowBookingsDrawer(false);
                                    }
                                  }}
                                  className="flex-1.5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl text-xs font-bold transition shadow-sm"
                                >
                                  Asignar & Check-In
                                </button>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </AdminLayout>
  );
}
