'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  ShoppingBag,
  Search,
  Sparkles,
  Coffee,
  Wine,
  Utensils,
  PlusCircle
} from 'lucide-react';
import Header from '@/components/Header';

// Helper to map product names/categories to high-quality Unsplash images for rich visual design
const getProductImage = (name: string, category: string) => {
  const n = name.toLowerCase();
  if (n.includes('papas') || n.includes('chips') || n.includes('piqueo')) return 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&w=400&q=80';
  if (n.includes('chocolate') || n.includes('barra')) return 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&w=400&q=80';
  if (n.includes('maní') || n.includes('mani') || n.includes('frutos') || n.includes('nueces')) return 'https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&w=400&q=80';
  if (n.includes('coca') || n.includes('gaseosa') || n.includes('soda') || n.includes('cola')) return 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=400&q=80';
  if (n.includes('agua') || n.includes('mineral')) return 'https://images.unsplash.com/photo-1608885898957-a599fb1b1a44?auto=format&fit=crop&w=400&q=80';
  if (n.includes('cerveza') || n.includes('pilsen') || n.includes('beer')) return 'https://images.unsplash.com/photo-1608270586620-248524c67de9?auto=format&fit=crop&w=400&q=80';
  if (n.includes('vino') || n.includes('tinto') || n.includes('champagne') || n.includes('wine')) return 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=400&q=80';
  if (n.includes('club') || n.includes('sandwich') || n.includes('sándwich')) return 'https://images.unsplash.com/photo-1567234669003-dce7a7a88821?auto=format&fit=crop&w=400&q=80';
  if (n.includes('hamburguesa') || n.includes('burger')) return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80';
  if (n.includes('lomo') || n.includes('carne') || n.includes('plato') || n.includes('tallarines')) return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=400&q=80';
  if (n.includes('desayuno') || n.includes('café') || n.includes('cafe')) return 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?auto=format&fit=crop&w=400&q=80';
  if (n.includes('dental') || n.includes('dientes') || n.includes('cepillo')) return 'https://images.unsplash.com/photo-1559599101-f09722fb4948?auto=format&fit=crop&w=400&q=80';
  if (n.includes('toalla') || n.includes('felpa')) return 'https://images.unsplash.com/photo-1563453392212-326f5e854473?auto=format&fit=crop&w=400&q=80';
  if (n.includes('almohada') || n.includes('sábana') || n.includes('manta')) return 'https://images.unsplash.com/photo-1631679706909-1844bbd07221?auto=format&fit=crop&w=400&q=80';
  if (n.includes('cargador') || n.includes('cable') || n.includes('adaptador') || n.includes('enchufe')) return 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=400&q=80';
  
  // Category fallbacks
  if (category === 'drinks') return 'https://images.unsplash.com/photo-1497534446932-c925b458314e?auto=format&fit=crop&w=400&q=80';
  if (category === 'meals') return 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=400&q=80';
  if (category === 'snacks') return 'https://images.unsplash.com/photo-1599490659213-e2b9527b0876?auto=format&fit=crop&w=400&q=80';
  if (category === 'amenities') return 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=400&q=80';
  return 'https://images.unsplash.com/photo-1520116468816-90b61400c3fa?auto=format&fit=crop&w=400&q=80';
};

export default function ShopPage() {
  const { products } = useApp();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Category mapping
  const categories = [
    { id: 'all', name: 'Todos', icon: Coffee },
    { id: 'snacks', name: 'Snacks', icon: Coffee },
    { id: 'drinks', name: 'Bebidas', icon: Wine },
    { id: 'meals', name: 'Gastronomía', icon: Utensils },
    { id: 'amenities', name: 'Amenities', icon: Sparkles },
    { id: 'other', name: 'Otros', icon: PlusCircle },
  ];

  // Filter products
  const filteredProducts = products.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || prod.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      <Header />

      {/* Hero Header */}
      <section className="bg-white pt-10 pb-12 px-6 border-b border-slate-100 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-16 -mr-16 w-80 h-80 bg-indigo-50 rounded-full blur-3xl opacity-40 pointer-events-none" />
        <div className="max-w-6xl mx-auto text-center space-y-3 relative z-10">
          <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            <ShoppingBag className="h-3.5 w-3.5 mr-1.5 text-indigo-500" /> Catálogo Boutique & Room Service
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight tracking-tight text-slate-900">
            Menú de Habitación & Boutique
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
            Explora de manera visual nuestra selección exclusiva de gastronomía local, licores premium, snacks seleccionados y kits de cuidado personal.
          </p>
        </div>
      </section>

      {/* Main Shop View */}
      <section className="max-w-6xl mx-auto px-6 py-10 w-full flex-1">
        
        <div className="space-y-6">
          {/* Search and Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar producto o plato..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-slate-700 font-semibold"
              />
            </div>
            
            {/* Category tabs */}
            <div className="flex gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center space-x-1.5 ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <cat.icon className="h-3.5 w-3.5" />
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Catalog Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => {
              const isOutOfStock = prod.stock <= 0;
              const imageUrl = getProductImage(prod.name, prod.category);
              
              return (
                <div
                  key={prod.id}
                  className="bg-white border border-slate-100 rounded-3xl p-4 flex flex-col justify-between hover:shadow-xl hover:border-slate-200 transition-all duration-300 group"
                >
                  <div>
                    {/* Visual Product Image Container */}
                    <div className="w-full h-36 rounded-2xl overflow-hidden bg-slate-50 mb-4 relative border border-slate-100">
                      <img
                        src={imageUrl}
                        alt={prod.name}
                        className="object-cover w-full h-full transform group-hover:scale-103 transition duration-500"
                      />
                      
                      {/* Floating tags */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-950/85 backdrop-blur-md text-white">
                          {prod.category}
                        </span>
                      </div>
                      
                      <div className="absolute top-2.5 right-2.5">
                        {isOutOfStock ? (
                          <span className="text-[9px] font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full">
                            Agotado
                          </span>
                        ) : (
                          <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
                            Disponible
                          </span>
                        )}
                      </div>
                    </div>

                    <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-indigo-600 transition leading-snug">
                      {prod.name}
                    </h3>
                    <p className="text-[11px] text-slate-450 mt-1 leading-relaxed">
                      Consulta la disponibilidad o solicita el servicio directamente a recepción.
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50">
                    <span className="font-extrabold text-sm sm:text-base text-slate-950">S/ {prod.price.toFixed(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-16 bg-white border border-slate-100 rounded-3xl">
              <ShoppingBag className="h-10 w-10 text-slate-300 mx-auto mb-2" />
              <h3 className="font-bold text-slate-800 text-sm">No se encontraron productos</h3>
              <p className="text-xs text-slate-400">Intenta buscando con otro término o categoría.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
