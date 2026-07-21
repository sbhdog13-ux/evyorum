import AramaClient from './AramaClient';

export const dynamic = 'force-dynamic'; // her istekte taze özet defteri

// Özet defterini (binalar) SUNUCUDA oku → sayfayla birlikte hazır gönder.
// Böylece liste, tarayıcıda reCAPTCHA/giriş sistemi uyanmasını beklemez; anında görünür.
async function binalariGetir(): Promise<any[]> {
  try {
    // Firebase'i istek anında başlat (build'de env yoksa çökmesin)
    const { db } = await import('@/app/lib/firebase');
    const { collection, getDocs } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, 'binalar'));
    // Sadece istemcinin kullandığı alanlar + serileştirilebilir (Timestamp taşımaz)
    return snap.docs.map((d) => {
      const b = d.data() as any;
      return {
        ad: b.ad || '',
        slug: b.slug || d.id,
        finalPuan: b.finalPuan || 0,
        muhurSayisi: b.muhurSayisi || 0,
        dogrulanmis: b.dogrulanmis || 0,
        ilce: b.ilce || '',
        mahalle: b.mahalle || '',
        koordinat: b.koordinat?.lat != null ? { lat: b.koordinat.lat, lng: b.koordinat.lng } : null,
        kategoriOrt: b.kategoriOrt || {},
      };
    });
  } catch {
    return []; // sunucu okuyamazsa istemci yedek olarak kendisi çeker
  }
}

export default async function AramaPage() {
  const initialBinalar = await binalariGetir();
  return <AramaClient initialBinalar={initialBinalar} />;
}
