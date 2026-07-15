import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Binaları Keşfet | Bulevini",
  description: "İstanbul'da mühürlenmiş binaları harita ve arama ile keşfet: bina karneleri, sakin yorumları, çevre analizi.",
  alternates: { canonical: "https://bulevini.com/binalari-kesfet" },
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
