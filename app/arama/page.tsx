"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Star, MapPin, ArrowLeft, Filter, Search } from 'lucide-react';
import { Suspense, useState, useEffect } from 'react';

// Örnek Veri Seti
const ALL_BUILDINGS = [
  { id: 1, name: "Beşiktaş Palas", district: "Beşiktaş", neighborhood: "Bebek", street: "Cevdet Paşa", rating: 4.8, commentCount: 24, image: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=500&q=80" },
  { id: 9, name: "Moda Sahil", district: "Kadıköy", neighborhood: "Caferağa", street: "Moda Caddesi", rating: 4.7, commentCount: 21, image: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?w=500&q=80" },
];

const ISTANBUL_DISTRICTS = ["Beşiktaş", "Kadıköy", "Şişli", "Üsküdar", "Fatih"]; // Liste uzatılabilir

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query')?.toLowerCase() || "";
  
  // Filtreleme ve Öneri State'leri
  const [filterValues, setFilterValues] = useState({ district: "", neighborhood: "", street: "", building: "" });
  const [activeSuggestions, setActiveSuggestions] = useState<{key: string, list: string[]}>({ key: "", list: [] });

  // Akıllı Tamamlama Mantığı
  const handleInputChange = (key: string, value: string) => {
    setFilterValues(prev => ({ ...prev, [key]: value }));
    
    if (value.length >= 3) {
      // Örnek: İlçe için filtreleme (Diğerleri için de benzer mantık kurulabilir)
      const suggestions = ISTANBUL_DISTRICTS.filter(d => 
        d.toLowerCase().includes(value.toLowerCase())
      );
      setActiveSuggestions({ key, list: suggestions });
    } else {
      setActiveSuggestions({ key: "", list: [] });
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-10">
          <Link href="/" className="flex items-center gap-2 text-slate-400 font-bold mb-6 hover:text-black transition-colors text-xs uppercase italic">
            <ArrowLeft size={14} /> Aramaya Dön
          </Link>
          
          <h1 className="text-xl font-bold tracking-tight text-slate-400">
            <span className="text-blue-600 font-black italic uppercase tracking-tighter mr-2">"{query.toUpperCase()}"</span> 
            için İstanbul sonuçları listeleniyor.
          </h1>
        </div>

        <div className="flex gap-12 flex-row-reverse"> {/* Filtreyi sola almak için row-reverse kullandık */}
          
          {/* SAĞ TARAF: Sonuç Listesi */}
          <div className="flex-1 space-y-6">
            {ALL_BUILDINGS.map((building) => (
              <Link href={`/bina/${building.id}`} key={building.id} className="block group">
                <div className="border border-slate-100 p-6 rounded-[2.5rem] group-hover:shadow-xl transition-all duration-300 flex gap-6 items-center bg-white shadow-sm">
                  <img src={building.image} className="w-28 h-28 rounded-3xl object-cover border border-slate-100" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-xl text-slate-800">{building.name}</h3>
                      <div className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1 rounded-full text-xs font-bold">
                        <Star size={14} fill="currentColor" /> {building.rating}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-slate-400 font-medium text-sm mb-4">
                      <MapPin size={14} /> {building.district}, {building.neighborhood}
                    </div>
                    <div className="flex justify-between items-center text-blue-600 font-bold text-sm italic underline underline-offset-4 cursor-pointer">
                      <span>{building.commentCount} Yorum →</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* SOL TARAF: Filtreleme Sütunu */}
          <div className="w-80 shrink-0">
            <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 sticky top-8">
              <div className="flex items-center gap-2 mb-8 text-slate-800 font-bold uppercase text-xs tracking-widest">
                <Filter size={16} className="text-blue-600" /> Filtrele
              </div>
              
              <div className="space-y-6">
                {[
                  { label: "İlçe", key: "district", placeholder: "İlçe yazın..." },
                  { label: "Mahalle", key: "neighborhood", placeholder: "Mahalle yazın..." },
                  { label: "Sokak", key: "street", placeholder: "Sokak yazın..." },
                  { label: "Bina", key: "building", placeholder: "Bina adı yazın..." }
                ].map((f) => (
                  <div key={f.key} className="relative">
                    <label className="block text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest ml-1">{f.label}</label>
                    <input 
                      type="text" 
                      value={filterValues[f.key as keyof typeof filterValues]}
                      onChange={(e) => handleInputChange(f.key, e.target.value)}
                      placeholder={f.placeholder}
                      className="w-full p-4 bg-white border border-slate-200 rounded-2xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-600/20 transition-all placeholder:text-slate-300 text-black shadow-inner"
                    />
                    
                    {/* Filtre İçi Akıllı Listeleme */}
                    {activeSuggestions.key === f.key && activeSuggestions.list.length > 0 && (
                      <div className="absolute z-50 top-full left-0 right-0 mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl max-h-40 overflow-y-auto">
                        {activeSuggestions.list.map((item, idx) => (
                          <div 
                            key={idx}
                            onClick={() => {
                              setFilterValues(prev => ({ ...prev, [f.key]: item }));
                              setActiveSuggestions({ key: "", list: [] });
                            }}
                            className="p-3 px-5 hover:bg-blue-50 cursor-pointer text-xs font-bold text-slate-700 transition-colors border-b border-slate-50 last:border-none"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                
                <button className="w-full bg-black text-white p-4 rounded-2xl font-bold text-xs uppercase tracking-widest mt-4 hover:bg-blue-600 transition-all active:scale-95">
                  Filtreleri Uygula
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function SearchResults() {
  return (
    <Suspense fallback={<div className="p-20 text-center font-bold italic text-slate-300 tracking-widest uppercase">Yükleniyor...</div>}>
      <SearchContent />
    </Suspense>
  );
}