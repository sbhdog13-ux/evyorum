// Türkçe-güvenli slug üretici — bina ismini temiz URL parçasına çevirir.
// "FATİH APARTMANI" -> "fatih-apartmani"
// Kural: Türkçe harfler önce ASCII karşılığına indirgenir, sonra küçük harf + tire.
// Web ve mobil BİREBİR aynı olmalı (aynı isim iki platformda aynı slug'ı üretmeli).
const TR_HARITA: { [k: string]: string } = {
  ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', I: 'i', İ: 'i', i: 'i',
  ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
};

export function slugify(isim: string): string {
  if (!isim) return '';
  return isim
    .trim()
    .split('')
    .map((h) => TR_HARITA[h] ?? h)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // harf/rakam dışını tireye çevir
    .replace(/^-+|-+$/g, '')      // baş/son tireleri kırp
    .replace(/-{2,}/g, '-');       // çift tireleri teke indir
}
