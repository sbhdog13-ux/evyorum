import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/app/contexts/AuthContext";
import { LangProvider } from "@/app/lib/i18n";
import BottomNav from "@/app/components/BottomNav";

export const metadata: Metadata = {
  title: "Bulevini | Evi Tutmadan Önce Gerçekleri Öğren",
  description: "Kiracılar için şeffaf bina yorumları",
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap"
          rel="stylesheet"
        />
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
