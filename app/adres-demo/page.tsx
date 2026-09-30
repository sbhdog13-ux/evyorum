"use client";
// GEÇİCİ DEMO — yeni adres deneyimi: (1) GPS ile haritayı kullanıcının yerinde aç,
// (2) Google Places ile yaz-ve-seç arama, (3) seçilen noktanın 360° sokak görünümü.
// Ayrı dalda; gerçek akışa dokunmaz. Google Maps JS SDK (client key) kullanır.
import { useEffect, useRef, useState } from 'react';

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

export default function AdresDemo() {
  const mapDiv = useRef<HTMLDivElement>(null);
  const svDiv = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [adres, setAdres] = useState('');
  const [durum, setDurum] = useState('📍 Konumun alınıyor…');

  useEffect(() => {
    const yukle = () => new Promise<void>((res) => {
      if ((window as any).google?.maps) return res();
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&libraries=places&language=tr&region=TR`;
      s.async = true; s.onload = () => res();
      document.head.appendChild(s);
    });

    yukle().then(() => {
      const g = (window as any).google;
      const istanbul = { lat: 41.0082, lng: 28.9784 };
      const map = new g.maps.Map(mapDiv.current, { center: istanbul, zoom: 15, disableDefaultUI: false, mapTypeControl: false, streetViewControl: false });
      const marker = new g.maps.Marker({ map, position: istanbul, animation: g.maps.Animation.DROP });
      const sv = new g.maps.StreetViewPanorama(svDiv.current, { position: istanbul, pov: { heading: 210, pitch: 8 }, zoom: 0, addressControl: false, fullscreenControl: true });
      const geocoder = new g.maps.Geocoder();

      const guncelle = (loc: any, label?: string) => {
        map.panTo(loc); map.setZoom(17); marker.setPosition(loc); sv.setPosition(loc);
        if (label) setAdres(label);
        else geocoder.geocode({ location: loc }, (r: any, st: string) => { if (st === 'OK' && r[0]) setAdres(r[0].formatted_address); });
      };

      // (1) GPS — haritayı kullanıcının yerinde aç
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (pos) => { const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude }; guncelle(loc); setDurum('✅ Buradasın (GPS)'); },
          () => setDurum('ℹ️ Konum izni verilmedi — İstanbul merkez. Aramadan da bulabilirsin.'),
        );
      } else { setDurum('İstanbul merkez'); }

      // (2) Google Places — yaz ve seç
      const ac = new g.maps.places.Autocomplete(inputRef.current, {
        componentRestrictions: { country: 'tr' },
        fields: ['geometry', 'formatted_address', 'name'],
      });
      ac.bindTo('bounds', map);
      ac.addListener('place_changed', () => {
        const p = ac.getPlace();
        if (!p.geometry) return;
        const loc = { lat: p.geometry.location.lat(), lng: p.geometry.location.lng() };
        guncelle(loc, p.formatted_address || p.name);
        setDurum('✅ Seçildi');
      });

      // Haritaya dokununca da nokta seçilsin (yedek)
      map.addListener('click', (e: any) => guncelle({ lat: e.latLng.lat(), lng: e.latLng.lng() }));
    });
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-[#0f172a] font-sans p-4 md:p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-[11px] font-black italic uppercase tracking-[2px] text-amber-500">Geçici Demo · yeni adres deneyimi</div>
        <h1 className="font-black italic uppercase tracking-tighter text-[26px] text-[#023E56] mt-1">Adresini Bul</h1>

        {/* (2) Yaz-ve-seç arama */}
        <input ref={inputRef} placeholder="Bina adı, cadde veya adres yaz…"
          className="mt-4 w-full h-14 bg-white border-2 border-slate-200 rounded-2xl px-5 text-[14px] font-bold outline-none focus:border-[#023E56] shadow-sm" />
        <div className="text-[12px] font-bold text-slate-500 mt-2">{durum}</div>

        {/* (1) Harita — GPS ile yerinde açılır */}
        <div ref={mapDiv} className="mt-4 w-full h-[300px] rounded-[1.5rem] overflow-hidden border border-slate-200 shadow-md bg-slate-100" />

        {/* (3) Sokak görünümü — seçilen noktanın 360°'si */}
        <div className="mt-3 rounded-[1.5rem] overflow-hidden border border-slate-200 shadow-md bg-black">
          <div className="px-4 py-2 bg-[#023E56] text-white text-[12px] font-black italic uppercase flex justify-between">
            <span>360° Sokak Görünümü</span><span className="text-[#A1CDE9]">sürükle · gez</span>
          </div>
          <div ref={svDiv} className="w-full h-[260px]" />
        </div>

        {/* Otomatik dolan adres */}
        <div className="mt-4 bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="text-[10px] font-black uppercase italic text-blue-600 tracking-widest">Otomatik dolan adres</div>
          <div className="text-[15px] font-bold text-slate-700 mt-1 min-h-[24px]">{adres || '—'}</div>
        </div>
      </div>
    </div>
  );
}
