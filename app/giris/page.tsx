"use client";

import { useState } from 'react';
import { LogIn, ArrowRight, UserPlus, Mail } from 'lucide-react';

export default function GirisKayitSayfasi() {
  const [mode, setMode] = useState<'giris' | 'kayit'>('giris');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Tarayıcıya "Giriş Yapıldı" notu bırakıyoruz
    if (typeof window !== 'undefined') {
      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('userName', 'SALTUK BUĞRA');
      // Anasayfaya gönderiyoruz
      window.location.href = '/'; 
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-black font-sans">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 relative overflow-hidden">
        
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl">
            {mode === 'giris' ? <LogIn size={32} /> : <UserPlus size={32} />}
          </div>
          <h1 className="text-[28px] font-black uppercase italic tracking-tighter mb-2">
            {mode === 'giris' ? 'TEKRAR HOŞ GELDİN' : 'YENİ HESAP AÇ'}
          </h1>
          <p className="text-slate-400 text-[12px] font-bold uppercase italic">
            {mode === 'giris' ? 'Radarın seni bekliyor' : 'Bulevini topluluğuna katıl'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'kayit' && (
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase italic tracking-widest ml-4 text-slate-400">ADIN VE SOYADIN</label>
              <input 
                type="text" 
                required 
                placeholder="ÖRN: SALTUK BUĞRA" 
                className="w-full h-16 bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 text-[14px] font-black italic focus:outline-none focus:border-blue-600 transition-all uppercase" 
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase italic tracking-widest ml-4 text-slate-400">E-POSTA</label>
            <input 
              type="email" 
              required 
              placeholder="ornek@mail.com" 
              className="w-full h-16 bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 text-[14px] font-black italic focus:outline-none focus:border-blue-600 transition-all" 
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase italic tracking-widest ml-4 text-slate-400">ŞİFREN</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••" 
              className="w-full h-16 bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 text-[14px] font-black italic focus:outline-none focus:border-blue-600 transition-all" 
            />
          </div>

          {mode === 'kayit' && (
            <div className="space-y-2 pt-2">
              <label className="text-[11px] font-black uppercase italic tracking-widest ml-4 text-blue-600 flex items-center gap-2">
                <Mail size={12} /> REFERANS E-POSTASI
              </label>
              <input 
                type="email" 
                placeholder="arkadas@mail.com" 
                className="w-full h-16 bg-blue-50/30 border-2 border-dashed border-blue-100 rounded-2xl px-6 text-[14px] font-black italic focus:outline-none focus:border-blue-600 transition-all" 
              />
              <p className="text-[10px] text-slate-400 italic ml-4 font-medium">Sizi kim davet etti? (İsteğe bağlıdır)</p>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full h-16 bg-black text-white rounded-2xl text-[14px] font-black uppercase italic tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 mt-4"
          >
            {mode === 'giris' ? 'SİSTEME GİRİŞ YAP' : 'HESABI OLUŞTUR'} <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-10 text-center border-t border-slate-50 pt-8">
          <button 
            onClick={() => setMode(mode === 'giris' ? 'kayit' : 'giris')} 
            className="text-[11px] font-bold text-slate-400 uppercase italic hover:text-blue-600 transition-colors"
          >
            {mode === 'giris' ? "Hesabın yok mu? KAYIT OL" : "Zaten hesabın var mı? GİRİŞ YAP"}
          </button>
        </div>
      </div>
    </div>
  );
}