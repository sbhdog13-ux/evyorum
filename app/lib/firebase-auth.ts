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
