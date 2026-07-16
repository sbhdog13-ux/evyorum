import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "İletişim | Bulevini",
  description: "Bulevini'ye ulaş: soru, öneri ve geri bildirimlerin için bize yaz.",
  alternates: { canonical: "https://bulevini.com/iletisim" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
