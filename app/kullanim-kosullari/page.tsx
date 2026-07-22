import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Kullanım Koşulları | Bulevini',
  description: 'Bulevini kullanım koşulları — platformu kullanırken uymanız gereken kurallar, sorumluluklar ve sınırlamalar.',
  alternates: { canonical: 'https://bulevini.com/kullanim-kosullari' },
};

export default function KullanimKosullariSayfasi() {
  return (
    <div className="min-h-screen bg-white text-[#0f172a] font-sans">
      <header className="max-w-3xl mx-auto flex items-center justify-between px-6 py-7">
        <Link href="/"><img src="/logo.png" alt="Bulevini" className="h-11" /></Link>
      </header>
      <article className="max-w-3xl mx-auto px-6 pb-24 leading-relaxed text-[15px] text-slate-700">
        <div className="text-[11px] font-black italic uppercase tracking-[2px] text-slate-400">Yasal</div>
        <h1 className="font-black italic uppercase tracking-tighter text-[32px] leading-[1.1] mt-2 text-[#023E56]">Kullanım Koşulları</h1>
        <p className="text-[13px] text-slate-400 mt-3">Son güncelleme: 23 Temmuz 2026</p>

        <p className="mt-6">Bulevini'yi ("Platform") kullanarak aşağıdaki koşulları kabul etmiş olursunuz. Koşulları kabul etmiyorsanız Platformu kullanmayınız.</p>

        <h2 className="font-black italic uppercase text-[18px] mt-8 text-[#023E56]">1. Hizmetin Tanımı</h2>
        <p className="mt-2">Bulevini, kullanıcıların binalarla ilgili gerçek deneyimlerini ("mühür" ve yorum) paylaştığı, bu deneyimlerden bina karneleri oluşturan bağımsız bir topluluk platformudur. Platform bir emlak/ilan hizmeti değildir ve resmî bir bina sicili niteliği taşımaz.</p>

        <h2 className="font-black italic uppercase text-[18px] mt-8 text-[#023E56]">2. Hesap ve Uygunluk</h2>
        <p className="mt-2">Mühür bırakmak için doğrulanmış bir hesap gereklidir. Hesap bilgilerinizin gizliliğinden ve hesabınız altında yapılan işlemlerden siz sorumlusunuz. Doğru ve güncel bilgi vermeyi kabul edersiniz.</p>

        <h2 className="font-black italic uppercase text-[18px] mt-8 text-[#023E56]">3. Kullanıcı İçeriği ve Sorumluluk</h2>
        <ul className="list-disc pl-6 mt-2 space-y-1.5">
          <li>Paylaştığınız içeriğin <b>gerçek, birinci elden deneyime</b> dayanması gerekir.</li>
          <li>Hakaret, iftira, nefret söylemi, kişisel veri ifşası (doxxing), yanıltıcı/sahte içerik ve yasa dışı paylaşım yasaktır.</li>
          <li>Yüklediğiniz fotoğraflarda kişilerin yüzü, plaka veya özel bilgiler yer almamalıdır.</li>
          <li>Paylaştığınız içerikten <b>tümüyle siz sorumlusunuz.</b></li>
        </ul>

        <h2 className="font-black italic uppercase text-[18px] mt-8 text-[#023E56]">4. İçerik Lisansı</h2>
        <p className="mt-2">Paylaştığınız içeriği, Platform üzerinde yayınlamak ve bina karnelerinde kullanmak üzere Bulevini'ye süresiz, dünya çapında, bedelsiz bir kullanım hakkı tanımış olursunuz. İçeriğe ilişkin haklarınız saklıdır.</p>

        <h2 className="font-black italic uppercase text-[18px] mt-8 text-[#023E56]">5. Moderasyon</h2>
        <p className="mt-2">Bulevini, kurallara aykırı içerikleri inceleme, kaldırma ve gerekirse hesabı askıya alma hakkını saklı tutar. Uygunsuz içerikleri "Şikâyet Et" ile bildirebilirsiniz.</p>

        <h2 className="font-black italic uppercase text-[18px] mt-8 text-[#023E56]">6. Sorumluluğun Sınırlanması</h2>
        <p className="mt-2">Platformdaki yorum ve puanlar <b>kullanıcı görüşleridir; doğrulanmış kesin gerçekler değildir.</b> Bir bina hakkında karar verirken bu içerikleri tek başına esas almayınız. Bulevini, içeriklerin doğruluğundan veya bu içeriklere dayanılarak alınan kararlardan sorumlu tutulamaz.</p>

        <h2 className="font-black italic uppercase text-[18px] mt-8 text-[#023E56]">7. Değişiklikler</h2>
        <p className="mt-2">Bu koşullar zaman zaman güncellenebilir. Önemli değişikliklerde makul biçimde bilgilendirme yapılır; güncel sürüm bu sayfada yayınlanır.</p>

        <h2 className="font-black italic uppercase text-[18px] mt-8 text-[#023E56]">8. Uygulanacak Hukuk ve İletişim</h2>
        <p className="mt-2">Bu koşullar Türkiye Cumhuriyeti hukukuna tabidir. Sorularınız için <a href="mailto:sbhdog13@gmail.com" className="text-blue-600 font-bold">sbhdog13@gmail.com</a>.</p>

        <div className="mt-10 flex gap-4 text-[13px] font-bold">
          <Link href="/gizlilik" className="text-blue-600 hover:underline">Gizlilik & KVKK →</Link>
          <Link href="/topluluk-kurallari" className="text-blue-600 hover:underline">Topluluk Kuralları →</Link>
        </div>
      </article>
    </div>
  );
}
