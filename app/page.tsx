"use client";

import { useState } from 'react';
import { Search, MapPin, Star, ShieldCheck } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { BINALAR } from "./data/binalar";

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const router = useRouter();

  const suggestions = ["BEŞİKTAŞ", "KADIKÖY", "ŞİŞLİ", "SARIYER", "BEYOĞLU", "ÜSKÜDAR"];
  const filtered = suggestions.filter(s => s.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSearch = (city?: string) => {
    const query = city || searchTerm;
    if (query.trim()) {
      router.push(`/arama?q=${query.toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      
      {/* HERO SECTION */}
      <section className="pt-24 pb-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-[56px] md:text-[80px] font-black leading-[0.9] tracking-tighter uppercase mb-6 text-black">
            EVİ TUTMADAN ÖNCE <br />
            <span className="text-blue-600 italic">GERÇEKLERİ</span> ÖĞREN.
          </h1>
          <p className="text-[15px] font-bold text-slate-400 italic mb-12 uppercase tracking-tight text-center">
            "Kiralayacağın evin sadece duvarlarını değil, gelecekteki huzurunu da gör."
          </p>

          {/* ARAMA MOTORU */}
          <div className="relative max-w-2xl mx-auto z-50">
            <div className="relative flex items-center">
              <div className="absolute left-6 text-slate-400"><Search size={24} /></div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSuggestions(e.target.value.length > 0);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="BİR İLÇE YAZIN (ÖRN: BEŞİKTAŞ)..."
                className="w-full h-24 bg-slate-50 border-2 border-slate-100 rounded-[2.5rem] pl-16 pr-32 text-[15px] font-black italic focus:outline-none focus:border-blue-600 shadow-2xl shadow-slate-200/50"
              />
              <button 
                onClick={() => handleSearch()}
                className="absolute right-4 px-10 h-16 bg-black text-white rounded-[1.8rem] text-[15px] font-black uppercase italic tracking-widest hover:bg-blue-600 transition-all z-20"
              >
                ARA
              </button>
            </div>

            {/* AKILLI ÖNERİLER */}
            {showSuggestions && filtered.length > 0 && (
              <div className="absolute top-[105%] left-0 right-0 bg-white border-2 border-slate-100 rounded-[2.5rem] shadow-2xl overflow-hidden z-[100]">
                {filtered.map((s, i) => (
                  <button 
                    key={i} 
                    onClick={() => {
                      setSearchTerm(s);
                      setShowSuggestions(false);
                      handleSearch(s);
                    }} 
                    className="w-full px-8 py-5 text-left flex items-center gap-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 font-black uppercase italic text-black text-[15px]"
                  >
                    <MapPin size={20} className="text-blue-600" /> {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* SON SAKİN YORUMLARI */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="flex items-center gap-3 mb-10 border-l-4 border-blue-600 pl-4 text-left">
          <h2 className="text-[15px] font-black uppercase italic tracking-tighter text-black">SON SAKİN YORUMLARI</h2>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 text-left">
          {[
            { s: "BEŞİKTAŞ, TÜRKALİ", p: "4.5", t: "Fatura Onaylı" },
            { s: "KADIKÖY, MODA", p: "3.0", t: "Eski Sakin" },
            { s: "ŞİŞLİ, KURTULUŞ", p: "4.8", t: "Fatura Onaylı" }
          ].map((item, i) => (
            <Link key={i} href="/bina/1" className="group bg-slate-50 p-8 rounded-[3rem] border border-slate-100 hover:bg-white hover:border-blue-200 transition-all duration-500 shadow-sm">
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-[15px] font-black uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors">{item.s}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <ShieldCheck size={12} className="text-blue-600" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase italic tracking-widest">{item.t}</span>
                    </div>
                  </div>
                  <div className="bg-white px-3 py-1 rounded-xl flex items-center gap-1 border border-slate-100 text-blue-600 font-black italic text-[12px]">
                    <Star size={12} fill="currentColor" /> {item.p}
                  </div>
               </div>
               <p className="text-[12px] font-medium text-slate-600 italic leading-relaxed">
                 "Binanın durumu gayet iyi, sakin ve huzurlu bir ortam var. Komşuluk ilişkileri oldukça seviyeli."
               </p>
            </Link>
          ))}
        </div>
      </section>

      {/* FOOTER: BULEVİNİ */}
      <footer className="py-20 border-t border-slate-50 text-center">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">© 2026 BULEVİNİ — Şeffaf Bina Kültürü</p>
      </footer>
    </div>
  );
}