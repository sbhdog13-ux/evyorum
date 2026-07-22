"use client";
import Link from 'next/link';
import GeriButonu from '@/app/components/GeriButonu';
import { useLang, LangSwitcher } from '@/app/lib/i18n';

export default function NasilCalisirSayfasi() {
  const { t } = useLang();
  const adimlar = [['1', t('nc.s1b'), t('nc.s1')], ['2', t('nc.s2b'), t('nc.s2')], ['3', t('nc.s3b'), t('nc.s3')]];
  return (
    <div className="min-h-screen bg-white text-[#0f172a] font-sans flex flex-col">
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between px-6 py-7">
        <GeriButonu />
        <Link href="/"><img src="/logo.png" alt="Bulevini" className="h-11" /></Link>
        <LangSwitcher />
      </header>

      <section className="max-w-3xl w-full mx-auto px-6 pb-20 flex-1">
        <div className="text-[11px] font-black italic uppercase tracking-[2px] text-slate-400">{t('nc.eyebrow')}</div>
        <h1 className="font-black italic uppercase tracking-tighter text-[34px] leading-[1.05] mt-2">
          {t('nc.h1a')} <span className="text-[#023E56]">{t('nc.h1b')}</span>
        </h1>
        <p className="text-[15px] leading-relaxed text-slate-600 mt-5">{t('nc.giris')}</p>

        <div className="flex flex-col gap-3.5 mt-7">
          {adimlar.map(([n, b, m]) => (
            <div key={n} className="flex gap-4 items-start border border-slate-200 rounded-2xl p-5">
              <div className="text-[30px] font-black italic text-[#A1CDE9] leading-none min-w-[38px]">{n}</div>
              <div>
                <div className="text-[15px] font-black italic uppercase text-[#023E56]">{b}</div>
                <p className="text-[13px] leading-relaxed text-slate-500 mt-1.5">{m}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#023E56] rounded-[2rem] p-7 mt-6">
          <p className="text-[14px] leading-relaxed text-[#e0f2fe]">{t('nc.kutu1')}<b className="text-white">{t('nc.kutu2')}</b></p>
        </div>

        <div className="text-center mt-9">
          <Link href="/giris" className="inline-block bg-[#023E56] text-white text-[13px] font-black italic tracking-widest px-8 py-4 rounded-2xl">{t('nc.cta')}</Link>
        </div>
      </section>
    </div>
  );
}
