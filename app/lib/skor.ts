// Skor ağırlıklandırma — orada yaşayanın sözü daha ağır basar (mühürle formundaki %etki vaadi)
// sakin %100, eski sakin %70, ziyaretçi %30. Web + mobil ortak; tek kaynak burası.
export const BAGLANTI_AGIRLIK: { [k: string]: number } = { sakin: 1, eski_sakin: 0.7, ziyaretci: 0.3 };

export function agirlik(tip?: string): number {
  // Bilinmeyen/eski kayıt → 1 (mühür formunun varsayılanı "sakinim")
  return BAGLANTI_AGIRLIK[tip || ''] ?? 1;
}
