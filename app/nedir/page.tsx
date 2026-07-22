"use client";
import Link from 'next/link';
import GeriButonu from '@/app/components/GeriButonu';
import { useLang, LangSwitcher } from '@/app/lib/i18n';

export default function NedirSayfasi() {
  const { t } = useLang();

  return (
    <div className="min-h-screen bg-white text-[#0f172a] font-sans">
      <header className="max-w-3xl mx-auto flex items-center justify-between px-6 py-7">
        <GeriButonu />
        <Link href="/"><img src="/logo.png" alt="Bulevini" className="h-11" /></Link>
        <LangSwitcher />
      </header>

      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="text-[11px] font-black italic uppercase tracking-[2px] text-slate-400">{t('nedir.etiket')}</div>
        <h1 className="font-black italic uppercase tracking-tighter text-[34px] leading-[1.1] mt-2">
          {t('nedir.baslik1')}<br /><span className="text-[#023E56]">{t('nedir.baslik2')}</span>
        </h1>
        <p className="text-[15px] leading-relaxed text-slate-600 mt-6">{t('nedir.p1')}</p>
        <p className="text-[15px] leading-relaxed text-slate-600 mt-3">{t('nedir.p2')}</p>
        <div className="bg-[#023E56] rounded-[2rem] p-7 mt-6">
          <p className="text-[15px] leading-relaxed text-[#e0f2fe]">{t('nedir.p3')}</p>
          <p className="text-[15px] leading-relaxed text-[#e0f2fe] mt-3">{t('nedir.p4a')}<b className="text-white">{t('nedir.p4b')}</b></p>
        </div>

        <h2 className="font-black italic uppercase tracking-tighter text-[20px] mt-10">{t('nedir.sorunBaslik')}</h2>
        <div className="grid gap-3 md:grid-cols-2 mt-4">
          {[[t('nedir.s1b'), t('nedir.s1')], [t('nedir.s2b'), t('nedir.s2')], [t('nedir.s3b'), t('nedir.s3')], [t('nedir.s4b'), t('nedir.s4')]].map(([b, m]) => (
            <div key={b} className="border border-slate-200 rounded-2xl p-5">
              <div className="text-[13px] font-black italic text-[#023E56]">{b}</div>
              <p className="text-[13px] leading-relaxed text-slate-500 mt-2">{m}</p>
            </div>
          ))}
        </div>

        <h2 className="font-black italic uppercase tracking-tighter text-[20px] mt-10">{t('nedir.degilBaslik')}</h2>
        <div className="space-y-2.5 mt-3">
          {[[t('nedir.d1b'), t('nedir.d1')], [t('nedir.d2b'), t('nedir.d2')], [t('nedir.d3b'), t('nedir.d3')]].map(([b, m]) => (
            <div key={b} className="flex gap-2.5 items-baseline text-[14px] leading-relaxed text-slate-600">
              <span className="text-red-600 font-black">✕</span>
              <span><b className="text-black">{b}</b> — {m}</span>
            </div>
          ))}
        </div>

        <div className="text-center mt-12 pt-8 border-t border-slate-100">
          <div className="font-black italic uppercase tracking-tighter text-[22px]">{t('nedir.kapanis1')}</div>
          <div className="font-black italic uppercase tracking-tighter text-[22px] text-[#023E56]">{t('nedir.kapanis2')}</div>
          <Link href="/giris" className="inline-block bg-[#023E56] text-white text-[12px] font-black italic tracking-widest px-7 py-4 rounded-2xl mt-5">{t('nedir.cta')}</Link>
        </div>
      </section>
    </div>
  );
}
