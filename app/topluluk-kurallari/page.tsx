import type { Metadata } from 'next';
import Link from 'next/link';
import GeriButonu from '@/app/components/GeriButonu';

export const metadata: Metadata = {
  title: 'Topluluk Kuralları | Bulevini',
  description: 'Bulevini topluluk kuralları — dürüst, saygılı ve gerçek deneyime dayalı bir bina hafızası için uyulması gereken ilkeler.',
  alternates: { canonical: 'https://bulevini.com/topluluk-kurallari' },
};

const kurallar: { baslik: string; metin: string }[] = [
  { baslik: 'Gerçek deneyimini paylaş', metin: 'Yalnızca kendi birinci elden yaşadığın binalar için mühür bırak. Duyum, tahmin veya başkasının anlattığı değil; senin deneyimin.' },
  { baslik: 'Dürüst ol, abartma', metin: 'Ne iyiyse iyi, ne kötüyse kötü yaz. Bir binayı haksız yere yüceltmek de karalamak da topluluğun güvenini zedeler.' },
  { baslik: 'Kişiye değil, binaya odaklan', metin: 'Komşu, yönetici veya kişilere yönelik hakaret, hedef gösterme ve kişisel bilgi ifşası (isim, kapı no, telefon) yasaktır.' },
  { baslik: 'Fotoğrafta mahremiyet', metin: 'Yüklediğin görsellerde insan yüzü, araç plakası veya özel bilgiler bulunmamalı. Kanıt fotoğrafı binayı anlatmalı, kişiyi değil.' },
  { baslik: 'Sahte ve spam yok', metin: 'Tek binayı şişirmek/karalamak için sahte mühür, tekrarlı yorum veya reklam paylaşmak yasaktır.' },
  { baslik: 'Nefret ve yasa dışı içerik yok', metin: 'Nefret söylemi, ayrımcılık, tehdit ve yasa dışı hiçbir içeriğe yer yoktur.' },
];

export default function ToplulukKurallariSayfasi() {
  return (
    <div className="min-h-screen bg-white text-[#0f172a] font-sans">
      <header className="max-w-3xl mx-auto flex items-center gap-4 px-6 py-7">
        <GeriButonu />
        <Link href="/"><img src="/logo.png" alt="Bulevini" className="h-11" /></Link>
      </header>
      <article className="max-w-3xl mx-auto px-6 pb-24 leading-relaxed text-[15px] text-slate-700">
        <div className="text-[11px] font-black italic uppercase tracking-[2px] text-slate-400">Topluluk</div>
        <h1 className="font-black italic uppercase tracking-tighter text-[32px] leading-[1.1] mt-2 text-[#023E56]">Topluluk Kuralları</h1>
        <p className="text-[13px] text-slate-400 mt-3">Son güncelleme: 23 Temmuz 2026</p>

        <p className="mt-6">Bulevini, binaların ortak hafızasıdır ve bu hafıza ancak <b>dürüst ve saygılı</b> katkılarla değer taşır. Aşağıdaki ilkeler herkes için geçerlidir.</p>

        <div className="grid gap-3 md:grid-cols-2 mt-6">
          {kurallar.map((k) => (
            <div key={k.baslik} className="border border-slate-200 rounded-2xl p-5">
              <div className="text-[14px] font-black italic text-[#023E56]">{k.baslik}</div>
              <p className="text-[13.5px] leading-relaxed text-slate-500 mt-2">{k.metin}</p>
            </div>
          ))}
        </div>

        <h2 className="font-black italic uppercase text-[18px] mt-10 text-[#023E56]">Kurallara uyulmazsa</h2>
        <p className="mt-2">Kurallara aykırı içerikler kaldırılabilir; tekrarlayan ihlallerde hesap askıya alınabilir. Uygunsuz bir içerik görürsen <b>"Şikâyet Et"</b> ile bildir — moderasyon topluluğun ortak sorumluluğudur.</p>

        <div className="mt-10 flex gap-4 text-[13px] font-bold">
          <Link href="/gizlilik" className="text-blue-600 hover:underline">Gizlilik & KVKK →</Link>
          <Link href="/kullanim-kosullari" className="text-blue-600 hover:underline">Kullanım Koşulları →</Link>
        </div>
      </article>
    </div>
  );
}
