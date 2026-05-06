"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Star, ShieldCheck, Loader2, AlertCircle, Radio, MessageSquarePlus, Map, Radar, Users, MessageSquare, ShieldCheck as ShieldIcon, LogOut } from "lucide-react";
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { db } from '@/app/lib/firebase';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { useAuth } from '@/app/contexts/AuthContext';
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

  const router = useRouter();
  const autocompleteService = useRef<any>(null);

  useEffect(() => {
    const veriGetir = async () => {
      const yorumlarRef = collection(db, 'yorumlar');
      const q = query(yorumlarRef, orderBy('created_at', 'desc'), limit(15));
      const snap = await getDocs(q);
      setGercekYorumlar(snap.docs.map(d => ({ id: d.id, ...d.data() })));

      if (user) {
        const radarRef = collection(db, 'takipler');
        const radarQ = query(radarRef, where('kullanici_id', '==', user.uid));
        const radarSnap = await getDocs(radarQ);
        setRadarBinalar(radarSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      }
    };
    veriGetir();

    const checkGoogle = setInterval(() => {
      if (window.google?.maps?.places) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        clearInterval(checkGoogle);
      }
    }, 500);
  }, [user]);

  useEffect(() => {
    if (gercekYorumlar.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 3 >= gercekYorumlar.length ? 0 : prev + 3));
    }, 30000);
    return () => clearInterval(interval);
  }, [gercekYorumlar]);

  useEffect(() => {
    const getPredictions = async () => {
      if (!autocompleteService.current || searchTerm.length < 3) {
        setSuggestions([]);
        return;
      }
      setIsSearching(true);
      autocompleteService.current.getPlacePredictions(
        { input: searchTerm, componentRestrictions: { country: 'tr' }, types: ['address'] },
        (predictions: any, status: any) => {
          setSuggestions(status === 'OK' ? predictions : []);
          setIsSearching(false);
        }
      );
    };
    const delay = setTimeout(getPredictions, 400);
    return () => clearTimeout(delay);
  }, [searchTerm]);

  const handleSelection = async (item: any) => {
    const mainText = item.structured_formatting?.main_text || item.description || "";
    setIsSearching(true);
    const yorumlarRef = collection(db, 'yorumlar');
    const q = query(yorumlarRef, where('yeni_bina_adi', '==', mainText.toUpperCase()));
    const snap = await getDocs(q);
    if (!snap.empty) {
      router.push(`/arama?query=${encodeURIComponent(mainText.toUpperCase())}`);
    } else {
      setPendingSelection({ name: mainText.toUpperCase(), city: item.structured_formatting?.secondary_text || "" });
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
      <div className="fixed bottom-[-10%] right-[5%] w-[35%] h-[35%] bg-blue-50 rounded-full blur-[110px] z-0 pointer-events-none"></div>

      {/* SIDEBAR */}
      <aside className="w-80 h-screen bg-black/5 backdrop-blur-[40px] text-black flex flex-col p-8 border-r border-black/5 fixed left-0 top-0 z-[250] hidden lg:flex">
        <div className="mb-12">
          <Link href="/" className="text-2xl font-black italic tracking-tighter uppercase block text-black">BULEVİNİ</Link>
          <div className="h-1.5 w-10 bg-blue-600 mt-2 rounded-full"></div>
        </div>
        <nav className="flex-1 space-y-3">
          <button onClick={() => router.push('/')} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/40 shadow-sm border border-white/20">
            <Map size={20} className="text-blue-600" />
            <span className="text-[12px] font-black italic tracking-widest uppercase">BİNALARI KEŞFET</span>
          </button>
          <button onClick={() => router.push('/profil')} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 transition-all group">
            <Radar size={20} className="text-slate-400 group-hover:text-blue-600" />
            <span className="text-[12px] font-black italic tracking-widest uppercase text-slate-500 group-hover:text-black">RADARIMDAKİLER</span>
          </button>
          <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 transition-all group">
            <Users size={20} className="text-slate-400 group-hover:text-blue-600" />
            <span className="text-[12px] font-black italic tracking-widest uppercase text-slate-500 group-hover:text-black">TOPLULUK</span>
          </button>
          <button onClick={() => router.push('/profil')} className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-black/5 transition-all group">
            <MessageSquare size={20} className="text-slate-400 group-hover:text-blue-600" />
            <span className="text-[12px] font-black italic tracking-widest uppercase text-slate-500 group-hover:text-black">YORUMLARIM</span>
          </button>
        </nav>
        <div className="mt-auto pt-8 border-t border-black/5">
          {user ? (
            <div className="mb-6">
              <Link href="/profil" className="flex items-center gap-4 p-2 rounded-2xl hover:bg-white/30 transition-all">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center font-black italic text-white shadow-lg">
                  {user.displayName?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <h4 className="text-[13px] font-black italic uppercase text-black">{user.displayName || user.email}</h4>
                  <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">PROFİLİM</p>
                </div>
              </Link>
              <button onClick={handleLogout} className="w-full mt-2 flex items-center gap-3 p-3 rounded-2xl hover:bg-red-50 transition-all text-slate-400 hover:text-red-500">
                <LogOut size={16} />
                <span className="text-[11px] font-black italic uppercase tracking-widest">ÇIKIŞ YAP</span>
              </button>
            </div>
          ) : (
            <Link href="/giris" className="flex items-center gap-4 mb-6 p-2 rounded-2xl hover:bg-white/30 transition-all">
              <div className="w-12 h-12 bg-slate-200 rounded-2xl flex items-center justify-center">👤</div>
              <div>
                <h4 className="text-[13px] font-black italic uppercase text-black">GİRİŞ YAP</h4>
                <p className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">HESABINA ERİŞ</p>
              </div>
            </Link>
          )}
          <div className="bg-white/40 p-4 rounded-2xl border border-white/40 flex items-center gap-3 backdrop-blur-xl shadow-sm">
            <ShieldIcon className="text-green-500" size={16} />
            <span className="text-[9px] font-black italic text-slate-600 uppercase tracking-widest">GÜVENLİ ERİŞİM</span>
          </div>
        </div>
      </aside>

      {/* ANA İÇERİK */}
      <main className="flex-1 lg:ml-80 relative bg-transparent z-10 pb-20">
        <header className="fixed top-0 left-0 lg:left-80 right-0 z-[200] bg-white/40 backdrop-blur-2xl px-8 py-4 border-b border-black/5 flex justify-between items-center shadow-sm">
          <Link href="/" className="flex flex-col items-start lg:hidden text-black">
            <span className="font-black italic tracking-tighter text-[22px] leading-none">BULEVİNİ</span>
          </Link>
          <div className="hidden lg:block"></div>
          <div className="flex items-center gap-4">
            <Link href="/profil" className={`p-3 rounded-2xl transition-all border-2 border-white bg-white/60 backdrop-blur-md shadow-sm ${radarBinalar.length > 0 ? 'text-blue-600 border-blue-100 animate-pulse' : 'text-slate-300'}`}>
              <Radio size={20} />
            </Link>
            {user ? (
              <div className="flex items-center gap-2">
                <Link href="/profil" className="flex items-center gap-3 bg-black text-white px-5 py-3 rounded-2xl shadow-xl hover:scale-105 transition-all">
                  <span className="font-black italic text-[12px] uppercase tracking-tighter">
                    {user.displayName || user.email?.split('@')[0]}
                  </span>
                </Link>
                <button onClick={handleLogout} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link href="/giris" className="flex items-center gap-3 bg-black text-white px-5 py-3 rounded-2xl shadow-xl hover:scale-105 transition-all">
                <span className="font-black italic text-[12px] uppercase tracking-tighter">GİRİŞ YAP</span>
              </Link>
            )}
            <Link href="/yorum-yap" className="hidden md:flex bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black italic text-[11px] uppercase items-center gap-2 shadow-xl shadow-blue-200 hover:bg-black transition-all">
              <MessageSquarePlus size={16} /> DENEYİMİNİ PAYLAŞ
            </Link>
          </div>
        </header>

        {/* SEARCH */}
        <section className="pt-56 pb-16 px-6 text-center relative z-[100]">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-[42px] md:text-[72px] font-black leading-[0.85] tracking-tighter uppercase mb-12 text-black">
              EVİNİ TUTMADAN ÖNCE <br />
              <span className="text-blue-600 italic">GERÇEKLERİ</span> ÖĞREN.
            </h1>
            <div className="relative max-w-2xl mx-auto">
              <div className="relative flex items-center z-[110]">
                <div className="absolute left-7 text-slate-400">
                  {isSearching ? <Loader2 size={24} className="animate-spin text-blue-600" /> : <Search size={24} />}
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
                  placeholder="BİNA VEYA SOKAK ADI YAZIN..."
                  className="w-full h-22 bg-white/60 backdrop-blur-2xl border-2 border-white rounded-[2.5rem] pl-18 pr-40 text-[16px] font-black italic focus:border-blue-600 shadow-2xl uppercase outline-none text-black transition-all"
                />
                <button onClick={() => router.push(`/arama?query=${encodeURIComponent(searchTerm.toUpperCase())}`)} className="absolute right-3.5 px-10 h-15 bg-blue-600 text-white rounded-[2rem] text-[15px] font-black uppercase italic hover:bg-black transition-all shadow-lg">ARA</button>
              </div>
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-[115%] left-0 right-0 bg-white/80 backdrop-blur-3xl border-2 border-white rounded-[2.5rem] shadow-2xl overflow-hidden z-[120]">
                  {suggestions.map((item, i) => (
                    <button key={i} onClick={() => handleSelection(item)} className="w-full px-10 py-6 text-left flex items-center gap-5 hover:bg-blue-50/50 border-b border-black/5 last:border-0 transition-colors">
                      <div className="bg-blue-600/10 p-3 rounded-2xl text-blue-600"><MapPin size={20} /></div>
                      <div className="flex flex-col text-black">
                        <span className="font-black uppercase italic text-[15px]">{item.structured_formatting?.main_text}</span>
                        <span className="text-[11px] font-bold text-slate-400 uppercase italic mt-1">{item.structured_formatting?.secondary_text}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* FEED */}
        <section className="max-w-7xl mx-auto px-10 pt-20 pb-20 relative z-[10]">
          <div className="flex justify-between items-end mb-12 border-l-4 border-blue-600 pl-6">
            <div>
              <h2 className="text-[16px] font-black uppercase italic tracking-tighter text-black">SON SAKİN YORUMLARI</h2>
              <p className="text-[11px] font-bold text-slate-400 uppercase italic mt-1 tracking-widest">TOPLULUK TARAFINDAN MÜHÜRLENDİ</p>
            </div>
            <div className="flex items-center gap-3 bg-white/50 px-4 py-2 rounded-2xl border border-white text-black font-black">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping"></div>
              <span className="text-[11px] font-black text-blue-600 uppercase italic tracking-widest">CANLI AKIŞ</span>
            </div>
          </div>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-8">
            {gercekYorumlar.length > 0 ? (
              gercekYorumlar.slice(currentIndex, currentIndex + 3).map((yorum, i) => (
                <Link key={i} href={`/arama?query=${encodeURIComponent(yorum.yeni_bina_adi || yorum.bina_adi)}`} className="group bg-white/60 backdrop-blur-2xl p-10 rounded-[4rem] border border-white hover:border-blue-600 transition-all shadow-xl hover:shadow-2xl">
                  <div className="flex justify-between items-start mb-8 text-black">
                    <div className="flex-1 pr-4">
                      <h3 className="text-[16px] font-black uppercase italic tracking-tighter group-hover:text-blue-600 leading-none mb-3 line-clamp-1">{yorum.yeni_bina_adi || yorum.bina_adi}</h3>
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={14} className="text-blue-600" />
                        <span className="text-[11px] font-bold text-slate-400 uppercase italic">{yorum.kullanici_adi || yorum.kullanıcı_adi || 'Anonim'}</span>
                      </div>
                    </div>
                    <div className="bg-white/80 px-4 py-1.5 rounded-2xl flex items-center gap-1.5 border border-white text-blue-600 font-black italic text-[13px]">
                      <Star size={14} fill="currentColor" /> {yorum.puan || '5.0'}
                    </div>
                  </div>
                  <p className="text-[13px] font-medium text-slate-700 italic leading-relaxed line-clamp-3">"{yorum.yorum_metni}"</p>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-24 text-center opacity-30 font-black italic uppercase tracking-[0.5em] text-black text-[12px]">Veriler mühürleniyor...</div>
            )}
          </div>
        </section>

        <footer className="py-24 border-t border-black/5 text-center text-slate-400 font-bold uppercase italic text-[11px] tracking-[0.2em]">
          © 2026 BULEVİNİ — Şeffaf Bina Kültürü
        </footer>
      </main>

      {/* CONFIRM MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/30 backdrop-blur-md">
          <div className="bg-white/90 backdrop-blur-3xl w-full max-w-md rounded-[4rem] overflow-hidden shadow-2xl border-2 border-white text-black">
            <div className="p-12 text-center">
              <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-8"><AlertCircle size={44} className="text-blue-600" /></div>
              <h3 className="text-[24px] font-black uppercase italic tracking-tighter mb-6 leading-none">BU BİNA HENÜZ <span className="text-blue-600">MÜHÜRLENMEMİŞ!</span></h3>
              <button onClick={() => router.push(`/bina-olustur?binaAdi=${encodeURIComponent(pendingSelection.name)}`)} className="w-full bg-blue-600 text-white py-6 rounded-2xl font-black uppercase italic text-[13px] shadow-xl shadow-blue-200/50 hover:bg-black transition-all">EVET, BİNAYI MÜHÜRLE</button>
              <button onClick={() => setShowConfirmModal(false)} className="mt-6 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-black transition-colors">ŞİMDİLİK KALSIN</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}