import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";

// apiKey derleme sırasında env yoksa boş kalır ve getAuth() "auth/invalid-api-key"
// ile çöker (SSR prerender). Boşsa geçici bir yer tutucu ver — build çökmez;
// gerçek anahtar env geldiğinde (tarayıcıda/çalışma anında) kullanılır.
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "build-time-placeholder";
if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) {
  console.warn("[firebase] NEXT_PUBLIC_FIREBASE_API_KEY yok — yer tutucu kullanılıyor (derleme anı beklenir).");
}

const firebaseConfig = {
  apiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const auth = getAuth(app);

// App Check (Y7 — bot koruması). reCAPTCHA v3 = görünmez; her Firestore isteğine
// gizli güven token'ı ekler. SADECE tarayıcıda çalışır (DOM gerekir); sunucuda atlanır.
// Site anahtarı public'tir (client'a gömülür). Enforce ayrıca Firebase konsolundan açılır.
if (typeof window !== "undefined") {
  import("firebase/app-check").then(({ initializeAppCheck, ReCaptchaV3Provider }) => {
    try {
      initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider("6Leqzl0tAAAAAI2u91-V45JcdXQvJKaOZrpT6QRC"),
        isTokenAutoRefreshEnabled: true,
      });
    } catch { /* App Check hatası siteyi bozmaz */ }
  }).catch(() => {});
}
