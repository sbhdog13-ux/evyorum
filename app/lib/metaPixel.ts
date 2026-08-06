// Meta (Facebook) Pixel — SADECE çerez onayı verildiyse yüklenir (KVKK, GA4 ile aynı mantık).
// Reklam/dönüşüm ölçümü için. Pixel ID: 2204099976818637.
const PIXEL_ID = '2204099976818637';
let baslatildi = false;

export function metaPixelBaslat() {
  if (typeof window === 'undefined' || baslatildi) return;
  const f = window as any;
  if (f.fbq) { baslatildi = true; return; }
  baslatildi = true;
  const b = document;
  const n: any = (f.fbq = function () {
    n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
  });
  if (!f._fbq) f._fbq = n;
  n.push = n; n.loaded = true; n.version = '2.0'; n.queue = [];
  const t = b.createElement('script');
  t.async = true;
  t.src = 'https://connect.facebook.net/en_US/fbevents.js';
  const s = b.getElementsByTagName('script')[0];
  s.parentNode!.insertBefore(t, s);
  f.fbq('init', PIXEL_ID);
  f.fbq('track', 'PageView');
}

// Çerez onayı 'kabul' ise başlat (sayfa açılışında)
export function metaPixelOnayVarsaBaslat() {
  try {
    if (localStorage.getItem('bulevini_cerez') === 'kabul') metaPixelBaslat();
  } catch { /* sessiz */ }
}
