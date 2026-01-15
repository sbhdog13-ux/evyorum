"use client";
import React from 'react';
import { Star, MapPin, ArrowLeft, MessageSquare, ThumbsUp, Home } from 'lucide-react';
import Link from 'next/link';

export default function BuildingDetails() {
  const building = {
    name: "Huzur Apartmanı",
    address: "Kadıköy, Caferağa No:12",
    images: ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=800&q=80"],
    reviews: [
      { id: 1, user: "Ahmet Yılmaz", date: "12.01.2026", comment: "Bina girişi çok bakımlı ancak asansör biraz dar. Isınma konusunda hiçbir sorun yaşamadık.", ratings: { Isınma: 5, Gürültü: 4, Aidat: 3 }, photos: ["https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=400&q=60"] }
    ]
  };

  return (
    <div className="min-h-screen bg-white text-black text-left font-sans">
      <header className="p-6 border-b sticky top-0 bg-white z-50 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Home className="text-blue-600" size={24} />
          <span className="text-xl font-black text-black">EVYORUM</span>
        </Link>
        <Link href="/yorum-yap" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-black flex items-center gap-2 hover:bg-blue-700 transition-all">
          <MessageSquare size={18}/> Deneyim Paylaş
        </Link>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        <div className="h-96 w-full relative rounded-[3rem] overflow-hidden mb-12 shadow-2xl">
          <img src={building.images[0]} className="w-full h-full object-cover" alt="Bina" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
          <div className="absolute bottom-10 left-10">
            <h1 className="text-5xl font-black text-white tracking-tighter mb-2">{building.name}</h1>
            <p className="flex items-center gap-2 text-white/90 font-bold"><MapPin size={20}/> {building.address}</p>
          </div>
        </div>

        <h3 className="text-3xl font-black mb-8 italic">Bina Sakinlerinin Sesine Kulak Ver</h3>
        <div className="space-y-8">
          {building.reviews.map(rev => (
            <div key={rev.id} className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-slate-100">
              <div className="flex justify-between items-center mb-6">
                <span className="font-black text-blue-600 bg-white px-4 py-2 rounded-full border border-blue-100">{rev.user[0]}. {rev.user.split(' ')[1][0]}.</span>
                <span className="font-black text-slate-400 text-xs tracking-widest uppercase">{rev.date}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-6">
                {Object.entries(rev.ratings).map(([kat, puan]: any) => (
                  <div key={kat} className="bg-white p-4 rounded-2xl border-2 border-slate-100">
                    <span className="block text-[10px] font-black text-black uppercase mb-1">{kat}</span>
                    <span className="text-xl font-black text-blue-600">{puan} <Star className="inline" size={14} fill="currentColor"/></span>
                  </div>
                ))}
              </div>

              <p className="text-black font-bold text-lg italic leading-relaxed mb-6">"{rev.comment}"</p>
              
              {rev.photos && (
                <div className="flex gap-4">
                  {rev.photos.map((p, i) => (
                    <img key={i} src={p} className="w-32 h-32 rounded-3xl object-cover border-4 border-white shadow-lg" alt="Review" />
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}