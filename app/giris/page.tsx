"use client";

import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { auth } from '@/app/lib/firebase-auth';
import { LogIn, ArrowRight, UserPlus, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLang, LangSwitcher } from '@/app/lib/i18n';
import { adTuret, adGecerliMi, adMusaitMi, adKaydet } from '@/app/lib/kullaniciadi';
import { olay } from '@/app/lib/analytics';

export default function GirisKayitSayfasi() {
  const [mode, setMode] = useState<'giris' | 'kayit'>('giris');
  const [email, setEmail] = useState('');
  const [sifre, setSifre] = useState('');
  const [isim, setIsim] = useState('');
  const [kadi, setKadi] = useState('');
  const [kadiElle, setKadiElle] = useState(false);
  const [kadiDurum, setKadiDurum] = useState<'bos' | 'kontrol' | 'musait' | 'alinmis' | 'gecersiz'>('bos');

  const kadiKontrol = async (deger: string) => {
    if (!adGecerliMi(deger)) { setKadiDurum(deger ? 'gecersiz' : 'bos'); return; }
    setKadiDurum('kontrol');
    setKadiDurum(await adMusaitMi(deger) ? 'musait' : 'alinmis');
  };
  const [hata, setHata] = useState('');
  const [loading, setLoading] = useState(false);
  const [kvkkOnay, setKvkkOnay] = useState(false);
  const router = useRouter();
  const { t } = useLang();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHata('');
    if (mode === 'kayit' && !kvkkOnay) {
      setHata(t('giris.hataKvkk'));
      return;
    }
    setLoading(true);

    try {
      if (mode === 'giris') {
        await signInWithEmailAndPassword(auth, email, sifre);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, sifre);
        await updateProfile(result.user, { displayName: isim });
        try { await adKaydet(result.user.uid, kadi); } catch {} // ad alınamazsa kapı tekrar sorar
        olay("kayit_olundu");
        sendEmailVerification(result.user).catch(() => {});
        alert(t('dogrula.gonderildi'));
      }
      router.push('/');
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential') setHata(t('giris.hataGiris'));
      else if (err.code === 'auth/email-already-in-use') setHata(t('giris.hataKayitli'));
      else if (err.code === 'auth/weak-password') setHata(t('giris.hataSifre'));
      else setHata(t('giris.hataGenel'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-black font-sans">
      <div className="max-w-md w-full bg-white rounded-[3rem] p-12 shadow-2xl border border-slate-100 relative overflow-hidden">
        
        <div className="absolute top-5 right-5"><LangSwitcher /></div>
        <div className="text-center mb-10">
          <img src="/logo.png" alt="Bulevini" className="h-20 mx-auto mb-6" />
          <h1 className="text-[28px] font-black uppercase italic tracking-tighter mb-2">
            {mode === 'giris' ? t('giris.hosgeldin') : t('giris.yeniHesap')}
          </h1>
          <p className="text-slate-400 text-[12px] font-bold uppercase italic">
            {mode === 'giris' ? t('giris.altYazi') : t('giris.katil')}
          </p>
        </div>

        {hata && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-[12px] font-bold text-center">
            {hata}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'kayit' && (
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase italic tracking-widest ml-4 text-slate-400">{t('giris.isim')}</label>
              <input
                type="text"
                required
                value={isim}
                onChange={(e) => { setIsim(e.target.value); if (!kadiElle) { const o = adTuret(e.target.value); setKadi(o); if (o.length >= 3) kadiKontrol(o); } }}
                placeholder={t('giris.isimPh')}
                className="w-full h-16 bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 text-[14px] font-black italic focus:outline-none focus:border-blue-600 transition-all uppercase"
              />
            </div>
          )}

          {mode === 'kayit' && (
            <div className="space-y-2">
              <label className="text-[11px] font-black uppercase italic tracking-widest ml-4 text-slate-400">{t('kadi.etiket')}</label>
              <div className="flex items-center gap-2 w-full h-16 bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 focus-within:border-blue-600 transition-all">
                <span className="font-black text-slate-400">@</span>
                <input
                  value={kadi}
                  onChange={(e) => { setKadiElle(true); const d = adTuret(e.target.value); setKadi(d); kadiKontrol(d); }}
                  placeholder={t('kadi.ph')}
                  className="flex-1 bg-transparent outline-none text-[14px] font-black italic lowercase"
                />
              </div>
              {kadi && (
                <div className={`ml-4 text-[11px] font-bold ${kadiDurum === 'musait' ? 'text-green-600' : kadiDurum === 'kontrol' ? 'text-slate-400' : 'text-red-500'}`}>
                  {kadiDurum === 'musait' ? t('kadi.musait') : kadiDurum === 'kontrol' ? t('kadi.kontrol') : kadiDurum === 'alinmis' ? t('kadi.alinmis') : t('kadi.gecersiz')}
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase italic tracking-widest ml-4 text-slate-400">{t('giris.eposta')}</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@mail.com"
              className="w-full h-16 bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 text-[14px] font-black italic focus:outline-none focus:border-blue-600 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[11px] font-black uppercase italic tracking-widest ml-4 text-slate-400">{t('giris.sifre')}</label>
            <input
              type="password"
              required
              value={sifre}
              onChange={(e) => setSifre(e.target.value)}
              placeholder="••••••••"
              className="w-full h-16 bg-slate-50 border-2 border-slate-50 rounded-2xl px-6 text-[14px] font-black italic focus:outline-none focus:border-blue-600 transition-all"
            />
          </div>

          {mode === 'kayit' && (
            <label className="flex items-start gap-3 px-2 cursor-pointer">
              <input
                type="checkbox"
                checked={kvkkOnay}
                onChange={(e) => setKvkkOnay(e.target.checked)}
                className="mt-0.5 w-5 h-5 accent-blue-600"
              />
              <span className="text-[11px] font-bold text-slate-500 leading-relaxed">
                <a href="/gizlilik" target="_blank" className="text-blue-600 underline">{t('giris.kvkkLink')}</a>{t('giris.kvkkSon')}
              </span>
            </label>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full h-16 bg-[#023E56] text-white rounded-2xl text-[14px] font-black uppercase italic tracking-widest hover:bg-blue-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95 mt-4"
          >
            {loading ? t('giris.bekle') : mode === 'giris' ? t('giris.girisYap') : t('giris.hesapOlustur')}
            <ArrowRight size={20} />
          </button>
        </form>

        <div className="mt-10 text-center border-t border-slate-50 pt-8">
          <button
            onClick={() => { setMode(mode === 'giris' ? 'kayit' : 'giris'); setHata(''); }}
            className="text-[11px] font-bold text-slate-400 uppercase italic hover:text-blue-600 transition-colors"
          >
            {mode === 'giris' ? t('giris.kayitOl') : t('giris.girise')}
          </button>
        </div>
      </div>
    </div>
  );
}