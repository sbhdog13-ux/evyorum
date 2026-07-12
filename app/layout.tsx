import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { LangProvider } from "@/app/lib/i18n";
import BottomNav from "@/app/components/BottomNav";

export const metadata: Metadata = {
  metadataBase: new URL("https://bulevini.com"),
  title: "Bulevini | Evini Tutmadan Önce Gerçekleri Öğren — İstanbul Bina Yorumları",
  description: "İstanbul'daki binaların gerçek sakin yorumları: ısınma, deprem dayanıklılığı, komşuluk, yönetim puanları; çevre analizi ve harita üzerinde bina karneleri. Kiralamadan önce binayı tanı.",
  keywords: ["bina yorumları", "apartman yorumları", "kiralık daire İstanbul", "mahalle yorumları", "bina puanı", "ev tutmadan önce", "kiracı deneyimi"],
  alternates: { canonical: "https://bulevini.com" },
  openGraph: {
    title: "Bulevini — İstanbul'un Bina Hafızası",
    description: "Kiralamadan önce binanın karnesini gör: gerçek sakin yorumları, çevre analizi, harita üzerinde bina puanları.",
    url: "https://bulevini.com",
    siteName: "Bulevini",
    locale: "tr_TR",
    type: "website",
    images: [{ url: "/icons/icon-512.png", width: 512, height: 512, alt: "Bulevini" }],
  },
  twitter: { card: "summary", title: "Bulevini — İstanbul'un Bina Hafızası", description: "Kiralamadan önce binanın karnesini gör.", images: ["/icons/icon-512.png"] },
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
