"use client";
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

// Geri butonu — kullanıcı geldiği yere döner; doğrudan açıldıysa (geçmiş yoksa) ana sayfaya.
export default function GeriButonu() {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Geri"
      onClick={() => { if (typeof window !== 'undefined' && window.history.length > 1) router.back(); else router.push('/'); }}
      className="flex items-center gap-1.5 text-[12px] font-black italic uppercase tracking-tight text-slate-400 hover:text-blue-600 transition-colors"
    >
      <ArrowLeft size={16} /> Geri
    </button>
  );
}
