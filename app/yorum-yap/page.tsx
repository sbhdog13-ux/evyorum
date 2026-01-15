"use client";
import React, { useState } from 'react';
import { Star, Home, Send, Camera, PlusCircle } from 'lucide-react';
import Link from 'next/link';

export default function ReviewPage() {
  const [categories, setCategories] = useState(["Isınma", "Aidat", "Komşular", "Ulaşım"]);
  const [puanlar, setPuanlar] = useState<any>({});
  const [newCat, setNewCat] = useState("");

  const addCategory = () => {
    if (newCat.trim() !== "") {
      setCategories([...categories, newCat]);
      setNewCat("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-6 text-black font-sans">
      <div className="max-w-2xl mx-auto bg-white rounded-[3rem] shadow-2xl p-10 border-2 border-black">
        <Link href="/" className="flex items-center gap-2 mb-10 group">
          <Home className="text-blue-600" />
          <span className="text-xl font-black text-black">EVYORUM</span>
        </Link>
        
        <h1 className="text-4xl font-black mb-8 tracking-tighter italic">Deneyimini <span className="text-blue-600 underline">Ölümsüzleştir</span></h1>
        
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {categories.map(kat => (
              <div key={kat} className="p-4 bg-slate-50 rounded-2xl border-2 border-slate-200">
                <p className="font-black text-black mb-2 uppercase text-xs">{kat}</p>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <Star key={s} size={22} className="cursor-pointer" 
                      fill={puanlar[kat] >= s ? "#2563eb" : "none"} 
                      stroke={puanlar[kat] >= s ? "#2563eb" : "black"}
                      onClick={() => setPuanlar({...puanlar, [kat]: s})}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-2">
            <input 
              type="text" 
              value={newCat} 
              onChange={(e) => setNewCat(e.target.value)}
              placeholder="Yeni kategori ekle (Örn: Deprem Dayanıklılığı)" 
              className="flex-1 p-4 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 outline-none focus:border-blue-600 font-bold"
            />
            <button onClick={addCategory} className="bg-black text-white p-4 rounded-2xl"><PlusCircle /></button>
          </div>

          <textarea rows={4} className="w-full p-6 bg-slate-50 rounded-3xl border-2 border-black font-bold outline-none" placeholder="Binanın gizli kalmış detaylarını anlat..."></textarea>
          
          <div className="border-4 border-dashed border-slate-200 p-10 rounded-3xl text-center hover:bg-blue-50 transition-all cursor-pointer group">
             <Camera className="mx-auto text-slate-300 group-hover:text-blue-600 mb-2" size={40} />
             <span className="font-black text-slate-400 group-hover:text-blue-600 tracking-widest uppercase text-xs">Fotoğrafları Buraya Sürükle</span>
          </div>

          <button className="w-full bg-blue-600 text-white p-6 rounded-3xl font-black text-xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-4">
            <Send /> DENEYİMİ PAYLAŞ
          </button>
        </div>
      </div>
    </div>
  );
}