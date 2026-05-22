'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  localDB,
  Sede,
  RoomType,
  Room,
  Guest,
  Stay,
  Product,
  Consumption,
  Incident,
  Booking
} from '../lib/db';

export interface HotelNotification {
  id: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  title: string;
  message: string;
  roomNumber?: string;
  timestamp: string;
  read: boolean;
}

interface AppContextType {
  sedes: Sede[];
  currentSede: Sede | null;
  roomTypes: RoomType[];
  rooms: Room[];
  guests: Guest[];
  stays: Stay[];
  products: Product[];
  consumptions: Consumption[];
  incidents: Incident[];
  bookings: Booking[];
  notifications: HotelNotification[];
  activeRole: 'admin' | 'reception' | 'housekeeping';
  isLoggedIn: boolean;
  isInitialized: boolean;
  userRole: 'admin' | 'reception' | 'housekeeping' | null;
  
  // Sede & Role setters
  setCurrentSede: (sede: Sede) => void;
  setActiveRole: (role: 'admin' | 'reception' | 'housekeeping') => void;
  login: (username: string, pass: string) => boolean;
  logout: () => void;
  
  // Core Business Actions
  checkIn: (
    roomId: string,
    guestData: Omit<Guest, 'id' | 'created_at'>,
    durationHours: number,
    totalPaid: number,
    paymentMethod: string,
    companionName?: string,
    companionDni?: string,
    roomPaid?: boolean
  ) => void;
  checkOut: (roomId: string) => void;
  extendStay: (roomId: string, hoursToAdd: number, price: number) => void;
  addRoomServiceOrder: (roomId: string, productId: string, quantity: number) => void;
  deliverOrder: (orderId: string) => void;
  requestRoomCleanup: (roomId: string) => void;
  startRoomCleanup: (roomId: string) => void;
  finishRoomCleanup: (roomId: string) => void;
  reportIncident: (roomId: string, description: string, priority: 'low' | 'medium' | 'high' | 'critical') => void;
  resolveIncident: (incidentId: string) => void;
  createBooking: (bookingData: Omit<Booking, 'id' | 'created_at' | 'status'>) => Booking;
  updateRoomStatus: (roomId: string, status: Room['status']) => void;
  toggleNoDisturb: (roomId: string) => void;
  updateProductStock: (productId: string, stock: number) => void;
  updateProductPrice: (productId: string, price: number) => void;
  clearNotification: (id: string) => void;
  clearAllNotifications: () => void;
  addRoom: (roomData: Omit<Room, 'id' | 'created_at' | 'status' | 'current_stay_id' | 'last_cleaning_at' | 'last_maintenance_at'>) => void;
  deleteRoom: (roomId: string) => void;
  updateRoomType: (typeId: string, updates: Partial<RoomType>) => void;
  addProduct: (productData: Omit<Product, 'id' | 'created_at'>) => void;
  registerStayPayment: (stayId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [currentSede, setCurrentSedeState] = useState<Sede | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [guests, setGuests] = useState<Guest[]>([]);
  const [stays, setStays] = useState<Stay[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [consumptions, setConsumptions] = useState<Consumption[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notifications, setNotifications] = useState<HotelNotification[]>([]);
  const [activeRole, setActiveRoleState] = useState<'admin' | 'reception' | 'housekeeping'>('reception');
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<'admin' | 'reception' | 'housekeeping' | null>(null);

  // Helper to load notifications with auto-generation for housekeeping
  const loadNotificationsForRole = (role: 'admin' | 'reception' | 'housekeeping') => {
    if (typeof window === 'undefined') return;
    const notifKey = `hotelflow_notifications_${role}`;
    const savedNotifs = localStorage.getItem(notifKey);
    let loadedList: HotelNotification[] = [];
    if (savedNotifs) {
      try {
        loadedList = JSON.parse(savedNotifs);
      } catch (e) {
        loadedList = [];
      }
    }
    
    let listChanged = false;
    
    // Auto-generate notification for housekeeping if a room is in 'Limpieza' but not notified yet,
    // and clear completed cleanings from the list.
    if (role === 'housekeeping') {
      const roomsList = localDB.getRooms();
      
      // 1. Filter out stale cleaning notifications for rooms that are no longer dirty
      const filteredList = loadedList.filter((n) => {
        if (!n.roomNumber) return true;
        const r = roomsList.find((rm) => rm.number === n.roomNumber);
        if (!r) return true;
        
        const isCleaningNotif =
          n.title.toLowerCase().includes('limpieza') ||
          n.title.toLowerCase().includes('sucia') ||
          n.message.toLowerCase().includes('limpieza') ||
          n.message.toLowerCase().includes('sucia');
          
        if (r.status !== 'Limpieza' && isCleaningNotif) {
          listChanged = true;
          return false; // remove
        }
        return true; // keep
      });
      
      loadedList = filteredList;
      
      // 2. Auto-generate notification for rooms that are in 'Limpieza' and not yet in the list
      roomsList.forEach((r) => {
        if (r.status === 'Limpieza') {
          const alreadyNotified = loadedList.some((n) =>
            n.roomNumber === r.number &&
            (n.title.toLowerCase().includes('limpieza') ||
              n.title.toLowerCase().includes('sucia') ||
              n.message.toLowerCase().includes('limpieza') ||
              n.message.toLowerCase().includes('sucia'))
          );
          if (!alreadyNotified) {
            const newNotif: HotelNotification = {
              id: `notif-auto-${r.number}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
              type: 'warning',
              title: 'Habitación Sucia (Requiere Limpieza)',
              message: `La Habitación ${r.number} se encuentra en estado 'Limpieza' y requiere atención.`,
              roomNumber: r.number,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
              read: false,
            };
            loadedList = [newNotif, ...loadedList];
            listChanged = true;
          }
        }
      });
      
      if (listChanged) {
        localStorage.setItem(notifKey, JSON.stringify(loadedList));
      }
    }
    
    setNotifications(loadedList);
  };

  // Load from localDB simulator
  const refreshState = () => {
    localDB.init();
    const loadedSedes = localDB.getSedes();
    setSedes(loadedSedes);
    
    // Default currentSede if none selected
    if (!currentSede && loadedSedes.length > 0) {
      setCurrentSedeState(loadedSedes[0]);
    }
    
    setRoomTypes(localDB.getRoomTypes());
    setRooms(localDB.getRooms());
    setGuests(localDB.getGuests());
    setStays(localDB.getStays());
    setProducts(localDB.getProducts());
    setConsumptions(localDB.getConsumptions());
    setIncidents(localDB.getIncidents());
    setBookings(localDB.getBookings());

    // Load auth status
    if (typeof window !== 'undefined') {
      const loggedIn = sessionStorage.getItem('hotelflow_logged_in') === 'true';
      const savedRole = (sessionStorage.getItem('hotelflow_active_role') || 'reception') as 'admin' | 'reception' | 'housekeeping';
      const savedUserRole = sessionStorage.getItem('hotelflow_user_role') as any;
      setIsLoggedIn(loggedIn);
      setActiveRoleState(savedRole);
      setUserRole(savedUserRole || null);
      setIsInitialized(true);

      loadNotificationsForRole(savedRole);
    }
  };

  useEffect(() => {
    refreshState();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key && e.key.startsWith('hotelflow_')) {
        refreshState();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Set selected Sede
  const setCurrentSede = (sede: Sede) => {
    setCurrentSedeState(sede);
    // In a multi-sede architecture, changing sede could refetch rooms/products for that sede
    // Here we can simulate it by seeding if needed or keeping standard state
  };

  const setActiveRole = (role: 'admin' | 'reception' | 'housekeeping') => {
    setActiveRoleState(role);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('hotelflow_active_role', role);
      loadNotificationsForRole(role);
    }
  };

  const login = (username: string, pass: string): boolean => {
    let role: 'admin' | 'reception' | 'housekeeping' | null = null;
    
    if (username === 'admin' && pass === 'admin123') {
      role = 'admin';
    } else if (username === 'reception' && pass === 'recep123') {
      role = 'reception';
    } else if (username === 'housekeeping' && pass === 'clean123') {
      role = 'housekeeping';
    }
    
    if (role) {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('hotelflow_logged_in', 'true');
        sessionStorage.setItem('hotelflow_active_role', role);
        sessionStorage.setItem('hotelflow_user_role', role);
        
        loadNotificationsForRole(role);
      }
      setIsLoggedIn(true);
      setUserRole(role);
      setActiveRoleState(role);
      pushNotification(
        'success',
        'Sesión Iniciada',
        `Bienvenido al panel como ${role === 'admin' ? 'Administrador' : role === 'reception' ? 'Recepcionista' : 'Limpieza'}`,
        undefined,
        [role]
      );
      return true;
    }
    return false;
  };

  const logout = () => {
    const previousRole = activeRole;
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('hotelflow_logged_in');
      sessionStorage.removeItem('hotelflow_active_role');
      sessionStorage.removeItem('hotelflow_user_role');
    }
    setIsLoggedIn(false);
    setUserRole(null);
    setActiveRoleState('reception');
    
    loadNotificationsForRole('reception');
    
    pushNotification('info', 'Sesión Cerrada', 'Has cerrado tu sesión en el PMS.', undefined, [previousRole]);
  };

  // Push notifications helper
  const pushNotification = (
    type: HotelNotification['type'],
    title: string,
    message: string,
    roomNumber?: string,
    targetRoles: Array<'admin' | 'reception' | 'housekeeping'> = ['admin', 'reception', 'housekeeping']
  ) => {
    const newNotif: HotelNotification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      message,
      roomNumber,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      read: false,
    };
    
    if (typeof window !== 'undefined') {
      targetRoles.forEach((role) => {
        const key = `hotelflow_notifications_${role}`;
        const existing = localStorage.getItem(key);
        let list: HotelNotification[] = [];
        if (existing) {
          try {
            list = JSON.parse(existing);
          } catch (e) {
            list = [];
          }
        }
        const updated = [newNotif, ...list];
        localStorage.setItem(key, JSON.stringify(updated));
      });
    }

    if (targetRoles.includes(activeRole)) {
      setNotifications((prev) => [newNotif, ...prev]);
    }
  };

  const clearNotification = (id: string) => {
    setNotifications((prev) => {
      const updated = prev.filter((n) => n.id !== id);
      if (typeof window !== 'undefined') {
        const key = `hotelflow_notifications_${activeRole}`;
        localStorage.setItem(key, JSON.stringify(updated));
      }
      return updated;
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    if (typeof window !== 'undefined') {
      const key = `hotelflow_notifications_${activeRole}`;
      localStorage.setItem(key, JSON.stringify([]));
    }
  };

  // Background monitor: Checks staying timers
  useEffect(() => {
    const interval = setInterval(() => {
      if (rooms.length === 0 || stays.length === 0) return;
      
      const now = new Date().getTime();

      // Helper to check if already notified in target role's lists
      const checkAlreadyNotified = (roomNum: string, textSnippet: string) => {
        if (typeof window === 'undefined') return false;
        const key = 'hotelflow_notifications_reception'; // check reception's list
        const existing = localStorage.getItem(key);
        if (!existing) return false;
        try {
          const list: HotelNotification[] = JSON.parse(existing);
          return list.some(n => n.roomNumber === roomNum && n.message.includes(textSnippet));
        } catch (e) {
          return false;
        }
      };

      rooms.forEach((room) => {
        if (room.status === 'Ocupada' && room.current_stay_id) {
          const stay = stays.find((s) => s.id === room.current_stay_id && s.status === 'active');
          if (stay) {
            const expectedCheckout = new Date(stay.expected_check_out_time).getTime();
            const timeLeftMs = expectedCheckout - now;
            const timeLeftMins = Math.floor(timeLeftMs / 60000);

            // Trigger Alert if expiring soon (less than 45 minutes)
            if (timeLeftMins <= 45 && timeLeftMins > 44) {
              const alreadyNotified = checkAlreadyNotified(room.number, 'próxima a vencer');
              if (!alreadyNotified) {
                pushNotification(
                  'warning',
                  'Estadía por vencer',
                  `La estadía de la Habitación ${room.number} vencerá en 45 minutos.`,
                  room.number,
                  ['reception', 'admin']
                );
              }
            }

            // Trigger Alert if expired
            if (timeLeftMins <= 0) {
              const alreadyNotified = checkAlreadyNotified(room.number, 'vencida');
              if (!alreadyNotified) {
                pushNotification(
                  'alert',
                  'Estadía VENCIDA',
                  `La estadía de la Habitación ${room.number} ha vencido. Requiere Check-Out o Extensión.`,
                  room.number,
                  ['reception', 'admin']
                );
              }
            }
          }
        }
      });
    }, 10000); // Check every 10 seconds

    return () => clearInterval(interval);
  }, [rooms, stays]);

  // --- ACTIONS ---

  // Check-In
  const checkIn = (
    roomId: string,
    guestData: Omit<Guest, 'id' | 'created_at'>,
    durationHours: number,
    totalPaid: number,
    paymentMethod: string,
    companionName?: string,
    companionDni?: string,
    roomPaid: boolean = true
  ) => {
    const guest = localDB.findOrCreateGuest(guestData);
    const checkInTime = new Date();
    const expectedCheckoutTime = new Date(checkInTime.getTime() + durationHours * 60 * 60 * 1000);

    localDB.addStay({
      room_id: roomId,
      guest_id: guest.id,
      check_in_time: checkInTime.toISOString(),
      duration_hours: durationHours,
      expected_check_out_time: expectedCheckoutTime.toISOString(),
      actual_check_out_time: null,
      status: 'active',
      total_paid: roomPaid ? totalPaid : 0,
      payment_method: paymentMethod,
      companion_name: companionName || null,
      companion_dni: companionDni || null,
      room_cost: totalPaid,
      room_paid: roomPaid,
    });

    const room = localDB.getRooms().find((r) => r.id === roomId);
    pushNotification(
      'success',
      'Check-In Exitoso',
      `Habitación ${room?.number} ocupada por ${guest.name} (${durationHours} horas).`,
      room?.number,
      ['reception', 'admin']
    );
    refreshState();
  };

  // Check-Out
  const checkOut = (roomId: string) => {
    const roomsCopy = localDB.getRooms();
    const room = roomsCopy.find((r) => r.id === roomId);
    if (!room || !room.current_stay_id) return;

    const stay = localDB.getStays().find((s) => s.id === room.current_stay_id);
    if (!stay) return;

    // Register payment of everything pending before checkout
    localDB.registerStayPayment(stay.id);

    // Recalculate total paid
    const updatedStay = localDB.getStays().find((s) => s.id === stay.id);
    const finalTotal = updatedStay ? updatedStay.total_paid : stay.total_paid;

    localDB.updateStay(stay.id, {
      actual_check_out_time: new Date().toISOString(),
      status: 'completed',
    });

    localDB.updateRoom(roomId, {
      status: 'Limpieza',
      current_stay_id: null,
    });

    // Notify reception and admin
    pushNotification(
      'info',
      'Check-Out Procesado',
      `Habitación ${room.number} liberada. Cuenta total: S/${finalTotal.toFixed(2)}. Enviada a Limpieza.`,
      room.number,
      ['reception', 'admin']
    );

    // Notify cleaning that room is dirty
    pushNotification(
      'warning',
      'Habitación Sucia (Requiere Limpieza)',
      `La Habitación ${room.number} ha quedado sucia tras el Check-Out. Requiere limpieza.`,
      room.number,
      ['housekeeping']
    );

    refreshState();
  };

  // Extend Stay
  const extendStay = (roomId: string, hoursToAdd: number, price: number) => {
    const roomsCopy = localDB.getRooms();
    const room = roomsCopy.find((r) => r.id === roomId);
    if (!room || !room.current_stay_id) return;

    const stay = localDB.getStays().find((s) => s.id === room.current_stay_id);
    if (!stay) return;

    const currentExpected = new Date(stay.expected_check_out_time).getTime();
    const newExpected = new Date(currentExpected + hoursToAdd * 60 * 60 * 1000);

    const isPaidUpfront = stay.room_paid;

    localDB.updateStay(stay.id, {
      expected_check_out_time: newExpected.toISOString(),
      duration_hours: stay.duration_hours + hoursToAdd,
      room_cost: stay.room_cost + price,
      total_paid: stay.total_paid + (isPaidUpfront ? price : 0),
      status: 'extended',
    });

    pushNotification(
      'success',
      'Estadía Extendida',
      `Habitación ${room.number} extendida en +${hoursToAdd} horas (S/${price}).`,
      room.number,
      ['reception', 'admin']
    );
    refreshState();
  };

  // Add Room Service Order
  const addRoomServiceOrder = (roomId: string, productId: string, quantity: number) => {
    const room = localDB.getRooms().find((r) => r.id === roomId);
    if (!room || !room.current_stay_id) return;

    const product = localDB.getProducts().find((p) => p.id === productId);
    if (!product) return;

    localDB.addConsumption({
      stay_id: room.current_stay_id,
      product_id: productId,
      quantity,
      unit_price: product.price,
      status: 'pending',
      payment_status: 'pending',
    });

    pushNotification(
      'info',
      'Nuevo Pedido',
      `Pedido recibido en Habitación ${room.number}: ${quantity}x ${product.name}.`,
      room.number,
      ['reception', 'admin']
    );
    refreshState();
  };

  // Deliver Room Service Order
  const deliverOrder = (orderId: string) => {
    localDB.updateConsumptionStatus(orderId, 'delivered');
    
    // Find room number for notification
    const order = localDB.getConsumptions().find((o) => o.id === orderId);
    if (order) {
      const stay = localDB.getStays().find((s) => s.id === order.stay_id);
      const room = localDB.getRooms().find((r) => r.id === stay?.room_id);
      const product = localDB.getProducts().find((p) => p.id === order.product_id);
      
      pushNotification(
        'success',
        'Pedido Entregado',
        `Entregado en Habitación ${room?.number || '?'}: ${product?.name}.`,
        room?.number,
        ['reception', 'admin']
      );
    }
    refreshState();
  };

  // Request room clean
  const requestRoomCleanup = (roomId: string) => {
    const room = localDB.updateRoom(roomId, { status: 'Limpieza' });
    pushNotification(
      'info',
      'Limpieza Solicitada',
      `El huésped de la Habitación ${room.number} ha solicitado limpieza de habitación.`,
      room.number,
      ['housekeeping', 'admin', 'reception']
    );
    refreshState();
  };

  // Housekeeping: Start Cleaning
  const startRoomCleanup = (roomId: string) => {
    const room = localDB.updateRoom(roomId, { status: 'Limpieza' }); // clean in progress can be status 'Limpieza' or tracked in state
    // We can also log a start time if needed
    pushNotification(
      'info',
      'Limpieza Iniciada',
      `Personal de limpieza ingresó a la Habitación ${room.number}.`,
      room.number,
      ['admin', 'reception']
    );
    refreshState();
  };

  // Housekeeping: Finish Cleaning
  const finishRoomCleanup = (roomId: string) => {
    const room = localDB.updateRoom(roomId, {
      status: 'Disponible',
      last_cleaning_at: new Date().toISOString(),
    });
    pushNotification(
      'success',
      'Habitación Lista',
      `Habitación ${room.number} se encuentra limpia y disponible para asignación.`,
      room.number,
      ['reception', 'admin']
    );
    refreshState();
  };

  // Report Incident
  const reportIncident = (
    roomId: string,
    description: string,
    priority: 'low' | 'medium' | 'high' | 'critical'
  ) => {
    const room = localDB.getRooms().find((r) => r.id === roomId);
    localDB.addIncident({
      room_id: roomId,
      reporter_role: activeRole,
      description,
      priority,
      status: 'pending',
    });

    pushNotification(
      'alert',
      'Incidencia Reportada',
      `Incidencia [${priority.toUpperCase()}] en Habitación ${room?.number}: ${description}`,
      room?.number,
      ['admin', 'reception', 'housekeeping']
    );
    refreshState();
  };

  // Resolve Incident
  const resolveIncident = (incidentId: string) => {
    const inc = localDB.updateIncidentStatus(incidentId, 'resolved');
    const room = localDB.getRooms().find((r) => r.id === inc.room_id);
    
    pushNotification(
      'success',
      'Incidencia Resuelta',
      `Incidencia en Habitación ${room?.number || '?'} marcada como resuelta.`,
      room?.number,
      ['admin', 'reception']
    );

    // If the room was returned to Limpieza status, notify cleaning!
    if (room && room.status === 'Limpieza') {
      pushNotification(
        'warning',
        'Habitación Sucia (Mantenimiento Finalizado)',
        `La Habitación ${room.number} ha salido de Mantenimiento y requiere Limpieza.`,
        room.number,
        ['housekeeping']
      );
    }
    refreshState();
  };

  // Create Booking
  const createBooking = (bookingData: Omit<Booking, 'id' | 'created_at' | 'status'>) => {
    const b = localDB.addBooking({
      ...bookingData,
      status: 'confirmed',
    });
    const type = roomTypes.find((t) => t.id === bookingData.room_type_id);
    pushNotification(
      'success',
      'Nueva Reserva Web',
      `Reserva confirmada de ${bookingData.name} para Habitación ${type?.name || ''}.`,
      undefined,
      ['reception', 'admin']
    );
    refreshState();
    return b;
  };

  const updateRoomStatus = (roomId: string, status: Room['status']) => {
    const roomsCopy = localDB.getRooms();
    const room = roomsCopy.find((r) => r.id === roomId);
    const oldStatus = room ? room.status : null;

    localDB.updateRoom(roomId, { status });

    if (status === 'Limpieza' && oldStatus !== 'Limpieza' && room) {
      pushNotification(
        'warning',
        'Habitación Sucia (Requiere Limpieza)',
        `La Habitación ${room.number} requiere limpieza (cambio de estado manual).`,
        room.number,
        ['housekeeping']
      );
    }
    refreshState();
  };

  const toggleNoDisturb = (roomId: string) => {
    const room = localDB.getRooms().find((r) => r.id === roomId);
    if (!room) return;
    const newVal = !room.no_disturb;
    localDB.updateRoom(roomId, { no_disturb: newVal });
    pushNotification(
      newVal ? 'warning' : 'info',
      newVal ? 'Modo No Molestar' : 'Modo Estándar',
      `Habitación ${room.number} activó '${newVal ? 'No Molestar' : 'Disponible para servicios'}'.`,
      room.number,
      ['reception', 'admin', 'housekeeping']
    );
    refreshState();
  };

  const updateProductStock = (productId: string, stock: number) => {
    const current = localDB.getProducts().find((p) => p.id === productId);
    if (!current) return;
    const diff = stock - current.stock;
    localDB.updateProductStock(productId, diff);
    refreshState();
  };

  const updateProductPrice = (productId: string, price: number) => {
    localDB.updateProductPrice(productId, price);
    refreshState();
  };

  const addRoom = (roomData: Omit<Room, 'id' | 'created_at' | 'status' | 'current_stay_id' | 'last_cleaning_at' | 'last_maintenance_at'>) => {
    localDB.addRoom(roomData);
    refreshState();
  };

  const deleteRoom = (roomId: string) => {
    localDB.deleteRoom(roomId);
    refreshState();
  };

  const updateRoomType = (typeId: string, updates: Partial<RoomType>) => {
    localDB.updateRoomType(typeId, updates);
    refreshState();
  };

  const addProduct = (productData: Omit<Product, 'id' | 'created_at'>) => {
    localDB.addProduct(productData);
    refreshState();
  };

  const registerStayPayment = (stayId: string) => {
    localDB.registerStayPayment(stayId);

    const stayObj = localDB.getStays().find((s) => s.id === stayId);
    const room = localDB.getRooms().find((r) => r.id === stayObj?.room_id);

    pushNotification(
      'success',
      'Pago Registrado',
      `Se registró el pago de consumos pendientes para la Habitación ${room?.number || '?'}.`,
      room?.number,
      ['reception', 'admin']
    );
    refreshState();
  };

  return (
    <AppContext.Provider
      value={{
        sedes,
        currentSede,
        roomTypes,
        rooms,
        guests,
        stays,
        products,
        consumptions,
        incidents,
        bookings,
        notifications,
        activeRole,
        isLoggedIn,
        isInitialized,
        userRole,
        setCurrentSede,
        setActiveRole,
        login,
        logout,
        checkIn,
        checkOut,
        extendStay,
        addRoomServiceOrder,
        deliverOrder,
        requestRoomCleanup,
        startRoomCleanup,
        finishRoomCleanup,
        reportIncident,
        resolveIncident,
        createBooking,
        updateRoomStatus,
        toggleNoDisturb,
        updateProductStock,
        updateProductPrice,
        clearNotification,
        clearAllNotifications,
        addRoom,
        deleteRoom,
        updateRoomType,
        addProduct,
        registerStayPayment,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
