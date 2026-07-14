"use client";
import { trUpper } from '@/app/lib/utils';
import React, { useState, Suspense, useEffect } from 'react';
import { ArrowLeft, Wand2, Camera, UserCircle, UserX, UserCheck, History, Eye, MapPin } from 'lucide-react';
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl h-[200px] relative bg-slate-100 text-left">
              {formData.foto_url ? (
                <img src={formData.foto_url} alt="Bina" onError={(e: any) => { e.currentTarget.style.display = "none"; }} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold italic uppercase text-[10px] p-4 text-center">{t('olustur.fotoBekle')}</div>
              )}
              <div className="absolute top-2 left-2 bg-[#023E56]/50 text-white p-2 rounded-full"><Camera size={14} /></div>
            </div>

            <div className="rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl h-[200px] bg-slate-50 text-left relative">
              <KonumSecici
                koordinat={formData.koordinat}
                onSec={(lat, lng) => {
                  const koord = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
                  setFormData(prev => ({ ...prev, koordinat: koord }));
                  adresiGetir(koord);
                }}
              />
              <div className="absolute top-2 left-2 z-[500] bg-[#023E56]/80 text-white px-3 py-1.5 rounded-full text-[9px] font-black italic uppercase pointer-events-none">{t('olustur.haritaDokun')}</div>
            </div>
          </div>

          <div className="bg-[#023E56] p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden text-left">
            <label className="block text-[10px] font-black text-blue-400 uppercase italic mb-3 tracking-[0.3em] text-left">{t('olustur.koordinat')}</label>
            <div className="flex flex-col md:flex-row gap-4 items-center relative z-10 text-left">
              <input
                value={formData.koordinat}
                onChange={(e) => setFormData({...formData, koordinat: e.target.value})}
                placeholder="ÖRN: 41.0253, 29.1175"
                className="w-full bg-transparent text-white text-2xl font-black outline-none tracking-tighter text-left"
              />
              <button
                type="button"
                onClick={() => adresiGetir(formData.koordinat)}
                className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-black text-[11px] uppercase italic hover:bg-white hover:text-blue-600 transition-all active:scale-95 shadow-xl text-left"
              >
                {addressLoading ? "SİSTEM TARANIYOR..." : <><Wand2 size={16}/> ADRES ÇEK</>}
              </button>
            </div>
          </div>

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