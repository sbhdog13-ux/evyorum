// Kullanıcı engelleme — mobildeki src/lib/engelleme.ts ile aynı mantık.
// Engellenenler kullanıcının kendi dokümanında tutulur; içerik istemci tarafında gizlenir.
import { doc, getDoc, setDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from './firebase';

export async function engellenenleriGetir(uid: string): Promise<string[]> {
  try {
    const snap = await getDoc(doc(db, 'kullanicilar', uid));
    const list = snap.exists() ? (snap.data() as any).engellenenler : undefined;
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

// Kendi dokümanıma engellenen kullanıcıyı ekle (doc yoksa oluşturur — merge + arrayUnion).
export async function kullaniciEngelle(uid: string, hedefUid: string): Promise<void> {
  await setDoc(doc(db, 'kullanicilar', uid), { engellenenler: arrayUnion(hedefUid) }, { merge: true });
}

// Engeli kaldır — yorumları yeniden görünür olur.
export async function engelKaldir(uid: string, hedefUid: string): Promise<void> {
  await setDoc(doc(db, 'kullanicilar', uid), { engellenenler: arrayRemove(hedefUid) }, { merge: true });
}

// Engellediklerimin kullanıcı adlarıyla listesi (profil sayfasında göstermek için).
// Ad bulunamazsa uid'nin kısa hali gösterilir; liste asla patlamaz.
export async function engellenenlerDetayli(uid: string): Promise<{ uid: string; ad: string }[]> {
  const idler = await engellenenleriGetir(uid);
  return Promise.all(idler.map(async hedef => {
    try {
      const snap = await getDoc(doc(db, 'kullanicilar', hedef));
      const ad = snap.exists() ? (snap.data() as any).kullanici_adi : null;
      return { uid: hedef, ad: ad ? '@' + ad : hedef.slice(0, 8) + '…' };
    } catch {
      return { uid: hedef, ad: hedef.slice(0, 8) + '…' };
    }
  }));
}
