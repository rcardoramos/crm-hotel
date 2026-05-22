import { createClient } from '@supabase/supabase-js';

// --- TYPES ---
export interface Sede {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  created_at: string;
}

export interface RoomType {
  id: string;
  name: string;
  description: string;
  price_6h: number;
  price_12h: number;
  price_24h: number;
  price_custom_hour: number;
  amenities: string[];
  images: string[];
  created_at: string;
}

export interface Room {
  id: string;
  sede_id: string;
  number: string;
  floor: number;
  type_id: string;
  status: 'Disponible' | 'Reservada' | 'Ocupada' | 'Limpieza' | 'Mantenimiento' | 'Fuera de servicio';
  current_stay_id: string | null;
  last_cleaning_at: string | null;
  last_maintenance_at: string | null;
  created_at: string;
  no_disturb?: boolean; // guest preference
}

export interface Guest {
  id: string;
  name: string;
  document_id: string;
  phone: string;
  email: string;
  address: string;
  birth_date?: string;
  notes: string;
  created_at: string;
}

export interface Stay {
  id: string;
  room_id: string;
  guest_id: string;
  check_in_time: string;
  duration_hours: number;
  expected_check_out_time: string;
  actual_check_out_time: string | null;
  status: 'active' | 'completed' | 'extended';
  total_paid: number;
  payment_method: string;
  companion_name?: string | null;
  companion_dni?: string | null;
  created_at: string;
  room_cost: number;
  room_paid: boolean;
}

export interface Product {
  id: string;
  sede_id: string;
  name: string;
  category: 'snacks' | 'drinks' | 'meals' | 'amenities' | 'other';
  price: number;
  stock: number;
  created_at: string;
}

export interface Consumption {
  id: string;
  stay_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  status: 'pending' | 'delivered';
  created_at: string;
  payment_status?: 'pending' | 'paid';
}

export interface Incident {
  id: string;
  room_id: string;
  reporter_role: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved';
  photo_url?: string;
  created_at: string;
}

export interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  room_type_id: string;
  check_in_date: string;
  check_out_date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  total_price: number;
  created_at: string;
}

// --- SUPABASE CLIENT SETUP ---
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);

export const supabaseClient = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// --- SEED DATA FOR LOCAL fallback ---
const SEED_SEDES: Sede[] = [
  {
    id: 'sede-1',
    name: 'HotelFlow Premium Miraflores',
    address: 'Av. Larco 1240, Miraflores, Lima',
    phone: '+51 1 444-5555',
    email: 'miraflores@hotelflow.com',
    created_at: new Date().toISOString(),
  },
  {
    id: 'sede-2',
    name: 'HotelFlow Boutique Cusco',
    address: 'Calle Palacio 123, Cusco',
    phone: '+51 84 222-3333',
    email: 'cusco@hotelflow.com',
    created_at: new Date().toISOString(),
  },
];

const SEED_ROOM_TYPES: RoomType[] = [
  {
    id: 'type-simple',
    name: 'Simple',
    description: 'Habitación acogedora diseñada para viajeros individuales o estadías de negocios express.',
    price_6h: 40,
    price_12h: 60,
    price_24h: 90,
    price_custom_hour: 10,
    amenities: ['Wifi Ultra Rápido', 'Smart TV 43"', 'Baño Privado con Ducha Española', 'Escritorio de trabajo'],
    images: ['https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=800&q=80'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'type-matrimonial',
    name: 'Matrimonial',
    description: 'Perfecta para parejas. Amplia cama Queen y detalles de iluminación cálida.',
    price_6h: 60,
    price_12h: 90,
    price_24h: 130,
    price_custom_hour: 15,
    amenities: ['Cama Queen Size', 'Wifi de Alta Velocidad', 'Smart TV 50"', 'Aire Acondicionado', 'Minibar'],
    images: ['https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=80'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'type-suite',
    name: 'Suite',
    description: 'Espacio elegante con zona de estar separada, acabados de mármol y comodidades premium.',
    price_6h: 90,
    price_12h: 140,
    price_24h: 200,
    price_custom_hour: 22,
    amenities: ['Zona de Estar', 'Cama King Size', 'Smart TV 55"', 'Cafetera Premium', 'Albornoces y Pantuflas'],
    images: ['https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=800&q=80'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'type-jacuzzi',
    name: 'Suite Jacuzzi',
    description: 'Nuestra habitación insignia para momentos especiales. Cuenta con un jacuzzi de hidromasaje moderno.',
    price_6h: 140,
    price_12h: 200,
    price_24h: 300,
    price_custom_hour: 35,
    amenities: ['Jacuzzi Hidromasaje Doble', 'Cama King Size', 'Smart TV 65" curvo', 'Sonido Bluetooth integrado', 'Iluminación LED personalizable', 'Frigobar abastecido'],
    images: ['https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=800&q=80'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'type-premium',
    name: 'Premium',
    description: 'Lujo contemporáneo. Vista espectacular de la ciudad, cama con sábanas de 500 hilos y bar integrado.',
    price_6h: 180,
    price_12h: 260,
    price_24h: 380,
    price_custom_hour: 45,
    amenities: ['Vista Panorámica del 5to piso', 'Cama Super King', 'Jacuzzi Privado', 'Menú de Almohadas', 'Sistema de Domótica inteligente', 'Amenities L’Occitane'],
    images: ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=800&q=80'],
    created_at: new Date().toISOString(),
  },
  {
    id: 'type-presidencial',
    name: 'Presidencial',
    description: 'La máxima experiencia de exclusividad. Terraza privada, jacuzzi al aire libre y atención de mayordomo las 24h.',
    price_6h: 250,
    price_12h: 400,
    price_24h: 600,
    price_custom_hour: 70,
    amenities: ['Terraza Privada con Jacuzzi Exterior', 'Sala, Comedor y Cocina equipada', 'Dos dormitorios Master', 'Mayordomo privado las 24 horas', 'Acceso a helipuerto', 'Traslados en auto premium incluidos'],
    images: ['https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=800&q=80'],
    created_at: new Date().toISOString(),
  },
];

const SEED_PRODUCTS = (sedeId: string): Product[] => [
  // Snacks
  { id: 'p-1', sede_id: sedeId, name: 'Papas Lays Clásicas', category: 'snacks', price: 5, stock: 50, created_at: new Date().toISOString() },
  { id: 'p-2', sede_id: sedeId, name: 'Chocolate Sublime Extragrande', category: 'snacks', price: 4, stock: 40, created_at: new Date().toISOString() },
  { id: 'p-3', sede_id: sedeId, name: 'Galletas Club Social (Pack x3)', category: 'snacks', price: 3, stock: 60, created_at: new Date().toISOString() },
  { id: 'p-4', sede_id: sedeId, name: 'Pistachos Salados Importados', category: 'snacks', price: 12, stock: 25, created_at: new Date().toISOString() },

  // Drinks
  { id: 'p-5', sede_id: sedeId, name: 'Agua Mineral Evian 500ml', category: 'drinks', price: 6, stock: 100, created_at: new Date().toISOString() },
  { id: 'p-6', sede_id: sedeId, name: 'Coca-Cola Zero Lata', category: 'drinks', price: 5, stock: 80, created_at: new Date().toISOString() },
  { id: 'p-7', sede_id: sedeId, name: 'Red Bull Energy Drink', category: 'drinks', price: 12, stock: 45, created_at: new Date().toISOString() },
  { id: 'p-8', sede_id: sedeId, name: 'Cerveza Stella Artois 330ml', category: 'drinks', price: 10, stock: 60, created_at: new Date().toISOString() },

  // Meals
  { id: 'p-9', sede_id: sedeId, name: 'Hamburguesa Angus Flow con Queso & Papas', category: 'meals', price: 24, stock: 20, created_at: new Date().toISOString() },
  { id: 'p-10', sede_id: sedeId, name: 'Pizza Personal Margarita con Hojas de Albahaca', category: 'meals', price: 28, stock: 15, created_at: new Date().toISOString() },
  { id: 'p-11', sede_id: sedeId, name: 'Sándwich Club Clásico de Tres Pisos', category: 'meals', price: 18, stock: 30, created_at: new Date().toISOString() },
  { id: 'p-12', sede_id: sedeId, name: 'Piqueo Caliente (Tequeños, Alitas y Papas)', category: 'meals', price: 32, stock: 10, created_at: new Date().toISOString() },

  // Amenities
  { id: 'p-13', sede_id: sedeId, name: 'Toallas adicionales de Baño (Par)', category: 'amenities', price: 0, stock: 100, created_at: new Date().toISOString() },
  { id: 'p-14', sede_id: sedeId, name: 'Kit de higiene Dental & Afeitado Premium', category: 'amenities', price: 10, stock: 50, created_at: new Date().toISOString() },
  { id: 'p-15', sede_id: sedeId, name: 'Almohada de Plumas Extra', category: 'amenities', price: 0, stock: 30, created_at: new Date().toISOString() },

  // Other
  { id: 'p-16', sede_id: sedeId, name: 'Preservativos Durex (Caja x3)', category: 'other', price: 15, stock: 80, created_at: new Date().toISOString() },
  { id: 'p-17', sede_id: sedeId, name: 'Bolsa de Hielo Premium 2kg', category: 'other', price: 8, stock: 30, created_at: new Date().toISOString() },
  { id: 'p-18', sede_id: sedeId, name: 'Cargador Carga Rápida USB-C & Lightning', category: 'other', price: 35, stock: 15, created_at: new Date().toISOString() },
];

const SEED_GUESTS: Guest[] = [
  {
    id: 'g-1',
    name: 'Carlos Mendoza',
    document_id: '45829104',
    phone: '+51 987654321',
    email: 'carlos.mendoza@gmail.com',
    address: 'Av. El Sol 450, Miraflores',
    birth_date: '1988-06-15',
    notes: 'Cliente corporativo frecuente. Prefiere check-in rápido y almohadas adicionales.',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'g-2',
    name: 'Andrea Valenzuela',
    document_id: '72819304',
    phone: '+51 912345678',
    email: 'andrea.v@outlook.com',
    address: 'Calle Los Cedros 123, San Isidro',
    birth_date: '1995-11-22',
    notes: 'Huésped vacacional. Le gustan los cuartos con Jacuzzi.',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const SEED_ROOMS = (sedeId: string): Room[] => [
  { id: 'r-101', sede_id: sedeId, number: '101', floor: 1, type_id: 'type-simple', status: 'Disponible', current_stay_id: null, last_cleaning_at: new Date().toISOString(), last_maintenance_at: null, created_at: new Date().toISOString() },
  { id: 'r-102', sede_id: sedeId, number: '102', floor: 1, type_id: 'type-matrimonial', status: 'Disponible', current_stay_id: null, last_cleaning_at: new Date().toISOString(), last_maintenance_at: null, created_at: new Date().toISOString() },
  { id: 'r-103', sede_id: sedeId, number: '103', floor: 1, type_id: 'type-suite', status: 'Ocupada', current_stay_id: 'stay-active-1', last_cleaning_at: new Date().toISOString(), last_maintenance_at: null, created_at: new Date().toISOString() },
  { id: 'r-104', sede_id: sedeId, number: '104', floor: 1, type_id: 'type-jacuzzi', status: 'Limpieza', current_stay_id: null, last_cleaning_at: null, last_maintenance_at: null, created_at: new Date().toISOString() },
  
  { id: 'r-201', sede_id: sedeId, number: '201', floor: 2, type_id: 'type-simple', status: 'Disponible', current_stay_id: null, last_cleaning_at: new Date().toISOString(), last_maintenance_at: null, created_at: new Date().toISOString() },
  { id: 'r-202', sede_id: sedeId, number: '202', floor: 2, type_id: 'type-matrimonial', status: 'Reservada', current_stay_id: 'stay-active-2', last_cleaning_at: new Date().toISOString(), last_maintenance_at: null, created_at: new Date().toISOString() },
  { id: 'r-203', sede_id: sedeId, number: '203', floor: 2, type_id: 'type-jacuzzi', status: 'Disponible', current_stay_id: null, last_cleaning_at: new Date().toISOString(), last_maintenance_at: null, created_at: new Date().toISOString() },
  { id: 'r-204', sede_id: sedeId, number: '204', floor: 2, type_id: 'type-premium', status: 'Mantenimiento', current_stay_id: null, last_cleaning_at: null, last_maintenance_at: new Date().toISOString(), created_at: new Date().toISOString() },

  { id: 'r-301', sede_id: sedeId, number: '301', floor: 3, type_id: 'type-premium', status: 'Disponible', current_stay_id: null, last_cleaning_at: new Date().toISOString(), last_maintenance_at: null, created_at: new Date().toISOString() },
  { id: 'r-302', sede_id: sedeId, number: '302', floor: 3, type_id: 'type-presidencial', status: 'Disponible', current_stay_id: null, last_cleaning_at: new Date().toISOString(), last_maintenance_at: null, created_at: new Date().toISOString() },
];

const SEED_STAYS: Stay[] = [
  {
    id: 'stay-active-1',
    room_id: 'r-103',
    guest_id: 'g-1',
    check_in_time: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3 hours ago
    duration_hours: 6,
    expected_check_out_time: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(), // in 3 hours
    actual_check_out_time: null,
    status: 'active',
    total_paid: 90, // Room charge (6h Suite)
    payment_method: 'Efectivo',
    created_at: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    room_cost: 90,
    room_paid: true,
  },
  {
    id: 'stay-active-2',
    room_id: 'r-202',
    guest_id: 'g-2',
    check_in_time: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    duration_hours: 12,
    expected_check_out_time: new Date(Date.now() + 11 * 60 * 60 * 1000).toISOString(),
    actual_check_out_time: null,
    status: 'active',
    total_paid: 90, // Room charge (12h Matrimonial)
    payment_method: 'Tarjeta',
    created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    room_cost: 90,
    room_paid: true,
  },
];

const SEED_CONSUMPTIONS: Consumption[] = [
  {
    id: 'c-1',
    stay_id: 'stay-active-1',
    product_id: 'p-6', // Coca-Cola
    quantity: 2,
    unit_price: 5,
    status: 'delivered',
    created_at: new Date(Date.now() - 2.5 * 60 * 60 * 1000).toISOString(),
    payment_status: 'pending',
  },
  {
    id: 'c-2',
    stay_id: 'stay-active-1',
    product_id: 'p-9', // Hamburguesa Angus
    quantity: 1,
    unit_price: 24,
    status: 'pending', // reception notified
    created_at: new Date(Date.now() - 15 * 60 * 1000).toISOString(), // 15 mins ago
    payment_status: 'pending',
  },
];

const SEED_INCIDENTS: Incident[] = [
  {
    id: 'i-1',
    room_id: 'r-204',
    reporter_role: 'limpieza',
    description: 'Control de aire acondicionado inoperativo, no enfría la habitación.',
    priority: 'high',
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const SEED_BOOKINGS: Booking[] = [
  {
    id: 'b-1',
    name: 'Roberto Gómez',
    email: 'roberto@gmail.com',
    phone: '+51 999888777',
    room_type_id: 'type-jacuzzi',
    check_in_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    check_out_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    status: 'confirmed',
    total_price: 300,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// --- LOCAL STORAGE STATE MANAGER ---
class LocalDB {
  private get<T>(key: string, defaultValue: T): T {
    if (typeof window === 'undefined') return defaultValue;
    const data = localStorage.getItem(`hotelflow_${key}`);
    return data ? JSON.parse(data) : defaultValue;
  }

  private set<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(`hotelflow_${key}`, JSON.stringify(value));
  }

  init() {
    if (typeof window === 'undefined') return;
    if (!localStorage.getItem('hotelflow_initialized')) {
      this.set('sedes', SEED_SEDES);
      this.set('room_types', SEED_ROOM_TYPES);
      this.set('rooms', SEED_ROOMS('sede-1'));
      this.set('products', SEED_PRODUCTS('sede-1'));
      this.set('guests', SEED_GUESTS);
      this.set('stays', SEED_STAYS);
      this.set('consumptions', SEED_CONSUMPTIONS);
      this.set('incidents', SEED_INCIDENTS);
      this.set('bookings', SEED_BOOKINGS);
      this.set('initialized', true);
    } else {
      // Migration / Upgrade for existing installations:
      // Ensure all SEED_ROOM_TYPES exist in localStorage
      const existingTypes = this.getRoomTypes();
      let updatedTypes = false;
      SEED_ROOM_TYPES.forEach((seedType) => {
        if (!existingTypes.some((t) => t.id === seedType.id)) {
          existingTypes.push(seedType);
          updatedTypes = true;
        }
      });
      if (updatedTypes) {
        this.set('room_types', existingTypes);
      }

      // Ensure all SEED_ROOMS exist in localStorage
      const existingRooms = this.getRooms();
      let roomsUpdated = false;
      SEED_ROOMS('sede-1').forEach((seedRoom) => {
        if (!existingRooms.some((r) => r.id === seedRoom.id || r.number === seedRoom.number)) {
          existingRooms.push(seedRoom);
          roomsUpdated = true;
        }
      });
      if (roomsUpdated) {
        this.set('rooms', existingRooms);
      }
      
      // Ensure all SEED_PRODUCTS exist in localStorage
      const existingProducts = this.getProducts();
      let productsUpdated = false;
      SEED_PRODUCTS('sede-1').forEach((seedProduct) => {
        if (!existingProducts.some((p) => p.id === seedProduct.id)) {
          existingProducts.push(seedProduct);
          productsUpdated = true;
        }
      });
      if (productsUpdated) {
        this.set('products', existingProducts);
      }
    }
  }

  reset() {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('hotelflow_initialized');
    this.init();
  }

  // --- SEDES ---
  getSedes(): Sede[] { return this.get('sedes', SEED_SEDES); }

  // --- ROOM TYPES ---
  getRoomTypes(): RoomType[] { return this.get('room_types', SEED_ROOM_TYPES); }
  updateRoomType(typeId: string, updates: Partial<RoomType>): RoomType {
    const types = this.getRoomTypes();
    const idx = types.findIndex((t) => t.id === typeId);
    if (idx !== -1) {
      types[idx] = { ...types[idx], ...updates };
      this.set('room_types', types);
      return types[idx];
    }
    throw new Error('Room type not found');
  }

  // --- ROOMS ---
  getRooms(): Room[] { return this.get('rooms', []); }
  updateRoom(roomId: string, updates: Partial<Room>): Room {
    const rooms = this.getRooms();
    const idx = rooms.findIndex((r) => r.id === roomId);
    if (idx !== -1) {
      rooms[idx] = { ...rooms[idx], ...updates };
      this.set('rooms', rooms);
      return rooms[idx];
    }
    throw new Error('Room not found');
  }
  addRoom(room: Omit<Room, 'id' | 'created_at' | 'status' | 'current_stay_id' | 'last_cleaning_at' | 'last_maintenance_at'>): Room {
    const rooms = this.getRooms();
    const newRoom: Room = {
      ...room,
      id: `r-${Date.now()}`,
      status: 'Disponible',
      current_stay_id: null,
      last_cleaning_at: null,
      last_maintenance_at: null,
      created_at: new Date().toISOString(),
    };
    rooms.push(newRoom);
    this.set('rooms', rooms);
    return newRoom;
  }
  deleteRoom(roomId: string): void {
    const rooms = this.getRooms().filter((r) => r.id !== roomId);
    this.set('rooms', rooms);
  }

  // --- GUESTS ---
  getGuests(): Guest[] { return this.get('guests', []); }
  addGuest(guest: Omit<Guest, 'id' | 'created_at'>): Guest {
    const guests = this.getGuests();
    const newGuest: Guest = {
      ...guest,
      id: `g-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    guests.push(newGuest);
    this.set('guests', guests);
    return newGuest;
  }
  findOrCreateGuest(guestData: Omit<Guest, 'id' | 'created_at'>): Guest {
    const guests = this.getGuests();
    const existing = guests.find((g) => g.document_id === guestData.document_id);
    if (existing) {
      // update details if any changes
      const idx = guests.indexOf(existing);
      guests[idx] = { ...existing, ...guestData };
      this.set('guests', guests);
      return guests[idx];
    }
    return this.addGuest(guestData);
  }

  // --- STAYS ---
  getStays(): Stay[] { return this.get('stays', []); }
  addStay(stay: Omit<Stay, 'id' | 'created_at'>): Stay {
    const stays = this.getStays();
    const newStay: Stay = {
      ...stay,
      id: `stay-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    stays.push(newStay);
    this.set('stays', stays);

    // Link stay to room & set status to Ocupada
    this.updateRoom(stay.room_id, {
      current_stay_id: newStay.id,
      status: 'Ocupada',
    });

    return newStay;
  }
  updateStay(stayId: string, updates: Partial<Stay>): Stay {
    const stays = this.getStays();
    const idx = stays.findIndex((s) => s.id === stayId);
    if (idx !== -1) {
      stays[idx] = { ...stays[idx], ...updates };
      this.set('stays', stays);
      return stays[idx];
    }
    throw new Error('Stay not found');
  }

  registerStayPayment(stayId: string): void {
    const stays = this.getStays();
    const idx = stays.findIndex((s) => s.id === stayId);
    if (idx === -1) throw new Error('Stay not found');

    const stay = stays[idx];
    let extraPaid = 0;

    // Settle room if not paid
    if (!stay.room_paid) {
      stay.room_paid = true;
      extraPaid += stay.room_cost;
    }

    // Settle pending consumptions
    const consumptions = this.getConsumptions();
    consumptions.forEach((c) => {
      if (c.stay_id === stayId && c.payment_status !== 'paid') {
        c.payment_status = 'paid';
        extraPaid += c.quantity * c.unit_price;
      }
    });

    stay.total_paid += extraPaid;

    this.set('stays', stays);
    this.set('consumptions', consumptions);
  }

  // --- PRODUCTS ---
  getProducts(): Product[] { return this.get('products', []); }
  updateProductStock(productId: string, quantityChange: number): Product {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === productId);
    if (idx !== -1) {
      products[idx].stock = Math.max(0, products[idx].stock + quantityChange);
      this.set('products', products);
      return products[idx];
    }
    throw new Error('Product not found');
  }
  updateProductPrice(productId: string, newPrice: number): Product {
    const products = this.getProducts();
    const idx = products.findIndex((p) => p.id === productId);
    if (idx !== -1) {
      products[idx].price = newPrice;
      this.set('products', products);
      return products[idx];
    }
    throw new Error('Product not found');
  }
  addProduct(product: Omit<Product, 'id' | 'created_at'>): Product {
    const products = this.getProducts();
    const newProduct: Product = {
      ...product,
      id: `p-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    products.push(newProduct);
    this.set('products', products);
    return newProduct;
  }

  // --- CONSUMPTIONS ---
  getConsumptions(): Consumption[] { return this.get('consumptions', []); }
  addConsumption(consumption: Omit<Consumption, 'id' | 'created_at'>): Consumption {
    const consumptions = this.getConsumptions();
    const newConsumption: Consumption = {
      ...consumption,
      payment_status: consumption.payment_status || 'pending',
      id: `c-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    consumptions.push(newConsumption);
    this.set('consumptions', consumptions);

    // Discount stock automatically
    try {
      this.updateProductStock(consumption.product_id, -consumption.quantity);
    } catch (e) {
      console.error('Stock discount failed', e);
    }

    return newConsumption;
  }
  updateConsumptionStatus(id: string, status: 'pending' | 'delivered'): Consumption {
    const consumptions = this.getConsumptions();
    const idx = consumptions.findIndex((c) => c.id === id);
    if (idx !== -1) {
      consumptions[idx].status = status;
      this.set('consumptions', consumptions);
      return consumptions[idx];
    }
    throw new Error('Consumption not found');
  }

  // --- INCIDENTS ---
  getIncidents(): Incident[] { return this.get('incidents', []); }
  addIncident(incident: Omit<Incident, 'id' | 'created_at'>): Incident {
    const incidents = this.getIncidents();
    const newIncident: Incident = {
      ...incident,
      id: `i-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    incidents.push(newIncident);
    this.set('incidents', incidents);

    // If incident is high/critical, auto change room status to Mantenimiento or Fuera de servicio
    if (incident.priority === 'high' || incident.priority === 'critical') {
      this.updateRoom(incident.room_id, { status: 'Mantenimiento' });
    }

    return newIncident;
  }
  updateIncidentStatus(id: string, status: 'pending' | 'in_progress' | 'resolved'): Incident {
    const incidents = this.getIncidents();
    const idx = incidents.findIndex((i) => i.id === id);
    if (idx !== -1) {
      incidents[idx].status = status;
      this.set('incidents', incidents);

      // If resolved, auto mark room back to Limpieza or Disponible (let's set to Limpieza)
      if (status === 'resolved') {
        const incidentObj = incidents[idx];
        const rooms = this.getRooms();
        const r = rooms.find((rm) => rm.id === incidentObj.room_id);
        if (r && (r.status === 'Mantenimiento' || r.status === 'Fuera de servicio')) {
          this.updateRoom(r.id, { status: 'Limpieza' });
        }
      }

      return incidents[idx];
    }
    throw new Error('Incident not found');
  }

  // --- BOOKINGS ---
  getBookings(): Booking[] { return this.get('bookings', []); }
  addBooking(booking: Omit<Booking, 'id' | 'created_at'>): Booking {
    const bookings = this.getBookings();
    const newBooking: Booking = {
      ...booking,
      id: `b-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    bookings.push(newBooking);
    this.set('bookings', bookings);
    return newBooking;
  }
  updateBookingStatus(id: string, status: 'pending' | 'confirmed' | 'cancelled'): Booking {
    const bookings = this.getBookings();
    const idx = bookings.findIndex((b) => b.id === id);
    if (idx !== -1) {
      bookings[idx].status = status;
      this.set('bookings', bookings);
      return bookings[idx];
    }
    throw new Error('Booking not found');
  }
}

export const localDB = new LocalDB();

// Auto initialize db when loaded on browser
if (typeof window !== 'undefined') {
  localDB.init();
}
