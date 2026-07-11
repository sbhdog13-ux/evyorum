"use client";
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, MapPin, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { db } from '@/app/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';

declare global { interface Window { L: any } }

export default function HaritaPage() {
  const router = useRouter();
  const mapRef = useRef<any>(null);
  const aktifPinRef = useRef<any>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const [aramaMetni, setAramaMetni] = useState('');
  const [sonuclar, setSonuclar] = useState<any[]>([]);
  const [secilen, setSecilen] = useState<{ lat: number; lng: number; adres: string } | null>(null);
  const [adresYukleniyor, setAdresYukleniyor] = useState(false);
  const aramaTimer = useRef<any>(null);

  const pinKoy = (lat: number, lng: number, zoomla = false) => {
    const L = window.L;
    if (aktifPinRef.current) mapRef.current.removeLayer(aktifPinRef.current);
    const icon = L.divIcon({ html: '<div style="width:20px;height:20px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 2px 12px rgba(37,99,235,0.5)"></div>', className: '', iconAnchor: [10, 10] });
    aktifPinRef.current = L.marker([lat, lng], { icon }).addTo(mapRef.current);
    if (zoomla) mapRef.current.setView([lat, lng], 16, { animate: true });
    setAdresYukleniyor(true);
    setSecilen({ lat, lng, adres: '' });
    fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=tr`)
      .then(r => r.json())
      .then(j => setSecilen({ lat, lng, adres: j.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}` }))
      .catch(() => setSecilen({ lat, lng, adres: `${lat.toFixed(4)}, ${lng.toFixed(4)}` }))
      .finally(() => setAdresYukleniyor(false));
  };

  useEffect(() => {
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = async () => {
      const L = window.L;
      const bounds = L.latLngBounds(L.latLng(40.55, 27.9), L.latLng(41.65, 29.95));
      const map = L.map(mapDivRef.current, { minZoom: 9, maxZoom: 17, maxBounds: bounds, maxBoundsViscosity: 1.0, zoomControl: false });
      L.control.zoom({ position: 'bottomleft' }).addTo(map);
      map.fitBounds(bounds);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
      mapRef.current = map;

      // İlçe sınırları + İstanbul içi kontrolü (mobil ile aynı)
      let geo: any = null;
      try { geo = await fetch('/istanbul.json').then(r => r.json()); } catch {}
      if (geo) L.geoJSON(geo, { style: { fillColor: '#94a3b8', fillOpacity: 0.15, color: '#1e293b', weight: 0.8 } }).addTo(map);

      const icinde = (lat: number, lng: number): boolean => {
        if (!geo?.features) return false;
        const nokta = (x: number, y: number, poly: number[][]) => {
          let ic = false;
          for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
            const [xi, yi] = poly[i], [xj, yj] = poly[j];
            if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) ic = !ic;
          }
          return ic;
        };
        for (const f of geo.features) {
          const polys = f.geometry.type === 'MultiPolygon' ? f.geometry.coordinates : [f.geometry.coordinates];
          for (const p of polys) for (const ring of p) if (nokta(lng, lat, ring)) return true;
        }
        return false;
      };

      // Tarayıcı konumu — mobil KonumSecim gibi konuma odaklan
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => {
          const { latitude: la, longitude: lo } = pos.coords;
          if (la < 40.55 || la > 41.65 || lo < 27.9 || lo > 29.95) return;
          const kIcon = L.divIcon({ html: '<div style="width:16px;height:16px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 4px rgba(37,99,235,0.3)"></div>', className: '', iconAnchor: [8, 8] });
          L.marker([la, lo], { icon: kIcon }).addTo(map);
          map.setView([la, lo], 15);
        }, () => {});
      }

      map.on('click', (e: any) => {
        if (!icinde(e.latlng.lat, e.latlng.lng)) return;
        pinKoy(e.latlng.lat, e.latlng.lng);
      });

      // Mühürlenmiş binalar (mobil renk skalası)
      const renk = (p: number) => p >= 4.5 ? '#2563eb' : p >= 3.5 ? '#06b6d4' : p >= 2.5 ? '#eab308' : p >= 1 ? '#f97316' : '#dc2626';
      const snap = await getDocs(collection(db, 'yorumlar'));
      const binaMap: any = {};
      snap.docs.forEach(d => {
        const v: any = d.data();
        const ad = (v.yeni_bina_adi || v.bina_adi || '').trim();
        if (!ad || !v.koordinat?.lat) return;
        if (!binaMap[ad]) binaMap[ad] = { lat: v.koordinat.lat, lng: v.koordinat.lng, top: 0, sayi: 0 };
        binaMap[ad].top += v.puan || 0; binaMap[ad].sayi += 1;
      });
      Object.entries(binaMap).forEach(([ad, b]: any) => {
        const puan = b.sayi ? (b.top / b.sayi).toFixed(1) : '0';
        const icon = L.divIcon({ html: `<div style="width:14px;height:14px;border-radius:50%;background:${renk(Number(puan))};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`, className: '', iconAnchor: [7, 7] });
        L.marker([b.lat, b.lng], { icon }).addTo(map)
          .bindPopup(`<div style="padding:10px;min-width:150px;font-family:sans-serif"><div style="font-weight:900;font-style:italic;font-size:13px">${ad}</div><div style="font-size:11px;color:#94a3b8;margin:4px 0 8px">⭐ ${puan} • ${b.sayi} mühür</div><a href="/bina?isim=${encodeURIComponent(ad)}" style="display:block;background:#2563eb;color:#fff;text-align:center;border-radius:10px;padding:7px;font-size:11px;font-weight:900;text-decoration:none">DETAYA GİT →</a></div>`);
      });
    };
    document.head.appendChild(script);
    return () => { mapRef.current?.remove(); };
  }, []);

  const aramaYap = (m: string) => {
    setAramaMetni(m);
    clearTimeout(aramaTimer.current);
    if (!m.trim()) { setSonuclar([]); return; }
    aramaTimer.current = setTimeout(async () => {
      try {
        const r = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(m + ' İstanbul')}&format=json&limit=5&bounded=1&viewbox=27.9,41.65,29.95,40.55&accept-language=tr`);
        setSonuclar(await r.json() || []);
      } catch { setSonuclar([]); }
    }, 500);
  };

  return (
    <div className="h-screen w-screen relative bg-white">
      <div ref={mapDivRef} className="absolute inset-0 z-0" />

      {/* Üst bar + arama (mobil KonumSecim düzeni) */}
      <div className="absolute top-4 left-4 right-4 z-[1000] max-w-xl mx-auto space-y-2">
        <div className="flex items-center gap-3 bg-white rounded-2xl shadow-xl px-4 py-3">
          <button onClick={() => router.push('/')} className="p-1"><ArrowLeft size={18} /></button>
          <div className="flex-1">
            <div className="font-black uppercase italic text-[13px] leading-none">HARİTA ÜZERİNDEN SEÇ</div>
            <div className="text-[10px] font-bold text-slate-400 mt-0.5">Mühürlemek istediğin konuma dokun</div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white rounded-2xl shadow-xl px-4 py-3">
          <Search size={15} className="text-slate-400" />
          <input value={aramaMetni} onChange={e => aramaYap(e.target.value)} placeholder="İlçe, sokak veya bina ara..." className="flex-1 text-[13px] font-medium outline-none" />
          {aramaMetni && <button onClick={() => { setAramaMetni(''); setSonuclar([]); }}><X size={15} className="text-slate-400" /></button>}
        </div>
        {sonuclar.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
            {sonuclar.map((s: any, i) => (
              <button key={i} onClick={() => { setAramaMetni(''); setSonuclar([]); pinKoy(parseFloat(s.lat), parseFloat(s.lon), true); }} className="w-full flex items-start gap-2 px-4 py-3 text-left border-b border-slate-50 hover:bg-[#e8f3fa] transition-colors">
                <MapPin size={13} className="text-blue-600 mt-0.5 shrink-0" />
                <span className="text-[12px] font-medium text-slate-700 line-clamp-2">{s.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Konum onay paneli (mobil ile aynı akış) */}
      {secilen && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white rounded-t-[2rem] shadow-2xl p-6 max-w-xl mx-auto">
          <div className="flex items-center gap-2 mb-3"><MapPin size={18} className="text-blue-600" /><span className="font-black uppercase italic text-[14px] text-blue-600">KONUM SEÇİLDİ</span></div>
          {adresYukleniyor ? <div className="text-[12px] text-slate-400 py-3">Adres alınıyor...</div> : <p className="text-[13px] font-medium text-slate-700 mb-2 line-clamp-3">{secilen.adres}</p>}
          <p className="text-[11px] text-slate-400 mb-4">Bu konuma ait binayı mühürlemek ister misin?</p>
          <button disabled={adresYukleniyor} onClick={() => router.push(`/bina-olustur?koordinat=${encodeURIComponent(`${secilen.lat}, ${secilen.lng}`)}`)} className="w-full bg-blue-600 text-white rounded-2xl py-4 font-black uppercase italic text-[13px] hover:bg-[#023E56] transition-all">MÜHÜRLE →</button>
          <button onClick={() => setSecilen(null)} className="w-full py-3 text-[12px] font-bold text-slate-400">Farklı konum seç</button>
        </div>
      )}
    </div>
  );
}
