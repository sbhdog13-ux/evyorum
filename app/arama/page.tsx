"use client";
import React, { useState } from 'react';
import { Search, MapPin, Star, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const results = [
    { id: "1", name: "Huzur Apartmanı", address: "Kadıköy, Caferağa No:12", rating: 4.2 },
    { id: "2", name: "Yıldız Sitesi", address: "Kadıköy, Moda No:45", rating: 3.8 }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="bg-white border-b sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/"><ArrowLeft className="text-slate-400 hover:text-blue-600" size={24} /></Link>
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Bina veya sokak ara..." className="w-full bg-slate-100 p-3 pl-12 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto p-6">
        <h1 className="text-xl font-bold mb-6">Arama Sonuçları</h1>
        <div className="space-y-4">
          {results.map((bina) => (
            <div key={bina.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center">
              <div className="text-left">
                <h2 className="text-xl font-black">{bina.name}</h2>
                <p className="text-slate-500 text-sm flex items-center gap-1"><MapPin size={14}/> {bina.address}</p>
                <div className="flex items-center gap-1 mt-2 text-orange-400 font-bold"><Star size={16} fill="currentColor"/> {bina.rating}</div>
              </div>
              <Link href={`/bina/${bina.id}`}>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-700 transition-all">İncele</button>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}