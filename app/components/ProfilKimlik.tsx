"use client";
import { useState, useEffect } from 'react';
import { updateProfile } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/app/lib/firebase';

// Mobildeki Avatar + isim düzenleme sisteminin web karşılığı
export type AvatarSecim = { tip: 'preset'; id: string } | { tip: 'ozel'; renk: string; desen: 'dolu' | 'cizgili' | 'noktali' };

const PRESETLER = [
  { id: 'mavi', bg: '#2563eb', sekil: 'kare', etiket: 'KLASİK' },
  { id: 'siyah', bg: '#000000', sekil: 'kare', etiket: 'GİZEMLİ' },
  { id: 'mor', bg: '#7c3aed', sekil: 'yuvarlak', etiket: 'NEON' },
  { id: 'yesil', bg: '#059669', sekil: 'kare', etiket: 'DOĞA' },
  { id: 'turuncu', bg: '#ea580c', sekil: 'yuvarlak', etiket: 'ENERJİK' },
];
const OZEL_RENKLER = ['#dc2626', '#ea580c', '#ca8a04', '#16a34a', '#0891b2', '#2563eb', '#7c3aed', '#db2777', '#374151', '#6b7280'];
const DESENLER: { id: 'dolu' | 'cizgili' | 'noktali'; etiket: string }[] = [
  { id: 'dolu', etiket: 'DÜZGÜN' }, { id: 'cizgili', etiket: 'ÇİZGİLİ' }, { id: 'noktali', etiket: 'NOKTALI' },
];

export function AvatarGoster({ secim, harf, size = 64 }: { secim: AvatarSecim; harf: string; size?: number }) {
  const bg = secim.tip === 'preset' ? (PRESETLER.find(p => p.id === secim.id)?.bg || '#2563eb') : secim.renk;
  const radius = secim.tip === 'preset' && PRESETLER.find(p => p.id === secim.id)?.sekil === 'yuvarlak' ? '50%' : '28%';
  return (
    <div style={{ width: size, height: size, background: bg, borderRadius: radius, position: 'relative', overflow: 'hidden' }} className="flex items-center justify-center shrink-0">
      {secim.tip === 'ozel' && secim.desen === 'cizgili' && [0, 1, 2].map(i => (
        <div key={i} style={{ position: 'absolute', top: (i * size) / 3, left: 0, right: 0, height: 2, background: 'rgba(255,255,255,0.2)' }} />
      ))}
      {secim.tip === 'ozel' && secim.desen === 'noktali' && [[0.25, 0.25], [0.25, 0.6], [0.6, 0.25], [0.6, 0.6]].map(([t, l], i) => (
        <div key={i} style={{ position: 'absolute', top: size * t, left: size * l, width: 5, height: 5, borderRadius: 3, background: 'rgba(255,255,255,0.35)' }} />
      ))}
      <span className="font-black italic text-white" style={{ fontSize: size * 0.4 }}>{harf}</span>
    </div>
  );
}

export default function ProfilKimlik({ displayName, onIsimGuncellendi }: { displayName: string; onIsimGuncellendi: (isim: string) => void }) {
  const user = auth.currentUser;
  const [secim, setSecim] = useState<AvatarSecim>({ tip: 'preset', id: 'mavi' });
  const [modal, setModal] = useState<'yok' | 'avatar' | 'isim'>('yok');
  const [tab, setTab] = useState<'preset' | 'ozel'>('preset');
  const [gecici, setGecici] = useState<AvatarSecim>({ tip: 'preset', id: 'mavi' });
  const [ozelRenk, setOzelRenk] = useState(OZEL_RENKLER[5]);
  const [ozelDesen, setOzelDesen] = useState<'dolu' | 'cizgili' | 'noktali'>('dolu');
  const [yeniIsim, setYeniIsim] = useState('');

  useEffect(() => {
    if (!user) return;
    getDoc(doc(db, 'kullanicilar', user.uid)).then(d => {
      if (d.exists() && d.data().avatar) setSecim(d.data().avatar as AvatarSecim);
    }).catch(() => {});
  }, [user]);

  const harf = (displayName?.[0] || 'U').toUpperCase();

  const avatarKaydet = async () => {
    if (!user) return;
    const yeni: AvatarSecim = tab === 'preset' ? gecici : { tip: 'ozel', renk: ozelRenk, desen: ozelDesen };
    await setDoc(doc(db, 'kullanicilar', user.uid), { avatar: yeni }, { merge: true });
    setSecim(yeni);
    setModal('yok');
  };

  const isimKaydet = async () => {
    if (!user || !yeniIsim.trim()) return;
    await updateProfile(user, { displayName: yeniIsim.trim() });
    onIsimGuncellendi(yeniIsim.trim());
    setModal('yok');
  };

  return (
    <>
      <div className="flex items-center gap-5">
        <button onClick={() => { setGecici(secim); setModal('avatar'); }} className="relative group" title="Avatarı değiştir">
          <AvatarGoster secim={secim} harf={harf} size={72} />
          <span className="absolute -bottom-1 -right-1 bg-blue-600 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center">✎</span>
        </button>
        <button onClick={() => { setYeniIsim(displayName); setModal('isim'); }} className="text-left" title="İsmi düzenle">
          <div className="text-[26px] font-black uppercase italic tracking-tighter leading-none">{displayName.toUpperCase()}</div>
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1.5">İSMİ DÜZENLEMEK İÇİN DOKUN</div>
        </button>
      </div>

      {modal !== 'yok' && (
        <div className="fixed inset-0 z-[600] bg-black/50 flex items-center justify-center p-6" onClick={() => setModal('yok')}>
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md" onClick={e => e.stopPropagation()}>
            {modal === 'isim' ? (
              <>
                <h3 className="font-black uppercase italic text-[16px] mb-5">İSMİNİ GÜNCELLE</h3>
                <input value={yeniIsim} onChange={e => setYeniIsim(e.target.value)} autoFocus
                  className="w-full h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 font-black italic uppercase text-[14px] outline-none focus:border-blue-600" />
                <div className="flex gap-3 mt-5">
                  <button onClick={() => setModal('yok')} className="flex-1 py-3.5 rounded-2xl bg-slate-100 font-black uppercase italic text-[12px] text-slate-500">İPTAL</button>
                  <button onClick={isimKaydet} className="flex-1 py-3.5 rounded-2xl bg-blue-600 text-white font-black uppercase italic text-[12px]">KAYDET</button>
                </div>
              </>
            ) : (
              <>
                <h3 className="font-black uppercase italic text-[16px] mb-5 text-center">AVATARINI SEÇ</h3>
                <div className="flex justify-center mb-5">
                  <AvatarGoster secim={tab === 'preset' ? gecici : { tip: 'ozel', renk: ozelRenk, desen: ozelDesen }} harf={harf} size={84} />
                </div>
                <div className="flex gap-2 mb-5">
                  <button onClick={() => setTab('preset')} className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase italic border-2 ${tab === 'preset' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-slate-100 text-slate-400'}`}>HAZIR</button>
                  <button onClick={() => setTab('ozel')} className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase italic border-2 ${tab === 'ozel' ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-slate-100 text-slate-400'}`}>KENDİN YARAT</button>
                </div>
                {tab === 'preset' ? (
                  <div className="grid grid-cols-5 gap-3">
                    {PRESETLER.map(p => (
                      <button key={p.id} onClick={() => setGecici({ tip: 'preset', id: p.id })}
                        className={`flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 ${gecici.tip === 'preset' && gecici.id === p.id ? 'border-blue-600' : 'border-transparent'}`}>
                        <AvatarGoster secim={{ tip: 'preset', id: p.id }} harf={harf} size={44} />
                        <span className="text-[8px] font-black text-slate-400 uppercase">{p.etiket}</span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">RENK SEÇ</div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {OZEL_RENKLER.map(r => (
                        <button key={r} onClick={() => setOzelRenk(r)} style={{ background: r }}
                          className={`w-9 h-9 rounded-full border-4 ${ozelRenk === r ? 'border-blue-200' : 'border-transparent'}`} />
                      ))}
                    </div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">DESEN SEÇ</div>
                    <div className="flex gap-2">
                      {DESENLER.map(d => (
                        <button key={d.id} onClick={() => setOzelDesen(d.id)}
                          className={`flex-1 py-2.5 rounded-xl text-[10px] font-black uppercase italic border-2 ${ozelDesen === d.id ? 'border-blue-600 text-blue-600 bg-blue-50' : 'border-slate-100 text-slate-400'}`}>{d.etiket}</button>
                      ))}
                    </div>
                  </>
                )}
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setModal('yok')} className="flex-1 py-3.5 rounded-2xl bg-slate-100 font-black uppercase italic text-[12px] text-slate-500">İPTAL</button>
                  <button onClick={avatarKaydet} className="flex-1 py-3.5 rounded-2xl bg-blue-600 text-white font-black uppercase italic text-[12px]">KAYDET</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
