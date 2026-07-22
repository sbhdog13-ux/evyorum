// Kriter/Sorun/Artı sözlüğü — "kriter çöplüğü"nü önleyen akıl.
// 3 katman: (1) harf-körü eşleşme (slug), (2) yazarken öneri + yazım hatası yakalama,
// (3) kaydederken kanonikleştirme. Web ve mobil BİREBİR aynı olmalı (src/lib/kriterSozluk.ts).
import { slugify } from './slug';

export type SozlukKaydi = { ad: string; slug: string; sayi: number };
export type SozlukTuru = 'kriterler' | 'sorunlar' | 'artilar';

// (1b) Düzgün başlangıç listeleri — havuz baştan temiz başlasın
export const SEED: Record<SozlukTuru, string[]> = {
  kriterler: [
    'ASANSÖR', 'OTOPARK', 'İNTERNET / FİBER', 'GÜVENLİK', 'ISI YALITIMI', 'SES YALITIMI',
    'SU BASINCI', 'BALKON', 'GÜNEŞ / IŞIK', 'KAPICI / GÖREVLİ', 'JENERATÖR', 'ENGELLİ ERİŞİMİ',
  ],
  sorunlar: [
    'BÖCEKLENMİŞ', 'ASANSÖR BOZUK', 'KÜF / NEM', 'GÜRÜLTÜ', 'FİBER YOK', 'SU BASKINI',
    'OTOPARK YOK', 'GÜVENLİK ZAYIF', 'AİDAT YÜKSEK', 'ISINMA SORUNU', 'SU KESİNTİSİ', 'KÖTÜ YÖNETİM',
  ],
  artilar: [
    'SESSİZ MAHALLE', 'FİBER VAR', 'İYİ YÖNETİM', 'KOMŞULAR İYİ', 'YENİ BİNA', 'ULAŞIM KOLAY',
    'OTOPARK VAR', 'GÜVENLİKLİ', 'TEMİZ ORTAK ALAN', 'GÜNEŞ ALIR',
  ],
};

// Levenshtein — iki kelime arası "kaç harf fark" (yazım hatası ölçüsü)
function mesafe(a: string, b: string): number {
  const m = a.length, n = b.length;
  if (!m) return n; if (!n) return m;
  let onceki = Array.from({ length: n + 1 }, (_, i) => i);
  for (let i = 1; i <= m; i++) {
    const simdi = [i];
    for (let j = 1; j <= n; j++) {
      const bedel = a[i - 1] === b[j - 1] ? 0 : 1;
      simdi[j] = Math.min(onceki[j] + 1, simdi[j - 1] + 1, onceki[j - 1] + bedel);
    }
    onceki = simdi;
  }
  return onceki[n];
}

// Seed listesini ve robotun tuttuğu dinamik sözlüğü tek havuzda birleştir (slug'a göre tekil)
export function havuzBirlestir(tur: SozlukTuru, dinamik: SozlukKaydi[] = []): SozlukKaydi[] {
  const harita = new Map<string, SozlukKaydi>();
  SEED[tur].forEach((ad) => { const slug = slugify(ad); if (slug) harita.set(slug, { ad, slug, sayi: 0 }); });
  dinamik.forEach((k) => {
    const slug = k.slug || slugify(k.ad);
    if (!slug) return;
    const mevcut = harita.get(slug);
    // Dinamik kayıt varsa sayacı taşı; kanonik isim seed'de varsa seed adını koru
    if (mevcut) harita.set(slug, { ...mevcut, sayi: (mevcut.sayi || 0) + (k.sayi || 0) });
    else harita.set(slug, { ad: k.ad, slug, sayi: k.sayi || 0 });
  });
  return [...harita.values()];
}

// (2) Yazarken öneriler: önce başlayan → içeren → yazım-hatası (yakın benzer). Sık kullanılan öne.
export function oneriler(girdi: string, havuz: SozlukKaydi[], haricTut: string[] = [], limit = 6): SozlukKaydi[] {
  const s = slugify(girdi);
  if (!s) return [];
  const haricSlug = new Set(haricTut.map((h) => slugify(h)));
  const puanli: { k: SozlukKaydi; oncelik: number }[] = [];
  for (const k of havuz) {
    if (haricSlug.has(k.slug)) continue; // zaten eklenmiş
    let oncelik = -1;
    if (k.slug.startsWith(s)) oncelik = 0;                                    // "as" → "asansor"
    else if (k.slug.includes(s)) oncelik = 1;                                 // içeren
    else if (s.length >= 3 && mesafe(s, k.slug.slice(0, s.length)) <= 1) oncelik = 2; // "asons" → "asans(or)" (yazım)
    else if (s.length >= 4 && mesafe(s, k.slug) <= 2) oncelik = 3;            // tüm kelime yakın benzer
    if (oncelik >= 0) puanli.push({ k, oncelik });
  }
  puanli.sort((a, b) => a.oncelik - b.oncelik || (b.k.sayi || 0) - (a.k.sayi || 0) || a.k.ad.localeCompare(b.k.ad, 'tr'));
  return puanli.slice(0, limit).map((p) => p.k);
}

// (3b) Kaydederken kanonikleştir: girdinin slug'ı havuzda BİREBİR varsa kanonik ad'ı döndür.
// Yazım hatası (farklı slug) OTOMATİK birleştirilmez — yanlış birleştirme riski olmasın.
export function kanonik(girdi: string, havuz: SozlukKaydi[]): string {
  const s = slugify(girdi);
  if (!s) return girdi.trim();
  const birebir = havuz.find((k) => k.slug === s);
  return birebir ? birebir.ad : girdi.trim().toLocaleUpperCase('tr-TR');
}
