-- HOTELFLOW Database Schema
-- Run this script in the Supabase SQL Editor to set up the tables.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Room Types
create table tipos_habitacion (
  id uuid default gen_random_uuid() primary key,
  name varchar not null,
  description text,
  price_6h decimal not null,
  price_12h decimal not null,
  price_24h decimal not null,
  price_custom_hour decimal not null,
  amenities jsonb default '[]'::jsonb,
  images jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Hotels / Locations (Multi-sede)
create table sedes (
  id uuid default gen_random_uuid() primary key,
  name varchar not null,
  address text,
  phone varchar,
  email varchar,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Rooms
create table habitaciones (
  id uuid default gen_random_uuid() primary key,
  sede_id uuid references sedes(id) on delete cascade,
  number varchar not null,
  floor integer not null,
  type_id uuid references tipos_habitacion(id) on delete restrict,
  status varchar not null check (status in ('Disponible', 'Reservada', 'Ocupada', 'Limpieza', 'Mantenimiento', 'Fuera de servicio')),
  current_stay_id uuid, -- links to active stay
  last_cleaning_at timestamp with time zone,
  last_maintenance_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Guests (CRM)
create table huespedes (
  id uuid default gen_random_uuid() primary key,
  name varchar not null,
  document_id varchar unique not null,
  phone varchar,
  email varchar,
  address text,
  birth_date date,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Stays (Hospedajes)
create table estadias (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references habitaciones(id) on delete cascade,
  guest_id uuid references huespedes(id) on delete restrict,
  check_in_time timestamp with time zone not null,
  duration_hours integer not null,
  expected_check_out_time timestamp with time zone not null,
  actual_check_out_time timestamp with time zone,
  status varchar not null check (status in ('active', 'completed', 'extended')),
  total_paid decimal not null default 0,
  payment_method varchar not null,
  companion_name varchar,
  companion_dni varchar,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Products & Inventory
create table productos (
  id uuid default gen_random_uuid() primary key,
  sede_id uuid references sedes(id) on delete cascade,
  name varchar not null,
  category varchar not null check (category in ('snacks', 'drinks', 'meals', 'amenities', 'other')),
  price decimal not null,
  stock integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Consumes (Orders from rooms/reception)
create table consumos (
  id uuid default gen_random_uuid() primary key,
  stay_id uuid references estadias(id) on delete cascade,
  product_id uuid references productos(id) on delete restrict,
  quantity integer not null default 1,
  unit_price decimal not null,
  status varchar not null check (status in ('pending', 'delivered')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Incidents (Mantenimiento / Limpieza)
create table incidencias (
  id uuid default gen_random_uuid() primary key,
  room_id uuid references habitaciones(id) on delete cascade,
  reporter_role varchar not null,
  description text not null,
  priority varchar not null check (priority in ('low', 'medium', 'high', 'critical')),
  status varchar not null check (status in ('pending', 'in_progress', 'resolved')),
  photo_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Web Online Bookings
create table reservas (
  id uuid default gen_random_uuid() primary key,
  name varchar not null,
  email varchar not null,
  phone varchar,
  room_type_id uuid references tipos_habitacion(id) on delete restrict,
  check_in_date date not null,
  check_out_date date not null,
  status varchar not null check (status in ('pending', 'confirmed', 'cancelled')),
  total_price decimal not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
