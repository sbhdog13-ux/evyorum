import { collection, getDocs, query, where, documentId } from 'firebase/firestore';
import { db } from './firebase';

// Bir binaya yorum yapıldığında takipçilere push bildirim gönder (mobil ile aynı mantık)
export async function takipcilariBildir(binaAdi: string, yorumYapanIsim: string): Promise<void> {
  try {
    const takipSnap = await getDocs(
      query(collection(db, 'takipler'), where('bina_adi', '==', binaAdi))
    );
    if (takipSnap.empty) return;

    const kullaniciIdler = Array.from(new Set(
      takipSnap.docs.map(d => d.data().kullanici_id).filter(Boolean)
    ));
    if (kullaniciIdler.length === 0) return;

    const tokenler: string[] = [];
    // documentId ile toplu sorgu (10'arlı gruplar — Firestore 'in' sınırı)
    for (let i = 0; i < kullaniciIdler.length; i += 10) {
      const grup = kullaniciIdler.slice(i, i + 10);
      const snap = await getDocs(query(collection(db, 'kullanicilar'), where(documentId(), 'in', grup)));
      snap.docs.forEach(d => { const t = d.data().pushToken; if (t) tokenler.push(t); });
    }
    if (tokenler.length === 0) return;

    await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
      body: JSON.stringify(tokenler.map(to => ({
        to,
        sound: 'default',
        title: `📍 ${binaAdi}`,
        body: `${yorumYapanIsim} yeni bir mühür bastı!`,
        data: { binaAdi },
      }))),
    });
  } catch (e) {
    // Bildirim şimdilik kapalı (Cloud Functions gelince aktif olacak) — sessiz geç
    console.log('Bildirim atlandı:', (e as any)?.message || e);
  }
}
