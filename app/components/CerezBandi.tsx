"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLang } from '@/app/lib/i18n';
import { analyticsBaslat } from '@/app/lib/analytics';

export default function CerezBandi() {
  const { t } = useLang();
  const [goster, setGoster] = useState(false);

  useEffect(() => {
    try {
      const karar = localStorage.getItem('bulevini_cerez');
      if (!karar) setGoster(true);
      else if (karar === 'kabul') analyticsBaslat();
    } catch {}
  }, []);

  const karar = (kabul: boolean) => {
    try { localStorage.setItem('bulevini_cerez', kabul ? 'kabul' : 'red'); } catch {}
    if (kabul) analyticsBaslat();
    setGoster(false);
  };

  if (!goster) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[900] bg-[#023E56] text-white px-5 py-4 lg:py-3">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center gap-3 sm:gap-5">
        <p className="text-[12px] leading-relaxed text-[#e0f2fe] flex-1 text-center sm:text-left">
          {t('cerez.metin')} <Link href="/gizlilik" className="underline font-bold">{t('cerez.detay')}</Link>
        </p>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={() => karar(false)} className="px-4 py-2 rounded-xl text-[11px] font-black italic uppercase text-[#A1CDE9] hover:text-white transition-colors">{t('cerez.reddet')}</button>
          <button onClick={() => karar(true)} className="px-5 py-2.5 rounded-xl bg-white text-[#023E56] text-[11px] font-black italic uppercase">{t('cerez.kabul')}</button>
        </div>
      </div>
    </div>
  );
}
