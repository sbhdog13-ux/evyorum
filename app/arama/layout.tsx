import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bina Ara — İlçe, Mahalle ve Bina Adıyla Arama | Bulevini",
  description: "Bina, ilçe veya mahalle adıyla ara; puanlara, sakin onaylı mühürlere ve filtrelere göre binaları karşılaştır.",
  alternates: { canonical: "https://bulevini.com/arama" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
