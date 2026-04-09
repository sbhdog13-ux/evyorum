"use client";
import React, { useState, useEffect, Suspense, useMemo } from 'react';
import { Search, Home, Building2, MapPin, Star, MessageSquare, ArrowRight, X, Camera, Filter, SlidersHorizontal, ChevronRight, Map as MapIcon, List, ShieldCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import GoogleHarita from '@/app/components/GoogleHarita';

const supabaseUrl = "https://teakxifsmctudlpzuwkn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlYWt4aWZzbWN0dWRscHp1d2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3Mzc0NzUsImV4cCI6MjA4NDMxMzQ3NX0.NroN4nZW1cfxVT2apGoD6VyUpYJdJAjcSi6KJgF3mj8";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function AramaIcerik() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [allReviews, setAllReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    ilce: "",
    minPuan: 0,
    kategori: ""
  });

  useEffect(() => {
    const verileriGetir = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('yorumlar').select('*');
      if (!error && data) {
        setAllReviews(data);
        gruplaVeFiltrele(data, searchTerm, filters);
      }
      setLoading(false);
    };
    verileriGetir();
  }, []);

  const gruplaVeFiltrele = (data: any[], search: string, activeFilters: any) => {
    const searchStr = search.toUpperCase();
    const gruplar: { [key: string]: any } = {};
    
    data.forEach(item => {
      const isim = item.bina_adi?.toString().toUpperCase().trim() || "";
      if (!isim) return;

      if (!gruplar[isim]) {
        gruplar[isim] = {
          ad: isim,
          toplamAgirlikliPuan: 0,
          toplamEtkiPayi: 0,
          sayi: 0,
          dogrulanmisSayisi: 0,
          ilce: "İSTANBUL",
          mahalle: "Bilinmiyor",
          koordinat: "",
          foto: item.foto_url || "",
          kategoriler: {} 
        };
      }

      if (item.acik_adres && item.acik_adres.includes('|')) {
          const parcalar = item.acik_adres.split('|');
          const yerBilgisi = parcalar[0]?.split(' ');
          if (yerBilgisi && yerBilgisi.length > 2) {
            gruplar[isim].mahalle = yerBilgisi[0] || gruplar[isim].mahalle;
            gruplar[isim].ilce = yerBilgisi[2]?.split('/')[0].toUpperCase() || gruplar[isim].ilce;
          }
          const koordParca = parcalar.find((p: string) => p.includes('KOORD:'));
          if (koordParca) gruplar[isim].koordinat = koordParca.replace('KOORD:', '').trim();
      }

      // PUANLAMA MANTIĞI: Bağlantı tipine göre ağırlıklandırma
      let etkiCarpani = 0.3; 
      if (item.baglanti_tipi === 'sakin') etkiCarpani = 1.0;
      if (item.baglanti_tipi === 'eski_sakin') etkiCarpani = 0.7;
      if (item.is_verified) etkiCarpani += 0.2;

      const p = typeof item.puanlar === 'string' ? JSON.parse(item.puanlar) : item.puanlar;
      if (p && typeof p === 'object') {
        const puanDegerleri = Object.values(p).map(val => Number(val)).filter(val => !isNaN(val));
        if (puanDegerleri.length > 0) {
          const satirOrtalamasi = puanDegerleri.reduce((a, b) => a + b, 0) / puanDegerleri.length;
          gruplar[isim].toplamAgirlikliPuan += (satirOrtalamasi * etkiCarpani);
          gruplar[isim].toplamEtkiPayi += etkiCarpani;
          gruplar[isim].sayi += 1;
          if (item.is_verified) gruplar[isim].dogrulanmisSayisi += 1;
        }
        Object.keys(p).forEach(k => {
          gruplar[isim].kategoriler[k.toUpperCase()] = true;
        });
      }
    });

    const finalResults = Object.values(gruplar).filter((b: any) => {
      const ortalama = b.toplamEtkiPayi > 0 ? (b.toplamAgirlikliPuan / b.toplamEtkiPayi) : 0;
      b.finalPuan = ortalama;

      const aramaUyumu = b.ad.includes(searchStr) || b.ilce.includes(searchStr) || b.mahalle.includes(searchStr);
      const ilceUyumu = activeFilters.ilce === "" || b.ilce === activeFilters.ilce;
      const puanUyumu = ortalama >= activeFilters.minPuan;
      const kategoriUyumu = activeFilters.kategori === "" || b.kategoriler[activeFilters.kategori];
      
      return aramaUyumu && ilceUyumu && puanUyumu && kategoriUyumu;
    });

    setResults(finalResults);
  };

  const handleSearch = (val: string) => {
    setSearchTerm(val);
    gruplaVeFiltrele(allReviews, val, filters);
  };

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    gruplaVeFiltrele(allReviews, searchTerm, newFilters);
  };

  const ilceListesi = useMemo(() => {
    return Array.from(new Set(allReviews.map(r => {
      if (r.acik_adres && r.acik_adres.includes('|')) {
          return r.acik_adres.split('|')[0].split(' ')[2]?.split('/')[0].toUpperCase();
      }
      return null;
    }))).filter(Boolean);
  }, [allReviews]);

  const dinamikKriterler = useMemo(() => {
    return Array.from(new Set(allReviews.flatMap(r => {
      const p = typeof r.puanlar === 'string' ? JSON.parse(r.puanlar) : r.puanlar;
      return p ? Object.keys(p).map(k => k.toUpperCase()) : [];
    })));
  }, [allReviews]);

  return (
    <div className="min-h-screen bg-white text-black font-sans text-left relative overflow-x-hidden">
      
      {/* SOL FİLTRE PANELİ */}
      <div className={`fixed inset-y-0 left-0 w-80 bg-black z-[110] transform transition-transform duration-500 ease-in-out shadow-[20px_0px_60px_rgba(0,0,0,0.5)] p-8 ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex justify-between items-center mb-12">
          <h2 className="text-blue-600 font-black italic text-2xl tracking-tighter uppercase">FİLTRE ODASI</h2>
          <button onClick={() => setIsFilterOpen(false)} className="text-white hover:rotate-90 transition-all"><X size={24}/></button>
        </div>

        <div className="space-y-10">
          <div>
            <label className="text-slate-500 font-black italic text-[10px] uppercase tracking-[0.2em] mb-4 block">BÖLGE SEÇİMİ</label>
            <select 
              value={filters.ilce}
              onChange={(e) => handleFilterChange({...filters, ilce: e.target.value})}
              className="w-full bg-transparent border-b-2 border-slate-800 text-white font-bold py-2 outline-none focus:border-blue-600 transition-colors uppercase text-sm"
            >
              <option value="" className="bg-black">TÜM İLÇELER</option>
              {ilceListesi.map((ilce: any) => <option key={ilce} value={ilce} className="bg-black">{ilce}</option>)}
            </select>
          </div>

          <div>
            <label className="text-slate-500 font-black italic text-[10px] uppercase tracking-[0.2em] mb-4 block">MİNİMUM PUAN: {filters.minPuan}+</label>
            <input 
              type="range" min="0" max="5" step="1"
              value={filters.minPuan}
              onChange={(e) => handleFilterChange({...filters, minPuan: Number(e.target.value)})}
              className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-600"
            />
          </div>

          <div>
            <label className="text-slate-500 font-black italic text-[10px] uppercase tracking-[0.2em] mb-4 block">KRİTİK KRİTER</label>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
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

      {isFilterOpen && <div onClick={() => setIsFilterOpen(false)} className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100] transition-opacity" />}

      {/* LİSTE / HARİTA GEÇİŞ BUTONU */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] flex bg-black p-2 rounded-full shadow-2xl border-2 border-white/10 scale-110 md:scale-125">
        <button 
          onClick={() => setViewMode('list')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase italic transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
        >
          <List size={16} /> LİSTE
        </button>
        <button 
          onClick={() => setViewMode('map')}
          className={`flex items-center gap-2 px-6 py-3 rounded-full text-[10px] font-black uppercase italic transition-all ${viewMode === 'map' ? 'bg-blue-600 text-white shadow-xl' : 'text-slate-500 hover:text-white'}`}
        >
          <MapIcon size={16} /> HARİTA
        </button>
      </div>

      <div className="max-w-6xl mx-auto p-4 md:p-8">
        <header className="mb-16 flex justify-between items-center border-b border-slate-100 pb-8">
          <Link href="/" className="flex items-center gap-2">
            <Home size={24} className="text-blue-600" /> 
            <span className="text-2xl font-black uppercase italic tracking-tighter">BULEVİNİ</span>
          </Link>
          <button 
            onClick={() => router.push('/bina-olustur')} 
            className="bg-black text-white px-8 py-4 rounded-full font-black uppercase italic text-xs hover:bg-blue-600 transition-all shadow-xl active:scale-95"
          >
            YENİ BİNA MÜHÜRLE +
          </button>
        </header>

        <main className="pb-32">
          <div className="mb-16">
            <h1 className="text-[40px] md:text-[70px] font-black uppercase italic leading-[0.8] mb-8 tracking-tighter">
              {viewMode === 'list' ? 'MEVCUT' : 'BÖLGESEL'} <span className="text-blue-600">{viewMode === 'list' ? 'MÜHÜRLER.' : 'İSTİHBARAT.'}</span>
            </h1>
            
            <div className="flex flex-col md:flex-row gap-4 items-stretch">
              <button 
                onClick={() => setIsFilterOpen(true)}
                className={`p-6 rounded-[2.5rem] border-2 border-black transition-all flex items-center justify-center ${isFilterOpen || filters.ilce || filters.minPuan > 0 ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-200' : 'bg-white text-black hover:bg-slate-50'}`}
              >
                <SlidersHorizontal size={30} />
              </button>

              <div className="relative flex-1">
                <div className="bg-slate-50 border-2 border-black rounded-[2.5rem] p-2 flex items-center px-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                  <Search size={30} className="text-black" />
                  <input 
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="BİNA, İLÇE VEYA MAHALLE ARA..."
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
                      onClick={() => router.push(`/bina/${encodeURIComponent(bina.ad)}`)}
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
                                {bina.sayi} Mühür • {Math.round(bina.toplamEtkiPayi * 10)} GÜVEN
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
                  <button onClick={() => {setFilters({ilce: "", minPuan: 0, kategori: ""}); handleSearch("");}} className="bg-blue-600 text-white px-10 py-5 rounded-full font-black uppercase italic text-lg hover:bg-black transition-all shadow-xl">FİLTRELERİ SIFIRLA</button>
                </div>
              )}
            </div>
          ) : (
            <div className="relative h-[650px] w-full rounded-[3.5rem] overflow-hidden border-2 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-4 duration-500 z-10 bg-slate-50">
              <div className="absolute top-6 left-6 z-20 flex items-center gap-3 bg-black/90 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10 text-white shadow-2xl">
                <span className="text-blue-600 font-black italic text-[11px] uppercase tracking-widest">İSTANBUL</span>
                <ChevronRight size={14} className="text-slate-600" />
                <span className="font-black italic text-[11px] uppercase tracking-widest">{filters.ilce || "TÜM İLÇELER"}</span>
              </div>
              <div className="absolute bottom-6 right-6 z-20 bg-black/90 backdrop-blur-md p-5 rounded-[2rem] border border-white/10 shadow-2xl">
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
              <GoogleHarita 
                koordinat={results.length > 0 && results[0].koordinat ? results[0].koordinat : "41.0082, 28.9784"} 
                isInteractive={true}
                items={results.map(r => ({ ...r, toplamPuan: r.toplamAgirlikliPuan, sayi: r.toplamEtkiPayi }))} 
                onRegionSelect={(ilceAdi: string) => setFilters({ ...filters, ilce: ilceAdi.toUpperCase() })}
              />
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function AramaPage() {
  return (
    <Suspense fallback={<div className="p-20 font-black italic uppercase text-center text-slate-200">ARAMA ODASI HAZIRLANIYOR...</div>}>
      <AramaIcerik />
    </Suspense>
  );
}