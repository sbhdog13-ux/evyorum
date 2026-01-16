"use client";

import { useState } from 'react';
import Link from 'next/link';
import { 
  User, MapPin, BadgeCheck, ShieldCheck, 
  Settings, MessageSquare, Trash2, Edit3, 
  Eye, EyeOff, FileText, ArrowLeft 
} from 'lucide-react';

export default function ProfilSayfasi() {
  // Gizlilik Durumu State'i (Default: Kapalı/Gizli)
  const [isPublic, setIsPublic] = useState(false);

  return (
    <div className="min-h-screen bg-white text-black font-sans pb-20">
      {/* Üst Menü */}
      <header className="p-4 border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-black transition-all text-[12px] font-bold uppercase italic">
            <ArrowLeft size={14} /> Anasayfa
          </Link>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2">
                {isPublic ? <Eye size={14} className="text-green-500" /> : <EyeOff size={14} className="text-slate-300" />}
                <span className={`text-[10px] font-black uppercase tracking-tighter ${isPublic ? 'text-green-500' : 'text-slate-300'}`}>
                  {isPublic ? 'Profilin Herkese Açık' : 'Profilin Gizli'}
                </span>
             </div>
             <button 
                onClick={() => setIsPublic(!isPublic)}
                className={`w-10 h-5 rounded-full relative transition-colors ${isPublic ? 'bg-green-500' : 'bg-slate-200'}`}
             >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isPublic ? 'left-6' : 'left-1'}`} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-10">
        
        {/* 1. ÖZET KART: KİMLİK VE ROZETLER */}
        <section className="flex flex-col md:flex-row gap-8 items-start mb-12 bg-slate-50 p-8 rounded-[3rem] border border-slate-100">
          <div className="relative">
            <div className="w-24 h-24 bg-slate-200 rounded-[2rem] flex items-center justify-center border-4 border-white shadow-xl">
              <User size={40} className="text-slate-400" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-blue-600 p-2 rounded-xl text-white shadow-lg border-2 border-white">
              <BadgeCheck size={16} />
            </div>
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-[15px] font-black uppercase italic tracking-tighter">Saltuk Buğra</h1>
              <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase italic border border-blue-100">
                Fatura Onaylı Sakin
              </span>
            </div>
            <p className="text-[12px] font-medium text-slate-500 italic mb-6">
              Platforma Ocak 2026'da katıldı. Toplam 12 faydalı yorumu var.
            </p>
            
            <div className="flex flex-wrap gap-2">
              <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-2 text-[10px] font-bold italic">
                <ShieldCheck size={12} className="text-green-500" /> KVKK Korumalı Profil
              </div>
              <div className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 flex items-center gap-2 text-[10px] font-bold italic">
                <MessageSquare size={12} className="text-blue-500" /> Detaycı Yorumcu
              </div>
            </div>
          </div>
        </section>

        <div className="grid md:grid-cols-3 gap-8">
          
          {/* 2. ADRES BİLGİSİ (SADECE KENDİSİNE ÖZEL) */}
          <section className="md:col-span-1 space-y-6">
            <div>
              <h2 className="text-[15px] font-black italic uppercase tracking-tighter mb-4 border-l-4 border-blue-600 pl-3">
                Aktif Adres
              </h2>
              <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-2 bg-blue-100/30">
                   <ShieldCheck size={14} className="text-blue-600 opacity-20" />
                </div>
                <div className="flex items-start gap-2 mb-4">
                  <MapPin size={16} className="text-blue-600 mt-1" />
                  <p className="text-[12px] font-bold italic uppercase leading-tight">
                    Beşiktaş Palas <br />
                    <span className="text-slate-400 font-medium">Kat 4, Daire 12</span>
                  </p>
                </div>
                <button className="w-full py-2 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase italic hover:bg-black hover:text-white transition-all">
                  Fatura Güncelle
                </button>
              </div>
            </div>
          </section>

          {/* 3. YORUM GEÇMİŞİ VE YÖNETİMİ */}
          <section className="md:col-span-2 space-y-6">
            <h2 className="text-[15px] font-black italic uppercase tracking-tighter mb-4 border-l-4 border-blue-600 pl-3">
              Yorum Geçmişim
            </h2>
            
            <div className="space-y-4">
              {[1, 2].map((i) => (
                <div key={i} className="group bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h4 className="text-[12px] font-black uppercase italic tracking-tight">Beşiktaş Palas</h4>
                      <p className="text-[10px] font-bold text-slate-300 uppercase italic">12 Ocak 2026</p>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 transition-colors">
                        <Edit3 size={14} />
                      </button>
                      <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <p className="text-[12px] font-medium text-slate-700 italic leading-relaxed mb-4">
                    "Binada internet altyapısı fiber ama gürültü yalıtımı orta seviyede. Gece geç saatlerde yan dairedeki sesler duyulabiliyor."
                  </p>
                  <div className="flex gap-4">
                     <div className="text-[10px] font-black text-blue-600 uppercase italic">Gürültü: 3/5</div>
                     <div className="text-[10px] font-black text-blue-600 uppercase italic">İnternet: 5/5</div>
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
