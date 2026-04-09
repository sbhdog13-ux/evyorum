"use client";
import React, { useState, useEffect, Suspense } from 'react';
import { Home, Camera, PlusCircle, CheckCircle2, UserCircle, UserX, Building2, UserCheck, History, Eye } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://teakxifsmctudlpzuwkn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlYWt4aWZzbWN0dWRscHp1d2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3Mzc0NzUsImV4cCI6MjA4NDMxMzQ3NX0.NroN4nZW1cfxVT2apGoD6VyUpYJdJAjcSi6KJgF3mj8";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

function YorumFormu() {
  const router = useRouter();
  const searchParams = useSearchParams();
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

  useEffect(() => {
    const binalariGetir = async () => {
      const { data, error } = await supabase
        .from('yorumlar')
        .select('bina_adi');
      
      if (!error && data) {
        const uniqueNames = Array.from(new Set(data.map(b => b.bina_adi?.toUpperCase().trim()))).filter(Boolean) as string[];
        setKayitliBinalar(uniqueNames);
      }
    };
    binalariGetir();
  }, []);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const queryBina = searchParams.get('binaAdi') || urlParams.get('binaAdi');
    
    if (queryBina) {
        setBinaAdi(decodeURIComponent(queryBina).toUpperCase().trim());
    }
  }, [searchParams]);

  const handleBinaYazimi = (val: string) => {
    const uppercaseVal = val.toUpperCase();
    setBinaAdi(uppercaseVal);
    
    if (uppercaseVal.length > 0) {
      const filtre = kayitliBinalar.filter(b => b.includes(uppercaseVal));
      setFiltrelenmişBinalar(filtre);
      setShowDropdown(true);
    } else {
      setShowDropdown(false);
    }
  };

  const binaSec = (isim: string) => {
    setBinaAdi(isim.toUpperCase().trim());
    setShowDropdown(false);
  };

  const handleScoreChange = (catId: number, value: number) => {
    setCategories(categories.map(cat => 
      cat.id === catId ? { ...cat, score: value } : cat
    ));
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
    setCategories([...categories, { id: Date.now(), label: newCatName.toUpperCase(), score: 3 }]);
    setNewCatName("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const temizBinaAdi = binaAdi.toUpperCase().trim();
    
    // Veritabanındaki "Anonim Sakın" tetikleyicisiyle birebir uyum sağlandı
    const gecerliKullanici = isAnonymous ? "Anonim Sakın" : "Saltuk Buğra";

    if (!temizBinaAdi || !yorum.trim()) return alert("Bina adı ve deneyim metni zorunludur!");
    
    setLoading(true);

    const puanlarVerisi = categories.reduce((acc: any, curr) => {
      acc[curr.label] = curr.score;
      return acc;
    }, {});

    const ortalamaPuan = Number((categories.reduce((acc, curr) => acc + curr.score, 0) / categories.length).toFixed(1));

    try {
      const { error: insertError } = await supabase
        .from('yorumlar')
        .insert([{ 
          bina_adi: temizBinaAdi,
          yorum_metni: yorum.trim(), 
          kullanıcı_adi: gecerliKullanici, 
          puan: ortalamaPuan,
          puanlar: puanlarVerisi,
          baglanti_tipi: baglantiTipi
        }]);

      if (!insertError) {
        await new Promise(resolve => setTimeout(resolve, 800));

        const { data: profileData } = await supabase
          .from('profiles')
          .select('muhur_sayisi, statu')
          .eq('id', gecerliKullanici)
          .single();

        let tebrikMesaji = "BİNA MÜHÜRLENDİ!";
        
        if (profileData) {
            if (profileData.muhur_sayisi === 1) {
                tebrikMesaji = "TEBRİKLER! İLK MÜHÜRÜNÜ BASTIN VE ARTIK BİR 'KOMŞU'SUN. RADAR ÖZELLİĞİN AÇILDI! 📡";
            } else if (profileData.muhur_sayisi === 5) {
                tebrikMesaji = "MÜKEMMEL! 5 MÜHÜRLE 'BÖLGE SAKİNİ' OLDUN. MAVİ TİK ✅ ARTIK SENİNLE!";
            } else if (profileData.muhur_sayisi === 15) {
                tebrikMesaji = "İNANILMAZ! 15 MÜHÜRLE 'MUHTAR' RÜTBESİNE ERİŞTİN! 🏆";
            } else {
                tebrikMesaji = `BİNA MÜHÜRLENDİ! TOPLAM MÜHÜR: ${profileData.muhur_sayisi}`;
            }
        }

        alert(tebrikMesaji);
        router.push(`/bina/${encodeURIComponent(temizBinaAdi)}`);
      } else {
        alert("Bağlantı Hatası: " + insertError.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
            BİNAYI <span className="text-blue-600">MÜHÜRLE.</span>
          </h1>
          <p className="text-slate-400 font-bold uppercase italic text-[12px] mb-12 tracking-tight text-left">
            Gerçekleri paylaş, geleceği şeffaflaştır.
          </p>

          <form onSubmit={handleSubmit} className="space-y-10 text-left">
            <section className="relative text-left">
              <div className="bg-slate-50 p-1 rounded-[2rem] border border-slate-100 flex items-center px-6 focus-within:border-blue-600 transition-colors text-left">
                 <Building2 className="text-slate-300" size={24} />
                 <input 
                    value={binaAdi} 
                    onChange={(e) => handleBinaYazimi(e.target.value)} 
                    onFocus={() => setShowDropdown(true)}
                    placeholder="MÜHÜRLEYECEĞİN BİNAYI SEÇ..." 
                    className="w-full p-6 bg-transparent font-black text-2xl uppercase italic outline-none placeholder:text-slate-200 text-left"
                  />
              </div>

              {showDropdown && filtrelenmişBinalar.length > 0 && (
                <div className="absolute z-50 w-full mt-2 bg-white border-2 border-black rounded-[2rem] shadow-2xl overflow-hidden text-left">
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
              <label className="text-[11px] font-black uppercase italic text-slate-400 tracking-widest pl-2 text-left">İSTİHBARAT KAYNAĞI / BAĞLANTIN</label>
              <div className="grid grid-cols-3 gap-4 text-left">
                {[
                  { id: 'sakin', label: 'SAKİNİM', icon: UserCheck, desc: '%100 Etki' },
                  { id: 'eski_sakin', label: 'ESKİ SAKİN', icon: History, desc: '%70 Etki' },
                  { id: 'ziyaretci', label: 'ZİYARETÇİ', icon: Eye, desc: '%30 Etki' }
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setBaglantiTipi(item.id as any)}
                    className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 text-left ${
                      baglantiTipi === item.id 
                      ? 'border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-100' 
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
                <label className="text-[10px] font-black uppercase italic text-blue-600 tracking-widest pl-1 text-left">KRİTER EKLE</label>
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
                <div className={`transition-all min-h-[120px] h-full flex flex-col items-center justify-center gap-2 text-left ${previewUrl ? 'bg-blue-50/10' : 'bg-white'}`}>
                  {previewUrl ? (
                    <div className="flex items-center gap-4 text-left">
                      <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-blue-600 shadow-md text-left">
                        <img src={previewUrl} className="w-full h-full object-cover" alt="önizleme" />
                      </div>
                      <span className="font-black text-[10px] uppercase italic text-blue-600 text-left">KANIT EKLENDİ</span>
                    </div>
                  ) : (
                    <>
                      <Camera size={32} className="text-slate-300 group-hover:text-blue-600 transition-colors text-left" />
                      <span className="font-black text-[10px] uppercase italic tracking-widest text-slate-300 group-hover:text-blue-600 text-left">KANIT YÜKLE</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4 text-left">
               <label className="text-[11px] font-black uppercase italic text-slate-400 tracking-widest pl-2 text-left">DETAYLI DENEYİM</label>
               <textarea 
                  value={yorum} 
                  onChange={(e) => setYorum(e.target.value)}
                  rows={5} 
                  className="w-full p-8 bg-white rounded-[2.5rem] border-2 border-slate-100 font-bold outline-none text-black focus:border-blue-600 transition-all text-lg italic shadow-sm text-left" 
                  placeholder="Burada ne yaşadın? Gerçekleri dök..."
                />
            </div>

            <div className="flex flex-col md:flex-row gap-6 items-center pt-8 border-t border-slate-100 text-left">
                <button 
                    type="button"
                    onClick={() => setIsAnonymous(!isAnonymous)}
                    className={`flex-1 w-full flex items-center justify-between p-6 rounded-[2rem] border-2 transition-all duration-300 ${isAnonymous ? 'border-black bg-black text-white' : 'border-slate-100 bg-white text-slate-400'} text-left`}
                >
                    <div className="flex items-center gap-3 text-left">
                        {isAnonymous ? <UserX size={24} /> : <UserCircle size={24} />}
                        <div className="flex flex-col items-start text-left">
                            <span className="font-black uppercase italic text-sm text-left">{isAnonymous ? 'ANONİM SAKIN' : 'SALTUK BUĞRA'}</span>
                            <span className="text-[10px] font-bold opacity-50 uppercase tracking-tighter text-left">{isAnonymous ? 'Kimlik Gizli' : 'Kimlik Görünür'}</span>
                        </div>
                    </div>
                    <div className={`w-10 h-5 rounded-full relative transition-all ${isAnonymous ? 'bg-blue-600' : 'bg-slate-200'} text-left`}>
                        <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${isAnonymous ? 'right-1' : 'left-1'}`} />
                    </div>
                </button>

                <button 
                    type="submit" disabled={loading}
                    className="flex-[2] w-full bg-blue-600 text-white p-8 rounded-[2.5rem] font-black text-2xl uppercase italic hover:bg-black transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-95 text-left"
                >
                   {loading ? "MÜHÜRLENİYOR..." : <>MÜHÜRÜ BAS! <CheckCircle2 size={28} /></>}
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