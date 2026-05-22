'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import {
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  UtensilsCrossed,
  ShoppingBag,
  HelpCircle,
  CheckCircle,
  Wifi,
  Tv,
  Coffee,
  Smartphone,
  ChevronDown,
  ChevronUp,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Header from '@/components/Header';

export default function LandingPage() {
  const { roomTypes } = useApp();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const faqs = [
    {
      q: '¿Cómo funciona la modalidad de reserva por horas?',
      a: 'Puedes reservar habitaciones por bloques específicos de 6, 12 o 24 horas, o elegir una duración personalizada. El tiempo corre a partir de tu hora de check-in confirmada, permitiéndote pagar solo por el tiempo que realmente utilices.'
    },
    {
      q: '¿Cómo accedo al Room Service digital en mi habitación?',
      a: 'Al realizar el check-in en el hotel, recibirás un código QR único pegado en tu habitación. Al escanearlo con tu móvil, ingresarás automáticamente al portal de huésped donde podrás realizar pedidos al instante y ver el cronómetro en vivo de tu estadía.'
    },
    {
      q: '¿Se requiere tarjeta de crédito para reservar en línea?',
      a: 'No, no solicitamos tarjeta de crédito ni adelantos para reservas en línea. Tu reserva se guarda bajo tu nombre y teléfono y puedes pagar al llegar mediante efectivo, tarjeta de débito/crédito o transferencia.'
    },
    {
      q: '¿Puedo extender mi estadía una vez que ya esté en la habitación?',
      a: '¡Por supuesto! Desde el portal del huésped o llamando a recepción, puedes solicitar una extensión de 1h, 2h o 6h adicionales en cualquier momento, sujeto a la disponibilidad del cuarto.'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      {/* Hero Section */}
      <section className="relative bg-white pt-16 pb-24 px-6 overflow-hidden">
        {/* Decorative background gradients */}
        <div className="absolute top-0 right-0 -mt-24 -mr-24 w-96 h-96 bg-indigo-100 rounded-full blur-3xl opacity-50 pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-24 -ml-24 w-96 h-96 bg-slate-100 rounded-full blur-3xl opacity-50 pointer-events-none" />

        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-6 space-y-6 text-left"
          >
            <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
              <Sparkles className="h-3.5 w-3.5 mr-1.5 text-indigo-500" /> Experiencia Smart Hotel
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-950 leading-none tracking-tight">
              Tu estadía perfecta, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-slate-900 bg-indigo-600">
                a tu propio ritmo.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-650 leading-relaxed max-w-xl">
              Reserva suites premium por días completos o bloques flexibles de horas (6h, 12h, 24h). Disfruta de un ecosistema inteligente con Room Service a la habitación y control de checkout en vivo desde tu smartphone.
            </p>
            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/reserva"
                className="inline-flex items-center justify-center px-6 py-3.5 text-xs font-bold text-white bg-slate-900 rounded-xl hover:bg-slate-800 shadow-md hover:shadow-lg active:scale-98 transition duration-300"
              >
                Reservar Habitación <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
              <Link
                href="/shop"
                className="inline-flex items-center justify-center px-6 py-3.5 text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 active:scale-98 transition duration-300"
              >
                Ver Boutique Digital
              </Link>
            </div>

            {/* Quick trust badges */}
            <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-100">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-[10px] sm:text-xs font-semibold text-slate-600">Pago en Hotel</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-[10px] sm:text-xs font-semibold text-slate-600">Tarifas Flex por Horas</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                <span className="text-[10px] sm:text-xs font-semibold text-slate-600">Servicio Express QR</span>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] bg-slate-100 border border-slate-100">
              <img
                src="https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80"
                alt="HotelFlow Premium Room"
                className="object-cover w-full h-full transform hover:scale-102 transition duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent flex items-end p-8">
                <div className="text-white space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full">
                    Suite Presidencial
                  </span>
                  <h3 className="text-xl font-bold tracking-tight">Jacuzzi Exterior & Confort Premium</h3>
                  <p className="text-xs text-slate-200">Disponible para estadías cortas o extendidas.</p>
                </div>
              </div>
            </div>

            {/* Float badge widget */}
            <div className="absolute -bottom-6 -left-6 bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-xl border border-slate-100 flex items-center space-x-3 hidden sm:flex">
              <div className="h-10 w-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                <Clock className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Reservas desde</span>
                <span className="text-sm font-extrabold text-slate-900">S/ 60 por 6 Horas</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Value Proposition / Smart Hotel Features */}
      <section className="bg-slate-50 py-20 px-6 border-y border-slate-100">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ¿Por qué elegir HotelFlow?
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Redefinimos la hotelería moderna incorporando flexibilidad de tiempo y tecnología de autoservicio para una experiencia más cómoda y transparente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300 space-y-4">
              <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                <Clock className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Reserva de Horas o Días</h3>
              <p className="text-xs sm:text-sm text-slate-650 leading-relaxed">
                Elige la duración exacta de tu estadía. Bloques de 6h, 12h o 24h con checkout calculado al instante. Se acabaron los recargos fijos de check-out estándar.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300 space-y-4">
              <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                <Smartphone className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Portal del Huésped QR</h3>
              <p className="text-xs sm:text-sm text-slate-650 leading-relaxed">
                Sin descargas ni registros pesados. Escanea el código QR de tu suite para ver tu cronómetro de tiempo en vivo, solicitar amenities o programar extensiones.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition duration-300 space-y-4">
              <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                <UtensilsCrossed className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Room Service Digital</h3>
              <p className="text-xs sm:text-sm text-slate-650 leading-relaxed">
                Navega por la tienda boutique y solicita comida, cócteles o snacks del frigobar directo a tu suite. Los pedidos se cargan automáticamente a tu cuenta final.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Suites Preview */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest block">Catálogo Exclusivo</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Nuestras Suites más Populares</h2>
            </div>
            <Link
              href="/reserva"
              className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100/70 px-4 py-2.5 rounded-xl transition duration-300 shrink-0"
            >
              Ver todas las suites y tarifas <ArrowRight className="h-3.5 w-3.5 ml-1.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {roomTypes.slice(0, 3).map((type) => (
              <div
                key={type.id}
                className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-350 flex flex-col justify-between group"
              >
                <div>
                  <div className="h-48 overflow-hidden bg-slate-100 relative">
                    <img
                      src={type.images[0]}
                      alt={type.name}
                      className="object-cover w-full h-full transform group-hover:scale-103 transition duration-500"
                    />
                    <div className="absolute bottom-3 right-3 bg-slate-950/85 backdrop-blur-md px-3 py-1 rounded-xl text-xs font-extrabold text-white">
                      S/ {type.price_24h} / 24h
                    </div>
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-extrabold text-base text-slate-900 group-hover:text-indigo-600 transition">
                        {type.name}
                      </h3>
                      <span className="text-xs text-slate-500 font-bold bg-slate-50 px-2 py-1 rounded-lg">
                        6h: S/ {type.price_6h}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {type.description}
                    </p>
                    
                    {/* Amenities list */}
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {type.amenities.slice(0, 3).map((am, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-[10px] font-semibold border border-slate-100"
                        >
                          {am === 'Wifi de Alta Velocidad' && <Wifi className="h-3 w-3 mr-1 text-slate-400" />}
                          {am === 'Smart TV 4K' && <Tv className="h-3 w-3 mr-1 text-slate-400" />}
                          {am === 'Jacuzzi Privado' && <Sparkles className="h-3 w-3 mr-1 text-slate-400" />}
                          {am}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href={`/reserva?type=${type.id}`}
                    className="w-full py-2.5 bg-slate-900 group-hover:bg-indigo-600 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-1.5"
                  >
                    <span>Cotizar e Iniciar Reserva</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Boutique digital promo section */}
      <section className="bg-slate-900 text-white py-20 px-6 relative overflow-hidden">
        {/* Background visual graphics */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto text-center space-y-8 relative z-10">
          <div className="flex justify-center">
            <div className="h-14 w-14 bg-indigo-600/30 rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <ShoppingBag className="h-7 w-7" />
            </div>
          </div>
          <div className="space-y-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-indigo-400">
              Boutique & Frigobar Digital
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              ¿Hospedado ya? Haz tus pedidos en línea
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              No tienes que bajar a recepción ni hacer llamadas telefónicas. Nuestro catálogo interactivo ofrece tragos finos, snacks salados, bebidas heladas y amenities de aseo adicionales con entrega en menos de 15 minutos en tu suite.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto pt-4">
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30 flex flex-col items-center">
              <Coffee className="h-5 w-5 text-indigo-400 mb-1.5" />
              <span className="text-xs font-semibold">Cafetería & Desayunos</span>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30 flex flex-col items-center">
              <UtensilsCrossed className="h-5 w-5 text-indigo-400 mb-1.5" />
              <span className="text-xs font-semibold">Platos a la Carta</span>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30 flex flex-col items-center">
              <ShoppingBag className="h-5 w-5 text-indigo-400 mb-1.5" />
              <span className="text-xs font-semibold">Snacks & Golosinas</span>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-700/30 flex flex-col items-center">
              <Sparkles className="h-5 w-5 text-indigo-400 mb-1.5" />
              <span className="text-xs font-semibold">Kits de Cuidado</span>
            </div>
          </div>

          <div className="pt-4">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center px-6 py-3.5 text-xs font-extrabold text-slate-900 bg-white rounded-xl hover:bg-slate-100 transition shadow-md duration-300"
            >
              Visitar Tienda Boutique <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="flex justify-center text-indigo-600">
              <HelpCircle className="h-8 w-8" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Preguntas Frecuentes</h2>
            <p className="text-sm text-slate-500">¿Tienes dudas sobre el funcionamiento de HotelFlow? Aquí te respondemos.</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div 
                  key={index} 
                  className="border border-slate-100 rounded-2xl bg-slate-50/50 overflow-hidden transition"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full p-5 flex items-center justify-between text-left focus:outline-none"
                  >
                    <span className="text-sm font-bold text-slate-900">{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-slate-500 shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-50 bg-white">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Premium Footer */}
      <footer className="bg-slate-950 text-slate-400 py-16 px-6 border-t border-slate-900 mt-auto">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 bg-white rounded-xl flex items-center justify-center text-slate-950 font-extrabold text-base">
                H
              </div>
              <span className="font-extrabold text-lg tracking-tight text-white">HOTELFLOW</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              La plataforma inteligente para suites exclusivas y estadías flexibles por horas. Gestión digitalizada y confort premium.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Enlaces de Portal</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition">Inicio (Principal)</Link>
              </li>
              <li>
                <Link href="/reserva" className="hover:text-white transition">Reservar Habitación</Link>
              </li>
              <li>
                <Link href="/shop" className="hover:text-white transition">Tienda & Room Service</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Administración</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/reception" className="hover:text-white transition inline-flex items-center space-x-1">
                  <span>Acceso Recepción PMS</span>
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition">Dashboard de Métricas</Link>
              </li>
              <li>
                <Link href="/housekeeping" className="hover:text-white transition">Personal de Limpieza</Link>
              </li>
            </ul>
          </div>

          <div className="space-y-4 text-xs">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Contacto & Ubicación</h4>
            <ul className="space-y-2">
              <li className="flex items-start space-x-2">
                <MapPin className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                <span>Av. Principal 789, Distrito San Isidro, Lima - Perú</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>+51 1 456-7890</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-indigo-500 shrink-0" />
                <span>contacto@hotelflow.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-6xl mx-auto border-t border-slate-900 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-650">
          <p>© 2026 HotelFlow Inc. Todos los derechos reservados.</p>
          <div className="flex space-x-4 mt-4 sm:mt-0">
            <a href="#" className="hover:text-white transition">Términos de Servicio</a>
            <a href="#" className="hover:text-white transition">Privacidad</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
