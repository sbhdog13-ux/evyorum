"use client";

import { useState, useEffect } from "react";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";
import { User, LogOut, MessageSquarePlus, LogIn } from "lucide-react";
import { useRouter } from "next/navigation";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const router = useRouter();

  useEffect(() => {
    const savedLogin = localStorage.getItem('userLoggedIn');
    const savedName = localStorage.getItem('userName');
    if (savedLogin === 'true') {
      setIsLoggedIn(true);
      setUserName(savedName || "SALTUK BUĞRA");
    }
  }, []);

  const handleLogout = () => {
    if (confirm('Çıkış yapmak istiyor musunuz?')) {
      localStorage.removeItem('userLoggedIn');
      localStorage.removeItem('userName');
      setIsLoggedIn(false);
      window.location.href = '/';
    }
  };

  return (
    <html lang="tr">
      <body className={inter.className}>
        <header className="sticky top-0 z-[100] bg-white border-b border-slate-100 shadow-sm">
          <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
            
            {/* YENİ LOGO: BULEVİNİ */}
            <Link href="/" className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-[1.25rem] flex items-center justify-center text-white font-black text-2xl rotate-3 shadow-xl shadow-blue-100">b</div>
              <div className="flex flex-col text-left">
                <span className="font-black text-xl tracking-tighter uppercase italic text-black leading-none">BULEVİNİ</span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1 italic">Gerçekleri Öğren</span>
              </div>
            </Link>

            <div className="flex items-center gap-4">
              {isLoggedIn ? (
                <>
                  <Link href="/profil" className="flex items-center gap-3 bg-black px-6 py-3 rounded-2xl transition-all hover:bg-slate-800 border border-black shadow-lg shadow-black/10">
                    <div className="w-8 h-8 bg-white/20 rounded-xl flex items-center justify-center text-white"><User size={16} /></div>
                    <span className="text-[13px] font-black uppercase italic tracking-tighter text-white">{userName}</span>
                  </Link>
                  <button onClick={handleLogout} className="p-3 bg-slate-100 rounded-2xl text-slate-400 hover:text-red-600 transition-all border border-slate-200"><LogOut size={20} /></button>
                </>
              ) : (
                <Link href="/giris" className="flex items-center gap-2 bg-slate-100 px-6 py-3 rounded-2xl font-black uppercase italic text-[12px] text-black border border-slate-200 hover:bg-slate-200 transition-all">
                  <LogIn size={18} className="text-blue-600" /> GİRİŞ YAP
                </Link>
              )}
              
              <Link 
                href="/yorum-yap" 
                onClick={(e) => { if(!isLoggedIn) { e.preventDefault(); router.push('/giris'); } }}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-black uppercase italic text-[12px] flex items-center gap-2 shadow-xl shadow-blue-100 hover:bg-black transition-all"
              >
                <MessageSquarePlus size={18} /> DENEYİMİNİ PAYLAŞ
              </Link>
            </div>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}