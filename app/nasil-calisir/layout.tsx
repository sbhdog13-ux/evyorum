import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Nasıl Çalışır? | Bulevini",
  description: "Bulevini nasıl çalışır: bina ara, karneyi gör, deneyimini mühürle. Adım adım rehber.",
  alternates: { canonical: "https://bulevini.com/nasil-calisir" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
