// @ts-ignore
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

module.exports = withPWA({
  // App Hosting (SSR) — statik export kaldırıldı, sunucu tarafı render aktif
});
