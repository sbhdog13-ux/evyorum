"use client";
import { useEffect, useRef } from 'react';

declare global { interface Window { L: any } }

// Bina Oluştur içine gömülü "dokun-seç" haritası — /harita sayfasının küçük kardeşi
export default function KonumSecici({ koordinat, onSec }: { koordinat?: string; onSec: (lat: number, lng: number) => void }) {
  const mapRef = useRef<any>(null);
  const pinRef = useRef<any>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const onSecRef = useRef(onSec);
  onSecRef.current = onSec;

  const pinKoy = (lat: number, lng: number, zoomla = false) => {
    const L = window.L;
    if (!mapRef.current || !L) return;
    if (pinRef.current) mapRef.current.removeLayer(pinRef.current);
    const icon = L.divIcon({ html: '<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#2563eb;border:2px solid #fff;box-shadow:-1px 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center"><div style="width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,0.9);transform:rotate(45deg)"></div></div>', className: '', iconAnchor: [15, 32] });
    pinRef.current = L.marker([lat, lng], { icon }).addTo(mapRef.current);
    if (zoomla) mapRef.current.setView([lat, lng], 16, { animate: true });
  };

  useEffect(() => {
    const kur = () => {
      if (!divRef.current || mapRef.current) return;
      const L = window.L;
      const bounds = L.latLngBounds(L.latLng(40.55, 27.9), L.latLng(41.65, 29.95));
      const map = L.map(divRef.current, { minZoom: 9, maxZoom: 17, maxBounds: bounds, maxBoundsViscosity: 1.0, zoomControl: false });
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 19 }).addTo(map);
      mapRef.current = map;
      // Mevcut koordinat varsa oraya odaklan, yoksa İstanbul geneli
      const k = (koordinat || '').split(',').map(x => parseFloat(x.trim()));
      if (k.length === 2 && !isNaN(k[0]) && !isNaN(k[1])) {
        map.setView([k[0], k[1]], 16);
        pinKoy(k[0], k[1]);
      } else {
        map.fitBounds(bounds);
      }
      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        pinKoy(lat, lng);
        onSecRef.current(lat, lng);
      });
    };

    if (window.L) { kur(); return; }
    if (!document.querySelector('link[href*="leaflet.css"]')) {
      const css = document.createElement('link');
      css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
      document.head.appendChild(css);
    }
    const mevcut = document.querySelector('script[src*="leaflet.js"]') as HTMLScriptElement | null;
    if (mevcut) { mevcut.addEventListener('load', kur); return; }
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    script.onload = kur;
    document.body.appendChild(script);

    return () => { mapRef.current?.remove(); mapRef.current = null; };
  }, []);

  // Dışarıdan koordinat değişirse (elle yazma / ADRES ÇEK) pini güncelle
  useEffect(() => {
    const k = (koordinat || '').split(',').map(x => parseFloat(x.trim()));
    if (k.length === 2 && !isNaN(k[0]) && !isNaN(k[1]) && mapRef.current) {
      pinKoy(k[0], k[1], true);
    }
  }, [koordinat]);

  return <div ref={divRef} className="w-full h-full min-h-[280px]" />;
}
