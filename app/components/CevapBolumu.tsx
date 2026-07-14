"use client";
import { useState } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, query, orderBy, serverTimestamp } from 'firebase/firestore';
import { db } from '@/app/lib/firebase';
import { useAuth } from '@/app/contexts/AuthContext';
import { useLang } from '@/app/lib/i18n';
import { kufurVarMi } from '@/app/lib/kufur';
import { adGetir } from '@/app/lib/kullaniciadi';

// Yorum altı diyalog — tek seviye, puana etkisiz. Karneyi bozmadan tartışma buraya iner.
export default function CevapBolumu({ yorumId, binaAdi }: { yorumId: string; binaAdi: string | null }) {
  const { user } = useAuth() as any;
  const { t } = useLang();
  const [acik, setAcik] = useState(false);
  const [cevaplar, setCevaplar] = useState<any[]>([]);
  const [yuklendi, setYuklendi] = useState(false);
  const [metin, setMetin] = useState('');
  const [gonderiliyor, setGonderiliyor] = useState(false);

  const kapiDurumu = !user ? 'giris' : !user.emailVerified ? 'dogrula' : null;

  const yukle = async () => {
    try {
      const snap = await getDocs(query(collection(db, 'yorumlar', yorumId, 'cevaplar'), orderBy('created_at', 'asc')));
      setCevaplar(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {}
    setYuklendi(true);
  };

  const ac = () => { setAcik(true); if (!yuklendi) yukle(); };

  const gonder = async () => {
    const m = metin.trim();
    if (!m) return;
    if (kufurVarMi(m)) return alert(t('yorum.kufurUyari'));
    if (kapiDurumu === 'giris') { window.location.href = '/giris'; return; }
    if (kapiDurumu) return;
    setGonderiliyor(true);
    try {
      const kadi = await adGetir(user.uid);
      const ref = await addDoc(collection(db, 'yorumlar', yorumId, 'cevaplar'), {
        metin: m,
        kullanici_id: user.uid,
        kullanici_adi: kadi ? '@' + kadi : 'Anonim',
        created_at: serverTimestamp(),
      });
      setCevaplar(prev => [...prev, { id: ref.id, metin: m, kullanici_adi: kadi ? '@' + kadi : 'Anonim', kullanici_id: user.uid }]);
      setMetin('');
    } catch { alert(t('giris.hataGenel')); }
    finally { setGonderiliyor(false); }
  };

  const sil = async (cevapId: string) => {
    if (!confirm(t('cevap.silSor'))) return;
    try {
      await deleteDoc(doc(db, 'yorumlar', yorumId, 'cevaplar', cevapId));
      setCevaplar(prev => prev.filter(c => c.id !== cevapId));
    } catch {}
  };

  const sikayet = async (cevapId: string) => {
    if (!user) { window.location.href = '/giris'; return; }
    if (!confirm(t('yorum.sikayetSor'))) return;
    try {
      await addDoc(collection(db, 'sikayetler'), {
        yorum_id: yorumId, cevap_id: cevapId, bina_adi: binaAdi, kullanici_id: user.uid, created_at: serverTimestamp(),
      });
      alert(t('yorum.sikayetTesekkur'));
    } catch {}
  };

  if (!acik) {
    return (
      <button onClick={ac} className="text-[10px] font-black italic uppercase text-slate-400 hover:text-blue-600 transition-colors pt-1">
        💬 {t('cevap.goster')}{yuklendi && cevaplar.length > 0 ? ` (${cevaplar.length})` : ''}
      </button>
    );
  }

  return (
    <div className="mt-1 pl-4 border-l-2 border-slate-100 space-y-2.5">
      {cevaplar.map(c => (
        <div key={c.id} className="group">
          <div className="flex items-baseline gap-2">
            <span className="text-[11px] font-black italic text-blue-600">{c.kullanici_adi}</span>
            {user?.uid === c.kullanici_id
              ? <button onClick={() => sil(c.id)} className="text-[9px] font-bold text-slate-300 hover:text-red-500 uppercase opacity-0 group-hover:opacity-100 transition-opacity">{t('cevap.sil')}</button>
              : <button onClick={() => sikayet(c.id)} className="text-[9px] font-bold text-slate-300 hover:text-red-500 uppercase opacity-0 group-hover:opacity-100 transition-opacity">🚩</button>}
          </div>
          <p className="text-[12px] text-slate-600 leading-snug">{c.metin}</p>
        </div>
      ))}
      {cevaplar.length === 0 && yuklendi && (
        <p className="text-[11px] italic text-slate-300">{t('cevap.ilk')}</p>
      )}

      {kapiDurumu === 'dogrula' ? (
        <p className="text-[10px] italic text-slate-400">{t('kapi.dogrula')}</p>
      ) : (
        <div className="flex items-center gap-2 pt-1">
          <input
            value={metin}
            onChange={e => setMetin(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') gonder(); }}
            maxLength={600}
            placeholder={t('cevap.ph')}
            className="flex-1 h-10 bg-slate-50 border border-slate-100 rounded-xl px-3 text-[12px] outline-none focus:border-blue-600"
          />
          <button onClick={gonder} disabled={gonderiliyor || !metin.trim()}
            className="px-4 h-10 rounded-xl text-[10px] font-black italic uppercase bg-[#023E56] text-white disabled:bg-slate-200 disabled:text-slate-400">
            {t('cevap.gonder')}
          </button>
        </div>
      )}
    </div>
  );
}
