const TR_MAP: Record<string, string> = {
  'i': 'İ', 'ı': 'I', 'ş': 'Ş', 'ç': 'Ç', 'ğ': 'Ğ', 'ü': 'Ü', 'ö': 'Ö',
};

// Türkçe-doğru büyük harf (mobil ile birebir aynı)
export function trUpper(str: string): string {
  return str.replace(/[iışçğüö]/g, c => TR_MAP[c] || c).toUpperCase();
}
