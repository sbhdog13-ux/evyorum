"use client";

import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Star, ShieldCheck, Loader2, AlertCircle, PlusCircle, X, Radio, MessageSquarePlus, User } from "lucide-react"; 
import { useRouter } from 'next/navigation';
import Link from "next/link";
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://teakxifsmctudlpzuwkn.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRlYWt4aWZzbWN0dWRscHp1d2tuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3Mzc0NzUsImV4cCI6MjA4NDMxMzQ3NX0.NroN4nZW1cfxVT2apGoD6VyUpYJdJAjcSi6KJgF3mj8";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const GOOGLE_MAPS_API_KEY = "AIzaSyDRejr9Dmhfx2sy0KobX7RbKvdREPFxQ30"; 

export default function Home() {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingSelection, setPendingSelection] = useState({ name: "", city: "" });
  const [radarBinalar, setRadarBinalar] = useState<any[]>([]);

  const router = useRouter();
  const autocompleteService = useRef<any>(null);

  useEffect(() => {
    const radarGetir = async () => {
      const { data } = await supabase.from('takipler').select('*').eq('kullanıcı_adi', 'Saltuk Buğra');
      if (data) setRadarBinalar(data);
    };
    radarGetir();

    const checkGoogle = setInterval(() => {
      if (window.google?.maps?.places) {
        autocompleteService.current = new window.google.maps.places.AutocompleteService();
        clearInterval(checkGoogle);
      }
    }, 500);
  }, []);

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
    const { data } = await supabase.from('yorumlar').select('yeni_bina_adi').eq('yeni_bina_adi', mainText.toUpperCase()).maybeSingle();
    if (data) {
      router.push(`/arama?query=${encodeURIComponent(mainText.toUpperCase())}`);
    } else {
      setPendingSelection({ name: mainText.toUpperCase(), city: item.structured_formatting?.secondary_text || "" });
      setShowConfirmModal(true);
    }
    setIsSearching(false);
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans text-left overflow-x-hidden">
      
      {/* HEADER - GÖRSELDEKİ TAM DÜZEN */}
      <header className="fixed top-0 left-0 right-0 z-[200] bg-white px-8 py-4 border-b border-slate-100 shadow-sm flex justify-center">
        <div className="w-full max-w-[1400px] flex justify-between items-center">
          
          <Link href="/" className="flex flex-col items-start">
            <span className="font-black italic tracking-tighter text-[22px] leading-none">BULEVİNİ</span>
            <span className="text-blue-600 font-black italic uppercase text-[10px] tracking-[0.2em] mt-1">GERÇEKLERİ ÖĞREN</span>
          </Link>
          
          <div className="flex items-center gap-4">
            {/* RADAR İKONU - NET MAVİ TASARIM */}
            <Link 
              href="/profil" 
              className={`p-3 rounded-2xl transition-all border-2 ${radarBinalar.length > 0 ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-200 animate-pulse' : 'bg-slate-50 border-slate-100 text-slate-300'}`}
              title="Radar Odası"
            >
              <Radio size={20} />
            </Link>

            {/* KULLANICI BUTONU */}
            <Link href="/profil" className="flex items-center gap-3 bg-black text-white px-5 py-3 rounded-2xl border-2 border-white shadow-xl transition-all hover:scale-105">
              <User size={18} className="text-white" />
              <span className="font-black italic text-[12px] tracking-tighter uppercase">SALTUK BUĞRA</span>
            </Link>

            {/* DENEYİMİNİ PAYLAŞ BUTONU */}
            <Link 
              href="/yorum-yap" 
              className="hidden md:flex bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black italic text-[11px] uppercase tracking-wider items-center gap-2 shadow-xl shadow-blue-200 hover:bg-black transition-all"
            >
              <MessageSquarePlus size={16} /> DENEYİMİNİ PAYLAŞ
            </Link>
          </div>
        </div>
      </header>

      {/* SEARCH SECTION - Z-INDEX VE MARGIN DÜZELTİLDİ */}
      <section className="pt-48 pb-10 px-6 text-left relative z-[100] bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-[40px] md:text-[70px] font-black leading-[0.9] tracking-tighter uppercase mb-10 text-black">
            EVİ TUTMADAN ÖNCE <br />
            <span className="text-blue-600 italic">GERÇEKLERİ</span> ÖĞREN.
          </h1>

          <div className="relative max-w-2xl mx-auto text-left">
            <div className="relative flex items-center z-[110]">
              <div className="absolute left-6 text-slate-400">
                {isSearching ? <Loader2 size={24} className="animate-spin text-blue-600" /> : <Search size={24} />}
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
                placeholder="BİNA VEYA SOKAK ADI YAZIN..."
                className="w-full h-20 bg-white border-2 border-slate-200 rounded-[2rem] pl-16 pr-36 text-[15px] font-black italic focus:border-blue-600 shadow-xl uppercase outline-none"
              />
              <button 
                onClick={() => router.push(`/arama?query=${encodeURIComponent(searchTerm.toUpperCase())}`)}
                className="absolute right-3 px-8 h-14 bg-blue-600 text-white rounded-[1.5rem] text-[14px] font-black uppercase italic tracking-widest hover:bg-black transition-all"
              >
                ARA
              </button>
            </div>

            {/* ÖNERİ LİSTESİ - Z-INDEX EN ÜSTE ALINDI */}
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-[110%] left-0 right-0 bg-white border-2 border-slate-100 rounded-[2rem] shadow-[0_30px_60px_rgba(0,0,0,0.2)] overflow-hidden z-[120]">
                {suggestions.map((item, i) => (
                  <button key={i} onClick={() => handleSelection(item)} className="w-full px-8 py-5 text-left flex items-center gap-4 hover:bg-slate-50 border-b border-slate-50 last:border-0 bg-white transition-colors">
                    <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><MapPin size={18} /></div>
                    <div className="flex flex-col">
                      <span className="font-black uppercase italic text-black text-[14px] leading-tight">{item.structured_formatting?.main_text}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase italic leading-none mt-1">{item.structured_formatting?.secondary_text}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* FEED SECTION - MARGIN-TOP ARTIRILARAK AŞAĞI ALINDI */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-20 text-left relative z-[10]">
        <h2 className="text-[15px] font-black uppercase italic tracking-tighter text-black mb-10 border-l-4 border-blue-600 pl-4">SON SAKİN YORUMLARI</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { s: "BEŞİKTAŞ, TÜRKALİ", p: "4.5", t: "Fatura Onaylı" },
            { s: "KADIKÖY, MODA", p: "3.0", t: "Eski Sakin" },
            { s: "ŞİŞLİ, KURTULUŞ", p: "4.8", t: "Fatura Onaylı" }
          ].map((item, i) => (
            <Link key={i} href="/arama?query=BEŞİKTAŞ" className="group bg-white p-8 rounded-[3rem] border border-slate-100 hover:border-blue-600 transition-all shadow-sm hover:shadow-xl">
               <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-[15px] font-black uppercase italic tracking-tighter group-hover:text-blue-600 leading-none mb-2">{item.s}</h3>
                    <div className="flex items-center gap-2">
                      <ShieldCheck size={12} className="text-blue-600" />
                      <span className="text-[10px] font-bold text-slate-400 uppercase italic leading-none">{item.t}</span>
                    </div>
                  </div>
                  <div className="bg-white px-3 py-1 rounded-xl flex items-center gap-1 border border-slate-100 text-blue-600 font-black italic text-[12px]">
                    <Star size={12} fill="currentColor" /> {item.p}
                  </div>
               </div>
               <p className="text-[12px] font-medium text-slate-600 italic leading-relaxed">"Binanın durumu gayet iyi, sakin ve huzurlu bir ortam var."</p>
            </Link>
          ))}
        </div>
      </section>

      <footer className="py-20 border-t border-slate-50 text-center text-slate-300 font-bold uppercase italic text-[10px]">
        © 2026 BULEVİNİ — Şeffaf Bina Kültürü
      </footer>

      {/* CONFIRM MODAL */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-6 bg-black/60 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] overflow-hidden shadow-2xl border-[6px] border-blue-600">
            <div className="p-10 text-center">
              <AlertCircle size={40} className="mx-auto mb-6 text-blue-600" />
              <h3 className="text-[22px] font-black uppercase italic tracking-tighter mb-4 leading-none">BU BİNA HENÜZ <span className="text-blue-600">MÜHÜRLENMEMİŞ!</span></h3>
              <button 
                onClick={() => router.push(`/bina-olustur?binaAdi=${encodeURIComponent(pendingSelection.name)}`)}
                className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black uppercase italic text-[12px] shadow-xl shadow-blue-200"
              >
                EVET, BİNAYI MÜHÜRLE
              </button>
              <button onClick={() => setShowConfirmModal(false)} className="mt-4 text-[10px] font-bold text-slate-300 uppercase tracking-widest">KAPAT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}