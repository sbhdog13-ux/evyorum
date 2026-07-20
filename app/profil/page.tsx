"use client";

import { useState, useEffect, Suspense } from 'react';
import { 
  User, Trash2, Star, ArrowLeft, ChevronDown, CheckCircle, Trophy, Medal, MapPin, Lock, Activity, ShieldCheck, Zap, Radio, X, Map, Radar, Users, MessageSquare, ShieldCheck as ShieldIcon, LocateFixed, Award
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/app/lib/firebase';
import { collection, query, where, orderBy, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/app/contexts/AuthContext';
import Sidebar from '@/app/components/Sidebar';
import ProfilKimlik from '@/app/components/ProfilKimlik';
import { useLang } from '@/app/lib/i18n';
import { puanHesapla, rutbeBul, ROZETLER, RUTBELER } from '@/app/lib/seviye';

function ProfilIcerik() {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLang();
  const [canliDeneyimler, setCanliDeneyimler] = useState<any[]>([]);
  const [radarBinalar, setRadarBinalar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const [silModal, setSilModal] = useState(false);
  const [silOnayMetni, setSilOnayMetni] = useState('');
  const [silLoading, setSilLoading] = useState(false);

  // Y3 — Apple 5.1.1: uygulama içi hesap silme.
  // Sunucudaki hesabiSil robotu: mühürler 'Anonim Sakin' olur (içerik kalır),
  // profil + kullanıcı adı + radar + giriş hesabı SİLİNİR. Aynı e-posta ile yeniden kayıt serbest.
  const hesabiSil = async () => {
    if (silOnayMetni !== 'SİL' || silLoading) return;
    setSilLoading(true);
    try {
      const { getFunctions, httpsCallable } = await import('firebase/functions');
      const { app } = await import('@/app/lib/firebase-auth');
      const fn = httpsCallable(getFunctions(app, 'us-central1'), 'hesabiSil');
      await fn();
      const { signOut } = await import('firebase/auth');
      const { auth } = await import('@/app/lib/firebase-auth');
      await signOut(auth).catch(() => {}); // auth kaydı zaten silindi — oturum düşer
      alert('Hesabın silindi. Mühürlerin anonim olarak binaların hafızasında kalacak.');
      window.location.href = '/';
    } catch (e: any) {
      alert('Hesap silinemedi: ' + (e?.message || 'bilinmeyen hata') + '\nTekrar dener misin?');
      setSilLoading(false);
    }
  };

  useEffect(() => {
    if (!user) { router.push('/giris'); return; }
    const verileriGetir = async () => {
      try {
        const yorumQ = query(collection(db, 'yorumlar'), where('kullanici_id', '==', user.uid), orderBy('created_at', 'desc'));
        const yorumSnap = await getDocs(yorumQ);
        setCanliDeneyimler(yorumSnap.docs.map(d => ({ id: d.id, ...d.data() })));

        const radarQ = query(collection(db, 'takipler'), where('kullanici_id', '==', user.uid), orderBy('created_at', 'desc'));
        const radarSnap = await getDocs(radarQ);
        setRadarBinalar(radarSnap.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) { console.error("Hata:", err); } 
      finally {
        setLoading(false);
        // Bölümler veriyle birlikte geç çizildiği için hash kaydırmasını elle yap
        setTimeout(() => {
          const hedef = window.location.hash?.slice(1);
          if (hedef) document.getElementById(hedef)?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    };
    verileriGetir();
  }, [user]);

  const radarSil = async (id: string) => {
    await deleteDoc(doc(db, 'takipler', id));
    setRadarBinalar(radarBinalar.filter(b => b.id !== id));
  };

  const silYorum = async (id: string) => {
    if (!confirm("Bu deneyimi silmek istediğine emin misin?")) return;
    await deleteDoc(doc(db, 'yorumlar', id));
    setCanliDeneyimler(canliDeneyimler.filter(d => d.id !== id));
  };

  const muhurSayisi = canliDeneyimler.length;
  const { toplam: puan, dokum } = puanHesapla(canliDeneyimler, radarBinalar.length);
  const { rutbe, indeks: rutbeIndeks, sonraki, ilerleme } = rutbeBul(puan);
  const rozetVeri = {
    muhur: muhurSayisi,
    kanitli: canliDeneyimler.filter(y => y.foto_url).length,
    detayli: canliDeneyimler.filter(y => (y.yorum_metni || '').length >= 200).length,
    radar: radarBinalar.length,
    gpsli: canliDeneyimler.filter(y => y.gps_onay).length,
    faydali: canliDeneyimler.reduce((a, y) => a + (y.faydali_sayisi || 0), 0),
    faturaOnayli: false,
  };
  const gosterilecekDeneyimler = showAll ? canliDeneyimler : canliDeneyimler.slice(0, 3);
  const [adSoyad, setAdSoyad] = useState('');
  const displayName = adSoyad || user?.displayName || user?.email?.split('@')[0] || 'Kullanıcı';
  const initials = displayName[0]?.toUpperCase() || 'U';


  if (loading) return <div className="min-h-screen flex items-center justify-center font-black italic uppercase text-slate-200">Yükleniyor...</div>;

  return (
    <div className="flex min-h-screen bg-white relative overflow-hidden">
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100 rounded-full blur-[120px] opacity-40 z-0"></div>
      <div className="fixed bottom-[-10%] right-[10%] w-[30%] h-[30%] bg-[#e8f3fa] rounded-full blur-[100px] opacity-50 z-0"></div>

      <Sidebar />

      <main className="flex-1 lg:ml-80 relative bg-white/30 backdrop-blur-sm pb-20 z-10">
        <header className="py-5 px-4 md:py-8 md:px-10 border-b border-black/5 sticky top-0 bg-white/40 backdrop-blur-2xl z-50 flex justify-between items-center text-black font-black uppercase italic">
          <div className="flex items-center gap-6">
            <Link href="/" className="p-3 bg-white/60 rounded-2xl shadow-sm border border-white hover:bg-blue-600 hover:text-white transition-all backdrop-blur-md text-black">
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-[16px] md:text-[24px] tracking-tighter border-l-[6px] md:border-l-[10px] border-blue-600 pl-5 text-black">{t('profil.panel')}</h1>
          </div>
          <div className="bg-white/50 px-5 py-2.5 rounded-2xl border border-white/50 backdrop-blur-md shadow-sm flex items-center gap-3">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] tracking-widest text-slate-600">{t(rutbe.ad)} {t('profil.aktif')}</span>
          </div>
        </header>

        <div className="max-w-6xl mx-auto px-4 md:px-10 pt-8 md:pt-12 pb-24 space-y-10">
          {/* ——— MAHALLE KARİYERİ: lacivert oyun kartı ——— */}
          <section className="bg-[#023E56] text-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-[-20%] right-[-5%] w-72 h-72 bg-amber-400/10 blur-[80px] rounded-full" />
            <div className="absolute bottom-[-30%] left-[10%] w-80 h-80 bg-blue-400/10 blur-[90px] rounded-full" />
            <div className="relative z-10">
              <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-10">
                <div className="[&_.text-slate-400]:text-[#A1CDE9] [&_h4]:text-white [&_div]:text-white">
                  <ProfilKimlik displayName={displayName} onIsimGuncellendi={setAdSoyad} />
                </div>
                <div className="flex-1" />
                <div className="text-right">
                  <div className="text-[10px] font-black italic uppercase tracking-widest text-amber-400 flex items-center gap-2 justify-end"><Trophy size={16} /> {t('profil.puan')}</div>
                  <div className="text-[46px] font-black italic tracking-tighter leading-none">{puan.toLocaleString('tr-TR')}</div>
                </div>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                {RUTBELER.map((r, i) => (
                  <div key={r.ad} className={`px-4 py-2 rounded-xl text-[10px] font-black italic uppercase tracking-wide border ${i === rutbeIndeks ? 'bg-amber-400 text-[#023E56] border-amber-400 scale-110 shadow-lg' : i < rutbeIndeks ? 'bg-white/15 text-white border-white/20' : 'bg-white/5 text-white/35 border-white/10'}`}>
                    {t(r.ad)}
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-amber-400 to-amber-300 rounded-full transition-all duration-700" style={{ width: `${ilerleme}%` }} />
                </div>
                <div className="mt-2 flex justify-between text-[10px] font-black italic uppercase tracking-widest">
                  <span className="text-[#A1CDE9]">{sonraki ? `${t('seviye.sonrakiRutbe')}: ${t(sonraki.ad)} — ${(sonraki.esik - puan).toLocaleString('tr-TR')} ${t('seviye.puanKaldi')}` : t('seviye.zirve')}</span>
                  <span className="text-white/60">{ilerleme}%</span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-3 gap-3">
                <div className="bg-white/10 rounded-2xl p-4 text-center">
                  <div className="text-[26px] font-black italic leading-none">{muhurSayisi}</div>
                  <div className="text-[9px] font-black uppercase italic text-[#A1CDE9] mt-1.5 tracking-widest">{t('profil.toplamMuhur')}</div>
                </div>
                <button onClick={() => document.getElementById('radar-detay-bolumu')?.scrollIntoView({ behavior: 'smooth' })} className="bg-white/10 rounded-2xl p-4 text-center hover:bg-white/20 transition-all">
                  <div className="text-[26px] font-black italic leading-none">{radarBinalar.length}<span className="text-[13px] text-[#A1CDE9]"> / {rutbe.radarHakki === -1 ? '∞' : rutbe.radarHakki}</span></div>
                  <div className="text-[9px] font-black uppercase italic text-[#A1CDE9] mt-1.5 tracking-widest">{t('seviye.radarHakki')}</div>
                </button>
                <div className="bg-white/10 rounded-2xl p-4 text-center">
                  <div className="text-[26px] font-black italic leading-none">{rozetVeri.faydali}</div>
                  <div className="text-[9px] font-black uppercase italic text-[#A1CDE9] mt-1.5 tracking-widest">{t('seviye.d.faydali')}</div>
                </div>
              </div>

              <details className="mt-6 group">
                <summary className="cursor-pointer list-none text-[10px] font-black italic uppercase tracking-widest text-[#A1CDE9] flex items-center gap-2">
                  {t('seviye.puanDokumu')} <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                </summary>
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-2">
                  {Object.entries(dokum).filter(([, v]) => v > 0).map(([k, v]) => (
                    <div key={k} className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-[#A1CDE9] uppercase">{t(`seviye.d.${k}`)}</span>
                      <span className="text-[13px] font-black italic text-amber-300">+{v.toLocaleString('tr-TR')}</span>
                    </div>
                  ))}
                </div>
              </details>
            </div>
          </section>

          {/* ——— ROZETLER: gerçek şartlara bağlı ——— */}
          <section className="bg-[#e8f3fa] p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] border border-[#A1CDE9]/40 text-black">
            <h3 className="text-[14px] font-black italic uppercase tracking-widest mb-10 border-l-4 border-[#023E56] pl-5 text-[#023E56]">{t('profil.rozetler')}</h3>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-8 gap-4 md:gap-6">
              {ROZETLER.map((rozet) => {
                const aktif = !rozet.yakinda && rozet.kosul(rozetVeri);
                return (
                  <div key={rozet.id} className={`flex flex-col items-center gap-3 transition-all ${aktif ? '' : 'opacity-35'}`}>
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-[1.6rem] flex items-center justify-center border-[3px] ${aktif ? 'bg-white border-[#023E56] text-[#023E56] shadow-lg' : 'bg-white/50 border-slate-200 text-slate-300'}`}>
                      {aktif ? <Award size={26} /> : <Lock size={22} />}
                    </div>
                    <div className="text-center">
                      <span className="text-[10px] font-black italic uppercase tracking-tighter block leading-tight">{t(rozet.ad)}</span>
                      <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{rozet.yakinda ? t('seviye.yakinda') : `${t('seviye.kademe')} ${rozet.kademe}`}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <section id="radar-detay-bolumu" className="scroll-mt-32 space-y-10">
            <h3 className="text-[16px] font-black italic uppercase tracking-widest text-slate-400 flex items-center gap-4 px-4">
              <Radar size={22} className="text-blue-600" /> {t('profil.radarBinalar')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {radarBinalar.length > 0 ? radarBinalar.map((bina) => (
                <div key={bina.id} className="bg-white/60 backdrop-blur-2xl p-6 md:p-8 rounded-[2rem] md:rounded-[3.5rem] border border-white shadow-xl group hover:border-blue-600 text-black transition-all">
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-[#dcecf7]/50 rounded-2xl flex items-center justify-center text-blue-600"><MapPin size={22} /></div>
                    <button onClick={() => radarSil(bina.id)} className="p-3 bg-[#023E56]/5 text-slate-300 rounded-xl hover:text-red-500 hover:bg-red-50 transition-all"><X size={18} /></button>
                  </div>
                  <h4 className="text-[18px] font-black uppercase italic tracking-tighter mb-2 group-hover:text-blue-600 line-clamp-1">{bina.bina_adi}</h4>
                  <Link href={`/arama?query=${encodeURIComponent(bina.bina_adi)}`} className="mt-8 w-full py-4 bg-white/40 border border-white rounded-2xl flex items-center justify-center gap-2 text-[11px] font-black uppercase italic text-slate-500 hover:bg-blue-600 hover:text-white transition-all shadow-sm">
                    {t('profil.binayaGit')}
                  </Link>
                </div>
              )) : (
                <div className="col-span-full py-20 bg-[#023E56]/5 border-2 border-dashed border-black/10 rounded-[4rem] text-center opacity-30">
                  <p className="text-black font-black italic uppercase text-[12px] tracking-widest">{t('profil.takipYok')}</p>
                </div>
              )}
            </div>
          </section>

          <section id="arsiv-bolumu" className="scroll-mt-32 space-y-10 pb-20 text-black font-black italic uppercase">
            <h3 className="text-[16px] tracking-widest text-slate-400 flex items-center gap-4 px-4">
              <MessageSquare size={20} className="text-blue-600" /> {t('profil.arsiv')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {gosterilecekDeneyimler.map((deneyim) => (
                <div key={deneyim.id} className="bg-white/60 backdrop-blur-2xl p-6 md:p-12 rounded-[2rem] md:rounded-[4rem] border border-white shadow-xl hover:border-blue-600 transition-all group relative">
                  <div className="flex justify-between items-start mb-8 text-black">
                    <div>
                      <h4 className="text-[24px] font-black uppercase italic tracking-tighter group-hover:text-blue-600 text-black">{deneyim.bina_adi}</h4>
                      <p className="text-[11px] font-bold text-slate-400 uppercase italic">{deneyim.created_at?.toDate?.()?.toLocaleDateString('tr-TR') || ''}</p>
                    </div>
                    <button onClick={() => silYorum(deneyim.id)} className="p-4 bg-[#023E56]/5 text-slate-300 rounded-2xl hover:text-red-500 transition-all"><Trash2 size={24} /></button>
                  </div>
                  <div className="bg-white/40 backdrop-blur-md p-6 md:p-8 rounded-[2rem] md:rounded-[3rem] border-l-[10px] border-blue-600 mb-8 shadow-sm">
                    <p className="text-[17px] font-medium text-slate-700 italic leading-relaxed">"{deneyim.yorum_metni}"</p>
                  </div>
                  <div className="flex items-center gap-3 text-[12px] font-black text-blue-600 bg-[#dcecf7]/50 px-6 py-3 rounded-2xl border border-[#A1CDE9] uppercase">
                    <Star size={16} fill="currentColor" /> {deneyim.puan}/5 {t('profil.puanBirim')}
                  </div>
                </div>
              ))}
            </div>
            {!showAll && canliDeneyimler.length > 3 && (
              <button onClick={() => setShowAll(true)} className="w-full py-12 bg-white/40 backdrop-blur-xl border-4 border-dashed border-slate-200 rounded-[4rem] text-slate-400 font-black italic uppercase text-[15px] tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all flex items-center justify-center gap-4 group">
                {t('profil.tumArsiv')} ({canliDeneyimler.length - 3})
                <ChevronDown size={24} className="group-hover:translate-y-2 transition-transform" />
              </button>
            )}
          </section>

          {/* TEHLİKELİ BÖLGE — Y3 hesap silme (Apple 5.1.1) */}
          <section className="mt-16 border-t border-slate-100 pt-10 text-left">
            <h3 className="text-[12px] font-black italic uppercase tracking-widest text-slate-300 mb-4">HESAP</h3>
            <button
              onClick={() => { setSilOnayMetni(''); setSilModal(true); }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-red-200 text-red-500 text-[12px] font-black italic uppercase tracking-tight hover:bg-red-50 transition-all"
            >
              <Trash2 size={15} /> HESABIMI SİL
            </button>
            <p className="text-[11px] text-slate-400 mt-3 max-w-md leading-relaxed">
              Hesabın, profilin, kullanıcı adın ve radarın kalıcı olarak silinir. Mühürlerin
              "Anonim Sakin" olarak binaların ortak hafızasında kalır.
            </p>
          </section>

          {silModal && (
            <div className="fixed inset-0 z-[300] bg-black/60 flex items-center justify-center p-6">
              <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl text-left">
                <h3 className="text-[17px] font-black italic uppercase tracking-tighter text-red-600 mb-3">HESABINI SİLMEK ÜZERESİN</h3>
                <ul className="text-[12.5px] text-slate-500 space-y-1.5 mb-4 leading-relaxed list-disc pl-4">
                  <li><b>Silinir:</b> hesabın, profilin, kullanıcı adın (@), radarın</li>
                  <li><b>Kalır:</b> mühürlerin — "Anonim Sakin" olarak, sana bağlantısız</li>
                  <li>Bu işlem <b>geri alınamaz</b>. Aynı e-postayla sonra yeni hesap açabilirsin.</li>
                </ul>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Onay için "SİL" yaz</label>
                <input
                  value={silOnayMetni}
                  onChange={(e) => setSilOnayMetni(e.target.value.toLocaleUpperCase('tr-TR'))}
                  placeholder="SİL"
                  className="w-full mt-1 mb-5 border-2 border-slate-200 rounded-xl px-4 py-3 font-black uppercase tracking-widest outline-none focus:border-red-400"
                />
                <div className="flex gap-3">
                  <button onClick={() => setSilModal(false)} disabled={silLoading}
                    className="flex-1 py-3.5 rounded-2xl bg-slate-100 text-slate-500 text-[12px] font-black italic uppercase">Vazgeç</button>
                  <button onClick={hesabiSil} disabled={silOnayMetni !== 'SİL' || silLoading}
                    className="flex-1 py-3.5 rounded-2xl bg-red-600 text-white text-[12px] font-black italic uppercase disabled:opacity-40">
                    {silLoading ? 'SİLİNİYOR…' : 'KALICI OLARAK SİL'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ProfilSayfasi() {
  return <Suspense fallback={null}><ProfilIcerik /></Suspense>;
}