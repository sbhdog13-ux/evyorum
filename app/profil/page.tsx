"use client";

import { useState, useEffect, Suspense } from 'react';
import { 
  User, Calendar, Trash2, Star, ArrowLeft, ChevronDown, CheckCircle, Trophy, Medal, MapPin, Lock, Unlock, Activity, ShieldCheck, Zap, Radio, X, Navigation
} from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://teakxifsmctudlpzuwkn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlYWt4aWZzbWN0dWRscHp1d2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3Mzc0NzUsImV4cCI6MjA4NDMxMzQ3NX0.NroN4nZW1cfxVT2apGoD6VyUpYJdJAjcSi6KJgF3mj8";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function ProfilIcerik() {
  const [canliDeneyimler, setCanliDeneyimler] = useState<any[]>([]);
  const [radarBinalar, setRadarBinalar] = useState<any[]>([]); // RADAR STATE
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const verileriGetir = async () => {
      try {
        // Yorumları Getir
        const { data: yorumlar } = await supabase
          .from('yorumlar')
          .select('*')
          .eq('kullanıcı_adi', 'Saltuk Buğra')
          .order('created_at', { ascending: false });

        if (yorumlar) setCanliDeneyimler(yorumlar);

        // Radar Binalarını Getir
        const { data: takipler } = await supabase
          .from('takipler')
          .select('*')
          .eq('kullanıcı_adi', 'Saltuk Buğra')
          .order('created_at', { ascending: false });
        
        if (takipler) setRadarBinalar(takipler);

        // Profil Getir
        const { data: profil } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', 'Saltuk Buğra')
          .single();

        if (profil) setUserProfile(profil);
      } catch (err) {
        console.error("Hata:", err);
      } finally {
        setLoading(false);
      }
    };
    verileriGetir();
  }, []);

  // Radar Kaydı Silme Fonksiyonu
  const radarSil = async (binaId: string) => {
    const { error } = await supabase
      .from('takipler')
      .delete()
      .eq('bina_id', binaId)
      .eq('kullanıcı_adi', 'Saltuk Buğra');
    
    if (!error) {
      setRadarBinalar(radarBinalar.filter(b => b.bina_id !== binaId));
    }
  };

  const mühürSayisi = canliDeneyimler.length;
  const statu = mühürSayisi >= 15 ? 'muhtar' : (mühürSayisi >= 5 ? 'bolge_sakini' : 'komsu');

  const getRütbeDetay = (r: string) => {
    switch (r) {
      case 'muhtar': return { label: 'MUHTAR', color: 'text-[#fbbf24]', border: 'border-[#fbbf24]/30', bg: 'bg-black', icon: <Trophy size={22} />, limit: 15 };
      case 'bolge_sakini': return { label: 'BÖLGE SAKİNİ', color: 'text-white', border: 'border-blue-500/30', bg: 'bg-blue-600', icon: <CheckCircle size={22} />, limit: 5 };
      default: return { label: 'KOMŞU', color: 'text-slate-500', border: 'border-slate-200', bg: 'bg-slate-100', icon: <Medal size={22} />, limit: 1 };
    }
  };

  const rütbe = getRütbeDetay(statu);
  const ilerlemeYuzde = Math.min((mühürSayisi / 15) * 100, 100);
  const gosterilecekDeneyimler = showAll ? canliDeneyimler : canliDeneyimler.slice(0, 3);

  const silYorum = async (id: string) => {
    if(!confirm("Bu deneyimi silmek istediğine emin misin?")) return;
    const { error } = await supabase.from('yorumlar').delete().eq('id', id);
    if (!error) setCanliDeneyimler(canliDeneyimler.filter(d => d.id !== id));
  };

  return (
    <div className="min-h-screen bg-[#f1f5f9] text-black font-sans pb-20 text-left selection:bg-blue-100">
      <header className="py-8 px-6 border-b border-white/40 sticky top-0 bg-white/60 backdrop-blur-xl z-50 shadow-sm">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="group p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-blue-600 hover:text-white transition-all">
                <ArrowLeft size={20} />
            </Link>
            <h1 className="text-[22px] md:text-[28px] font-black uppercase italic tracking-tighter border-l-[12px] border-blue-600 pl-5 leading-none">KARAKTER PANELİ</h1>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 pt-12 relative z-10">
        
        {/* LİYAKAT GELİŞİM HATTI */}
        <div className="bg-white/80 backdrop-blur-md p-12 rounded-[3.5rem] border border-white shadow-2xl shadow-slate-200/50 mb-12">
            <h3 className="text-[13px] font-black italic uppercase text-slate-400 mb-12 tracking-widest border-l-4 border-blue-600 pl-4">Liyakat Gelişim Hattı</h3>
            <div className="relative flex justify-between items-center max-w-4xl mx-auto">
                <div className="absolute h-2 bg-slate-100 left-12 right-12 top-8 z-0 rounded-full"></div>
                <div className="absolute h-2 bg-blue-600 left-12 top-8 z-0 transition-all duration-1000 shadow-[0_0_20px_rgba(37,99,235,0.5)] rounded-full" style={{ width: `calc(${ilerlemeYuzde}% - 60px)` }}></div>
                
                {['komsu', 'bolge_sakini', 'muhtar'].map((rKey) => {
                    const info = getRütbeDetay(rKey);
                    const isPassed = mühürSayisi >= info.limit;
                    return (
                        <div key={rKey} className="relative z-10 flex flex-col items-center gap-4 group">
                            <div className={`w-18 h-18 md:w-20 md:h-20 rounded-[2rem] flex items-center justify-center border-4 transition-all duration-700 ${isPassed ? 'bg-white border-blue-600 text-blue-600 shadow-[0_20px_40px_rgba(0,0,0,0.1)] scale-110' : 'bg-slate-50 border-slate-200 text-slate-200'}`}>
                                {isPassed ? info.icon : <Lock size={22} />}
                            </div>
                            <div className="text-center">
                                <span className={`text-[10px] font-black italic uppercase tracking-tighter block mb-1 ${isPassed ? 'text-black' : 'text-slate-300'}`}>{info.label}</span>
                                <span className="text-[9px] font-bold text-slate-400 uppercase bg-slate-100 px-3 py-1 rounded-full">{info.limit} MÜHÜR</span>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>

        {/* DASHBOARD GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-16">
          <section className={`lg:col-span-7 flex flex-col md:flex-row gap-10 items-center md:items-start p-12 rounded-[4.5rem] border shadow-[0_40px_80px_rgba(0,0,0,0.15)] relative overflow-hidden transition-all duration-700 ${statu === 'muhtar' ? 'bg-black border-[#fbbf24]/50' : 'bg-white border-slate-100'}`}>
            <div className={`w-40 h-40 rounded-[3.5rem] flex items-center justify-center border-[10px] shadow-2xl rotate-3 transition-all duration-700 ${statu === 'muhtar' ? 'bg-[#fbbf24] text-black border-white/10' : 'bg-black text-white border-white'}`}>
              <User size={80} />
            </div>
            <div className="flex-1 text-center md:text-left relative z-10">
              <div className="flex flex-col md:flex-row items-center md:items-end gap-4 mb-6">
                  <h2 className={`text-[40px] md:text-[52px] font-black uppercase italic tracking-tighter leading-none ${statu === 'muhtar' ? 'text-[#fbbf24]' : 'text-black'}`}>SALTUK BUĞRA</h2>
                  {(mühürSayisi >= 5) && <CheckCircle size={36} className="text-blue-600 fill-white drop-shadow-lg" />}
              </div>
              <div className={`inline-flex items-center gap-3 px-8 py-3 rounded-2xl text-[13px] font-black italic uppercase tracking-[0.2em] border mb-8 shadow-xl ${rütbe.bg} ${rütbe.color} ${statu === 'muhtar' ? 'border-[#fbbf24] shadow-yellow-900/40' : 'border-slate-200 shadow-slate-200/50'}`}>
                  {rütbe.icon} {rütbe.label}
              </div>
              <p className={`text-[16px] font-medium italic leading-relaxed opacity-80 ${statu === 'muhtar' ? 'text-slate-300' : 'text-slate-500'}`}>
                  Bulevini hiyerarşisinde otoriten mühürlendi. Şehrin hakikati senin mühürlerinle şekilleniyor.
              </p>
            </div>
          </section>

          <div className="lg:col-span-5 grid grid-cols-2 gap-8">
            <div className="bg-white/90 backdrop-blur-md p-10 rounded-[3.5rem] border border-white shadow-xl flex flex-col justify-between group hover:-translate-y-2 transition-all">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner"><Activity size={24} /></div>
                <div>
                    <span className="block text-[42px] font-black italic leading-none mb-2 tracking-tighter">{mühürSayisi}</span>
                    <span className="text-[12px] font-black text-slate-400 uppercase italic tracking-widest">Canlı Mühür</span>
                </div>
            </div>
            <div className="bg-white/90 backdrop-blur-md p-10 rounded-[3.5rem] border border-white shadow-xl flex flex-col justify-between group hover:-translate-y-2 transition-all">
                <div className="w-12 h-12 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center shadow-inner"><ShieldCheck size={24} /></div>
                <div>
                    <span className="block text-[42px] font-black italic leading-none mb-2 tracking-tighter">4.9</span>
                    <span className="text-[12px] font-black text-slate-400 uppercase italic tracking-widest">TrustScore</span>
                </div>
            </div>
            <div className="col-span-2 bg-gradient-to-br from-black to-slate-800 p-10 rounded-[3.5rem] text-white relative overflow-hidden flex items-center justify-between border border-white/10 shadow-2xl">
                <div className="relative z-10">
                    <span className="text-[11px] font-black text-blue-400 uppercase italic mb-3 block tracking-[0.2em] opacity-80">Aktif Operasyon</span>
                    <span className="text-[24px] md:text-[28px] font-black uppercase italic tracking-tighter leading-tight">{canliDeneyimler[0]?.bina_adi || "Bina Seçilmedi"}</span>
                </div>
                <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center backdrop-blur-md"><MapPin size={40} className="text-white/40" /></div>
            </div>
          </div>
        </div>

        {/* RADAR ODASI - YENİ BÖLÜM */}
        <section className="mb-20">
          <div className="flex justify-between items-center px-4 mb-10">
            <h3 className="text-[18px] font-black italic uppercase tracking-widest text-slate-500 flex items-center gap-4">
                <Radio size={22} className="text-blue-600 animate-pulse" /> Radar Odası
            </h3>
            <span className="text-[11px] bg-blue-600 text-white px-6 py-2 rounded-full font-black italic shadow-lg shadow-blue-200 uppercase tracking-widest">Radarımdaki Binalar</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {radarBinalar.length > 0 ? radarBinalar.map((bina) => (
              <div key={bina.bina_id} className="bg-white p-8 rounded-[3.5rem] border border-slate-100 shadow-xl relative group transition-all hover:border-blue-600">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <Navigation size={22} />
                  </div>
                  <button onClick={() => radarSil(bina.bina_id)} className="p-3 bg-slate-50 text-slate-300 rounded-xl hover:text-red-500 hover:bg-red-50 transition-all">
                    <X size={18} />
                  </button>
                </div>
                <h4 className="text-[18px] font-black uppercase italic tracking-tighter leading-tight mb-2 group-hover:text-blue-600 transition-colors">{bina.bina_adi}</h4>
                <div className="flex items-center gap-2">
                   <div className="w-2 h-2 rounded-full bg-blue-600 animate-ping"></div>
                   <span className="text-[9px] font-black text-slate-400 uppercase italic tracking-widest">Canlı İstihbarat Aktif</span>
                </div>
                <Link href={`/arama?query=${encodeURIComponent(bina.bina_adi)}`} className="mt-6 w-full py-4 bg-slate-50 rounded-2xl flex items-center justify-center gap-2 text-[10px] font-black uppercase italic text-slate-500 hover:bg-blue-600 hover:text-white transition-all">
                  Binaya Git <ArrowLeft size={14} className="rotate-180" />
                </Link>
              </div>
            )) : (
              <div className="col-span-3 py-20 bg-slate-100/50 border-4 border-dashed border-slate-200 rounded-[4rem] text-center">
                 <p className="text-slate-300 font-black italic uppercase text-[12px] tracking-widest">Henüz hiçbir binayı radarına almadın Muhtar.</p>
              </div>
            )}
          </div>
        </section>

        {/* DENEYİMLER ARŞİVİ */}
        <section className="space-y-12 pb-32">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-[18px] font-black italic uppercase tracking-widest text-slate-500 flex items-center gap-4">
                <Zap size={20} className="text-blue-600" /> Deneyim Arşivi
            </h3>
            <span className="text-[12px] bg-white border border-slate-100 px-8 py-3 rounded-full font-black italic shadow-lg text-blue-600">{canliDeneyimler.length} Toplam</span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {loading ? (
              <div className="col-span-2 py-32 text-center font-black italic text-slate-300 uppercase tracking-[0.3em] animate-pulse">Veriler Mühürleniyor...</div>
            ) : gosterilecekDeneyimler.map((deneyim) => (
              <div key={deneyim.id} className="group bg-white/80 backdrop-blur-sm p-12 rounded-[4.5rem] border border-white hover:border-blue-600 transition-all shadow-xl hover:shadow-[0_40px_80px_rgba(37,99,235,0.15)] text-left relative overflow-hidden">
                <div className="flex justify-between items-start mb-10">
                  <div className="text-left">
                    <h4 className="text-[24px] font-black uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors leading-none mb-4">{deneyim.bina_adi}</h4>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                      <p className="text-[12px] font-bold text-slate-400 uppercase italic tracking-widest">
                        {new Date(deneyim.created_at).toLocaleDateString('tr-TR')}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => silYorum(deneyim.id)} className="p-5 bg-slate-50 text-slate-300 rounded-[2rem] hover:text-red-500 hover:bg-red-50 transition-all shadow-inner"><Trash2 size={24} /></button>
                </div>
                
                <div className="bg-white p-10 rounded-[3rem] border-l-[12px] border-blue-600 mb-10 shadow-sm">
                  <p className="text-[17px] font-medium text-slate-700 italic leading-relaxed">"{deneyim.yorum_metni}"</p>
                </div>

                <div className="flex flex-wrap gap-4">
                   <div className="flex items-center gap-3 text-[11px] font-black text-blue-600 bg-blue-50 px-6 py-3 rounded-2xl uppercase italic border border-blue-100 shadow-sm">
                      <Star size={14} fill="currentColor" /> {deneyim.puan}/5 GENEL
                   </div>
                   {deneyim.puanlar && Object.entries(typeof deneyim.puanlar === 'string' ? JSON.parse(deneyim.puanlar) : deneyim.puanlar).map(([k, v]: any) => (
                     <div key={k} className="text-[10px] font-black text-slate-400 bg-white px-6 py-3 rounded-2xl uppercase italic border border-slate-100 shadow-sm">
                       {k}: {v}
                     </div>
                   ))}
                </div>
              </div>
            ))}

            {!showAll && canliDeneyimler.length > 3 && (
              <button 
                onClick={() => setShowAll(true)}
                className="col-span-1 md:col-span-2 py-16 bg-white/50 border-4 border-dashed border-slate-200 rounded-[5rem] text-slate-400 font-black italic uppercase text-[16px] tracking-[0.2em] hover:bg-white hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-4 group shadow-sm"
              >
                TÜM ARŞİVİ GÖR ({canliDeneyimler.length - 3})
                <ChevronDown size={28} className="group-hover:translate-y-3 transition-transform" />
              </button>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default function ProfilSayfasi() {
  return <Suspense fallback={<div className="min-h-screen flex items-center justify-center font-black italic text-slate-400 uppercase tracking-widest">Panel Hazırlanıyor...</div>}><ProfilIcerik /></Suspense>;
}