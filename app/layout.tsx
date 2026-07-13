import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { LangProvider } from "@/app/lib/i18n";
import BottomNav from "@/app/components/BottomNav";

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
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: "Bulevini" }],
  },
  twitter: { card: "summary", title: "Bulevini — Binaların Ortak Hafızası", description: "Binanı, yaşamış olandan öğren. Evini tutmadan önce binanın karnesine bak.", images: ["/icons/icon-512.png"] },
  manifest: "/manifest.json",
  themeColor: "#2563eb",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Bulevini",
  },
  icons: {
    icon: "/icons/icon-192.png",
    shortcut: "/icons/icon-192.png",
    apple: "/icons/icon-192.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <head>
        <meta name="google-site-verification" content="DYIFwyUTKNKLk0KnZIeD3y19ACHcnOZlmD2D8icHxBw" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          id="gfont"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
          media="print"
        />
        <script dangerouslySetInnerHTML={{ __html: "(function(){var l=document.getElementById('gfont');if(!l)return;function f(){l.media='all'}if(l.sheet){f()}else{l.addEventListener('load',f)}})();" }} />
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
      <body style={{ fontFamily: "'Inter', sans-serif" }}>
        <LangProvider>
        <AuthProvider>
          {children}
          <BottomNav />
        </AuthProvider>
        </LangProvider>
      </body>
    </html>
  );
}
