"use client";
import Link from 'next/link';
import { useLang } from '@/app/lib/i18n';

// Site geneli zengin footer — sahibinden benzeri çok sütun, marka diliyle.
// İçerik sayfaları (nedir/nasil-calisir/binalari-kesfet/skor-nedir/ilceler) SEO yüzeyidir;
// araç sayfalarına buradaki içerik sayfaları üzerinden yönlendirilir.
export default function Footer() {
  const { t } = useLang();

  const sutunlar: { baslik: string; linkler: { ad: string; href: string }[] }[] = [
    {
      baslik: 'Bulevini',
      linkler: [
        { ad: t('fo.nedir'), href: '/nedir' },
        { ad: t('fo.nasil'), href: '/nasil-calisir' },
        { ad: t('fo.iletisim'), href: '/iletisim' },
      ],
    },
    {
      baslik: t('fo.kesfetBaslik'),
      linkler: [
        { ad: t('fo.binalariKesfet'), href: '/binalari-kesfet' },
        { ad: t('fo.skorlar'), href: '/skor' },
        { ad: t('fo.binaAra'), href: '/arama' },
        { ad: t('fo.muhurle'), href: '/yorum-yap' },
      ],
    },
    {
      baslik: t('fo.rehberBaslik'),
      linkler: [
        { ad: t('fo.skorNedir'), href: '/skor-nedir' },
        { ad: t('fo.muhurNedir'), href: '/skor-nedir#muhur' },
      ],
    },
    {
      baslik: t('fo.ilcelerBaslik'),
      linkler: [
        { ad: t('fo.ilceler'), href: '/ilceler' },
      ],
    },
    {
      baslik: t('fo.gizlilikBaslik'),
      linkler: [
        { ad: t('fo.kvkk'), href: '/gizlilik' },
        { ad: t('fo.kullanim'), href: '/kullanim-kosullari' },
        { ad: t('fo.topluluk'), href: '/topluluk-kurallari' },
        { ad: t('fo.sss'), href: '/#sss' },
      ],
    },
  ];

  return (
    <footer className="bg-[#023E56] text-white mt-20">
      <div className="max-w-6xl mx-auto px-6 py-14">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8">
          {sutunlar.map(s => (
            <div key={s.baslik}>
              <h3 className="text-[13px] font-black italic uppercase tracking-wide text-amber-400 mb-4">{s.baslik}</h3>
              <ul className="space-y-2.5">
                {s.linkler.map(l => (
                  <li key={l.ad}>
                    {l.href.startsWith('mailto') || l.href.startsWith('/#') || l.href.includes('#')
                      ? <a href={l.href} className="text-[13px] text-[#A1CDE9] hover:text-white transition-colors">{l.ad}</a>
                      : <Link href={l.href} className="text-[13px] text-[#A1CDE9] hover:text-white transition-colors">{l.ad}</Link>}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-6 border-t border-white/15 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-[12px] text-[#A1CDE9]">{t('footer.telif')}</span>
          <div className="flex items-center gap-5 text-[12px]">
            <a href="https://instagram.com/bulevini" target="_blank" rel="noopener noreferrer" className="text-[#A1CDE9] hover:text-white transition-colors font-bold">Instagram @bulevini</a>
            <span className="text-[#A1CDE9] italic">{t('acilis.yakinda')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
