import type { Metadata, Viewport } from "next";

export const viewport: Viewport = {
  themeColor: "#023E56",
};
import "./globals.css";
import { Inter } from "next/font/google";
import { AuthProvider } from "@/app/contexts/AuthContext";

// Bloklamayan, kendi kendine barındırılan font — hız optimizasyonu (eski manuel link/script numarasının yerine).
const inter = Inter({ subsets: ["latin"], display: "swap", variable: "--font-inter" });
import { LangProvider } from "@/app/lib/i18n";
import BottomNav from "@/app/components/BottomNav";
import KullaniciAdiKapisi from "@/app/components/KullaniciAdiKapisi";
import CerezBandi from "@/app/components/CerezBandi";
import Footer from "@/app/components/Footer";

export const metadata: Metadata = {
  metadataBase: new URL("https://bulevini.com"),
  title: "Bulevini | Binanı, Yaşamış Olandan Öğren — Bina Yorumları ve Karneleri",
  description: "Bulevini, binaların gerçek sakin deneyimlerinden oluşan ortak hafızasını tutan bağımsız platformdur. Evini tutmadan önce binanın karnesine bak: ısınma, deprem güveni, yönetim, komşuluk. Şu an İstanbul'da.",
  keywords: ["bina yorumları", "apartman yorumları", "kiralık daire İstanbul", "mahalle yorumları", "bina puanı", "ev tutmadan önce", "kiracı deneyimi", "bina karnesi", "bina sicili"],
  alternates: { canonical: "https://bulevini.com" },
  openGraph: {
    title: "Bulevini — Binaların Ortak Hafızası",
    description: "Binanı, yaşamış olandan öğren. Evini tutmadan önce binanın karnesine bak: gerçek sakin yorumları, çevre analizi, harita üzerinde keşif.",
    url: "https://bulevini.com",
    siteName: "Bulevini",
    locale: "tr_TR",
    type: "website",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Bulevini — Binaların Ortak Hafızası" }],
  },
  twitter: { card: "summary_large_image", title: "Bulevini — Binaların Ortak Hafızası", description: "Binanı, yaşamış olandan öğren. Evini tutmadan önce binanın karnesine bak.", images: ["/og-image.png"] },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bulevini",
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/favicon.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={inter.variable}>
      <head>
        <meta name="google-site-verification" content="DYIFwyUTKNKLk0KnZIeD3y19ACHcnOZlmD2D8icHxBw" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "Bulevini",
          "url": "https://bulevini.com",
          "logo": "https://bulevini.com/icons/icon-512.png",
          "description": "Bulevini, binaların gerçek sakin deneyimlerinden oluşan ortak hafızasını tutan bağımsız bir platformdur. Evini tutmadan önce binanın karnesine bakarsın; şu an İstanbul'da.",
          "foundingDate": "2026",
          "areaServed": { "@type": "City", "name": "İstanbul" },
          "email": "sbhdog13@gmail.com"
        }) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "SoftwareApplication",
          "name": "Bulevini",
          "url": "https://bulevini.com",
          "applicationCategory": "LifestyleApplication",
          "operatingSystem": "Web, iOS",
          "description": "Binaların ortak hafızası: gerçek sakin yorumları, bina karneleri, çevre analizi ve harita üzerinde keşif. Tamamen ücretsiz.",
          "offers": { "@type": "Offer", "price": "0", "priceCurrency": "TRY" },
          "publisher": { "@type": "Organization", "name": "Bulevini", "url": "https://bulevini.com" }
        }) }} />
      </head>
      <body className={inter.className}>
        <LangProvider>
        <AuthProvider>
          {children}
          <Footer />
          <BottomNav />
          <KullaniciAdiKapisi />
          <CerezBandi />
        </AuthProvider>
        </LangProvider>
      </body>
    </html>
  );
}
