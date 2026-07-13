import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Binayı Mühürle — Deneyimini Paylaş | Bulevini",
  description: "Yaşadığın binayı mühürle: kategori puanları, sorunlar ve artılar, kanıt fotoğrafı. İstersen anonim kal.",
  alternates: { canonical: "https://bulevini.com/yorum-yap" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
