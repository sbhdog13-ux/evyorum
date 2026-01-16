"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Star, MapPin } from 'lucide-react';

// İstanbul İlçe Listesi
const ISTANBUL_DISTRICTS = [
  "Adalar", "Arnavutköy", "Ataşehir", "Avcılar", "Bağcılar", "Bahçelievler", "Bakırköy", "Başakşehir", "Bayrampaşa", "Beşiktaş", "Beykoz", "Beylikdüzü", "Beyoğlu", "Büyükçekmece", "Çatalca", "Çekmeköy", "Esenler", "Esenyurt", "Eyüpsultan", "Fatih", "Gaziosmanpaşa", "Güngören", "Kadıköy", "Kağıthane", "Kartal", "Küçükçekmece", "Maltepe", "Pendik", "Sancaktepe", "Sarıyer", "Silivri", "Sultanbeyli", "Sultangazi", "Şile", "Şişli", "Tuzla", "Ümraniye", "Üsküdar", "Zeytinburnu"
];

export default function LandingPage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const router = useRouter();

  // Otomatik tamamlama mantığı
  useEffect(() => {
    if (query.length > 1) {
      const filtered = ISTANBUL_DISTRICTS.filter(d => 
        d.toLowerCase().toLocaleLowerCase('tr').includes(query.toLowerCase().toLocaleLowerCase('tr'))
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  }, [query]);

  const handleSearch = (e?: React.FormEvent, selectedItem?: string) => {
    if (e) e.preventDefault();
    const searchTerm = selectedItem || query;
    if (searchTerm.trim()) {
      router.push(`/arama?query=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-black overflow-x-hidden">
      {/* 1. HEADER (Korumalı) */}
      <header className="flex justify-between items-center p-8 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black italic text-lg">E</span>
          </div>
          <span className="text-xl font-black tracking-tighter uppercase">EVYORUM</span>
        </div>
        <div className="flex gap-6 items-center">
          <Link href="/giris" className="font-bold text-sm hover:text-blue-600 transition-colors">Giriş Yap</Link>
          <Link href="/yorum-yap" className="bg-black text-white px-6 py-2 rounded-full font-bold text-sm hover:bg-blue-600 transition-all">
            Deneyimini Paylaş
          </Link>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 pt-16 pb-20 flex flex-col items-center">
        {/* 2. SLOGAN (Korumalı) */}
        <div className="text-center mb-12">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight mb-4 text-slate-900">
            Evi tutmadan önce <br />
            <span className="text-blue-600 italic">gerçekleri</span> öğren.
          </h1>
          <p className="text-slate-500 font-medium italic text-sm">
            "Kiralayacağın evin sadece duvarlarını değil, gelecekteki huzurunu da gör."
          </p>
        </div>
        
        {/* 3. ARAMA VE ÜZERİNE EKLENEN ÖNERİLER */}
        <div className="relative w-full max-w-2xl mb-24 z-50">
          <form onSubmit={handleSearch} className="relative group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={20} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Bir ilçe yazın (Örn: Beşiktaş)..."
              className="w-full p-6 pl-16 text-lg border border-slate-200 rounded-full shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all"
            />
            <button type="submit" className="absolute right-3 top-2 bottom-2 bg-black text-white px-8 rounded-full font-bold text-sm hover:bg-blue-700 transition-all">
              ARA
            </button>
          </form>

          {/* Öneriler Listesi (Üzerine eklenen yeni katman) */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-3 bg-white border border-slate-100 rounded-[2rem] shadow-2xl overflow-hidden overflow-y-auto max-h-64">
              {suggestions.map((item, idx) => (
                <div 
                  key={idx}
                  onClick={() => handleSearch(undefined, item)}
                  className="p-5 px-8 hover:bg-blue-50 cursor-pointer flex items-center gap-3 font-bold text-slate-700 transition-colors border-b border-slate-50 last:border-none"
                >
                  <MapPin size={18} className="text-blue-600" />
                  {item}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 4. SON YORUMLAR (Korumalı) */}
        <div className="w-full">
          <div className="flex items-center gap-2 mb-8 border-b border-slate-100 pb-4">
            <div className="p-2 bg-blue-50 rounded-lg">
              <Search className="text-blue-600" size={20} />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Son Sakin Yorumları</h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-blue-600">Beşiktaş, Türkali</h3>
                <div className="flex items-center gap-1 text-orange-500 font-bold bg-white px-2 py-1 rounded-lg border border-orange-100">
                  <Star size={14} fill="currentColor" /> 4.5
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium mb-4 italic italic leading-relaxed">"Alt kattaki fırın sabah 5'te koku yapıyor ama bina sakin..."</p>
              <div className="bg-white p-5 rounded-2xl text-sm leading-relaxed font-medium text-slate-700 border border-slate-100 shadow-inner">
                Fırın sesi dışında Beşiktaş'ın en huzurlu sokağı olabilir. Komşuluk ilişkileri çok kuvvetli, ev sahibi çok anlayışlı biri.
              </div>
            </div>

            <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <h3 className="font-bold text-blue-600">Kadıköy, Moda</h3>
                <div className="flex items-center gap-1 text-orange-500 font-bold bg-white px-2 py-1 rounded-lg border border-orange-100">
                  <Star size={14} fill="currentColor" /> 3.0
                </div>
              </div>
              <p className="text-slate-500 text-sm font-medium mb-4 italic italic leading-relaxed">"Asansörün sürekli bozulması dışında konum olarak harika..."</p>
              <div className="bg-white p-5 rounded-2xl text-sm leading-relaxed font-medium text-slate-700 border border-slate-100 shadow-inner">
                Konum muhteşem, her yere yürüme mesafesinde. Ancak bina çok eski olduğu için tesisat sorunları bitmiyor, yönetici biraz ilgisiz.
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}