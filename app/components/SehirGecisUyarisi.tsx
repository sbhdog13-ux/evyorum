"use client";
import { useEffect, useRef, useState } from 'react';
import { useSehir } from '@/app/lib/sehir';
import { useLang } from '@/app/lib/i18n';
import { SEHIRLER, sehirKoduBul } from '@/app/lib/sehirler';

// Sayfadaki kaydın ili seçili ilden farklıysa: siteyi o ile geçirir ve kısa bir uyarı gösterir.
// Örn. Maraş seçiliyken İstanbul'daki bir binanın linkine gelinirse site İstanbul'a döner.
// Tanımadığımız bir il gelirse (ya da il yoksa) hiçbir şey yapmaz.
export default function SehirGecisUyarisi({ ilAdi }: { ilAdi: string | null | undefined }) {
  const { sehirKod, setSehir, hazir } = useSehir();
  const { t } = useLang();
  const [gosterilenIl, setGosterilenIl] = useState<string | null>(null);
  const yapilanGecis = useRef<string | null>(null);

  useEffect(() => {
    if (!hazir || !ilAdi) return;
    const kod = sehirKoduBul(ilAdi);
    if (!kod || kod === sehirKod) return;
    // Aynı il için bir kez: kullanıcı sonra menüden geri değiştirirse zorla tekrar geçirilmez
    if (yapilanGecis.current === kod) return;
    yapilanGecis.current = kod;
    setSehir(kod);
    setGosterilenIl(SEHIRLER[kod].ad);
  }, [hazir, ilAdi, sehirKod, setSehir]);

  if (!gosterilenIl) return null;
  const metin = (anahtar: string) => t(anahtar).split('{sehir}').join(gosterilenIl);

  return (
    <div role="alertdialog" aria-modal="true" aria-labelledby="sehir-gecis-baslik" aria-describedby="sehir-gecis-alt"
      className="fixed inset-0 z-[960] flex items-end sm:items-center justify-center bg-[#011A25]/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-white rounded-3xl p-7 shadow-2xl">
        <div className="text-[11px] font-black italic uppercase tracking-[.2em] text-blue-600">📍 {t('sehir.etiket')}</div>
        <h2 id="sehir-gecis-baslik" className="mt-2 font-black italic uppercase tracking-tighter text-[22px] leading-tight text-[#011A25]">
          {metin('sehir.gecisBaslik')}
        </h2>
        <p id="sehir-gecis-alt" className="mt-2 text-[14px] leading-relaxed text-slate-500">{metin('sehir.gecisAlt')}</p>
        <button autoFocus onClick={() => setGosterilenIl(null)}
          className="mt-6 w-full bg-blue-600 hover:bg-[#023E56] text-white rounded-2xl py-4 font-black italic uppercase text-[13px] tracking-wide transition-colors">
          {t('sehir.tamam')}
        </button>
      </div>
    </div>
  );
}
