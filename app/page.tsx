"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useLang, LangSwitcher } from '@/app/lib/i18n';
import { db } from '@/app/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import LeafletHarita from '@/app/components/LeafletHarita';
import { Search, Star, MapPin } from 'lucide-react';

export default function AcilisSayfasi() {
  const { user, loading } = useAuth() as any;
  const router = useRouter();
  const { t } = useLang();
  const [muhtemelGirisli, setMuhtemelGirisli] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');
  const [feed, setFeed] = useState<any[]>([]);
  const [ornekBina, setOrnekBina] = useState<any>(null);
  const [haritaGoster, setHaritaGoster] = useState(false);

  // Harita ağır — önce yazı+arama çıksın, harita boşta yüklensin (mobil hızı için)
  useEffect(() => {
    const yukle = () => setHaritaGoster(true);
    const ric = (window as any).requestIdleCallback;
    if (ric) { const id = ric(yukle, { timeout: 1500 }); return () => (window as any).cancelIdleCallback?.(id); }
    const t = setTimeout(yukle, 800); return () => clearTimeout(t);
  }, []);

  // Daha önce giriş yapmış tarayıcıda açılış flaşını atla
  useEffect(() => {
    try { if (localStorage.getItem('bulevini_girisli') === '1') { setMuhtemelGirisli(true); router.replace('/kesfet'); } } catch {}
  }, []);

  // Canlı akış + örnek bina karnesi (isim gösterilmez)
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'yorumlar'), orderBy('created_at', 'desc'), limit(15)));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as any))
          .filter(y => !(y.yorum_metni === 'BİNA MÜHÜRLENDİ.' && (!y.puanlar || Object.keys(y.puanlar).length === 0)));
        setFeed(list.slice(0, 6));
        const karneli = list.find(y => y.puanlar && Object.keys(y.puanlar).length >= 2);
        if (karneli) setOrnekBina(karneli);
      } catch { /* sessiz */ }
    })();
  }, []);

  const ara = (e: React.FormEvent) => {
    e.preventDefault();
    if (aramaMetni.trim()) router.push(`/arama?query=${encodeURIComponent(aramaMetni.trim())}`);
  };

  // Giriş yapmış kullanıcı doğrudan uygulamaya geçer
  useEffect(() => {
    if (!loading && user) router.replace('/kesfet');
  }, [user, loading]);

  if (muhtemelGirisli) return <div className="min-h-screen bg-white" />;

  return (
    <div className="min-h-screen bg-white text-[#0f172a] font-sans">
      <header className="max-w-5xl mx-auto flex items-center justify-between px-6 py-7">
        <img src="/logo.png" alt="Bulevini" className="h-11" onError={(e: any) => { e.target.outerHTML = '<span class="text-2xl font-black italic tracking-tighter uppercase">BULEVİNİ</span>'; }} />
        <div className="flex items-center gap-3">
          <LangSwitcher />
          <Link href="/gizlilik" className="hidden md:block text-[12px] font-black uppercase italic text-slate-400 hover:text-blue-600 tracking-wide">{t('acilis.gizlilik')}</Link>
          <Link href="/giris" className="bg-blue-600 text-white px-6 py-3 rounded-2xl text-[12px] font-black uppercase italic tracking-wide hover:bg-[#023E56] transition-all shadow-lg shadow-blue-200">{t('acilis.girisKayit')}</Link>
        </div>
      </header>

      {/* HERO — iki sütun: sol başlık+arama, sağ harita+örnek karne */}
      <section className="max-w-6xl mx-auto px-6 pt-8 md:pt-12 pb-14 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <div className="text-[11px] font-black italic uppercase tracking-[3px] text-blue-600 mb-4">{t('nedir.etiket')}</div>
          <h1 className="font-black italic uppercase tracking-tighter leading-[1.08] text-[clamp(30px,5.5vw,54px)]">
            {t('acilis.motto1')} <span className="text-blue-600 underline underline-offset-2">{t('acilis.motto2')}</span> {t('acilis.motto3')}
          </h1>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-slate-500 font-medium">{t('acilis.aciklama')}</p>

          <form onSubmit={ara} className="mt-8 max-w-lg">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 bg-white border-2 border-slate-100 rounded-2xl p-1.5 shadow-xl shadow-slate-100/70 focus-within:border-blue-600 transition-all">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Search size={18} className="text-slate-300 ml-3 shrink-0" />
                <input value={aramaMetni} onChange={(e) => setAramaMetni(e.target.value)} placeholder={t('acilis.aramaPh')} className="flex-1 py-3 bg-transparent text-[14px] font-bold outline-none placeholder:text-slate-300 min-w-0" />
              </div>
              <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl text-[12px] font-black uppercase italic tracking-wide hover:bg-[#023E56] transition-all shrink-0 w-full sm:w-auto">{t('acilis.aramaBtn')}</button>
            </div>
          </form>

          <Link href="/giris" className="inline-block mt-5 text-[12px] font-black uppercase italic tracking-widest text-[#023E56] hover:text-blue-600 transition-colors">{t('acilis.hemenBasla')}</Link>
        </div>

        <div className="relative">
          <div className="relative z-0 h-[340px] md:h-[420px] rounded-[2rem] overflow-hidden border border-slate-100 shadow-2xl bg-slate-100 pointer-events-none">
            {haritaGoster && <LeafletHarita binalar={[]} />}
          </div>
          {ornekBina && (
            <div className="absolute top-4 right-4 z-[20] w-[230px] bg-white rounded-2xl shadow-2xl border border-slate-100 p-4">
              <div className="font-black italic uppercase text-[13px] tracking-tighter leading-tight line-clamp-1">{ornekBina.yeni_bina_adi || ornekBina.bina_adi}</div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400 mt-0.5"><MapPin size={11} className="text-blue-600" />{ornekBina.ilce || 'İSTANBUL'}</div>
              <div className="mt-3 space-y-1.5">
                {Object.entries(ornekBina.puanlar).slice(0, 4).map(([k, v]: any) => (
                  <div key={k} className="flex items-center justify-between gap-2">
                    <span className="text-[9px] font-black uppercase text-slate-500 truncate">{String(k).split(' ')[0]}</span>
                    <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(s => (<Star key={s} size={9} fill={s <= Math.round(Number(v)) ? '#2563eb' : 'none'} className={s <= Math.round(Number(v)) ? 'text-blue-600' : 'text-slate-200'} />))}</div>
                  </div>
                ))}
              </div>
              <Link href="/giris" className="block mt-3 bg-[#023E56] text-white text-center py-2.5 rounded-xl text-[11px] font-black uppercase italic tracking-wide hover:bg-blue-600 transition-colors">{t('acilis.muhurleBtn')}</Link>
            </div>
          )}
        </div>
      </section>

      {/* CANLI AKIŞ — tek satır, sürekli dönen şerit; isim gösterilmez, kartlar giriş kapısına götürür */}
      {feed.length > 0 && (
        <section className="pb-16 overflow-hidden">
          <div className="max-w-6xl mx-auto px-6 flex items-center gap-3 mb-6">
            <span className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-ping" />
            <h2 className="font-black italic uppercase tracking-tighter text-[18px]">{t('acilis.sonMuhurler')}</h2>
            <span className="text-[10px] font-black uppercase italic text-slate-300 tracking-widest">{t('acilis.canli')}</span>
          </div>
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_5%,#000_95%,transparent)]">
            <div
              className="flex gap-4 w-max hover:[animation-play-state:paused]"
              style={{ animation: `bulevini-kay ${feed.length * 6}s linear infinite` }}
            >
              {[...feed, ...feed].map((y, i) => (
                <Link key={i} href="/giris" className="shrink-0 w-[300px] bg-slate-50 border border-slate-100 rounded-[1.6rem] p-5 hover:border-blue-600 transition-all">
                  <div className="flex justify-between items-start gap-2">
                    <div className="font-black italic uppercase text-[13px] tracking-tighter leading-tight line-clamp-1">{y.yeni_bina_adi || y.bina_adi}</div>
                    <div className="flex items-center gap-1 bg-white px-2 py-0.5 rounded-lg text-blue-600 font-black text-[11px] shrink-0"><Star size={11} fill="currentColor" />{y.puan || '—'}</div>
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-slate-500 italic line-clamp-3">&quot;{y.yorum_metni}&quot;</p>
                </Link>
              ))}
            </div>
          </div>
          <style>{`@keyframes bulevini-kay{to{transform:translateX(-50%)}}`}</style>
        </section>
      )}

      <section className="max-w-5xl mx-auto px-6 pb-20 grid gap-4 md:grid-cols-3">
        {[
          ['🔒', t('acilis.k1b'), t('acilis.k1')],
          ['🗺️', t('acilis.k2b'), t('acilis.k2')],
          ['📡', t('acilis.k3b'), t('acilis.k3')],
        ].map(([ikon, baslik, metin]) => (
          <div key={baslik} className="bg-slate-50 border border-slate-100 rounded-[2rem] p-7 text-left">
            <div className="text-[26px]">{ikon}</div>
            <h3 className="mt-3 mb-2 font-black italic text-[16px] tracking-tight">{baslik}</h3>
            <p className="text-[14px] leading-relaxed text-slate-400">{metin}</p>
          </div>
        ))}
      </section>


      {/* Nasıl çalışır — SEO içerik bölümü */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <h2 className="font-black italic uppercase tracking-tighter text-[26px] mb-6 border-l-4 border-blue-600 pl-4">{t('seo.nasilBaslik')}</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[[t('seo.adim1b'), t('seo.adim1')], [t('seo.adim2b'), t('seo.adim2')], [t('seo.adim3b'), t('seo.adim3')]].map(([b, m]) => (
            <div key={b} className="bg-[#e8f3fa] border border-[#A1CDE9] rounded-[2rem] p-7">
              <h3 className="font-black italic text-[17px] text-[#023E56] mb-2">{b}</h3>
              <p className="text-[14px] leading-relaxed text-slate-600">{m}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bulevini Nedir — kimlik bölümü */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <div className="text-[11px] font-black italic uppercase tracking-[2px] text-slate-400">{t('nedir.etiket')}</div>
        <h2 className="font-black italic uppercase tracking-tighter text-[30px] leading-[1.1] mt-2">
          {t('nedir.baslik1')}<br /><span className="text-[#023E56]">{t('nedir.baslik2')}</span>
        </h2>
        <p className="text-[14px] leading-relaxed text-slate-600 mt-5">{t('nedir.p1')}</p>
        <p className="text-[14px] leading-relaxed text-slate-600 mt-3">{t('nedir.p2')}</p>
        <div className="bg-[#023E56] rounded-[2rem] p-7 mt-5">
          <p className="text-[14px] leading-relaxed text-[#e0f2fe]">{t('nedir.p3')}</p>
          <p className="text-[14px] leading-relaxed text-[#e0f2fe] mt-3">{t('nedir.p4a')}<b className="text-white">{t('nedir.p4b')}</b></p>
        </div>

        <h3 className="font-black italic uppercase tracking-tighter text-[18px] mt-9">{t('nedir.sorunBaslik')}</h3>
        <div className="grid gap-3 md:grid-cols-2 mt-4">
          {[[t('nedir.s1b'), t('nedir.s1')], [t('nedir.s2b'), t('nedir.s2')], [t('nedir.s3b'), t('nedir.s3')], [t('nedir.s4b'), t('nedir.s4')]].map(([b, m]) => (
            <div key={b} className="border border-slate-200 rounded-2xl p-5">
              <div className="text-[12px] font-black italic text-[#023E56]">{b}</div>
              <p className="text-[12px] leading-relaxed text-slate-500 mt-2">{m}</p>
            </div>
          ))}
        </div>

        <h3 className="font-black italic uppercase tracking-tighter text-[18px] mt-9">{t('nedir.degilBaslik')}</h3>
        <div className="space-y-2.5 mt-3">
          {[[t('nedir.d1b'), t('nedir.d1')], [t('nedir.d2b'), t('nedir.d2')], [t('nedir.d3b'), t('nedir.d3')]].map(([b, m]) => (
            <div key={b} className="flex gap-2.5 items-baseline text-[13px] leading-relaxed text-slate-600">
              <span className="text-red-600 font-black">✕</span>
              <span><b className="text-black">{b}</b> — {m}</span>
            </div>
          ))}
        </div>

        <div className="text-center mt-10 pt-7 border-t border-slate-100">
          <div className="font-black italic uppercase tracking-tighter text-[20px]">{t('nedir.kapanis1')}</div>
          <div className="font-black italic uppercase tracking-tighter text-[20px] text-[#023E56]">{t('nedir.kapanis2')}</div>
          <Link href="/giris" className="inline-block bg-[#023E56] text-white text-[12px] font-black italic tracking-widest px-7 py-4 rounded-2xl mt-5">{t('nedir.cta')}</Link>
        </div>
      </section>

      {/* SSS */}
      <section className="max-w-3xl mx-auto px-6 pb-16">
        <h2 className="font-black italic uppercase tracking-tighter text-[26px] mb-6 border-l-4 border-blue-600 pl-4">{t('seo.sssBaslik')}</h2>
        <div className="space-y-3">
          {[1, 2, 3, 4, 5, 6].map(n => (
            <details key={n} className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 group">
              <summary className="font-black italic text-[15px] cursor-pointer list-none flex justify-between items-center">{t(`sss.s${n}`)}<span className="text-blue-600 group-open:rotate-45 transition-transform text-[18px]">+</span></summary>
              <p className="mt-3 text-[14px] leading-relaxed text-slate-500">{t(`sss.c${n}`)}</p>
            </details>
          ))}
        </div>
      </section>


      {/* Yapılandırılmış veri */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "Bulevini nedir?", "acceptedAnswer": {"@type": "Answer", "text": "Bulevini, binaların gerçek sakin deneyimlerinden oluşan ortak hafızasını tutan bağımsız bir platformdur. Bir binayla yolu kesişmiş herkes deneyimini mühürler; bu kayıtlar birikir ve binanın karnesine dönüşür. Evini tutmadan önce o karneye bakarsın. Şu an İstanbul'da hizmet veriyor."}}, {"@type": "Question", "name": "Bina yorumları güvenilir mi?", "acceptedAnswer": {"@type": "Answer", "text": "Yorumlar bağlantı tipine göre ağırlıklandırılır: mevcut sakinin puanı en yüksek etkiye sahiptir; eski sakin ve ziyaretçi yorumları daha düşük ağırlıkla hesaba katılır. Kanıt fotoğrafı da eklenebilir."}}, {"@type": "Question", "name": "Yorum yazmak için kimliğim görünür mü?", "acceptedAnswer": {"@type": "Answer", "text": "Hayır, istersen tamamen anonim paylaşabilirsin. Kimliğin hiçbir zaman ev sahibi veya üçüncü kişilerle paylaşılmaz."}}, {"@type": "Question", "name": "Mühür nedir?", "acceptedAnswer": {"@type": "Answer", "text": "Mühür, bir binada yaşamış birinin o bina hakkında bıraktığı puanlı deneyim kaydıdır: ısınma, deprem dayanıklılığı, komşuluk, yönetim gibi kategorilerde."}}, {"@type": "Question", "name": "Hangi şehirlerde çalışıyor?", "acceptedAnswer": {"@type": "Answer", "text": "Şu an İstanbul'un tüm ilçelerinde derinlemesine çalışıyoruz: her bina gerçek adres ve koordinatla haritada."}}, {"@type": "Question", "name": "Ücretli mi?", "acceptedAnswer": {"@type": "Answer", "text": "Hayır, Bulevini tamamen ücretsizdir."}}]}) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "WebSite", "name": "Bulevini", "url": "https://bulevini.com", "description": "İstanbul bina ve mahalle yorumları — kiralamadan önce binanın karnesini gör."}) }} />
    </div>
  );
}
