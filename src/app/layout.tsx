import type { Metadata } from 'next';
import { AppProvider } from '@/context/AppContext';
import './globals.css';

export const metadata: Metadata = {
  title: 'HOTELFLOW — Premium PMS & CRM Hotelero',
  description: 'La plataforma moderna y elegante para la gestión integral de hoteles, hostales y suites. Property Management System y CRM de Huéspedes de última generación.',
  keywords: 'hotel pms, hotel crm, property management system, gestion hotelera, hotelflow, room service digital, housekeeping app',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full bg-slate-50 antialiased">
      <head>
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🏨</text></svg>" />
      </head>
      <body className="min-h-full flex flex-col font-sans text-slate-900 antialiased selection:bg-indigo-100 selection:text-indigo-900">
        <AppProvider>
          {children}
        </AppProvider>
      </body>
    </html>
  );
}
