import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bina Karnesi — Sakin Yorumları ve Çevre Analizi | Bulevini",
  description: "Binanın karnesi: gerçek sakin yorumları, kategori puanları, çevre analizi (okul, hastane, ulaşım) ve konum bilgisi.",
  alternates: { canonical: "https://bulevini.com/bina" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
