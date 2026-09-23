"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useLang } from './i18n';
import { SEHIRLER, SEHIR_LISTESI, VARSAYILAN_SEHIR, gecerliSehirKodu, sehirlerMetni, type Sehir, type SehirKodu } from './sehirler';

const ANAHTAR = 'bulevini_sehir';

type SehirDegeri = {
  sehirKod: SehirKodu;
  sehir: Sehir;
  setSehir: (k: SehirKodu) => void;
  secildi: boolean; // kullanıcı bir kez seçti mi
  hazir: boolean;   // tarayıcı hafızası okundu mu (okunmadan pencere gösterilmesin)
};

const SehirContext = createContext<SehirDegeri>({
  sehirKod: VARSAYILAN_SEHIR, sehir: SEHIRLER[VARSAYILAN_SEHIR],
  setSehir: () => {}, secildi: false, hazir: false,
});

// Dil seçicinin (LangProvider) birebir kalıbı: seçim tarayıcıda saklanır, tüm sayfalar buradan okur.
export function SehirProvider({ children }: { children: ReactNode }) {
  const [sehirKod, setKod] = useState<SehirKodu>(VARSAYILAN_SEHIR);
  const [secildi, setSecildi] = useState(false);
  const [hazir, setHazir] = useState(false);

  useEffect(() => {
    try {
      const k = gecerliSehirKodu(localStorage.getItem(ANAHTAR));
      if (k) { setKod(k); setSecildi(true); }
    } catch { /* gizli sekme vb. — varsayılanla devam */ }
    setHazir(true);
  }, []);

  const setSehir = (k: SehirKodu) => {
    setKod(k); setSecildi(true);
    try { localStorage.setItem(ANAHTAR, k); } catch {}
  };

  return (
    <SehirContext.Provider value={{ sehirKod, sehir: SEHIRLER[sehirKod], setSehir, secildi, hazir }}>
      {children}
    </SehirContext.Provider>
  );
}

export const useSehir = () => useContext(SehirContext);

// Şehre göre değişen yazılar. Sözlükte "anahtar@sehirKodu" varsa o şehrin yazısı, yoksa normal yazı gelir.
// Örn. 'ilc.h1a@kahramanmaras' → "Kahramanmaraş'ı"; İstanbul ek anahtar istemez.
// (Sadece adı değiştirmek yetmiyor: "İstanbul'u" / "Kahramanmaraş'ı" ekleri farklı.)
export function useSehirMetni() {
  const { t } = useLang();
  const { sehirKod } = useSehir();
  return (k: string) => {
    const ozel = `${k}@${sehirKod}`;
    const v = t(ozel);
    // {sehirler} → açık olduğumuz şehirlerin listesi ("İstanbul ve Kahramanmaraş")
    return (v === ozel ? t(k) : v).split('{sehirler}').join(sehirlerMetni());
  };
}

// Açılır şehir menüsü — dil seçiciyle aynı görünüm; dar ekranda kısa ad
export function SehirSecici() {
  const { sehir, sehirKod, setSehir } = useSehir();
  const [acik, setAcik] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setAcik(v => !v)} aria-haspopup="listbox" aria-expanded={acik}
        className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-black uppercase text-slate-600 hover:border-blue-600">
        📍 <span className="sm:hidden">{sehir.kisaAd}</span><span className="hidden sm:inline">{sehir.ad}</span> <span className="text-[8px]">▼</span>
      </button>
      {acik && (
        <div role="listbox" className="absolute right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden z-[700] min-w-[170px]">
          {SEHIR_LISTESI.map(s => (
            <button key={s.kod} role="option" aria-selected={sehirKod === s.kod}
              onClick={() => { setSehir(s.kod); setAcik(false); }}
              className={`w-full px-4 py-2.5 text-left text-[11px] font-black uppercase ${sehirKod === s.kod ? 'bg-[#e8f3fa] text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
              {s.ad}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Seçili şehrin adı (düz metin) — başlıklarda elle "İSTANBUL" yazan yerlerin yerine
export function SehirAdi() {
  const { sehir } = useSehir();
  return <>{sehir.ad}</>;
}

// Logonun yanında sabit duran il etiketi — logo neredeyse şehir de orada.
// Tıklanmaz; şehir menüden (dilin üstünden) değiştirilir. Hafıza okunana kadar görünmez (yanlış şehir yanıp sönmesin).
export function SehirEtiketi({ koyu = false, className = '' }: { koyu?: boolean; className?: string }) {
  const { sehir, hazir } = useSehir();
  return (
    <span
      aria-label={`Şehir: ${sehir.ad}`}
      style={{ visibility: hazir ? 'visible' : 'hidden' }}
      className={`inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] font-black italic uppercase tracking-wide whitespace-nowrap ${koyu ? 'bg-white/10 text-[#A1CDE9] border border-white/15' : 'bg-[#e8f3fa] text-blue-600 border border-[#A1CDE9]'} ${className}`}>
      📍 <span className="sm:hidden">{sehir.kisaAd}</span><span className="hidden sm:inline">{sehir.ad}</span>
    </span>
  );
}

// "Haritayı Aç" denince çıkan il penceresi — her seferinde sorar, seçili il işaretli gelir.
// Seçim tüm siteye uygulanır; seçince `sonra` çağrılır (ör. /harita'ya git).
export function HaritaSehirPenceresi({ acik, kapat, sonra }: { acik: boolean; kapat: () => void; sonra: () => void }) {
  const { sehirKod, setSehir } = useSehir();
  const { t } = useLang();
  useEffect(() => {
    if (!acik) return;
    const tus = (e: KeyboardEvent) => { if (e.key === 'Escape') kapat(); };
    window.addEventListener('keydown', tus);
    return () => window.removeEventListener('keydown', tus);
  }, [acik, kapat]);
  if (!acik) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="harita-sehir-baslik" onClick={kapat}
      className="fixed inset-0 z-[950] flex items-end sm:items-center justify-center bg-[#011A25]/80 backdrop-blur-sm p-4">
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md bg-white rounded-3xl p-7 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[11px] font-black italic uppercase tracking-[.2em] text-blue-600">{t('sehir.etiket')}</div>
            <h2 id="harita-sehir-baslik" className="mt-2 font-black italic uppercase tracking-tighter text-[26px] leading-tight text-[#011A25]">
              {t('sehir.haritaBaslik')}
            </h2>
          </div>
          <button onClick={kapat} aria-label={t('sehir.kapat')} className="p-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl text-slate-500 text-[14px] leading-none">✕</button>
        </div>
        <p className="mt-2 text-[14px] leading-relaxed text-slate-500">{t('sehir.haritaAlt')}</p>
        <div className="mt-6 grid gap-3">
          {SEHIR_LISTESI.map(s => {
            const secili = s.kod === sehirKod;
            return (
              <button key={s.kod} onClick={() => { setSehir(s.kod); sonra(); }} aria-pressed={secili}
                className={`flex items-center justify-between gap-3 w-full border-2 rounded-2xl px-5 py-4 text-left transition-colors ${secili ? 'border-blue-600 bg-[#e8f3fa]' : 'border-slate-200 hover:border-blue-600'}`}>
                <span className="font-black italic uppercase text-[18px] tracking-tight text-[#011A25]">📍 {s.ad}</span>
                <span className="flex items-center gap-2 shrink-0">
                  {s.yeni && <span className="bg-blue-600 text-white text-[9px] font-black tracking-widest px-2 py-1 rounded-lg">{t('sehir.yeni')}</span>}
                  {secili && <span className="text-[10px] font-black tracking-widest text-blue-600">{t('sehir.secili')}</span>}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// İlk girişte bir kez sorulan pencere — seçim yapılınca bir daha çıkmaz
export function SehirSecimPenceresi() {
  const { hazir, secildi, setSehir } = useSehir();
  const { t } = useLang();
  if (!hazir || secildi) return null;
  return (
    <div role="dialog" aria-modal="true" aria-labelledby="sehir-secim-baslik"
      className="fixed inset-0 z-[950] flex items-end sm:items-center justify-center bg-[#011A25]/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-7 shadow-2xl">
        <div className="text-[11px] font-black italic uppercase tracking-[.2em] text-blue-600">{t('sehir.etiket')}</div>
        <h2 id="sehir-secim-baslik" className="mt-2 font-black italic uppercase tracking-tighter text-[26px] leading-tight text-[#011A25]">
          {t('sehir.baslik')}
        </h2>
        <p className="mt-2 text-[14px] leading-relaxed text-slate-500">{t('sehir.alt')}</p>
        <div className="mt-6 grid gap-3">
          {SEHIR_LISTESI.map(s => (
            <button key={s.kod} onClick={() => setSehir(s.kod)}
              className="flex items-center justify-between gap-3 w-full border-2 border-slate-200 hover:border-blue-600 focus-visible:border-blue-600 rounded-2xl px-5 py-4 text-left transition-colors">
              <span className="font-black italic uppercase text-[18px] tracking-tight text-[#011A25]">📍 {s.ad}</span>
              {s.yeni && <span className="bg-blue-600 text-white text-[9px] font-black tracking-widest px-2 py-1 rounded-lg">{t('sehir.yeni')}</span>}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
