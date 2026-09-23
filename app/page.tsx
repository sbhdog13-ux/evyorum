"use client";
import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useLang, LangSwitcher } from '@/app/lib/i18n';
import { SehirSecici, useSehir, useSehirMetni } from '@/app/lib/sehir';
import { sehreAit } from '@/app/lib/sehirler';
import { db } from '@/app/lib/firebase';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { trUpper } from '@/app/lib/utils';
import { slugify } from '@/app/lib/slug';
import LeafletHarita from '@/app/components/LeafletHarita';
import { Search, MapPin } from 'lucide-react';

// Açılış sayfası = kullanıcının yolculuğu.
// Harita ile karşıla → tanıdık ilçeler → mühürleri oku → karneye yaklaş → kendi binanı ara → mühürle.
// SEO bölümleri (nedir / SSS / JSON-LD) yolculuğun altında korunuyor.
export default function AcilisSayfasi() {
  const { user, loading } = useAuth() as any;
  const router = useRouter();
  const { t } = useLang();
  const [muhtemelGirisli, setMuhtemelGirisli] = useState(false);
  const [aramaMetni, setAramaMetni] = useState('');
  const [tumFeed, setFeed] = useState<any[]>([]);
  const [ornekBina, setOrnekBina] = useState<any>(null);
  const [haritaGoster, setHaritaGoster] = useState(false);
  const [tumBinalar, setBinalar] = useState<any[]>([]);
  // Sayfadaki her şey seçili şehrin verisinden: harita, ilçe şeridi, mühürler, karne
  // (eski kayıtlarda il yok → İSTANBUL sayılır, bkz. sehirler.ts)
  const { sehirKod } = useSehir();
  const ts = useSehirMetni(); // şehre göre değişen yazılar
  const binalar = useMemo(() => tumBinalar.filter(b => sehreAit(b, sehirKod)), [tumBinalar, sehirKod]);
  const feed = useMemo(() => tumFeed.filter(y => sehreAit(y, sehirKod)).slice(0, 3), [tumFeed, sehirKod]);

  // Harita ağır — önce yazı çıksın, harita boşta yüklensin
  useEffect(() => {
    const yukle = () => setHaritaGoster(true);
    const ric = (window as any).requestIdleCallback;
    if (ric) { const id = ric(yukle, { timeout: 1500 }); return () => (window as any).cancelIdleCallback?.(id); }
    const z = setTimeout(yukle, 800); return () => clearTimeout(z);
  }, []);

  // Daha önce giriş yapmış tarayıcıda açılış flaşını atla
  useEffect(() => {
    try { if (localStorage.getItem('bulevini_girisli') === '1') { setMuhtemelGirisli(true); router.replace('/kesfet'); } } catch {}
  }, []);

  useEffect(() => { if (!loading && user) router.replace('/kesfet'); }, [user, loading]);

  // Bina özetleri — harita pinleri + ilçe boyaması + ilçe şeridi hepsi buradan
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(collection(db, 'binalar'));
        setBinalar(snap.docs.map(d => d.data() as any));
      } catch { /* sessiz */ }
    })();
  }, []);

  // Canlı akış + örnek bina karnesi
  useEffect(() => {
    (async () => {
      try {
        const snap = await getDocs(query(collection(db, 'yorumlar'), orderBy('created_at', 'desc'), limit(20)));
        const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as any))
          .filter(y => !(y.yorum_metni === 'BİNA MÜHÜRLENDİ.' && (!y.puanlar || Object.keys(y.puanlar).length === 0)));
        // 3'e kesme şehir süzgecinden SONRA yapılır (yukarıdaki feed hesabı) — yoksa başka şehrin mühürleri kaybolur
        setFeed(list.filter(y => y.yorum_metni && y.yorum_metni !== 'BİNA MÜHÜRLENDİ.'));
        const karneli = list.find(y => y.puanlar && Object.keys(y.puanlar).length >= 2);
        if (karneli) setOrnekBina(karneli);
      } catch { /* sessiz */ }
    })();
  }, []);

  // Haritaya verilecek pinler
  // LeafletHarita "lat, lng" metni bekliyor; özet kayıtta koordinat {lat,lng} nesnesi
  const haritaBinalari = useMemo(() =>
    binalar.filter(b => b.koordinat?.lat && b.finalPuan > 0)
      .map(b => ({ ad: b.ad, koordinat: `${b.koordinat.lat}, ${b.koordinat.lng}`, finalPuan: b.finalPuan, sayi: b.muhurSayisi || 0 })),
    [binalar]);

  // İlçe puanları (haritanın boyaması + 1. adımın şeridi)
  const ilcePuanlari = useMemo(() => {
    const h: { [ilce: string]: { toplam: number; sayi: number } } = {};
    binalar.forEach(b => {
      const il = b.ilce ? trUpper(b.ilce.toString()).trim() : '';
      if (!il || !(b.finalPuan > 0)) return;
      if (!h[il]) h[il] = { toplam: 0, sayi: 0 };
      h[il].toplam += b.finalPuan; h[il].sayi += 1;
    });
    return h;
  }, [binalar]);

  const ilceler = useMemo(() =>
    Object.entries(ilcePuanlari)
      .map(([ad, v]) => ({ ad, puan: v.toplam / v.sayi, sayi: v.sayi }))
      .sort((a, b) => b.sayi - a.sayi)
      .slice(0, 10),
    [ilcePuanlari]);

  // Karne örnekleri (özetten — mühür sayısına göre sıralı)
  const karneAdaylari = useMemo(() =>
    binalar.filter(b => b.kategoriOrt && Object.keys(b.kategoriOrt).length >= 2)
      .sort((a, b) => (b.muhurSayisi || 0) - (a.muhurSayisi || 0)),
    [binalar]);
  const karneBina = karneAdaylari[0] || null;
  // Hero'daki kart 3. adımdakiyle aynı olmasın diye ikinci binayı seçiyoruz
  const heroBina = karneAdaylari[1] || karneAdaylari[0] || null;

  // Kaydırdıkça beliren bölümler
  useEffect(() => {
    const hedefler = document.querySelectorAll('[data-belir]');
    if (!('IntersectionObserver' in window) || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      hedefler.forEach(e => e.classList.add('belirdi')); return;
    }
    const gozcu = new IntersectionObserver(girisler => {
      girisler.forEach(g => { if (g.isIntersecting) { g.target.classList.add('belirdi'); gozcu.unobserve(g.target); } });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
    hedefler.forEach(e => gozcu.observe(e));
    // Emniyet: gözcü bir sebeple ateşlemezse içerik gizli kalmasın
    const emniyet = setTimeout(() => hedefler.forEach(e => e.classList.add('belirdi')), 2500);
    return () => { gozcu.disconnect(); clearTimeout(emniyet); };
  }, [binalar.length, feed.length]);

  const ara = (e: React.FormEvent) => {
    e.preventDefault();
    if (aramaMetni.trim()) router.push(`/arama?query=${encodeURIComponent(aramaMetni.trim())}`);
  };

  if (muhtemelGirisli) return <div className="min-h-screen bg-white" />;

  const puanRengi = (p: number) => p >= 4 ? '#4ade80' : p >= 2.5 ? '#fbbf24' : '#f87171';

  // Adım başlığı (numaralı rozet + kullanıcının sesi)
  const Rozet = ({ n, yazi }: { n: number; yazi: string }) => (
    <div className="inline-flex items-center gap-3 bg-[#02202E] border border-[#A1CDE9]/30 rounded-full pl-2.5 pr-5 py-2 mb-6">
      <span className="w-6 h-6 rounded-full bg-blue-600 grid place-content-center text-[11px] font-black text-white tabular-nums">{n}</span>
      <span className="text-[11px] font-black italic uppercase tracking-[.14em] text-[#A1CDE9]">{yazi}</span>
    </div>
  );

  return (
    <div className="text-white bg-[linear-gradient(180deg,#02202E_0%,#023E56_18%,#02384E_36%,#012C3E_54%,#023E56_74%,#02202E_100%)]">
      <style>{`
        [data-belir]{opacity:0;transform:translateY(24px)}
        [data-belir].belirdi{opacity:1;transform:none;transition:opacity .7s ease,transform .7s cubic-bezier(.2,.7,.3,1)}
        @media(prefers-reduced-motion:reduce){[data-belir]{opacity:1;transform:none}}
        @keyframes bulevini-kay{to{transform:translateX(-50%)}}
        @keyframes bulevini-inis{0%,100%{transform:translate(-50%,0);opacity:1}55%{transform:translate(-50%,11px);opacity:.25}}
      `}</style>

      {/* ============ VARIŞ — HARİTA ============ */}
      <section className="relative min-h-[88vh] flex flex-col overflow-hidden">
        <div className="absolute inset-0 z-0 pointer-events-none">
          {haritaGoster && <LeafletHarita binalar={haritaBinalari} ilcePuanlari={ilcePuanlari} />}
        </div>
        {/* Perde: mobilde yazı haritanın üstünde okunsun diye kalın; masaüstünde sağa doğru açılıyor */}
        <div className="absolute inset-0 z-[5] pointer-events-none bg-[linear-gradient(to_bottom,rgba(2,32,46,.93)_0%,rgba(2,32,46,.86)_45%,rgba(2,32,46,.96)_100%)] md:bg-[linear-gradient(100deg,rgba(2,32,46,.97)_0%,rgba(2,32,46,.88)_34%,rgba(2,32,46,.3)_64%,rgba(2,32,46,.6)_100%),linear-gradient(to_bottom,rgba(2,32,46,.55),transparent_24%,rgba(2,32,46,.92)_94%)]" />

        {/* z: alttaki bölümlerle aynı katta olursa şehir/dil menüsü onların ARKASINDA kalır ve tıklanamaz */}
        <header className="relative z-[60] max-w-6xl w-full mx-auto flex items-center justify-between px-6 pt-6">
          {/* Logo + şehir bir bütün: logo koyu renkli, afişteki gibi beyaz kutuda; şehir hemen yanında sabit.
              Giriş yapmamış kişinin menüsü olmadığı için şehir burada seçilebilir. */}
          <div className="flex items-center gap-2">
            <span className="bg-white rounded-xl px-3 py-2 inline-flex items-center shadow-lg shadow-black/20">
              <img src="/logo.png" alt="Bulevini" className="h-8 w-auto" onError={(e: any) => { e.target.outerHTML = '<span class="text-lg font-black italic tracking-tighter uppercase text-[#011A25]">BULEVİNİ</span>'; }} />
            </span>
            <SehirSecici />
          </div>
          <div className="flex items-center gap-3">
            <LangSwitcher />
            <Link href="/gizlilik" className="hidden md:block text-[11px] font-black uppercase italic text-[#A1CDE9] hover:text-white tracking-wide">{t('acilis.gizlilik')}</Link>
            <Link href="/giris" className="bg-white text-[#011A25] px-5 py-3 rounded-sm text-[11px] font-black uppercase italic tracking-wide hover:bg-blue-600 hover:text-white transition-colors">{t('acilis.girisKayit')}</Link>
          </div>
        </header>

        <div className="relative z-[10] flex-1 flex items-center py-10 md:py-14">
          <div className="max-w-6xl w-full mx-auto px-6 lg:grid lg:grid-cols-[1.15fr_.85fr] lg:gap-12 lg:items-center">
            <div className="max-w-2xl">
              <div className="text-[11px] font-black italic uppercase tracking-[.22em] text-[#A1CDE9]">{t('y.eyebrow')}</div>
              <h1 className="mt-4 font-black italic uppercase tracking-tighter leading-[.92] text-[clamp(38px,6.4vw,80px)]">
                {t('y.h1a')}<br /><span className="text-[#4d86ff]">{t('y.h1b')}</span> {t('y.h1c')}
              </h1>
              <p className="mt-5 text-[17px] leading-relaxed text-[#A1CDE9] max-w-md">{t('y.alt')}</p>

              <div className="mt-8 max-w-lg">
                <div className="text-[10.5px] font-black italic uppercase tracking-[.2em] text-[#A1CDE9]/75 mb-3">{t('y.nelerBaslik')}</div>
                <div className="flex flex-wrap gap-2">
                  {[t('y.krit1'), t('y.krit2'), t('y.krit3'), t('y.krit4'), t('y.krit5'), t('y.krit6')].map(k => (
                    <span key={k} className="border border-[#A1CDE9]/30 rounded-full px-4 py-1.5 text-[13px] font-semibold bg-[#011A25]/35">{k}</span>
                  ))}
                  <span className="border border-dashed border-[#4d86ff]/65 text-[#cfe0ff] bg-blue-600/15 rounded-full px-4 py-1.5 text-[13px] font-semibold">{t('y.kritEkle')}</span>
                </div>

                <div className="mt-3.5 flex flex-wrap gap-2.5">
                  <span className="inline-flex items-center gap-2 bg-green-500/15 border border-green-500/40 rounded-full pl-3 pr-4 py-2">
                    <span className="text-[15px] leading-none">✅</span>
                    <span className="text-[12.5px] font-black italic uppercase tracking-[.1em] text-[#6ee7a0]">{t('y.arti')}</span>
                  </span>
                  <span className="inline-flex items-center gap-2 bg-red-400/13 border border-red-400/40 rounded-full pl-3 pr-4 py-2">
                    <span className="text-[15px] leading-none">🚩</span>
                    <span className="text-[12.5px] font-black italic uppercase tracking-[.1em] text-[#fca5a5]">{t('y.sorun')}</span>
                  </span>
                </div>

                <div className="mt-4 text-[13px] text-[#A1CDE9]/80 font-medium">{ts('y.nelerNot')}</div>
              </div>
            </div>

            {/* Sağ sütun — sadece geniş ekranda; haritadaki bir pinin karnesi açılmış gibi */}
            {heroBina && (
              <div className="hidden lg:block">
                <div className="relative bg-white text-[#011A25] rounded-2xl p-6 shadow-[0_40px_80px_-28px_rgba(0,0,0,.8)] max-w-[360px] ml-auto rotate-[-1.2deg]">
                  <div className="flex items-center gap-2 text-[9.5px] font-black uppercase tracking-[.18em] text-blue-600 mb-3">
                    <MapPin size={12} />{t('y.haritaKart')}
                  </div>
                  <div className="font-black italic uppercase text-[21px] tracking-tighter leading-none">{heroBina.ad}</div>
                  <div className="mt-2 text-[10px] font-black uppercase tracking-[.16em] text-[#4A6B7C]">
                    {heroBina.ilce}{heroBina.mahalle ? ` · ${heroBina.mahalle}` : ''}
                  </div>
                  <div className="flex items-end justify-between gap-3 mt-4 mb-3">
                    <span className="font-black italic text-[42px] leading-[.85] text-blue-600 tracking-tighter tabular-nums">
                      {Number(heroBina.finalPuan || 0).toFixed(1)}<span className="text-[17px] text-[#DCE9F1]">/5</span>
                    </span>
                    <span className="text-right">
                      <b className="block font-black italic text-[22px] leading-none tabular-nums">{heroBina.muhurSayisi || 0}</b>
                      <span className="text-[8.5px] font-black uppercase tracking-[.2em] text-[#4A6B7C]">{t('y.muhurler')}</span>
                    </span>
                  </div>
                  <hr className="border-0 border-t border-dashed border-[#DCE9F1] mb-2.5" />
                  {Object.entries(heroBina.kategoriOrt || {}).slice(0, 3).map(([k, v]: any) => (
                    <div key={k} className="flex items-center justify-between gap-3 py-1">
                      <span className="font-black uppercase text-[11px] tracking-wide truncate">{k}</span>
                      <span className="flex gap-1 shrink-0">
                        {[1, 2, 3, 4, 5].map(n => (
                          <i key={n} className={`w-2.5 h-2.5 rounded-full ${n <= Math.round(Number(v)) ? 'bg-blue-600' : 'bg-[#DCE9F1]'}`} />
                        ))}
                      </span>
                    </div>
                  ))}
                  <Link href={`/bina/${heroBina.slug || slugify(heroBina.ad || '')}`}
                    className="block mt-4 bg-[#023E56] text-white text-center py-2.5 rounded-lg text-[10.5px] font-black uppercase italic tracking-wide hover:bg-blue-600 transition-colors">
                    {t('acilis.muhurleBtn')}
                  </Link>
                  {/* haritaya bağlanan ipucu */}
                  <span aria-hidden className="absolute -bottom-2 left-10 w-4 h-4 bg-white rotate-45 rounded-sm" />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="relative z-[10] max-w-6xl w-full mx-auto px-6 pb-8 flex items-center gap-3 text-[11px] font-black italic uppercase tracking-[.18em] text-[#A1CDE9]">
          <span className="relative w-[22px] h-9 border-2 border-[#A1CDE9]/45 rounded-xl shrink-0">
            <span className="absolute left-1/2 top-[7px] w-[3px] h-[7px] rounded-sm bg-[#A1CDE9] -translate-x-1/2 motion-safe:[animation:bulevini-inis_1.7s_ease-in-out_infinite]" />
          </span>
          {t('y.kaydir')}
        </div>
      </section>

      {/* ============ 1 · TANIDIK GELDİ ============ */}
      {ilceler.length > 0 && (
        <section className="relative py-12 md:py-24">
          <div className="relative max-w-6xl mx-auto px-6" data-belir>
            <Rozet n={1} yazi={t('y.a1rozet')} />
            <h2 className="font-black italic uppercase tracking-tighter leading-[1.02] text-[clamp(26px,4vw,56px)]">
              {t('y.a1b1')} <span className="text-[#4d86ff]">{t('y.a1b2')}</span>
            </h2>
            <p className="mt-4 text-[16.5px] text-[#A1CDE9] max-w-2xl">{t('y.a1alt')}</p>

            {/* Solma maskesi sadece masaüstünde — mobilde kart metnini yiyordu */}
            <div className="mt-9 overflow-hidden md:[mask-image:linear-gradient(90deg,transparent,#000_4%,#000_96%,transparent)]">
              <div className="flex gap-3 w-max hover:[animation-play-state:paused] motion-safe:[animation:bulevini-kay_52s_linear_infinite]">
                {[...ilceler, ...ilceler].map((il, i) => (
                  <Link key={i} href={`/ilceler`} className="shrink-0 w-[194px] p-4 rounded-xl bg-white/[.055] border border-[#A1CDE9]/20 hover:border-blue-600 transition-colors">
                    <div className="font-black italic uppercase text-[16px] tracking-tight truncate">{il.ad}</div>
                    <div className="mt-3 h-1 rounded bg-[#A1CDE9]/20 overflow-hidden">
                      <span className="block h-full rounded" style={{ width: `${Math.min(100, (il.puan / 5) * 100)}%`, background: puanRengi(il.puan) }} />
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-2">
                      <span className="font-black italic text-[27px] leading-none tracking-tight tabular-nums" style={{ color: puanRengi(il.puan) }}>{il.puan.toFixed(1)}</span>
                      <span className="text-[9.5px] font-black uppercase tracking-[.14em] text-[#A1CDE9]/75 text-right leading-tight">{il.sayi}<br />{t('y.muhurler')}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ 2 · MÜHÜRLERİ OKU ============ */}
      {feed.length > 0 && (
        <section className="relative py-12 md:py-24">
          <div className="relative max-w-6xl mx-auto px-6" data-belir>
            <Rozet n={2} yazi={t('y.a2rozet')} />
            <h2 className="font-black italic uppercase tracking-tighter leading-[1.02] text-[clamp(26px,4vw,56px)]">
              {t('y.a2b1')} <span className="text-[#4d86ff]">{t('y.a2b2')}</span>
            </h2>
            <p className="mt-4 text-[16.5px] text-[#A1CDE9] max-w-2xl">{t('y.a2alt')}</p>

            <div className="mt-9 grid gap-3.5 md:grid-cols-3">
              {feed.map((y, i) => (
                <Link key={i} href={`/bina/${slugify(y.yeni_bina_adi || y.bina_adi || '')}`}
                  className="block rounded-lg bg-white/[.055] border border-[#A1CDE9]/20 border-l-[3px] border-l-blue-600 p-5 hover:bg-white/[.09] transition-colors">
                  <div className="flex justify-between items-baseline gap-3 mb-3">
                    <span className="font-black italic uppercase text-[14.5px] tracking-tight truncate">{y.yeni_bina_adi || y.bina_adi}</span>
                    <span className="font-black text-[14px] text-[#4d86ff] tabular-nums shrink-0">{y.puan ?? '—'}</span>
                  </div>
                  <p className="text-[14.5px] leading-relaxed text-[#A1CDE9] line-clamp-4">{y.yorum_metni}</p>
                  {y.ilce && (
                    <div className="mt-3.5 pt-3 border-t border-[#A1CDE9]/15 flex items-center gap-1.5 text-[9.5px] font-black uppercase tracking-[.14em] text-[#A1CDE9]/70">
                      <MapPin size={11} className="text-blue-500" />{y.ilce}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============ 3 · KARNEYE YAKLAŞ ============ */}
      <section className="relative py-12 md:py-24">
        <div className="relative max-w-6xl mx-auto px-6" data-belir>
          <Rozet n={3} yazi={t('y.a3rozet')} />
          <h2 className="font-black italic uppercase tracking-tighter leading-[1.02] text-[clamp(26px,4vw,56px)]">
            {t('y.a3b1')} <span className="text-[#4d86ff]">{t('y.a3b2')}</span>
          </h2>
          <p className="mt-4 text-[16.5px] text-[#A1CDE9] max-w-2xl">{t('y.a3alt')}</p>

          <div className="mt-10 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
            <div>
              <p className="text-[16px] leading-relaxed text-[#A1CDE9]">{t('y.agBaslik')}</p>
              <div className="mt-5 grid gap-2.5">
                {[['%100', t('y.agSakin')], ['%70', t('y.agEski')], ['%30', t('y.agZiyaret')]].map(([o, m]) => (
                  <div key={o} className="flex items-center gap-3 text-[13.5px] text-[#A1CDE9]">
                    <span className="shrink-0 min-w-[62px] text-center bg-blue-600/20 text-[#cfe0ff] border border-[#4d86ff]/40 rounded px-2.5 py-1 text-[10px] font-black uppercase tracking-wider">{o}</span>
                    <span>{m}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-[16px] leading-relaxed text-[#A1CDE9]">{t('y.agNot')}</p>
            </div>

            {karneBina && (
              <div className="relative bg-white text-[#011A25] rounded-2xl p-7 shadow-[0_40px_74px_-26px_rgba(0,0,0,.72)] max-w-md w-full mx-auto">
                <div className="absolute -left-1 md:-left-6 -bottom-5 md:-bottom-6 w-[70px] md:w-[76px] h-[70px] md:h-[76px] rounded-full bg-blue-600 text-white grid place-content-center text-center rotate-[-13deg] border-2 border-white/40 shadow-[0_16px_30px_-10px_rgba(37,99,235,.7)]">
                  <span className="text-[10px] font-black italic uppercase leading-tight">MÜHÜR<br />LENDİ</span>
                </div>
                <div className="font-black italic uppercase text-[24px] tracking-tighter leading-none">{karneBina.ad}</div>
                <div className="mt-2 text-[10px] font-black uppercase tracking-[.16em] text-[#4A6B7C]">
                  {karneBina.ilce}{karneBina.mahalle ? ` · ${karneBina.mahalle}` : ''}
                </div>
                <div className="flex items-end justify-between gap-3 mt-4 mb-4">
                  <span className="font-black italic text-[50px] leading-[.85] text-blue-600 tracking-tighter tabular-nums">
                    {Number(karneBina.finalPuan || 0).toFixed(1)}<span className="text-[20px] text-[#DCE9F1]">/5</span>
                  </span>
                  <span className="text-right">
                    <b className="block font-black italic text-[27px] leading-none tabular-nums">{karneBina.muhurSayisi || 0}</b>
                    <span className="text-[9px] font-black uppercase tracking-[.2em] text-[#4A6B7C]">{t('y.muhurler')}</span>
                  </span>
                </div>
                <hr className="border-0 border-t border-dashed border-[#DCE9F1] mb-3" />
                {Object.entries(karneBina.kategoriOrt || {}).slice(0, 4).map(([k, v]: any) => (
                  <div key={k} className="flex items-center justify-between gap-3 py-1.5">
                    <span className="font-black uppercase text-[12px] tracking-wide truncate">{k}</span>
                    <span className="flex gap-1.5 shrink-0">
                      {[1, 2, 3, 4, 5].map(n => (
                        <i key={n} className={`w-3 h-3 rounded-full ${n <= Math.round(Number(v)) ? 'bg-blue-600' : 'bg-[#DCE9F1]'}`} />
                      ))}
                    </span>
                  </div>
                ))}
                <Link href={`/bina/${karneBina.slug || slugify(karneBina.ad || '')}`}
                  className="block mt-5 bg-[#023E56] text-white text-center py-3 rounded-lg text-[11px] font-black uppercase italic tracking-wide hover:bg-blue-600 transition-colors">
                  {t('acilis.muhurleBtn')}
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============ 4 · KENDİ BİNAN ============ */}
      <section className="relative py-12 md:py-24">
        <div className="relative max-w-6xl mx-auto px-6" data-belir>
          <Rozet n={4} yazi={t('y.a4rozet')} />
          <h2 className="font-black italic uppercase tracking-tighter leading-[1.02] text-[clamp(26px,4vw,56px)]">
            {t('y.a4b1')} <span className="text-[#4d86ff]">{t('y.a4b2')}</span>
          </h2>
          <p className="mt-4 text-[16.5px] text-[#A1CDE9] max-w-2xl">{t('y.a4alt')}</p>

          {/* Tek sütun, tam genişlik: arama → ilçe kısayolları → bina ekle şeridi.
              Dağınık iki sütun yerine üst üste hizalı üç satır. */}
          <div className="mt-8 max-w-4xl">
            <form onSubmit={ara}>
              <div className="flex flex-col sm:flex-row border-2 border-[#A1CDE9]/45 bg-[#011A25]/70 rounded-lg overflow-hidden shadow-[0_28px_58px_-24px_rgba(0,0,0,.8)] focus-within:border-[#4d86ff] transition-colors">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <Search size={18} className="text-[#A1CDE9]/60 ml-5 shrink-0" />
                  <input value={aramaMetni} onChange={e => setAramaMetni(e.target.value)} placeholder={t('acilis.aramaPh')}
                    className="flex-1 min-w-0 bg-transparent py-5 text-[16.5px] font-semibold outline-none placeholder:text-[#A1CDE9]/55" />
                </div>
                <button type="submit" className="bg-blue-600 text-white px-9 py-4 text-[13.5px] font-black uppercase italic tracking-wide hover:bg-[#4d86ff] transition-colors">
                  {t('acilis.aramaBtn')}
                </button>
              </div>
            </form>

            {ilceler.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <span className="text-[10.5px] font-black italic uppercase tracking-[.18em] text-[#A1CDE9]/60 mr-1">{t('y.hizli')}</span>
                {ilceler.slice(0, 7).map(il => (
                  <Link key={il.ad} href={`/arama?query=${encodeURIComponent(il.ad)}`}
                    className="border border-[#A1CDE9]/28 rounded-full px-4 py-2 text-[12.5px] font-semibold text-[#A1CDE9] hover:bg-[#A1CDE9]/12 hover:text-white transition-colors">
                    {il.ad}
                  </Link>
                ))}
              </div>
            )}

            <div className="mt-8 border-t border-[#A1CDE9]/20 pt-6 flex items-center gap-6 flex-wrap justify-between">
              <p className="text-[14.5px] leading-relaxed text-[#A1CDE9] flex-1 min-w-[260px]">{t('y.yoksa')}</p>
              <Link href="/bina-olustur" className="shrink-0 border border-[#A1CDE9]/45 px-6 py-3.5 rounded-lg text-[12px] font-black italic uppercase tracking-wide hover:bg-[#A1CDE9]/12 transition-colors">
                {t('y.binaEkle')}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============ 5 · SEN DE MÜHÜRLE ============ */}
      <section className="relative py-12 md:py-24 text-center">
        <div className="relative max-w-6xl mx-auto px-6" data-belir>
          <Rozet n={5} yazi={t('y.a5rozet')} />
          <h2 className="font-black italic uppercase tracking-tighter leading-[1.02] text-[clamp(26px,4vw,56px)] max-w-[16ch] mx-auto">
            {t('y.a5b1')}<br /><span className="text-[#4d86ff]">{t('y.a5b2')}</span>
          </h2>
          <p className="mt-4 text-[16.5px] text-[#A1CDE9] max-w-xl mx-auto">{t('y.a5alt')}</p>
          <Link href="/giris" className="inline-block mt-8 bg-blue-600 text-white px-10 py-5 rounded-sm text-[15px] font-black uppercase italic tracking-wide hover:bg-[#4d86ff] transition-colors">
            {t('nedir.cta')}
          </Link>
          <div className="mt-4 text-[13px] text-[#A1CDE9]/75">{t('y.a5not')}</div>
        </div>
      </section>

      {/* ============ SEO — BULEVİNİ NEDİR ============ */}
      <section className="bg-[#EDF4F8] text-[#0f172a]">
        {/* Geçiş: koyu renk açık zeminin üstünde şeffaflaşıyor — ara ton/çamur oluşmuyor */}
        <div aria-hidden className="h-24 md:h-32 bg-[linear-gradient(180deg,#02202E_0%,rgba(2,32,46,.55)_45%,rgba(2,32,46,0)_100%)]" />
        <div className="max-w-6xl mx-auto px-6 pb-14 md:pb-20 pt-6 md:pt-8">
          {/* Geniş ekranda başlık solda sabit, metin sağda — sayfa dolu dursun */}
          <div className="lg:grid lg:grid-cols-[.85fr_1.15fr] lg:gap-14">
            <div className="lg:sticky lg:top-10 lg:self-start">
              <div className="text-[11px] font-black italic uppercase tracking-[2px] text-slate-400">{t('nedir.etiket')}</div>
              <h2 className="font-black italic uppercase tracking-tighter text-[clamp(28px,3.4vw,44px)] leading-[1.05] mt-2">
                {t('nedir.baslik1')}<br /><span className="text-[#023E56]">{t('nedir.baslik2')}</span>
              </h2>
            </div>

            <div className="mt-6 lg:mt-0">
              <p className="text-[15px] leading-relaxed text-slate-600">{t('nedir.p1')}</p>
              <p className="text-[15px] leading-relaxed text-slate-600 mt-3">{t('nedir.p2')}</p>
              <div className="bg-[#023E56] rounded-[1.75rem] p-7 mt-6">
                <p className="text-[14.5px] leading-relaxed text-[#e0f2fe]">{t('nedir.p3')}</p>
                <p className="text-[14.5px] leading-relaxed text-[#e0f2fe] mt-3">{t('nedir.p4a')}<b className="text-white">{t('nedir.p4b')}</b></p>
              </div>
            </div>
          </div>

          <h3 className="font-black italic uppercase tracking-tighter text-[20px] mt-14">{t('nedir.sorunBaslik')}</h3>
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4 mt-5">
            {[[t('nedir.s1b'), t('nedir.s1')], [t('nedir.s2b'), t('nedir.s2')], [t('nedir.s3b'), t('nedir.s3')], [t('nedir.s4b'), t('nedir.s4')]].map(([b, m]) => (
              <div key={b} className="bg-white border border-slate-200/70 rounded-2xl p-5">
                <div className="text-[12.5px] font-black italic text-[#023E56]">{b}</div>
                <p className="text-[12.5px] leading-relaxed text-slate-500 mt-2">{m}</p>
              </div>
            ))}
          </div>

          <h3 className="font-black italic uppercase tracking-tighter text-[20px] mt-14">{t('nedir.degilBaslik')}</h3>
          <div className="grid gap-3 md:grid-cols-3 mt-5">
            {[[t('nedir.d1b'), t('nedir.d1')], [t('nedir.d2b'), t('nedir.d2')], [t('nedir.d3b'), t('nedir.d3')]].map(([b, m]) => (
              <div key={b} className="flex gap-2.5 items-baseline text-[13.5px] leading-relaxed text-slate-600 bg-white border border-slate-200/70 rounded-2xl p-5">
                <span className="text-red-500 font-black shrink-0">✕</span>
                <span><b className="text-[#0f172a]">{b}</b> — {m}</span>
              </div>
            ))}
          </div>
        </div>

        {/* SSS */}
        <div className="max-w-4xl mx-auto px-6 pb-16 md:pb-24" id="sss">
          <h2 className="font-black italic uppercase tracking-tighter text-[26px] mb-6 border-l-4 border-blue-600 pl-4">{t('seo.sssBaslik')}</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {[1, 2, 3, 4, 5, 6].map(n => (
              <details key={n} className="bg-white border border-slate-200/70 rounded-2xl px-6 py-4 group h-fit">
                <summary className="font-black italic text-[15px] cursor-pointer list-none flex justify-between items-center gap-3">{t(`sss.s${n}`)}<span className="text-blue-600 group-open:rotate-45 transition-transform text-[18px] shrink-0">+</span></summary>
                <p className="mt-3 text-[14px] leading-relaxed text-slate-500">{t(`sss.c${n}`)}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Yapılandırılmış veri */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "Bulevini nedir?", "acceptedAnswer": {"@type": "Answer", "text": "Bulevini, binaların gerçek sakin deneyimlerinden oluşan ortak hafızasını tutan bağımsız bir platformdur. Bir binayla yolu kesişmiş herkes deneyimini mühürler; bu kayıtlar birikir ve binanın karnesine dönüşür. Evini tutmadan önce o karneye bakarsın. Şu an İstanbul ve Kahramanmaraş'ta hizmet veriyor."}}, {"@type": "Question", "name": "Bina yorumları güvenilir mi?", "acceptedAnswer": {"@type": "Answer", "text": "Yorumlar bağlantı tipine göre ağırlıklandırılır: mevcut sakinin puanı en yüksek etkiye sahiptir; eski sakin ve ziyaretçi yorumları daha düşük ağırlıkla hesaba katılır. Kanıt fotoğrafı da eklenebilir."}}, {"@type": "Question", "name": "Yorum yazmak için kimliğim görünür mü?", "acceptedAnswer": {"@type": "Answer", "text": "Hayır, istersen tamamen anonim paylaşabilirsin. Kimliğin hiçbir zaman ev sahibi veya üçüncü kişilerle paylaşılmaz."}}, {"@type": "Question", "name": "Mühür nedir?", "acceptedAnswer": {"@type": "Answer", "text": "Mühür, bir binada yaşamış birinin o bina hakkında bıraktığı puanlı deneyim kaydıdır: ısınma, deprem dayanıklılığı, komşuluk, yönetim gibi kategorilerde."}}, {"@type": "Question", "name": "Hangi şehirlerde çalışıyor?", "acceptedAnswer": {"@type": "Answer", "text": "Şu an İstanbul ve Kahramanmaraş'ın tüm ilçelerinde derinlemesine çalışıyoruz: her bina gerçek adres ve koordinatla haritada."}}, {"@type": "Question", "name": "Ücretli mi?", "acceptedAnswer": {"@type": "Answer", "text": "Hayır, Bulevini tamamen ücretsizdir."}}]}) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "WebSite", "name": "Bulevini", "url": "https://bulevini.com", "description": "İstanbul ve Kahramanmaraş bina ve mahalle yorumları — kiralamadan önce binanın karnesini gör."}) }} />
    </div>
  );
}
