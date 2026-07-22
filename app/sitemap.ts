import type { MetadataRoute } from 'next';

// Dinamik sitemap: statik sayfalar + TÜM binalar (özet defterden).
// Y6'nın SEO değerini tamamlar — Google her binayı ayrı sayfa olarak görür.
export const revalidate = 3600; // saatte bir tazele (yeni binalar otomatik girer)

const BASE = 'https://bulevini.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statik: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${BASE}/kesfet`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE}/arama`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/skor`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${BASE}/harita`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${BASE}/ilceler`, changeFrequency: 'weekly', priority: 0.6 },
    { url: `${BASE}/nedir`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${BASE}/nasil-calisir`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/skor-nedir`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/binalari-kesfet`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE}/iletisim`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE}/giris`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BASE}/gizlilik`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/kullanim-kosullari`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${BASE}/topluluk-kurallari`, changeFrequency: 'yearly', priority: 0.2 },
  ];

  let binalar: MetadataRoute.Sitemap = [];
  try {
    const { db } = await import('@/app/lib/firebase');
    const { collection, getDocs } = await import('firebase/firestore');
    const snap = await getDocs(collection(db, 'binalar'));
    binalar = snap.docs
      .map((d) => d.data() as any)
      .filter((b) => b.slug)
      .map((b) => ({
        url: `${BASE}/bina/${b.slug}`,
        changeFrequency: 'weekly' as const,
        priority: 0.7,
        lastModified: b.guncelleme?.toDate?.() ?? new Date(),
      }));
  } catch {
    // Firestore erişilemezse en azından statik sayfalar döner
  }

  return [...statik, ...binalar];
}
