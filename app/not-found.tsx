import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sayfa bulunamadı | Bulevini',
  robots: { index: false, follow: true },
};

// Markalı 404 — olmayan bir adrese gidilince Next'in çıplak yazısı yerine bu çıkar.
export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-6 text-center">
      <div className="max-w-md">
        <div className="text-[80px] md:text-[110px] font-black italic text-[#e8f3fa] leading-none select-none">404</div>
        <h1 className="text-[22px] md:text-[28px] font-black uppercase italic tracking-tighter text-[#023E56] -mt-4 mb-3">
          Burada bir bina yok
        </h1>
        <p className="text-[13px] md:text-[14px] font-medium text-slate-400 mb-8 leading-relaxed">
          Aradığın sayfa taşınmış, silinmiş ya da hiç var olmamış olabilir.
          Merak etme — binaların ortak hafızası hâlâ burada.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/arama" className="bg-blue-600 text-white px-7 py-3.5 rounded-2xl font-black text-[13px] uppercase italic tracking-tight hover:bg-[#023E56] transition-all">
            BİNA ARA →
          </Link>
          <Link href="/" className="bg-slate-100 text-slate-500 px-7 py-3.5 rounded-2xl font-black text-[13px] uppercase italic tracking-tight hover:bg-slate-200 transition-all">
            ANA SAYFA
          </Link>
        </div>
      </div>
    </div>
  );
}
