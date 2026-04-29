"use client";

import { useState, useEffect, Suspense } from 'react';
import { 
  User, Calendar, Trash2, Star, ArrowLeft, ChevronDown, CheckCircle, Trophy, Medal, MapPin, Lock, Unlock, Activity, ShieldCheck, Zap, Radio, X, Navigation, Map, Radar, Users, MessageSquare, ShieldCheck as ShieldIcon, LocateFixed, Award
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://teakxifsmctudlpzuwkn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlYWt4aWZzbWN0dWRscHp1d2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3Mzc0NzUsImV4cCI6MjA4NDMxMzQ3NX0.NroN4nZW1cfxVT2apGoD6VyUpYJdJAjcSi6KJgF3mj8";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function ProfilIcerik() {
  const router = useRouter();
  const [canliDeneyimler, setCanliDeneyimler] = useState<any[]>([]);
  const [radarBinalar, setRadarBinalar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const verileriGetir = async () => {
      try {
        const { data: yorumlar } = await supabase.from('yorumlar').select('*').eq('kullanıcı_adi', 'Saltuk Buğra').order('created_at', { ascending: false });
        if (yorumlar) setCanliDeneyimler(yorumlar);
        const { data: takipler } = await supabase.from('takipler').select('*').eq('kullanıcı_adi', 'Saltuk Buğra').order('created_at', { ascending: false });
        if (takipler) setRadarBinalar(takipler);
      } catch (err) { console.error("Hata:", err); } finally { setLoading(false); }
    };
    verileriGetir();
  }, []);

  const radarSil = async (binaId: string) => {
    const { error } = await supabase.from('takipler').delete().eq('bina_id', binaId).eq('kullanıcı_adi', 'Saltuk Buğra');
    if (!error) setRadarBinalar(radarBinalar.filter(b => b.bina_id !== binaId));
  };

  const silYorum = async (id: string) => {
    if(!confirm("Bu deneyimi silmek istediğine emin misin?")) return;
    const { error } = await supabase.from('yorumlar').delete().eq('id', id);
    if (!error) setCanliDeneyimler(canliDeneyimler.filter(d => d.id !== id));
  };

  const mühürSayisi = canliDeneyimler.length;
  const statu = mühürSayisi >= 15 ? 'muhtar' : (mühürSayisi >= 5 ? 'bolge_sakini' : 'komsu');

  const getRütbeDetay = (r: string) => {
    switch (r) {
      case 'muhtar': return { label: 'MUHTAR', color: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-black/60', icon: <Trophy size={22} />, limit: 15 };
      case 'bolge_sakini': return { label: 'BÖLGE SAKİNİ', color: 'text-white', border: 'border-blue-500/30', bg: 'bg-blue-600/60', icon: <CheckCircle size={22} />, limit: 5 };
      default: return { label: 'KOMŞU', color: 'text-slate-400', border: 'border-slate-800/50', bg: 'bg-slate-900/60', icon: <Medal size={22} />, limit: 1 };
    }
  };

  const rütbe = getRütbeDetay(statu);
  const ilerlemeYuzde = Math.min((mühürSayisi / 15) * 100, 100);
  const gosterilecekDeneyimler = showAll ? canliDeneyimler : canliDeneyimler.slice(0, 3);

  const rozetler = [
    { id: 1, name: "Mahalle Ustası", tier: 2, icon: <Zap size={20} />, active: mühürSayisi >= 10 },
    { id: 2, name: "Güvenli Kaynak", tier: 2, icon: <ShieldCheck size={20} />, active: true },
    { id: 3, name: "Detaylı Anlatım", tier: 1, icon: <MessageSquare size={20} />, active: true },
    { id: 4, name: "Fatura Onaylı", tier: 3, icon: <ShieldIcon size={20} />, active: false },
    { id: 5, name: "Faydalı Yorum", tier: 1, icon: <Award size={20} />, active: true },
  ];

  return (
    <div className="flex min-h-screen bg-white relative overflow-hidden">
      
      {/* BACKGROUND EFFECTS */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-40 z-0"></div>
      <div className="fixed bottom-[-10%] right-[10%] w-[30%] h-[30%] bg-blue-50 rounded-full blur-[100px] opacity-50 z-0"></div>

      {/* SIDEBAR (APPLE GLASS) */}
      <aside className="w-80 h-screen bg-black/5 backdrop-blur-3xl text-black flex flex-col p-8 border-r border-black/5 fixed left-0 top-0 z-[250] hidden lg:flex">
        <div className="mb-12">
          <Link href="/" className="text-[22px] font-black italic tracking-tighter uppercase block text-black">BULEVİNİ</Link>
          <div className="h-1.5 w-10 bg-blue-600 mt-2 rounded-full shadow-lg shadow-blue-500/20"></div>
        </div>
        <nav className="flex-1 space-y-3 text-black font-black italic uppercase">
          <button onClick={() => router.push('/')} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 transition-all text-slate-400 hover:text-black group">
            <Map size={20} /> <span className="text-[12px] tracking-widest">BİNALARI KEŞFET</span>
          </button>
          <button onClick={() => router.push('/profil')} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/40 shadow-xl border border-white/20 backdrop-blur-md">
            <Radar size={20} className="text-blue-600" /> <span className="text-[12px] tracking-widest">RADARIMDAKİLER</span>
          </button>
          <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 transition-all text-slate-400 hover:text-black group">
            <Users size={20} /> <span className="text-[12px] tracking-widest">TOPLULUK</span>
          </button>
          <button onClick={() => router.push('/profil')} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 transition-all text-slate-400 hover:text-black group">
            <MessageSquare size={20} /> <span className="text-[12px] tracking-widest">YORUMLARIM</span>
          </button>
        </nav>
        <div className="mt-auto pt-8 border-t border-black/5">
          <div className="bg-white/40 p-5 rounded-[2rem] border border-white/40 shadow-sm backdrop-blur-xl">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black italic text-white shadow-lg">SB</div>
                <div className="flex flex-col">
                   <span className="text-[13px] font-black italic uppercase leading-none text-black">SALTUK BUĞRA</span>
                   <span className="text-[9px] font-black text-blue-600 mt-2 uppercase">MAHALLE USTASI</span>
                </div>
             </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 lg:ml-80 relative bg-white/30 backdrop-blur-sm pb-20 z-10">
        <header className="py-8 px-10 border-b border-black/5 sticky top-0 bg-white/40 backdrop-blur-2xl z-50 flex justify-between items-center text-black font-black uppercase italic">
          <div className="flex items-center gap-6">
            <Link href="/" className="p-3 bg-white/60 rounded-2xl shadow-sm border border-white hover:bg-blue-600 hover:text-white transition-all backdrop-blur-md text-black">
                <ArrowLeft size={20} />
            </Link>
            <h1 className="text-[24px] tracking-tighter border-l-[10px] border-blue-600 pl-5 text-black">KARAKTER PANELİ</h1>
          </div>
          <div className="bg-white/50 px-5 py-2.5 rounded-2xl border border-white/50 backdrop-blur-md shadow-sm flex items-center gap-3">
             <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
             <span className="text-[10px] tracking-widest text-slate-600">MUHTARLIK AKTİF</span>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-10 pt-12 space-y-10">
          
          {/* TOP DASHBOARD (TIKLANABİLİR RADAR KARTI DAHİL) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="bg-white/60 backdrop-blur-2xl p-8 rounded-[3rem] border border-white shadow-xl hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-6 text-black">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg">
                  <LocateFixed size={24} />
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-slate-400 uppercase italic">Hakimiyet</span>
                  <h4 className="text-[16px] font-black italic uppercase text-black mt-1">AFŞİN / K.MARAŞ</h4>
                </div>
              </div>
              <div className="h-2.5 bg-black/5 rounded-full overflow-hidden border border-white mb-3">
                <div className="h-full bg-blue-600 rounded-full w-[60%]" />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase italic">12 BİNA / 20 MÜHÜR</span>
            </section>

            <section className="bg-black text-white p-8 rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black italic uppercase text-amber-400 tracking-widest">MUHTAR PUANI</span>
                  <Trophy className="text-amber-400" size={20} />
                </div>
                <span className="text-[42px] font-black italic tracking-tighter leading-none block">1850</span>
                <div className="h-2 bg-white/10 rounded-full mt-4">
                  <div className="h-full bg-amber-400 rounded-full w-[80%]" />
                </div>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 blur-[50px] rounded-full" />
            </section>

            {/* RADAR ÖZET KARTI (TIKLANABİLİR) */}
            <button 
              onClick={() => document.getElementById('radar-detay-bolumu')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-white/60 backdrop-blur-2xl p-8 rounded-[3rem] border border-white shadow-xl flex flex-col justify-between group hover:border-blue-600 transition-all text-left"
            >
              <div className="flex justify-between items-center mb-4 text-black">
                <span className="text-[10px] font-black text-slate-400 uppercase italic">Radar Odası</span>
                <Radio size={20} className="text-blue-600 animate-pulse" />
              </div>
              <div>
                <span className="text-[42px] font-black italic tracking-tighter leading-none block text-black">{radarBinalar.length}</span>
                <span className="text-[10px] font-black text-blue-600 uppercase italic tracking-widest mt-2 block">TAKİPTEKİ BİNA</span>
              </div>
              <div className="text-[9px] font-black text-slate-400 uppercase italic mt-4 underline group-hover:text-blue-600 transition-colors">
                Detaylara Git
              </div>
            </button>
          </div>

          {/* ROZET ODASI */}
          <section className="bg-white/60 backdrop-blur-2xl p-12 rounded-[4rem] border border-white shadow-2xl text-black">
            <h3 className="text-[14px] font-black italic uppercase tracking-widest mb-12 border-l-6 border-blue-600 pl-5 text-black">KOLEKSİYONUM VE ROZETLERİM</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
               {rozetler.map((rozet) => (
                 <div key={rozet.id} className={`flex flex-col items-center gap-4 group transition-all ${rozet.active ? 'opacity-100' : 'opacity-20 grayscale'}`}>
                    <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center border-4 transition-all duration-500 ${rozet.active ? 'bg-white border-blue-600 text-blue-600 shadow-xl scale-110' : 'bg-black/5 border-black/5 text-slate-300'}`}>
                       {rozet.active ? rozet.icon : <Lock size={26} />}
                    </div>
                    <div className="text-center">
                       <span className="text-[11px] font-black italic uppercase tracking-tighter block text-black leading-tight">{rozet.name}</span>
                       <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">TIER {rozet.tier}</span>
                    </div>
                 </div>
               ))}
            </div>
          </section>

          {/* KARAKTER KARTI */}
          <section className={`p-12 rounded-[4rem] border shadow-2xl relative overflow-hidden transition-all duration-700 backdrop-blur-2xl ${statu === 'muhtar' ? 'bg-black/90 text-white border-amber-400/50' : 'bg-white text-black border-slate-200'}`}>
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <div className={`w-48 h-48 rounded-[3.5rem] flex items-center justify-center border-[8px] shadow-2xl rotate-2 transition-transform hover:rotate-0 duration-500 ${statu === 'muhtar' ? 'bg-amber-400 text-black border-white/10' : 'bg-black text-white border-white'}`}>
                <User size={80} />
              </div>
              <div className="flex-1 text-center md:text-left">
                <h2 className={`text-[48px] font-black uppercase italic tracking-tighter leading-none mb-6 ${statu === 'muhtar' ? 'text-amber-400' : 'text-black'}`}>SALTUK BUĞRA</h2>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className={`inline-flex items-center gap-3 px-8 py-3 rounded-2xl text-[12px] font-black italic uppercase tracking-widest border backdrop-blur-md ${rütbe.bg} ${rütbe.color} ${rütbe.border}`}>
                    {rütbe.icon} {rütbe.label}
                  </div>
                  <div className="bg-white/10 border border-white/10 px-8 py-3 rounded-2xl text-[12px] font-black italic uppercase tracking-widest flex items-center gap-3">
                     <Star size={18} className="text-amber-400" fill="currentColor" /> MUHTARLIK MÜHÜRÜ AKTİF
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* RADAR DETAY BÖLÜMÜ (YENİ EKLEME) */}
          <section id="radar-detay-bolumu" className="scroll-mt-32 space-y-10">
            <h3 className="text-[16px] font-black italic uppercase tracking-widest text-slate-400 flex items-center gap-4 px-4">
                <Radar size={22} className="text-blue-600" /> Radarımdaki Binalar
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {radarBinalar.length > 0 ? radarBinalar.map((bina) => (
                <div key={bina.bina_id} className="bg-white/60 backdrop-blur-2xl p-8 rounded-[3.5rem] border border-white shadow-xl group transition-all hover:border-blue-600 text-black">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-blue-50/50 rounded-2xl flex items-center justify-center text-blue-600 shadow-inner"><MapPin size={22} /></div>
                    <button onClick={() => radarSil(bina.bina_id)} className="p-3 bg-black/5 text-slate-300 rounded-xl hover:text-red-500 hover:bg-red-50 transition-all"><X size={18} /></button>
                  </div>
                  <h4 className="text-[18px] font-black uppercase italic tracking-tighter mb-2 group-hover:text-blue-600 transition-colors line-clamp-1">{bina.bina_adi}</h4>
                  <div className="flex items-center gap-2">
                     <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping" />
                     <span className="text-[9px] font-black text-slate-400 uppercase italic">Canlı İzleme Aktif</span>
                  </div>
                  <Link href={`/arama?query=${encodeURIComponent(bina.bina_adi)}`} className="mt-8 w-full py-4 bg-white/40 border border-white rounded-2xl flex items-center justify-center gap-2 text-[11px] font-black uppercase italic text-slate-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                    Binaya Git <ArrowLeft size={14} className="rotate-180" />
                  </Link>
                </div>
              )) : (
                <div className="col-span-full py-20 bg-black/5 border-2 border-dashed border-black/10 rounded-[4rem] text-center opacity-30">
                   <p className="text-black font-black italic uppercase text-[12px] tracking-widest">Takipte bina yok.</p>
                </div>
              )}
            </div>
          </section>

          {/* DENEYİM ARŞİVİ */}
          <section className="space-y-10 pb-20 text-black font-black italic uppercase">
            <h3 className="text-[16px] tracking-widest text-slate-400 flex items-center gap-4 px-4">
                <MessageSquare size={20} className="text-blue-600" /> Deneyim Arşivi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {gosterilecekDeneyimler.map((deneyim) => (
                <div key={deneyim.id} className="bg-white/60 backdrop-blur-2xl p-12 rounded-[4rem] border border-white shadow-xl hover:border-blue-600 transition-all group relative animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-start mb-8 text-black">
                    <div>
                      <h4 className="text-[24px] font-black uppercase italic tracking-tighter group-hover:text-blue-600 transition-colors text-black">{deneyim.bina_adi}</h4>
                      <p className="text-[11px] font-bold text-slate-400 uppercase italic">{new Date(deneyim.created_at).toLocaleDateString('tr-TR')}</p>
                    </div>
                    <button onClick={() => silYorum(deneyim.id)} className="p-4 bg-black/5 text-slate-300 rounded-2xl hover:text-red-500 transition-all"><Trash2 size={24} /></button>
                  </div>
                  <div className="bg-white/40 backdrop-blur-md p-8 rounded-[3rem] border-l-[10px] border-blue-600 mb-8 shadow-sm">
                    <p className="text-[17px] font-medium text-slate-700 italic leading-relaxed text-black italic">"{deneyim.yorum_metni}"</p>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] font-black text-blue-600 bg-blue-50/50 px-6 py-3 rounded-2xl border border-blue-100 uppercase">
                    <Star size={16} fill="currentColor" /> {deneyim.puan}/5 PUAN
                  </div>
                </div>
              ))}
            </div>

            {/* DAHA FAZLA GÖR BUTONU */}
            {!showAll && canliDeneyimler.length > 3 && (
              <button 
                onClick={() => setShowAll(true)}
                className="w-full py-12 bg-white/40 backdrop-blur-xl border-4 border-dashed border-slate-200 rounded-[4rem] text-slate-400 font-black italic uppercase text-[15px] tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-4 group"
              >
                TÜM ARŞİVİ AÇ ({canliDeneyimler.length - 3})
                <ChevronDown size={24} className="group-hover:translate-y-2 transition-transform" />
              </button>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

export default function ProfilSayfasi() {
  return <Suspense fallback={null}><ProfilIcerik /></Suspense>;
}