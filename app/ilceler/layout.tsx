import type { Metadata } from "next";
import { sehirlerMetni } from "@/app/lib/sehirler";

export const metadata: Metadata = {
  title: `${sehirlerMetni()} İlçeleri | Bulevini`,
  description: `${sehirlerMetni()} ilçelerinde bina ve mahalle deneyimleri — sakinlerin gözünden ilçe rehberi.`,
  alternates: { canonical: "https://bulevini.com/ilceler" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
