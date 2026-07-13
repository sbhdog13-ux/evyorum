import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Giriş Yap / Kayıt Ol | Bulevini",
  description: "Bulevini hesabına giriş yap veya ücretsiz kayıt ol; binanı mühürle, radarına al, karneleri gör.",
  alternates: { canonical: "https://bulevini.com/giris" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
