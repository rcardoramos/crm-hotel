'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useApp } from '@/context/AppContext';
import { Product, Room, RoomType } from '@/lib/db';
import {
  TrendingUp,
  Percent,
  Bed,
  DollarSign,
  Coffee,
  AlertTriangle,
  FolderLock,
  Plus,
  RefreshCw,
  Edit2,
  Check,
  ShoppingBag,
  Users,
  Trash2,
  X
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
  const {
    rooms,
    roomTypes,
    products,
    stays,
    consumptions,
    guests,
    bookings,
    currentSede,
    updateProductStock,
    updateProductPrice,
    addRoom,
    deleteRoom,
    updateRoomType,
    addProduct
  } = useApp();

  const [activeTab, setActiveTab] = useState<'kpis' | 'inventory' | 'reports' | 'rooms'>('kpis');

  // Room Form State
  const [newRoomNumber, setNewRoomNumber] = useState('');
  const [newRoomFloor, setNewRoomFloor] = useState<number>(1);
  const [newRoomTypeId, setNewRoomTypeId] = useState('');
  const [roomError, setRoomError] = useState('');

  React.useEffect(() => {
    if (roomTypes.length > 0 && !newRoomTypeId) {
      setNewRoomTypeId(roomTypes[0].id);
    }
  }, [roomTypes, newRoomTypeId]);

  // Product Form State
  const [newProductName, setNewProductName] = useState('');
  const [newProductCategory, setNewProductCategory] = useState<'snacks' | 'drinks' | 'meals' | 'amenities' | 'other'>('snacks');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductStock, setNewProductStock] = useState('');
  const [productFormError, setProductFormError] = useState('');

  const handleAddProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProductName.trim() || !newProductPrice || !newProductStock) {
      setProductFormError('Todos los campos son obligatorios.');
      return;
    }
    const price = Number(newProductPrice);
    const stock = Number(newProductStock);
    if (isNaN(price) || price < 0) {
      setProductFormError('El precio debe ser un número positivo o cero.');
      return;
    }
    if (isNaN(stock) || stock < 0 || !Number.isInteger(stock)) {
      setProductFormError('El stock debe ser un número entero positivo o cero.');
      return;
    }

    addProduct({
      sede_id: currentSede?.id || 'sede-1',
      name: newProductName.trim(),
      category: newProductCategory,
      price,
      stock,
    });

    // Reset Form
    setNewProductName('');
    setNewProductCategory('snacks');
    setNewProductPrice('');
    setNewProductStock('');
    setProductFormError('');
  };

  // Inventory Edits
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<string>('');
  const [editStock, setEditStock] = useState<string>('');

  // Room Type Price Edits
  const [editingRoomTypeId, setEditingRoomTypeId] = useState<string | null>(null);
  const [editPrice6h, setEditPrice6h] = useState<string>('');
  const [editPrice12h, setEditPrice12h] = useState<string>('');
  const [editPrice24h, setEditPrice24h] = useState<string>('');
  const [editPriceCustom, setEditPriceCustom] = useState<string>('');

  // 1. Calculations for KPIs
  const totalRooms = rooms.length || 1;
  const occupiedCount = rooms.filter((r) => r.status === 'Ocupada').length;
  const reservedCount = rooms.filter((r) => r.status === 'Reservada').length;
  const cleaningCount = rooms.filter((r) => r.status === 'Limpieza').length;
  const availableCount = rooms.filter((r) => r.status === 'Disponible').length;
  const maintenanceCount = rooms.filter((r) => r.status === 'Mantenimiento').length;

  const occupancyRate = ((occupiedCount + reservedCount) / totalRooms) * 100;

  // Revenue calculation
  // Total paid from all stays + total from all delivered/pending consumptions
  const roomRevenue = stays.reduce((acc, s) => acc + s.total_paid, 0);
  const deliveredConsumptions = consumptions.filter((c) => c.status === 'delivered');
  const foodRevenue = deliveredConsumptions.reduce((acc, c) => acc + c.quantity * c.unit_price, 0);
  const totalRevenue = roomRevenue + foodRevenue;

  // Active bookings count
  const activeBookings = bookings.length;

  // Pending room service orders
  const pendingOrders = consumptions.filter((c) => c.status === 'pending').length;

  // Top products calculation
  const productSalesMap: Record<string, number> = {};
  deliveredConsumptions.forEach((c) => {
    productSalesMap[c.product_id] = (productSalesMap[c.product_id] || 0) + c.quantity;
  });

  const topProducts = Object.entries(productSalesMap)
    .map(([id, qty]) => {
      const p = products.find((prod) => prod.id === id);
      return {
        name: p?.name || 'Producto desc.',
        qty,
        category: p?.category || 'otros',
        revenue: qty * (p?.price || 0),
      };
    })
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 4);

  // Most used rooms calculation
  const roomUsageMap: Record<string, number> = {};
  stays.forEach((s) => {
    roomUsageMap[s.room_id] = (roomUsageMap[s.room_id] || 0) + 1;
  });

  const topRooms = Object.entries(roomUsageMap)
    .map(([id, count]) => {
      const r = rooms.find((rm) => rm.id === id);
      return {
        number: r?.number || '?',
        count,
        floor: r?.floor || 1,
      };
    })
    .sort((a, b) => b.count - a.count)
    .slice(0, 4);

  const startEditProduct = (p: Product) => {
    setEditingProductId(p.id);
    setEditPrice(p.price.toString());
    setEditStock(p.stock.toString());
  };

  const saveProductEdit = (id: string) => {
    const prc = Number(editPrice);
    const stk = Number(editStock);
    if (!isNaN(prc) && prc >= 0) updateProductPrice(id, prc);
    if (!isNaN(stk) && stk >= 0) updateProductStock(id, stk);
    setEditingProductId(null);
  };

  const startEditRoomType = (rt: RoomType) => {
    setEditingRoomTypeId(rt.id);
    setEditPrice6h(rt.price_6h.toString());
    setEditPrice12h(rt.price_12h.toString());
    setEditPrice24h(rt.price_24h.toString());
    setEditPriceCustom(rt.price_custom_hour.toString());
  };

  const saveRoomTypeEdit = (id: string) => {
    const p6 = Number(editPrice6h);
    const p12 = Number(editPrice12h);
    const p24 = Number(editPrice24h);
    const pc = Number(editPriceCustom);
    if (!isNaN(p6) && p6 >= 0 && !isNaN(p12) && p12 >= 0 && !isNaN(p24) && p24 >= 0 && !isNaN(pc) && pc >= 0) {
      updateRoomType(id, {
        price_6h: p6,
        price_12h: p12,
        price_24h: p24,
        price_custom_hour: pc,
      });
    }
    setEditingRoomTypeId(null);
  };

  const handleAddRoomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomNumber || !newRoomTypeId || !newRoomFloor) {
      setRoomError('Todos los campos son obligatorios.');
      return;
    }

    // Check if room number already exists
    const exists = rooms.some((r) => r.number.toLowerCase() === newRoomNumber.trim().toLowerCase());
    if (exists) {
      setRoomError(`La habitación número ${newRoomNumber} ya existe.`);
      return;
    }

    addRoom({
      sede_id: currentSede?.id || 'sede-1',
      number: newRoomNumber.trim(),
      floor: Number(newRoomFloor),
      type_id: newRoomTypeId,
    });

    // Reset fields
    setNewRoomNumber('');
    setNewRoomFloor(1);
    setNewRoomTypeId(roomTypes[0]?.id || '');
    setRoomError('');
  };

  const handleDeleteRoomClick = (room: Room) => {
    let confirmMsg = `¿Está seguro de que desea eliminar la habitación ${room.number}?`;
    if (room.status === 'Ocupada') {
      confirmMsg = `La habitación ${room.number} está actualmente OCUPADA. ¿Está completamente seguro de que desea eliminarla? Esto removerá la estadía activa de la habitación.`;
    }
    const confirmDelete = window.confirm(confirmMsg);
    if (confirmDelete) {
      deleteRoom(room.id);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        
        {/* Dashboard Tabs header */}
        <div className="flex border-b border-slate-150 pb-px">
          {[
            { id: 'kpis', label: 'Métricas & KPIs', icon: TrendingUp },
            { id: 'inventory', label: 'Inventario & Tarifas', icon: Coffee },
            { id: 'reports', label: 'Informes & Gráficas', icon: DollarSign },
            { id: 'rooms', label: 'Gestión de Habitaciones', icon: Bed },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-5 py-3 border-b-2 font-medium text-xs tracking-wide uppercase transition-all -mb-px ${
                activeTab === tab.id
                  ? 'border-indigo-600 text-slate-900 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* --- TAB 1: METRICS & KPIS --- */}
        {activeTab === 'kpis' && (
          <div className="space-y-6">
            {/* Metric grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              
              {/* Occupancy Rate */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Porcentaje Ocupación</span>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1">{occupancyRate.toFixed(1)}%</h3>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    {occupiedCount} ocupadas | {reservedCount} reservadas
                  </p>
                </div>
                <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Percent className="h-6 w-6" />
                </div>
              </div>

              {/* Total Revenue */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Ingresos Totales (Demo)</span>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1">S/ {totalRevenue.toFixed(2)}</h3>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    S/ {roomRevenue.toFixed(2)} hospedaje | S/ {foodRevenue.toFixed(2)} consumos
                  </p>
                </div>
                <div className="h-12 w-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>

              {/* Room Clean Status */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">Habitaciones Libres</span>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1">{availableCount} / {totalRooms}</h3>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    {cleaningCount} en limpieza | {maintenanceCount} fuera de serv.
                  </p>
                </div>
                <div className="h-12 w-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
                  <Bed className="h-6 w-6" />
                </div>
              </div>

              {/* CRM Guests & Bookings */}
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide">CRM & Reservas Web</span>
                  <h3 className="text-3xl font-bold text-slate-800 mt-1">{guests.length} Huéspedes</h3>
                  <p className="text-[11px] text-slate-500 mt-1.5">
                    {activeBookings} reservas activas registradas en la web
                  </p>
                </div>
                <div className="h-12 w-12 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600">
                  <Users className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Room Status Graph & Room service orders */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Status chart overview */}
              <div className="lg:col-span-7 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <h4 className="font-bold text-sm text-slate-900 mb-4">Estado general del hotel</h4>
                <div className="space-y-4">
                  {[
                    { label: 'Disponible', count: availableCount, color: 'bg-emerald-500' },
                    { label: 'Ocupada', count: occupiedCount, color: 'bg-indigo-500' },
                    { label: 'Reservada', count: reservedCount, color: 'bg-indigo-300' },
                    { label: 'Limpieza', count: cleaningCount, color: 'bg-amber-500' },
                    { label: 'Mantenimiento', count: maintenanceCount, color: 'bg-rose-500' },
                  ].map((item) => {
                    const percentage = totalRooms > 0 ? (item.count / totalRooms) * 100 : 0;
                    return (
                      <div key={item.label} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-semibold text-slate-700">
                          <span>{item.label}</span>
                          <span>{item.count} hab. ({percentage.toFixed(0)}%)</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full ${item.color}`} style={{ width: `${percentage}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Pending Room Service Orders alerts */}
              <div className="lg:col-span-5 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-sm text-slate-900">Room Service Pendiente</h4>
                  {pendingOrders > 0 && (
                    <span className="h-5 px-2 bg-rose-100 text-rose-800 text-[10px] font-bold rounded-full flex items-center justify-center pulse-soft">
                      {pendingOrders} órdenes
                    </span>
                  )}
                </div>
                
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {consumptions.filter((c) => c.status === 'pending').length === 0 ? (
                    <div className="text-center py-8 text-slate-400">
                      <ShoppingBag className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-medium">No hay pedidos pendientes de entrega.</p>
                    </div>
                  ) : (
                    consumptions
                      .filter((c) => c.status === 'pending')
                      .map((cons) => {
                        const p = products.find((prod) => prod.id === cons.product_id);
                        return (
                          <div
                            key={cons.id}
                            className="p-3 bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-bold text-slate-900">{cons.quantity}x</span>{' '}
                              <span className="text-slate-700">{p?.name}</span>
                            </div>
                            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-0.5 border border-amber-100 rounded-md">
                              Pendiente
                            </span>
                          </div>
                        );
                      })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: INVENTORY & STOCK --- */}
        {activeTab === 'inventory' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Catalog table */}
            <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm space-y-4">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Catálogo de Room Service & Amenities</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Controla existencias e incrementa o ajusta precios de venta.</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-4">Producto / Servicio</th>
                      <th className="p-4">Categoría</th>
                      <th className="p-4 text-center">Precio</th>
                      <th className="p-4 text-center">Stock Disponible</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {products.map((p) => {
                      const isEditing = editingProductId === p.id;
                      return (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4 font-semibold text-slate-800">{p.name}</td>
                          <td className="p-4 capitalize">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/50">
                              {p.category}
                            </span>
                          </td>
                          <td className="p-4 text-center font-mono">
                            {isEditing ? (
                              <input
                                type="number"
                                step="0.10"
                                value={editPrice}
                                onChange={(e) => setEditPrice(e.target.value)}
                                className="w-20 text-center p-1 bg-white border border-slate-200 rounded outline-none text-xs font-semibold"
                              />
                            ) : (
                              `S/ ${p.price.toFixed(2)}`
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {isEditing ? (
                              <input
                                type="number"
                                value={editStock}
                                onChange={(e) => setEditStock(e.target.value)}
                                className="w-20 text-center p-1 bg-white border border-slate-200 rounded outline-none text-xs font-semibold"
                              />
                            ) : (
                              <span
                                className={`font-semibold ${
                                  p.stock <= 5 ? 'text-rose-600 font-bold' : 'text-slate-700'
                                }`}
                              >
                                {p.stock} u
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            {isEditing ? (
                              <button
                                onClick={() => saveProductEdit(p.id)}
                                className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded mr-2"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                            ) : (
                              <button
                                onClick={() => startEditProduct(p)}
                                className="p-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Add product form */}
            <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm h-fit space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Agregar Nuevo Producto</h4>
                <p className="text-xs text-slate-500 mt-0.5">Registra un nuevo producto o amenity en el catálogo.</p>
              </div>

              {productFormError && (
                <div className="p-3 bg-rose-50 border border-rose-150 text-rose-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{productFormError}</span>
                </div>
              )}

              <form onSubmit={handleAddProductSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    Nombre del Producto
                  </label>
                  <input
                    type="text"
                    required
                    value={newProductName}
                    onChange={(e) => setNewProductName(e.target.value)}
                    placeholder="ej. Papas Pringles Original"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    Categoría
                  </label>
                  <select
                    value={newProductCategory}
                    onChange={(e) => setNewProductCategory(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-semibold"
                  >
                    <option value="snacks">Snacks</option>
                    <option value="drinks">Bebidas</option>
                    <option value="meals">Comidas / Gastronomía</option>
                    <option value="amenities">Amenities / Servicios</option>
                    <option value="other">Otros</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                      Precio de Venta (S/)
                    </label>
                    <input
                      type="number"
                      step="0.10"
                      min="0"
                      required
                      value={newProductPrice}
                      onChange={(e) => setNewProductPrice(e.target.value)}
                      placeholder="ej. 8.50"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-semibold font-mono"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                      Stock Inicial
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={newProductStock}
                      onChange={(e) => setNewProductStock(e.target.value)}
                      placeholder="ej. 30"
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-semibold font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow"
                >
                  <Plus className="h-4 w-4" />
                  <span>Registrar Producto</span>
                </button>
              </form>
            </div>

          </div>
        )}

        {/* --- TAB 3: REPORTS --- */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Top selling products */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h4 className="font-bold text-sm text-slate-900 mb-4">Productos más vendidos</h4>
              {topProducts.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-6 text-center">No hay datos de ventas registrados aún.</p>
              ) : (
                <div className="space-y-4">
                  {topProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800">{p.name}</span>
                        <span className="text-[10px] text-slate-400 block capitalize">{p.category}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 block">{p.qty} unidades</span>
                        <span className="text-[10px] text-emerald-600 font-semibold block">S/ {p.revenue.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Most active/booked rooms */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h4 className="font-bold text-sm text-slate-900 mb-4">Habitaciones más utilizadas</h4>
              {topRooms.length === 0 ? (
                <p className="text-xs text-slate-400 italic py-6 text-center">No hay datos de hospedaje cargados aún.</p>
              ) : (
                <div className="space-y-4">
                  {topRooms.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        <div className="h-8 w-8 bg-slate-900 text-white rounded-lg flex items-center justify-center font-bold text-xs">
                          {r.number}
                        </div>
                        <div>
                          <span className="font-bold text-slate-800 block">Habitación {r.number}</span>
                          <span className="text-[10px] text-slate-400 block">Piso {r.floor}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 block">{r.count} check-ins</span>
                        <span className="text-[10px] text-indigo-600 font-semibold block">Estadías registradas</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* --- TAB 4: ROOM MANAGEMENT --- */}
        {activeTab === 'rooms' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Room list and overview */}
            <div className="lg:col-span-8 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Habitaciones Registradas ({rooms.length})</h4>
                <p className="text-xs text-slate-500 mt-0.5">Listado total de habitaciones en el hotel con su estado y tipo.</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                      <th className="p-4">Número</th>
                      <th className="p-4">Piso</th>
                      <th className="p-4">Tipo</th>
                      <th className="p-4">Estado</th>
                      <th className="p-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {rooms.map((room) => {
                      const type = roomTypes.find((t) => t.id === room.type_id);
                      return (
                        <tr key={room.id} className="hover:bg-slate-50/50 transition">
                          <td className="p-4 font-bold text-sm text-slate-800">
                            Habitación {room.number}
                          </td>
                          <td className="p-4 font-medium text-slate-600">Piso {room.floor}</td>
                          <td className="p-4">
                            <span className="font-semibold text-slate-700 bg-slate-50 border border-slate-200/50 px-2 py-0.5 rounded-lg">
                              {type?.name || 'Tipo desc.'}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${
                              room.status === 'Disponible'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                : room.status === 'Ocupada'
                                ? 'bg-indigo-50 text-indigo-700 border-indigo-150'
                                : room.status === 'Limpieza'
                                ? 'bg-amber-50 text-amber-700 border-amber-100'
                                : room.status === 'Mantenimiento'
                                ? 'bg-rose-50 text-rose-700 border-rose-100'
                                : room.status === 'Reservada'
                                ? 'bg-indigo-50/20 text-indigo-600 border-indigo-100'
                                : 'bg-slate-50 text-slate-500 border-slate-150'
                            }`}>
                              {room.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleDeleteRoomClick(room)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-100 rounded-lg transition"
                              title="Eliminar Habitación"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Column: Add room form */}
            <div className="lg:col-span-4 bg-white border border-slate-100 rounded-3xl p-6 shadow-sm h-fit space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">Agregar Nueva Habitación</h4>
                <p className="text-xs text-slate-500 mt-0.5">Registra una habitación física en el sistema.</p>
              </div>

              {roomError && (
                <div className="p-3 bg-rose-50 border border-rose-150 text-rose-700 text-xs font-semibold rounded-xl flex items-center space-x-2">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>{roomError}</span>
                </div>
              )}

              <form onSubmit={handleAddRoomSubmit} className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    Número de Habitación
                  </label>
                  <input
                    type="text"
                    required
                    value={newRoomNumber}
                    onChange={(e) => setNewRoomNumber(e.target.value)}
                    placeholder="ej. 305, Suite-B"
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    Piso de la Habitación
                  </label>
                  <select
                    value={newRoomFloor}
                    onChange={(e) => setNewRoomFloor(Number(e.target.value))}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-semibold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((f) => (
                      <option key={f} value={f}>
                        Piso {f}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                    Tipo de Habitación
                  </label>
                  <select
                    value={newRoomTypeId}
                    onChange={(e) => setNewRoomTypeId(e.target.value)}
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 font-semibold"
                  >
                    <option value="" disabled>Seleccione un tipo...</option>
                    {roomTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.name} (S/ {type.price_6h} / 6h)
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow"
                >
                  <Plus className="h-4 w-4" />
                  <span>Registrar Habitación</span>
                </button>
              </form>
            </div>

          </div>

          {/* Configuration of Rates & Prices */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div>
              <h4 className="font-bold text-sm text-slate-900">Configuración de Tarifas y Precios</h4>
              <p className="text-xs text-slate-500 mt-0.5">Administra los precios base por tiempo de ocupación para cada tipo de habitación.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Tipo de Habitación</th>
                    <th className="p-4 text-center">Precio 6 Horas</th>
                    <th className="p-4 text-center">Precio 12 Horas</th>
                    <th className="p-4 text-center">Precio 24 Horas (Día)</th>
                    <th className="p-4 text-center">Hora Extra</th>
                    <th className="p-4 text-center">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {roomTypes.map((rt) => {
                    const isEditing = editingRoomTypeId === rt.id;
                    return (
                      <tr key={rt.id} className="hover:bg-slate-50/50 transition">
                        <td className="p-4">
                          <span className="font-bold text-slate-800 block text-sm">{rt.name}</span>
                          <span className="text-[10px] text-slate-400 block max-w-md line-clamp-1">{rt.description}</span>
                        </td>
                        <td className="p-4 text-center font-mono font-semibold">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editPrice6h}
                              onChange={(e) => setEditPrice6h(e.target.value)}
                              className="w-20 text-center p-1 bg-white border border-slate-200 rounded outline-none text-xs font-semibold"
                            />
                          ) : (
                            `S/ ${rt.price_6h.toFixed(2)}`
                          )}
                        </td>
                        <td className="p-4 text-center font-mono font-semibold">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editPrice12h}
                              onChange={(e) => setEditPrice12h(e.target.value)}
                              className="w-20 text-center p-1 bg-white border border-slate-200 rounded outline-none text-xs font-semibold"
                            />
                          ) : (
                            `S/ ${rt.price_12h.toFixed(2)}`
                          )}
                        </td>
                        <td className="p-4 text-center font-mono font-semibold">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editPrice24h}
                              onChange={(e) => setEditPrice24h(e.target.value)}
                              className="w-20 text-center p-1 bg-white border border-slate-200 rounded outline-none text-xs font-semibold"
                            />
                          ) : (
                            `S/ ${rt.price_24h.toFixed(2)}`
                          )}
                        </td>
                        <td className="p-4 text-center font-mono font-semibold">
                          {isEditing ? (
                            <input
                              type="number"
                              min="0"
                              value={editPriceCustom}
                              onChange={(e) => setEditPriceCustom(e.target.value)}
                              className="w-20 text-center p-1 bg-white border border-slate-200 rounded outline-none text-xs font-semibold"
                            />
                          ) : (
                            `S/ ${rt.price_custom_hour.toFixed(2)}`
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {isEditing ? (
                            <div className="flex items-center justify-center space-x-1.5">
                              <button
                                onClick={() => saveRoomTypeEdit(rt.id)}
                                className="p-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-100 rounded"
                                title="Guardar Cambios"
                              >
                                <Check className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setEditingRoomTypeId(null)}
                                className="p-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-100 rounded"
                                title="Cancelar"
                              >
                                <X className="h-4 w-4" />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => startEditRoomType(rt)}
                              className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-100 rounded-lg transition"
                              title="Editar Tarifas"
                            >
                              <Edit2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      </div>
    </AdminLayout>
  );
}
