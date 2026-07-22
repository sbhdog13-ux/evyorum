"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { trUpper } from '@/app/lib/utils';
import { slugify } from '@/app/lib/slug';
import { agirlik } from '@/app/lib/skor';
import { useLang, LangSwitcher } from '@/app/lib/i18n';

export default function IlcelerSayfasi() {
  const { t } = useLang();
  const [istatistik, setIstatistik] = useState({ muhur: 0, bina: 0, ilce: 0 });
  const [ornekler, setOrnekler] = useState<any[]>([]);

  useEffect(() => {
    // Ölçek: tüm yorumlar yerine hazır özet defteri (binalar)
    getDocs(collection(db, 'binalar')).then(snap => {
      const binalar = snap.docs.map(d => d.data() as any);
      const ilceler = new Set(binalar.map(b => trUpper(b.ilce || '')).filter(Boolean));
      const muhur = binalar.reduce((a, b) => a + (b.muhurSayisi || 0), 0);
      const liste = binalar
        .filter(b => (b.finalPuan || 0) > 0)
        .sort((a, b) => (b.finalPuan || 0) - (a.finalPuan || 0))
        .slice(0, 3)
        .map(b => ({ ad: b.ad, slug: b.slug, ilce: trUpper(b.ilce || ''), mahalle: trUpper(b.mahalle || ''), muhur: b.muhurSayisi || 0, skor: b.finalPuan || 0 }));
      setIstatistik({ muhur, bina: binalar.length, ilce: ilceler.size });
      setOrnekler(liste);
    }).catch(() => {});
  }, []);

  const skorRenk = (s: number) => s >= 4 ? 'text-green-600' : s >= 3 ? 'text-[#BA7517]' : 'text-red-600';

  return (
    <div className="min-h-screen bg-white text-[#0f172a] font-sans flex flex-col">
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between px-6 py-7">
        <Link href="/"><img src="/logo.png" alt="Bulevini" className="h-11" /></Link>
        <LangSwitcher />
      </header>

      <section className="max-w-3xl w-full mx-auto px-6 pb-20 flex-1">
        <div className="text-[11px] font-black italic uppercase tracking-[2px] text-slate-400">{t('ilc.eyebrow')}</div>
        <h1 className="font-black italic uppercase tracking-tighter text-[30px] leading-[1.1] mt-2">
          {t('ilc.h1a')}<br /><span className="text-[#023E56]">{t('ilc.h1b')}</span>
        </h1>
        <p className="text-[15px] leading-[1.8] text-slate-600 mt-5">{t('ilc.g1')}</p>
        <p className="text-[15px] leading-[1.8] text-slate-600 mt-3">{t('ilc.g2a')}<b className="text-[#023E56]">{t('ilc.g2b')}</b>{t('ilc.g2c')}</p>

        {/* Canlı istatistik kartları — keşfetteki üçlü */}
        <div className="grid grid-cols-3 gap-3 mt-7">
          {[[istatistik.muhur, t('kesfet.muhur')], [istatistik.bina, t('kesfet.bina')], [istatistik.ilce, t('kesfet.ilce')]].map(([n, ad]) => (
            <div key={String(ad)} className="bg-[#023E56] rounded-2xl p-5 text-center">
              <div className="text-[28px] font-black italic text-white leading-none">{String(n)}</div>
              <div className="text-[10px] font-black uppercase italic text-[#A1CDE9] mt-1.5 tracking-widest">{String(ad)}</div>
            </div>
          ))}
        </div>

        <h2 className="font-black italic uppercase tracking-tighter text-[18px] mt-9">{t('ilc.sistemBaslik')}</h2>
        <p className="text-[13px] leading-relaxed text-slate-500 mt-3">{t('ilc.sistem')}</p>

        <h2 className="font-black italic uppercase tracking-tighter text-[18px] mt-8">{t('ilc.filtreBaslik')}</h2>
        <p className="text-[13px] leading-relaxed text-slate-500 mt-2">{t('ilc.filtreGiris')}</p>
        <div className="flex flex-col gap-2.5 mt-3">
          {[[t('ilc.f1a'), t('ilc.f1b'), t('ilc.f1c'), t('ilc.f1')], [t('ilc.f2a'), t('ilc.f2b'), t('ilc.f2c'), t('ilc.f2')]].map(([a, b, c, alt], i) => (
            <div key={i} className="border border-slate-200 rounded-2xl p-4">
              <div className="flex flex-wrap gap-1.5">
                {[a, b, c].map(et => (
                  <span key={et} className="bg-[#e8f3fa] text-[#023E56] text-[10px] font-black px-2.5 py-1 rounded-full">{et}</span>
                ))}
              </div>
              <p className="text-[12px] text-slate-400 italic mt-2">{alt}</p>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-8">
          <h2 className="font-black italic uppercase tracking-tighter text-[18px]">{t('ilc.ornekBaslik')}</h2>
          <span className="text-[10px] font-black text-green-600 bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">{t('ilc.canli')}</span>
        </div>
        <div className="flex flex-col gap-2 mt-3">
          {ornekler.map(b => (
            <Link key={b.slug || b.ad} href={`/bina/${b.slug || slugify(b.ad)}`} className="flex items-center gap-3 border border-slate-200 rounded-2xl p-4 hover:border-[#023E56] transition-all">
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-black italic uppercase truncate">{b.ad}</div>
                <div className="text-[10px] text-slate-400 font-semibold">{b.ilce}{b.mahalle ? ` / ${b.mahalle}` : ''} · {b.muhur} {t('arama.muhur')}</div>
              </div>
              <div className={`text-[18px] font-black italic ${skorRenk(b.skor)}`}>{b.skor}</div>
              <span className="text-slate-300">→</span>
            </Link>
          ))}
          <div className="text-center text-[11px] text-slate-300 font-bold italic py-1">{t('ilc.ornekAlt')}</div>
        </div>

        <div className="bg-[#e8f3fa] border border-[#A1CDE9] rounded-2xl px-5 py-4 mt-4">
          <p className="text-[12px] leading-relaxed text-[#023E56]">{t('ilc.yargi')}</p>
        </div>

        <div className="bg-[#023E56] rounded-[2rem] p-7 mt-6 text-center">
          <p className="text-[14px] leading-relaxed text-[#e0f2fe]"><b className="text-white">{t('ilc.davet1')}</b>{t('ilc.davet2')}</p>
          <Link href="/yorum-yap" className="inline-block bg-white text-[#023E56] text-[12px] font-black italic tracking-widest px-7 py-3.5 rounded-xl mt-4">{t('ilc.cta')}</Link>
        </div>
      </section>
    </div>
  );
}
