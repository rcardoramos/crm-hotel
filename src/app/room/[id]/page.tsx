'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  Clock,
  Utensils,
  Sparkles,
  ShieldAlert,
  Moon,
  Receipt,
  PhoneCall,
  Plus,
  Minus,
  CheckCircle,
  HelpCircle,
  ShoppingBag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GuestRoomPortal() {
  const { id: roomNumber } = useParams();
  const {
    rooms,
    stays,
    products,
    consumptions,
    addRoomServiceOrder,
    requestRoomCleanup,
    toggleNoDisturb
  } = useApp();

  const [activeTab, setActiveTab] = useState<'service' | 'bill' | 'control'>('service');
  const [catalogCategory, setCatalogCategory] = useState<'snacks' | 'drinks' | 'meals' | 'amenities' | 'other'>('meals');
  const [orderCart, setOrderCart] = useState<Record<string, number>>({});
  const [checkoutSuccess, setCheckoutSuccess] = useState(false);
  const [receptionAlertSent, setReceptionAlertSent] = useState(false);

  // Match room details
  const room = rooms.find((r) => r.number === roomNumber);
  const stay = room ? stays.find((s) => s.id === room.current_stay_id && s.status === 'active') : null;
  
  // Consumptions for active stay
  const roomConsumptions = stay ? consumptions.filter((c) => c.stay_id === stay.id) : [];
  const consumptionsTotal = roomConsumptions.reduce((acc, c) => acc + (c.quantity * c.unit_price), 0);

  // Billing calculations
  const pendingConsumptionsCost = roomConsumptions
    .filter((c) => c.payment_status !== 'paid')
    .reduce((acc, c) => acc + c.quantity * c.unit_price, 0);

  const roomPendingCost = (stay && !stay.room_paid) ? stay.room_cost : 0;
  const totalPending = roomPendingCost + pendingConsumptionsCost;
  const totalPaid = stay ? stay.total_paid : 0;
  const totalBill = stay ? (stay.room_cost + consumptionsTotal) : 0;

  // Real-time ticking countdown
  const [timeTicker, setTimeTicker] = useState(new Date().getTime());
  useEffect(() => {
    const timer = setInterval(() => setTimeTicker(new Date().getTime()), 1000);
    return () => clearInterval(timer);
  }, []);

  const getRemainingTimeStr = (expectedCheckoutIso: string) => {
    const expected = new Date(expectedCheckoutIso).getTime();
    const diff = expected - timeTicker;
    if (diff <= 0) return 'Estadía Completa';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    return `${hours.toString().padStart(2, '0')}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const addToCart = (productId: string) => {
    const prod = products.find((p) => p.id === productId);
    if (!prod) return;
    const currentCartQty = orderCart[productId] || 0;
    if (currentCartQty >= prod.stock) {
      return;
    }
    setOrderCart((prev) => ({
      ...prev,
      [productId]: currentCartQty + 1,
    }));
  };

  const removeFromCart = (productId: string) => {
    setOrderCart((prev) => {
      const copy = { ...prev };
      if (copy[productId] <= 1) {
        delete copy[productId];
      } else {
        copy[productId]--;
      }
      return copy;
    });
  };

  const handlePlaceOrder = () => {
    if (!room || !stay) return;
    
    // Validate stock for all items in the cart
    let hasStockError = false;
    Object.entries(orderCart).forEach(([pId, qty]) => {
      const prod = products.find((p) => p.id === pId);
      if (!prod || prod.stock < qty) {
        hasStockError = true;
      }
    });

    if (hasStockError) {
      alert("Algunos productos seleccionados superan el stock disponible. Por favor, revise su pedido.");
      return;
    }

    // Submit each cart item
    Object.entries(orderCart).forEach(([pId, qty]) => {
      addRoomServiceOrder(room.id, pId, qty);
    });

    setOrderCart({});
    setCheckoutSuccess(true);
    setTimeout(() => setCheckoutSuccess(false), 3000);
  };

  const handleRequestCleanup = () => {
    if (!room) return;
    requestRoomCleanup(room.id);
    setActiveTab('control');
  };

  const triggerCallReception = () => {
    setReceptionAlertSent(true);
    setTimeout(() => setReceptionAlertSent(false), 4000);
  };

  if (!room) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-6 text-center">
        <ShieldAlert className="h-16 w-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-bold">Habitación no encontrada</h2>
        <p className="text-xs text-slate-400 mt-2 max-w-sm">
          Por favor escanee el código QR provisto en su habitación o contacte a recepción.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top Banner - Header */}
      <header className="border-b border-slate-900 bg-slate-950/60 backdrop-blur px-6 py-4 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center font-bold text-white shadow">
            H
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-tight">Portal del Huésped</h1>
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block -mt-0.5">Habitación {room.number}</span>
          </div>
        </div>

        {room.no_disturb && (
          <span className="bg-rose-500/25 border border-rose-500/40 text-rose-400 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
            No Molestar Activo
          </span>
        )}
      </header>

      {/* Main Grid View */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 pb-20">
        
        {/* Left Area: Main tab screens (Col span 8) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Visual remaining time count */}
          {stay ? (
            <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-3xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div className="space-y-1 text-center sm:text-left">
                <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest block">Tiempo de Estadía</span>
                <span className="text-3xl sm:text-4xl font-extrabold font-mono tracking-tighter text-white block">
                  {getRemainingTimeStr(stay.expected_check_out_time)}
                </span>
                <span className="text-[10px] text-slate-500 block">Ingreso: {new Date(stay.check_in_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="shrink-0 flex space-x-2">
                <button
                  onClick={handleRequestCleanup}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-900 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Sparkles className="h-4 w-4 text-amber-400" />
                  <span>Limpieza</span>
                </button>
                <button
                  onClick={() => toggleNoDisturb(room.id)}
                  className={`px-4 py-2 border rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition ${
                    room.no_disturb
                      ? 'bg-rose-950 border-rose-800 text-rose-400'
                      : 'border-slate-800 hover:bg-slate-900 text-slate-300'
                  }`}
                >
                  <Moon className="h-4 w-4" />
                  <span>No Molestar</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl text-center">
              <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">ESTADO DE RESERVA</span>
              <h3 className="text-lg font-bold text-slate-300 mt-1">Sin hospedaje activo</h3>
              <p className="text-xs text-slate-500 mt-1.5 max-w-sm mx-auto">
                No figura un ingreso registrado para esta habitación. Si acaba de realizar Check-In, el sistema se actualizará en unos segundos.
              </p>
            </div>
          )}

          {/* Navigation Menu Tabs */}
          <div className="flex border-b border-slate-900 pb-px gap-4">
            {[
              { id: 'service', label: 'Room Service', icon: Utensils },
              { id: 'bill', label: 'Mi Cuenta', icon: Receipt },
              { id: 'control', label: 'Servicios de Habitación', icon: Sparkles },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 pb-3 font-semibold text-xs tracking-wider uppercase border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-white'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* TAB 1: ROOM SERVICE CATALOG */}
          {activeTab === 'service' && (
            <div className="space-y-6">
              {/* Category tabs */}
              <div className="flex bg-slate-900/50 p-1 rounded-xl text-[10px] font-bold border border-slate-900 overflow-x-auto gap-1">
                {[
                  { id: 'meals', label: 'Comidas' },
                  { id: 'drinks', label: 'Bebidas' },
                  { id: 'snacks', label: 'Snacks' },
                  { id: 'amenities', label: 'Amenities' },
                  { id: 'other', label: 'Otros' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCatalogCategory(cat.id as any)}
                    className={`px-3 py-1.5 rounded-lg uppercase tracking-wide whitespace-nowrap transition-all ${
                      catalogCategory === cat.id
                        ? 'bg-indigo-600 text-white'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Products List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {products
                  .filter((p) => p.category === catalogCategory)
                  .map((product) => {
                    const cartQty = orderCart[product.id] || 0;
                    return (
                      <div
                        key={product.id}
                        className="p-4 bg-slate-900/40 border border-slate-900 rounded-2xl flex items-center justify-between hover:border-slate-800 transition"
                      >
                        <div className="space-y-1">
                          <span className="font-semibold text-sm text-white block">{product.name}</span>
                          <span className="text-xs text-indigo-400 font-semibold block">S/ {(product.price || 0).toFixed(2)}</span>
                          <span className="text-[10px] text-slate-550 block font-medium">Stock disponible: {product.stock}</span>
                          {product.stock <= 3 && product.stock > 0 && (
                            <span className="text-[9px] text-amber-500 font-medium block">Pocas unidades</span>
                          )}
                        </div>

                        {product.stock === 0 ? (
                          <span className="text-[10px] text-slate-650 font-bold bg-slate-950 px-2.5 py-1 rounded-lg">Agotado</span>
                        ) : (
                          <div className="flex items-center space-x-2">
                            {cartQty > 0 && (
                              <>
                                <button
                                  onClick={() => removeFromCart(product.id)}
                                  className="h-7 w-7 bg-slate-800 hover:bg-slate-700 text-white rounded-lg flex items-center justify-center font-bold"
                                >
                                  <Minus className="h-3 w-3" />
                                </button>
                                <span className="text-xs font-bold w-5 text-center">{cartQty}</span>
                              </>
                            )}
                            <button
                              onClick={() => addToCart(product.id)}
                              disabled={cartQty >= product.stock}
                              className="h-7 w-7 bg-indigo-600 hover:bg-indigo-700 disabled:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg flex items-center justify-center font-bold transition"
                            >
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE BILLING DETAILS */}
          {activeTab === 'bill' && (
            <div className="bg-slate-900/30 border border-slate-900 rounded-3xl p-6 space-y-4">
              <h3 className="font-bold text-sm text-white">Detalle de Consumos y Hospedaje</h3>
              
              <div className="divide-y divide-slate-900 space-y-2">
                {stay && (
                  <div className="flex justify-between items-center text-xs py-2.5 text-slate-300">
                    <div className="flex items-center space-x-2">
                      <span>Hospedaje ({stay.duration_hours} Horas)</span>
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                        stay.room_paid
                          ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                          : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                      }`}>
                        {stay.room_paid ? 'Pagado' : 'Pendiente'}
                      </span>
                    </div>
                    <span className="font-semibold text-white">S/ {(stay.room_cost || 0).toFixed(2)}</span>
                  </div>
                )}

                {roomConsumptions.length === 0 ? (
                  <div className="py-4 text-xs text-slate-500 italic text-center">
                    No has registrado consumos adicionales todavía.
                  </div>
                ) : (
                  roomConsumptions.map((cons) => {
                    const p = products.find((prod) => prod.id === cons.product_id);
                    return (
                      <div key={cons.id} className="flex justify-between items-center text-xs py-2.5 text-slate-400 border-b border-slate-900/50">
                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                          <span>{cons.quantity}x {p?.name}</span>
                          <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded border uppercase ${
                            cons.status === 'pending'
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                              : 'bg-slate-800 border-slate-700 text-slate-450'
                          }`}>
                            {cons.status === 'pending' ? '⌛ Pendiente' : '🚚 Entregado'}
                          </span>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase ${
                            cons.payment_status === 'paid'
                              ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                              : 'bg-amber-500/15 border-amber-500/30 text-amber-400'
                          }`}>
                            {cons.payment_status === 'paid' ? 'Pagado' : 'Pendiente'}
                          </span>
                        </div>
                        <span className="font-semibold text-white shrink-0">S/ {((cons.quantity * cons.unit_price) || 0).toFixed(2)}</span>
                      </div>
                    );
                  })
                )}

                {stay && (
                  <div className="border-t border-slate-900 pt-4 mt-4 space-y-2">
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Subtotal Hospedaje:</span>
                      <span className="font-medium text-slate-200">S/ {(stay.room_cost || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Subtotal Consumos y Extras:</span>
                      <span className="font-medium text-slate-200">S/ {(consumptionsTotal || 0).toFixed(2)}</span>
                    </div>
                    
                    <div className="border-t border-slate-800/80 my-2 pt-2.5 space-y-1.5">
                      <div className="flex justify-between text-xs text-emerald-400">
                        <span>Monto Abonado / Pagado:</span>
                        <span className="font-semibold">S/ {(totalPaid || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-xs text-amber-400">
                        <span>Monto Pendiente a Pagar:</span>
                        <span className="font-semibold flex items-center gap-1.5">
                          S/ {(totalPending || 0).toFixed(2)}
                          {totalPending > 0 && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />}
                        </span>
                      </div>
                      
                      <div className="flex justify-between text-sm font-bold text-white border-t border-slate-800 pt-3 mt-3">
                        <span>Total General (Hospedaje + Extras)</span>
                        <span className="text-indigo-400 text-base font-extrabold">S/ {(totalBill || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: CONTROL & ADDITIONAL SERVICES */}
          {activeTab === 'control' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-5 bg-slate-900/30 border border-slate-900 rounded-3xl space-y-2 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center space-x-2">
                    <Sparkles className="h-4 w-4 text-indigo-400" /> <span>Servicio de Limpieza</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-normal mt-1">
                    ¿Deseas que organicemos o limpiemos tu habitación? Al hacer clic, notificaremos al personal de Housekeeping de inmediato.
                  </p>
                </div>
                <button
                  onClick={handleRequestCleanup}
                  className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow"
                >
                  Solicitar Limpieza de Habitación
                </button>
              </div>

              <div className="p-5 bg-slate-900/30 border border-slate-900 rounded-3xl space-y-2 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-sm text-white flex items-center space-x-2">
                    <PhoneCall className="h-4 w-4 text-indigo-400" /> <span>Atención Telefónica</span>
                  </h4>
                  <p className="text-xs text-slate-400 leading-normal mt-1">
                    ¿Tienes dudas sobre los servicios, extensiones o requieres asistencia? Comunícate directamente con recepción.
                  </p>
                </div>
                <button
                  onClick={triggerCallReception}
                  className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-slate-850 text-white rounded-xl text-xs font-bold transition"
                >
                  {receptionAlertSent ? '¡Notificación Enviada!' : 'Contactar Recepción'}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Area: Checkout Order Shopping Cart (Col span 4) */}
        <div className="lg:col-span-4">
          <div className="bg-slate-900/50 border border-slate-900 rounded-3xl p-6 sticky top-24 space-y-6 shadow-xl">
            <div>
              <h3 className="font-bold text-base text-white">Tu Pedido</h3>
              <p className="text-xs text-slate-500 mt-0.5">Room service y productos seleccionados.</p>
            </div>

            <div className="space-y-4">
              {Object.keys(orderCart).length === 0 ? (
                <div className="text-center py-8 text-slate-600">
                  <ShoppingBag className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs font-semibold">Tu carrito está vacío</p>
                </div>
              ) : (
                <div className="divide-y divide-slate-850 max-h-48 overflow-y-auto space-y-2 pr-1">
                  {Object.entries(orderCart).map(([id, qty]) => {
                    const p = products.find((prod) => prod.id === id);
                    if (!p) return null;
                    return (
                      <div key={id} className="flex justify-between items-center text-xs py-1.5">
                        <div>
                          <span className="font-bold text-white">{qty}x</span>{' '}
                          <span className="text-slate-300">{p.name}</span>
                        </div>
                        <span className="font-semibold text-indigo-400">S/ {((qty * p.price) || 0).toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Total calculations */}
              {Object.keys(orderCart).length > 0 && (
                <div className="border-t border-slate-900 pt-4 flex justify-between items-center text-xs font-bold text-white">
                  <span>Total Pedido:</span>
                  <span className="text-sm text-indigo-400">
                    S/{' '}
                    {Object.entries(orderCart)
                      .reduce((acc, [id, qty]) => acc + qty * (products.find((p) => p.id === id)?.price || 0), 0)
                      .toFixed(2)}
                  </span>
                </div>
              )}

              {/* Checkout success notification */}
              <AnimatePresence>
                {checkoutSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-emerald-950/40 border border-emerald-900/60 rounded-xl flex items-center space-x-2 text-emerald-400 text-xs"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>¡Pedido realizado con éxito y cargado a tu cuenta!</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Call reception alert check */}
              <AnimatePresence>
                {receptionAlertSent && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3 bg-indigo-950/40 border border-indigo-900/60 rounded-xl flex items-center space-x-2 text-indigo-400 text-xs"
                  >
                    <CheckCircle className="h-4 w-4 shrink-0" />
                    <span>Se notificó a recepción. Te atenderemos en breve.</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                onClick={handlePlaceOrder}
                disabled={Object.keys(orderCart).length === 0}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center justify-center space-x-1.5"
              >
                <span>Enviar Pedido</span>
              </button>
            </div>
          </div>
        </div>

      </main>

      {/* Footer bar */}
      <footer className="bg-slate-950/60 border-t border-slate-900 text-slate-500 py-6 text-center text-xs mt-auto">
        <p>© 2026 HotelFlow Platform. Todos los derechos reservados.</p>
        <span className="text-[10px] text-slate-600 block mt-1">Desarrollado para tablets, smart TVs y móviles.</span>
      </footer>
    </div>
  );
}
