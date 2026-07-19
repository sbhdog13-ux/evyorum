import { cache } from 'react';
import type { Metadata } from 'next';
import { agirlik } from '@/app/lib/skor';
import { trUpper } from '@/app/lib/utils';
import BinaDetayClient from '../BinaDetayClient';

export const dynamic = 'force-dynamic'; // her istekte taze veri (canlı skor/yorum)

type BinaOzet = {
  ad: string;
  ilce: string;
  mahalle: string;
  muhurSayisi: number;
  sakinSayisi: number;
  ortalama: number;
  ilkYorum: string | null;
};

// slug -> bina özeti. Sunucuda çalışır; SEO için isim/özet üretir.
// React cache: aynı istekte generateMetadata + sayfa tek sorguyla paylaşır.
const binaOzetiGetir = cache(async (slug: string): Promise<BinaOzet | null> => {
  try {
    // Firebase'i istek anında (derlemede değil) başlat — build sırasında env yoksa çökmesin.
    const { db } = await import('@/app/lib/firebase');
    const { collection, query, where, getDocs } = await import('firebase/firestore');
    const snap = await getDocs(query(collection(db, 'yorumlar'), where('slug', '==', slug)));
    if (snap.empty) return null;
    const yorumlar = snap.docs.map((d) => d.data() as any);

    const ad = yorumlar.find((y) => y.yeni_bina_adi || y.bina_adi)?.yeni_bina_adi
      || yorumlar[0].bina_adi
      || slug;
    const konumlu = yorumlar.find((y) => y.ilce || y.mahalle) || {};

    // Ağırlıklı karne ortalaması — istemciyle aynı mantık (sakin sözü daha ağır)
    const topl: { [k: string]: number } = {};
    const say: { [k: string]: number } = {};
    yorumlar.forEach((y) => {
      const w = agirlik(y.baglanti_tipi);
      const pv = typeof y.puanlar === 'string' ? JSON.parse(y.puanlar) : y.puanlar;
      if (pv && typeof pv === 'object') {
        Object.entries(pv).forEach(([k, v]) => {
          const p = Number(v);
          if (!isNaN(p) && p > 0) { topl[k] = (topl[k] || 0) + p * w; say[k] = (say[k] || 0) + w; }
        });
      }
    });
    const kategoriler = Object.keys(topl).map((k) => topl[k] / (say[k] || 1));
    const ortalama = kategoriler.length
      ? Number((kategoriler.reduce((a, b) => a + b, 0) / kategoriler.length).toFixed(1))
      : 0;

    const gercekYorumlar = yorumlar.filter(
      (y) => !(y.yorum_metni === 'BİNA MÜHÜRLENDİ.' && (!y.puanlar || Object.keys(y.puanlar).length === 0))
    );

    return {
      ad: trUpper(String(ad)).trim(),
      ilce: konumlu.ilce || 'İSTANBUL',
      mahalle: konumlu.mahalle || '',
      muhurSayisi: yorumlar.length,
      sakinSayisi: yorumlar.filter((y) => y.baglanti_tipi === 'sakin').length,
      ortalama,
      ilkYorum: gercekYorumlar[0]?.yorum_metni || null,
    };
  } catch {
    return null;
  }
});

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const ozet = await binaOzetiGetir(slug);
  if (!ozet) {
    return {
      title: 'Bina bulunamadı | Bulevini',
      robots: { index: false, follow: true },
    };
  }
  const konum = ozet.mahalle ? `${ozet.ilce} / ${ozet.mahalle}` : ozet.ilce;
  const puanMetni = ozet.ortalama > 0 ? `${ozet.ortalama}/5 puan, ` : '';
  const baslik = `${ozet.ad} Yorumları ve Bina Karnesi — ${ozet.ilce} | Bulevini`;
  const aciklama = `${ozet.ad} (${konum}) hakkında ${ozet.muhurSayisi} mühür, ${ozet.sakinSayisi} sakin deneyimi. ${puanMetni}ısınma, deprem güveni, komşuluk ve yönetim karnesi. Evini tutmadan önce binanın ortak hafızasına bak.`;
  const url = `https://bulevini.com/bina/${slug}`;
  return {
    title: baslik,
    description: aciklama,
    alternates: { canonical: url },
    openGraph: { title: baslik, description: aciklama, url, siteName: 'Bulevini', locale: 'tr_TR', type: 'article' },
    twitter: { card: 'summary_large_image', title: baslik, description: aciklama },
  };
}

export default async function BinaSlugSayfasi({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ozet = await binaOzetiGetir(slug);

  return (
    <>
      {/* SEO gövdesi: sunucudan render edilen özet — Google okur. Görsel olarak gizli;
          kullanıcı zengin, canlı arayüzü aşağıdaki istemci bileşeninde görür. */}
      {ozet && (
        <div className="sr-only" aria-hidden="true">
          <h1>{ozet.ad} — {ozet.ilce}{ozet.mahalle ? ` / ${ozet.mahalle}` : ''} Bina Karnesi ve Yorumları</h1>
          <p>
            {ozet.ad}, {ozet.ilce} bölgesinde Bulevini'de {ozet.muhurSayisi} mühür ve {ozet.sakinSayisi} sakin
            deneyimiyle kayıtlı. {ozet.ortalama > 0 ? `Genel karne puanı 5 üzerinden ${ozet.ortalama}.` : ''}
            {' '}Isınma, deprem güveni, komşuluk ve yönetim başlıklarında gerçek sakin yorumları.
          </p>
          {ozet.ilkYorum && <blockquote>{ozet.ilkYorum}</blockquote>}
        </div>
      )}
      {/* Zengin, canlı, interaktif deneyim — mevcut tüm özellikler korunur */}
      <BinaDetayClient binaAdi={ozet?.ad || decodeURIComponent(slug)} binaSlug={slug} />
      {ozet && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Residence',
              name: ozet.ad,
              url: `https://bulevini.com/bina/${slug}`,
              address: { '@type': 'PostalAddress', addressLocality: ozet.ilce, addressRegion: 'İstanbul', addressCountry: 'TR' },
              ...(ozet.ortalama > 0 && ozet.muhurSayisi > 0
                ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: ozet.ortalama, bestRating: 5, ratingCount: ozet.muhurSayisi } }
                : {}),
            }),
          }}
        />
      )}
    </>
  );
}
