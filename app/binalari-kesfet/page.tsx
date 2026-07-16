"use client";
import Link from 'next/link';
import { useLang, LangSwitcher } from '@/app/lib/i18n';
import Footer from '@/app/components/Footer';

export default function BinalariKesfetSayfasi() {
  const { t } = useLang();
  const kartlar = [[t('bk.k1b'), t('bk.k1')], [t('bk.k2b'), t('bk.k2')], [t('bk.k3b'), t('bk.k3')]];
  const liste = [t('bk.l1'), t('bk.l2'), t('bk.l3'), t('bk.l4')];
  return (
    <div className="min-h-screen bg-white text-[#0f172a] font-sans flex flex-col">
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between px-6 py-7">
        <Link href="/"><img src="/logo.png" alt="Bulevini" className="h-11" /></Link>
        <LangSwitcher />
      </header>

      <section className="max-w-3xl w-full mx-auto px-6 pb-20 flex-1">
        <div className="text-[11px] font-black italic uppercase tracking-[2px] text-slate-400">{t('bk.eyebrow')}</div>
        <h1 className="font-black italic uppercase tracking-tighter text-[32px] leading-[1.1] mt-2">
          {t('bk.h1a')}<br /><span className="text-[#023E56]">{t('bk.h1b')}</span>
        </h1>
        <p className="text-[15px] leading-relaxed text-slate-600 mt-5">{t('bk.giris')}</p>

        <div className="bg-[#023E56] rounded-[2rem] p-7 mt-6">
          <p className="text-[14px] leading-relaxed text-[#e0f2fe]">{t('bk.kutu')}</p>
        </div>

        <h2 className="font-black italic uppercase tracking-tighter text-[18px] mt-9">{t('bk.nasilBaslik')}</h2>
        <div className="flex flex-col gap-3 mt-4">
          {kartlar.map(([b, m]) => (
            <div key={b} className="border border-slate-200 rounded-2xl p-5">
              <div className="text-[13px] font-black italic text-[#023E56]">{b}</div>
              <p className="text-[13px] leading-relaxed text-slate-500 mt-1.5">{m}</p>
            </div>
          ))}
        </div>

        <h2 className="font-black italic uppercase tracking-tighter text-[18px] mt-9">{t('bk.neBaslik')}</h2>
        <ul className="list-disc pl-5 mt-3 space-y-1.5">
          {liste.map(l => <li key={l} className="text-[13px] leading-relaxed text-slate-600">{l}</li>)}
        </ul>

        <div className="text-center mt-9 pt-6 border-t border-slate-100">
          <Link href="/kesfet" className="inline-block bg-[#023E56] text-white text-[13px] font-black italic tracking-widest px-8 py-4 rounded-2xl">{t('bk.cta')}</Link>
          <p className="text-[11px] text-slate-400 italic mt-3">{t('bk.ctaAlt')}</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}
