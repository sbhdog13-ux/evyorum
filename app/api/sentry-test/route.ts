// GEÇİCİ — O7 Sentry doğrulama uç noktası. Ziyaret edilince kasıtlı hata fırlatır.
// Sentry paneline düştüğü doğrulandıktan sonra SİLİNECEK.
export const dynamic = 'force-dynamic';

export async function GET() {
  throw new Error('Sentry O7 test hatası — kurulum doğrulama (silinecek)');
}
