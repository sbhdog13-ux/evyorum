import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Sunucu-taraflı reverse geocode. Gizli (referer-kısıtsız) Geocoding anahtarı burada
// kalır — tarayıcıya asla gitmez. İstanbul'da kapı/bina numarası döner.
export async function GET(req: NextRequest) {
  const lat = req.nextUrl.searchParams.get('lat');
  const lng = req.nextUrl.searchParams.get('lng');
  if (!lat || !lng) return NextResponse.json({ ok: false, error: 'lat/lng gerekli' }, { status: 400 });

  const key = process.env.GOOGLE_GEOCODE_KEY;
  if (!key) return NextResponse.json({ ok: false, error: 'yapılandırılmadı' }, { status: 500 });

  try {
    const r = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=tr&key=${key}`,
    );
    const d = await r.json();
    if (d.status !== 'OK' || !d.results?.length) {
      return NextResponse.json({ ok: false, status: d.status });
    }
    const res = d.results[0];
    const bilesen = (turler: string[]) =>
      res.address_components.find((c: any) => turler.some((t) => c.types.includes(t)))?.long_name || '';
    return NextResponse.json({
      ok: true,
      adres: res.formatted_address || '',
      ilce: bilesen(['administrative_area_level_2']),
      mahalle: bilesen(['neighborhood', 'sublocality_level_1', 'sublocality', 'administrative_area_level_4']),
    });
  } catch {
    return NextResponse.json({ ok: false, error: 'geocode hatası' });
  }
}
