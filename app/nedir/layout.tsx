import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Bulevini Nedir? — Binaların Ortak Hafızası",
  description: "Bulevini, binaların gerçek sakin deneyimlerinden oluşan ortak hafızasını tutan bağımsız bir platformdur. Hangi sorunları çözüyoruz, ne değiliz — hepsi burada.",
  alternates: { canonical: "https://bulevini.com/nedir" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
