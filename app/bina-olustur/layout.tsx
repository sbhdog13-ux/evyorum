import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bina Oluştur | Bulevini",
  description: "Haritada olmayan binayı sisteme ekle: konum, adres ve bina bilgileriyle yeni bina kaydı oluştur.",
  alternates: { canonical: "https://bulevini.com/bina-olustur" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
