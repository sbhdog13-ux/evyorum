import type { NextConfig } from 'next';
import { withSentryConfig } from '@sentry/nextjs';

// Firebase App Hosting (SSR). Build webpack ile (next build --webpack).
const nextConfig: NextConfig = {};

// Sentry (O7) — hata izleme. Source map yükleme kapalı (auth token yok; hatalar yine yakalanır).
export default withSentryConfig(nextConfig, {
  org: 'bulevini',
  project: 'javascript-nextjs',
  silent: true,
  sourcemaps: { disable: true },
});
