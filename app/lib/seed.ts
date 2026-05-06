import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function seedData() {
  const yorumlar = [
    {
      bina_adi: "HUZUR APARTMANI",
      yeni_bina_adi: "HUZUR APARTMANI",
      yorum_metni: "Binanın durumu gayet iyi, sakin ve huzurlu bir ortam var.",
      kullanici_adi: "Saltuk Buğra",
      puan: 4.5,
      baglanti_tipi: "sakin",
      created_at: serverTimestamp()
    },
    {
      bina_adi: "MODA PALAS",
      yeni_bina_adi: "MODA PALAS",
      yorum_metni: "Komşular iyi ama yönetim biraz sorunlu.",
      kullanici_adi: "Anonim Sakin",
      puan: 3.0,
      baglanti_tipi: "eski_sakin",
      created_at: serverTimestamp()
    },
    {
      bina_adi: "KURTULUŞ SİTESİ",
      yeni_bina_adi: "KURTULUŞ SİTESİ",
      yorum_metni: "Isınma sistemi mükemmel, aidat makul seviyede.",
      kullanici_adi: "Saltuk Buğra",
      puan: 4.8,
      baglanti_tipi: "sakin",
      created_at: serverTimestamp()
    }
  ];

  for (const yorum of yorumlar) {
    await addDoc(collection(db, 'yorumlar'), yorum);
    console.log('Eklendi:', yorum.bina_adi);
  }
  console.log('Tüm veriler eklendi!');
}