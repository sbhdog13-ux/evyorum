import type { Metadata } from "next";
import { sehirlerMetni } from "@/app/lib/sehirler";

export const metadata: Metadata = {
  title: "İlçe ve Mahalle Skorları — Bina Sıralamaları | Bulevini",
  description: `${sehirlerMetni()} ilçe ve mahallelerinin sakin deneyimlerine dayalı skorları: en yüksek puanlı binalar, kategori filtreleri, bölge analizi.`,
  alternates: { canonical: "https://bulevini.com/skor" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
