"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useLang } from '@/app/lib/i18n';
import { adTuret, adGecerliMi, adMusaitMi, adKaydet, adGetir } from '@/app/lib/kullaniciadi';

// Mevcut hesaplar için tek seferlik "kullanıcı adını seç" penceresi.
// Yeni kayıtlar adı kayıt formunda alır; bu kapı eski hesapları yakalar.
export default function KullaniciAdiKapisi() {
  const { user } = useAuth() as any;
  const { t } = useLang();
  const [gerekli, setGerekli] = useState(false);
  const [ad, setAd] = useState('');
  const [durum, setDurum] = useState<'bos' | 'kontrol' | 'musait' | 'alinmis' | 'gecersiz'>('bos');
  const [kaydediyor, setKaydediyor] = useState(false);

  useEffect(() => {
    if (!user) { setGerekli(false); return; }
    adGetir(user.uid).then(mevcut => {
      if (!mevcut) {
        setGerekli(true);
        const oneri = adTuret(user.displayName || user.email?.split('@')[0] || '');
        if (oneri.length >= 3) { setAd(oneri); kontrolEt(oneri); }
      }
    });
  }, [user]);

  const kontrolEt = async (deger: string) => {
    if (!adGecerliMi(deger)) { setDurum(deger ? 'gecersiz' : 'bos'); return; }
    setDurum('kontrol');
    setDurum(await adMusaitMi(deger) ? 'musait' : 'alinmis');
  };

  const kaydet = async () => {
    if (durum !== 'musait' || !user) return;
    setKaydediyor(true);
    try {
      await adKaydet(user.uid, ad);
      setGerekli(false);
    } catch { setDurum('alinmis'); }
    finally { setKaydediyor(false); }
  };

  if (!gerekli) return null;

  return (
    <div className="fixed inset-0 z-[800] bg-black/60 flex items-center justify-center p-6">
      <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md text-black">
        <h3 className="font-black uppercase italic text-[18px] tracking-tighter">{t('kadi.secBaslik')}</h3>
        <p className="text-[13px] text-slate-500 leading-relaxed mt-2">{t('kadi.secAciklama')}</p>
        <div className="mt-5 flex items-center gap-2 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 h-14 focus-within:border-[#023E56]">
          <span className="font-black text-slate-400">@</span>
          <input value={ad} autoFocus
            onChange={e => { const d = adTuret(e.target.value); setAd(d); kontrolEt(d); }}
            placeholder={t('kadi.ph')}
            className="flex-1 bg-transparent outline-none text-[15px] font-black italic lowercase" />
        </div>
        <div className={`mt-2 text-[11px] font-bold ${durum === 'musait' ? 'text-green-600' : durum === 'kontrol' ? 'text-slate-400' : 'text-red-500'}`}>
          {durum === 'musait' ? t('kadi.musait') : durum === 'kontrol' ? t('kadi.kontrol') : durum === 'alinmis' ? t('kadi.alinmis') : durum === 'gecersiz' ? t('kadi.gecersiz') : t('kadi.gecersiz')}
        </div>
        <button onClick={kaydet} disabled={durum !== 'musait' || kaydediyor}
          className={`mt-5 w-full h-14 rounded-2xl text-[13px] font-black uppercase italic tracking-widest transition-all ${durum === 'musait' && !kaydediyor ? 'bg-[#023E56] text-white' : 'bg-slate-100 text-slate-300'}`}>
          {kaydediyor ? '...' : `@${ad || '...'} — ${t('kadi.kaydet')}`}
        </button>
      </div>
    </div>
  );
}
