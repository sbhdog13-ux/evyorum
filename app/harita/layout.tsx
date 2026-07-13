import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Harita — Konum Seçerek Bina Mühürle | Bulevini",
  description: "Harita üzerinden konum seç, adresi otomatik al ve binanı mühürle. İlçe, sokak veya bina adıyla arama yap.",
  alternates: { canonical: "https://bulevini.com/harita" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
