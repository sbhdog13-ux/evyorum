// Bulevini'nin açık olduğu şehirler — TEK KAYNAK.
// Yeni şehir = bu listeye bir kayıt. Harita kutusu, merkez ve ilçe sınır dosyası buradan okunur.
import { trUpper } from './utils';

export type SehirKodu = 'istanbul' | 'kahramanmaras';

export type Sehir = {
  kod: SehirKodu;
  ad: string;            // kayıtlarda tutulan hali (büyük harf, Türkçe İ)
  duzAd: string;         // cümle içinde okunur hali ("İstanbul")
  kisaAd: string;        // dar ekranda seçicide
  kutu: { guney: number; bati: number; kuzey: number; dogu: number };
  merkez: [number, number];
  ilceSinirlari: string | null; // public/ altındaki GeoJSON; yoksa ilçe boyaması yapılmaz, pinler yine çıkar
  yeni: boolean;
};

export const SEHIRLER: Record<SehirKodu, Sehir> = {
  istanbul: {
    kod: 'istanbul', ad: 'İSTANBUL', duzAd: 'İstanbul', kisaAd: 'İSTANBUL',
    kutu: { guney: 40.55, bati: 27.9, kuzey: 41.65, dogu: 29.95 },
    merkez: [41.0082, 28.9784],
    ilceSinirlari: '/istanbul.json',
    yeni: false,
  },
  kahramanmaras: {
    kod: 'kahramanmaras', ad: 'KAHRAMANMARAŞ', duzAd: 'Kahramanmaraş', kisaAd: 'K.MARAŞ',
    // İl sınır kutusu: Nominatim (OSM) idari sınır, dışa doğru yuvarlandı
    kutu: { guney: 37.19, bati: 36.2, kuzey: 38.61, dogu: 37.76 },
    merkez: [37.5813, 36.9275],
    ilceSinirlari: '/kahramanmaras.json', // OSM admin_level=6, 11 ilçe (temizlendi: sadece name)
    yeni: true,
  },
};

export const SEHIR_LISTESI: Sehir[] = Object.values(SEHIRLER);
export const VARSAYILAN_SEHIR: SehirKodu = 'istanbul';

// Açık olduğumuz şehirler tek cümlede: "İstanbul ve Kahramanmaraş" (üç şehirde "A, B ve C").
// Metinlerde {sehirler} yerine bu geçer — yeni şehir eklenince yazıları elle düzeltmek gerekmez.
export function sehirlerMetni(baglac = 've'): string {
  const adlar = SEHIR_LISTESI.map(s => s.duzAd);
  if (adlar.length <= 1) return adlar[0] || '';
  return `${adlar.slice(0, -1).join(', ')} ${baglac} ${adlar[adlar.length - 1]}`;
}

export function gecerliSehirKodu(k: string | null | undefined): SehirKodu | null {
  return k && k in SEHIRLER ? (k as SehirKodu) : null;
}

// Binanın ili. Eski özet kayıtlarında `il` alanı yok (27 Ağu ölçüldü: 10/10 boş) —
// o kayıtların hepsi İstanbul döneminden, İSTANBUL sayılır. Veri tamiri yapılana kadar emniyet.
export function binaIli(b: { il?: string | null } | null | undefined): string {
  return trUpper(String(b?.il || SEHIRLER[VARSAYILAN_SEHIR].ad)).trim();
}

// Kayıttaki il adından (ör. "İSTANBUL") şehir kodu; tanımadığımız bir ilse null
export function sehirKoduBul(ilAdi: string | null | undefined): SehirKodu | null {
  const ad = trUpper(String(ilAdi || '')).trim();
  const s = SEHIR_LISTESI.find(x => x.ad === ad);
  return s ? s.kod : null;
}

export function sehreAit(b: { il?: string | null } | null | undefined, kod: SehirKodu): boolean {
  return binaIli(b) === SEHIRLER[kod].ad;
}
