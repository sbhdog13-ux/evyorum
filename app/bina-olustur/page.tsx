"use client";
import { trUpper } from '@/app/lib/utils';
import React, { useState, Suspense, useEffect, useRef } from 'react';
import { ArrowLeft, Wand2, Camera, UserCircle, UserX, UserCheck, History, Eye, MapPin, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/app/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '@/app/contexts/AuthContext';
import { useLang } from '@/app/lib/i18n';
import DogrulamaKapisi from '@/app/components/DogrulamaKapisi';
import Sidebar from '@/app/components/Sidebar';
import KonumSecici from '@/app/components/KonumSecici';

const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

function BinaOlusturForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLang();
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [haritaAcik, setHaritaAcik] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');
  const [aramaSonuclar, setAramaSonuclar] = useState<any[]>([]);
  const aramaTimer = useRef<any>(null);

  const haritadaAra = (m: string) => {
    setAramaMetni(m);
    clearTimeout(aramaTimer.current);
    if (!m.trim()) { setAramaSonuclar([]); return; }
    aramaTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(m + ' İstanbul')}&format=json&limit=5&bounded=1&viewbox=27.9,41.65,29.95,40.55&accept-language=tr`);
        setAramaSonuclar(await r.json() || []);
      } catch { setAramaSonuclar([]); }
    }, 400);
  };
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [baglantiTipi, setBaglantiTipi] = useState<'sakin' | 'eski_sakin' | 'ziyaretci'>('sakin');

  const [formData, setFormData] = useState({
    bina_adi: "",
    il: "İSTANBUL",
    ilce: "",
    mahalle: "",
    acik_adres_ham: "",
    koordinat: "",
    foto_url: ""
  });

  useEffect(() => {
    if (!authLoading && !user) {
      alert("Bina oluşturmak için giriş yapman gerekiyor!");
      router.push('/giris');
    }
  }, [user, authLoading]);

  useEffect(() => {
    const qBina = searchParams?.get('binaAdi');
    if (qBina) {
      setFormData(prev => ({ ...prev, bina_adi: trUpper(decodeURIComponent(qBina)).trim() }));
    }
    // Haritadan pin ile gelindi (mobil KonumSecim akışının web karşılığı)
    const qKoord = searchParams?.get('koordinat');
    if (qKoord) {
      const koord = decodeURIComponent(qKoord);
      setFormData(prev => ({ ...prev, koordinat: koord }));
      adresiGetir(koord);
    }
  }, [searchParams]);

  const generateStreetViewUrl = (coords: string) => {
    if (!coords) return "";
    return `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${coords}&fov=90&heading=235&pitch=10&key=${GOOGLE_MAPS_API_KEY}`;
  };

  const adresiGetir = async (coords: string) => {
    if (!coords || coords.length < 5) return alert("Geçerli bir koordinat girin!");
    setAddressLoading(true);
    try {
      const [lat, lng] = coords.split(',').map(c => c.trim());
      // Nominatim — mobil ile aynı adres servisi (Google key gerektirmez)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=tr&addressdetails=1`
      );
      const data = await response.json();

      if (data && data.address) {
        const a = data.address;
        const fullAddress = data.display_name || '';
        const district = trUpper((a.town || a.city_district || a.district || a.county || '')).replace('İLÇESİ', '').trim();
        const neighborhood = trUpper((a.suburb || a.quarter || a.neighbourhood || '')).replace('MAHALLESİ', '').replace('MAH.', '').trim();

        setFormData(prev => ({
          ...prev,
          acik_adres_ham: trUpper(fullAddress),
          ilce: district,
          mahalle: neighborhood,
          foto_url: generateStreetViewUrl(coords)
        }));
      }
    } catch (error) {
      console.error("Hata:", error);
    } finally {
      setAddressLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const temizBinaAdi = trUpper(formData.bina_adi).trim();

    if (!temizBinaAdi || !formData.ilce || !formData.koordinat) {
      return alert("Mühürleme için tüm alanlar dolu olmalıdır!");
    }

    if (!user && !isAnonymous) {
      alert("Bina oluşturmak için giriş yapman gerekiyor!");
      router.push('/giris');
      return;
    }

    setLoading(true);
    try {
      const paketliAdres = `${formData.mahalle} MAH. ${formData.ilce}/${formData.il} | ADRES: ${formData.acik_adres_ham} | KOORD: ${formData.koordinat}`;
      const kullaniciAdi = isAnonymous ? "Anonim Sakin" : (user?.displayName || user?.email?.split('@')[0] || "Anonim");
      const kullaniciId = isAnonymous ? null : user?.uid;

      // Mobil ile aynı şema: yapısal konum alanları + standart oluşturma metni
      const [koordLat, koordLng] = formData.koordinat.split(',').map((c: string) => parseFloat(c.trim()));
      await addDoc(collection(db, 'yorumlar'), {
        bina_adi: temizBinaAdi,
        yeni_bina_adi: temizBinaAdi,
        acik_adres: paketliAdres,
        il: formData.il,
        ilce: formData.ilce,
        mahalle: formData.mahalle,
        koordinat: (!isNaN(koordLat) && !isNaN(koordLng)) ? { lat: koordLat, lng: koordLng } : null,
        yorum_metni: 'BİNA MÜHÜRLENDİ.',
        kullanici_adi: kullaniciAdi,
        kullanici_id: kullaniciId,
        puan: 0,
        puanlar: {},
        foto_url: formData.foto_url,
        baglanti_tipi: baglantiTipi,
        created_at: serverTimestamp()
      });

      router.push(`/bina?isim=${encodeURIComponent(temizBinaAdi)}`);
    } catch (err: any) {
      setLoading(false);
      alert("Hata: " + err.message);
    }
  };

  if (!authLoading && user && !user.emailVerified) return <DogrulamaKapisi />;
  if (authLoading) return <div className="min-h-screen flex items-center justify-center font-black italic uppercase text-slate-200">Yükleniyor...</div>;

  return (
    <div className="lg:pl-80 min-h-screen bg-[#F0F4F8] p-4 md:p-6 text-black pb-20 text-left">
      <Sidebar />
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden text-left">
        
        <header className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10 text-left">
          <Link href="/arama" className="text-slate-400 hover:text-black transition-all flex items-center gap-2 font-black italic uppercase text-xs text-left">
            <ArrowLeft size={16} /> {t('olustur.geri')}
          </Link>
          <div className="flex items-center gap-2 font-bold text-blue-600 italic text-left">
            <MapPin size={20} /> BULEVİNİ <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full ml-1 uppercase tracking-tighter">{t('olustur.oda')}</span>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8 text-left">
          {/* Büyük harita önizleme — tıklayınca tam ekran seçici açılır */}
          <button type="button" onClick={() => setHaritaAcik(true)}
            className="w-full rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl h-[280px] md:h-[340px] bg-slate-50 relative block group">
            <div className="absolute inset-0 pointer-events-none">
              <KonumSecici koordinat={formData.koordinat} onSec={() => {}} salt />
            </div>
            <div className="absolute inset-0 z-[500] bg-[#023E56]/0 group-hover:bg-[#023E56]/10 transition-all flex items-center justify-center">
              <span className="bg-[#023E56] text-white px-6 py-3.5 rounded-2xl text-[11px] font-black italic uppercase tracking-widest shadow-2xl flex items-center gap-2">
                <MapPin size={15} /> {formData.koordinat ? t('olustur.konumDegistir') : t('olustur.konumSec')}
              </span>
            </div>
            {formData.koordinat && (
              <div className="absolute bottom-3 left-3 z-[500] bg-white/90 text-[#023E56] px-3.5 py-2 rounded-xl text-[10px] font-black italic pointer-events-none">
                📍 {formData.koordinat}
              </div>
            )}
          </button>

          {formData.foto_url && (
            <div className="rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl h-[200px] relative bg-slate-100 text-left">
              <img src={formData.foto_url} alt="Bina" onError={(e: any) => { e.currentTarget.style.display = "none"; }} className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 bg-[#023E56]/50 text-white p-2 rounded-full"><Camera size={14} /></div>
            </div>
          )}

          {/* Tam ekran konum seçici — keşfet haritasıyla aynı deneyim */}
          {haritaAcik && (
            <div className="fixed inset-0 z-[700] bg-white flex flex-col">
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-white z-[710]">
                <div className="font-black italic uppercase text-[14px] tracking-tighter flex items-center gap-2 text-[#023E56]">
                  <MapPin size={18} /> {t('olustur.haritaDokun')}
                </div>
                <button type="button" onClick={() => setHaritaAcik(false)} className="p-2.5 bg-slate-100 rounded-xl"><X size={18} /></button>
              </div>
              <div className="px-5 py-3 border-b border-slate-100 bg-white z-[710] relative">
                <input
                  value={aramaMetni}
                  onChange={(e) => haritadaAra(e.target.value)}
                  placeholder={t('harita.ara')}
                  className="w-full h-12 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-[13px] font-black italic outline-none focus:border-[#023E56]"
                />
                {aramaSonuclar.length > 0 && (
                  <div className="absolute left-5 right-5 top-[64px] bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden z-[720]">
                    {aramaSonuclar.map((sonuc: any) => (
                      <button key={sonuc.place_id} type="button"
                        onClick={() => {
                          const koord = `${parseFloat(sonuc.lat).toFixed(6)}, ${parseFloat(sonuc.lon).toFixed(6)}`;
                          setFormData(prev => ({ ...prev, koordinat: koord }));
                          adresiGetir(koord);
                          setAramaSonuclar([]);
                          setAramaMetni('');
                        }}
                        className="w-full text-left px-5 py-3.5 border-b border-slate-50 last:border-0 hover:bg-[#e8f3fa] transition-colors">
                        <span className="text-[12px] font-bold text-slate-600 line-clamp-1">📍 {sonuc.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex-1 relative">
                <KonumSecici
                  koordinat={formData.koordinat}
                  onSec={(lat, lng) => {
                    const koord = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                    setFormData(prev => ({ ...prev, koordinat: koord }));
                    adresiGetir(koord);
                  }}
                />
              </div>
              <div className="px-5 py-4 border-t border-slate-100 bg-white flex items-center justify-between gap-4 z-[710]">
                <div className="text-[11px] font-black italic text-slate-500 uppercase min-w-0 truncate">
                  {addressLoading ? t('harita.adresAliniyor') : formData.koordinat ? `📍 ${formData.ilce}${formData.mahalle ? ' / ' + formData.mahalle : ''}` : t('harita.alt')}
                </div>
                <button type="button" disabled={!formData.koordinat}
                  onClick={() => setHaritaAcik(false)}
                  className={`px-7 py-4 rounded-2xl text-[11px] font-black italic uppercase tracking-widest shadow-xl shrink-0 ${formData.koordinat ? 'bg-[#023E56] text-white' : 'bg-slate-100 text-slate-300'}`}>
                  {t('olustur.konumKullan')} →
                </button>
              </div>
            </div>
          )}

          <div className="bg-slate-50 p-6 md:p-8 rounded-[2.5rem] border border-[#A1CDE9] shadow-inner text-left">
            <label className="block text-[10px] font-black text-blue-600 uppercase italic mb-3 tracking-widest leading-none text-left">{t('olustur.binaAdi')}</label>
            <input
              value={formData.bina_adi}
              onChange={(e) => setFormData({...formData, bina_adi: trUpper(e.target.value)})}
              placeholder={t('olustur.binaAdiPh')}
              className="w-full bg-transparent text-2xl md:text-3xl font-black outline-none uppercase italic text-black text-left"
            />
          </div>

          <section className="space-y-4 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase italic mb-3 tracking-widest pl-2 text-left">{t('muhurle.kaynak')}</label>
            <div className="grid grid-cols-3 gap-3 text-left">
              {[
                { id: 'sakin', label: t('muhurle.sakinim'), icon: UserCheck, desc: `%100 ${t('muhurle.etki')}` },
                { id: 'eski_sakin', label: t('muhurle.eskiSakin'), icon: History, desc: `%70 ${t('muhurle.etki')}` },
                { id: 'ziyaretci', label: t('muhurle.ziyaretci'), icon: Eye, desc: `%30 ${t('muhurle.etki')}` }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setBaglantiTipi(item.id as any)}
                  className={`p-5 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-2 group text-left ${
                    baglantiTipi === item.id
                    ? 'border-blue-600 bg-[#dcecf7]/50 shadow-lg shadow-blue-100'
                    : 'border-slate-100 bg-white hover:border-blue-200'
                  }`}
                >
                  <item.icon size={20} className={baglantiTipi === item.id ? 'text-blue-600' : 'text-slate-300'} />
                  <div className="text-center text-left">
                    <div className={`font-black uppercase italic text-[10px] ${baglantiTipi === item.id ? 'text-blue-600' : 'text-slate-400'} text-left`}>{item.label}</div>
                    <div className="text-[7px] font-bold text-slate-300 uppercase italic text-left">{item.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </section>

          <div className="bg-slate-50 p-6 md:p-8 rounded-[2.5rem] border border-slate-100 text-left">
            <label className="block text-[10px] font-black text-slate-400 uppercase italic mb-3 tracking-widest leading-none text-left">{t('olustur.acikAdres')}</label>
            <textarea
              value={formData.acik_adres_ham}
              onChange={(e) => setFormData({...formData, acik_adres_ham: trUpper(e.target.value)})}
              className="w-full bg-transparent text-sm font-bold outline-none uppercase italic text-black resize-none text-left"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-left">
              <label className="block text-[10px] font-black text-slate-400 uppercase italic mb-2 tracking-widest text-left">{t('olustur.ilce')}</label>
              <input value={formData.ilce} onChange={(e) => setFormData({...formData, ilce: trUpper(e.target.value)})} className="w-full bg-transparent text-sm font-bold outline-none uppercase italic text-blue-600 text-left" />
            </div>
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-left">
              <label className="block text-[10px] font-black text-slate-400 uppercase italic mb-2 tracking-widest text-left">{t('olustur.mahalle')}</label>
              <input value={formData.mahalle} onChange={(e) => setFormData({...formData, mahalle: trUpper(e.target.value)})} className="w-full bg-transparent text-sm font-bold outline-none uppercase italic text-black text-left" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center pt-4 text-left">
            <button type="button" onClick={() => setIsAnonymous(!isAnonymous)} className={`flex-1 w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all duration-300 ${isAnonymous ? 'border-black bg-[#023E56] text-white' : 'border-slate-100 bg-white text-slate-400'} text-left`}>
              <div className="flex items-center gap-3 text-left">
                {isAnonymous ? <UserX size={24} /> : <UserCircle size={24} />}
                <span className="font-black uppercase italic text-sm text-left">
                  {isAnonymous ? t('muhurle.anonim') : (user?.displayName || user?.email?.split('@')[0] || 'KULLANICI')}
                </span>
              </div>
            </button>
            <button type="submit" disabled={loading} className="flex-[2] w-full bg-blue-600 text-white p-8 rounded-[2.5rem] font-black text-xl hover:bg-[#023E56] transition-all shadow-2xl italic active:scale-95 text-left">
              {loading ? "MÜHÜRLENİYOR..." : "BİNAYI MÜHÜRLE"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CreateBuildingPage() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-black italic uppercase text-slate-200 text-left">Mühür Odası Hazırlanıyor...</div>}>
      <BinaOlusturForm />
    </Suspense>
  );
}