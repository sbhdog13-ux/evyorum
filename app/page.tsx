"use client";
import React, { useState, useEffect } from 'react';
import { Search, MapPin, MessageSquare, Star, Home, User, LogOut } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const ISTANBUL_ILCELERI = ["Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü", "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt", "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane", "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer", "Silivri", "Sultanbeyli", "Sultangazi", "Şile", "Şişli", "Tuzla", "Ümraniye", "Üsküdar", "Zeytinburnu"];

export default function LandingPage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) setUserName(savedUser);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUserName(null);
    router.refresh();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    if (value.length >= 2) {
      const filtered = ISTANBUL_ILCELERI.filter(ilce => ilce.toLowerCase().includes(value.toLowerCase()));
      setSuggestions(filtered);
    } else setSuggestions([]);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans text-left">
      <nav className="flex justify-between items-center px-8 py-6 max-w-7xl mx-auto border-b border-slate-100">
        <Link href="/" className="flex items-center gap-2 group">
          <Home className="text-blue-600 group-hover:scale-110 transition-transform" size={28} />
          <span className="text-2xl font-black tracking-tighter text-black">EVYORUM</span>
        </Link>
        <div className="flex items-center gap-6">
          {userName ? (
            <div className="flex items-center gap-4">
              <span className="font-bold text-black border-r pr-4 border-slate-200 uppercase text-sm tracking-widest">{userName}</span>
              <button onClick={handleLogout} className="text-red-600 font-bold flex items-center gap-1 hover:underline text-sm"><LogOut size={16} /> Çıkış</button>
            </div>
          ) : (
            <Link href="/giris" className="text-black font-bold hover:text-blue-600 transition-colors">Giriş Yap</Link>
          )}
          <Link href="/yorum-yap" className="bg-black text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-600 transition-all shadow-xl">Deneyimini Paylaş</Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto pt-16 px-6">
        <div className="text-center mb-16">
          <h1 className="text-6xl md:text-7xl font-black mb-4 tracking-tight text-black">
            Evi tutmadan önce <br /><span className="text-blue-600 italic">gerçekleri</span> öğren.
          </h1>
          <p className="text-xl text-slate-800 font-bold max-w-2xl mx-auto italic">
            "Kiralayacağın evin sadece duvarlarını değil, gelecekteki huzurunu da gör."
          </p>
        </div>

        <div className="relative max-w-3xl mx-auto mb-24 z-50">
          <input type="text" value={query} onChange={handleInputChange} className="w-full p-8 pl-16 rounded-[2rem] border-2 border-black bg-white shadow-2xl text-xl outline-none focus:ring-4 focus:ring-blue-100 transition-all font-bold text-black placeholder:text-slate-400" placeholder="Bir ilçe yazın (Örn: Beşiktaş)..." />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-black" size={24} />
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 bg-white mt-2 rounded-2xl shadow-2xl border-2 border-black overflow-hidden z-[60]">
              {suggestions.map(ilce => (
                <div key={ilce} onClick={() => router.push(`/arama?q=${ilce}`)} className="p-4 hover:bg-blue-50 cursor-pointer flex items-center gap-3 border-b border-slate-100 last:border-none font-black text-black">
                  <MapPin size={18} className="text-blue-600" /> {ilce}
                </div>
              ))}
            </div>
          )}
        </div>

        <section className="mt-20">
          <h2 className="text-3xl font-black mb-10 flex items-center gap-2">
            <MessageSquare className="text-blue-600" /> Son Sakin Yorumları
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
              <div className="flex justify-between mb-4 font-black">
                <span className="text-blue-600">Beşiktaş, Türkali</span>
                <div className="flex text-orange-500"><Star size={16} fill="currentColor"/> 4.5</div>
              </div>
              <p className="text-black font-bold italic leading-relaxed">"Alt kattaki fırın sabah 5'te koku yapıyor ama bina çok sıcak tutuyor."</p>
              <div className="mt-4 text-sm font-black text-slate-400 uppercase tracking-tighter">M. A. — 2 gün önce</div>
            </div>
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-200">
              <div className="flex justify-between mb-4 font-black text-black">
                <span className="text-blue-600">Kadıköy, Moda</span>
                <div className="flex text-orange-500"><Star size={16} fill="currentColor"/> 3.0</div>
              </div>
              <p className="text-black font-bold italic leading-relaxed">"Asansörün sürekli bozulması dışında konum olarak harika bir bina."</p>
              <div className="mt-4 text-sm font-black text-slate-400 uppercase tracking-tighter">S. K. — Dün</div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
