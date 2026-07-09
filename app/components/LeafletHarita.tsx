"use client";
import { useEffect, useRef } from 'react';

declare global { interface Window { L: any } }

// Mobildeki IstanbulHarita'nın web karşılığı — ilçe sınırları + puan renkli bina pinleri
export default function LeafletHarita({ binalar = [] }: { binalar?: { ad: string; koordinat: string; finalPuan: number; sayi: number }[] }) {
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
      fetch('/istanbul.json').then(r => r.json()).then(geo => {
        L.geoJSON(geo, { style: { fillColor: '#94a3b8', fillOpacity: 0.15, color: '#1e293b', weight: 0.8 } }).addTo(map);
      }).catch(() => {});
      const renk = (p: number) => p >= 4.5 ? '#2563eb' : p >= 3.5 ? '#06b6d4' : p >= 2.5 ? '#eab308' : p >= 1 ? '#f97316' : '#dc2626';
      binalar.forEach(b => {
        if (!b.koordinat) return;
        const [lat, lng] = b.koordinat.split(',').map(v => parseFloat(v.trim()));
        if (isNaN(lat) || isNaN(lng)) return;
        const icon = L.divIcon({ html: `<div style="width:14px;height:14px;border-radius:50%;background:${renk(b.finalPuan)};border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`, className: '', iconAnchor: [7, 7] });
        L.marker([lat, lng], { icon }).addTo(map)
          .bindPopup(`<div style="padding:10px;min-width:150px;font-family:sans-serif"><div style="font-weight:900;font-style:italic;font-size:13px">${b.ad}</div><div style="font-size:11px;color:#94a3b8;margin:4px 0 8px">⭐ ${b.finalPuan.toFixed(1)} • ${Math.round(b.sayi)} mühür</div><a href="/bina?isim=${encodeURIComponent(b.ad)}" style="display:block;background:#2563eb;color:#fff;text-align:center;border-radius:10px;padding:7px;font-size:11px;font-weight:900;text-decoration:none">DETAYA GİT →</a></div>`);
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

  return <div ref={divRef} className="w-full h-full" />;
}
