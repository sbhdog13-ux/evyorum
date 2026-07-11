"use client";
import { trUpper } from '@/app/lib/utils';

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Star, ShieldCheck, Loader2, AlertCircle, Radio, MessageSquarePlus, Map, Radar, Users, MessageSquare, ShieldCheck as ShieldIcon, LogOut } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { db } from '@/app/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { useAuth } from '@/app/contexts/AuthContext';
import LeafletHarita from '@/app/components/LeafletHarita';
import { useLang } from '@/app/lib/i18n';
import Sidebar from '@/app/components/Sidebar';
import { signOut } from 'firebase/auth';
import { auth } from '@/app/lib/firebase';

export default function Home() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSelection, setPendingSelection] = useState({ name: "", city: "" });
  const [radarBinalar, setRadarBinalar] = useState<any[]>([]);
  const [gercekYorumlar, setGercekYorumlar] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  const [tumBinalar, setTumBinalar] = useState<string[]>([]);
  const [stats, setStats] = useState({ muhur: 0, bina: 0, ilce: 0 });
  const router = useRouter();
  const { t } = useLang();

  useEffect(() => {
    const veriGetir = async () => {
      const yorumlarRef = collection(db, 'yorumlar');
      const q = query(yorumlarRef, orderBy('created_at', 'desc'), limit(15));
      const snap = await getDocs(q);
      setGercekYorumlar(snap.docs.map(d => ({ id: d.id, ...d.data() })).filter((y: any) => !(y.yorum_metni === 'BİNA MÜHÜRLENDİ.' && (!y.puanlar || Object.keys(y.puanlar).length === 0))));

      // Tüm benzersiz bina adları — arama önerileri için (mobil ile aynı)
      const tumSnap = await getDocs(collection(db, 'yorumlar'));
      const unique = Array.from(new Set(
        tumSnap.docs.map(d => trUpper(((d.data().yeni_bina_adi || d.data().bina_adi) || '').toString()).trim())
      )).filter(Boolean) as string[];
      setTumBinalar(unique);
      const ilceler = new Set(tumSnap.docs.map(d => (d.data() as any).ilce).filter(Boolean));
      setStats({ muhur: tumSnap.size, bina: unique.length, ilce: ilceler.size });

      if (user) {
        const radarRef = collection(db, 'takipler');
        const radarQ = query(radarRef, where('kullanici_id', '==', user.uid));
        const radarSnap = await getDocs(radarQ);
        setRadarBinalar(radarSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    };
    veriGetir();
  }, [user]);

  const karuselRef = useRef<HTMLDivElement>(null);
  const [elleKaydirdi, setElleKaydirdi] = useState(0);
  const scrollTimer = useRef<any>(null);

  // Elle kaydırma bitince aktif kartı bul ve timer'ı sıfırla (mobil ile aynı davranış)
  const karuselScroll = () => {
    clearTimeout(scrollTimer.current);
    scrollTimer.current = setTimeout(() => {
      const el = karuselRef.current;
      if (!el || !el.children.length) return;
      const kartW = (el.children[0] as HTMLElement).offsetWidth + 16;
      const idx = Math.min(Math.round(el.scrollLeft / kartW), el.children.length - 1);
      setCurrentIndex(idx);
      setElleKaydirdi(v => v + 1);
    }, 150);
  };

  // Otomatik kayan karusel — mobil ile aynı his (3.5 sn)
  useEffect(() => {
    if (gercekYorumlar.length < 2) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => {
        const sonraki = (prev + 1) % gercekYorumlar.length;
        const el = karuselRef.current;
        if (el) {
          const kart = el.children[sonraki] as HTMLElement;
          if (kart) el.scrollTo({ left: kart.offsetLeft - 16, behavior: 'smooth' });
        }
        return sonraki;
      });
    }, 3500);
    return () => clearInterval(interval);
  }, [gercekYorumlar.length, elleKaydirdi]);

  // Nominatim adres önerileri (mobil ile aynı sistem — Google Places yerine)
  useEffect(() => {
    if (searchTerm.length < 3) { setSuggestions([]); return; }
    const delay = setTimeout(async () => {
      setIsSearching(true);
      try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchTerm + ' İstanbul')}&viewbox=27.9,41.65,29.95,40.55&bounded=1&format=json&limit=4&accept-language=tr`;
        const res = await fetch(url);
        const json = await res.json();
        setSuggestions(json || []);
      } catch { setSuggestions([]); }
      finally { setIsSearching(false); }
    }, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const eslesenBinalar = searchTerm.length >= 2
    ? tumBinalar.filter(b => b.includes(trUpper(searchTerm))).slice(0, 4)
    : [];

  const handleSelection = async (mainText: string, secondaryText: string) => {
    setIsSearching(true);
    const yorumlarRef = collection(db, 'yorumlar');
    const q = query(yorumlarRef, where('yeni_bina_adi', '==', trUpper(mainText)));
    const snap = await getDocs(q);
    if (!snap.empty) {
      router.push(`/bina?isim=${encodeURIComponent(trUpper(mainText))}`);
    } else {
      setPendingSelection({ name: trUpper(mainText), city: secondaryText });
      setShowConfirmModal(true);
    }
    setIsSearching(false);
    setShowSuggestions(false);
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/giris');
  };

  return (
    <div className="flex min-h-screen bg-white relative overflow-hidden">
      <div className="fixed top-[-5%] left-[15%] w-[45%] h-[45%] bg-blue-100/50 rounded-full blur-[140px] z-0 pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[5%] w-[35%] h-[35%] bg-[#e8f3fa] rounded-full blur-[110px] z-0 pointer-events-none"></div>

      {/* SIDEBAR */}
      <Sidebar />

      {/* ANA İÇERİK */}
      <main className="flex-1 lg:ml-80 min-w-0 relative bg-transparent z-10 pb-32">
        <header className="fixed top-0 left-0 lg:left-80 right-0 z-[200] bg-white/40 backdrop-blur-2xl px-8 py-4 border-b border-black/5 flex justify-between items-center shadow-sm">
          <Link href="/" className="flex flex-col items-start lg:hidden text-black">
            <img src="/logo.png" alt="Bulevini" className="h-10" />
          </Link>
          <div className="hidden lg:block"></div>
          <div className="flex items-center gap-4">
            <Link href="/profil" className={`p-3 rounded-2xl transition-all border-2 border-white bg-white/60 backdrop-blur-md shadow-sm ${radarBinalar.length > 0 ? 'text-blue-600 border-[#A1CDE9] animate-pulse' : 'text-slate-300'}`}>
              <Radio size={20} />
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/profil" className="flex items-center gap-3 bg-[#023E56] text-white px-5 py-3 rounded-2xl shadow-xl hover:scale-105 transition-all">
                  <span className="font-black italic text-[12px] uppercase tracking-tighter">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </Link>
                <button onClick={handleLogout} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link href="/giris" className="flex items-center gap-3 bg-[#023E56] text-white px-5 py-3 rounded-2xl shadow-xl hover:scale-105 transition-all">
                <span className="font-black italic text-[12px] uppercase tracking-tighter">GİRİŞ YAP</span>
              </Link>
            )}
            <Link href="/yorum-yap" className="hidden md:flex bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black italic text-[11px] uppercase items-center gap-2 shadow-xl shadow-blue-200 hover:bg-[#023E56] transition-all">
              <MessageSquarePlus size={16} /> DENEYİMİNİ PAYLAŞ
            </Link>
          </div>
        </header>

        {/* MOTTO + BLUR HARİTA (mobil ile aynı düzen) */}
        <section className="pt-28 lg:pt-44 pb-8 px-5 relative z-[100]">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-[30px] md:text-[56px] font-black leading-[1.05] md:leading-[0.9] tracking-tighter uppercase mb-8 text-black text-left">
              {t('acilis.motto1')} <br />
              <span className="text-blue-600 italic underline">{t('acilis.motto2')}</span> {t('acilis.motto3')}
            </h1>
            <div className="relative h-64 rounded-[2.5rem] overflow-hidden mb-4 shadow-xl">
              <div className="absolute inset-0 pointer-events-none"><LeafletHarita binalar={[]} /></div>
              <div className="absolute inset-0 bg-slate-900/45 backdrop-blur-[3px] flex flex-col items-center justify-center gap-3 text-white">
                <Map size={30} className="opacity-70" />
                <div className="font-black uppercase italic text-[17px]">{t('kesfet.haritaBaslik')}</div>
                <div className="text-[12px] font-medium opacity-70">{t('kesfet.haritaAlt')}</div>
                <button onClick={() => router.push('/harita')} className="mt-2 bg-blue-600 px-8 py-3.5 rounded-2xl font-black uppercase italic text-[13px] tracking-wide hover:bg-white hover:text-blue-600 transition-all shadow-xl">{t('kesfet.haritayiAc')}</button>
              </div>
            </div>
            <div className="flex bg-[#023E56] rounded-2xl overflow-hidden mb-3">
              {[[stats.muhur, t('kesfet.muhur')], [stats.bina, t('kesfet.bina')], [stats.ilce || '—', t('kesfet.ilce')]].map(([sayi, etiket], i) => (
                <div key={etiket as string} className={`flex-1 text-center py-3 ${i > 0 ? 'border-l border-white/10' : ''}`}>
                  <div className="text-white font-black italic text-[16px] leading-none">{sayi}</div>
                  <div className="text-[10px] text-[#A1CDE9] font-bold mt-1">{etiket}</div>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Link href="/arama" className="flex-1 flex items-center justify-center gap-2 bg-[#e8f3fa] border border-[#A1CDE9] rounded-2xl py-3 text-[11px] font-black uppercase italic text-blue-600 hover:border-blue-600 transition-all">{t('kesfet.sonEklenen')}</Link>
              <Link href="/skor?mod=binalar" className="flex-1 flex items-center justify-center gap-2 bg-[#e8f3fa] border border-[#A1CDE9] rounded-2xl py-3 text-[11px] font-black uppercase italic text-blue-600 hover:border-blue-600 transition-all">{t('kesfet.enYuksek')}</Link>
            </div>
                      </div>
        </section>

        {/* FEED */}
        <section className="max-w-7xl mx-auto px-5 md:px-10 pt-10 md:pt-20 pb-20 relative z-[10]">
          <div className="flex justify-between items-end mb-12 border-l-4 border-blue-600 pl-6">
            <div>
              <h2 className="text-[16px] font-black uppercase italic tracking-tighter text-black">{t('kesfet.feedBaslik')}</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase italic mt-1 tracking-widest">{t('kesfet.feedAlt')}</p>
            </div>
            <div className="flex items-center gap-3 bg-white/50 px-4 py-2 rounded-2xl border border-white text-black font-black">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping"></div>
              <span className="text-[11px] font-black text-blue-600 uppercase italic tracking-widest">{t('kesfet.canli')}</span>
            </div>
          </div>
          <div ref={karuselRef} onScroll={karuselScroll} className="flex gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory pb-4" style={{ scrollbarWidth: 'none' }}>
            {gercekYorumlar.length > 0 ? (
              gercekYorumlar.map((yorum, i) => (
                <Link key={i} href={`/bina?isim=${encodeURIComponent(yorum.yeni_bina_adi || yorum.bina_adi)}`} className="group snap-start shrink-0 w-[85%] sm:w-[380px] bg-white/60 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] border border-white hover:border-blue-600 transition-all shadow-xl">
                  <div className="flex justify-between items-start mb-5 text-black">
                    <div className="flex-1 pr-4">
                      <h3 className="text-[15px] font-black uppercase italic tracking-tighter group-hover:text-blue-600 leading-none mb-2 line-clamp-1">{yorum.yeni_bina_adi || yorum.bina_adi}</h3>
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={13} className="text-blue-600" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase italic">{yorum.kullanici_adi || 'Anonim'}</span>
                      </div>
                    </div>
                    <div className="bg-white/80 px-3 py-1 rounded-2xl flex items-center gap-1.5 border border-white text-blue-600 font-black italic text-[12px]">
                      <Star size={13} fill="currentColor" /> {yorum.puan || '5.0'}
                    </div>
                  </div>
                  <p className="text-[13px] font-medium text-slate-700 italic leading-relaxed line-clamp-3">"{yorum.yorum_metni}"</p>
                </Link>
              ))
            ) : (
              <div className="w-full py-20 text-center opacity-30 font-black italic uppercase tracking-[0.5em] text-black text-[12px]">{t('kesfet.veriYok')}</div>
            )}
          </div>
          {gercekYorumlar.length > 1 && (
            <div className="flex justify-center gap-1.5 mt-2">
              {gercekYorumlar.map((_, i) => (
                <span key={i} className={`h-1.5 rounded-full transition-all ${i === currentIndex ? 'w-5 bg-blue-600' : 'w-1.5 bg-slate-200'}`} />
              ))}
            </div>
          )}
        </section>

        {/* MOBİL UYGULAMA */}
        <section className="max-w-7xl mx-auto px-5 md:px-10 pb-24">
          <div className="bg-[#023E56] text-white rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-14 flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/20 blur-[80px] rounded-full pointer-events-none" />
            <div className="relative z-10 text-center md:text-left">
              <h3 className="text-[28px] font-black uppercase italic tracking-tighter leading-none mb-3">
                {t('kesfet.cebinde')} <span className="text-blue-600">{t('kesfet.cebinde2')}</span>
              </h3>
              <p className="text-[13px] font-bold text-slate-400 uppercase italic tracking-wide">
                Haritada keşfet, konumundan mühürle, radarından takip et.
              </p>
            </div>
            <div className="relative z-10 flex items-center gap-3 bg-white/10 border border-white/20 px-8 py-4 rounded-2xl backdrop-blur-md">
              <span className="w-2.5 h-2.5 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-[12px] font-black uppercase italic tracking-widest">{t('acilis.yakinda')}</span>
            </div>
          </div>
        </section>

        <footer className="py-24 border-t border-black/5 text-center text-slate-400 font-bold uppercase italic text-[11px] tracking-[0.2em]">
          © 2026 BULEVİNİ — Şeffaf Bina Kültürü
        </footer>
      </main>

      {/* CONFIRM MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-[#023E56]/30 backdrop-blur-md">
          <div className="bg-white/90 backdrop-blur-3xl w-full max-w-md rounded-[4rem] overflow-hidden shadow-2xl border-2 border-white text-black">
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-[#e8f3fa] rounded-full flex items-center justify-center mx-auto mb-8"><AlertCircle size={44} className="text-blue-600" /></div>
              <h3 className="text-[24px] font-black uppercase italic tracking-tighter mb-6 leading-none">BU BİNA HENÜZ <span className="text-blue-600">MÜHÜRLENMEMİŞ!</span></h3>
              <button onClick={() => router.push(`/bina-olustur?binaAdi=${encodeURIComponent(pendingSelection.name)}`)} className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black uppercase italic text-[13px] shadow-xl shadow-blue-200/50 hover:bg-[#023E56] transition-all">EVET, BİNAYI MÜHÜRLE</button>
              <button onClick={() => setShowConfirmModal(false)} className="mt-6 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-black transition-colors">ŞİMDİLİK KALSIN</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}