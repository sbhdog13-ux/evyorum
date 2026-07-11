"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useLang, LangSwitcher } from '@/app/lib/i18n';

export default function AcilisSayfasi() {
  const { user, loading } = useAuth() as any;
  const router = useRouter();
  const { t } = useLang();

  // Giriş yapmış kullanıcı doğrudan uygulamaya geçer
  useEffect(() => {
    if (!loading && user) router.replace('/kesfet');
  }, [user, loading]);

  return (
    <div className="min-h-screen bg-white text-[#0f172a] font-sans">
      <header className="max-w-5xl mx-auto flex items-center justify-between px-6 py-7">
        <img src="/logo.png" alt="Bulevini" className="h-11" onError={(e: any) => { e.target.outerHTML = '<span class="text-2xl font-black italic tracking-tighter uppercase">BULEVİNİ</span>'; }} />
        <div className="flex items-center gap-3">
          <LangSwitcher />
          <Link href="/gizlilik" className="hidden md:block text-[12px] font-black uppercase italic text-slate-400 hover:text-blue-600 tracking-wide">{t('acilis.gizlilik')}</Link>
          <Link href="/giris" className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[12px] font-black uppercase italic tracking-wide hover:bg-[#023E56] transition-all shadow-lg shadow-blue-200">{t('acilis.girisKayit')}</Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <h1 className="font-black italic uppercase tracking-tighter leading-[1.05] text-[clamp(32px,6vw,56px)]">
          {t('acilis.motto1')}<br /><span className="text-blue-600 underline">{t('acilis.motto2')}</span> {t('acilis.motto3')}
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-[16px] leading-relaxed text-slate-400 font-medium">
          {t('acilis.aciklama')}
        </p>
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/giris" className="bg-blue-600 text-white px-9 py-4 rounded-2xl text-[13px] font-black uppercase italic tracking-wide hover:bg-[#023E56] transition-all shadow-xl shadow-blue-200">{t('acilis.hemenBasla')}</Link>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-[11px] font-black uppercase italic text-blue-600 tracking-widest">{t('acilis.yakinda')}</span>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20 grid gap-4 md:grid-cols-3">
        {[
          ['🔒', t('acilis.k1b'), t('acilis.k1')],
          ['🗺️', t('acilis.k2b'), t('acilis.k2')],
          ['📡', t('acilis.k3b'), t('acilis.k3')],
        ].map(([ikon, baslik, metin]) => (
          <div key={baslik} className="bg-slate-50 border border-slate-100 rounded-[2rem] p-7 text-left">
            <div className="text-[26px]">{ikon}</div>
            <h3 className="mt-3 mb-2 font-black italic text-[16px] tracking-tight">{baslik}</h3>
            <p className="text-[14px] leading-relaxed text-slate-400">{metin}</p>
          </div>
        ))}
      </section>

      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap gap-3 items-center justify-between text-[13px] text-slate-400">
          <span>© 2026 Bulevini — Türkiye'nin en şeffaf bina platformu</span>
          <span><Link href="/gizlilik" className="underline">Gizlilik Politikası &amp; KVKK</Link> · <a href="mailto:sbhdog13@gmail.com" className="underline">İletişim</a></span>
        </div>
      </footer>
    </div>
  );
}
