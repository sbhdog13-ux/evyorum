// Tek noktadan Google Maps JS (+ Places) yükleyici ve adres arama yardımcıları.
// Sokak görünümü ve Places araması AYNI script'i paylaşır — çift yükleme "included multiple times" hatasını önler.
declare global { interface Window { google: any } }

const KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
// İstanbul çevresi — arama sonuçlarını bölgeye yasla
const IST_BIAS = { south: 40.55, west: 27.9, north: 41.65, east: 29.95 };

let yukleme: Promise<void> | null = null;
export function loadGoogleMaps(): Promise<void> {
  if (typeof window !== 'undefined' && window.google?.maps?.places) return Promise.resolve();
  if (!yukleme) {
    yukleme = new Promise<void>((res, rej) => {
      if (!KEY) return rej(new Error('NEXT_PUBLIC_GOOGLE_MAPS_KEY yok'));
      // Zaten (places'siz) yüklenmişse tekrar ekleme — yalnızca hazır olduğunu varsay
      const mevcut = document.querySelector('script[src*="maps.googleapis.com/maps/api/js"]');
      if (mevcut && window.google?.maps) return res();
      const s = document.createElement('script');
      s.src = `https://maps.googleapis.com/maps/api/js?key=${KEY}&libraries=places&language=tr&region=TR`;
      s.async = true; s.onload = () => res(); s.onerror = () => rej(new Error('Google Maps yüklenemedi'));
      document.head.appendChild(s);
    });
  }
  return yukleme;
}

export type AramaOneri = { id: string; metin: string };

let acSvc: any = null;
let acToken: any = null;
// Yazarken öneri getir (Google Places Autocomplete) — İstanbul'a yaslı, Türkiye kısıtlı.
export async function adresOnerileri(sorgu: string): Promise<AramaOneri[]> {
  if (!sorgu.trim()) return [];
  await loadGoogleMaps();
  const g = window.google;
  if (!acSvc) acSvc = new g.maps.places.AutocompleteService();
  if (!acToken) acToken = new g.maps.places.AutocompleteSessionToken();
  return new Promise((resolve) => {
    acSvc.getPlacePredictions(
      {
        input: sorgu,
        sessionToken: acToken,
        componentRestrictions: { country: 'tr' },
        bounds: new g.maps.LatLngBounds(
          new g.maps.LatLng(IST_BIAS.south, IST_BIAS.west),
          new g.maps.LatLng(IST_BIAS.north, IST_BIAS.east),
        ),
        strictBounds: true, // yalnızca İstanbul içi — mobil ile aynı
      },
      (preds: any, status: string) => {
        if (status !== g.maps.places.PlacesServiceStatus.OK || !preds) return resolve([]);
        resolve(preds.map((p: any) => ({ id: p.place_id, metin: p.description })));
      },
    );
  });
}

// Seçilen öneriden koordinat + okunur adres al (session token'ı burada tüketip sıfırlarız).
export async function adresKoordinat(placeId: string): Promise<{ lat: number; lng: number; adres: string } | null> {
  await loadGoogleMaps();
  const g = window.google;
  const svc = new g.maps.places.PlacesService(document.createElement('div'));
  return new Promise((resolve) => {
    svc.getDetails(
      { placeId, fields: ['geometry', 'formatted_address', 'name'], sessionToken: acToken },
      (place: any, status: string) => {
        acToken = null; // oturum bitti — yeni arama yeni token
        if (status !== g.maps.places.PlacesServiceStatus.OK || !place?.geometry?.location) return resolve(null);
        resolve({
          lat: place.geometry.location.lat(),
          lng: place.geometry.location.lng(),
          adres: place.formatted_address || place.name || '',
        });
      },
    );
  });
}
