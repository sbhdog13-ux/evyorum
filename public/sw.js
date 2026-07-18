// Kill-switch service worker.
// Eski next-pwa service worker'ı olan ziyaretçilerde: tüm önbellekleri temizler,
// kendini kaydını siler ve açık sayfaları tazeler. Böylece kimse eski/önbellekli
// içerikte takılı kalmaz. Yeni ziyaretçilerde hiç kaydolmaz (next-pwa kaldırıldı).
self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    try {
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));
      await self.registration.unregister();
      const clientList = await self.clients.matchAll({ type: 'window' });
      clientList.forEach((c) => c.navigate(c.url));
    } catch (e) {
      // sessizce geç — temizlik en iyi gayret
    }
  })());
});
