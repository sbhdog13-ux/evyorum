"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Search, Radar, MessageSquarePlus, User, BarChart2, Menu, X, Map, Building2, MessageSquare, LogOut } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/app/lib/firebase-auth';
import { useAuth } from '@/app/contexts/AuthContext';
import { useLang } from '@/app/lib/i18n';

export default function BottomNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [menuAcik, setMenuAcik] = useState(false);
  const { dil, setDil, t } = useLang();
  const [dilAcik, setDilAcik] = useState(false);

  // Açılış (tanıtım) sayfasında alt menü gösterilmez
  if (pathname === '/') return null;

  const items = [
    { href: '/kesfet', icon: Search, label: t('nav.kesfet') },
    { href: user ? '/profil#radar-detay-bolumu' : '/giris', icon: Radar, label: t('nav.radar') },
    { href: '/skor', icon: BarChart2, label: t('nav.skor') },
    { href: '/yorum-yap', icon: MessageSquarePlus, label: t('nav.muhurle') },
    { href: user ? '/profil' : '/giris', icon: User, label: t('nav.profil') },
  ];

  // Hamburger çekmecesi — mobil uygulamadaki Drawer ile aynı öğeler
  const drawerItems = [
    { icon: Map, label: t('menu.kesfet'), href: '/kesfet' },
    { icon: Search, label: t('menu.muhurler'), href: '/arama' },
    { icon: BarChart2, label: t('menu.skorlar'), href: '/skor' },
    { icon: Building2, label: t('menu.binaOlustur'), href: '/bina-olustur' },
    { icon: Radar, label: t('menu.radar'), href: '/profil#radar-detay-bolumu' },
    { icon: MessageSquare, label: t('menu.yorumlarim'), href: '/profil#arsiv-bolumu' },
  ];

  return (
    <>
      {menuAcik && (
        <div className="fixed inset-0 z-[550] bg-black/45 lg:hidden" onClick={() => setMenuAcik(false)}>
          <div className="absolute left-0 top-0 bottom-0 w-72 bg-white flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="px-6 pt-8 pb-4 border-b border-slate-100 flex items-center justify-between">
              <img src="/logo.png" alt="Bulevini" className="h-10" />
              <button onClick={() => setMenuAcik(false)} className="p-2 bg-slate-50 rounded-xl"><X size={18} /></button>
            </div>
            <nav className="flex-1">
              {drawerItems.map((item, i) => {
                const Icon = item.icon;
                return (
                  <button key={i} onClick={() => { setMenuAcik(false); router.push(item.href); }}
                    className="w-full flex items-center gap-4 h-14 px-6 border-b border-slate-100 text-left">
                    <Icon size={20} className="text-blue-600" />
                    <span className="text-[12px] font-black uppercase tracking-wide text-black">{item.label}</span>
                  </button>
                );
              })}
            </nav>
            <button onClick={() => setDilAcik(v => !v)} className="flex items-center gap-3 px-6 py-4 border-t border-slate-100">
              <span>🌐</span>
              <span className="flex-1 text-left text-[12px] font-black uppercase tracking-wide">DİL / LANGUAGE</span>
              <span className="text-[11px] font-black text-blue-600">{dil.toUpperCase()} ▾</span>
            </button>
            {dilAcik && (
              <div className="mx-6 mb-2 bg-slate-50 rounded-xl overflow-hidden">
                {[['tr', '🇹🇷 Türkçe'], ['en', '🇬🇧 English']].map(([d, ad]) => (
                  <button key={d} onClick={() => { setDil(d); setDilAcik(false); }}
                    className={`w-full px-4 py-2.5 text-left text-[12px] font-black ${dil === d ? 'bg-[#e8f3fa] text-blue-600' : 'text-slate-600'}`}>{ad}</button>
                ))}
              </div>
            )}
            {user && (
              <button onClick={async () => { setMenuAcik(false); await signOut(auth); router.push('/'); }}
                className="flex items-center gap-3 px-6 py-5 text-red-500 border-t border-slate-100 mb-20">
                <LogOut size={18} />
                <span className="text-[13px] font-black uppercase tracking-widest">{t('menu.cikis')}</span>
              </button>
            )}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-[500] bg-white/80 backdrop-blur-xl border-t border-slate-100 lg:hidden">
        <div className="flex items-center justify-around px-1 py-2 pb-safe">
          <button onClick={() => setMenuAcik(true)} className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl">
            <Menu size={22} className="text-slate-400" strokeWidth={1.8} />
            <span className="text-[10px] font-black italic uppercase tracking-tight text-slate-400">{t('nav.menu')}</span>
          </button>
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link key={item.label} href={item.href} className="flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all">
                <item.icon size={22} className={isActive ? 'text-blue-600' : 'text-slate-400'} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className={`text-[10px] font-black italic uppercase tracking-tight ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
