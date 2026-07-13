import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Keşfet — Mühürlenmiş Binalar ve Son Sakin Yorumları | Bulevini",
  description: "İstanbul'da mühürlenmiş binaları keşfet: son sakin yorumları, bina karneleri ve canlı akış. Haritadan veya listeden binanı bul.",
  alternates: { canonical: "https://bulevini.com/kesfet" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
