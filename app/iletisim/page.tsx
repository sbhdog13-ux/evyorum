"use client";
import { useState } from 'react';
import Link from 'next/link';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useLang, LangSwitcher } from '@/app/lib/i18n';
import Footer from '@/app/components/Footer';

export default function IletisimSayfasi() {
  const { t } = useLang();
  const [ad, setAd] = useState('');
  const [eposta, setEposta] = useState('');
  const [konu, setKonu] = useState('');
  const [mesaj, setMesaj] = useState('');
  const [durum, setDurum] = useState<'bos' | 'gonderiliyor' | 'basarili' | 'hata'>('bos');

  const gonder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ad.trim() || !eposta.trim() || !konu.trim() || !mesaj.trim()) { setDurum('hata'); return; }
    setDurum('gonderiliyor');
    try {
      await addDoc(collection(db, 'iletisim'), {
        ad: ad.trim(), eposta: eposta.trim(), konu: konu.trim(), mesaj: mesaj.trim(),
        created_at: serverTimestamp(),
      });
      setDurum('basarili');
      setAd(''); setEposta(''); setKonu(''); setMesaj('');
    } catch { setDurum('hata'); }
  };

  const alanClass = "w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 text-[14px] font-medium outline-none focus:border-[#023E56] transition-all";

  return (
    <div className="min-h-screen bg-white text-[#0f172a] font-sans flex flex-col">
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between px-6 py-7">
        <Link href="/"><img src="/logo.png" alt="Bulevini" className="h-11" /></Link>
        <LangSwitcher />
      </header>

      <section className="max-w-2xl w-full mx-auto px-6 pb-20 flex-1">
        <div className="text-[11px] font-black italic uppercase tracking-[2px] text-slate-400">{t('ilt.eyebrow')}</div>
        <h1 className="font-black italic uppercase tracking-tighter text-[34px] leading-[1.05] mt-2">
          {t('ilt.h1a')} <span className="text-[#023E56]">{t('ilt.h1b')}</span>
        </h1>
        <p className="text-[15px] leading-relaxed text-slate-600 mt-4">{t('ilt.giris')}</p>

        {durum === 'basarili' ? (
          <div className="mt-8 bg-[#e8f3fa] border border-[#A1CDE9] rounded-[2rem] p-8 text-center">
            <div className="text-[40px]">✓</div>
            <p className="text-[15px] font-black italic text-[#023E56] mt-2">{t('ilt.basarili')}</p>
            <button onClick={() => setDurum('bos')} className="mt-5 text-[12px] font-black italic uppercase text-slate-400 hover:text-[#023E56]">{t('ilt.gonder')} →</button>
          </div>
        ) : (
          <form onSubmit={gonder} className="mt-8 space-y-4">
            <div>
              <label className="text-[11px] font-black uppercase italic tracking-widest ml-2 text-slate-400">{t('ilt.ad')}</label>
              <input value={ad} onChange={e => setAd(e.target.value)} placeholder={t('ilt.adPh')} className={alanClass + " mt-1.5"} />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase italic tracking-widest ml-2 text-slate-400">{t('ilt.eposta')}</label>
              <input type="email" value={eposta} onChange={e => setEposta(e.target.value)} placeholder={t('ilt.epostaPh')} className={alanClass + " mt-1.5"} />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase italic tracking-widest ml-2 text-slate-400">{t('ilt.konu')}</label>
              <input value={konu} onChange={e => setKonu(e.target.value)} placeholder={t('ilt.konuPh')} className={alanClass + " mt-1.5"} />
            </div>
            <div>
              <label className="text-[11px] font-black uppercase italic tracking-widest ml-2 text-slate-400">{t('ilt.mesaj')}</label>
              <textarea value={mesaj} onChange={e => setMesaj(e.target.value)} placeholder={t('ilt.mesajPh')} rows={5} maxLength={3000}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-[14px] font-medium outline-none focus:border-[#023E56] transition-all mt-1.5 resize-none" />
            </div>
            {durum === 'hata' && <p className="text-[12px] font-bold text-red-500 ml-2">{t('ilt.eksik')}</p>}
            <button type="submit" disabled={durum === 'gonderiliyor'}
              className="w-full h-14 bg-[#023E56] text-white rounded-2xl text-[13px] font-black italic uppercase tracking-widest disabled:opacity-60">
              {durum === 'gonderiliyor' ? t('ilt.gonderiliyor') : t('ilt.gonder')}
            </button>
          </form>
        )}
      </section>

      <Footer />
    </div>
  );
}
