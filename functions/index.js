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
