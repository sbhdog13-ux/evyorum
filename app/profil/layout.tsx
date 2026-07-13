import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profilim | Bulevini",
  description: "Karakter panelin: mühürlerin, radarındaki binalar, rozetlerin ve deneyim arşivin.",
  alternates: { canonical: "https://bulevini.com/profil" },
  robots: { index: false, follow: false },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
