"use client";

import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Star, MapPin, ArrowLeft, Home, Wind, Shield, Users, MessageSquarePlus, Activity, Map as MapIcon, Camera, CheckCircle, AlertTriangle, Heart, Thermometer, Radio, Info, X } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@supabase/supabase-js';
import GoogleHarita from '@/app/components/GoogleHarita';
import Link from 'next/link';

const supabaseUrl = "https://teakxifsmctudlpzuwkn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlYWt4aWZzbWN0dWRscHp1d2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3Mzc0NzUsImV4cCI6MjA4NDMxMzQ3NX0.NroN4nZW1cfxVT2apGoD6VyUpYJdJAjcSi6KJgF3mj8";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function BinaDetayIcerik() {
  const params = useParams();
  const id = params?.id;
  const searchParams = useSearchParams();
  
  const [dbYorumlar, setDbYorumlar] = useState<any[]>([]);
  const [dinamikKarne, setDinamikKarne] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [binaFotosu, setBinaFotosu] = useState<string | null>(null);
  const [koordinat, setKoordinat] = useState<string>("41.0082, 28.9784");
  const [konumBilgisi, setKonumBilgisi] = useState({ ilce: "İSTANBUL", mahalle: "Bilinmiyor" });
  
  // RADAR STATE
  const [isFollowing, setIsFollowing] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);

  const binaIsmiRaw = searchParams?.get('isim') || id;
  const binaIsmi = binaIsmiRaw ? decodeURIComponent(String(binaIsmiRaw)).toUpperCase().trim() : null;

  useEffect(() => {
    const verileriGetir = async () => {
      if (!binaIsmi) return;
      
      setLoading(true);
      try {
        // RADAR KONTROLÜ - SAYFA AÇILDIĞINDA VERİTABANINDAN DURUMU ÇEKER
        const { data: followData } = await supabase
          .from('takipler')
          .select('*')
          .eq('kullanıcı_adi', 'Saltuk Buğra')
          .eq('bina_id', id)
          .maybeSingle();
        
        if (followData) {
          setIsFollowing(true);
        } else {
          setIsFollowing(false);
        }

        const { data: yData, error: yError } = await supabase
          .from('yorumlar')
          .select('*')
          .ilike('bina_adi', binaIsmi) 
          .order('created_at', { ascending: false });

        if (yError) throw yError;

        if (yData && yData.length > 0) {
          const { data: pData } = await supabase.from('profiles').select('*');
          
          const birlesmis = yData.map(y => ({
            ...y,
            profiles: pData?.find(p => p.id === y.kullanıcı_adi) || null
          }));

          const siraliYorumlar = [...birlesmis].sort((a, b) => {
            const aM = a.profiles?.statu === 'muhtar' ? 1 : 0;
            const bM = b.profiles?.statu === 'muhtar' ? 1 : 0;
            return bM - aM;
          });

          setDbYorumlar(siraliYorumlar);

          const anaVeri = yData[yData.length - 1]; 
          if (anaVeri.foto_url) setBinaFotosu(anaVeri.foto_url);
          
          if (anaVeri.acik_adres) {
            const parcalar: string[] = anaVeri.acik_adres.split('|');
            const yerBilgisi: string[] = parcalar[0]?.trim().split(' ');
            if (yerBilgisi) {
                setKonumBilgisi({
                    mahalle: yerBilgisi[0] || "Bilinmiyor",
                    ilce: yerBilgisi[2]?.split('/')[0] || "İSTANBUL"
                });
            }
            const koordParca = parcalar.find((p: string) => p.includes('KOORD:'));
            if (koordParca) setKoordinat(koordParca.replace('KOORD:', '').trim());
          }

          const kategoriToplamlari: { [key: string]: number } = {};
          const kategoriSayaclari: { [key: string]: number } = {};

          yData.forEach((satir) => {
            const pv = typeof satir.puanlar === 'string' ? JSON.parse(satir.puanlar) : satir.puanlar;
            if (pv && typeof pv === 'object') {
              Object.entries(pv).forEach(([kategori, puan]) => {
                const p = Number(puan);
                if (!isNaN(p) && p > 0) {
                  const anahtar = kategori.toUpperCase();
                  kategoriToplamlari[anahtar] = (kategoriToplamlari[anahtar] || 0) + p;
                  kategoriSayaclari[anahtar] = (kategoriSayaclari[anahtar] || 0) + 1;
                }
              });
            }
          });

          const hesaplananKarne = Object.keys(kategoriToplamlari).map(key => ({
            label: key,
            score: (kategoriToplamlari[key] / (kategoriSayaclari[key] || 1)).toFixed(1),
          }));
          setDinamikKarne(hesaplananKarne);
        }
      } catch (err) { console.error("Hata:", err); } finally { setLoading(false); }
    };
    verileriGetir();
  }, [binaIsmi, id]);

  const toggleRadar = async () => {
    setFollowingLoading(true);
    try {
      if (isFollowing) {
        await supabase
          .from('takipler')
          .delete()
          .eq('kullanıcı_adi', 'Saltuk Buğra')
          .eq('bina_id', id);
        setIsFollowing(false);
      } else {
        await supabase
          .from('takipler')
          .insert([{ 
            kullanıcı_adi: 'Saltuk Buğra', 
            bina_id: id, 
            bina_adi: binaIsmi 
          }]);
        setIsFollowing(true);
      }
    } catch (err) {
      console.error("Radar hatası:", err);
    } finally {
      setFollowingLoading(false);
    }
  };

  const BinaKarakterRozetleri = () => {
    const rozetler = [];
    const komsu = Number(dinamikKarne.find(k => k.label.includes("KOMŞU"))?.score || 0);
    const isi = Number(dinamikKarne.find(k => k.label.includes("ISINMA"))?.score || 0);
    const deprem = Number(dinamikKarne.find(k => k.label.includes("DEPREM"))?.score || 0);

    if (komsu >= 4.5) rozetler.push({ label: "Huzurlu Bina", icon: <Heart size={10} />, color: "bg-pink-500" });
    if (isi >= 4.5) rozetler.push({ label: "Sıcak Yuva", icon: <Heart size={10} />, color: "bg-orange-500" });
    if (deprem <= 2.5 && deprem > 0) rozetler.push({ label: "Kritik Yapı", icon: <AlertTriangle size={10} />, color: "bg-red-600" });

    return (
      <div className="flex flex-wrap gap-2 mt-4">
        {rozetler.map((r, i) => (
          <div key={i} className={`${r.color} text-white px-3 py-1 rounded-full text-[9px] font-black uppercase italic flex items-center gap-1 shadow-sm`}>
            {r.icon} {r.label}
          </div>
        ))}
      </div>
    );
  };

  const StatuRozeti = ({ statu }: { statu: string }) => {
    switch (statu) {
      case 'muhtar': return <span className="bg-black text-[#fbbf24] border border-[#fbbf24] px-2 py-0.5 rounded-md text-[9px] font-black italic shadow-[0_0_10px_rgba(251,191,36,0.2)]">MUHTAR 🏆</span>;
      case 'bolge_sakini': return <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md text-[9px] font-black italic">BÖLGE SAKİNİ</span>;
      default: return <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[9px] font-black italic">KOMŞU</span>;
    }
  };

  if (!loading && !binaIsmi) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center">
          <h2 className="font-black italic uppercase text-slate-200 text-2xl mb-4 leading-none text-left">BİNA BULUNAMADI</h2>
          <Link href="/arama" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm uppercase italic">ARAMAYA DÖN</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-black pb-24 text-left">
      <header className="p-4 border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/arama" className="flex items-center gap-2 text-slate-400 hover:text-black transition-all text-[12px] font-bold uppercase tracking-tight italic">
            <ArrowLeft size={14} /> Aramaya Dön
          </Link>
          
          <div className="flex items-center gap-3">
            {/* RADARIMA AL BUTONU VE BİLGİ İKONU BURAYA TAŞINDI */}
            <div className="flex items-center gap-1">
              <button 
                onClick={toggleRadar}
                disabled={followingLoading}
                className={`flex items-center gap-2 px-6 py-3 rounded-full text-[11px] font-black uppercase italic transition-all duration-300 border-2 ${isFollowing ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-600 hover:text-blue-600'}`}
              >
                <Radio size={14} className={isFollowing ? 'animate-pulse' : ''} />
                {isFollowing ? 'RADARIMDA' : 'RADARIMA AL'}
              </button>
              <button onClick={() => setShowInfo(!showInfo)} className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-all">
                <Info size={14} />
              </button>
            </div>

            <Link 
              href={`/yorum-yap?binaAdi=${encodeURIComponent(binaIsmi || "")}`}
              className="bg-blue-600 text-white px-6 py-3 rounded-full text-[11px] font-black uppercase italic hover:bg-black transition-all shadow-xl shadow-blue-100 flex items-center gap-2"
            >
              <MessageSquarePlus size={14} /> DENEYİMİNİ PAYLAŞ
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8 relative">
        {/* RADAR INFO TOOLTIP */}
        {showInfo && (
          <div className="absolute top-4 right-4 z-[100] bg-black text-white p-6 rounded-[2rem] shadow-2xl max-w-xs border border-blue-600/50 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-[11px] font-black italic uppercase text-blue-400 tracking-widest">RADAR İSTİHBARATI</h4>
              <button onClick={() => setShowInfo(false)} className="text-slate-500 hover:text-white"><X size={16} /></button>
            </div>
            <p className="text-[12px] font-medium italic leading-relaxed text-slate-300">
              Bu binayı radarına aldığında, binaya basılan her yeni mühür anında senin paneline istihbarat olarak düşer. Gözün kulağın bu binada olur.
            </p>
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8 mb-12 border-b border-slate-50 pb-8">
          <div className="relative self-start">
            <img 
              src={binaFotosu || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80"} 
              className="w-full md:w-64 h-64 object-cover rounded-[2.5rem] border border-slate-100 shadow-sm"
              alt="Bina"
            />
            <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm p-2 rounded-2xl text-blue-600 shadow-sm"><Camera size={16} /></div>
          </div>

          <div className="flex-1 flex flex-col justify-between">
            <div>
              <h1 className="text-[28px] md:text-[40px] font-black uppercase tracking-tighter mb-2 italic leading-none">{binaIsmi}</h1>
              <p className="flex items-center gap-1 text-slate-400 font-bold mb-2 text-[12px] uppercase italic leading-none">
                <MapPin size={14} className="text-blue-600" /> {konumBilgisi.ilce} / {konumBilgisi.mahalle}
              </p>
              <BinaKarakterRozetleri />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-6">
              {[
                { icon: <Home size={14} />, label: "DURUM", val: "MÜHÜRLENDİ" },
                { icon: <Wind size={14} />, label: "ISINMA", val: "KOMBİ" },
                { icon: <Shield size={14} />, label: "GÜVENLİK", val: "SAKİN ONAYLI" },
                { icon: <Users size={14} />, label: "MÜHÜR", val: dbYorumlar.length + " ADET" }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                  <div className="text-blue-600">{item.icon}</div>
                  <div className="leading-none text-left">
                    <span className="block text-[8px] font-black text-slate-400 uppercase tracking-tighter mb-1 leading-none">{item.label}</span>
                    <span className="font-black text-[11px] italic uppercase tracking-tighter text-black">{item.val}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-12 text-left">
          <h2 className="text-[15px] font-black italic uppercase tracking-tighter mb-4 border-l-4 border-blue-600 pl-3 flex items-center gap-2">
            <MapIcon size={18} className="text-blue-600" /> KONUM <span className="text-blue-600 opacity-40 ml-2">(GOOGLE HARİTA)</span>
          </h2>
          <div className="w-full h-80 rounded-[2.5rem] overflow-hidden">
             <GoogleHarita koordinat={koordinat} isInteractive={false} />
          </div>
        </div>

        <div className="mb-12 text-left">
          <h2 className="text-[15px] font-black italic uppercase tracking-tighter mb-6 border-l-4 border-blue-600 pl-3">Bina Karnesi</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dinamikKarne.length > 0 ? dinamikKarne.map((rate, i) => (
              <div key={i} className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center gap-2 text-center transition-all hover:shadow-md">
                <div className="bg-blue-50 p-2 rounded-xl text-blue-600"><Activity size={14} /></div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter leading-none">{rate.label}</span>
                <div className="flex items-center gap-1">
                  <span className="text-[14px] font-black italic text-black">{rate.score}</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={8} fill={s <= Math.round(Number(rate.score)) ? "#2563eb" : "none"} className={s <= Math.round(Number(rate.score)) ? "text-blue-600" : "text-slate-200"} />
                    ))}
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-4 py-14 bg-slate-50/50 rounded-[2rem] border-2 border-dashed border-slate-100 flex items-center justify-center text-slate-300 font-black italic uppercase text-[11px] text-center w-full">
                 BU BİNANIN HENÜZ KARNESİ OLUŞMAMIŞ
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 pb-10 text-left">
          <h2 className="text-[15px] font-black italic uppercase tracking-tighter mb-6 border-l-4 border-blue-600 pl-3">Sakin Deneyimleri</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {dbYorumlar.map((y, i) => {
              const statu = y.profiles?.statu || 'komsu';
              const isMuhtar = statu === 'muhtar';
              const isVerified = statu === 'bolge_sakini' || isMuhtar;

              return (
                <div key={i} className={`p-6 rounded-[2.5rem] border transition-all flex flex-col gap-4 text-left ${isMuhtar ? 'bg-black text-white border-[#fbbf24] shadow-xl shadow-yellow-900/10' : 'bg-blue-50/30 border-blue-100 shadow-sm'}`}>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[12px] font-black uppercase italic ${isMuhtar ? 'bg-[#fbbf24] text-black' : 'bg-blue-600 text-white'}`}>
                          {y.kullanıcı_adi ? y.kullanıcı_adi[0] : "S"}
                      </div>
                      <div className="text-left">
                        <div className="flex items-center gap-1.5">
                          <h4 className={`text-[12px] font-black uppercase italic tracking-tighter leading-none ${isMuhtar ? 'text-[#fbbf24]' : 'text-blue-600'}`}>{y.kullanıcı_adi || "İSİMSİZ SAKİN"}</h4>
                          {isVerified && <CheckCircle size={14} className={isMuhtar ? 'text-[#fbbf24]' : 'text-blue-500'} />}
                        </div>
                        <div className="mt-1.5"><StatuRozeti statu={statu} /></div>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl ${isMuhtar ? 'bg-white/10' : 'bg-blue-100'}`}>
                      <Star size={12} fill={isMuhtar ? "#fbbf24" : "#2563eb"} className={isMuhtar ? "text-[#fbbf24]" : "text-blue-600"} />
                      <span className={`font-black text-[13px] ${isMuhtar ? 'text-[#fbbf24]' : 'text-blue-600'}`}>{y.puan || 5}</span>
                    </div>
                  </div>
                  <div className={`p-5 rounded-3xl text-[13px] font-medium italic border-l-4 ${isMuhtar ? 'bg-white/5 border-[#fbbf24] text-slate-200' : 'bg-white border-blue-600 text-slate-700'}`}>
                    "{y.yorum_metni}"
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function BuildingDetail() {
  return (
    <Suspense fallback={<div className="p-20 font-black italic uppercase text-center text-slate-200">BİNA KARNESİ HAZIRLANIYOR...</div>}>
      <BinaDetayIcerik />
    </Suspense>
  );
}