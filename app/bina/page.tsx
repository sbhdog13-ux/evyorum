"use client";
// Eski link uyumu: /bina?isim=FATİH%20APARTMANI  ->  /bina/fatih-apartmani
// Paylaşılmış/indekslenmiş eski linkler yeni temiz URL'e yönlendirilir; kimse kaybolmaz.
import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { slugify } from '@/app/lib/slug';

function BinaYonlendir() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const isim = searchParams?.get('isim');
    if (isim) {
      router.replace(`/bina/${slugify(decodeURIComponent(isim))}`);
    } else {
      router.replace('/arama');
    }
  }, [searchParams, router]);

  return (
    <div className="p-20 font-black italic uppercase text-center text-slate-200">
      BİNA KARNESİ AÇILIYOR...
    </div>
  );
}

export default function BinaEskiLink() {
  return (
    <Suspense fallback={<div className="p-20 font-black italic uppercase text-center text-slate-200">YÖNLENDİRİLİYOR...</div>}>
      <BinaYonlendir />
    </Suspense>
  );
}
