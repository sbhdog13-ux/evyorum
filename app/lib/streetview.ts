// Koordinattan Google Street View kapak görseli URL'i.
// Bina oluştururken foto_url'e konan görselin aynısı — listeleme kartları da
// koordinattan (özet defterinde zaten var) aynısını üretir, ekstra alan gerekmez.
const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;

// koordinat: {lat, lng} objesi ya da "lat, lng" string kabul eder. Yoksa '' döner.
export function streetViewUrl(koordinat: any): string {
  if (!GOOGLE_MAPS_API_KEY || !koordinat) return '';
  let lat: number | undefined, lng: number | undefined;
  if (typeof koordinat === 'string') {
    const [a, b] = koordinat.split(',').map(s => parseFloat(s.trim()));
    lat = a; lng = b;
  } else if (koordinat.lat != null) {
    lat = koordinat.lat; lng = koordinat.lng;
  }
  if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return '';
  return `https://maps.googleapis.com/maps/api/streetview?size=600x400&location=${lat},${lng}&fov=90&heading=235&pitch=10&key=${GOOGLE_MAPS_API_KEY}`;
}
