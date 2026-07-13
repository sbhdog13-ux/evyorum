"use client";
import { trUpper } from '@/app/lib/utils';
import React, { useState, useEffect, Suspense } from 'react';
import { Home, Camera, PlusCircle, CheckCircle2, UserCircle, UserX, Building2, UserCheck, History, Eye } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/app/lib/firebase';
import { collection, getDocs, addDoc, serverTimestamp, query, where, limit } from 'firebase/firestore';
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/app/contexts/AuthContext';
import { takipcilariBildir } from '@/app/lib/notifications';
import { useLang } from '@/app/lib/i18n';
import DogrulamaKapisi from '@/app/components/DogrulamaKapisi';

function YorumFormu() {
  const router = useRouter();
  const { t } = useLang();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const [binaAdi, setBinaAdi] = useState("");
  const [kayitliBinalar, setKayitliBinalar] = useState<string[]>([]);
  const [filtrelenmişBinalar, setFiltrelenmişBinalar] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [yorum, setYorum] = useState("");
  const [loading, setLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [baglantiTipi, setBaglantiTipi] = useState<'sakin' | 'eski_sakin' | 'ziyaretci'>('sakin');
  
  const [categories, setCategories] = useState([
    { id: 1, label: "ISINMA / YALITIM", score: 3 },
    { id: 2, label: "DEPREM DAYANIKLILIĞI", score: 3 },
    { id: 3, label: "KOMŞULUK İLİŞKİLERİ", score: 3 },
    { id: 4, label: "YÖNETİM / AİDAT", score: 3 }
  ]);
  const [newCatName, setNewCatName] = useState("");
  const [redFlags, setRedFlags] = useState<string[]>([]);
  const [greenFlags, setGreenFlags] = useState<string[]>([]);
  const [yeniRedFlag, setYeniRedFlag] = useState("");
  const [yeniGreenFlag, setYeniGreenFlag] = useState("");

  const RED_PRESET = ['BÖCEKLENMİŞ', 'ASANSÖR BOZUK', 'KÜF / NEM', 'GÜRÜLTÜ', 'FİBER YOK', 'SU BASKINI'];
  const GREEN_PRESET = ['SESSİZ MAHALLE', 'FİBER VAR', 'İYİ YÖNETİM', 'KOMŞULAR İYİ', 'YENİ BİNA', 'ULAŞIM KOLAY'];

  useEffect(() => {
    if (!authLoading && !user) {
      alert("Yorum yapmak için giriş yapman gerekiyor!");
      router.push('/giris');
    }
  }, [user, authLoading]);

  useEffect(() => {
    const binalariGetir = async () => {
      const snap = await getDocs(collection(db, 'yorumlar'));
      const uniqueNames = Array.from(new Set(
        snap.docs.map(d => trUpper(((d.data().yeni_bina_adi || d.data().bina_adi) || '').toString()).trim())
      )).filter(Boolean) as string[];
      setKayitliBinalar(uniqueNames);
    };
    binalariGetir();
  }, []);

  useEffect(() => {
    const queryBina = searchParams.get('binaAdi');
    if (queryBina) {
      setBinaAdi(trUpper(decodeURIComponent(queryBina)).trim());
    }
  }, [searchParams]);

  const handleBinaYazimi = (val: string) => {
    const uppercaseVal = trUpper(val);
    setBinaAdi(uppercaseVal);
    if (uppercaseVal.length > 0) {
      setFiltrelenmişBinalar(kayitliBinalar.filter(b => b.includes(uppercaseVal)));
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const binaSec = (isim: string) => {
    setBinaAdi(trUpper(isim).trim());
    setShowDropdown(false);
  };

  const handleScoreChange = (catId: number, value: number) => {
    setCategories(categories.map(cat => cat.id === catId ? { ...cat, score: value } : cat));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const addNewCategory = () => {
    if (!newCatName) return;
    setCategories([...categories, { id: Date.now(), label: trUpper(newCatName), score: 3 }]);
    setNewCatName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const temizBinaAdi = trUpper(binaAdi).trim();
    if (!temizBinaAdi || !yorum.trim()) return alert("Bina adı ve deneyim metni zorunludur!");
    if (!user && !isAnonymous) {
      alert("Yorum yapmak için giriş yapman gerekiyor!");
      router.push('/giris');
      return;
    }

    const gecerliKullaniciAdi = isAnonymous ? "Anonim Sakin" : (user?.displayName || user?.email?.split('@')[0] || "Anonim");
    const gecerliKullaniciId = isAnonymous ? null : (user?.uid || null);

    setLoading(true);

    const puanlarVerisi = categories.reduce((acc: any, curr) => {
      acc[curr.label] = curr.score;
      return acc;
    }, {});

    const ortalamaPuan = Number((categories.reduce((acc, curr) => acc + curr.score, 0) / categories.length).toFixed(1));

    try {
      // Kanıt fotoğrafını Storage'a yükle (mobil ile aynı yol)
      let foto_url = '';
      if (selectedFile) {
        try {
          const storage = getStorage();
          const path = `yorumlar/${user?.uid || 'anon'}/${Date.now()}.jpg`;
          const ref = storageRef(storage, path);
          await uploadBytes(ref, selectedFile);
          foto_url = await getDownloadURL(ref);
        } catch (e) { console.error('Foto yükleme hatası:', e); }
      }

      // Binanın konum bilgilerini mevcut kayıttan kopyala (mobil ile aynı şema)
      const binaKonum = await getDocs(query(collection(db, 'yorumlar'), where('yeni_bina_adi', '==', temizBinaAdi), limit(1)));
      const konum = binaKonum.docs[0]?.data() || {};

      // Bina haritada yoksa konum eklemeyi öner (mobil ile aynı akış)
      if (!konum.koordinat) {
        const konumEkle = confirm(`"${temizBinaAdi}" henüz haritaya eklenmemiş. Konumunu eklemek ister misin? (Haritada görünmesi için önerilir)\n\nTamam: Konum ekle · Vazgeç: Konumsuz devam et`);
        if (konumEkle) {
          setLoading(false);
          router.push(`/bina-olustur?binaAdi=${encodeURIComponent(temizBinaAdi)}`);
          return;
        }
      }

      // GPS güven sinyali: kullanıcı bina yakınındaysa (150 m) mühre "konumdan onaylı" işareti
      let gps_onay = false;
      if (konum.koordinat?.lat && navigator.geolocation) {
        try {
          const poz: any = await new Promise((res, rej) =>
            navigator.geolocation.getCurrentPosition(res, rej, { timeout: 5000, maximumAge: 60000 }));
          const R = 6371000, d2r = Math.PI / 180;
          const dLat = (poz.coords.latitude - konum.koordinat.lat) * d2r;
          const dLng = (poz.coords.longitude - konum.koordinat.lng) * d2r;
          const a = Math.sin(dLat/2)**2 + Math.cos(konum.koordinat.lat*d2r) * Math.cos(poz.coords.latitude*d2r) * Math.sin(dLng/2)**2;
          const mesafe = 2 * R * Math.asin(Math.sqrt(a));
          gps_onay = mesafe <= 150;
        } catch {} // izin yok/zaman aşımı — sorun değil, sinyal opsiyonel
      }

      await addDoc(collection(db, 'yorumlar'), {
        bina_adi: temizBinaAdi,
        yeni_bina_adi: temizBinaAdi,
        il: konum.il || 'İSTANBUL',
        ilce: konum.ilce || '',
        mahalle: konum.mahalle || '',
        koordinat: konum.koordinat || null,
        yorum_metni: yorum.trim(),
        kullanici_adi: gecerliKullaniciAdi,
        kullanici_id: gecerliKullaniciId,
        puan: ortalamaPuan,
        puanlar: puanlarVerisi,
        baglanti_tipi: baglantiTipi,
        foto_url,
        gps_onay,
        faydali_sayisi: 0,
        red_flags: redFlags,
        green_flags: greenFlags,
        created_at: serverTimestamp()
      });

      takipcilariBildir(temizBinaAdi, gecerliKullaniciAdi).catch(() => {});
      alert("BİNA MÜHÜRLENDİ! 🎉");
      router.push(`/bina?isim=${encodeURIComponent(temizBinaAdi)}`);
    } catch (err: any) {
      alert("Hata: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!authLoading && user && !user.emailVerified) return <DogrulamaKapisi />;
  if (authLoading) return <div className="min-h-screen flex items-center justify-center font-black italic uppercase text-slate-200">Yükleniyor...</div>;

  return (
    <div className="min-h-screen bg-white p-4 md:p-8 text-black font-sans text-left">
      <div className="max-w-4xl mx-auto text-left">
        <header className="mb-12 flex justify-between items-center border-b border-slate-100 pb-6 text-left">
          <Link href="/" className="flex items-center gap-2 group text-left">
            <Home size={20} className="text-blue-600 group-hover:scale-110 transition-transform text-left" /> 
            <span className="text-xl font-black uppercase italic tracking-tighter text-left">BULEVİNİ</span>
          </Link>
          <div className="text-[10px] font-black uppercase italic text-slate-400 bg-slate-50 px-3 py-1 rounded-full text-left">
            Güvenli Mühürleme Odası
          </div>
        </header>

        <main className="text-left">
          <h1 className="text-[35px] md:text-[50px] font-black uppercase italic leading-[0.9] tracking-tighter mb-4 text-left">
            {t('muhurle.baslik1')} <span className="text-blue-600">{t('muhurle.baslik2')}</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase italic text-[12px] mb-12 tracking-tight text-left">
            {t('muhurle.alt')}
          </p>

          <form onSubmit={handleSubmit} className="space-y-10 text-left">
            <section className="relative text-left">
              <div className="bg-slate-50 p-1 rounded-[2rem] border border-slate-100 flex items-center px-6 focus-within:border-blue-600 transition-colors text-left">
                <Building2 className="text-slate-300" size={24} />
                <input 
                  value={binaAdi} 
                  onChange={(e) => handleBinaYazimi(e.target.value)} 
                  onFocus={() => setShowDropdown(true)}
                  placeholder={t('muhurle.binaSec')} 
                  className="w-full p-6 bg-transparent font-black text-2xl uppercase italic outline-none placeholder:text-slate-200 text-left"
                />
              </div>
              {showDropdown && (filtrelenmişBinalar.length > 0 || binaAdi.length >= 2) && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-black rounded-[2rem] shadow-2xl overflow-hidden text-left">
                  {filtrelenmişBinalar.length === 0 && binaAdi.length >= 2 && (
                    <button type="button"
                      onClick={() => { setShowDropdown(false); router.push(`/bina-olustur?binaAdi=${encodeURIComponent(binaAdi)}`); }}
                      className="w-full p-5 font-black italic uppercase text-[14px] bg-[#023E56] text-white flex justify-between items-center text-left">
                      "{binaAdi}" — {t('muhurle.yeniOlustur')}
                      <Building2 size={18} className="text-blue-400" />
                    </button>
                  )}
                  {filtrelenmişBinalar.map((b, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => binaSec(b)}
                      className="p-5 font-black italic uppercase text-lg border-b border-slate-50 hover:bg-blue-600 hover:text-white cursor-pointer transition-colors flex justify-between items-center text-left"
                    >
                      {b}
                      <CheckCircle2 size={18} className="text-blue-600" />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className="space-y-4 text-left">
              <label className="text-[11px] font-black uppercase italic text-slate-400 tracking-widest pl-2 text-left">{t('muhurle.kaynak')}</label>
              <div className="grid grid-cols-3 gap-4 text-left">
                {[
                  { id: 'sakin', label: t('muhurle.sakinim'), icon: UserCheck, desc: `%100 ${t('muhurle.etki')}` },
                  { id: 'eski_sakin', label: t('muhurle.eskiSakin'), icon: History, desc: `%70 ${t('muhurle.etki')}` },
                  { id: 'ziyaretci', label: t('muhurle.ziyaretci'), icon: Eye, desc: `%30 ${t('muhurle.etki')}` }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBaglantiTipi(item.id as any)}
                    className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 text-left ${
                      baglantiTipi === item.id 
                      ? 'border-blue-600 bg-[#dcecf7]/50 shadow-xl shadow-blue-100' 
                      : 'border-slate-100 bg-white hover:border-blue-200'
                    }`}
                  >
                    <item.icon size={24} className={baglantiTipi === item.id ? 'text-blue-600' : 'text-slate-300'} />
                    <div className="text-center text-left">
                      <div className={`font-black uppercase italic text-[11px] ${baglantiTipi === item.id ? 'text-blue-600' : 'text-slate-400'} text-left`}>{item.label}</div>
                      <div className="text-[8px] font-bold text-slate-300 uppercase italic text-left">{item.desc}</div>
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8 text-left">
              {categories.map((cat) => (
                <div key={cat.id} className="space-y-4 text-left">
                  <div className="flex justify-between items-end text-left">
                    <label className="text-[11px] font-black uppercase italic text-black tracking-widest text-left">{cat.label}</label>
                    <span className="text-2xl font-black italic text-blue-600 text-left">{cat.score.toFixed(1)}</span>
                  </div>
                  <input 
                    type="range" min="1" max="5" step="0.5"
                    value={cat.score}
                    onChange={(e) => handleScoreChange(cat.id, parseFloat(e.target.value))}
                    className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch text-left">
              <div className="flex flex-col gap-3 bg-slate-50 p-6 rounded-[2.5rem] border border-slate-100 justify-center text-left">
                <label className="text-[10px] font-black uppercase italic text-blue-600 tracking-widest pl-1 text-left">{t('muhurle.kriterEkle')}</label>
                <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-200 text-left">
                  <input 
                    value={newCatName} 
                    onChange={(e) => setNewCatName(e.target.value)}
                    placeholder="ÖRN: ASANSÖR..." 
                    className="flex-1 bg-transparent font-bold text-sm outline-none uppercase placeholder:text-slate-300 text-left"
                  />
                  <button type="button" onClick={addNewCategory} className="bg-blue-600 text-white p-2 rounded-xl hover:rotate-90 transition-all text-left">
                    <PlusCircle size={20} />
                  </button>
                </div>
              </div>

              <div className="relative group border-2 border-dashed p-6 rounded-[2.5rem] border-slate-200 flex flex-col items-center justify-center gap-2 text-left">
                <input 
                  type="file" accept="image/*" onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className={`transition-all min-h-[120px] h-full flex flex-col items-center justify-center gap-2 text-left ${previewUrl ? 'bg-[#dcecf7]/10' : 'bg-white'}`}>
                  {previewUrl ? (
                    <div className="flex items-center gap-4 text-left">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-blue-600 shadow-md text-left">
                        <img src={previewUrl} className="w-full h-full object-cover" alt="önizleme" />
                      </div>
                      <span className="font-black text-[10px] uppercase italic text-blue-600 text-left">{t('muhurle.kanitEklendi')}</span>
                    </div>
                  ) : (
                    <>
                      <Camera size={32} className="text-slate-300 group-hover:text-blue-600 transition-colors text-left" />
                      <span className="font-black text-[10px] uppercase italic tracking-widest text-slate-300 group-hover:text-blue-600 text-left">{t('muhurle.kanit')}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* HIZLI İŞARETLER — mobil ile aynı */}
            <section className="space-y-6 text-left">
              <label className="text-[11px] font-black uppercase italic text-slate-400 tracking-widest pl-2">{t('muhurle.isaretler')}</label>

              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase italic text-red-500 pl-2 block">{t('muhurle.sorunlar')}</span>
                <div className="flex flex-wrap gap-2">
                  {[...RED_PRESET, ...redFlags.filter(f => !RED_PRESET.includes(f))].map(f => {
                    const aktif = redFlags.includes(f);
                    return (
                      <button key={f} type="button"
                        onClick={() => setRedFlags(prev => aktif ? prev.filter(x => x !== f) : [...prev, f])}
                        className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase italic border-2 transition-all ${aktif ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-400 border-slate-100 hover:border-red-300'}`}>
                        {aktif ? `🚩 ${f}` : f}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 max-w-sm">
                  <input value={yeniRedFlag} onChange={e => setYeniRedFlag(trUpper(e.target.value))}
                    placeholder={t('muhurle.sorunEkle')} className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-[11px] font-bold uppercase outline-none placeholder:text-slate-300" />
                  <button type="button" onClick={() => { const t = yeniRedFlag.trim(); if (t && !redFlags.includes(t)) setRedFlags(p => [...p, t]); setYeniRedFlag(''); }}
                    className="bg-red-600 text-white p-3 rounded-2xl"><PlusCircle size={16} /></button>
                </div>
              </div>

              <div className="space-y-3">
                <span className="text-[10px] font-black uppercase italic text-green-600 pl-2 block">{t('muhurle.artilar')}</span>
                <div className="flex flex-wrap gap-2">
                  {[...GREEN_PRESET, ...greenFlags.filter(f => !GREEN_PRESET.includes(f))].map(f => {
                    const aktif = greenFlags.includes(f);
                    return (
                      <button key={f} type="button"
                        onClick={() => setGreenFlags(prev => aktif ? prev.filter(x => x !== f) : [...prev, f])}
                        className={`px-4 py-2 rounded-2xl text-[10px] font-black uppercase italic border-2 transition-all ${aktif ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-400 border-slate-100 hover:border-green-300'}`}>
                        {aktif ? `✅ ${f}` : f}
                      </button>
                    );
                  })}
                </div>
                <div className="flex items-center gap-2 max-w-sm">
                  <input value={yeniGreenFlag} onChange={e => setYeniGreenFlag(trUpper(e.target.value))}
                    placeholder={t('muhurle.artiEkle')} className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 text-[11px] font-bold uppercase outline-none placeholder:text-slate-300" />
                  <button type="button" onClick={() => { const t = yeniGreenFlag.trim(); if (t && !greenFlags.includes(t)) setGreenFlags(p => [...p, t]); setYeniGreenFlag(''); }}
                    className="bg-green-600 text-white p-3 rounded-2xl"><PlusCircle size={16} /></button>
                </div>
              </div>
            </section>

            <div className="space-y-4 text-left">
              <label className="text-[11px] font-black uppercase italic text-slate-400 tracking-widest pl-2 text-left">{t('muhurle.deneyim')}</label>
              <textarea 
                value={yorum} 
                onChange={(e) => setYorum(e.target.value)}
                rows={5} 
                className="w-full p-8 bg-white rounded-[2.5rem] border-2 border-slate-100 font-bold outline-none text-black focus:border-blue-600 transition-all text-lg italic shadow-sm text-left" 
                placeholder={t('muhurle.deneyimPh')}
              />
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center pt-8 border-t border-slate-100 text-left">
              <button 
                type="button"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`flex-1 w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all duration-300 ${isAnonymous ? 'border-black bg-[#023E56] text-white' : 'border-slate-100 bg-white text-slate-400'} text-left`}
              >
                <div className="flex items-center gap-3 text-left">
                  {isAnonymous ? <UserX size={24} /> : <UserCircle size={24} />}
                  <div className="flex flex-col items-start text-left">
                    <span className="font-black uppercase italic text-sm text-left">
                      {isAnonymous ? t('muhurle.anonim') : (user?.displayName || user?.email?.split('@')[0] || 'KULLANICI')}
                    </span>
                    <span className="text-[10px] font-bold opacity-50 uppercase tracking-tighter text-left">
                      {isAnonymous ? t('muhurle.kimlikGizli') : t('muhurle.kimlikGorunur')}
                    </span>
                  </div>
                </div>
                <div className={`w-10 h-5 rounded-full relative transition-all ${isAnonymous ? 'bg-blue-600' : 'bg-slate-200'} text-left`}>
                  <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isAnonymous ? 'right-1' : 'left-1'}`} />
                </div>
              </button>

              <button 
                type="submit" disabled={loading}
                className="flex-[2] w-full bg-blue-600 text-white p-8 rounded-[2.5rem] font-black text-2xl uppercase italic hover:bg-[#023E56] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 text-left"
              >
                {loading ? t('muhurle.gonderiliyor') : <>{t('muhurle.gonder')} <CheckCircle2 size={28} /></>}
              </button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
}

export default function ReviewPage() {
  return (
    <Suspense fallback={<div className="p-20 font-black italic uppercase text-center text-slate-200 text-left">KAYIT ODASI HAZIRLANIYOR...</div>}>
      <YorumFormu />
    </Suspense>
  );
}