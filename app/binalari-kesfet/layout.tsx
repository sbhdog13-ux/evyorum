import type { Metadata } from "next";
import { sehirlerBulunmaMetni } from "@/app/lib/sehirler";

export const metadata: Metadata = {
  title: "Binaları Keşfet | Bulevini",
  description: `${sehirlerBulunmaMetni()} mühürlenmiş binaları harita ve arama ile keşfet: bina karneleri, sakin yorumları, çevre analizi.`,
  alternates: { canonical: "https://bulevini.com/binalari-kesfet" },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
