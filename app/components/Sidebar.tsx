"use client";
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Map, Search, BarChart2, Building2, Radio, MessageSquare, LogOut, ShieldCheck } from 'lucide-react';
import { signOut } from 'firebase/auth';
import { auth } from '@/app/lib/firebase';
import { useAuth } from '@/app/contexts/AuthContext';
import { useLang } from '@/app/lib/i18n';
import { useState } from 'react';

// Mobildeki hamburger menünün (Drawer) web karşılığı — aynı sıra, aynı öğeler
export default function Sidebar() {
  const { user } = useAuth();
  const { dil, setDil, t } = useLang();
  const [dilAcik, setDilAcik] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const items = [
    { icon: Map, label: t('menu.kesfet'), href: '/kesfet' },
    { icon: Search, label: t('menu.muhurler'), href: '/arama' },
    { icon: BarChart2, label: t('menu.skorlar'), href: '/skor', highlight: true },
    { icon: Building2, label: t('menu.binaOlustur'), href: '/bina-olustur' },
    { icon: Radio, label: t('menu.radar'), href: '/profil' },
    { icon: MessageSquare, label: t('menu.yorumlarim'), href: '/profil' },
  ];

  const initial = user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || 'U';
  const displayName = (user?.displayName || user?.email?.split('@')[0] || 'Kullanıcı').toUpperCase();

  return (
    <aside className="w-80 h-screen bg-white text-black flex-col border-r border-slate-100 fixed left-0 top-0 z-[250] hidden lg:flex">
      <div className="px-6 pt-10 pb-5 border-b border-slate-100">
        <Link href="/kesfet"><img src="/logo.png" alt="Bulevini" className="h-12" /></Link>
        <div className="h-[5px] w-10 bg-blue-600 mt-1.5 rounded-full" />
      </div>

      <nav className="mt-2">
        {items.map((item, i) => {
          const Icon = item.icon;
          const aktif = item.highlight;
          return (
            <button key={i} onClick={() => router.push(item.href)}
              className={`w-full flex items-center gap-4 h-14 px-6 border-b border-slate-100 text-left transition-colors ${aktif ? 'bg-blue-50' : 'hover:bg-slate-50'}`}>
              <Icon size={20} className="text-blue-600" />
              <span className={`flex-1 text-[12px] font-black uppercase tracking-wide ${aktif ? 'text-blue-600' : 'text-black'}`}>{item.label}</span>
              {aktif && <span className="bg-blue-600 text-white text-[8px] font-black tracking-widest px-2 py-0.5 rounded-lg">YENİ</span>}
            </button>
          );
        })}
      </nav>

      <div className="flex-1" />

      <div className="border-t border-slate-100 pb-8">
        <div className="flex items-center gap-3.5 px-6 py-4">
          <div className="w-11 h-11 bg-blue-600 rounded-2xl flex items-center justify-center font-black italic text-white">{initial}</div>
          <div className="min-w-0">
            <div className="text-[13px] font-black italic uppercase tracking-tight truncate">{displayName}</div>
            <Link href="/profil" className="text-[10px] font-black text-blue-600 tracking-widest">PROFİLİM</Link>
          </div>
        </div>
        <button onClick={() => setDilAcik(v => !v)} className="w-full flex items-center gap-3 px-6 py-3 hover:bg-slate-50 transition-colors">
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
        <button onClick={async () => { await signOut(auth); router.push('/'); }} className="w-full flex items-center gap-3 px-6 py-3 text-red-500 hover:bg-red-50 transition-colors">
          <LogOut size={18} />
          <span className="text-[13px] font-black uppercase tracking-widest">{t('menu.cikis')}</span>
        </button>
        <div className="mx-6 mt-1.5 flex items-center gap-2 bg-slate-50 rounded-2xl px-4 py-2.5">
          <ShieldCheck size={14} className="text-slate-400" />
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">GÜVENLİ ERİŞİM</span>
        </div>
      </div>
    </aside>
  );
}
