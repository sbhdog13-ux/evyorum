"use client";
import React, { useState } from 'react';
import { Mail, Lock, User, ArrowRight, Home, ShieldCheck } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [kvkkAccepted, setKvkkAccepted] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLogin && !kvkkAccepted) {
      setError("Devam etmek için KVKK ve Aydınlatma metnini onaylamalısınız.");
      return;
    }
    // Giriş yapılmış gibi simüle et
    localStorage.setItem("user", "Ahmet Yılmaz"); 
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-6">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
          <Home className="text-blue-600 group-hover:scale-110 transition-transform" size={28} />
          <span className="text-2xl font-black text-black tracking-tighter">EVYORUM</span>
        </Link>
        <h2 className="text-4xl font-black text-black tracking-tight italic">
          {isLogin ? 'Tekrar Hoş Geldin' : 'Aramıza Katıl'}
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-10 px-8 shadow-2xl rounded-[3rem] border-2 border-black">
          <form className="space-y-6" onSubmit={handleAuth}>
            {!isLogin && (
              <div>
                <label className="block text-xs font-black text-black mb-2 uppercase tracking-widest">AD SOYAD</label>
                <input 
                  type="text" 
                  required 
                  className="block w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-black outline-none transition-all font-bold text-black placeholder:text-slate-400" 
                  placeholder="Örn: Ahmet Yılmaz" 
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-black text-black mb-2 uppercase tracking-widest">E-POSTA</label>
              <input 
                type="email" 
                required 
                className="block w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-black outline-none transition-all font-bold text-black placeholder:text-slate-400" 
                placeholder="E-posta adresiniz" 
              />
            </div>

            <div>
              <label className="block text-xs font-black text-black mb-2 uppercase tracking-widest">ŞİFRE</label>
              <input 
                type="password" 
                required 
                className="block w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-black outline-none transition-all font-bold text-black placeholder:text-slate-400" 
                placeholder="••••••••" 
              />
            </div>
            
            {!isLogin && (
              <div className="flex flex-col gap-2 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-start gap-3">
                  <input 
                    type="checkbox" 
                    id="kvkk" 
                    checked={kvkkAccepted} 
                    onChange={(e) => setKvkkAccepted(e.target.checked)} 
                    className="mt-1 w-5 h-5 rounded border-2 border-black cursor-pointer accent-blue-600" 
                  />
                  <label htmlFor="kvkk" className="text-[11px] text-black font-bold leading-tight cursor-pointer">
                    <span className="text-blue-600 underline">KVKK Aydınlatma Metni</span>'ni okudum ve kabul ediyorum.
                  </label>
                </div>
                {error && <p className="text-red-600 text-[10px] font-black uppercase tracking-tighter">{error}</p>}
              </div>
            )}

            <button type="submit" className="w-full bg-black text-white p-5 rounded-2xl font-black text-lg shadow-xl hover:bg-blue-600 transition-all flex items-center justify-center gap-2">
              {isLogin ? 'GİRİŞ YAP' : 'KAYIT OL'}
              <ArrowRight size={20} />
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => {setIsLogin(!isLogin); setError("");}} 
              className="text-sm font-black text-blue-600 hover:text-black transition-colors underline decoration-2 underline-offset-4"
            >
              {isLogin ? 'HENÜZ HESABIN YOK MU? KAYIT OL' : 'ZATEN ÜYE MİSİN? GİRİŞ YAP'}
            </button>
          </div>
        </div>

        <div className="mt-8 flex justify-center items-center gap-2 text-black text-[10px] font-black uppercase tracking-[0.2em]">
          <ShieldCheck size={16} className="text-blue-600" />
          Uçtan uca şifreli ve güvenli
        </div>
      </div>
    </div>
  );
}