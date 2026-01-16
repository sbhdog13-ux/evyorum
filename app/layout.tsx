"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { User, LogOut } from "lucide-react";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const userName = "SALTUK BUĞRA";

  return (
    <html lang="tr">
      <body className={inter.className}>
        <header className="sticky top-0 z-[100] bg-white border-b border-slate-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl rotate-3 shadow-xl shadow-blue-100">E</div>
              <div className="flex flex-col text-left">
                <span className="font-black text-xl tracking-tighter uppercase italic text-black leading-none">EVYORUM</span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1 italic">Gerçekleri Öğren</span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {/* Profil Linki - ARTIK AKTİF */}
              <Link href="/profil" className="flex items-center gap-3 bg-black px-6 py-3 rounded-2xl transition-all hover:bg-blue-600 group border border-black shadow-lg shadow-black/10">
                <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white">
                  <User size={16} />
                </div>
                <span className="text-[13px] font-black uppercase italic tracking-tighter text-white">
                  {userName}
                </span>
              </Link>
              
              {/* Çıkış Butonu - ARTIK AKTİF */}
              <button 
                onClick={() => { if(confirm('Çıkış yapmak istiyor musunuz?')) window.location.href = '/'; }}
                className="p-3 bg-slate-100 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all border border-slate-200"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}