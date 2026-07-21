"use client";
// Bulevini markalı hesap işlem sayfası — e-posta doğrulama + şifre sıfırlama.
// Firebase'in maildeki linkleri buraya düşer: ?mode=verifyEmail|resetPassword&oobCode=...
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/app/lib/firebase-auth';
import { applyActionCode, verifyPasswordResetCode, confirmPasswordReset } from 'firebase/auth';
import { CheckCircle, AlertTriangle, Lock, Loader2, Eye, EyeOff } from 'lucide-react';

const BuleviniLogo = () => (
  <img src="/logo.png" alt="Bulevini" className="h-12 w-auto mx-auto mb-8" />
);

const Kutu = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-white flex items-center justify-center px-6 text-center">
    <div className="max-w-md w-full">{children}</div>
  </div>
);

function HesapIslem() {
  const params = useSearchParams();
  const router = useRouter();
  const mode = params.get('mode');
  const oobCode = params.get('oobCode') || '';

  const [durum, setDurum] = useState<'yukleniyor' | 'dogrulandi' | 'sifreForm' | 'sifreBasarili' | 'hata'>('yukleniyor');
  const [hataMetni, setHataMetni] = useState('');
  const [eposta, setEposta] = useState('');
  const [yeniSifre, setYeniSifre] = useState('');
  const [gonderiliyor, setGonderiliyor] = useState(false);
  const [goster, setGoster] = useState(false);

  useEffect(() => {
    (async () => {
      if (!oobCode) { setDurum('hata'); setHataMetni('Bağlantı geçersiz veya eksik.'); return; }
      try {
        if (mode === 'verifyEmail') {
          await applyActionCode(auth, oobCode);
          setDurum('dogrulandi');
        } else if (mode === 'resetPassword') {
          const mail = await verifyPasswordResetCode(auth, oobCode);
          setEposta(mail);
          setDurum('sifreForm');
        } else {
          setDurum('hata'); setHataMetni('Bilinmeyen işlem.');
        }
      } catch {
        setDurum('hata');
        setHataMetni('Bu bağlantının süresi dolmuş ya da daha önce kullanılmış. Yeni bir bağlantı iste.');
      }
    })();
  }, [mode, oobCode]);

  const sifreyiKaydet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (yeniSifre.length < 6) { setHataMetni('Şifre en az 6 karakter olmalı.'); return; }
    setGonderiliyor(true); setHataMetni('');
    try {
      await confirmPasswordReset(auth, oobCode, yeniSifre);
      setDurum('sifreBasarili');
    } catch {
      setHataMetni('Şifre güncellenemedi. Bağlantı süresi dolmuş olabilir.');
      setGonderiliyor(false);
    }
  };

  if (durum === 'yukleniyor') return (
    <Kutu><BuleviniLogo /><Loader2 className="animate-spin text-blue-600 mx-auto mb-4" size={34} /><p className="text-[13px] font-black italic uppercase text-slate-300 tracking-widest">KONTROL EDİLİYOR…</p></Kutu>
  );

  if (durum === 'dogrulandi') return (
    <Kutu>
      <BuleviniLogo />
      <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-5"><CheckCircle className="text-green-600" size={32} /></div>
      <h1 className="text-[24px] md:text-[28px] font-black uppercase italic tracking-tighter text-[#023E56] mb-3">E-postan doğrulandı ✓</h1>
      <p className="text-[14px] text-slate-400 mb-8 leading-relaxed">Artık binaların ortak hafızasının tam bir parçasısın. Mühür basmaya, radar kurmaya hazırsın.</p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link href="/" className="bg-blue-600 text-white px-7 py-3.5 rounded-2xl font-black text-[13px] uppercase italic tracking-tight hover:bg-[#023E56] transition-all">ANA SAYFA →</Link>
        <Link href="/giris" className="bg-slate-100 text-slate-500 px-7 py-3.5 rounded-2xl font-black text-[13px] uppercase italic tracking-tight hover:bg-slate-200 transition-all">GİRİŞ YAP</Link>
      </div>
    </Kutu>
  );

  if (durum === 'sifreForm') return (
    <Kutu>
      <BuleviniLogo />
      <div className="w-16 h-16 rounded-2xl bg-[#e8f3fa] border border-[#A1CDE9] flex items-center justify-center mx-auto mb-5"><Lock className="text-blue-600" size={30} /></div>
      <h1 className="text-[24px] md:text-[28px] font-black uppercase italic tracking-tighter text-[#023E56] mb-2">Yeni şifreni belirle</h1>
      <p className="text-[13px] text-slate-400 mb-7">{eposta} için yeni bir şifre gir.</p>
      <form onSubmit={sifreyiKaydet} className="text-left">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Yeni şifre</label>
        <div className="relative mt-1 mb-2">
          <input
            type={goster ? 'text' : 'password'}
            value={yeniSifre}
            onChange={(e) => setYeniSifre(e.target.value)}
            placeholder="En az 6 karakter"
            className="w-full border-2 border-slate-200 rounded-xl px-4 py-3.5 outline-none focus:border-blue-600 font-medium"
            autoFocus
          />
          <button type="button" onClick={() => setGoster(!goster)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500">
            {goster ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {hataMetni && <p className="text-[12px] text-red-500 font-bold mb-3">{hataMetni}</p>}
        <button type="submit" disabled={gonderiliyor}
          className="w-full mt-3 bg-blue-600 text-white py-4 rounded-2xl font-black text-[14px] uppercase italic tracking-tight hover:bg-[#023E56] transition-all disabled:opacity-40">
          {gonderiliyor ? 'KAYDEDİLİYOR…' : 'ŞİFREYİ GÜNCELLE'}
        </button>
      </form>
    </Kutu>
  );

  if (durum === 'sifreBasarili') return (
    <Kutu>
      <BuleviniLogo />
      <div className="w-16 h-16 rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mx-auto mb-5"><CheckCircle className="text-green-600" size={32} /></div>
      <h1 className="text-[24px] md:text-[28px] font-black uppercase italic tracking-tighter text-[#023E56] mb-3">Şifren güncellendi ✓</h1>
      <p className="text-[14px] text-slate-400 mb-8 leading-relaxed">Artık yeni şifrenle giriş yapabilirsin.</p>
      <Link href="/giris" className="inline-block bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black text-[13px] uppercase italic tracking-tight hover:bg-[#023E56] transition-all">GİRİŞ YAP →</Link>
    </Kutu>
  );

  return (
    <Kutu>
      <BuleviniLogo />
      <div className="w-16 h-16 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-5"><AlertTriangle className="text-red-500" size={30} /></div>
      <h1 className="text-[22px] md:text-[26px] font-black uppercase italic tracking-tighter text-[#023E56] mb-3">Bağlantı geçersiz</h1>
      <p className="text-[14px] text-slate-400 mb-8 leading-relaxed">{hataMetni || 'Bir sorun oluştu.'}</p>
      <Link href="/giris" className="inline-block bg-slate-100 text-slate-500 px-8 py-3.5 rounded-2xl font-black text-[13px] uppercase italic tracking-tight hover:bg-slate-200 transition-all">GİRİŞ SAYFASINA DÖN</Link>
    </Kutu>
  );
}

export default function HesapIslemSayfasi() {
  return (
    <Suspense fallback={<Kutu><BuleviniLogo /><p className="text-slate-300 font-black italic uppercase text-[12px]">YÜKLENİYOR…</p></Kutu>}>
      <HesapIslem />
    </Suspense>
  );
}
