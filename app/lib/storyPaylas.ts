import { toBlob } from 'html-to-image';

// Verilen DOM düğümünü (StoryKart) 1080x1920 PNG'ye çevirir; telefonda paylaşım
// menüsünü açar (Instagram vb.), desteklenmiyorsa görseli indirir.
export async function storyPaylas(node: HTMLElement | null, opts: { ad: string; url?: string }) {
  if (!node) return { ok: false, sebep: 'kart-yok' };
  let blob: Blob | null = null;
  try {
    blob = await toBlob(node, { width: 1080, height: 1920, pixelRatio: 1, cacheBust: true, backgroundColor: '#012A3B' });
  } catch (e) {
    return { ok: false, sebep: 'gorsel-hatasi' };
  }
  if (!blob) return { ok: false, sebep: 'gorsel-yok' };

  const dosyaAdi = `bulevini-${(opts.ad || 'karne').toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.png`;
  const file = new File([blob], dosyaAdi, { type: 'image/png' });

  // Web Share API (dosya destekli) — telefonda Instagram/WhatsApp menüsü açar
  const nav: any = typeof navigator !== 'undefined' ? navigator : null;
  if (nav?.canShare && nav.canShare({ files: [file] })) {
    try {
      await nav.share({
        files: [file],
        title: 'Bulevini — Bina Karnesi',
        text: `${opts.ad} binasının karnesi. Sen de mühürle 👉 bulevini.com`,
      });
      return { ok: true, yol: 'paylasim' };
    } catch (e: any) {
      if (e?.name === 'AbortError') return { ok: true, yol: 'iptal' };
      // paylaşım başarısızsa indirmeye düş
    }
  }

  // Masaüstü / desteklemeyen: indir
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = dosyaAdi;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 4000);
  return { ok: true, yol: 'indirme' };
}
