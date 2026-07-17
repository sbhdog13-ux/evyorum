"use client";
import { trUpper } from '@/app/lib/utils';

import { useSearchParams } from 'next/navigation';
import { Star, MapPin, ArrowLeft, Home, Wind, Shield, Users, MessageSquarePlus, Activity, Map as MapIcon, Camera, CheckCircle, AlertTriangle, Heart, Radio, Info, X } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { db } from '@/app/lib/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc, serverTimestamp, increment, writeBatch, getDoc } from 'firebase/firestore';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';
import { useLang } from '@/app/lib/i18n';
import { puanHesapla, radarHakki } from '@/app/lib/seviye';
import { agirlik } from '@/app/lib/skor';
import { olay } from '@/app/lib/analytics';
import CevapBolumu from '@/app/components/CevapBolumu';
import Sidebar from '@/app/components/Sidebar';

function BinaDetayIcerik() {
  const searchParams = useSearchParams();
  const { t } = useLang();
  const { user } = useAuth();
  const [oyVerilenler, setOyVerilenler] = useState<{ [id: string]: 'faydali' | 'faydasiz' }>({});
  const kapiDurumu = !user ? 'giris' : !user.emailVerified ? 'dogrula' : null; // blur kapısı

  // Gizli oy: oy belgesi alt koleksiyonda (kim oyladı görünmez), sayaç yorumda (herkes görür)
  const oyVer = async (yorumId: string, tip: 'faydali' | 'faydasiz') => {
    if (kapiDurumu === 'giris') { window.location.href = '/giris'; return; }
    if (kapiDurumu || oyVerilenler[yorumId]) return;
    setOyVerilenler(prev => ({ ...prev, [yorumId]: tip }));
    try {
      const paket = writeBatch(db);
      paket.set(doc(db, 'yorumlar', yorumId, 'oylar', user!.uid), { tip, created_at: serverTimestamp() });
      paket.update(doc(db, 'yorumlar', yorumId), {
        faydali_sayisi: increment(tip === 'faydali' ? 1 : 0),
        faydasiz_sayisi: increment(tip === 'faydasiz' ? 1 : 0),
      });
      await paket.commit();
      setDbYorumlar(prev => prev.map((y: any) => y.id === yorumId
        ? { ...y, [tip === 'faydali' ? 'faydali_sayisi' : 'faydasiz_sayisi']: (y[tip === 'faydali' ? 'faydali_sayisi' : 'faydasiz_sayisi'] || 0) + 1 }
        : y));
    } catch { setOyVerilenler(prev => { const y = { ...prev }; delete y[yorumId]; return y; }); }
  };

  const sayacYaz = (n: number) => n > 99 ? '99+' : n > 0 ? String(n) : '';

  const sikayetEt = async (yorumId: string) => {
    if (!user) { window.location.href = '/giris'; return; }
    if (!confirm(t('yorum.sikayetSor'))) return;
    try {
      await addDoc(collection(db, 'sikayetler'), {
        yorum_id: yorumId, bina_adi: binaIsmi, kullanici_id: user.uid, created_at: serverTimestamp(),
      });
      alert(t('yorum.sikayetTesekkur'));
    } catch { alert(t('giris.hataGenel')); }
  };



  const [dbYorumlar, setDbYorumlar] = useState<any[]>([]);
  const [dinamikKarne, setDinamikKarne] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [binaFotosu, setBinaFotosu] = useState<string | null>(null);
  const [koordinat, setKoordinat] = useState<string>("41.0082, 28.9784");
  const [konumBilgisi, setKonumBilgisi] = useState({ ilce: "İSTANBUL", mahalle: "Bilinmiyor" });
  const [isFollowing, setIsFollowing] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [followingLoading, setFollowingLoading] = useState(false);
  const [radarDocId, setRadarDocId] = useState<string | null>(null);
  const [poilar, setPoilar] = useState<{ ad: string; tur: string; mesafe: number }[]>([]);
  const [aktifKat, setAktifKat] = useState<string[]>(['saglik', 'egitim', 'ulasim', 'market']);

  // Yakın çevre analizi — Overpass API (mobil ile aynı sorgu)
  useEffect(() => {
    const [lat, lng] = koordinat.split(',').map(v => parseFloat(v.trim()));
    if (isNaN(lat) || koordinat === "41.0082, 28.9784") return;
    const sorgu = `[out:json][timeout:20];(node["amenity"~"hospital|clinic|pharmacy"](around:1500,${lat},${lng});node["amenity"~"school|university"](around:1500,${lat},${lng});node["shop"="supermarket"](around:800,${lat},${lng});node["highway"="bus_stop"](around:800,${lat},${lng});node["railway"~"station|subway_entrance"](around:2000,${lat},${lng}););out body;`;
    fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: `data=${encodeURIComponent(sorgu)}`, headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
      .then(r => r.json())
      .then((json: any) => {
        const tur = (t: any) => /hospital|clinic|pharmacy/.test(t.amenity || '') ? 'saglik' : /school|university/.test(t.amenity || '') ? 'egitim' : t.shop === 'supermarket' ? 'market' : 'ulasim';
        const mesafe = (pLat: number, pLng: number) => { const R = 6371000, dLa = (pLat - lat) * Math.PI / 180, dLo = (pLng - lng) * Math.PI / 180; const a = Math.sin(dLa / 2) ** 2 + Math.cos(lat * Math.PI / 180) * Math.cos(pLat * Math.PI / 180) * Math.sin(dLo / 2) ** 2; return Math.round(2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))); };
        setPoilar((json.elements || []).filter((e: any) => e.lat && e.lon).map((e: any) => ({ ad: e.tags?.name || ({ saglik: 'Sağlık Noktası', egitim: 'Okul', market: 'Market', ulasim: 'Durak' } as any)[tur(e.tags || {})], tur: tur(e.tags || {}), mesafe: mesafe(e.lat, e.lon) })).sort((a: any, b: any) => a.mesafe - b.mesafe).slice(0, 12));
      }).catch(() => {});
  }, [koordinat]);

  const binaIsmiRaw = searchParams?.get('isim');
  const binaIsmi = binaIsmiRaw ? trUpper(decodeURIComponent(String(binaIsmiRaw))).trim() : null;

  useEffect(() => {
    const verileriGetir = async () => {
      if (!binaIsmi) return;
      setLoading(true);
      try {
        // RADAR KONTROLÜ
        if (user) {
          const radarQ = query(
            collection(db, 'takipler'),
            where('kullanici_id', '==', user.uid),
            where('bina_adi', '==', binaIsmi)
          );
          const radarSnap = await getDocs(radarQ);
          if (!radarSnap.empty) {
            setIsFollowing(true);
            setRadarDocId(radarSnap.docs[0].id);
          } else {
            setIsFollowing(false);
            setRadarDocId(null);
          }
        }

        // YORUMLARI ÇEK — hem yeni_bina_adi hem bina_adi (mobil ile aynı)
        const [yeniSnap, eskiSnap] = await Promise.all([
          getDocs(query(collection(db, 'yorumlar'), where('yeni_bina_adi', '==', binaIsmi))),
          getDocs(query(collection(db, 'yorumlar'), where('bina_adi', '==', binaIsmi))),
        ]);
        const yorumMap: { [id: string]: any } = {};
        [...yeniSnap.docs, ...eskiSnap.docs].forEach(d => { yorumMap[d.id] = { id: d.id, ...d.data() }; });
        const yorumlar = Object.values(yorumMap);

        // Tarihe göre sırala
        yorumlar.sort((a: any, b: any) => {
          const aTime = a.created_at?.seconds || 0;
          const bTime = b.created_at?.seconds || 0;
          return bTime - aTime;
        });

        setDbYorumlar(yorumlar);

        // FOTOĞRAF VE KONUM
        const sonYorum = yorumlar[yorumlar.length - 1] as any;
        if (sonYorum?.foto_url) setBinaFotosu(sonYorum.foto_url);

        // Konum — önce yapısal alanlar, sonra acik_adres fallback (mobil ile aynı öncelik)
        const konumluKayit = yorumlar.find((y: any) => y.ilce || y.koordinat) as any || sonYorum;
        if (konumluKayit?.ilce || konumluKayit?.mahalle) {
          setKonumBilgisi({
            mahalle: konumluKayit.mahalle || "Bilinmiyor",
            ilce: konumluKayit.ilce || "İSTANBUL",
          });
        } else if (sonYorum?.acik_adres) {
          const parcalar: string[] = sonYorum.acik_adres.split('|');
          const yerBilgisi: string[] = parcalar[0]?.trim().split(' ');
          if (yerBilgisi) {
            setKonumBilgisi({
              mahalle: yerBilgisi[0] || "Bilinmiyor",
              ilce: yerBilgisi[2]?.split('/')[0] || "İSTANBUL"
            });
          }
        }
        if (konumluKayit?.koordinat?.lat && konumluKayit?.koordinat?.lng) {
          setKoordinat(`${konumluKayit.koordinat.lat}, ${konumluKayit.koordinat.lng}`);
        } else if (sonYorum?.acik_adres) {
          const koordParca = sonYorum.acik_adres.split('|').find((p: string) => p.includes('KOORD:'));
          if (koordParca) setKoordinat(koordParca.replace('KOORD:', '').trim());
        }

        // KARNEYİ HESAPLA
        const kategoriToplamlari: { [key: string]: number } = {};
        const kategoriSayaclari: { [key: string]: number } = {};

        yorumlar.forEach((satir: any) => {
          const w = agirlik(satir.baglanti_tipi); // orada yaşayanın puanı daha ağır basar
          const pv = typeof satir.puanlar === 'string' ? JSON.parse(satir.puanlar) : satir.puanlar;
          if (pv && typeof pv === 'object') {
            Object.entries(pv).forEach(([kategori, puan]) => {
              const p = Number(puan);
              if (!isNaN(p) && p > 0) {
                const anahtar = trUpper(kategori);
                kategoriToplamlari[anahtar] = (kategoriToplamlari[anahtar] || 0) + p * w;
                kategoriSayaclari[anahtar] = (kategoriSayaclari[anahtar] || 0) + w;
              }
            });
          }
        });

        const hesaplananKarne = Object.keys(kategoriToplamlari).map(key => ({
          label: key,
          score: (kategoriToplamlari[key] / (kategoriSayaclari[key] || 1)).toFixed(1),
        }));
        setDinamikKarne(hesaplananKarne);

      } catch (err) { console.error("Hata:", err); } 
      finally { setLoading(false); }
    };
    verileriGetir();
  }, [binaIsmi, user]);

  // Kendi oylarımı yükle (buton durumları — yalnız kendi oy belgelerim okunabilir)
  useEffect(() => {
    if (!user || dbYorumlar.length === 0) return;
    Promise.all(dbYorumlar.filter((y: any) => y.id).map(async (y: any) => {
      try {
        const oy = await getDoc(doc(db, 'yorumlar', y.id, 'oylar', user.uid));
        return oy.exists() ? [y.id, oy.data().tip] as [string, any] : null;
      } catch { return null; }
    })).then(sonuclar => {
      const m: { [k: string]: 'faydali' | 'faydasiz' } = {};
      sonuclar.forEach(x => { if (x) m[x[0]] = x[1]; });
      if (Object.keys(m).length) setOyVerilenler(prev => ({ ...m, ...prev }));
    });
  }, [user, dbYorumlar.length]);

  const toggleRadar = async () => {
    if (!user) {
      alert("Radar özelliği için giriş yapman gerekiyor!");
      return;
    }
    setFollowingLoading(true);
    try {
      if (isFollowing && radarDocId) {
        await deleteDoc(doc(db, 'takipler', radarDocId));
        setIsFollowing(false);
        setRadarDocId(null);
      } else {
        // Rütbeye göre radar kotası — sunucu kuralı gelene kadar arayüz denetimi
        const [takipSnap, yorumSnap] = await Promise.all([
          getDocs(query(collection(db, 'takipler'), where('kullanici_id', '==', user.uid))),
          getDocs(query(collection(db, 'yorumlar'), where('kullanici_id', '==', user.uid))),
        ]);
        const { toplam } = puanHesapla(yorumSnap.docs.map(d => d.data()), takipSnap.size);
        const hak = radarHakki(toplam);
        if (hak !== -1 && takipSnap.size >= hak) {
          alert(t('seviye.radarDolu'));
          setFollowingLoading(false);
          return;
        }
        const newDoc = await addDoc(collection(db, 'takipler'), {
          kullanici_id: user.uid,
          kullanici_adi: user.displayName || user.email,
          bina_id: binaIsmi,
          bina_adi: binaIsmi,
          created_at: serverTimestamp()
        });
        setIsFollowing(true);
        setRadarDocId(newDoc.id);
        olay("radara_alindi", { bina: binaIsmi });
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
      case 'muhtar': return <span className="bg-[#023E56] text-[#fbbf24] border border-[#fbbf24] px-2 py-0.5 rounded-md text-[9px] font-black italic">MUHTAR 🏆</span>;
      case 'bolge_sakini': return <span className="bg-blue-600 text-white px-2 py-0.5 rounded-md text-[9px] font-black italic">BÖLGE SAKİNİ</span>;
      default: return <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[9px] font-black italic">KOMŞU</span>;
    }
  };

  if (!loading && !binaIsmi) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-6">
        <div className="text-center">
          <h2 className="font-black italic uppercase text-slate-200 text-2xl mb-4">{t('bina.bulunamadi')}</h2>
          <Link href="/arama" className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold text-sm uppercase italic">ARAMAYA DÖN</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="lg:pl-80 min-h-screen bg-white font-sans text-black pb-24 text-left">
      <Sidebar />
      <header className="p-4 border-b border-slate-50 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <Link href="/arama" className="flex items-center gap-2 text-slate-400 hover:text-black transition-all text-[12px] font-bold uppercase tracking-tight italic">
            <ArrowLeft size={14} /> <span className="hidden md:inline">{t('bina.aramayaDon')}</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <button 
                onClick={toggleRadar}
                disabled={followingLoading}
                className={`flex items-center gap-2 px-3 md:px-6 py-2.5 md:py-3 rounded-full text-[10px] md:text-[11px] font-black uppercase italic transition-all duration-300 border-2 ${isFollowing ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-200' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-600 hover:text-blue-600'}`}
              >
                <Radio size={14} className={isFollowing ? 'animate-pulse' : ''} />
                <span className="hidden sm:inline">{isFollowing ? t('bina.radarimda') : t('bina.radaraAl')}</span>
              </button>
              <button onClick={() => setShowInfo(!showInfo)} className="p-3 bg-slate-50 text-slate-400 rounded-full hover:bg-[#e8f3fa] hover:text-blue-600 transition-all">
                <Info size={14} />
              </button>
            </div>

            <Link 
              href={`/yorum-yap?binaAdi=${encodeURIComponent(binaIsmi || "")}`}
              className="bg-blue-600 text-white px-6 py-3 rounded-full text-[11px] font-black uppercase italic hover:bg-[#023E56] transition-all shadow-xl shadow-blue-100 flex items-center gap-2"
            >
              <MessageSquarePlus size={14} /> <span className="hidden sm:inline">{t('bina.paylas')}</span><span className="sm:hidden">{t('bina.paylasKisa')}</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-8 relative">
        {showInfo && (
          <div className="absolute top-4 right-4 z-[100] bg-[#023E56] text-white p-6 rounded-[2rem] shadow-2xl max-w-xs border border-blue-600/50 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-start mb-2">
              <h4 className="text-[11px] font-black italic uppercase text-blue-400 tracking-widest">{t('bina.radarInfo')}</h4>
              <button onClick={() => setShowInfo(false)} className="text-slate-500 hover:text-white"><X size={16} /></button>
            </div>
            <p className="text-[12px] font-medium italic leading-relaxed text-slate-300">
              {t('bina.radarInfoText')}
            </p>
          </div>
        )}

        {/* Özet puan kartı — mobil ile aynı */}
        {(() => {
          const ort = dinamikKarne.length > 0
            ? Number((dinamikKarne.reduce((a, k) => a + Number(k.score), 0) / dinamikKarne.length).toFixed(1))
            : 0;
          const sakinSayisi = dbYorumlar.filter((y: any) => y.baglanti_tipi === 'sakin').length;
          const sorun = dbYorumlar.reduce((a: number, y: any) => a + (y.red_flags?.length || 0), 0);
          const arti = dbYorumlar.reduce((a: number, y: any) => a + (y.green_flags?.length || 0), 0);
          return (
            <div className="bg-slate-50 border border-slate-100 rounded-[2.5rem] p-8 mb-10">
              <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                  <div className="text-[52px] font-black italic text-blue-600 leading-none">{ort}</div>
                  <div className="flex gap-1 mt-2">
                    {[1, 2, 3, 4, 5].map(p => (
                      <Star key={p} size={18} className="text-blue-600" fill={p <= Math.round(ort) ? '#2563eb' : 'none'} />
                    ))}
                  </div>
                </div>
                <div className="flex gap-8">
                  <div className="text-center">
                    <div className="text-[28px] font-black italic">{dbYorumlar.length}</div>
                    <div className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase mt-1">{t('bina.muhur')}</div>
                  </div>
                  <div className="text-center border-l border-slate-200 pl-8">
                    <div className="text-[28px] font-black italic">{sakinSayisi}</div>
                    <div className="text-[9px] font-black text-slate-400 tracking-[0.2em] uppercase mt-1">{t('bina.sakin')}</div>
                  </div>
                </div>
              </div>
              {(sorun > 0 || arti > 0) && (
                <div className="flex gap-3 mt-5">
                  {sorun > 0 && <span className="bg-white border border-red-200 text-red-600 rounded-xl px-4 py-1.5 text-[11px] font-black uppercase italic">🚩 {sorun} {t('bina.sorun')}</span>}
                  {arti > 0 && <span className="bg-white border border-green-200 text-green-700 rounded-xl px-4 py-1.5 text-[11px] font-black uppercase italic">✅ {arti} {t('bina.arti')}</span>}
                </div>
              )}
            </div>
          );
        })()}

        <div className="flex flex-col md:flex-row gap-8 mb-12 border-b border-slate-50 pb-8">
          <div className="relative self-start">
            <img 
              src={binaFotosu || "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80"} 
              onError={(e: any) => { e.currentTarget.src = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=400&q=80"; e.currentTarget.onerror = null; }}
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
                { icon: <Home size={14} />, label: t('bina.durum'), val: t('bina.muhurlendi') },
                { icon: <MapPin size={14} />, label: t('bina.ilce'), val: konumBilgisi.ilce },
                { icon: <Shield size={14} />, label: t('bina.sakinOnayi'), val: dbYorumlar.filter((y: any) => y.baglanti_tipi === 'sakin').length  + " " + t('bina.sakin') },
                { icon: <Users size={14} />, label: t('bina.muhur'), val: dbYorumlar.length + ' ' + t('bina.adet') }
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
            <MapIcon size={18} className="text-blue-600" /> {t('bina.konum')}
          </h2>
          <div className="w-full h-80 rounded-[2.5rem] overflow-hidden border border-slate-100">
            {(() => {
              const [lat, lng] = koordinat.split(',').map(v => parseFloat(v.trim()));
              const d = 0.004;
              return (
                <iframe
                  title="Konum"
                  className="w-full h-full border-0"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - d},${lat - d},${lng + d},${lat + d}&layer=mapnik&marker=${lat},${lng}`}
                />
              );
            })()}
          </div>
        </div>

        {poilar.length > 0 && (
          <div className="mb-12 text-left">
            <h2 className="text-[15px] font-black italic uppercase tracking-tighter mb-4 border-l-4 border-blue-600 pl-3">{t('bina.cevre')}</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {[
                { id: 'saglik', emoji: '🏥', etiket: t('bina.saglik') },
                { id: 'egitim', emoji: '🎓', etiket: t('bina.egitim') },
                { id: 'ulasim', emoji: '🚌', etiket: t('bina.ulasim') },
                { id: 'market', emoji: '🛒', etiket: t('bina.market') },
              ].map(kat => {
                const aktif = aktifKat.includes(kat.id);
                const sayi = poilar.filter(p => p.tur === kat.id).length;
                return (
                  <button key={kat.id} onClick={() => setAktifKat(prev => aktif ? prev.filter(k => k !== kat.id) : [...prev, kat.id])}
                    className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl border-2 text-[10px] font-black uppercase italic transition-all ${aktif ? 'border-blue-600 bg-[#e8f3fa] text-blue-600' : 'border-slate-200 text-slate-400'}`}>
                    <span>{kat.emoji}</span> {kat.etiket}{sayi > 0 && <span className="opacity-60">{sayi}</span>}
                  </button>
                );
              })}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {poilar.filter(p => aktifKat.includes(p.tur)).map((p, i) => {
                const b: any = { saglik: ['🏥', 'text-red-600'], egitim: ['🎓', 'text-purple-600'], market: ['🛒', 'text-green-600'], ulasim: ['🚌', 'text-orange-500'] }[p.tur] || ['📍', 'text-slate-400'];
                return (
                  <div key={i} className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3">
                    <span className="text-[15px]">{b[0]}</span>
                    <span className="flex-1 text-[12px] font-bold text-slate-700 truncate">{p.ad}</span>
                    <span className={`text-[12px] font-black ${b[1]}`}>{p.mesafe < 1000 ? `${p.mesafe}m` : `${(p.mesafe / 1000).toFixed(1)}km`}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="mb-12 text-left">
          <h2 className="text-[15px] font-black italic uppercase tracking-tighter mb-6 border-l-4 border-blue-600 pl-3">{t('bina.karne')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {dinamikKarne.length > 0 ? dinamikKarne.map((rate, i) => (
              <div key={i} className="bg-white p-4 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col items-center gap-2 text-center transition-all hover:shadow-md">
                <div className="bg-[#e8f3fa] p-2 rounded-xl text-blue-600"><Activity size={14} /></div>
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
                {t('bina.karneYok')}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4 pb-10 text-left">
          <h2 className="text-[15px] font-black italic uppercase tracking-tighter mb-6 border-l-4 border-blue-600 pl-3">{t('bina.deneyimler')}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            {dbYorumlar.filter((y: any) =>
              !(y.yorum_metni === 'BİNA MÜHÜRLENDİ.' && (!y.puanlar || Object.keys(y.puanlar).length === 0))
            ).map((y: any, i) => {
              const bulanik = !!kapiDurumu && i >= 1; // ilk deneyim herkese açık — SEO + tadımlık
              return (
                <div key={i} className="relative p-6 rounded-[2.5rem] border transition-all flex flex-col gap-4 text-left bg-[#dcecf7]/30 border-[#A1CDE9] shadow-sm overflow-hidden">
                  {bulanik && (
                    <div className="absolute inset-0 z-20 backdrop-blur-[7px] bg-white/40 flex flex-col items-center justify-center gap-3 p-6 text-center">
                      <p className="text-[12px] font-black italic uppercase text-[#023E56]">{kapiDurumu === 'giris' ? t('kapi.girisYap') : t('kapi.dogrula')}</p>
                      {kapiDurumu === 'giris' && (
                        <Link href="/giris" className="bg-[#023E56] text-white text-[10px] font-black italic uppercase tracking-widest px-5 py-3 rounded-xl">{t('kapi.girisBtn')}</Link>
                      )}
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-[12px] font-black uppercase italic bg-blue-600 text-white">
                        {y.kullanici_adi ? y.kullanici_adi[0] : "A"}
                      </div>
                      <div className="text-left">
                        <h4 className="text-[12px] font-black uppercase italic tracking-tighter leading-none text-blue-600">
                          {y.kullanici_adi || "Anonim Sakin"}
                        </h4>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          {y.gps_onay && <span className="bg-[#e8f3fa] border border-[#A1CDE9] text-[#023E56] px-2 py-0.5 rounded-md text-[9px] font-black italic">📍 {t('yorum.gpsOnayli')}</span>}
                          {y.baglanti_tipi === 'sakin' ? <span className="bg-green-50 border border-green-200 text-green-700 px-2 py-0.5 rounded-md text-[9px] font-black italic">{t('bina.sakinRozet')}</span>
                            : y.baglanti_tipi === 'eski_sakin' ? <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md text-[9px] font-black italic">{t('bina.eskiSakinRozet')}</span>
                            : <span className="bg-slate-100 text-slate-400 px-2 py-0.5 rounded-md text-[9px] font-black italic">{t('bina.ziyaretciRozet')}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-100">
                      <Star size={12} fill="#2563eb" className="text-blue-600" />
                      <span className="font-black text-[13px] text-blue-600">{y.puan ?? '—'}</span>
                    </div>
                  </div>
                  <div className="p-5 rounded-3xl text-[13px] font-medium italic border-l-4 bg-white border-blue-600 text-slate-700">
                    "{y.yorum_metni}"
                  </div>
                  {y.puanlar && Object.keys(y.puanlar).length > 0 && (
                    <div className="flex gap-2">
                      {Object.entries(y.puanlar).slice(0, 2).map(([k, v]: any) => (
                        <div key={k} className="bg-white border border-slate-100 rounded-xl px-2.5 py-1 text-center">
                          <div className="text-[8px] font-black text-slate-400 uppercase">{k.split(' ')[0]}</div>
                          <div className="text-[12px] font-black text-blue-600">{v}</div>
                        </div>
                      ))}
                    </div>
                  )}
                  {!!y.foto_url && y.foto_onay === 'onaylandi' && (
                    <img src={y.foto_url} alt="Kanıt" className="w-full h-52 object-cover rounded-3xl border border-slate-100" />
                  )}
                  {!!y.foto_url && y.foto_onay === 'bekliyor' && (
                    <div className="w-full py-3 bg-slate-50 border border-dashed border-slate-200 rounded-2xl text-center text-[10px] font-black italic uppercase text-slate-400 tracking-widest">📷 {t('yorum.fotoBekliyor')}</div>
                  )}
                  {((y.red_flags?.length > 0) || (y.green_flags?.length > 0)) && (
                    <div className="flex flex-wrap gap-2">
                      {(y.red_flags || []).map((f: string) => (
                        <span key={f} className="bg-red-50 border border-red-200 text-red-600 rounded-xl px-3 py-1 text-[10px] font-black uppercase italic">🚩 {f}</span>
                      ))}
                      {(y.green_flags || []).map((f: string) => (
                        <span key={f} className="bg-green-50 border border-green-200 text-green-700 rounded-xl px-3 py-1 text-[10px] font-black uppercase italic">✅ {f}</span>
                      ))}
                    </div>
                  )}
                  {!bulanik && y.id && (
                    <div className="flex items-center gap-2 pt-1 flex-wrap">
                      <button onClick={() => oyVer(y.id, 'faydali')} disabled={!!oyVerilenler[y.id]}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black italic uppercase border transition-all ${oyVerilenler[y.id] === 'faydali' ? 'bg-green-600 text-white border-green-600' : 'bg-white border-slate-200 text-slate-500 hover:border-green-600 hover:text-green-700'}`}>
                        👍 {t('yorum.faydali')} {sayacYaz(y.faydali_sayisi || 0)}
                      </button>
                      <button onClick={() => oyVer(y.id, 'faydasiz')} disabled={!!oyVerilenler[y.id]}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-[10px] font-black italic uppercase border transition-all ${oyVerilenler[y.id] === 'faydasiz' ? 'bg-slate-600 text-white border-slate-600' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400'}`}>
                        👎 {t('yorum.faydasiz')} {sayacYaz(y.faydasiz_sayisi || 0)}
                      </button>
                      <div className="flex-1" />
                      <button onClick={() => sikayetEt(y.id)}
                        className="px-3 py-2 rounded-xl text-[10px] font-black italic uppercase text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all">
                        🚩 {t('yorum.sikayet')}
                      </button>
                    </div>
                  )}
                  {!bulanik && y.id && <CevapBolumu yorumId={y.id} binaAdi={binaIsmi} />}
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