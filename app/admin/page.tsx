"use client";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { ref as storageRef, deleteObject, getStorage } from 'firebase/storage';
import { db } from '@/app/lib/firebase';
import { useAuth } from '@/app/contexts/AuthContext';
import { ADMIN_UID } from '@/app/lib/admin';

export default function AdminSayfasi() {
  const { user, loading } = useAuth() as any;
  const [bekleyenler, setBekleyenler] = useState<any[]>([]);
  const [yukleniyor, setYukleniyor] = useState(true);
  const [islenen, setIslenen] = useState<string | null>(null);

  const yetkili = user?.uid === ADMIN_UID;

  const getir = async () => {
    setYukleniyor(true);
    try {
      const snap = await getDocs(query(collection(db, 'yorumlar'), where('foto_onay', '==', 'bekliyor')));
      setBekleyenler(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) { console.error(e); }
    setYukleniyor(false);
  };

  useEffect(() => { if (yetkili) getir(); }, [yetkili]);

  const onayla = async (id: string) => {
    setIslenen(id);
    try {
      await updateDoc(doc(db, 'yorumlar', id), { foto_onay: 'onaylandi' });
      setBekleyenler(prev => prev.filter(y => y.id !== id));
    } catch (e) { alert('Hata: ' + (e as any).message); }
    setIslenen(null);
  };

  const reddet = async (y: any) => {
    if (!confirm('Bu fotoğrafı reddet ve sil?')) return;
    setIslenen(y.id);
    try {
      await updateDoc(doc(db, 'yorumlar', y.id), { foto_onay: 'red', foto_url: '' });
      // Dosyayı depodan da sil (yorumlar/{uid}/...)
      if (y.foto_url) {
        try {
          const url = new URL(y.foto_url);
          const yol = decodeURIComponent(url.pathname.split('/o/')[1] || '');
          if (yol) await deleteObject(storageRef(getStorage(), yol));
        } catch {}
      }
      setBekleyenler(prev => prev.filter(x => x.id !== y.id));
    } catch (e) { alert('Hata: ' + (e as any).message); }
    setIslenen(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center text-slate-300 font-black italic">Yükleniyor...</div>;
  if (!yetkili) return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 text-center p-6">
      <div className="text-[40px]">🔒</div>
      <p className="font-black italic uppercase text-slate-500">Bu sayfa yalnızca yöneticiye açıktır.</p>
      <Link href="/" className="text-[12px] font-black italic uppercase text-blue-600">Ana sayfaya dön →</Link>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-[#0f172a] font-sans">
      <header className="max-w-3xl mx-auto flex items-center justify-between px-6 py-7">
        <Link href="/"><img src="/logo.png" alt="Bulevini" className="h-11" /></Link>
        <span className="text-[11px] font-black italic uppercase text-slate-400">YÖNETİM · FOTOĞRAF ONAY</span>
      </header>
      <section className="max-w-3xl mx-auto px-6 pb-20">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-black italic uppercase tracking-tighter text-[26px]">Onay Bekleyen Fotoğraflar</h1>
          <button onClick={getir} className="text-[11px] font-black italic uppercase text-blue-600">↻ Yenile</button>
        </div>

        {yukleniyor ? <p className="text-slate-400 italic">Yükleniyor...</p>
          : bekleyenler.length === 0 ? (
            <div className="py-20 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
              <div className="text-[36px]">✓</div>
              <p className="font-black italic uppercase text-slate-400 mt-2">Bekleyen fotoğraf yok</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {bekleyenler.map(y => (
                <div key={y.id} className="border border-slate-200 rounded-[2rem] p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-[13px] font-black italic uppercase">{y.bina_adi || y.yeni_bina_adi}</div>
                      <div className="text-[10px] text-slate-400 font-semibold">{y.kullanici_adi || 'Anonim'} · {y.ilce || ''}</div>
                    </div>
                  </div>
                  <img src={y.foto_url} alt="Onay bekleyen" className="w-full max-h-80 object-contain rounded-2xl border border-slate-100 bg-slate-50" />
                  {y.yorum_metni && <p className="text-[12px] italic text-slate-500 mt-3">"{y.yorum_metni}"</p>}
                  <div className="flex gap-3 mt-4">
                    <button onClick={() => onayla(y.id)} disabled={islenen === y.id}
                      className="flex-1 py-3 rounded-2xl bg-green-600 text-white font-black italic uppercase text-[12px] disabled:opacity-50">✓ Onayla</button>
                    <button onClick={() => reddet(y)} disabled={islenen === y.id}
                      className="flex-1 py-3 rounded-2xl bg-red-50 text-red-600 border border-red-200 font-black italic uppercase text-[12px] disabled:opacity-50">✕ Reddet ve Sil</button>
                  </div>
                </div>
              ))}
            </div>
          )}
      </section>
    </div>
  );
}
