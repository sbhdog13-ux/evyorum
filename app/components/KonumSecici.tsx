"use client";
import { useEffect, useRef } from 'react';
import { useSehir } from '@/app/lib/sehir';
import { useLang } from '@/app/lib/i18n';
import { KARO_ADRES, KARO_KATKI } from '@/app/lib/harita';

declare global { interface Window { L: any } }

// Bina Oluştur içine gömülü "dokun-seç" haritası — /harita sayfasının küçük kardeşi.
// Kutu, merkez ve ilçe sınırları seçili şehirden gelir (app/lib/sehirler.ts).
export default function KonumSecici({ koordinat, onSec, salt = false }: { koordinat?: string; onSec: (lat: number, lng: number) => void; salt?: boolean }) {
  const mapRef = useRef<any>(null);
  const pinRef = useRef<any>(null);
  const divRef = useRef<HTMLDivElement>(null);
  const geoRef = useRef<any>(null);
  const onSecRef = useRef(onSec);
  onSecRef.current = onSec;
  const { sehir, sehirKod } = useSehir();
  const { t } = useLang();

  // Nokta seçili şehrin ilçe poligonları içinde mi (harita/mobil ile aynı kontrol)
  const sehirIcinde = (lat: number, lng: number): boolean => {
    const geo = geoRef.current;
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

  const pinKoy = (lat: number, lng: number, zoomla = false) => {
    const L = window.L;
    if (!mapRef.current || !L) return;
    if (pinRef.current) mapRef.current.removeLayer(pinRef.current);
    const icon = L.divIcon({ html: '<div style="width:30px;height:30px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);background:#2563eb;border:2px solid #fff;box-shadow:-1px 2px 6px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center"><div style="width:9px;height:9px;border-radius:50%;background:rgba(255,255,255,0.9);transform:rotate(45deg)"></div></div>', className: '', iconAnchor: [15, 32] });
    pinRef.current = L.marker([lat, lng], { icon }).addTo(mapRef.current);
    if (zoomla) mapRef.current.setView([lat, lng], 16, { animate: true });
  };

  useEffect(() => {
    let iptal = false;
    const kur = () => {
      if (iptal || !window.L || !divRef.current || mapRef.current) return;
      const L = window.L;
      const { guney, bati, kuzey, dogu } = sehir.kutu;
      const bounds = L.latLngBounds(L.latLng(guney, bati), L.latLng(kuzey, dogu));
      const map = L.map(divRef.current, { minZoom: 9, maxZoom: 17, maxBounds: bounds, maxBoundsViscosity: 1.0, zoomControl: false, dragging: !salt, scrollWheelZoom: !salt, touchZoom: !salt, doubleClickZoom: !salt });
      if (!salt) L.control.zoom({ position: 'bottomright' }).addTo(map);
      L.tileLayer(KARO_ADRES, { maxZoom: 19, attribution: KARO_KATKI }).addTo(map);
      mapRef.current = map;
      // Mevcut koordinat varsa oraya odaklan, yoksa seçili şehrin geneli
      const k = (koordinat || '').split(',').map(x => parseFloat(x.trim()));
      if (k.length === 2 && !isNaN(k[0]) && !isNaN(k[1])) {
        map.setView([k[0], k[1]], 16);
        pinKoy(k[0], k[1]);
      } else {
        map.fitBounds(bounds);
      }
      if (!salt) map.on('click', (e: any) => {
        const { lat, lng } = e.latlng;
        if (geoRef.current && !sehirIcinde(lat, lng)) {
          map.flyTo(sehir.merkez, 11);
          alert(t('sehir.disarida').split('{sehir}').join(sehir.ad));
          return;
        }
        pinKoy(lat, lng);
        onSecRef.current(lat, lng);
      });
      // İlçe sınırları — keşfet haritasıyla aynı görünüm (şehrin dosyası yoksa sınır çizilmez, kısıt da uygulanmaz)
      geoRef.current = null;
      if (sehir.ilceSinirlari) {
        fetch(sehir.ilceSinirlari).then(r => r.json()).then(geo => {
          if (iptal || mapRef.current !== map) return;
          geoRef.current = geo;
          L.geoJSON(geo, { style: { fillColor: '#94a3b8', fillOpacity: 0.12, color: '#1e293b', weight: 0.8 } }).addTo(map);
        }).catch(() => {});
      }
    };

    let bekleyen: HTMLScriptElement | null = null;
    if (window.L) { kur(); }
    else {
      if (!document.querySelector('link[href*="leaflet.css"]')) {
        const css = document.createElement('link');
        css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(css);
      }
      const mevcut = document.querySelector('script[src*="leaflet.js"]') as HTMLScriptElement | null;
      if (mevcut) { mevcut.addEventListener('load', kur); bekleyen = mevcut; }
      else {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = kur;
        document.body.appendChild(script);
      }
    }

    return () => {
      iptal = true;
      bekleyen?.removeEventListener('load', kur);
      mapRef.current?.remove(); mapRef.current = null; pinRef.current = null;
    };
  }, [sehirKod]);

  // Dışarıdan koordinat değişirse (elle yazma / ADRES ÇEK) pini güncelle
  useEffect(() => {
    const k = (koordinat || '').split(',').map(x => parseFloat(x.trim()));
    if (k.length === 2 && !isNaN(k[0]) && !isNaN(k[1]) && mapRef.current) {
      pinKoy(k[0], k[1], true);
    }
  }, [koordinat]);

  return <div ref={divRef} className="w-full h-full min-h-[280px]" />;
}
