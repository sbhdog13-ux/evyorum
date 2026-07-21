"use client";
import { useState } from 'react';
import { sendEmailVerification, reload } from 'firebase/auth';
import { auth } from '@/app/lib/firebase-auth';
import { dogrulamaMailiGonder } from '@/app/lib/mailler';
import { useLang } from '@/app/lib/i18n';
import { olay } from '@/app/lib/analytics';
import { MailWarning } from 'lucide-react';

// Yumuşak kapı: e-posta doğrulanmadan mühür/bina formu yerine bu panel gösterilir
export default function DogrulamaKapisi() {
  const { t } = useLang();
  const [mesaj, setMesaj] = useState('');
  const [yukleniyor, setYukleniyor] = useState(false);

  const tekrarGonder = async () => {
    if (!auth.currentUser) return;
    setYukleniyor(true);
    // Markalı mail (Resend); olmadı Firebase varsayılanına düş
    try { await dogrulamaMailiGonder(); setMesaj(t('dogrula.gonderildi')); }
    catch {
      try { await sendEmailVerification(auth.currentUser); setMesaj(t('dogrula.gonderildi')); }
      catch { setMesaj('...'); }
    }
    finally { setYukleniyor(false); }
  };

  const kontrolEt = async () => {
    if (!auth.currentUser) return;
    setYukleniyor(true);
    await reload(auth.currentUser);
    if (auth.currentUser.emailVerified) { olay("eposta_dogrulandi"); window.location.reload(); }
    else setMesaj(t('dogrula.hala'));
    setYukleniyor(false);
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white border border-slate-100 rounded-[2rem] p-10 text-center shadow-xl">
        <div className="w-16 h-16 bg-[#e8f3fa] rounded-2xl flex items-center justify-center mx-auto mb-6">
          <MailWarning size={30} className="text-blue-600" />
        </div>
        <h2 className="font-black uppercase italic text-[18px] mb-3">{t('dogrula.baslik')}</h2>
        <p className="text-[13px] text-slate-500 leading-relaxed mb-6">{t('dogrula.gerekli')}</p>
        {mesaj && <p className="text-[12px] text-blue-600 font-bold mb-4">{mesaj}</p>}
        <button onClick={kontrolEt} disabled={yukleniyor} className="w-full bg-blue-600 text-white rounded-2xl py-3.5 font-black uppercase italic text-[12px] mb-3">{t('dogrula.kontrolEt')}</button>
        <button onClick={tekrarGonder} disabled={yukleniyor} className="w-full bg-slate-100 text-slate-600 rounded-2xl py-3.5 font-black uppercase italic text-[12px]">{t('dogrula.tekrar')}</button>
      </div>
    </div>
  );
}
