"use client";
// Yeniden-kullanılabilir sokak görünümü paneli — 3 haritada da (harita/arama/bina-olustur) aynı deneyim.
// Leaflet zemin BEDAVA kalır; bu bileşen sadece açılınca Google devreye girer (Bulevini-Maps projesi, kotalı).
// Sokakta gezdikçe (position_changed) adres yeniden çözülür → onAdres ile üst panele bildirilir.
import { useEffect, useRef } from 'react';

declare global { interface Window { google: any } }
const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

// Google Maps JS SDK'sını tek sefer yükler (birden çok panel/harita çağırsa da bir kez).
let googleYukleme: Promise<void> | null = null;
function googleYukle(): Promise<void> {
  if (typeof window !== 'undefined' && window.google?.maps) return Promise.resolve();
  if (!googleYukleme) {
    googleYukleme = new Promise<void>((res, rej) => {
      if (!KEY) return rej(new Error('NEXT_PUBLIC_GOOGLE_MAPS_KEY yok'));
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&language=tr&region=TR`;
      s.async = true; s.onload = () => res(); s.onerror = () => rej(new Error('Google Maps yüklenemedi'));
      document.head.appendChild(s);
    });
  }
  return googleYukleme;
}

type Props = {
  lat: number;
  lng: number;
  onAdres?: (adres: string) => void;
  className?: string;
  style?: React.CSSProperties;
};

export default function SokakGorunumu({ lat, lng, onAdres, className, style }: Props) {
  const divRef = useRef<HTMLDivElement>(null);
  const panoRef = useRef<any>(null);
  const geoRef = useRef<any>(null);
  const svcRef = useRef<any>(null);
  const onAdresRef = useRef(onAdres);
  onAdresRef.current = onAdres;

  // Noktaya en yakın gerçek sokak görüntüsünü bulup panoramaya yerleştirir (görüntü yoksa siyah kalmaz).
  const konumla = (la: number, ln: number) => {
    const g = window.google;
    if (!panoRef.current || !svcRef.current) return;
    svcRef.current.getPanorama({ location: { lat: la, lng: ln }, radius: 120, source: g.maps.StreetViewSource.OUTDOOR }, (data: any, status: string) => {
      if (status === 'OK' && data?.location?.pano) {
        panoRef.current.setPano(data.location.pano);
        panoRef.current.setPov({ heading: 210, pitch: 5 });
      } else {
        panoRef.current.setPosition({ lat: la, lng: ln });
      }
      panoRef.current.setVisible(true);
      // Görünür olunca yeniden boyutlandır (birkaç kez — layout otursun, tile'lar siyah kalmasın)
      [60, 260, 600].forEach((ms) => setTimeout(() => panoRef.current && g.maps.event.trigger(panoRef.current, 'resize'), ms));
    });
  };

  useEffect(() => {
    let iptal = false;
    googleYukle().then(() => {
      if (iptal || !divRef.current) return;
      const g = window.google;
      if (!geoRef.current) geoRef.current = new g.maps.Geocoder();
      if (!svcRef.current) svcRef.current = new g.maps.StreetViewService();
      if (!panoRef.current) {
        panoRef.current = new g.maps.StreetViewPanorama(divRef.current, {
          pov: { heading: 210, pitch: 5 }, zoom: 0,
          addressControl: false, motionTracking: false, fullscreenControl: true,
        });
        // Sokakta her adım (konum değişimi) → adres yeniden çözülür
        panoRef.current.addListener('position_changed', () => {
          const pos = panoRef.current.getPosition(); if (!pos) return;
          geoRef.current.geocode({ location: pos }, (r: any, st: string) => {
            if (st === 'OK' && r[0]) onAdresRef.current?.(r[0].formatted_address);
          });
        });
      }
      konumla(lat, lng);
    }).catch(() => {});
    return () => { iptal = true; };
  }, []);

  // lat/lng değişince (yeni pin) panoramayı taşı
  useEffect(() => {
    if (!panoRef.current || !window.google) return;
    konumla(lat, lng);
  }, [lat, lng]);

  return <div ref={divRef} className={className} style={style} />;
}
