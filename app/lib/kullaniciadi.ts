// Kullanıcı adı sistemi — Faz 2
// Kurallar: 3-20 karakter, küçük harf, sadece a-z 0-9 _ . ; benzersizlik kullanici_adlari koleksiyonuyla.
// Yorumlarda gerçek isim değil kullanıcı adı görünür (mahremiyet).
import { doc, getDoc, writeBatch, serverTimestamp } from 'firebase/firestore';
import { db } from './firebase';

export function adTuret(isim: string): string {
  return (isim || '')
    .toLowerCase()
    .replace(/[çÇ]/g, 'c').replace(/[ğĞ]/g, 'g').replace(/[ıİiI]/g, 'i')
    .replace(/[öÖ]/g, 'o').replace(/[şŞ]/g, 's').replace(/[üÜ]/g, 'u')
    .replace(/[^a-z0-9_.]/g, '')
    .slice(0, 20);
}

export function adGecerliMi(ad: string): boolean {
  return /^[a-z0-9_.]{3,20}$/.test(ad);
}

export async function adMusaitMi(ad: string): Promise<boolean> {
  if (!adGecerliMi(ad)) return false;
  const d = await getDoc(doc(db, 'kullanici_adlari', ad));
  return !d.exists();
}

// Rezervasyon + kullanıcı belgesi tek pakette (yarım kalmaz)
export async function adKaydet(uid: string, ad: string): Promise<void> {
  const paket = writeBatch(db);
  paket.set(doc(db, 'kullanici_adlari', ad), { kullanici_id: uid, created_at: serverTimestamp() });
  paket.set(doc(db, 'kullanicilar', uid), { kullanici_adi: ad }, { merge: true });
  await paket.commit();
}

export async function adGetir(uid: string): Promise<string | null> {
  try {
    const d = await getDoc(doc(db, 'kullanicilar', uid));
    return d.exists() ? (d.data().kullanici_adi || null) : null;
  } catch { return null; }
}
