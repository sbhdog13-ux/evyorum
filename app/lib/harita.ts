// Harita karoları tek yerden. Üç haritamız da (keşfet, harita sayfası, konum seçici) buradan besleniyor.
// CARTO Ağustos 2026'dan beri anahtar istiyor; anahtarsız karolarda "API KEY REQUIRED" filigranı çıkıyor.
// Anahtar ayarlardan gelir, koda yazılmaz. Anahtar sadece bulevini.com için geçerli, dev'de filigran durur.
const CARTO_ANAHTAR = process.env.NEXT_PUBLIC_CARTO_KEY || '';

export const KARO_ADRES =
  `https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png${CARTO_ANAHTAR ? `?key=${CARTO_ANAHTAR}` : ''}`;

// Ücretsiz kullanımın şartı: bu yazı haritada görünür kalmalı
export const KARO_KATKI = '&copy; <a href="https://carto.com/attributions">CARTO</a>, &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
