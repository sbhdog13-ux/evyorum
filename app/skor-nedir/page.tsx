"use client";
import Link from 'next/link';
import { useLang, LangSwitcher } from '@/app/lib/i18n';
import Footer from '@/app/components/Footer';

export default function Sayfa() {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-white text-[#0f172a] font-sans flex flex-col">
      <header className="max-w-3xl w-full mx-auto flex items-center justify-between px-6 py-7">
        <Link href="/"><img src="/logo.png" alt="Bulevini" className="h-11" /></Link>
        <LangSwitcher />
      </header>
      <section className="max-w-3xl w-full mx-auto px-6 pb-24 flex-1">
        <h1 className="font-black italic uppercase tracking-tighter text-[34px] leading-[1.1]">{t('sn.h1')}</h1>
        <p className="text-[14px] text-slate-400 italic mt-6">{t('iskelet.yakinda')}</p>
      </section>
      <Footer />
    </div>
  );
}
