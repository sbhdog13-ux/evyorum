"use client";
import Link from 'next/link';
import GeriButonu from '@/app/components/GeriButonu';
import { useLang, LangSwitcher } from '@/app/lib/i18n';

export default function SkorNedirSayfasi() {
  const { t } = useLang();
  const agirliklar = [['%100', t('sn.agSakin')], ['%70', t('sn.agEski')], ['%30', t('sn.agZiyaret')]];
  const degiller = [t('sn.d1'), t('sn.d2'), t('sn.d3'), t('sn.d4')];
  return (
    <div className="min-h-screen bg-white text-[#0f172a] font-sans flex flex-col">
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between px-6 py-7">
        <GeriButonu />
        <Link href="/"><img src="/logo.png" alt="Bulevini" className="h-11" /></Link>
        <LangSwitcher />
      </header>

      <section className="max-w-3xl w-full mx-auto px-6 pb-20 flex-1">
        <div className="text-[11px] font-black italic uppercase tracking-[2px] text-slate-400">{t('sn.eyebrow')}</div>
        <h1 className="font-black italic uppercase tracking-tighter text-[30px] leading-[1.1] mt-2">
          {t('sn.h1a')}<br /><span className="text-[#023E56]">{t('sn.h1b')}</span>
        </h1>
        <p className="text-[15px] leading-relaxed text-slate-600 mt-5">{t('sn.giris')}</p>

        <h2 className="font-black italic uppercase tracking-tighter text-[18px] mt-8">{t('sn.hesapBaslik')}</h2>
        <ul className="list-disc pl-5 mt-3 space-y-2">
          {[t('sn.m1'), t('sn.m2'), t('sn.m3')].map((m, i) => (
            <li key={i} className="text-[13px] leading-relaxed text-slate-600">{m}</li>
          ))}
        </ul>
        <div className="flex gap-2 mt-4">
          {agirliklar.map(([y, ad]) => (
            <div key={ad} className="flex-1 bg-[#e8f3fa] rounded-xl p-3 text-center">
              <div className="text-[20px] font-black italic text-[#023E56]">{y}</div>
              <div className="text-[10px] font-black text-[#023E56] uppercase mt-0.5">{ad}</div>
            </div>
          ))}
        </div>

        <h2 className="font-black italic uppercase tracking-tighter text-[18px] mt-8">
          {t('sn.degilBaslik1')} <span className="text-[#A32D2D]">{t('sn.degilBaslik2')}</span>
        </h2>
        <div className="flex flex-col gap-2 mt-3">
          {degiller.map((d, i) => {
            const [lead, rest] = d.split('|');
            return (
              <div key={i} className="text-[13px] leading-relaxed text-slate-600">
                <b className="text-black">{lead}</b> {rest}
              </div>
            );
          })}
        </div>

        <h2 id="muhur" className="scroll-mt-20 font-black italic uppercase tracking-tighter text-[18px] mt-8">{t('sn.muhurBaslik')}</h2>
        <div className="bg-[#023E56] rounded-[2rem] p-7 mt-3">
          <p className="text-[14px] leading-relaxed text-[#e0f2fe]">{t('sn.muhur1')}</p>
          <p className="text-[14px] leading-relaxed text-[#e0f2fe] mt-3">{t('sn.muhur2')}</p>
        </div>

        <div className="text-center mt-9 pt-6 border-t border-slate-100">
          <Link href="/skor" className="inline-block bg-[#023E56] text-white text-[13px] font-black italic tracking-widest px-8 py-4 rounded-2xl">{t('sn.cta')}</Link>
        </div>
      </section>
    </div>
  );
}
