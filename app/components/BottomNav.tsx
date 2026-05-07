"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, Radar, MessageSquarePlus, User } from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const items = [
  { href: '/', icon: Search, label: 'Keşfet' },
  { href: '/arama', icon: Radar, label: 'Radar' },
  { href: '/yorum-yap', icon: MessageSquarePlus, label: 'Mühürle' },
  { href: user ? '/profil' : '/giris', icon: User, label: 'Profil' },
];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-[500] bg-white/80 backdrop-blur-xl border-t border-slate-100 lg:hidden">
      <div className="flex items-center justify-around px-2 py-2 pb-safe">
        {items.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center gap-1 px-4 py-2 rounded-2xl transition-all"
            >
              <item.icon
                size={22}
                className={isActive ? 'text-blue-600' : 'text-slate-400'}
                strokeWidth={isActive ? 2.5 : 1.8}
              />
              <span className={`text-[10px] font-black italic uppercase tracking-tight ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}