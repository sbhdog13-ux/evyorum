// Bina kimliği yardımcıları — "bina = haritadaki yeri" modeli.
// Aynı isim birden çok olabilir; onları ayıran KONUM'dur.
import { slugify } from './slug';

export type BinaOzet = {
  slug: string; adSlug?: string; ad: string; ilce?: string; mahalle?: string;
  koordinat?: { lat: number; lng: number } | null;
};

// İki nokta arası mesafe (metre) — haversine
export function mesafeMetre(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000, d2r = Math.PI / 180;
  const dLat = (lat2 - lat1) * d2r, dLng = (lng2 - lng1) * d2r;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * d2r) * Math.cos(lat2 * d2r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Aynı isimli binalar arasında, verilen konuma YARIÇAP içinde olan EN YAKINI (yoksa null).
// Bu varsa → yeni bina oluşturma engellenir (muhtemelen aynı bina).
export function yakinAyniIsim(
  adaylar: BinaOzet[], lat: number, lng: number, yaricapM = 500
): BinaOzet | null {
  let enYakin: BinaOzet | null = null, enKisa = Infinity;
  for (const b of adaylar) {
    if (!b.koordinat?.lat) continue;
    const d = mesafeMetre(lat, lng, b.koordinat.lat, b.koordinat.lng);
    if (d <= yaricapM && d < enKisa) { enKisa = d; enYakin = b; }
  }
  return enYakin;
}

// Bu bina için TEKİL adres (slug) üret. Aynı isim başka bölgede varsa (>500 m, izinli)
// çakışmayı ilçe/mahalle/numara ile çözer. mevcutSluglar = o isimdeki binaların slug'ları.
export function tekilSlugBul(ad: string, ilce: string, mahalle: string, mevcutSluglar: Set<string>): string {
  const denemeler = [slugify(ad), slugify(`${ad} ${ilce}`), slugify(`${ad} ${ilce} ${mahalle}`)].filter(Boolean);
  for (const s of denemeler) { if (s && !mevcutSluglar.has(s)) return s; }
  const taban = slugify(`${ad} ${ilce}`) || slugify(ad) || 'bina';
  let i = 2;
  while (mevcutSluglar.has(`${taban}-${i}`)) i++;
  return `${taban}-${i}`;
}
