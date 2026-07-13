import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İlçe ve Mahalle Skorları — Bina Sıralamaları | Bulevini",
  description: "İstanbul ilçe ve mahallelerinin sakin deneyimlerine dayalı skorları: en yüksek puanlı binalar, kategori filtreleri, bölge analizi.",
  alternates: { canonical: "https://bulevini.com/skor" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
