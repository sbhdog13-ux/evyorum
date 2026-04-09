"use client";
import React, { useState, Suspense, useEffect } from 'react';
import { Navigation, ArrowLeft, Plus, Check, MapPin, AlignLeft, Search, Wand2, Camera, UserCircle, UserX, UserCheck, History, Eye } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';
import GoogleHarita from '@/app/components/GoogleHarita';

// --- VERİTABANI BAĞLANTISI ---
const supabaseUrl = "https://teakxifsmctudlpzuwkn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlYWt4aWZzbWN0dWRscHp1d2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3Mzc0NzUsImV4cCI6MjA4NDMxMzQ3NX0.NroN4nZW1cfxVT2apGoD6VyUpYJdJAjcSi6KJgF3mj8";
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const GOOGLE_MAPS_API_KEY = "AIzaSyDRejr9Dmhfx2sy0KobX7RbKvdREPFxQ30"; 

function BinaOlusturForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [addressLoading, setAddressLoading] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

  // GÜVEN KATMANI STATE'İ
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

  const generateStreetViewUrl = (coords: string) => {
    if (!coords) return "";
    return `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${coords}&fov=90&heading=235&pitch=10&key=${GOOGLE_MAPS_API_KEY}`;
  };

  const adresiGetir = async (coords: string) => {
    if (!coords || coords.length < 5) return alert("Geçerli bir koordinat girin!");
    setAddressLoading(true);
    try {
      const [lat, lng] = coords.split(',').map(c => c.trim());
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GOOGLE_MAPS_API_KEY}&language=tr`
      );
      const data = await response.json();

      if (data.status === "OK" && data.results.length > 0) {
        const fullAddress = data.results[0].formatted_address;
        const components = data.results[0].address_components;
        let district = "";
        let neighborhood = "";

        components.forEach((c: any) => {
          if (c.types.includes("administrative_area_level_2")) district = c.long_name.toUpperCase();
          if (
            c.types.includes("neighborhood") || 
            c.types.includes("sublocality") ||
            c.types.includes("sublocality_level_1") ||
            c.types.includes("administrative_area_level_4")
          ) {
            neighborhood = c.long_name.toUpperCase();
          }
        });

        setFormData(prev => ({
          ...prev,
          acik_adres_ham: fullAddress.toUpperCase(),
          ilce: district.replace("İSTANBUL", "").trim(),
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

  useEffect(() => {
    const qBina = searchParams?.get('binaAdi');
    if (qBina) {
        setFormData(prev => ({ ...prev, bina_adi: decodeURIComponent(qBina).toUpperCase().trim() }));
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const temizBinaAdi = formData.bina_adi.toUpperCase().trim();
    
    if (!temizBinaAdi || !formData.ilce || !formData.koordinat) {
        return alert("Mühürleme için tüm alanlar dolu olmalıdır!");
    }
    
    setLoading(true);
    try {
      const paketliAdres = `${formData.mahalle} MAH. ${formData.ilce}/${formData.il} | ADRES: ${formData.acik_adres_ham} | KOORD: ${formData.koordinat}`;

      const { error } = await supabase.from('yorumlar').insert([{ 
          bina_adi: temizBinaAdi,
          acik_adres: paketliAdres, 
          yorum_metni: `${temizBinaAdi} binası mühürlendi.`,
          kullanıcı_adi: isAnonymous ? "Anonim Sakin" : "Saltuk Buğra", 
          puan: 0, 
          puanlar: {}, 
          foto_url: formData.foto_url,
          baglanti_tipi: baglantiTipi // YENİ VERİ EKLEDİK
        }]);

      if (error) throw error;
      router.push(`/bina/${encodeURIComponent(temizBinaAdi)}`);
    } catch (err: any) { 
        setLoading(false); 
        alert("Supabase Hatası: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] p-4 md:p-6 text-black pb-20 text-left">
      <div className="max-w-4xl mx-auto bg-white rounded-[3rem] shadow-2xl border border-slate-200 overflow-hidden text-left">
        
        <header className="p-6 border-b border-slate-50 flex justify-between items-center bg-white/50 backdrop-blur-sm sticky top-0 z-10 text-left">
          <Link href="/arama" className="text-slate-400 hover:text-black transition-all flex items-center gap-2 font-black italic uppercase text-xs text-left">
            <ArrowLeft size={16} /> GERİ DÖN
          </Link>
          <div className="flex items-center gap-2 font-bold text-blue-600 italic text-left">
            <MapPin size={20} /> BULEVİNİ <span className="text-[9px] bg-blue-600 text-white px-2 py-0.5 rounded-full ml-1 uppercase tracking-tighter">MÜHÜR ODASI</span>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8 text-left">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
            <div className="rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl h-[200px] relative bg-slate-100 text-left">
              {formData.foto_url ? (
                  <img src={formData.foto_url} alt="Bina" className="w-full h-full object-cover" />
              ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold italic uppercase text-[10px] p-4 text-center">Adres Çekilince Fotoğraf Gelecek</div>
              )}
              <div className="absolute top-2 left-2 bg-black/50 text-white p-2 rounded-full"><Camera size={14} /></div>
            </div>

            <div className="rounded-[2.5rem] overflow-hidden border-4 border-white shadow-xl h-[200px] bg-slate-50 text-left">
              {formData.koordinat ? <GoogleHarita koordinat={formData.koordinat} /> : <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold italic uppercase text-[10px]">Harita Bekleniyor</div>}
            </div>
          </div>

          <div className="bg-black p-8 rounded-[2.5rem] shadow-xl relative overflow-hidden text-left">
            <label className="block text-[10px] font-black text-blue-400 uppercase italic mb-3 tracking-[0.3em] text-left">KONUM KOORDİNATLARI</label>
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

          <div className="bg-slate-50 p-6 md:p-8 rounded-[2.5rem] border border-blue-100 shadow-inner text-left">
            <label className="block text-[10px] font-black text-blue-600 uppercase italic mb-3 tracking-widest leading-none text-left">BİNA ADI</label>
            <input 
              value={formData.bina_adi}
              onChange={(e) => setFormData({...formData, bina_adi: e.target.value.toUpperCase()})}
              placeholder="BİNA İSMİNİ GİRİN"
              className="w-full bg-transparent text-2xl md:text-3xl font-black outline-none uppercase italic text-black text-left"
            />
          </div>

          {/* GÜVEN KATMANI: BAĞLANTI TİPİ SEÇİMİ (YENİ) */}
          <section className="space-y-4 text-left">
            <label className="text-[10px] font-black text-slate-400 uppercase italic mb-3 tracking-widest pl-2 text-left">İSTİHBARAT KAYNAĞI / BAĞLANTIN</label>
            <div className="grid grid-cols-3 gap-3 text-left">
              {[
                { id: 'sakin', label: 'SAKİNİM', icon: UserCheck, desc: '%100 Güç' },
                { id: 'eski_sakin', label: 'ESKİ SAKİN', icon: History, desc: '%70 Güç' },
                { id: 'ziyaretci', label: 'ZİYARETÇİ', icon: Eye, desc: '%30 Güç' }
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setBaglantiTipi(item.id as any)}
                  className={`p-5 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-2 group text-left ${
                    baglantiTipi === item.id 
                    ? 'border-blue-600 bg-blue-50/50 shadow-lg shadow-blue-100' 
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
            <label className="block text-[10px] font-black text-slate-400 uppercase italic mb-3 tracking-widest leading-none text-left">AÇIK ADRES</label>
            <textarea 
              value={formData.acik_adres_ham}
              onChange={(e) => setFormData({...formData, acik_adres_ham: e.target.value.toUpperCase()})}
              className="w-full bg-transparent text-sm font-bold outline-none uppercase italic text-black resize-none text-left"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-left">
              <label className="block text-[10px] font-black text-slate-400 uppercase italic mb-2 tracking-widest text-left">İLÇE</label>
              <input value={formData.ilce} onChange={(e) => setFormData({...formData, ilce: e.target.value.toUpperCase()})} className="w-full bg-transparent text-sm font-bold outline-none uppercase italic text-blue-600 text-left" />
            </div>
            <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-left">
              <label className="block text-[10px] font-black text-slate-400 uppercase italic mb-2 tracking-widest text-left">MAHALLE</label>
              <input value={formData.mahalle} onChange={(e) => setFormData({...formData, mahalle: e.target.value.toUpperCase()})} className="w-full bg-transparent text-sm font-bold outline-none uppercase italic text-black text-left" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-4 items-center pt-4 text-left">
              <button type="button" onClick={() => setIsAnonymous(!isAnonymous)} className={`flex-1 w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all duration-300 ${isAnonymous ? 'border-black bg-black text-white' : 'border-slate-100 bg-white text-slate-400'} text-left`}>
                  <div className="flex items-center gap-3 text-left">
                      {isAnonymous ? <UserX size={24} /> : <UserCircle size={24} />}
                      <span className="font-black uppercase italic text-sm text-left">{isAnonymous ? 'ANONİM SAKİN' : 'SALTUK BUĞRA'}</span>
                  </div>
              </button>
              <button type="submit" disabled={loading} className="flex-[2] w-full bg-blue-600 text-white p-8 rounded-[2.5rem] font-black text-xl hover:bg-black transition-all shadow-2xl italic active:scale-95 text-left">
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