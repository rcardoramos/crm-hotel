'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  Wifi,
  Tv
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';

export default function PublicBookingPage() {
  const { roomTypes, createBooking } = useApp();
  
  const [selectedType, setSelectedType] = useState<string>('type-jacuzzi');
  const [bookingType, setBookingType] = useState<'dias' | 'horas'>('dias');
  const [checkInDate, setCheckInDate] = useState<string>(
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Tomorrow
  );
  const [checkOutDate, setCheckOutDate] = useState<string>(
    new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // In 2 days
  );
  const [checkInTime, setCheckInTime] = useState<string>('12:00');
  const [durationOption, setDurationOption] = useState<number | 'custom'>(6);
  const [customHours, setCustomHours] = useState<string>('6');
  
  const [guestCount, setGuestCount] = useState<number>(2);
  const [bookingStep, setBookingStep] = useState<'details' | 'form' | 'success'>('details');

  // Form Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const activeRoomType = roomTypes.find((t) => t.id === selectedType);

  // Hours calculation details
  const hoursCount = bookingType === 'horas'
    ? (durationOption === 'custom' ? (parseInt(customHours) || 1) : durationOption)
    : 0;

  // Calculate check-out date/time for hours
  let checkOutDateTimeCalculated = new Date();
  let calculatedCheckOutDate = '';
  let calculatedCheckOutTime = '';
  if (bookingType === 'horas') {
    try {
      const [year, month, day] = checkInDate.split('-').map(Number);
      const [hours, minutes] = checkInTime.split(':').map(Number);
      const checkInDateTime = new Date(year, month - 1, day, hours, minutes);
      checkOutDateTimeCalculated = new Date(checkInDateTime.getTime() + hoursCount * 60 * 60 * 1000);
      
      const pad = (n: number) => String(n).padStart(2, '0');
      calculatedCheckOutDate = `${checkOutDateTimeCalculated.getFullYear()}-${pad(checkOutDateTimeCalculated.getMonth() + 1)}-${pad(checkOutDateTimeCalculated.getDate())}`;
      calculatedCheckOutTime = `${pad(checkOutDateTimeCalculated.getHours())}:${pad(checkOutDateTimeCalculated.getMinutes())}`;
    } catch (e) {
      console.error(e);
    }
  }

  // Calculate nights
  const date1 = new Date(checkInDate);
  const date2 = new Date(checkOutDate);
  const diffTime = Math.max(0, date2.getTime() - date1.getTime());
  const calculatedNights = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  // Calculate pricing based on booking type
  let subtotal = 0;
  if (bookingType === 'dias') {
    const roomPrice24h = activeRoomType?.price_24h || 120;
    subtotal = roomPrice24h * calculatedNights;
  } else {
    if (activeRoomType) {
      if (hoursCount <= 6) {
        subtotal = activeRoomType.price_6h;
      } else if (hoursCount <= 12) {
        subtotal = activeRoomType.price_12h;
      } else if (hoursCount <= 24) {
        subtotal = activeRoomType.price_24h;
      } else {
        subtotal = activeRoomType.price_24h + (hoursCount - 24) * activeRoomType.price_custom_hour;
      }
    } else {
      subtotal = 0;
    }
  }

  const tax = subtotal * 0.18; // 18% IGV
  const totalCost = subtotal + tax;

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      setErrorMsg('Por favor complete todos los campos obligatorios.');
      return;
    }

    const checkInToSend = bookingType === 'horas' 
      ? `${checkInDate} ${checkInTime}`
      : checkInDate;
    
    const checkOutToSend = bookingType === 'horas'
      ? `${calculatedCheckOutDate} ${calculatedCheckOutTime}`
      : checkOutDate;

    createBooking({
      name,
      email,
      phone,
      room_type_id: selectedType,
      check_in_date: checkInToSend,
      check_out_date: checkOutToSend,
      total_price: totalCost,
    });

    setBookingStep('success');
    setErrorMsg('');
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setBookingStep('details');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Header />

      {/* Hero Header */}
      <section className="bg-white pt-8 pb-10 px-6 border-b border-slate-100">
        <div className="max-w-6xl mx-auto text-center space-y-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700">
            <Sparkles className="h-3.5 w-3.5 mr-1" /> Portal de Reservas Online
          </span>
          <h1 className="text-3xl font-extrabold text-slate-900 leading-tight tracking-tight">
            Reserva tu Habitación al Instante
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Personaliza tu estadía por días o por horas según tus necesidades. Tarifas dinámicas con IGV e impuestos incluidos.
          </p>
        </div>
      </section>

      {/* Main Reservation Section */}
      <section id="catalog" className="max-w-6xl mx-auto px-6 py-12 grid grid-cols-1 lg:grid-cols-12 gap-8 w-full flex-1">
        
        {/* Rooms Listing Catalog */}
        <div className="lg:col-span-7 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-xl font-bold text-slate-900">1. Selecciona tu Habitación</h2>
            <p className="text-xs text-slate-500">Haz clic en una opción para calcular la tarifa en la calculadora.</p>
          </div>
          
          <div className="space-y-4">
            {roomTypes.map((type) => {
              const isSelected = selectedType === type.id;
              return (
                <div
                  key={type.id}
                  onClick={() => {
                    setSelectedType(type.id);
                    if (bookingStep === 'success') setBookingStep('details');
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row gap-4 bg-white ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-50 shadow-md'
                      : 'border-slate-100 hover:border-slate-200 hover:shadow-sm'
                  }`}
                >
                  <div className="w-full sm:w-44 h-32 rounded-xl overflow-hidden bg-slate-100 shrink-0 relative">
                    <img
                      src={type.images[0]}
                      alt={type.name}
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded text-[10px] font-bold text-slate-900 shadow-sm">
                      S/ {type.price_24h} / 24h
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-bold text-base text-slate-900">{type.name}</h3>
                        <span className="text-xs text-slate-500 font-semibold">S/ {type.price_6h} (6h)</span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 mt-1">
                        {type.description}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-1 mt-3">
                      {type.amenities.slice(0, 3).map((am, i) => (
                        <span
                          key={i}
                          className="inline-flex items-center px-2 py-0.5 rounded bg-slate-50 text-slate-600 text-[10px] font-medium border border-slate-100"
                        >
                          {am}
                        </span>
                      ))}
                      {type.amenities.length > 3 && (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-slate-50 text-slate-400 text-[10px]">
                          +{type.amenities.length - 3} más
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pricing Calculator & Checkout Panel */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-xl sticky top-24">
            <AnimatePresence mode="wait">
              
              {/* Step 1: Selection details & calculation */}
              {bookingStep === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-6"
                >
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">2. Detalles y Fechas</h3>
                    <p className="text-xs text-slate-500">Calcula y reserva online al instante.</p>
                  </div>

                  {activeRoomType && (
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg bg-indigo-100 overflow-hidden shrink-0">
                        <img src={activeRoomType.images[0]} className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <span className="text-[10px] text-indigo-700 font-semibold block uppercase">Seleccionado</span>
                        <span className="font-bold text-sm text-slate-800">{activeRoomType.name}</span>
                      </div>
                    </div>
                  )}

                  {/* Tipo de Reserva Toggle */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-2">
                      Modalidad de Reserva
                    </label>
                    <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-50 border border-slate-200 rounded-2xl">
                      <button
                        type="button"
                        onClick={() => setBookingType('dias')}
                        className={`py-2 text-xs font-bold rounded-xl transition-all ${
                          bookingType === 'dias'
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Por Días (Noches)
                      </button>
                      <button
                        type="button"
                        onClick={() => setBookingType('horas')}
                        className={`py-2 text-xs font-bold rounded-xl transition-all ${
                          bookingType === 'horas'
                            ? 'bg-slate-900 text-white shadow-md'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Por Horas
                      </button>
                    </div>
                  </div>

                  {/* Date/Time Inputs */}
                  {bookingType === 'dias' ? (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                          Check-in
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={checkInDate}
                            onChange={(e) => setCheckInDate(e.target.value)}
                            className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-700"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                          Check-out
                        </label>
                        <div className="relative">
                          <input
                            type="date"
                            value={checkOutDate}
                            onChange={(e) => setCheckOutDate(e.target.value)}
                            className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-700"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                            Fecha de Entrada
                          </label>
                          <div className="relative">
                            <input
                              type="date"
                              value={checkInDate}
                              onChange={(e) => setCheckInDate(e.target.value)}
                              className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-700"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                            Hora de Entrada
                          </label>
                          <div className="relative">
                            <input
                              type="time"
                              value={checkInTime}
                              onChange={(e) => setCheckInTime(e.target.value)}
                              className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-700"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Duración en Horas */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1.5">
                          Duración de la estadía
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[6, 12, 24].map((hours) => (
                            <button
                              key={hours}
                              type="button"
                              onClick={() => setDurationOption(hours)}
                              className={`py-2 text-xs font-bold rounded-xl transition-all border ${
                                durationOption === hours
                                  ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                              }`}
                            >
                              {hours}h
                            </button>
                          ))}
                          <button
                            type="button"
                            onClick={() => setDurationOption('custom')}
                            className={`py-2 text-xs font-bold rounded-xl transition-all border ${
                              durationOption === 'custom'
                                ? 'bg-slate-900 border-slate-900 text-white shadow-sm'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            Otro
                          </button>
                        </div>

                        {durationOption === 'custom' && (
                          <motion.div
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-3"
                          >
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                              Horas personalizadas
                            </label>
                            <input
                              type="number"
                              min={1}
                              max={168}
                              value={customHours}
                              onChange={(e) => setCustomHours(e.target.value)}
                              placeholder="ej. 8 o 36"
                              className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-700"
                            />
                          </motion.div>
                        )}
                      </div>

                      {/* Info Banner showing check-out time calculated */}
                      <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-center space-x-2.5">
                        <Clock className="h-4 w-4 text-indigo-600 shrink-0" />
                        <p className="text-[10px] text-indigo-950 leading-normal">
                          <strong>Salida estimada:</strong> {calculatedCheckOutDate.split('-').reverse().join('/')} a las {calculatedCheckOutTime}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Guests Input */}
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                      Huéspedes
                    </label>
                    <select
                      value={guestCount}
                      onChange={(e) => setGuestCount(Number(e.target.value))}
                      className="w-full text-xs font-semibold p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700"
                    >
                      <option value={1}>1 Huésped</option>
                      <option value={2}>2 Huéspedes</option>
                      <option value={3}>3 Huéspedes</option>
                      <option value={4}>4 Huéspedes (Familiar)</option>
                    </select>
                  </div>

                  {/* Pricing break-down */}
                  <div className="border-t border-slate-100 pt-4 space-y-2.5">
                    <div className="flex justify-between text-xs text-slate-600">
                      {bookingType === 'dias' ? (
                        <>
                          <span>S/ {activeRoomType?.price_24h || 120} x {calculatedNights} noches</span>
                          <span>S/ {subtotal.toFixed(2)}</span>
                        </>
                      ) : (
                        <>
                          <span>Tarifa por {hoursCount} horas</span>
                          <span>S/ {subtotal.toFixed(2)}</span>
                        </>
                      )}
                    </div>
                    <div className="flex justify-between text-xs text-slate-600">
                      <span>Impuestos (18% IGV)</span>
                      <span>S/ {tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold text-slate-900 border-t border-slate-100 pt-3">
                      <span>Total Estimado</span>
                      <span>S/ {totalCost.toFixed(2)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setBookingStep('form')}
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
                  >
                    <span>Completar Reserva</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}

              {/* Step 2: Form Check-out */}
              {bookingStep === 'form' && (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-5"
                >
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setBookingStep('details')}
                      className="text-xs text-indigo-600 hover:underline font-semibold"
                    >
                      Atrás
                    </button>
                    <span className="text-slate-300">/</span>
                    <h3 className="font-bold text-base text-slate-900">Datos Personales</h3>
                  </div>

                  <form onSubmit={handleBookingSubmit} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ej. Juan Pérez"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                        Correo Electrónico
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="juan.perez@gmail.com"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                        Número de Teléfono
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+51 987654321"
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl flex items-start space-x-2">
                      <ShieldCheck className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                      <p className="text-[10px] text-indigo-900 leading-normal">
                        <strong>Pago al llegar:</strong> No requerimos tarjeta de crédito para reservar en línea. Tu reserva está garantizada hasta las 18:00 del día de llegada.
                      </p>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 text-[10px] text-slate-600 space-y-1">
                      <div className="flex justify-between">
                        <span>Habitación:</span>
                        <span className="font-semibold text-slate-800">{activeRoomType?.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Entrada:</span>
                        <span className="font-semibold text-slate-800">
                          {checkInDate.split('-').reverse().join('/')} {bookingType === 'horas' ? checkInTime : '12:00'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Salida:</span>
                        <span className="font-semibold text-slate-800">
                          {bookingType === 'dias' 
                            ? `${checkOutDate.split('-').reverse().join('/')} 12:00`
                            : `${calculatedCheckOutDate.split('-').reverse().join('/')} ${calculatedCheckOutTime}`
                          }
                        </span>
                      </div>
                    </div>

                    {errorMsg && (
                      <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>
                    )}

                    <div className="flex justify-between items-center text-xs border-t border-slate-100 pt-3">
                      <span className="text-slate-500">Monto a abonar:</span>
                      <span className="font-bold text-slate-900 text-sm">S/ {totalCost.toFixed(2)}</span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow"
                    >
                      Confirmar Reserva
                    </button>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Success Confirmation */}
              {bookingStep === 'success' && (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-6 space-y-4"
                >
                  <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mx-auto border border-emerald-100">
                    <CheckCircle className="h-6 w-6 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-slate-900">¡Reserva Realizada!</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Hemos enviado la confirmación al correo <strong>{email}</strong>
                    </p>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-left text-xs space-y-2 max-w-sm mx-auto">
                    <div className="flex justify-between text-slate-600">
                      <span>Código:</span>
                      <span className="font-semibold text-slate-800 uppercase">HF-{Date.now().toString().slice(-6)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Habitación:</span>
                      <span className="font-semibold text-slate-800">{activeRoomType?.name}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Estadía:</span>
                      <span className="font-semibold text-slate-800">
                        {bookingType === 'dias' ? `${calculatedNights} noches` : `${hoursCount} horas`}
                      </span>
                    </div>
                    {bookingType === 'horas' && (
                      <div className="flex justify-between text-slate-600">
                        <span>Salida:</span>
                        <span className="font-semibold text-slate-800">
                          {calculatedCheckOutDate.split('-').reverse().join('/')} {calculatedCheckOutTime}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-600 border-t border-slate-200/50 pt-2 font-bold">
                      <span>Total a pagar:</span>
                      <span className="text-indigo-600">S/ {totalCost.toFixed(2)}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold transition"
                  >
                    Nueva Reserva
                  </button>
                </motion.div>
              )}

            </AnimatePresence>
          </div>
        </div>

      </section>
    </div>
  );
}
