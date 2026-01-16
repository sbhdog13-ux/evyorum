"use client";

import Link from 'next/link';
import { Star, MapPin, ArrowLeft, Home, Wind, Shield, Users, MessageSquarePlus, Globe, Droplets, Volume2, Zap } from 'lucide-react';

export default function BuildingDetail() {
  const comments = Array(20).fill({
    user: "Sakin ",
    time: "2 Yıl Yaşadı",
    text: "Konum harika, ancak asansör hızı yetersiz kalabiliyor. Komşuluk ilişkileri çok nezih ve ev sahibi oldukça anlayışlı."
  });

  // Kategori Puanları
  const ratings = [
    { label: "İnternet Gücü", score: 4.5, icon: <Globe size={14} /> },
    { icon: <Droplets size={14} />, label: "Rutubet Durumu", score: 4.8 },
    { icon: <Volume2 size={14} />, label: "Gürültü Seviyesi", score: 3.2 },
    { icon: <Zap size={14} />, label: "Tesisat Gücü", score: 4.0 },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-black pb-24">
      <header className="p-4 border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/arama" className="flex items-center gap-2 text-slate-400 hover:text-black transition-all text-[12px] font-bold uppercase tracking-tight">
            <ArrowLeft size={14} /> Aramaya Dön
          </Link>
          <Link href="/yorum-yap" className="bg-blue-600 text-white px-4 py-2 rounded-full text-[12px] font-bold flex items-center gap-2 hover:bg-black transition-all">
            <MessageSquarePlus size={14} /> DENEYİMİNİ PAYLAŞ
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8">
        {/* BİNA KİMLİĞİ VE SABİT ÖZELLİKLER */}
        <div className="flex flex-col md:flex-row gap-8 mb-12 border-b border-slate-50 pb-8">
          <img 
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80" 
            className="w-full md:w-64 h-64 object-cover rounded-3xl border border-slate-100 shadow-sm"
          />
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h1 className="text-[15px] font-black uppercase tracking-tighter mb-2 italic">Beşiktaş Palas</h1>
              <p className="flex items-center gap-1 text-slate-400 font-bold mb-6 text-[12px] uppercase italic leading-none">
                <MapPin size={14} className="text-blue-600" /> Türkali Mah. Ihlamurdere Cad.
              </p>
            </div>
            
            {/* Binanın Sabit Özellikleri Artık Burada */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: <Home size={14} />, label: "YAŞ", val: "18 YIL" },
                { icon: <Wind size={14} />, label: "ISINMA", val: "KOMBİ" },
                { icon: <Shield size={14} />, label: "GÜVENLİK", val: "KAMERA" },
                { icon: <Users size={14} />, label: "ASANSÖR", val: "VAR" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <div className="text-blue-600">{item.icon}</div>
                  <div className="leading-none">
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1">{item.label}</span>
                    <span className="font-black text-[11px] italic uppercase tracking-tighter">{item.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* KATEGORİ PUANLARI (SAKİN DENEYİMLERİNDEN GELEN) */}
        <div className="mb-12">
          <h2 className="text-[15px] font-black italic uppercase tracking-tighter mb-6 border-l-4 border-blue-600 pl-3">
            Bina Karnesi
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {ratings.map((rate, i) => (
              <div key={i} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col items-center gap-2 text-center">
                <div className="bg-blue-50 p-2 rounded-xl text-blue-600">{rate.icon}</div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">{rate.label}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[12px] font-black italic">{rate.score}</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, starIdx) => (
                      <Star 
                        key={starIdx} 
                        size={8} 
                        fill={starIdx < Math.floor(rate.score) ? "#f97316" : "none"} 
                        className={starIdx < Math.floor(rate.score) ? "text-orange-500" : "text-slate-200"} 
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* YORUMLAR */}
        <div className="space-y-4">
          <h2 className="text-[15px] font-black italic uppercase tracking-tighter mb-6 border-l-4 border-blue-600 pl-3">
            Sakin Deneyimleri
          </h2>
          
          <div className="grid md:grid-cols-2 gap-4">
            {comments.map((comment, i) => (
              <div key={i} className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center text-[10px] font-black text-blue-600">S</div>
                    <div>
                      <h4 className="text-[11px] font-black uppercase italic tracking-tighter leading-none">{comment.user} {i + 1}</h4>
                      <p className="text-[9px] font-bold text-slate-300 uppercase italic mt-1 leading-none">{comment.time}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-orange-50 px-2 py-1 rounded-lg">
                    <Star size={10} fill="#f97316" className="text-orange-500" />
                    <span className="text-orange-600 font-black text-[11px]">5.0</span>
                  </div>
                </div>
                <div className="bg-slate-50/50 p-4 rounded-2xl text-[12px] font-medium text-slate-700 italic leading-relaxed border-l-2 border-blue-100">
                  {comment.text}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
