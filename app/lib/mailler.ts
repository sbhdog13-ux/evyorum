// Markalı e-postalar (O6) — Cloud Functions üzerinden Resend ile gönderilir.
// Firebase'in varsayılan (İngilizce, spam'e düşen) mailleri yerine bunlar kullanılır.
import { app } from './firebase-auth';

async function fonksiyonCagir(ad: string, veri?: object) {
  const { getFunctions, httpsCallable } = await import('firebase/functions');
  return httpsCallable(getFunctions(app, 'us-central1'), ad)(veri);
}

// Hoş geldin + doğrulama maili (girişli kullanıcı için; kayıt sonrası ve "tekrar gönder")
export async function dogrulamaMailiGonder(): Promise<void> {
  await fonksiyonCagir('dogrulamaMaili');
}

// Şifre sıfırlama maili ("Şifremi unuttum" — girişsiz)
export async function sifreSifirlamaMailiGonder(email: string): Promise<void> {
  await fonksiyonCagir('sifreSifirlamaMaili', { email });
}
