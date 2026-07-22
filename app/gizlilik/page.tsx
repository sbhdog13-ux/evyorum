import type { Metadata } from 'next';
import Link from 'next/link';
import GeriButonu from '@/app/components/GeriButonu';

export const metadata: Metadata = {
  title: 'Gizlilik Politikası ve KVKK Aydınlatma Metni | Bulevini',
  description: 'Bulevini gizlilik politikası ve KVKK aydınlatma metni — hangi verileri topluyoruz, neden, nasıl saklıyoruz ve haklarınız.',
  alternates: { canonical: 'https://bulevini.com/gizlilik' },
};

export default function GizlilikSayfasi() {
  return (
    <div className="min-h-screen bg-white text-[#0f172a] font-sans">
      <header className="max-w-3xl mx-auto flex items-center gap-4 px-6 py-7">
        <GeriButonu />
        <Link href="/"><img src="/logo.png" alt="Bulevini" className="h-11" /></Link>
      </header>
      <article className="max-w-3xl mx-auto px-6 pb-24 leading-relaxed text-[15px] text-slate-700">
        <div className="text-[11px] font-black italic uppercase tracking-[2px] text-slate-400">Yasal</div>
        <h1 className="font-black italic uppercase tracking-tighter text-[32px] leading-[1.1] mt-2 text-[#023E56]">Gizlilik Politikası ve KVKK Aydınlatma Metni</h1>
        <p className="text-[13px] text-slate-400 mt-3">Son güncelleme: 23 Temmuz 2026</p>

        <p className="mt-6">Bulevini ("Platform"), binaların gerçek sakin deneyimlerinden oluşan ortak hafızayı tutan bağımsız bir platformdur. Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında hangi kişisel verilerinizi, hangi amaçla işlediğimizi ve haklarınızı açıklar.</p>

        <h2 className="font-black italic uppercase text-[18px] mt-8 text-[#023E56]">1. Veri Sorumlusu</h2>
        <p className="mt-2">Platformun işletmecisi veri sorumlusudur. İletişim: <a href="mailto:sbhdog13@gmail.com" className="text-blue-600 font-bold">sbhdog13@gmail.com</a>.</p>

        <h2 className="font-black italic uppercase text-[18px] mt-8 text-[#023E56]">2. Topladığımız Veriler</h2>
        <ul className="list-disc pl-6 mt-2 space-y-1.5">
          <li><b>Hesap verileri:</b> e-posta adresi, ad-soyad, kullanıcı adı.</li>
          <li><b>İçerik verileri:</b> bıraktığınız mühürler (puanlar), yorum metinleri, sorun/artı etiketleri ve varsa yüklediğiniz kanıt fotoğrafları.</li>
          <li><b>Konum verisi:</b> yalnızca bir bina oluştururken, o binanın koordinatı (kişisel konumunuzu sürekli izlemeyiz).</li>
          <li><b>Teknik veriler:</b> cihaz/tarayıcı bilgisi, IP adresi, bildirim (push) jetonu, bot korumasına ilişkin doğrulama verileri ve çerezler.</li>
        </ul>

        <h2 className="font-black italic uppercase text-[18px] mt-8 text-[#023E56]">3. İşleme Amaçları</h2>
        <ul className="list-disc pl-6 mt-2 space-y-1.5">
          <li>Hesabınızı oluşturmak, doğrulamak ve güvenliğini sağlamak,</li>
          <li>Mühür ve yorumlarınızı yayınlamak, bina karnelerini hesaplamak,</li>
          <li>Bildirim (radar) göndermek, kötüye kullanımı ve botları engellemek,</li>
          <li>Hizmeti iyileştirmek ve teknik hataları tespit etmek.</li>
        </ul>

        <h2 className="font-black italic uppercase text-[18px] mt-8 text-[#023E56]">4. Hukuki Sebepler</h2>
        <p className="mt-2">Verileriniz KVKK m.5 uyarınca; sözleşmenin kurulması/ifası, meşru menfaat, hukuki yükümlülük ve açık rızanız (örneğin bildirimler) hukuki sebeplerine dayanılarak işlenir.</p>

        <h2 className="font-black italic uppercase text-[18px] mt-8 text-[#023E56]">5. Yurt İçi/Yurt Dışı Aktarım</h2>
        <p className="mt-2">Platform, altyapı hizmetleri için aşağıdaki tedarikçileri kullanır ve veriler bu hizmetlerin sunucularında (bir kısmı yurt dışında) işlenebilir:</p>
        <ul className="list-disc pl-6 mt-2 space-y-1.5">
          <li><b>Google Firebase / Google Cloud</b> — kimlik doğrulama, veritabanı, dosya depolama (Avrupa bölgesi).</li>
          <li><b>Resend</b> — işlemsel e-posta gönderimi (doğrulama, şifre sıfırlama).</li>
          <li><b>Google reCAPTCHA</b> — bot koruması.</li>
          <li><b>Sentry</b> — hata izleme (Avrupa bölgesi).</li>
          <li><b>Google Analytics</b> — anonim kullanım istatistikleri (yalnız çerez onayı verirseniz).</li>
        </ul>

        <h2 className="font-black italic uppercase text-[18px] mt-8 text-[#023E56]">6. Saklama Süresi</h2>
        <p className="mt-2">Kişisel verileriniz, hesabınız aktif olduğu sürece ve ilgili mevzuatın öngördüğü süreler boyunca saklanır. Hesabınızı sildiğinizde kişisel verileriniz silinir; bıraktığınız mühür ve yorumlar ise topluluk hafızasının bütünlüğü için <b>"Anonim Sakin"</b> olarak, sizinle bağlantısı kesilmiş biçimde kalır.</p>

        <h2 className="font-black italic uppercase text-[18px] mt-8 text-[#023E56]">7. Haklarınız (KVKK m.11)</h2>
        <p className="mt-2">Kişisel verilerinizin işlenip işlenmediğini öğrenme, düzeltilmesini/silinmesini isteme, işlemeye itiraz etme ve zararın giderilmesini talep etme haklarına sahipsiniz. Talepleriniz için <a href="mailto:sbhdog13@gmail.com" className="text-blue-600 font-bold">sbhdog13@gmail.com</a> adresine yazabilirsiniz.</p>

        <h2 className="font-black italic uppercase text-[18px] mt-8 text-[#023E56]">8. Hesap Silme</h2>
        <p className="mt-2">Profil sayfanızdan hesabınızı istediğiniz zaman silebilirsiniz. Aynı e-posta ile daha sonra yeni bir hesap açabilirsiniz.</p>

        <h2 className="font-black italic uppercase text-[18px] mt-8 text-[#023E56]">9. Çerezler</h2>
        <p className="mt-2">Zorunlu çerezler hizmetin çalışması için kullanılır. Analitik/isteğe bağlı çerezler yalnızca çerez bandındaki onayınızla etkinleşir; onayı istediğiniz zaman geri çekebilirsiniz.</p>

        <p className="mt-8 text-[13px] text-slate-400">Bu metin, mevzuattaki değişikliklere göre güncellenebilir. Sorularınız için <a href="mailto:sbhdog13@gmail.com" className="text-blue-600 font-bold">sbhdog13@gmail.com</a>.</p>

        <div className="mt-10 flex gap-4 text-[13px] font-bold">
          <Link href="/kullanim-kosullari" className="text-blue-600 hover:underline">Kullanım Koşulları →</Link>
          <Link href="/topluluk-kurallari" className="text-blue-600 hover:underline">Topluluk Kuralları →</Link>
        </div>
      </article>
    </div>
  );
}
