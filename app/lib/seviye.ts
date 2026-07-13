// Mahalle Kariyeri — puan/rütbe/radar motoru (web + mobil ortak mantık, mobile birebir taşınır)
// Puan kaynakları: mühür 100, +kanıt 30, +detaylı deneyim (200+ karakter) 30, +sakin bağlantısı 40,
// bina oluşturma 40, radar 10, alınan her "faydalı" oyu 30

export type Rutbe = {
  ad: string;        // i18n anahtarı
  esik: number;      // bu puanda başlar
  radarHakki: number; // -1 = sınırsız
};

export const RUTBELER: Rutbe[] = [
  { ad: 'rutbe.misafir',       esik: 0,     radarHakki: 3 },
  { ad: 'rutbe.komsu',         esik: 300,   radarHakki: 5 },
  { ad: 'rutbe.sakin',         esik: 800,   radarHakki: 7 },
  { ad: 'rutbe.sokakSozcusu',  esik: 1600,  radarHakki: 9 },
  { ad: 'rutbe.mahalleUstasi', esik: 3000,  radarHakki: 12 },
  { ad: 'rutbe.semtHafizasi',  esik: 5500,  radarHakki: 15 },
  { ad: 'rutbe.muhtar',        esik: 10000, radarHakki: -1 },
];

export const PUAN = {
  muhur: 100,
  kanit: 30,
  detay: 30,      // 200+ karakter deneyim metni
  sakin: 40,      // bağlantı tipi "sakinim"
  binaOlustur: 40,
  radar: 10,
  faydali: 30,    // yorumuna gelen her faydalı oyu
};

export function puanHesapla(yorumlar: any[], radarSayisi: number): { toplam: number; dokum: { [k: string]: number } } {
  let toplam = 0;
  const dokum: { [k: string]: number } = { muhur: 0, kanit: 0, detay: 0, sakin: 0, binaOlustur: 0, radar: 0, faydali: 0 };
  for (const y of yorumlar) {
    if (y.tip === 'bina_olusturma') { dokum.binaOlustur += PUAN.binaOlustur; continue; }
    dokum.muhur += PUAN.muhur;
    if (y.foto_url) dokum.kanit += PUAN.kanit;
    if ((y.yorum_metni || '').length >= 200) dokum.detay += PUAN.detay;
    if (y.baglanti_tipi === 'sakin') dokum.sakin += PUAN.sakin;
    dokum.faydali += (y.faydali_sayisi || 0) * PUAN.faydali;
  }
  dokum.radar = radarSayisi * PUAN.radar;
  toplam = Object.values(dokum).reduce((a, b) => a + b, 0);
  return { toplam, dokum };
}

export function rutbeBul(puan: number): { rutbe: Rutbe; indeks: number; sonraki: Rutbe | null; ilerleme: number } {
  let indeks = 0;
  for (let i = RUTBELER.length - 1; i >= 0; i--) {
    if (puan >= RUTBELER[i].esik) { indeks = i; break; }
  }
  const rutbe = RUTBELER[indeks];
  const sonraki = RUTBELER[indeks + 1] || null;
  const ilerleme = sonraki
    ? Math.min(100, Math.round(((puan - rutbe.esik) / (sonraki.esik - rutbe.esik)) * 100))
    : 100;
  return { rutbe, indeks, sonraki, ilerleme };
}

export function radarHakki(puan: number): number {
  return rutbeBul(puan).rutbe.radarHakki;
}

// Rozetler — hepsi GERÇEK şartlara bağlı (kademe = KADEME, tier değil)
export type RozetTanim = {
  id: string;
  ad: string;       // i18n anahtarı
  kademe: number;
  kosul: (v: { muhur: number; kanitli: number; detayli: number; radar: number; gpsli: number; faydali: number; faturaOnayli: boolean }) => boolean;
  yakinda?: boolean; // özellik henüz yoksa dürüstçe "YAKINDA"
};

export const ROZETLER: RozetTanim[] = [
  { id: 'ilkMuhur',   ad: 'rozet.ilkMuhur',   kademe: 1, kosul: v => v.muhur >= 1 },
  { id: 'hikayeci',   ad: 'rozet.hikayeci',   kademe: 1, kosul: v => v.detayli >= 5 },
  { id: 'radarKurdu', ad: 'rozet.radarKurdu', kademe: 1, kosul: v => v.radar >= 5 },
  { id: 'kanitUstasi',ad: 'rozet.kanitUstasi',kademe: 2, kosul: v => v.kanitli >= 5 },
  { id: 'mahalleUstasi', ad: 'rozet.mahalleUstasi', kademe: 2, kosul: v => v.muhur >= 10 },
  { id: 'sahada',     ad: 'rozet.sahada',     kademe: 2, kosul: v => v.gpsli >= 5 },
  { id: 'begenilen',  ad: 'rozet.begenilen',  kademe: 2, kosul: v => v.faydali >= 10 },
  { id: 'faturaOnayli', ad: 'rozet.faturaOnayli', kademe: 3, kosul: v => v.faturaOnayli, yakinda: true },
];
