"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';

export default function AcilisSayfasi() {
  const { user, loading } = useAuth() as any;
  const router = useRouter();

  // Giriş yapmış kullanıcı doğrudan uygulamaya geçer
  useEffect(() => {
    if (!loading && user) router.replace('/kesfet');
  }, [user, loading]);

  return (
    <div className="min-h-screen bg-white text-[#0f172a] font-sans">
      <header className="max-w-5xl mx-auto flex items-center justify-between px-6 py-7">
        <img src="/logo.png" alt="Bulevini" className="h-11" onError={(e: any) => { e.target.outerHTML = '<span class="text-2xl font-black italic tracking-tighter uppercase">BULEVİNİ</span>'; }} />
        <div className="flex items-center gap-3">
          <Link href="/gizlilik" className="hidden md:block text-[12px] font-black uppercase italic text-slate-400 hover:text-blue-600 tracking-wide">GİZLİLİK</Link>
          <Link href="/giris" className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[12px] font-black uppercase italic tracking-wide hover:bg-black transition-all shadow-lg shadow-blue-200">GİRİŞ YAP / KAYIT OL</Link>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <h1 className="font-black italic uppercase tracking-tighter leading-[1.05] text-[clamp(32px,6vw,56px)]">
          EVİNİ TUTMADAN ÖNCE<br /><span className="text-blue-600 underline">GERÇEKLERİ</span> ÖĞREN.
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-[16px] leading-relaxed text-slate-400 font-medium">
          İstanbul'daki binaların gerçek sakin deneyimleri. Kiralamadan önce binanın karnesini gör; sen de yaşadıklarını paylaş, mührünü bas.
        </p>
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/giris" className="bg-blue-600 text-white px-9 py-4 rounded-2xl text-[13px] font-black uppercase italic tracking-wide hover:bg-black transition-all shadow-xl shadow-blue-200">HEMEN BAŞLA →</Link>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-[11px] font-black uppercase italic text-blue-600 tracking-widest">ÇOK YAKINDA APP STORE'DA</span>
          </div>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-20 grid gap-4 md:grid-cols-3">
        {[
          ['🔒', 'Binayı Mühürle', 'Isınma, deprem dayanıklılığı, komşuluk, yönetim... Deneyimini kategori kategori puanla, sorunları ve artıları işaretle. İstersen anonim kal.'],
          ['🗺️', 'Haritada Keşfet', 'Mühürlenmiş binaları harita üzerinde gör. İlçe, sokak ya da bina adıyla ara; çevresindeki okul, hastane ve ulaşım noktalarını incele.'],
          ['📡', 'Radara Al', 'İlgilendiğin binaları takip et — yeni bir sakin deneyimi paylaşıldığında anında haberin olsun.'],
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
