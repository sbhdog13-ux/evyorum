"use client";
import React, { useMemo, useState, useCallback, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, MarkerF, InfoWindowF } from '@react-google-maps/api';
import { useRouter } from 'next/navigation';
import { Star } from 'lucide-react';

interface MapProps {
  koordinat: string;
  items?: any[];
  isInteractive?: boolean;
  onRegionSelect?: (ilce: string) => void;
}

export default function GoogleHarita({ koordinat, items, isInteractive = false, onRegionSelect }: MapProps) {
  const router = useRouter();
  const [selectedBina, setSelectedBina] = useState<any>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(11);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: "AIzaSyDRejr9Dmhfx2sy0KobX7RbKvdREPFxQ30",
  });

  const ilcePuanlari = useMemo(() => {
    if (!items) return {};
    const ozet: { [key: string]: { toplam: number; sayi: number } } = {};
    items.forEach(item => {
      const ilce = item.ilce?.toUpperCase().trim();
      if (!ilce) return;
      if (!ozet[ilce]) ozet[ilce] = { toplam: 0, sayi: 0 };
      ozet[ilce].toplam += (item.toplamPuan / item.sayi);
      ozet[ilce].sayi += 1;
    });
    return ozet;
  }, [items]);

  const setMapStyle = useCallback((mapInstance: google.maps.Map) => {
    // Sadece interaktif modda (arama sayfası) GeoJSON stilini uygula
    if (!isInteractive) {
      mapInstance.data.setStyle({ visible: false });
      return;
    }

    mapInstance.data.setStyle((feature) => {
      const ilceAdi = ((feature.getProperty('name') || feature.getProperty('NAME')) as string)?.toUpperCase();
      const veri = ilcePuanlari[ilceAdi];
      const ortalama = veri ? (veri.toplam / veri.sayi) : 0;
      const currentZoom = mapInstance.getZoom() || 11;

      let renk = "#94a3b8";
      if (ortalama > 0) {
        if (ortalama >= 4.0) renk = "#2563eb";
        else if (ortalama >= 2.5) renk = "#fbbf24";
        else renk = "#dc2626";
      }

      return {
        fillColor: renk,
        fillOpacity: currentZoom >= 14 ? 0 : 0.25,
        strokeColor: "#1e293b",
        strokeWeight: currentZoom >= 14 ? 0 : 0.8,
        visible: currentZoom < 14
      };
    });
  }, [ilcePuanlari, isInteractive]);

  useEffect(() => {
    if (map) setMapStyle(map);
  }, [zoomLevel, map, setMapStyle]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    if (isInteractive) {
      mapInstance.data.loadGeoJson('/istanbul.json');
    }
    setMapStyle(mapInstance);

    mapInstance.data.addListener('click', (event: any) => {
      const ilce = (event.feature.getProperty('name') || event.feature.getProperty('NAME'))?.toUpperCase();
      if (ilce && onRegionSelect) {
        onRegionSelect(ilce);
        const bounds = new google.maps.LatLngBounds();
        event.feature.getGeometry().forEachLatLng((latlng: any) => bounds.extend(latlng));
        mapInstance.fitBounds(bounds);
      }
    });
  }, [onRegionSelect, setMapStyle, isInteractive]);

  const center = useMemo(() => {
    if (!koordinat) return { lat: 41.0082, lng: 28.9784 };
    const [lat, lng] = koordinat.split(',').map(n => parseFloat(n.trim()));
    return { lat: lat || 41.0082, lng: lng || 28.9784 };
  }, [koordinat]);

  if (!isLoaded) return <div className="h-full bg-slate-100 animate-pulse rounded-[2.5rem]" />;

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        onLoad={onLoad}
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={center}
        zoom={isInteractive ? 11 : 16}
        onZoomChanged={() => {
          if (map) setZoomLevel(map.getZoom() || 11);
        }}
        options={{ 
          disableDefaultUI: true, 
          zoomControl: isInteractive,
          styles: [{ featureType: "poi", elementType: "labels", stylers: [{ visibility: "off" }] }]
        }}
      >
        {/* KRİTİK GÜNCELLEME BURADA */}
        {!isInteractive ? (
          // Bina Karnesi: Tek bir mühür pini göster
          <MarkerF 
            position={center} 
            icon={{
              path: google.maps.SymbolPath.CIRCLE,
              scale: 10,
              fillColor: "#2563eb",
              fillOpacity: 1,
              strokeWeight: 2,
              strokeColor: "#ffffff"
            }}
          />
        ) : (
          // Arama Sayfası: Listelenen binaları göster
          (zoomLevel >= 14) && items?.map((bina, idx) => {
            if (!bina.koordinat) return null;
            const [lat, lng] = bina.koordinat.split(',').map((n: string) => parseFloat(n.trim()));
            const ortalama = (bina.toplamPuan / bina.sayi);
            return (
              <MarkerF
                key={idx}
                position={{ lat, lng }}
                onClick={() => setSelectedBina(bina)}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 7,
                  fillColor: ortalama >= 4 ? "#2563eb" : ortalama >= 2.5 ? "#fbbf24" : "#dc2626",
                  fillOpacity: 1,
                  strokeWeight: 1.5,
                  strokeColor: "#ffffff"
                }}
              />
            );
          })
        )}

        {selectedBina && (
          <InfoWindowF
            position={{
              lat: parseFloat(selectedBina.koordinat.split(',')[0]),
              lng: parseFloat(selectedBina.koordinat.split(',')[1])
            }}
            onCloseClick={() => setSelectedBina(null)}
          >
            <div className="p-2 max-w-[180px] font-sans">
              {selectedBina.foto && <img src={selectedBina.foto} className="w-full h-24 object-cover rounded-xl mb-2" alt={selectedBina.ad} />}
              <h3 className="text-[10px] font-black uppercase italic mb-1 text-black leading-tight">{selectedBina.ad}</h3>
              <div className="flex items-center gap-1 mb-2">
                <Star size={10} className="fill-blue-600 text-blue-600" />
                <span className="text-[10px] font-bold text-black">{(selectedBina.toplamPuan / selectedBina.sayi).toFixed(1)}</span>
              </div>
            </div>
          </InfoWindowF>
        )}
      </GoogleMap>
    </div>
  );
}