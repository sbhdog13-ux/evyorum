"use client";
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Arayüz sözlüğü — kullanıcı verileri (yorum, bina adı, kategori) ASLA çevrilmez
const SOZLUK: { [dil: string]: { [k: string]: string } } = {
  tr: {
    'nav.kesfet': 'Keşfet', 'nav.radar': 'Radar', 'nav.skor': 'Skor', 'nav.muhurle': 'Mühürle', 'nav.profil': 'Profil', 'nav.menu': 'Menü',
    'menu.kesfet': 'BİNALARI KEŞFET', 'menu.muhurler': 'TÜM MÜHÜRLER', 'menu.skorlar': 'İLÇE / MAHALLE SKORLARI',
    'menu.binaOlustur': 'BİNA OLUŞTUR', 'menu.radar': 'RADARIMDAKİLER', 'menu.yorumlarim': 'YORUMLARIM', 'menu.cikis': 'ÇIKIŞ YAP',
    'acilis.motto1': 'EVİNİ TUTMADAN ÖNCE', 'acilis.motto2': 'GERÇEKLERİ', 'acilis.motto3': 'ÖĞREN.',
    'acilis.aciklama': "İstanbul'daki binaların gerçek sakin deneyimleri. Kiralamadan önce binanın karnesini gör; sen de yaşadıklarını paylaş, mührünü bas.",
    'acilis.girisKayit': 'GİRİŞ YAP / KAYIT OL', 'acilis.hemenBasla': 'HEMEN BAŞLA →', 'acilis.yakinda': "ÇOK YAKINDA APP STORE'DA",
    'acilis.gizlilik': 'GİZLİLİK',
    'acilis.k1b': 'Binayı Mühürle', 'acilis.k1': 'Isınma, deprem dayanıklılığı, komşuluk, yönetim... Deneyimini kategori kategori puanla, sorunları ve artıları işaretle. İstersen anonim kal.',
    'acilis.k2b': 'Haritada Keşfet', 'acilis.k2': 'Mühürlenmiş binaları harita üzerinde gör. İlçe, sokak ya da bina adıyla ara; çevresindeki okul, hastane ve ulaşım noktalarını incele.',
    'acilis.k3b': 'Radara Al', 'acilis.k3': 'İlgilendiğin binaları takip et — yeni bir sakin deneyimi paylaşıldığında anında haberin olsun.',
    'giris.hosgeldin': 'TEKRAR HOŞ GELDİN', 'giris.altYazi': 'Radarın seni bekliyor', 'giris.yeniHesap': 'YENİ HESAP AÇ', 'giris.katil': 'Bulevini topluluğuna katıl',
    'giris.isim': 'ADIN VE SOYADIN', 'giris.eposta': 'E-POSTA', 'giris.sifre': 'ŞİFREN', 'giris.girisYap': 'SİSTEME GİRİŞ YAP', 'giris.hesapOlustur': 'HESABI OLUŞTUR',
    'giris.bekle': 'BEKLEYİN...', 'giris.kayitOl': 'Hesabın yok mu? KAYIT OL', 'giris.girise': 'Zaten hesabın var mı? GİRİŞ YAP',
    'giris.kvkk': "KVKK Aydınlatma Metni ve Kullanım Koşulları'nı okudum, kabul ediyorum.",
    'kesfet.haritaBaslik': 'Bina veya adres ara', 'kesfet.haritaAlt': 'Harita üzerinden mühürlenmiş binaları keşfet', 'kesfet.haritayiAc': 'HARİTAYI AÇ →',
    'kesfet.muhur': 'Mühür', 'kesfet.bina': 'Bina', 'kesfet.ilce': 'İlçe',
    'kesfet.sonEklenen': '⚡ Son Eklenen', 'kesfet.enYuksek': '📈 En Yüksek Skor',
    'kesfet.feedBaslik': 'SON SAKİN YORUMLARI', 'kesfet.feedAlt': 'TOPLULUK TARAFINDAN MÜHÜRLENDİ', 'kesfet.canli': 'CANLI AKIŞ',
    'kesfet.veriYok': 'Veriler mühürleniyor...', 'kesfet.cebinde': 'BULEVİNİ', 'kesfet.cebinde2': 'CEBİNDE.',
    'kesfet.cebindeAlt': 'Haritada keşfet, konumundan mühürle, radarından takip et.',
    'skor.altBaslik': 'bina & bölge analizi', 'skor.mahalleAlt': 'mahalle skorları', 'skor.skorlar': 'SKORLAR', 'skor.binaSiralamasi': 'BİNA SIRALAMASI',
    'skor.filtre': 'FİLTRE', 'skor.filtreAciklama': 'Kategori başına minimum puan — tıkladıkça artar', 'skor.temizle': 'FİLTRELERİ TEMİZLE',
    'skor.hesaplaniyor': 'SKORLAR HESAPLANIYOR...', 'skor.veriYok': 'Henüz yeterli veri yok', 'skor.ilcedeVeriYok': 'Bu ilçede veri yok', 'skor.binaYok': 'Henüz mühürlenmiş bina yok',
    'skor.iyi': 'İYİ', 'skor.orta': 'ORTA', 'skor.sorunlu': 'SORUNLU', 'skor.muhur': 'MÜHÜR', 'skor.bina': 'BİNA', 'skor.mahalle': 'MAHALLE', 'skor.sakin': 'SAKİN',
    'harita.baslik': 'HARİTA ÜZERİNDEN SEÇ', 'harita.alt': 'Mühürlemek istediğin konuma dokun', 'harita.ara': 'İlçe, sokak veya bina ara...',
    'harita.konumSecildi': 'KONUM SEÇİLDİ', 'harita.adresAliniyor': 'Adres alınıyor...', 'harita.soru': 'Bu konuma ait binayı mühürlemek ister misin?',
    'harita.muhurle': 'MÜHÜRLE →', 'harita.farkliKonum': 'Farklı konum seç',
    'arama.baslik1': 'MEVCUT', 'arama.baslik1b': 'MÜHÜRLER.', 'arama.baslik2': 'BÖLGESEL', 'arama.baslik2b': 'İSTİHBARAT.',
    'arama.placeholder': 'BİNA, İLÇE VEYA MAHALLE ARA...', 'arama.yeniBina': 'YENİ BİNA MÜHÜRLE +', 'arama.liste': 'LİSTE', 'arama.harita': 'HARİTA',
    'arama.muhur': 'mühür', 'arama.sakinOnayli': 'sakin onaylı', 'arama.sonucYok': 'Sonuç bulunamadı',
    'arama.filtreOdasi': 'FİLTRE ODASI', 'arama.bolge': 'BÖLGE SEÇİMİ', 'arama.tumIlceler': 'TÜM İLÇELER', 'arama.minPuan': 'MİNİMUM PUAN', 'arama.kriter': 'KRİTER', 'arama.tumKriterler': 'TÜM KRİTERLER', 'arama.sifirla': 'FİLTRELERİ SIFIRLA',
    'muhurle.baslik1': 'BİNAYI', 'muhurle.baslik2': 'MÜHÜRLE.', 'muhurle.alt': 'Gerçekleri paylaş, geleceği şeffaflaştır.',
    'muhurle.binaSec': 'MÜHÜRLEYECEĞİN BİNAYI SEÇ...', 'muhurle.yeniOlustur': 'YENİ BİNA OLUŞTUR',
    'muhurle.kaynak': 'İSTİHBARAT KAYNAĞI / BAĞLANTIN', 'muhurle.sakinim': 'SAKİNİM', 'muhurle.eskiSakin': 'ESKİ SAKİN', 'muhurle.ziyaretci': 'ZİYARETÇİ', 'muhurle.etki': 'Etki',
    'muhurle.kriterEkle': 'KRİTER EKLE', 'muhurle.kanit': 'KANIT YÜKLE', 'muhurle.kanitEklendi': 'KANIT EKLENDİ',
    'muhurle.isaretler': 'HIZLI İŞARETLER', 'muhurle.sorunlar': 'SORUNLAR (Kırmızı)', 'muhurle.artilar': 'ARTILAR (Yeşil)', 'muhurle.sorunEkle': 'SORUN EKLE...', 'muhurle.artiEkle': 'ARTI EKLE...',
    'muhurle.deneyim': 'DETAYLI DENEYİM', 'muhurle.deneyimPh': 'Burada ne yaşadın? Gerçekleri dök...',
    'muhurle.anonim': 'ANONİM SAKİN', 'muhurle.kimlikGizli': 'Kimlik Gizli', 'muhurle.kimlikGorunur': 'Kimlik Görünür',
    'muhurle.gonder': 'MÜHÜRÜ BAS!', 'muhurle.gonderiliyor': 'MÜHÜRLENİYOR...',
  },
  en: {
    'nav.kesfet': 'Explore', 'nav.radar': 'Radar', 'nav.skor': 'Scores', 'nav.muhurle': 'Seal', 'nav.profil': 'Profile', 'nav.menu': 'Menu',
    'menu.kesfet': 'EXPLORE BUILDINGS', 'menu.muhurler': 'ALL SEALS', 'menu.skorlar': 'DISTRICT / AREA SCORES',
    'menu.binaOlustur': 'ADD A BUILDING', 'menu.radar': 'MY RADAR', 'menu.yorumlarim': 'MY REVIEWS', 'menu.cikis': 'SIGN OUT',
    'acilis.motto1': 'BEFORE YOU RENT,', 'acilis.motto2': 'KNOW THE FACTS', 'acilis.motto3': '.',
    'acilis.aciklama': "Real resident experiences of buildings in Istanbul. See a building's report card before renting; share what you lived through and put your seal on it.",
    'acilis.girisKayit': 'SIGN IN / SIGN UP', 'acilis.hemenBasla': 'GET STARTED →', 'acilis.yakinda': 'COMING SOON ON THE APP STORE',
    'acilis.gizlilik': 'PRIVACY',
    'acilis.k1b': 'Seal a Building', 'acilis.k1': 'Heating, earthquake safety, neighbours, management... Rate your experience category by category, flag issues and perks. Stay anonymous if you like.',
    'acilis.k2b': 'Explore on the Map', 'acilis.k2': 'See sealed buildings on the map. Search by district, street or building name; check nearby schools, hospitals and transit.',
    'acilis.k3b': 'Add to Radar', 'acilis.k3': 'Follow buildings you care about — get notified the moment a new resident experience is shared.',
    'giris.hosgeldin': 'WELCOME BACK', 'giris.altYazi': 'Your radar is waiting', 'giris.yeniHesap': 'CREATE ACCOUNT', 'giris.katil': 'Join the Bulevini community',
    'giris.isim': 'FULL NAME', 'giris.eposta': 'EMAIL', 'giris.sifre': 'PASSWORD', 'giris.girisYap': 'SIGN IN', 'giris.hesapOlustur': 'CREATE ACCOUNT',
    'giris.bekle': 'PLEASE WAIT...', 'giris.kayitOl': "Don't have an account? SIGN UP", 'giris.girise': 'Already have an account? SIGN IN',
    'giris.kvkk': 'I have read and accept the Privacy Notice and Terms of Use.',
    'kesfet.haritaBaslik': 'Search a building or address', 'kesfet.haritaAlt': 'Discover sealed buildings on the map', 'kesfet.haritayiAc': 'OPEN THE MAP →',
    'kesfet.muhur': 'Seals', 'kesfet.bina': 'Buildings', 'kesfet.ilce': 'Districts',
    'kesfet.sonEklenen': '⚡ Recently Added', 'kesfet.enYuksek': '📈 Top Rated',
    'kesfet.feedBaslik': 'LATEST RESIDENT REVIEWS', 'kesfet.feedAlt': 'SEALED BY THE COMMUNITY', 'kesfet.canli': 'LIVE FEED',
    'kesfet.veriYok': 'Sealing the data...', 'kesfet.cebinde': 'BULEVINI', 'kesfet.cebinde2': 'IN YOUR POCKET.',
    'kesfet.cebindeAlt': 'Explore on the map, seal from your location, follow with your radar.',
    'skor.altBaslik': 'building & area analysis', 'skor.mahalleAlt': 'neighbourhood scores', 'skor.skorlar': 'SCORES', 'skor.binaSiralamasi': 'BUILDING RANKING',
    'skor.filtre': 'FILTER', 'skor.filtreAciklama': 'Minimum score per category — tap to increase', 'skor.temizle': 'CLEAR FILTERS',
    'skor.hesaplaniyor': 'CALCULATING SCORES...', 'skor.veriYok': 'Not enough data yet', 'skor.ilcedeVeriYok': 'No data in this district', 'skor.binaYok': 'No sealed buildings yet',
    'skor.iyi': 'GOOD', 'skor.orta': 'AVERAGE', 'skor.sorunlu': 'POOR', 'skor.muhur': 'SEALS', 'skor.bina': 'BLDG', 'skor.mahalle': 'AREAS', 'skor.sakin': 'RESIDENTS',
    'harita.baslik': 'PICK ON THE MAP', 'harita.alt': 'Tap the location you want to seal', 'harita.ara': 'Search district, street or building...',
    'harita.konumSecildi': 'LOCATION SELECTED', 'harita.adresAliniyor': 'Fetching address...', 'harita.soru': 'Want to seal the building at this location?',
    'harita.muhurle': 'SEAL IT →', 'harita.farkliKonum': 'Pick another location',
    'arama.baslik1': 'EXISTING', 'arama.baslik1b': 'SEALS.', 'arama.baslik2': 'AREA', 'arama.baslik2b': 'INTEL.',
    'arama.placeholder': 'SEARCH BUILDING, DISTRICT OR AREA...', 'arama.yeniBina': 'SEAL A NEW BUILDING +', 'arama.liste': 'LIST', 'arama.harita': 'MAP',
    'arama.muhur': 'seals', 'arama.sakinOnayli': 'resident verified', 'arama.sonucYok': 'No results found',
    'arama.filtreOdasi': 'FILTER ROOM', 'arama.bolge': 'PICK A DISTRICT', 'arama.tumIlceler': 'ALL DISTRICTS', 'arama.minPuan': 'MINIMUM SCORE', 'arama.kriter': 'CRITERIA', 'arama.tumKriterler': 'ALL CRITERIA', 'arama.sifirla': 'RESET FILTERS',
    'muhurle.baslik1': 'SEAL THE', 'muhurle.baslik2': 'BUILDING.', 'muhurle.alt': 'Share the facts, make the future transparent.',
    'muhurle.binaSec': 'PICK THE BUILDING TO SEAL...', 'muhurle.yeniOlustur': 'ADD AS NEW BUILDING',
    'muhurle.kaynak': 'YOUR CONNECTION TO THIS BUILDING', 'muhurle.sakinim': 'RESIDENT', 'muhurle.eskiSakin': 'FORMER RESIDENT', 'muhurle.ziyaretci': 'VISITOR', 'muhurle.etki': 'Weight',
    'muhurle.kriterEkle': 'ADD CRITERIA', 'muhurle.kanit': 'UPLOAD PROOF', 'muhurle.kanitEklendi': 'PROOF ADDED',
    'muhurle.isaretler': 'QUICK FLAGS', 'muhurle.sorunlar': 'ISSUES (Red)', 'muhurle.artilar': 'PERKS (Green)', 'muhurle.sorunEkle': 'ADD ISSUE...', 'muhurle.artiEkle': 'ADD PERK...',
    'muhurle.deneyim': 'YOUR EXPERIENCE', 'muhurle.deneyimPh': 'What did you live through here? Spill the facts...',
    'muhurle.anonim': 'ANONYMOUS RESIDENT', 'muhurle.kimlikGizli': 'Identity Hidden', 'muhurle.kimlikGorunur': 'Identity Visible',
    'muhurle.gonder': 'SEAL IT!', 'muhurle.gonderiliyor': 'SEALING...',
  },
};

const LangContext = createContext<{ dil: string; setDil: (d: string) => void; t: (k: string) => string }>({ dil: 'tr', setDil: () => {}, t: k => k });

export function LangProvider({ children }: { children: ReactNode }) {
  const [dil, setDilState] = useState('tr');
  useEffect(() => {
    const kayitli = localStorage.getItem('bulevini_dil');
    if (kayitli) setDilState(kayitli);
    else if (navigator.language && !navigator.language.startsWith('tr')) setDilState('en');
  }, []);
  const setDil = (d: string) => { setDilState(d); localStorage.setItem('bulevini_dil', d); };
  const t = (k: string) => SOZLUK[dil]?.[k] ?? SOZLUK.tr[k] ?? k;
  return <LangContext.Provider value={{ dil, setDil, t }}>{children}</LangContext.Provider>;
}

export const useLang = () => useContext(LangContext);

// Açılır dil menüsü — tıkla → TR/EN listesi
export function LangSwitcher() {
  const { dil, setDil } = useLang();
  const [acik, setAcik] = useState(false);
  return (
    <div className="relative">
      <button onClick={() => setAcik(v => !v)} className="flex items-center gap-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-[11px] font-black uppercase text-slate-600 hover:border-blue-600">
        🌐 {dil.toUpperCase()} <span className="text-[8px]">▼</span>
      </button>
      {acik && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden z-[700] min-w-[90px]">
          {['tr', 'en'].map(d => (
            <button key={d} onClick={() => { setDil(d); setAcik(false); }}
              className={`w-full px-4 py-2.5 text-left text-[11px] font-black uppercase ${dil === d ? 'bg-[#e8f3fa] text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
              {d === 'tr' ? '🇹🇷 Türkçe' : '🇬🇧 English'}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
