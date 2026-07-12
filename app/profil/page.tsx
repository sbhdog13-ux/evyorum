"use client";

import { useState, useEffect, Suspense } from 'react';
import { 
  User, Trash2, Star, ArrowLeft, ChevronDown, CheckCircle, Trophy, Medal, MapPin, Lock, Activity, ShieldCheck, Zap, Radio, X, Map, Radar, Users, MessageSquare, ShieldCheck as ShieldIcon, LocateFixed, Award
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/app/lib/firebase';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/app/contexts/AuthContext';
import Sidebar from '@/app/components/Sidebar';
import ProfilKimlik from '@/app/components/ProfilKimlik';
import { useLang } from '@/app/lib/i18n';

function ProfilIcerik() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLang();
  const [canliDeneyimler, setCanliDeneyimler] = useState<any[]>([]);
  const [radarBinalar, setRadarBinalar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    if (!user) { router.push('/giris'); return; }
    const verileriGetir = async () => {
      try {
        const yorumQ = query(collection(db, 'yorumlar'), where('kullanici_id', '==', user.uid), orderBy('created_at', 'desc'));
        const yorumSnap = await getDocs(yorumQ);
        setCanliDeneyimler(yorumSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const radarQ = query(collection(db, 'takipler'), where('kullanici_id', '==', user.uid), orderBy('created_at', 'desc'));
        const radarSnap = await getDocs(radarQ);
        setRadarBinalar(radarSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error("Hata:", err); } 
      finally { setLoading(false); }
    };
    verileriGetir();
  }, [user]);

  const radarSil = async (id: string) => {
    await deleteDoc(doc(db, 'takipler', id));
    setRadarBinalar(radarBinalar.filter(b => b.id !== id));
  };

  const silYorum = async (id: string) => {
    if (!confirm("Bu deneyimi silmek istediğine emin misin?")) return;
    await deleteDoc(doc(db, 'yorumlar', id));
    setCanliDeneyimler(canliDeneyimler.filter(d => d.id !== id));
  };

  const muhurSayisi = canliDeneyimler.length;
  const statu = muhurSayisi >= 15 ? 'muhtar' : muhurSayisi >= 5 ? 'bolge_sakini' : 'komsu';

  const getRutbeDetay = (r: string) => {
    switch (r) {
      case 'muhtar': return { label: t('profil.muhtar'), color: 'text-amber-400', border: 'border-amber-400/30', bg: 'bg-[#023E56]/60', icon: <Trophy size={22} /> };
      case 'bolge_sakini': return { label: t('profil.bolgeSakini'), color: 'text-white', border: 'border-blue-500/30', bg: 'bg-blue-600/60', icon: <CheckCircle size={22} /> };
      default: return { label: t('profil.komsu'), color: 'text-slate-400', border: 'border-slate-800/50', bg: 'bg-slate-900/60', icon: <Medal size={22} /> };
    }
  };

  const rutbe = getRutbeDetay(statu);
  const gosterilecekDeneyimler = showAll ? canliDeneyimler : canliDeneyimler.slice(0, 3);
  const [adSoyad, setAdSoyad] = useState('');
  const displayName = adSoyad || user?.displayName || user?.email?.split('@')[0] || 'Kullanıcı';
  const initials = displayName[0]?.toUpperCase() || 'U';

  const rozetler = [
    { id: 1, name: "Mahalle Ustası", tier: 2, icon: <Zap size={20} />, active: muhurSayisi >= 10 },
    { id: 2, name: "Güvenli Kaynak", tier: 2, icon: <ShieldCheck size={20} />, active: true },
    { id: 3, name: "Detaylı Anlatım", tier: 1, icon: <MessageSquare size={20} />, active: true },
    { id: 4, name: "Fatura Onaylı", tier: 3, icon: <ShieldIcon size={20} />, active: false },
    { id: 5, name: "Faydalı Yorum", tier: 1, icon: <Activity size={20} />, active: true },
  ];

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black italic uppercase text-slate-200">Yükleniyor...</div>;

  return (
    <div className="flex min-h-screen bg-white relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-40 z-0"></div>
      <div className="fixed bottom-[-10%] right-[10%] w-[30%] h-[30%] bg-[#e8f3fa] rounded-full blur-[100px] opacity-50 z-0"></div>

      <Sidebar />

      <main className="flex-1 lg:ml-80 relative bg-white/30 backdrop-blur-sm pb-20 z-10">
        <header className="py-5 px-4 md:py-8 md:px-10 border-b border-black/5 sticky top-0 bg-white/40 backdrop-blur-2xl z-50 flex justify-between items-center text-black font-black uppercase italic">
          <div className="flex items-center gap-6">
            <Link href="/" className="p-3 bg-white/60 rounded-2xl shadow-sm border border-white hover:bg-blue-600 hover:text-white transition-all backdrop-blur-md text-black">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-[16px] md:text-[24px] tracking-tighter border-l-[6px] md:border-l-[10px] border-blue-600 pl-5 text-black">{t('profil.panel')}</h1>
          </div>
          <div className="bg-white/50 px-5 py-2.5 rounded-2xl border border-white/50 backdrop-blur-md shadow-sm flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] tracking-widest text-slate-600">{rutbe.label} {t('profil.aktif')}</span>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 md:px-10 pt-8 md:pt-12 pb-24 space-y-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <section className="bg-white/60 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white shadow-xl hover:-translate-y-1 transition-all">
              <div className="flex justify-between items-start mb-6 text-black">
                <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg"><LocateFixed size={24} /></div>
                <div className="text-right">
                  <span className="text-[9px] font-black text-slate-400 uppercase italic">{t('profil.toplamMuhur')}</span>
                  <h4 className="text-[32px] font-black italic text-black mt-1">{muhurSayisi}</h4>
                </div>
              </div>
              <div className="h-2.5 bg-[#023E56]/5 rounded-full overflow-hidden border border-white mb-3">
                <div className="h-full bg-blue-600 rounded-full" style={{ width: `${Math.min((muhurSayisi / 15) * 100, 100)}%` }} />
              </div>
              <span className="text-[10px] font-black text-slate-400 uppercase italic">{muhurSayisi} / 15 {t('profil.muhtarMuhru')}</span>
            </section>

            <section className="bg-[#023E56] text-white p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white/10 shadow-2xl relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] font-black italic uppercase text-amber-400 tracking-widest">{t('profil.puan')}</span>
                  <Trophy className="text-amber-400" size={20} />
                </div>
                <span className="text-[42px] font-black italic tracking-tighter leading-none block">{muhurSayisi * 100}</span>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 blur-[50px] rounded-full" />
            </section>

            <button onClick={() => document.getElementById('radar-detay-bolumu')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white/60 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border border-white shadow-xl flex flex-col justify-between group hover:border-blue-600 transition-all text-left">
              <div className="flex justify-between items-center mb-4 text-black">
                <span className="text-[10px] font-black text-slate-400 uppercase italic">{t('profil.radarOdasi')}</span>
                <Radio size={20} className="text-blue-600 animate-pulse" />
              </div>
              <div>
                <span className="text-[42px] font-black italic tracking-tighter leading-none block text-black">{radarBinalar.length}</span>
                <span className="text-[10px] font-black text-blue-600 uppercase italic tracking-widest mt-2 block">{t('profil.takipteki')}</span>
              </div>
              <div className="text-[9px] font-black text-slate-400 uppercase italic mt-4 underline group-hover:text-blue-600 transition-colors">{t('profil.detaylara')}</div>
            </button>
          </div>

          <section className="bg-white/60 backdrop-blur-2xl p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] border border-white shadow-2xl text-black">
            <h3 className="text-[14px] font-black italic uppercase tracking-widest mb-12 border-l-4 border-blue-600 pl-5 text-black">{t('profil.rozetler')}</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-4 md:gap-10">
              {rozetler.map((rozet) => (
                <div key={rozet.id} className={`flex flex-col items-center gap-4 transition-all ${rozet.active ? 'opacity-100' : 'opacity-20 grayscale'}`}>
                  <div className={`w-24 h-24 rounded-[2.5rem] flex items-center justify-center border-4 transition-all duration-500 ${rozet.active ? 'bg-white border-blue-600 text-blue-600 shadow-xl scale-110' : 'bg-[#023E56]/5 border-black/5 text-slate-300'}`}>
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

          <section className={`p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] border shadow-2xl relative overflow-hidden transition-all duration-700 backdrop-blur-2xl ${statu === 'muhtar' ? 'bg-[#023E56]/90 text-white border-amber-400/50' : 'bg-white text-black border-slate-200'}`}>
            <div className="flex flex-col md:flex-row gap-12 items-center">
              <ProfilKimlik displayName={displayName} onIsimGuncellendi={setAdSoyad} />
              <div className={`inline-flex items-center gap-3 px-8 py-3 rounded-2xl text-[12px] font-black italic uppercase border ${rutbe.bg} ${rutbe.color} ${rutbe.border}`}>
                {rutbe.icon} {rutbe.label}
              </div>
            </div>
          </section>

          <section id="radar-detay-bolumu" className="scroll-mt-32 space-y-10">
            <h3 className="text-[16px] font-black italic uppercase tracking-widest text-slate-400 flex items-center gap-4 px-4">
              <Radar size={22} className="text-blue-600" /> {t('profil.radarBinalar')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {radarBinalar.length > 0 ? radarBinalar.map((bina) => (
                <div key={bina.id} className="bg-white/60 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] border border-white shadow-xl group hover:border-blue-600 text-black transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-[#dcecf7]/50 rounded-2xl flex items-center justify-center text-blue-600"><MapPin size={22} /></div>
                    <button onClick={() => radarSil(bina.id)} className="p-3 bg-[#023E56]/5 text-slate-300 rounded-xl hover:text-red-500 hover:bg-red-50 transition-all"><X size={18} /></button>
                  </div>
                  <h4 className="text-[18px] font-black uppercase italic tracking-tighter mb-2 group-hover:text-blue-600 line-clamp-1">{bina.bina_adi}</h4>
                  <Link href={`/arama?query=${encodeURIComponent(bina.bina_adi)}`} className="mt-8 w-full py-4 bg-white/40 border border-white rounded-2xl flex items-center justify-center gap-2 text-[11px] font-black uppercase italic text-slate-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                    {t('profil.binayaGit')}
                  </Link>
                </div>
              )) : (
                <div className="col-span-full py-20 bg-[#023E56]/5 border-2 border-dashed border-black/10 rounded-[4rem] text-center opacity-30">
                  <p className="text-black font-black italic uppercase text-[12px] tracking-widest">{t('profil.takipYok')}</p>
                </div>
              )}
            </div>
          </section>

          <section className="space-y-10 pb-20 text-black font-black italic uppercase">
            <h3 className="text-[16px] tracking-widest text-slate-400 flex items-center gap-4 px-4">
              <MessageSquare size={20} className="text-blue-600" /> {t('profil.arsiv')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {gosterilecekDeneyimler.map((deneyim) => (
                <div key={deneyim.id} className="bg-white/60 backdrop-blur-2xl p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] border border-white shadow-xl hover:border-blue-600 transition-all group relative">
                  <div className="flex justify-between items-start mb-8 text-black">
                    <div>
                      <h4 className="text-[24px] font-black uppercase italic tracking-tighter group-hover:text-blue-600 text-black">{deneyim.bina_adi}</h4>
                      <p className="text-[11px] font-bold text-slate-400 uppercase italic">{deneyim.created_at?.toDate?.()?.toLocaleDateString('tr-TR') || ''}</p>
                    </div>
                    <button onClick={() => silYorum(deneyim.id)} className="p-4 bg-[#023E56]/5 text-slate-300 rounded-2xl hover:text-red-500 transition-all"><Trash2 size={24} /></button>
                  </div>
                  <div className="bg-white/40 backdrop-blur-md p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-l-[10px] border-blue-600 mb-8 shadow-sm">
                    <p className="text-[17px] font-medium text-slate-700 italic leading-relaxed">"{deneyim.yorum_metni}"</p>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] font-black text-blue-600 bg-[#dcecf7]/50 px-6 py-3 rounded-2xl border border-[#A1CDE9] uppercase">
                    <Star size={16} fill="currentColor" /> {deneyim.puan}/5 {t('profil.puanBirim')}
                  </div>
                </div>
              ))}
            </div>
            {!showAll && canliDeneyimler.length > 3 && (
              <button onClick={() => setShowAll(true)} className="w-full py-12 bg-white/40 backdrop-blur-xl border-4 border-dashed border-slate-200 rounded-[4rem] text-slate-400 font-black italic uppercase text-[15px] tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-4 group">
                {t('profil.tumArsiv')} ({canliDeneyimler.length - 3})
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