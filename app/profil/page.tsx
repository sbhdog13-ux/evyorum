"use client";

import { useState } from 'react';
import { 
  User, MapPin, BadgeCheck, ShieldCheck, 
  MessageSquare, Trash2, Edit3, 
  Eye, EyeOff, ArrowLeft, UploadCloud
} from 'lucide-react';
import Link from 'next/link';

export default function ProfilSayfasi() {
  const [isPublic, setIsPublic] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-20">
      
      {/* ÜST BİLGİ VE GİZLİLİK ANAHTARI */}
      <header className="py-8 px-6 border-b border-slate-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <h1 className="text-[24px] font-black uppercase italic tracking-tighter border-l-8 border-blue-600 pl-4">PROFİLİM</h1>
          </div>
          
          <div className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 shadow-sm">
            <div className="flex items-center gap-2">
              {isPublic ? <Eye size={16} className="text-green-500" /> : <EyeOff size={16} className="text-slate-300" />}
              <span className={`text-[10px] font-black uppercase italic tracking-widest ${isPublic ? 'text-green-500' : 'text-slate-400'}`}>
                {isPublic ? 'PROFİLİN HERKESE AÇIK' : 'PROFİLİN GİZLİ'}
              </span>
            </div>
            <button 
              onClick={() => setIsPublic(!isPublic)}
              className={`w-12 h-6 rounded-full relative transition-all duration-300 ${isPublic ? 'bg-green-500 shadow-lg shadow-green-100' : 'bg-slate-200'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all duration-300 shadow-sm ${isPublic ? 'left-7' : 'left-1'}`} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-12">
        
        {/* 1. KULLANICI KARTI: ROZETLER VE ÖZET */}
        <section className="flex flex-col md:flex-row gap-10 items-center md:items-start mb-16 bg-slate-50 p-10 rounded-[4rem] border border-slate-100 shadow-2xl shadow-slate-200/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 rounded-full -mr-20 -mt-20 blur-3xl" />
          
          <div className="relative z-10">
            <div className="w-32 h-32 bg-black rounded-[2.5rem] flex items-center justify-center text-white border-8 border-white shadow-2xl rotate-3">
              <User size={56} />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-blue-600 p-3 rounded-2xl text-white shadow-xl border-4 border-white animate-bounce">
              <BadgeCheck size={20} />
            </div>
          </div>

          <div className="flex-1 z-10 text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center gap-4 mb-4">
              <h2 className="text-[28px] font-black uppercase italic tracking-tighter text-black">SALTUK BUĞRA</h2>
              <span className="bg-blue-600 text-white px-4 py-1.5 rounded-xl text-[10px] font-black uppercase italic tracking-widest shadow-lg shadow-blue-200">
                FATURA ONAYLI SAKİN
              </span>
            </div>
            <p className="text-[14px] font-medium text-slate-500 italic mb-8 max-w-md">
              "Kiralayacağın evin sadece duvarlarını değil, gelecekteki huzurunu da gör." diyerek yola çıktı. 12 faydalı deneyim paylaştı.
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-3">
              <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 flex items-center gap-2 text-[11px] font-black uppercase italic shadow-sm">
                <ShieldCheck size={14} className="text-green-500" /> KVKK Korumalı
              </div>
              <div className="bg-white px-5 py-3 rounded-2xl border border-slate-100 flex items-center gap-2 text-[11px] font-black uppercase italic shadow-sm">
                <MessageSquare size={14} className="text-blue-600" /> Detaycı Yorumcu
              </div>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-10">
          
          {/* 2. ADRES VE FATURA DOĞRULAMA (SOL SÜTUN) */}
          <section className="md:col-span-1 space-y-8">
            <div>
              <h3 className="text-[14px] font-black italic uppercase tracking-widest mb-6 text-slate-400">AKTİF ADRES</h3>
              <div className="bg-black p-8 rounded-[3rem] text-white shadow-2xl shadow-blue-900/20 relative group transition-all hover:scale-[1.02]">
                <div className="flex items-start gap-4 mb-8">
                  <div className="p-3 bg-white/10 rounded-2xl text-blue-400">
                    <MapPin size={24} />
                  </div>
                  <p className="text-[16px] font-black uppercase italic leading-tight">
                    Beşiktaş Palas <br />
                    <span className="text-slate-500 text-[12px] font-bold">Daire 12, Kat 4</span>
                  </p>
                </div>
                <button className="w-full py-4 bg-blue-600 hover:bg-white hover:text-black text-white rounded-[1.5rem] text-[12px] font-black uppercase italic tracking-widest transition-all flex items-center justify-center gap-2 shadow-xl shadow-blue-600/20">
                  <UploadCloud size={18} /> FATURA GÜNCELLE
                </button>
              </div>
            </div>
          </section>

          {/* 3. YORUM GEÇMİŞİ (SAĞ SÜTUN) */}
          <section className="md:col-span-2 space-y-8">
            <h3 className="text-[14px] font-black italic uppercase tracking-widest mb-6 text-slate-400">YORUM GEÇMİŞİM (12)</h3>
            
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="group bg-slate-50 p-8 rounded-[3rem] border border-slate-100 hover:bg-white hover:border-blue-100 transition-all duration-300 shadow-sm hover:shadow-xl">
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h4 className="text-[14px] font-black uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors">Beşiktaş Palas, Türkali</h4>
                      <p className="text-[10px] font-bold text-slate-300 uppercase italic mt-1 tracking-widest">12 OCAK 2026</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-3 bg-white text-slate-400 rounded-2xl hover:text-blue-600 hover:shadow-lg transition-all border border-slate-100">
                        <Edit3 size={16} />
                      </button>
                      <button className="p-3 bg-white text-slate-400 rounded-2xl hover:text-red-500 hover:shadow-lg transition-all border border-slate-100">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[13px] font-medium text-slate-700 italic leading-relaxed mb-6">
                    "Binada internet altyapısı harika ama gürültü yalıtımı orta seviyede. Komşular genel olarak sakin ancak asansör sesi bazen içeriden duyulabiliyor."
                  </p>
                  <div className="flex gap-4">
                     <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg uppercase italic border border-blue-100">Gürültü: 3/5</span>
                     <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg uppercase italic border border-blue-100">İnternet: 5/5</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

      </main>
    </div>
  );
}