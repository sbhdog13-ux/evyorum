"use client";
import { getAnalytics, logEvent, isSupported } from 'firebase/analytics';
import { app } from './firebase-auth';

let _analytics: any = null;

// Sadece çerez onayı verildiyse ve tarayıcı destekliyorsa başlar
export async function analyticsBaslat() {
  if (typeof window === 'undefined' || _analytics) return;
  try {
    if (await isSupported()) _analytics = getAnalytics(app);
  } catch {}
}

// Çerez onayı localStorage'da 'kabul' ise başlat
export async function analyticsOnayVarsaBaslat() {
  try {
    if (localStorage.getItem('bulevini_cerez') === 'kabul') await analyticsBaslat();
  } catch {}
}

// Dönüşüm olayı — analytics kapalıysa sessizce yutar
export function olay(ad: string, params?: Record<string, any>) {
  try { if (_analytics) logEvent(_analytics, ad, params); } catch {}
}
