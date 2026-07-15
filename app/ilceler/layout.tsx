import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İstanbul İlçeleri | Bulevini",
  description: "İstanbul ilçelerinde bina ve mahalle deneyimleri — sakinlerin gözünden ilçe rehberi.",
  alternates: { canonical: "https://bulevini.com/ilceler" },
  robots: { index: false, follow: true },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
