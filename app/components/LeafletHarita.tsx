"use client";
import { useEffect, useRef } from 'react';
import { slugify } from '@/app/lib/slug';

declare global { interface Window { L: any } }

// Mobildeki IstanbulHarita'nın web karşılığı — ilçe sınırları + puan renkli bina pinleri
export default function LeafletHarita({ binalar = [], ilcePuanlari = {}, legend = false }: { binalar?: { ad: string; koordinat: string; finalPuan: number; sayi: number }[]; ilcePuanlari?: { [ilce: string]: { toplam: number; sayi: number } }; legend?: boolean }) {
  const divRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);

  useEffect(() => {
    const init = () => {
      if (!window.L || !divRef.current || mapRef.current) return;
      const L = window.L;
      const bounds = L.latLngBounds(L.latLng(40.55, 27.9), L.latLng(41.65, 29.95));
      const map = L.map(divRef.current, { minZoom: 9, maxZoom: 17, maxBounds: bounds, maxBoundsViscosity: 1.0, zoomControl: false });
      L.control.zoom({ position: 'bottomleft' }).addTo(map);
      map.fitBounds(bounds);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
      mapRef.current = map;
      const ilceRenk = (o: number) => o <= 0 ? '#94a3b8' : o >= 4 ? '#16a34a' : o >= 2.5 ? '#fbbf24' : '#dc2626';
      fetch('/istanbul.json').then(r => r.json()).then(geo => {
        L.geoJSON(geo, { style: (f: any) => {
          const ilce = (f.properties.name || '').toUpperCase().trim();
          const v = (ilcePuanlari as any)[ilce];
          const o = v ? v.toplam / v.sayi : 0;
          return { fillColor: ilceRenk(o), fillOpacity: 0.25, color: '#1e293b', weight: 0.8 };
        } }).addTo(map);
      }).catch(() => {});
      const renk = (p: number) => p >= 4 ? '#16a34a' : p >= 2.5 ? '#eab308' : p >= 1 ? '#f97316' : '#dc2626';
      binalar.forEach(b => {
        if (!b.koordinat) return;
        const [lat, lng] = b.koordinat.split(',').map(v => parseFloat(v.trim()));
        if (isNaN(lat) || isNaN(lng)) return;
        const icon = L.divIcon({ html: `<div style="width:24px;height:24px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:${renk(b.finalPuan)};border:2px solid #fff;box-shadow:-1px 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center"><div style="width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,0.9);transform:rotate(45deg)"></div></div>`, className: '', iconAnchor: [12, 26] });
        L.marker([lat, lng], { icon }).addTo(map)
          .bindPopup(`<div style="padding:10px;min-width:150px;font-family:sans-serif"><div style="font-weight:900;font-style:italic;font-size:13px">${b.ad}</div><div style="font-size:11px;color:#94a3b8;margin:4px 0 8px">⭐ ${b.finalPuan.toFixed(1)} • ${Math.round(b.sayi)} mühür</div><a href="/bina/${slugify(b.ad)}" style="display:block;background:#2563eb;color:#fff;text-align:center;border-radius:10px;padding:7px;font-size:11px;font-weight:900;text-decoration:none">DETAYA GİT →</a></div>`);
      });
    };

    if (window.L) { init(); }
    else {
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const css = document.createElement('link');
        css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);
      }
      const s = document.createElement('script');
      s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
      s.onload = init;
      document.head.appendChild(s);
    }
    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, [binalar]);

  return (
    <div className="w-full h-full relative">
      <div ref={divRef} className="w-full h-full" />
      {legend && (
        <div className="absolute bottom-6 right-3 z-[1000] bg-black/85 rounded-2xl px-3.5 py-3 space-y-1">
          <div className="text-[8px] font-black italic text-slate-400 tracking-widest">MÜHÜR ANALİZİ</div>
          {[['#16a34a', '4.0–5.0 MÜKEMMEL'], ['#fbbf24', '2.5–4.0 ORTALAMA'], ['#dc2626', '0.0–2.5 SORUNLU']].map(([r, t]) => (
            <div key={t} className="flex items-center gap-2"><span className="w-2 h-2 rounded-full shrink-0" style={{ background: r }} /><span className="text-[8px] font-black text-white">{t}</span></div>
          ))}
        </div>
      )}
    </div>
  );
}
