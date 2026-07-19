// Bulevini Cloud Functions — radar bildirimleri
// Yeni mühür basıldığında, o binayı radarına alanlara Expo push bildirimi gönderir.
// Sunucuda çalıştığı için güvenlik kurallarına takılmaz (admin SDK) — istemciden token okuma derdi bitti.
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

exports.muhurBildirimi = onDocumentCreated(
  { document: 'yorumlar/{yorumId}', region: 'us-central1' },
  async (event) => {
    const yorum = event.data?.data();
    if (!yorum) return;

    // Bina oluşturma yer tutucusu bildirim tetiklemesin
    if (yorum.yorum_metni === 'BİNA MÜHÜRLENDİ.') return;

    const binaAdi = yorum.yeni_bina_adi || yorum.bina_adi;
    if (!binaAdi) return;

    // Bu binayı takip edenler
    const takipSnap = await db.collection('takipler').where('bina_adi', '==', binaAdi).get();
    if (takipSnap.empty) { console.log(`[bildirim] ${binaAdi}: takipçi yok`); return; }

    // Mührü basanın kendisine bildirim gitmesin
    const uidler = [...new Set(
      takipSnap.docs.map(d => d.data().kullanici_id).filter(u => u && u !== yorum.kullanici_id)
    )];
    if (uidler.length === 0) { console.log(`[bildirim] ${binaAdi}: kendisi dışında takipçi yok`); return; }

    // Push token'ları topla (10'arlı gruplar — Firestore 'in' sınırı)
    const tokenlar = [];
    for (let i = 0; i < uidler.length; i += 10) {
      const grup = uidler.slice(i, i + 10);
      const snap = await db.collection('kullanicilar')
        .where('__name__', 'in', grup).get();
      snap.docs.forEach(d => { const t = d.data().pushToken; if (t) tokenlar.push(t); });
    }
    if (tokenlar.length === 0) { console.log(`[bildirim] ${binaAdi}: token yok (${uidler.length} takipçi)`); return; }

    // Expo push gönder
    const gonderen = yorum.kullanici_adi || 'Bir sakin';
    const yanit = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenlar.map(to => ({
        to,
        sound: 'default',
        title: `📍 ${binaAdi}`,
        body: `${gonderen} yeni bir mühür bastı!`,
        data: { binaAdi },
      }))),
    });
    console.log(`[bildirim] ${binaAdi}: ${tokenlar.length} token'a gönderildi, durum ${yanit.status}`);
  }
);

// Ortak: bir kullanıcıya push gönder
async function kullaniciyaGonder(uid, baslik, metin, data) {
  if (!uid) return 'uid yok';
  const doc = await db.collection('kullanicilar').doc(uid).get();
  const token = doc.exists ? doc.data().pushToken : null;
  if (!token) return 'token yok';
  const yanit = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify([{ to: token, sound: 'default', title: baslik, body: metin, data }]),
  });
  return `gönderildi ${yanit.status}`;
}

// 2) Yoruma cevap gelince — yorum sahibine haber ver
exports.cevapBildirimi = onDocumentCreated(
  { document: 'yorumlar/{yorumId}/cevaplar/{cevapId}', region: 'us-central1' },
  async (event) => {
    const cevap = event.data?.data();
    if (!cevap) return;
    const yorumDoc = await db.collection('yorumlar').doc(event.params.yorumId).get();
    if (!yorumDoc.exists) return;
    const yorum = yorumDoc.data();
    // Kendi yorumuna kendi cevabına bildirim yok
    if (!yorum.kullanici_id || yorum.kullanici_id === cevap.kullanici_id) return;
    const binaAdi = yorum.yeni_bina_adi || yorum.bina_adi || '';
    const kim = cevap.kullanici_adi || 'Birisi';
    const sonuc = await kullaniciyaGonder(
      yorum.kullanici_id,
      `💬 ${binaAdi}`,
      `${kim} yorumuna cevap yazdı`,
      { binaAdi }
    );
    console.log(`[cevap-bildirim] ${binaAdi}: ${sonuc}`);
  }
);

// ============================================================================
// ÖZET KOLEKSİYON ("binalar") — ölçek çözümü
// Her binaya 1 özet kayıt (karne). Her mühürde ilgili bina yeniden hesaplanır.
// Listeleme sayfaları (skor/harita/kesfet/arama/ilceler) tüm yorumları değil,
// bu küçük özeti okur → site büyüse de hızlı kalır.
// ============================================================================

// Türkçe-güvenli slug (web app/lib/slug.ts ile BİREBİR aynı olmalı)
const TR_SLUG = { 'ç':'c','Ç':'c','ğ':'g','Ğ':'g','ı':'i','I':'i','İ':'i','i':'i','ö':'o','Ö':'o','ş':'s','Ş':'s','ü':'u','Ü':'u' };
function slugYap(isim) {
  if (!isim) return '';
  return String(isim).trim().split('').map(h => TR_SLUG[h] ?? h).join('')
    .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').replace(/-{2,}/g, '-');
}
// Bağlantı ağırlığı (lib/skor.ts ile aynı): sakin %100, eski sakin %70, ziyaretçi %30
function agirlik(tip) { return tip === 'eski_sakin' ? 0.7 : tip === 'ziyaretci' ? 0.3 : 1; }
function trUst(s) { return String(s || '').toLocaleUpperCase('tr-TR'); }
// İlçe/mahalle okuma (skor sayfasıyla aynı öncelik: yapısal alan → acik_adres)
function ilceOku(d) {
  if (d.ilce && d.ilce.trim()) return trUst(d.ilce).trim();
  if (d.acik_adres) {
    const ilk = (d.acik_adres.split('|')[0] || '').trim();
    const kisim = ilk.includes(' MAH. ') ? ilk.split(' MAH. ')[1] : ilk;
    const il = kisim.split('/')[0].replace('İSTANBUL', '').trim();
    if (il) return trUst(il);
  }
  return '';
}
function mahalleOku(d) {
  if (d.mahalle && d.mahalle.trim()) return trUst(d.mahalle).trim();
  if (d.acik_adres) {
    const ilk = (d.acik_adres.split('|')[0] || '').trim();
    if (ilk.includes(' MAH. ')) return trUst(ilk.split(' MAH. ')[0].trim());
  }
  return '';
}

// Bir binanın (slug) TÜM yorumlarını okuyup özet karnesini hesaplar, binalar/{slug}'a yazar.
// SLUG tabanlı: aynı slug'a düşen tüm yazım varyantları (GUL/GÜL) tek karnede birleşir.
// (Sadece O slug'ın yorumlarını okur — sınırlı, ucuz.)
async function binaOzetiYazSlug(slug) {
  if (!slug) return;
  const snap = await db.collection('yorumlar').where('slug', '==', slug).get();
  const yorumlar = snap.docs.map(d => d.data());

  // Hiç yorum kalmadıysa özet kaydını sil
  if (yorumlar.length === 0) {
    await db.collection('binalar').doc(slug).delete().catch(() => {});
    return;
  }
  const ad = trUst(yorumlar.find(y => y.yeni_bina_adi || y.bina_adi)?.yeni_bina_adi
    || yorumlar[0].bina_adi || slug).trim();

  let ilce = '', mahalle = '', koordinat = null, muhurSayisi = 0, dogrulanmis = 0, sorun = 0, arti = 0;
  const katT = {}; // kategori -> {t: ağırlıklı toplam, s: ağırlık toplamı}
  yorumlar.forEach(y => {
    if (!ilce) { const i = ilceOku(y); if (i) ilce = i; }
    if (!mahalle) { const m = mahalleOku(y); if (m) mahalle = m; }
    if (!koordinat && y.koordinat && y.koordinat.lat) koordinat = { lat: y.koordinat.lat, lng: y.koordinat.lng };
    if (y.baglanti_tipi === 'sakin') dogrulanmis += 1;
    sorun += (y.red_flags || []).length;
    arti += (y.green_flags || []).length;
    const pv = typeof y.puanlar === 'string' ? JSON.parse(y.puanlar) : y.puanlar;
    if (pv && typeof pv === 'object' && Object.keys(pv).length > 0) {
      muhurSayisi += 1;
      const w = agirlik(y.baglanti_tipi);
      Object.entries(pv).forEach(([k, v]) => {
        const key = trUst(k);
        if (!katT[key]) katT[key] = { t: 0, s: 0 };
        katT[key].t += Number(v) * w; katT[key].s += w;
      });
    }
  });

  const kategoriOrt = {};
  Object.entries(katT).forEach(([k, v]) => { kategoriOrt[k] = Number((v.t / v.s).toFixed(1)); });
  const katVals = Object.values(kategoriOrt);
  const finalPuan = katVals.length ? Number((katVals.reduce((a, b) => a + b, 0) / katVals.length).toFixed(1)) : 0;

  await db.collection('binalar').doc(slug).set({
    slug, adSlug: slugYap(ad), ad, ilce: ilce || 'İSTANBUL', mahalle, koordinat,
    finalPuan, kategoriOrt, muhurSayisi, dogrulanmis, sorun, arti,
    guncelleme: new Date(),
  });
  console.log(`[ozet] ${ad} (${slug}) yazıldı: puan ${finalPuan}, ${muhurSayisi} mühür`);
}

// TETİKLEYİCİ: yorum eklenince/değişince/silinince ilgili bina(lar)ın özetini güncelle
const { onDocumentWritten } = require('firebase-functions/v2/firestore');
exports.binaOzetiGuncelle = onDocumentWritten(
  { document: 'yorumlar/{yorumId}', region: 'us-central1' },
  async (event) => {
    const once = event.data?.before?.data();
    const sonra = event.data?.after?.data();
    const sluglar = new Set();
    if (sonra) sluglar.add(sonra.slug || slugYap(sonra.yeni_bina_adi || sonra.bina_adi));
    if (once) sluglar.add(once.slug || slugYap(once.yeni_bina_adi || once.bina_adi)); // isim/bina değiştiyse eskisini de tazele
    for (const slug of sluglar) { if (slug) await binaOzetiYazSlug(slug); }
  }
);

// HTTP: TÜM binaların özetini sıfırdan hesapla (ilk doldurma/backfill + emniyet "yeniden say").
// Kaynak veriyi (yorumlar) değiştirmez; sadece özet defterini (binalar) yeniden yazar.
const { onRequest } = require('firebase-functions/v2/https');
exports.binalariYenidenHesapla = onRequest(
  { region: 'us-central1', timeoutSeconds: 540, memory: '512MiB' },
  async (req, res) => {
    if (req.query.token !== 'bulevini-ozet-2026-7f3a') { res.status(403).send('yetkisiz'); return; }
    const snap = await db.collection('yorumlar').get();
    // 1) Eski yorumlara slug alanı bas (yoksa) — slug tabanlı toplama için
    let batch = db.batch(), eklenen = 0, batchSayac = 0;
    const sluglar = new Set();
    for (const d of snap.docs) {
      const x = d.data();
      const slug = x.slug || slugYap(x.yeni_bina_adi || x.bina_adi);
      if (slug) sluglar.add(slug);
      if (!x.slug && slug) {
        batch.update(d.ref, { slug });
        eklenen++; batchSayac++;
        if (batchSayac >= 400) { await batch.commit(); batch = db.batch(); batchSayac = 0; }
      }
    }
    if (batchSayac > 0) await batch.commit();
    // 2) Her benzersiz slug için özet karneyi yeniden yaz
    let n = 0;
    for (const slug of sluglar) { await binaOzetiYazSlug(slug); n++; }
    console.log(`[yeniden-hesapla] ${n} bina özeti, ${eklenen} yoruma slug eklendi`);
    res.status(200).send(`OK — ${n} bina özeti (${snap.size} yorumdan), ${eklenen} yoruma slug eklendi.`);
  }
);

// 3) Fotoğraf onaylanınca/reddedilince — mühür sahibine haber ver
const { onDocumentUpdated } = require('firebase-functions/v2/firestore');
exports.fotoOnayBildirimi = onDocumentUpdated(
  { document: 'yorumlar/{yorumId}', region: 'us-central1' },
  async (event) => {
    const once = event.data?.before?.data();
    const sonra = event.data?.after?.data();
    if (!once || !sonra) return;
    if (once.foto_onay !== 'bekliyor') return; // sadece bekliyor→karar geçişi
    if (sonra.foto_onay !== 'onaylandi' && sonra.foto_onay !== 'red') return;
    if (!sonra.kullanici_id) return;
    const binaAdi = sonra.yeni_bina_adi || sonra.bina_adi || '';
    const onaylandi = sonra.foto_onay === 'onaylandi';
    const sonuc = await kullaniciyaGonder(
      sonra.kullanici_id,
      onaylandi ? `📷 Fotoğrafın onaylandı` : `📷 Fotoğrafın yayınlanmadı`,
      onaylandi
        ? `${binaAdi} mührundeki fotoğrafın artık görünüyor`
        : `${binaAdi} mührundeki fotoğraf kurallara uymadığı için yayınlanmadı`,
      { binaAdi }
    );
    console.log(`[foto-bildirim] ${binaAdi} ${sonra.foto_onay}: ${sonuc}`);
  }
);
