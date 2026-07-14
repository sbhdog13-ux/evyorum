"use client";
import { trUpper } from '@/app/lib/utils';
import { useState, useEffect, useMemo, Suspense } from 'react';
import { ArrowLeft, MapPin, BarChart2, Trophy, Building2, ChevronRight } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/app/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { useLang } from '@/app/lib/i18n';
import Sidebar from '@/app/components/Sidebar';

function puanRenk(p: number) {
  if (p >= 4) return 'text-green-600';
  if (p >= 2.5) return 'text-orange-500';
  return 'text-red-600';
}

function siraRenk(i: number) {
  if (i === 0) return 'border-amber-400 text-amber-500';
  if (i === 1) return 'border-slate-400 text-slate-400';
  if (i === 2) return 'border-amber-700 text-amber-700';
  return 'border-slate-200 text-slate-300';
}

function SkorIcerik() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const seciliIlce = searchParams?.get('ilce') || undefined;
  const { t } = useLang();
  const puanEtiket = (p: number) => p >= 4 ? t('skor.iyi') : p >= 2.5 ? t('skor.orta') : t('skor.sorunlu');

  const [mod, setMod] = useState<'skorlar' | 'binalar'>('skorlar');
  const [loading, setLoading] = useState(true);
  const [allDocs, setAllDocs] = useState<any[]>([]);
  const [filtreler, setFiltreler] = useState<{ [k: string]: number }>({});
  const [filtreAcik, setFiltreAcik] = useState(false);

  useEffect(() => {
    getDocs(collection(db, 'yorumlar'))
      .then(snap => setAllDocs(snap.docs.map(d => ({ id: d.id, ...d.data() }))))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const ilceOku = (d: any): string => {
    if (d.ilce?.trim()) return trUpper(d.ilce).trim();
    if (d.acik_adres) {
      const ilk = (d.acik_adres.split('|')[0] || '').trim();
      const kisim = ilk.includes(' MAH. ') ? ilk.split(' MAH. ')[1] : ilk;
      const ilce = kisim.split('/')[0].replace('İSTANBUL', '').trim();
      if (ilce) return trUpper(ilce);
    }
    return '';
  };
  const mahalleOku = (d: any): string => {
    if (d.mahalle?.trim()) return trUpper(d.mahalle).trim();
    if (d.acik_adres) {
      const ilk = (d.acik_adres.split('|')[0] || '').trim();
      if (ilk.includes(' MAH. ')) return trUpper(ilk.split(' MAH. ')[0].trim());
    }
    return '';
  };

  const binaMap = useMemo(() => {
    const map: { [b: string]: { ilce: string; mahalle: string; puanlar: number[]; muhurSayisi: number; dogrulanmis: number; katToplam: { [k: string]: { t: number; s: number } } } } = {};
    allDocs.forEach((d: any) => {
      const bina = trUpper((d.yeni_bina_adi || d.bina_adi || '')).trim();
      if (!bina) return;
      if (!map[bina]) map[bina] = { ilce: '', mahalle: '', puanlar: [], muhurSayisi: 0, dogrulanmis: 0, katToplam: {} };
      if (!map[bina].ilce) { const i = ilceOku(d); if (i) map[bina].ilce = i; }
      if (!map[bina].mahalle) { const m = mahalleOku(d); if (m) map[bina].mahalle = m; }
      if (d.puanlar && Object.keys(d.puanlar).length > 0) {
        map[bina].muhurSayisi += 1;
        Object.entries(d.puanlar).forEach(([k, v]: any) => {
          if (!map[bina].katToplam[k]) map[bina].katToplam[k] = { t: 0, s: 0 };
          map[bina].katToplam[k].t += Number(v);
          map[bina].katToplam[k].s += 1;
        });
        const vals = Object.values(d.puanlar) as number[];
        map[bina].puanlar.push(vals.reduce((a, v) => a + Number(v), 0) / vals.length);
      }
      if (d.baglanti_tipi === 'sakin') map[bina].dogrulanmis += 1;
    });
    return map;
  }, [allDocs]);

  const binalar = useMemo(() => {
    return Object.entries(binaMap)
      .map(([ad, val]) => {
        const kategoriOrt: { [k: string]: number } = {};
        Object.entries(val.katToplam).forEach(([k, v]) => { kategoriOrt[trUpper(k)] = Number((v.t / v.s).toFixed(1)); });
        const katOrt = Object.values(kategoriOrt);
        const finalPuan = katOrt.length > 0 ? Number((katOrt.reduce((a, v) => a + v, 0) / katOrt.length).toFixed(1)) : 0;
        return { ad, finalPuan, muhurSayisi: val.muhurSayisi, dogrulanmis: val.dogrulanmis, kategoriOrt };
      })
      .filter(b => b.finalPuan > 0 && Object.entries(filtreler).every(([k, min]) => min === 0 || (b.kategoriOrt[k] !== undefined && b.kategoriOrt[k] >= min)))
      .sort((a, b) => b.finalPuan - a.finalPuan);
  }, [binaMap, filtreler]);

  const tumKategoriler = useMemo(() => Array.from(new Set(
    allDocs.flatMap((d: any) => d.puanlar ? Object.keys(d.puanlar).map(k => trUpper(k)) : [])
  )).sort(), [allDocs]);

  const { ilceler, mahalleler } = useMemo(() => {
    const ilceMap: { [k: string]: { puanlar: number[]; mahalleler: Set<string>; binalar: Set<string> } } = {};
    const mahalleMap: { [m: string]: { puanlar: number[]; binalar: string[] } } = {};
    Object.entries(binaMap).forEach(([bina, val]) => {
      if (!val.ilce || val.puanlar.length === 0) return;
      const avg = val.puanlar.reduce((a, b) => a + b, 0) / val.puanlar.length;
      if (!ilceMap[val.ilce]) ilceMap[val.ilce] = { puanlar: [], mahalleler: new Set(), binalar: new Set() };
      ilceMap[val.ilce].puanlar.push(avg);
      if (val.mahalle) ilceMap[val.ilce].mahalleler.add(val.mahalle);
      ilceMap[val.ilce].binalar.add(bina);
      if (seciliIlce && val.ilce === trUpper(seciliIlce)) {
        const m = val.mahalle || 'BELİRSİZ';
        if (!mahalleMap[m]) mahalleMap[m] = { puanlar: [], binalar: [] };
        mahalleMap[m].puanlar.push(avg);
        mahalleMap[m].binalar.push(bina);
      }
    });
    return {
      ilceler: Object.entries(ilceMap).map(([ilce, v]) => ({
        ilce, mahalleCount: v.mahalleler.size, binaCount: v.binalar.size, yorumCount: v.puanlar.length,
        ortalama: Number((v.puanlar.reduce((a, b) => a + b, 0) / v.puanlar.length).toFixed(1)),
      })).sort((a, b) => b.ortalama - a.ortalama),
      mahalleler: Object.entries(mahalleMap).map(([mahalle, v]) => ({
        mahalle, binaCount: v.binalar.length, yorumCount: v.puanlar.length,
        ortalama: Number((v.puanlar.reduce((a, b) => a + b, 0) / v.puanlar.length).toFixed(1)),
        binalar: v.binalar.slice(0, 3),
      })).sort((a, b) => b.ortalama - a.ortalama),
    };
  }, [binaMap, seciliIlce]);

  const Satir = ({ i, baslik, alt, puan, onClick, binaMini }: any) => (
    <button onClick={onClick} disabled={!onClick} className="w-full flex items-center gap-5 bg-slate-50 border border-slate-100 rounded-[2rem] p-5 text-left hover:border-blue-600 transition-all disabled:cursor-default">
      <div className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center font-black text-[15px] shrink-0 ${siraRenk(i)}`}>{i + 1}</div>
      <div className="flex-1 min-w-0">
        <div className="font-black uppercase italic text-[14px] text-black truncate">{baslik}</div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">{alt}</div>
        {binaMini && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {binaMini.map((b: string) => (
              <Link key={b} href={`/bina?isim=${encodeURIComponent(b)}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1 bg-white border border-slate-100 rounded-lg px-2 py-1 text-[9px] font-bold text-slate-600 hover:border-blue-600">
                <Building2 size={9} className="text-blue-600" /> {b}
              </Link>
            ))}
          </div>
        )}
      </div>
      <div className="text-right shrink-0">
        <div className={`font-black italic text-[22px] leading-none ${puanRenk(puan)}`}>{puan}</div>
        <div className={`text-[8px] font-black tracking-widest mt-1 ${puanRenk(puan)}`}>{puanEtiket(puan)}</div>
      </div>
      {onClick && <ChevronRight size={16} className="text-slate-200 shrink-0" />}
    </button>
  );

  return (
    <div className="lg:pl-80 min-h-screen bg-white text-black font-sans pb-24">
      <Sidebar />
      <header className="p-4 border-b border-slate-100 sticky top-0 bg-white/80 backdrop-blur-md z-50">
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          <button onClick={() => seciliIlce ? router.push('/skor') : router.push('/')} className="p-3 bg-slate-50 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"><ArrowLeft size={18} /></button>
          <div className="flex-1">
            <h1 className="font-black uppercase italic tracking-tighter text-[18px] leading-none">{seciliIlce || 'İSTANBUL'}</h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-1">{seciliIlce ? t('skor.mahalleAlt') : t('skor.altBaslik')}</p>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-[10px] font-black text-blue-600 uppercase"><MapPin size={11} /> İSTANBUL</div>
        </div>
      </header>

      {!seciliIlce && (
        <div className="max-w-3xl mx-auto px-4 pt-5 flex gap-2">
          <button onClick={() => setMod('skorlar')} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 text-[11px] font-black uppercase italic transition-all ${mod === 'skorlar' ? 'border-blue-600 bg-[#e8f3fa] text-blue-600' : 'border-slate-200 text-slate-400'}`}><BarChart2 size={14} /> {t('skor.skorlar')}</button>
          <button onClick={() => setMod('binalar')} className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl border-2 text-[11px] font-black uppercase italic transition-all ${mod === 'binalar' ? 'border-blue-600 bg-[#e8f3fa] text-blue-600' : 'border-slate-200 text-slate-400'}`}><Trophy size={14} /> {t('skor.binaSiralamasi')}</button>
        </div>
      )}

      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-3">
        {loading ? (
          <div className="py-24 text-center font-black italic uppercase text-slate-200">{t('skor.hesaplaniyor')}</div>
        ) : seciliIlce ? (
          mahalleler.length === 0 ? (
            <div className="py-24 text-center font-black italic uppercase text-slate-300 text-[13px]">{t('skor.ilcedeVeriYok')}</div>
          ) : mahalleler.map((m, i) => (
            <Satir key={m.mahalle} i={i} baslik={m.mahalle} alt={`${m.binaCount} ${t('skor.bina')} · ${m.yorumCount} ${t('skor.muhur')}`} puan={m.ortalama} binaMini={m.binalar} />
          ))
        ) : mod === 'skorlar' ? (
          ilceler.length === 0 ? (
            <div className="py-24 text-center font-black italic uppercase text-slate-300 text-[13px]">{t('skor.veriYok')}</div>
          ) : ilceler.map((item, i) => (
            <Satir key={item.ilce} i={i} baslik={item.ilce} alt={`${item.mahalleCount} ${t('skor.mahalle')} · ${item.binaCount} ${t('skor.bina')} · ${item.yorumCount} ${t('skor.muhur')}`} puan={item.ortalama} onClick={() => router.push(`/skor?ilce=${encodeURIComponent(item.ilce)}`)} />
          ))
        ) : (
          binalar.length === 0 ? (
            <div className="py-24 text-center font-black italic uppercase text-slate-300 text-[13px]">{t('skor.binaYok')}</div>
          ) : binalar.map((b, i) => (
            <Satir key={b.ad} i={i} baslik={b.ad} alt={`${b.muhurSayisi} ${t('skor.muhur')}${b.dogrulanmis > 0 ? ` · ${b.dogrulanmis} ${t('skor.sakin')}` : ''}`} puan={b.finalPuan} onClick={() => router.push(`/bina?isim=${encodeURIComponent(b.ad)}`)} />
          ))
        )}
      </main>
    </div>
  );
}

export default function SkorPage() {
  return <Suspense fallback={<div className="p-20 font-black italic uppercase text-center text-slate-200">SKORLAR HAZIRLANIYOR...</div>}><SkorIcerik /></Suspense>;
}
