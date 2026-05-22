'use client';

import React, { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { useApp } from '@/context/AppContext';
import { Room, Incident } from '@/lib/db';
import {
  Sparkles,
  Wrench,
  AlertTriangle,
  CheckCircle,
  Clock,
  Camera,
  Play,
  Check,
  AlertOctagon,
  Image as ImageIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function HousekeepingPage() {
  const {
    rooms,
    incidents,
    roomTypes,
    startRoomCleanup,
    finishRoomCleanup,
    reportIncident,
    resolveIncident,
    updateRoomStatus
  } = useApp();

  const [activeTab, setActiveTab] = useState<'cleaning' | 'maintenance'>('cleaning');
  
  // Incident Form State
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [incidentDesc, setIncidentDesc] = useState<string>('');
  const [incidentPriority, setIncidentPriority] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [mockPhotoUploaded, setMockPhotoUploaded] = useState<boolean>(false);
  const [photoPreviewUrl, setPhotoPreviewUrl] = useState<string>('');

  const handleMockPhoto = () => {
    // Generate a mock photo preview url
    setMockPhotoUploaded(true);
    setPhotoPreviewUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80'); // Mock tools/maintenance image
  };

  const handleReportIncident = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoomId || !incidentDesc) return;

    reportIncident(selectedRoomId, incidentDesc, incidentPriority);

    // Reset Form
    setSelectedRoomId('');
    setIncidentDesc('');
    setIncidentPriority('medium');
    setMockPhotoUploaded(false);
    setPhotoPreviewUrl('');
  };

  // Rooms that are either occupied or in cleaning status
  const cleaningRooms = rooms.filter(r => r.status === 'Limpieza' || r.status === 'Disponible' || r.status === 'Ocupada');
  const pendingIncidents = incidents.filter(i => i.status !== 'resolved');

  return (
    <AdminLayout>
      <div className="space-y-6 max-w-4xl mx-auto">
        
        {/* Toggle between Limpieza and Mantenimiento */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-semibold border border-slate-150">
          <button
            onClick={() => setActiveTab('cleaning')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'cleaning'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Sparkles className="h-4 w-4" />
            <span>Limpieza de Habitaciones</span>
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center space-x-2 ${
              activeTab === 'maintenance'
                ? 'bg-white text-slate-900 shadow-sm font-bold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Wrench className="h-4 w-4" />
            <span>Mantenimiento & Incidencias</span>
          </button>
        </div>

        {/* --- SECTION 1: HOUSEKEEPING --- */}
        {activeTab === 'cleaning' && (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Rooms list requiring cleaning */}
            <div className="md:col-span-7 space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Habitaciones Activas</h3>
              
              <div className="space-y-3">
                {cleaningRooms.map((room) => {
                  const type = roomTypes.find(t => t.id === room.type_id);
                  return (
                    <div
                      key={room.id}
                      className={`p-4 rounded-2xl border bg-white shadow-sm flex items-center justify-between transition-all ${
                        room.status === 'Limpieza' ? 'border-amber-100 bg-amber-50/20' : 'border-slate-100'
                      }`}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`h-11 w-11 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                          room.status === 'Limpieza' ? 'bg-amber-100 text-amber-800' :
                          room.status === 'Disponible' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {room.number}
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 text-sm">Habitación {room.number}</span>
                            <span className="text-[10px] text-slate-400 font-medium">({type?.name})</span>
                          </div>
                          <span className={`text-[10px] font-bold block uppercase tracking-wider mt-0.5 ${
                            room.status === 'Limpieza' ? 'text-amber-600' :
                            room.status === 'Disponible' ? 'text-emerald-600' : 'text-slate-500'
                          }`}>
                            {room.status === 'Limpieza' ? 'Requiere Limpieza' :
                             room.status === 'Disponible' ? 'Limpia / Disponible' : 'Ocupada'}
                          </span>
                        </div>
                      </div>

                      {/* Clean Actions */}
                      <div className="flex items-center space-x-2">
                        {room.status === 'Limpieza' ? (
                          <button
                            onClick={() => finishRoomCleanup(room.id)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
                          >
                            <Check className="h-4 w-4" />
                            <span>Completar</span>
                          </button>
                        ) : room.status === 'Disponible' ? (
                          <button
                            onClick={() => updateRoomStatus(room.id, 'Limpieza')}
                            className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center space-x-1"
                          >
                            <Play className="h-3.5 w-3.5" />
                            <span>Ensuciar (Prueba)</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-medium italic">Huésped en habitación</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick incident report card */}
            <div className="md:col-span-5">
              <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm sticky top-24 space-y-4">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Reportar Avería</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Notifica al instante a mantenimiento para bloquear o reparar.</p>
                </div>

                <form onSubmit={handleReportIncident} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                      Habitación
                    </label>
                    <select
                      required
                      value={selectedRoomId}
                      onChange={(e) => setSelectedRoomId(e.target.value)}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                    >
                      <option value="">Seleccionar Habitación...</option>
                      {rooms.map(r => (
                        <option key={r.id} value={r.id}>Habitación {r.number} ({r.status})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                      Descripción del problema
                    </label>
                    <textarea
                      required
                      value={incidentDesc}
                      onChange={(e) => setIncidentDesc(e.target.value)}
                      placeholder="ej. La tina tiene una fuga de agua, control remoto no funciona..."
                      rows={3}
                      className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                        Prioridad / Gravedad
                      </label>
                      <select
                        value={incidentPriority}
                        onChange={(e) => setIncidentPriority(e.target.value as any)}
                        className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none text-slate-700 font-medium"
                      >
                        <option value="low">Baja</option>
                        <option value="medium">Media</option>
                        <option value="high">Alta (Bloquea Habitación)</option>
                        <option value="critical">Crítica (Urgente)</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block mb-1">
                        Fotografía
                      </label>
                      <button
                        type="button"
                        onClick={handleMockPhoto}
                        className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 border border-slate-200/50 rounded-xl text-xs font-semibold flex items-center justify-center space-x-1.5"
                      >
                        <Camera className="h-4 w-4" />
                        <span>{mockPhotoUploaded ? 'Foto Cargada' : 'Subir Foto'}</span>
                      </button>
                    </div>
                  </div>

                  {mockPhotoUploaded && (
                    <div className="p-2 border border-slate-200 rounded-xl bg-slate-50 relative flex items-center space-x-2">
                      <div className="h-10 w-10 rounded overflow-hidden shrink-0">
                        <img src={photoPreviewUrl} className="object-cover w-full h-full" />
                      </div>
                      <span className="text-[10px] text-slate-500 font-semibold truncate flex-1">Mock_Averia_Hab.jpg</span>
                      <button
                        type="button"
                        onClick={() => { setMockPhotoUploaded(false); setPhotoPreviewUrl(''); }}
                        className="text-xs text-rose-500 font-bold hover:underline"
                      >
                        Remover
                      </button>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow"
                  >
                    Reportar Incidencia
                  </button>
                </form>
              </div>
            </div>

          </div>
        )}

        {/* --- SECTION 2: MAINTENANCE --- */}
        {activeTab === 'maintenance' && (
          <div className="space-y-4">
            <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">Incidencias y Reparaciones Pendientes</h3>
            
            {pendingIncidents.length === 0 ? (
              <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center text-slate-400">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 text-emerald-500" />
                <h4 className="font-bold text-slate-800 text-sm">Todo en orden</h4>
                <p className="text-xs text-slate-500 mt-1">No se reportan incidencias activas de mantenimiento.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingIncidents.map((incident) => {
                  const roomObj = rooms.find(r => r.id === incident.room_id);
                  const isHighPriority = incident.priority === 'high' || incident.priority === 'critical';
                  
                  return (
                    <div
                      key={incident.id}
                      className={`p-5 rounded-2xl bg-white border shadow-sm flex flex-col justify-between space-y-4 ${
                        isHighPriority ? 'border-rose-100 bg-rose-50/10' : 'border-slate-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div className={`h-10 w-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${
                            isHighPriority ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-800'
                          }`}>
                            {roomObj?.number || '?'}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-sm">Habitación {roomObj?.number}</span>
                            <span className="text-[10px] text-slate-400 font-semibold block capitalize">Reportado por: {incident.reporter_role}</span>
                          </div>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                          incident.priority === 'critical' ? 'bg-rose-600 text-white' :
                          incident.priority === 'high' ? 'bg-rose-100 text-rose-800' :
                          incident.priority === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
                        }`}>
                          {incident.priority}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-normal">
                        {incident.description}
                      </p>

                      {/* Mock upload view */}
                      {incident.priority === 'high' && (
                        <div className="p-2 border border-slate-100 rounded-xl bg-slate-50 flex items-center space-x-3">
                          <ImageIcon className="h-4 w-4 text-slate-400 shrink-0" />
                          <span className="text-[10px] font-medium text-slate-500 truncate flex-1">Evidencia_adjunta_averia.jpg</span>
                          <button
                            onClick={() => window.open('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=800&q=80', '_blank')}
                            className="text-[10px] text-indigo-600 hover:underline font-bold"
                          >
                            Ver foto
                          </button>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100/50">
                        <span className="text-[10px] text-slate-400 font-medium">Estado: {incident.status}</span>
                        <button
                          onClick={() => resolveIncident(incident.id)}
                          className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
                        >
                          <Check className="h-4 w-4" />
                          <span>Marcar Resuelta</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </AdminLayout>
  );
}
