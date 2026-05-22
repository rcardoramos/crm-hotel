# HotelFlow — Contexto del Proyecto (PMS & CRM Hotelero)

Este documento sirve como un manual técnico de referencia rápida del proyecto **HotelFlow**. Su propósito es ofrecer una explicación detallada de la arquitectura, flujos de estado, base de datos, tipos de datos y vistas para que modelos de IA u otros desarrolladores entiendan el codebase de forma instantánea sin necesidad de escanear o leer todos los archivos del repositorio, reduciendo significativamente el consumo de tokens en conversaciones subsiguientes.

---

## 1. Descripción General del Proyecto

**HotelFlow** es un sistema híbrido de gestión hotelera (**PMS** - Property Management System) y relaciones con clientes (**CRM** - Customer Relationship Management) enfocado en suites y habitaciones con tarifas por horas (6h, 12h, 24h, custom).
- **Frontend / Framework**: Next.js 16.2.6 (con React 19) y TypeScript.
- **Estilos**: Tailwind CSS v4 (configurado mediante `@tailwindcss/postcss` en `postcss.config.mjs` y directivas en `src/app/globals.css`).
- **Animaciones**: Framer Motion (`framer-motion`) para transiciones fluidas de modales y tarjetas.
- **Iconografía**: Lucide React (`lucide-react`).
- **Base de Datos**: 
  - **Supabase** (`@supabase/supabase-js`) como base de datos cloud principal.
  - **LocalDB simulator** (`localStorage` en el navegador) como fallback automático si no están configuradas las variables de entorno de Supabase, ideal para demos sin configuración previa.

---

## 2. Estructura de Directorios Clave

```text
crm-hotel/
├── schema.sql              # Script SQL para base de datos Supabase (tablas, FKs y checks)
├── package.json            # Script de dependencias, scripts de Next y devServer
├── tsconfig.json           # Configuración de TypeScript
├── next.config.ts          # Configuración del compilador de Next.js
├── src/
│   ├── app/
│   │   ├── layout.tsx      # Layout raíz, envuelve la app con AppProvider y metadata SEO
│   │   ├── globals.css     # Estilos globales, variables CSS custom y Tailwind v4 @theme
│   │   ├── page.tsx        # Portal público de reservas online (calculadora de tarifas e IGV)
│   │   ├── dashboard/
│   │   │   └── page.tsx    # Panel de administración, KPIs de ocupación/ingresos e inventarios
│   │   ├── housekeeping/
│   │   │   └── page.tsx    # Panel del personal de limpieza y mantenimiento de incidencias
│   │   ├── reception/
│   │   │   └── page.tsx    # Mapa en vivo de habitaciones, modales de check-in y gestiones
│   │   └── room/
│   │       └── [id]/
│   │           └── page.tsx # Portal digital del huésped (QR en cuarto), menú Room Service y cuenta
│   ├── components/
│   │   └── AdminLayout.tsx # Sidebar de navegación responsiva, rol switcher y centro de alertas
│   ├── context/
│   │   └── AppContext.tsx  # Estado global reactivo, lógica de negocio y alertas de expiración
│   └── lib/
│       └── db.ts           # Definición de tipos, datos semilla y manejador LocalDB (localStorage)
```

---

## 3. Modelo de Datos y Base de Datos

### 3.1 Esquema Relacional (`schema.sql`)
La base de datos relacional contiene 9 tablas para gestionar el negocio:

1. **`tipos_habitacion`**: Define categorías de habitaciones.
   - `id` (uuid, PK), `name` (varchar), `description` (text), `price_6h` (decimal), `price_12h` (decimal), `price_24h` (decimal), `price_custom_hour` (decimal), `amenities` (jsonb), `images` (jsonb).
2. **`sedes`**: Permite arquitectura multi-sede/multi-sucursal.
   - `id` (uuid, PK), `name` (varchar), `address` (text), `phone` (varchar), `email` (varchar).
3. **`habitaciones`**: Inventario de cuartos físicos.
   - `id` (uuid, PK), `sede_id` (FK a `sedes`), `number` (varchar), `floor` (integer), `type_id` (FK a `tipos_habitacion`), `status` (varchar check: `'Disponible'`, `'Reservada'`, `'Ocupada'`, `'Limpieza'`, `'Mantenimiento'`, `'Fuera de servicio'`), `current_stay_id` (uuid), `last_cleaning_at` (timestamptz), `last_maintenance_at` (timestamptz).
4. **`huespedes` (CRM)**: Base de datos de clientes.
   - `id` (uuid, PK), `name` (varchar), `document_id` (varchar, unique/DNI), `phone` (varchar), `email` (varchar), `address` (text), `birth_date` (date), `notes` (text).
5. **`estadias` (Hospedajes)**: Registros de ocupaciones de habitaciones.
   - `id` (uuid, PK), `room_id` (FK a `habitaciones`), `guest_id` (FK a `huespedes`), `check_in_time` (timestamptz), `duration_hours` (integer), `expected_check_out_time` (timestamptz), `actual_check_out_time` (timestamptz), `status` (varchar check: `'active'`, `'completed'`, `'extended'`), `total_paid` (decimal), `payment_method` (varchar).
6. **`productos`**: Catálogo de bar, cocina y extras.
   - `id` (uuid, PK), `sede_id` (FK a `sedes`), `name` (varchar), `category` (varchar check: `'snacks'`, `'drinks'`, `'meals'`, `'amenities'`, `'other'`), `price` (decimal), `stock` (integer).
7. **`consumos`**: Pedidos asociados a hospedajes activos.
   - `id` (uuid, PK), `stay_id` (FK a `estadias`), `product_id` (FK a `productos`), `quantity` (integer), `unit_price` (decimal), `status` (varchar check: `'pending'`, `'delivered'`).
8. **`incidencias`**: Reportes de averías o mantenimiento.
   - `id` (uuid, PK), `room_id` (FK a `habitaciones`), `reporter_role` (varchar), `description` (text), `priority` (varchar check: `'low'`, `'medium'`, `'high'`, `'critical'`), `status` (varchar check: `'pending'`, `'in_progress'`, `'resolved'`), `photo_url` (text).
9. **`reservas`**: Almacena solicitudes de reserva desde el portal online público.
   - `id` (uuid, PK), `name` (varchar), `email` (varchar), `phone` (varchar), `room_type_id` (FK a `tipos_habitacion`), `check_in_date` (date), `check_out_date` (date), `status` (varchar check: `'pending'`, `'confirmed'`, `'cancelled'`), `total_price` (decimal).

### 3.2 Interfaces TypeScript (`src/lib/db.ts`)
Los datos se tipan estrictamente según las siguientes interfaces de TS:
- `Sede`, `RoomType`, `Room` (con opcional `no_disturb?: boolean`), `Guest`, `Stay`, `Product`, `Consumption`, `Incident`, `Booking`.

### 3.3 Persistencia en LocalDB (`src/lib/db.ts`)
Si `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` no están presentes en las variables de entorno, la app delega las operaciones a una instancia de la clase `LocalDB` (exportada como `localDB`). 
- Lee y escribe objetos en formato JSON dentro de `localStorage` utilizando la clave prefijada `hotelflow_*`.
- Implementa métodos para inicializar datos semilla (`init()`), actualizar stocks de inventario (`updateProductStock`), gestionar Check-Ins y Check-Outs simulando restricciones relacionales, y reportar/resolver incidencias.

---

## 4. Estado Global (`src/context/AppContext.tsx`)

Todas las llamadas de base de datos e interacciones de usuario son coordinadas por `AppContext`.

### 4.1 Alertas en Tiempo Real (`HotelNotification`)
Expone una cola de notificaciones reactivas de tipo:
- `id` (string), `type` (`'info' | 'warning' | 'alert' | 'success'`), `title` (string), `message` (string), `roomNumber` (string, opcional), `timestamp` (string), `read` (boolean).

### 4.2 Monitor en Segundo Plano
Tiene un interval de `useEffect` que corre **cada 10 segundos** para supervisar los hospedajes activos (`status === 'active'`):
1. Compara `expected_check_out_time` con la hora del sistema.
2. Si faltan **45 minutos o menos** para expirar, emite una alerta preventiva de tipo `'warning'` para notificar al recepcionista.
3. Si el tiempo restante es **menor o igual a cero**, emite una alerta crítica de tipo `'alert'` indicando que la estadía ha vencido y requiere Check-Out o Extensión inmediata.

### 4.3 Acciones de Negocio Expuestas (`useApp`)

| Nombre de Acción | Argumentos | Lógica e Impacto de Estado |
| :--- | :--- | :--- |
| **`checkIn`** | `roomId`, `guestData`, `durationHours`, `totalPaid`, `paymentMethod` | Busca en la DB si el huésped existe por DNI (si no, lo crea). Añade un objeto `Stay` de estado `'active'`. Actualiza el estado de la habitación a `'Ocupada'` y asocia su `current_stay_id`. Lanza notificación de éxito. |
| **`checkOut`** | `roomId` | Busca la estadía activa del cuarto. Suma el costo base de hospedaje + los consumos entregados/pendientes. Marca la estadía como `'completed'`, registra la fecha de salida real, remueve el `current_stay_id` de la habitación y la pasa a estado de `'Limpieza'`. Pushes alerta en consola de recepción. |
| **`extendStay`** | `roomId`, `hoursToAdd`, `price` | Modifica `expected_check_out_time` añadiendo las horas, incrementa `duration_hours` y suma el `price` de la extensión al `total_paid` de la estadía. Cambia el estado de la estadía a `'extended'`. |
| **`addRoomServiceOrder`** | `roomId`, `productId`, `quantity` | Registra un consumo asociado a la estadía activa con estado `'pending'`. Descuenta automáticamente la cantidad del stock en la tabla `productos`. Lanza notificación para recepcionista. |
| **`deliverOrder`** | `orderId` | Cambia el estado del consumo a `'delivered'`. Envía una alerta visual de entrega. |
| **`requestRoomCleanup`** | `roomId` | Establece el estatus del cuarto a `'Limpieza'`. Notifica a Housekeeping. |
| **`startRoomCleanup`** | `roomId` | Simula el ingreso del limpiador al cuarto (mantiene estatus `'Limpieza'`). |
| **`finishRoomCleanup`** | `roomId` | Pasa la habitación a estatus `'Disponible'`, actualiza `last_cleaning_at` con la fecha y hora actual y emite notificación. |
| **`reportIncident`** | `roomId`, `description`, `priority` | Agrega un reporte a `incidencias` en estado `'pending'`. Si la prioridad es `'high'` o `'critical'`, cambia automáticamente el estado del cuarto a `'Mantenimiento'` para bloquearlo e impedir Check-Ins. |
| **`resolveIncident`** | `incidentId` | Marca la incidencia como `'resolved'`. Si el cuarto estaba bloqueado en `'Mantenimiento'`, su estatus se revierte automáticamente a `'Limpieza'` para obligar una inspección de aseo antes de liberarlo. |
| **`createBooking`** | `bookingData` | Registra una reserva web en estado `'confirmed'`. |
| **`toggleNoDisturb`** | `roomId` | Invierte la bandera `no_disturb` de la habitación (bandera visual que limita notificaciones o accesos de limpieza). |

---

## 5. Arquitectura de Páginas y Componentes

### 5.1 Componente Base: `AdminLayout.tsx`
Layout compartido por los roles operativos.
- **Selector de Sede**: Permite cambiar la ubicación actual (sede seleccionada).
- **Filtro de Roles**: Permite simular tres tipos de cuentas mediante un control rápido:
  1. `admin` (acceso a todos los paneles: recepción, dashboard e inventario).
  2. `reception` (acceso a mapas en vivo, modales de check-in/out, consumos).
  3. `housekeeping` (acceso únicamente al portal de limpieza e incidencias).
- **Centro de Alertas de Cabecera**: Campana interactiva con animaciones de pulso que despliega la lista de alertas activas en tiempo real (estadías por vencer, pedidos de comida pendientes y averías mecánicas).

### 5.2 `/` (Reserva Online Pública)
Simulador de un motor de reservas web externo. 
- Muestra el catálogo de tipos de habitación (Simple, Matrimonial, Suite, Jacuzzi, Premium, Presidencial) con imágenes de Unsplash, tarifas y comodidades.
- Calculadora reactiva de cotizaciones: multiplica el número de noches estimadas por la tarifa diaria (`price_24h`), calcula el 18% del Impuesto General a las Ventas (IGV) y despliega el monto total.
- Formulario de datos que finaliza llamando a `createBooking`. No solicita pasarela de pagos (lógica de pago en el hotel).

### 5.3 `/reception` (Mapa de Habitaciones en Vivo)
La pantalla más compleja de la app, destinada a recepcionistas.
- **Mapa Modular**: Tarjetas interactivas de habitaciones con un diseño visual intuitivo:
  - Borde verde si está disponible.
  - Borde azul e indicador de barra de progreso de tiempo si está ocupada.
  - Reloj en vivo (cronómetro decreciente en formato `hh:mm:ss`) calculando el checkout en tiempo real.
  - Borde amarillo y animación de Sparkles si requiere limpieza.
  - Borde rojo si está bloqueada por mantenimiento.
- **Filtros rápidos**: Permite segregar la vista por pisos (1, 2, 3) y por estados del cuarto.
- **Modal de Check-In**:
  - Caja de autocompletado CRM: al ingresar un DNI de huésped y presionar buscar, rastrea en el estado de `guests` y llena automáticamente nombre, teléfono, correo e historial de notas.
  - Calculadora de precios según horas seleccionadas (6h, 12h, 24h, custom).
  - Selección de método de pago (Efectivo, Tarjeta, Transferencia).
- **Modal de Detalle de Habitación**:
  - Sección CRM con datos de huésped y notas especiales.
  - Consumos en vivo: carga directa de productos del frigobar a la cuenta (snacks, cervezas, comidas, etc.) con rebaja de stock automática.
  - Extensión de tiempo exprés (+1h, +2h, +6h) sumando importes de forma inmediata.
  - Toggle de "No Molestar" (DND) y botón de Check-Out final.

### 5.4 `/housekeeping` (Portal de Limpieza & Incidencias)
Para uso de mucamas, aseadores e ingenieros de mantenimiento.
- **Sección Limpieza**: Lista cuartos que requieren atención. Permite marcar el inicio de limpieza o completar el servicio de forma táctil en dispositivos móviles, lo que cambia la habitación de `'Limpieza'` a `'Disponible'`.
- **Formulario de Averías**: Permite reportar problemas del hotel (duchas obstruidas, fallas de internet, etc.), categorizar su nivel de urgencia y simular la carga de evidencias fotográficas.
- **Sección Incidencias**: Lista incidencias activas en orden de criticidad. Cuenta con la opción "Marcar como Resuelta" para desbloquear las habitaciones una vez corregido el problema.

### 5.5 `/room/[id]` (Portal del Huésped)
Una SPA (Single Page Application) móvil adaptada para abrirse escaneando un código QR en la habitación física.
- **Cronómetro de estadía**: Muestra exactamente cuántas horas y minutos le quedan al huésped en su cuarto.
- **Room Service Digital**: Catálogo interactivo de bar y restaurante del hotel ordenado por categorías. El huésped agrega comidas o amenities al carrito y al presionar "Enviar Pedido" el consumo se descuenta del inventario y se carga automáticamente a su cuenta de salida.
- **Tab de Cuenta**: Permite al cliente auditar en tiempo real cuánto dinero lleva acumulado (cargo del cuarto + consumos añadidos) para evitar sorpresas al salir.
- **Solicitud de servicios**: Petición de limpieza express o botón de llamada virtual para contactar a recepción.

### 5.6 `/dashboard` (KPIs & Configuración)
- **KPIs clave**: tasa de ocupación actual (%), ingresos totales acumulados (desglosados por hospedajes y ventas de comida/frigobar), total de clientes en el CRM y conteo de habitaciones libres/ocupadas.
- **Gráficas de Estado**: barra de distribución visual de estatus de habitaciones.
- **Edición de Tarifas e Inventarios**: listado completo de productos donde el administrador puede actualizar manualmente stock disponible y modificar precios de venta al público en tiempo real.
- **Reportes Top**: desglose de los productos más vendidos en el hotel (snacks/meals) y las habitaciones con mayor índice de rotación y check-ins.

---

## 6. CSS, Diseño y Usabilidad (`globals.css`)

El proyecto cumple con estándares de diseño estético moderno de nivel premium:
- **Tipografía**: Fuente **Outfit** de Google Fonts como fuente principal (`font-sans`), brindando un acabado redondo y elegante a los números de cuartos y botones.
- **Sombras**: Sombra premium sutil (`--shadow-premium`) para paneles flotantes y tarjetas.
- **Efecto Glassmorphism**: Utilidades `.glass-panel` y `.glass-card` con fondos blancos translúcidos, filtros `backdrop-blur(12px)` y bordes semi-transparentes de color slate.
- **Efectos Interactivos**: Hover suave en cartas de habitaciones (`glass-card-hover`) que genera un leve desplazamiento vertical de `-2px` y amplía su sombra para denotar interactividad.
- **Colores de Estado**: Las clases `.status-dot-green`, `.status-dot-yellow`, etc., aplican un resplandor de luz difuminada mediante `box-shadow` simulando leds de tableros industriales.

---

## 7. Instrucciones Clave para Ediciones Futuras

> [!IMPORTANT]
> - Al interactuar con el backend, recuerda que existe una lógica dual: si no hay base de datos configurada, todos los cambios se guardan localmente en el navegador. Las modificaciones a las interfaces en `src/lib/db.ts` requieren actualización simultánea en los métodos mock de la clase `LocalDB`.
> - La barra de progreso de tiempo del huésped en el mapa de recepción y en el portal de habitación depende enteramente de que los valores de `check_in_time` y `expected_check_out_time` sean cadenas ISO de fechas correctas.
> - Al añadir productos nuevos al catálogo de inventario en `src/lib/db.ts` (en `SEED_PRODUCTS`), asegúrate de asignarles una de las categorías válidas: `'snacks'`, `'drinks'`, `'meals'`, `'amenities'` u `'other'`, de lo contrario se omitirán en los filtros.
