"use client";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import { useLang, LangSwitcher } from '@/app/lib/i18n';

export default function AcilisSayfasi() {
  const { user, loading } = useAuth() as any;
  const router = useRouter();
  const { t } = useLang();
  const [muhtemelGirisli, setMuhtemelGirisli] = useState(false);

  // Daha önce giriş yapmış tarayıcıda açılış flaşını atla
  useEffect(() => {
    try { if (localStorage.getItem('bulevini_girisli') === '1') { setMuhtemelGirisli(true); router.replace('/kesfet'); } } catch {}
  }, []);

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

      <section className="max-w-5xl mx-auto px-6 pt-16 pb-20 text-center">
        <h1 className="font-black italic uppercase tracking-tighter leading-[1.05] text-[clamp(32px,6vw,56px)]">
          {t('acilis.motto1')}<br /><span className="text-blue-600 underline">{t('acilis.motto2')}</span> {t('acilis.motto3')}
        </h1>
        <p className="mt-5 max-w-xl mx-auto text-[16px] leading-relaxed text-slate-400 font-medium">
          {t('acilis.aciklama')}
        </p>
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/giris" className="bg-blue-600 text-white px-9 py-4 rounded-2xl text-[13px] font-black uppercase italic tracking-wide hover:bg-[#023E56] transition-all shadow-xl shadow-blue-200">{t('acilis.hemenBasla')}</Link>
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4">
            <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
            <span className="text-[11px] font-black uppercase italic text-blue-600 tracking-widest">{t('acilis.yakinda')}</span>
          </div>
        </div>
      </section>

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
          <details className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 group">
            <summary className="font-black italic text-[15px] cursor-pointer list-none flex justify-between items-center">Bulevini nedir?<span className="text-blue-600 group-open:rotate-45 transition-transform text-[18px]">+</span></summary>
            <p className="mt-3 text-[14px] leading-relaxed text-slate-500">Bulevini, binaların gerçek sakin deneyimlerinden oluşan ortak hafızasını tutan bağımsız bir platformdur. Bir binayla yolu kesişmiş herkes deneyimini mühürler; bu kayıtlar birikir ve binanın karnesine dönüşür. Evini tutmadan önce o karneye bakarsın. Şu an İstanbul'da hizmet veriyor.</p>
          </details>
          <details className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 group">
            <summary className="font-black italic text-[15px] cursor-pointer list-none flex justify-between items-center">Bina yorumları güvenilir mi?<span className="text-blue-600 group-open:rotate-45 transition-transform text-[18px]">+</span></summary>
            <p className="mt-3 text-[14px] leading-relaxed text-slate-500">Yorumlar bağlantı tipine göre ağırlıklandırılır: mevcut sakinin puanı en yüksek etkiye sahiptir; eski sakin ve ziyaretçi yorumları daha düşük ağırlıkla hesaba katılır. Kanıt fotoğrafı da eklenebilir.</p>
          </details>
          <details className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 group">
            <summary className="font-black italic text-[15px] cursor-pointer list-none flex justify-between items-center">Yorum yazmak için kimliğim görünür mü?<span className="text-blue-600 group-open:rotate-45 transition-transform text-[18px]">+</span></summary>
            <p className="mt-3 text-[14px] leading-relaxed text-slate-500">Hayır, istersen tamamen anonim paylaşabilirsin. Kimliğin hiçbir zaman ev sahibi veya üçüncü kişilerle paylaşılmaz.</p>
          </details>
          <details className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 group">
            <summary className="font-black italic text-[15px] cursor-pointer list-none flex justify-between items-center">Mühür nedir?<span className="text-blue-600 group-open:rotate-45 transition-transform text-[18px]">+</span></summary>
            <p className="mt-3 text-[14px] leading-relaxed text-slate-500">Mühür, bir binada yaşamış birinin o bina hakkında bıraktığı puanlı deneyim kaydıdır: ısınma, deprem dayanıklılığı, komşuluk, yönetim gibi kategorilerde.</p>
          </details>
          <details className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 group">
            <summary className="font-black italic text-[15px] cursor-pointer list-none flex justify-between items-center">Hangi şehirlerde çalışıyor?<span className="text-blue-600 group-open:rotate-45 transition-transform text-[18px]">+</span></summary>
            <p className="mt-3 text-[14px] leading-relaxed text-slate-500">Şu an İstanbul'un tüm ilçelerinde derinlemesine çalışıyoruz: her bina gerçek adres ve koordinatla haritada.</p>
          </details>
          <details className="bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 group">
            <summary className="font-black italic text-[15px] cursor-pointer list-none flex justify-between items-center">Ücretli mi?<span className="text-blue-600 group-open:rotate-45 transition-transform text-[18px]">+</span></summary>
            <p className="mt-3 text-[14px] leading-relaxed text-slate-500">Hayır, Bulevini tamamen ücretsizdir.</p>
          </details>
        </div>
      </section>

      {/* İlçe linkleri — yerel SEO */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <h2 className="font-black italic uppercase tracking-tighter text-[20px] mb-5 border-l-4 border-blue-600 pl-4">{t('seo.ilceBaslik')}</h2>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/skor?ilce=KADIKÖY" className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-2.5 text-[12px] font-black uppercase italic text-slate-600 hover:border-blue-600 hover:text-blue-600 transition-all">KADIKÖY</Link>
          <Link href="/skor?ilce=BEŞİKTAŞ" className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-2.5 text-[12px] font-black uppercase italic text-slate-600 hover:border-blue-600 hover:text-blue-600 transition-all">BEŞİKTAŞ</Link>
          <Link href="/skor?ilce=ŞİŞLİ" className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-2.5 text-[12px] font-black uppercase italic text-slate-600 hover:border-blue-600 hover:text-blue-600 transition-all">ŞİŞLİ</Link>
          <Link href="/skor?ilce=ÜSKÜDAR" className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-2.5 text-[12px] font-black uppercase italic text-slate-600 hover:border-blue-600 hover:text-blue-600 transition-all">ÜSKÜDAR</Link>
          <Link href="/skor?ilce=MALTEPE" className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-2.5 text-[12px] font-black uppercase italic text-slate-600 hover:border-blue-600 hover:text-blue-600 transition-all">MALTEPE</Link>
          <Link href="/skor?ilce=SARIYER" className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-2.5 text-[12px] font-black uppercase italic text-slate-600 hover:border-blue-600 hover:text-blue-600 transition-all">SARIYER</Link>
          <Link href="/skor?ilce=PENDİK" className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-2.5 text-[12px] font-black uppercase italic text-slate-600 hover:border-blue-600 hover:text-blue-600 transition-all">PENDİK</Link>
          <Link href="/skor?ilce=KARTAL" className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-2.5 text-[12px] font-black uppercase italic text-slate-600 hover:border-blue-600 hover:text-blue-600 transition-all">KARTAL</Link>
          <Link href="/skor?ilce=BAKIRKÖY" className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-2.5 text-[12px] font-black uppercase italic text-slate-600 hover:border-blue-600 hover:text-blue-600 transition-all">BAKIRKÖY</Link>
          <Link href="/skor?ilce=ATAŞEHİR" className="bg-slate-50 border border-slate-100 rounded-2xl px-5 py-2.5 text-[12px] font-black uppercase italic text-slate-600 hover:border-blue-600 hover:text-blue-600 transition-all">ATAŞEHİR</Link>
        </div>
      </section>

      {/* Yapılandırılmış veri */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": [{"@type": "Question", "name": "Bulevini nedir?", "acceptedAnswer": {"@type": "Answer", "text": "Bulevini, binaların gerçek sakin deneyimlerinden oluşan ortak hafızasını tutan bağımsız bir platformdur. Bir binayla yolu kesişmiş herkes deneyimini mühürler; bu kayıtlar birikir ve binanın karnesine dönüşür. Evini tutmadan önce o karneye bakarsın. Şu an İstanbul'da hizmet veriyor."}}, {"@type": "Question", "name": "Bina yorumları güvenilir mi?", "acceptedAnswer": {"@type": "Answer", "text": "Yorumlar bağlantı tipine göre ağırlıklandırılır: mevcut sakinin puanı en yüksek etkiye sahiptir; eski sakin ve ziyaretçi yorumları daha düşük ağırlıkla hesaba katılır. Kanıt fotoğrafı da eklenebilir."}}, {"@type": "Question", "name": "Yorum yazmak için kimliğim görünür mü?", "acceptedAnswer": {"@type": "Answer", "text": "Hayır, istersen tamamen anonim paylaşabilirsin. Kimliğin hiçbir zaman ev sahibi veya üçüncü kişilerle paylaşılmaz."}}, {"@type": "Question", "name": "Mühür nedir?", "acceptedAnswer": {"@type": "Answer", "text": "Mühür, bir binada yaşamış birinin o bina hakkında bıraktığı puanlı deneyim kaydıdır: ısınma, deprem dayanıklılığı, komşuluk, yönetim gibi kategorilerde."}}, {"@type": "Question", "name": "Hangi şehirlerde çalışıyor?", "acceptedAnswer": {"@type": "Answer", "text": "Şu an İstanbul'un tüm ilçelerinde derinlemesine çalışıyoruz: her bina gerçek adres ve koordinatla haritada."}}, {"@type": "Question", "name": "Ücretli mi?", "acceptedAnswer": {"@type": "Answer", "text": "Hayır, Bulevini tamamen ücretsizdir."}}]}) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({"@context": "https://schema.org", "@type": "WebSite", "name": "Bulevini", "url": "https://bulevini.com", "description": "İstanbul bina ve mahalle yorumları — kiralamadan önce binanın karnesini gör."}) }} />

      <footer className="border-t border-slate-100 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-wrap gap-3 items-center justify-between text-[13px] text-slate-400">
          <span>© 2026 Bulevini — Türkiye'nin en şeffaf bina platformu</span>
          <span><Link href="/gizlilik" className="underline">Gizlilik Politikası &amp; KVKK</Link> · <a href="mailto:sbhdog13@gmail.com" className="underline">İletişim</a></span>
        </div>
      </footer>
    </div>
  );
}
