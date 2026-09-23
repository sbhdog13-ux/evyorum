// Bir nokta seçili ilin gerçek sınırı (ilçe poligonları) içinde mi?
// Bina kaydederken son kapı olarak kullanılır: haritaya tıklama, adres araması,
// elle koordinat ve linkten gelen koordinat — hepsi aynı yerden geçer.
import type { Sehir } from './sehirler';

// Sınır dosyaları bir kez indirilir, sonra hafızadan okunur
const onbellek: Record<string, Promise<any | null>> = {};
function sinirDosyasi(yol: string): Promise<any | null> {
  if (!onbellek[yol]) onbellek[yol] = fetch(yol).then(r => (r.ok ? r.json() : null)).catch(() => null);
  return onbellek[yol];
}

// Işın atma: nokta bu kapalı halkanın içinde mi (koordinatlar [boylam, enlem])
function halkaIcinde(x: number, y: number, halka: number[][]): boolean {
  let ic = false;
  for (let i = 0, j = halka.length - 1; i < halka.length; j = i++) {
    const [xi, yi] = halka[i], [xj, yj] = halka[j];
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) ic = !ic;
  }
  return ic;
}

export async function sehirIcindeMi(sehir: Sehir, lat: number, lng: number): Promise<boolean> {
  const { guney, bati, kuzey, dogu } = sehir.kutu;
  if (lat < guney || lat > kuzey || lng < bati || lng > dogu) return false; // kutunun dışı kesin dışarıda
  if (!sehir.ilceSinirlari) return true;          // sınır dosyası tanımlı değilse kutu yeterli
  const geo = await sinirDosyasi(sehir.ilceSinirlari);
  if (!geo?.features) return true;                // dosya okunamazsa kaydı engelleme, kutuya güven
  for (const f of geo.features) {
    const g = f?.geometry;
    if (!g) continue;
    const poligonlar = g.type === 'MultiPolygon' ? g.coordinates : [g.coordinates];
    for (const p of poligonlar) if (p?.[0] && halkaIcinde(lng, lat, p[0])) return true; // dış halka
  }
  return false;
}
