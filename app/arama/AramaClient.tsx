"use client";
import { trUpper } from '@/app/lib/utils';
import { slugify } from '@/app/lib/slug';
import { streetViewUrl } from '@/app/lib/streetview';
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { Search, Home, MapPin, Star, MessageSquare, ArrowRight, X, SlidersHorizontal, ChevronRight, Map as MapIcon, List, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/app/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import LeafletHarita from '@/app/components/LeafletHarita';
import { useLang } from '@/app/lib/i18n';
import Sidebar from '@/app/components/Sidebar';

// Saf hesap: özet kayıtları → kart verisi (süzülmüş, sıralı). Hem ilk render (SSR)
// hem de arama/filtre değişiminde kullanılır — böylece liste sunucu HTML'inde de olur.
function hesaplaSonuclar(data: any[], search: string, activeFilters: any) {
  const searchStr = trUpper(search);
  const aranan = slugify(searchStr);
  return data
    .map((b: any) => ({
      ad: b.ad, slug: b.slug,
      finalPuan: b.finalPuan || 0,
      sayi: b.muhurSayisi || 0,
      dogrulanmisSayisi: b.dogrulanmis || 0,
      ilce: trUpper(b.ilce || 'İSTANBUL').trim(),
      mahalle: trUpper(b.mahalle || 'Bilinmiyor').trim(),
      koordinat: b.koordinat?.lat ? `${b.koordinat.lat}, ${b.koordinat.lng}` : '',
      foto: streetViewUrl(b.koordinat),
      kategoriler: Object.fromEntries(Object.keys(b.kategoriOrt || {}).map((k) => [trUpper(k), true])),
    }))
    .filter((b) => {
      // O5 tolerans: iki taraf da slug'a düzleştirilir — "gul", "GÜL", "Gül apartmani" hepsi bulur
      const aramaUyumu = slugify(b.ad).includes(aranan) || slugify(b.ilce).includes(aranan) || slugify(b.mahalle).includes(aranan);
      const ilceUyumu = activeFilters.ilce === "" || b.ilce === activeFilters.ilce;
      const puanUyumu = b.finalPuan >= activeFilters.minPuan;
      const kategoriUyumu = activeFilters.kategori === "" || b.kategoriler[activeFilters.kategori];
      return aramaUyumu && ilceUyumu && puanUyumu && kategoriUyumu;
    })
    .sort((a: any, b: any) => b.finalPuan - a.finalPuan);
}

function AramaIcerik({ initialBinalar = [] }: { initialBinalar?: any[] }) {
  const router = useRouter();
  const { t } = useLang();
  const [searchTerm, setSearchTerm] = useState("");
  // İlk sonuçları senkron hesapla → SSR HTML'inde liste hazır gelir (anında görünür)
  const [results, setResults] = useState<any[]>(() => hesaplaSonuclar(initialBinalar, "", { ilce: "", minPuan: 0, kategori: "" }));
  const [allReviews, setAllReviews] = useState<any[]>(initialBinalar);
  // Veri sunucudan hazır geldiyse yükleniyor ekranı gösterme (anında liste)
  const [loading, setLoading] = useState(initialBinalar.length === 0);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    ilce: "",
    minPuan: 0,
    kategori: ""
  });

  useEffect(() => {
    // Sunucudan hazır veri geldiyse tarayıcıda tekrar çekme (reCAPTCHA/auth beklemesi yok)
    if (initialBinalar.length > 0) {
      gruplaVeFiltrele(initialBinalar, searchTerm, filters);
      return;
    }
    // Yedek: sunucu boş döndüyse tarayıcıda çek (ölçek: özet defteri 'binalar')
    const verileriGetir = async () => {
      setLoading(true);
      const snap = await getDocs(collection(db, 'binalar'));
      const data = snap.docs.map(d => d.data());
      setAllReviews(data);
      gruplaVeFiltrele(data, searchTerm, filters);
      setLoading(false);
    };
    verileriGetir();
  }, []);

  // binalar zaten bina-başına özettir — süzülmüş sonucu hesapla + göster
  const gruplaVeFiltrele = (data: any[], search: string, activeFilters: any) => {
    setResults(hesaplaSonuclar(data, search, activeFilters));
  };

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    gruplaVeFiltrele(allReviews, val, filters);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    gruplaVeFiltrele(allReviews, searchTerm, newFilters);
  };

  // allReviews artık binalar özet kayıtları
  const ilceListesi = useMemo(() => {
    return Array.from(new Set(allReviews.map((b: any) => b.ilce ? trUpper(b.ilce.toString()).trim() : null))).filter(Boolean);
  }, [allReviews]);

  const ilcePuanlari = useMemo(() => {
    const ozet: { [ilce: string]: { toplam: number; sayi: number } } = {};
    allReviews.forEach((b: any) => {
      const ilce = b.ilce ? trUpper(b.ilce.toString()).trim() : '';
      if (!ilce || !(b.finalPuan > 0)) return;
      if (!ozet[ilce]) ozet[ilce] = { toplam: 0, sayi: 0 };
      ozet[ilce].toplam += (b.finalPuan || 0);
      ozet[ilce].sayi += 1;
    });
    return ozet;
  }, [allReviews]);

  const dinamikKriterler = useMemo(() => {
    return Array.from(new Set(allReviews.flatMap((b: any) => Object.keys(b.kategoriOrt || {}).map(k => trUpper(k)))));
  }, [allReviews]);

  return (
    <div className="lg:pl-80 min-h-screen bg-white text-black font-sans text-left relative overflow-x-hidden">
      <Sidebar />
      
      {/* SOL FİLTRE PANELİ */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-[#023E56] z-[600] transform transition-transform duration-500 ease-in-out shadow-[20px_0px_60px_rgba(0,0,0,0.5)] p-8 ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-blue-600 font-black italic text-2xl tracking-tighter uppercase">{t('arama.filtreOdasi')}</h2>
          <button onClick={() => setIsFilterOpen(false)} className="text-white hover:rotate-90 transition-all"><X size={24}/></button>
        </div>

        <div className="space-y-10">
          <div>
            <label className="text-slate-500 font-black italic text-[10px] uppercase tracking-[0.2em] mb-4 block">{t('arama.bolge')}</label>
            <select 
              value={filters.ilce}
              onChange={(e) => handleFilterChange({...filters, ilce: e.target.value})}
              className="w-full bg-transparent border-b-2 border-slate-800 text-white font-bold py-2 outline-none focus:border-blue-600 transition-colors uppercase text-sm"
            >
              <option value="" className="bg-[#023E56]">{t('arama.tumIlceler')}</option>
              {ilceListesi.map((ilce: any) => <option key={ilce} value={ilce} className="bg-[#023E56]">{ilce}</option>)}
            </select>
          </div>

          <div>
            <label className="text-slate-500 font-black italic text-[10px] uppercase tracking-[0.2em] mb-4 block">{t('arama.minPuan')}: {filters.minPuan}+</label>
            <input 
              type="range" min="0" max="5" step="1"
              value={filters.minPuan}
              onChange={(e) => handleFilterChange({...filters, minPuan: Number(e.target.value)})}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <label className="text-slate-500 font-black italic text-[10px] uppercase tracking-[0.2em] mb-4 block">KRİTİK KRİTER</label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2">
              {dinamikKriterler.map(cat => (
                <button 
                  key={cat}
                  onClick={() => handleFilterChange({...filters, kategori: filters.kategori === cat ? "" : cat})}
                  className={`px-4 py-2 rounded-xl text-[10px] font-black italic uppercase transition-all whitespace-nowrap ${filters.kategori === cat ? 'bg-blue-600 text-white shadow-[0px_0px_15px_rgba(37,99,235,0.4)]' : 'bg-slate-900 text-slate-400 hover:bg-slate-800'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={() => {setFilters({ilce: "", minPuan: 0, kategori: ""}); handleFilterChange({ilce: "", minPuan: 0, kategori: ""});}}
          className="absolute bottom-10 left-8 right-8 py-4 border-2 border-slate-800 text-slate-500 font-black italic uppercase text-xs hover:border-blue-600 hover:text-white transition-all rounded-2xl"
        >
          FİLTRELERİ SIFIRLA
        </button>
      </div>

      {isFilterOpen && <div onClick={() => setIsFilterOpen(false)} className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[590] transition-opacity" />}

      {/* LİSTE / HARİTA GEÇİŞ BUTONU */}
      <div className="fixed bottom-24 lg:bottom-8 left-1/2 -translate-x-1/2 z-[490] flex bg-[#023E56] p-1.5 md:p-2 rounded-full shadow-2xl border-2 border-white/10 md:scale-125">
        <button 
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase italic transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
        >
          <List size={16} /> {t('arama.liste')}
        </button>
        <button 
          onClick={() => setViewMode('map')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase italic transition-all ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
        >
          <MapIcon size={16} /> {t('arama.harita')}
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="mb-8 md:mb-16 flex justify-between items-center border-b border-slate-100 pb-5 md:pb-8">
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <img src="/logo.png" alt="Bulevini" className="h-10 md:h-12" />
          </Link>
          <button 
            onClick={() => router.push('/bina-olustur')} 
            className="bg-[#023E56] text-white px-4 md:px-8 py-3 md:py-4 rounded-full font-black uppercase italic text-[10px] md:text-xs hover:bg-blue-600 transition-all shadow-xl active:scale-95"
          >
            YENİ BİNA MÜHÜRLE +
          </button>
        </header>

        <main className="pb-32">
          <div className="mb-8 md:mb-16">
            <h1 className="text-[28px] md:text-[70px] font-black uppercase italic leading-[1] md:leading-[0.8] mb-5 md:mb-8 tracking-tighter">
              {viewMode === 'list' ? t('arama.baslik1') : t('arama.baslik2')} <span className="text-blue-600">{viewMode === 'list' ? t('arama.baslik1b') : t('arama.baslik2b')}</span>
            </h1>
            
            <div className="flex flex-row gap-3 md:gap-4 items-stretch">
              <button 
                onClick={() => setIsFilterOpen(true)}
                className={`p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border-2 border-black transition-all flex items-center justify-center shrink-0 ${isFilterOpen || filters.ilce || filters.minPuan > 0 ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200' : 'bg-white text-black hover:bg-slate-50'}`}
              >
                <SlidersHorizontal size={22} />
              </button>

              <div className="relative flex-1">
                <div className="bg-slate-50 border-2 border-black rounded-[2.5rem] p-2 flex items-center px-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <Search size={30} className="text-black" />
                  <input 
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={t('arama.placeholder')}
                    className="w-full p-6 bg-transparent font-black text-2xl uppercase italic outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {viewMode === 'list' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
              {loading ? (
                <p className="col-span-full font-black italic text-slate-200 text-4xl animate-pulse text-left">SİSTEM TARANIYOR...</p>
              ) : results.length > 0 ? (
                results.map((bina, idx) => (
                  <div 
                    key={idx}
                    onClick={() => router.push(`/bina/${bina.slug || slugify(bina.ad)}`)}
                    className="group bg-white border-2 border-slate-100 rounded-[3rem] hover:border-blue-600 transition-all cursor-pointer shadow-sm hover:shadow-2xl relative overflow-hidden flex flex-col"
                  >
                    <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
                      {bina.foto && <img src={bina.foto} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={bina.ad} />}
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-2xl flex items-center gap-1 font-black italic shadow-sm">
                        <Star size={14} className="fill-blue-600 text-blue-600" />
                        <span className="text-sm">{bina.finalPuan.toFixed(1)}</span>
                      </div>
                      {bina.dogrulanmisSayisi > 0 && (
                        <div className="absolute top-4 left-4 bg-blue-600 text-white px-3 py-1.5 rounded-2xl flex items-center gap-1 text-[9px] font-black italic uppercase shadow-xl">
                          <ShieldCheck size={12} /> Doğrulanmış
                        </div>
                      )}
                    </div>
                    <div className="p-8">
                      <h3 className="text-2xl font-black uppercase italic leading-tight mb-2 group-hover:text-blue-600 transition-colors">{bina.ad}</h3>
                      <div className="flex items-center gap-2 text-slate-400 font-bold uppercase italic text-[10px] mb-8">
                        <MapPin size={12} /> {bina.ilce} / {bina.mahalle}
                      </div>
                      <div className="pt-6 border-t border-slate-50 flex justify-between items-center text-slate-400">
                        <div className="flex items-center gap-2">
                          <MessageSquare size={16} />
                          <span className="font-black italic text-xs uppercase">
                            {bina.sayi} Mühür • {bina.dogrulanmisSayisi} SAKİN
                          </span>
                        </div>
                        <ArrowRight className="text-blue-600 transform group-hover:translate-x-2 transition-transform" />
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 px-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-[3.5rem] text-center">
                  <p className="text-2xl font-black uppercase italic text-slate-300 mb-6 text-left">KRİTERLERE UYGUN MÜHÜR BULUNAMADI.</p>
                  <button onClick={() => {setFilters({ilce: "", minPuan: 0, kategori: ""}); handleSearch("");}} className="bg-blue-600 text-white px-10 py-5 rounded-full font-black uppercase italic text-lg hover:bg-[#023E56] transition-all shadow-xl">{t('arama.sifirla')}</button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative h-[650px] w-full rounded-[3.5rem] overflow-hidden border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-4 duration-500 z-10 bg-slate-50">
              <div className="absolute top-6 left-6 z-20 flex items-center gap-3 bg-[#023E56]/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-white shadow-2xl">
                <span className="text-blue-600 font-black italic text-[11px] uppercase tracking-widest">İSTANBUL</span>
                <ChevronRight size={14} className="text-slate-600" />
                <span className="font-black italic text-[11px] uppercase tracking-widest">{filters.ilce || "TÜM İLÇELER"}</span>
              </div>
              <div className="absolute bottom-6 right-6 z-20 bg-[#023E56]/90 backdrop-blur-md p-5 rounded-[2rem] border border-white/10 shadow-2xl">
                <h4 className="text-[9px] font-black italic text-slate-500 uppercase tracking-widest mb-4">MÜHÜR ANALİZİ</h4>
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-600 shadow-[0_0_10px_rgba(220,38,38,0.5)]"></div>
                    <span className="text-[8px] font-black italic text-white uppercase">0.0 - 1.0 (KRİTİK)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
                    <span className="text-[8px] font-black italic text-white uppercase">1.0 - 2.5 (SORUNLU)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-400"></div>
                    <span className="text-[8px] font-black italic text-white uppercase">2.5 - 3.5 (ORTALAMA)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-cyan-400"></div>
                    <span className="text-[8px] font-black italic text-white uppercase">3.5 - 4.5 (GÜVENLİ)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.5)]"></div>
                    <span className="text-[8px] font-black italic text-white uppercase">4.5 - 5.0 (MÜKEMMEL)</span>
                  </div>
                </div>
              </div>
              <LeafletHarita legend ilcePuanlari={ilcePuanlari} binalar={results.map(r => ({ ad: r.ad, koordinat: r.koordinat, finalPuan: r.finalPuan, sayi: r.sayi }))} />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AramaClient({ initialBinalar = [] }: { initialBinalar?: any[] }) {
  return (
    <Suspense fallback={<div className="p-20 font-black italic uppercase text-center text-slate-200">ARAMA ODASI HAZIRLANIYOR...</div>}>
      <AramaIcerik initialBinalar={initialBinalar} />
    </Suspense>
  );
}