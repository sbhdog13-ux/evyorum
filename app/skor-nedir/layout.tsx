import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Skor & Karne Nedir? | Bulevini",
  description: "Bulevini bina skoru ve karnesi nedir, nasıl hesaplanır, ne değildir? Mühür sistemi nasıl işler?",
  alternates: { canonical: "https://bulevini.com/skor-nedir" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
