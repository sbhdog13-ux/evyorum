"use client";
import { forwardRef } from 'react';

export type StoryVeri = {
  ad: string;
  ilce?: string;
  mahalle?: string;
  puan: number;
  muhurSayisi: number;
  arti?: number;
  sorun?: number;
  kategoriler: { label: string; score: number }[];
};

// Instagram Story boyutunda (1080x1920) paylaşılabilir bina karnesi.
// Ekran dışında render edilir; html-to-image ile PNG'ye çevrilir.
const StoryKart = forwardRef<HTMLDivElement, { veri: StoryVeri }>(({ veri }, ref) => {
  const puan = Number(veri.puan) || 0;
  const kats = (veri.kategoriler || []).slice(0, 5);
  return (
    <div ref={ref} className="sk-kanvas">
      <style>{`
        .sk-kanvas{width:1080px;height:1920px;position:relative;overflow:hidden;
          background:linear-gradient(160deg,#034a68 0%,#023E56 45%,#012A3B 100%);
          color:#fff;display:flex;flex-direction:column;padding:100px 90px 90px;
          font-family:"Helvetica Neue",Helvetica,Arial,sans-serif;box-sizing:border-box}
        .sk-ust{display:flex;align-items:center;justify-content:space-between;margin-bottom:56px}
        .sk-logo{background:#fff;border-radius:26px;padding:20px 34px;display:flex}
        .sk-logo img{height:66px;display:block}
        .sk-etiket{font-size:30px;font-weight:800;font-style:italic;text-transform:uppercase;letter-spacing:5px;color:#A1CDE9}
        .sk-ad{font-size:88px;font-weight:900;font-style:italic;text-transform:uppercase;letter-spacing:-3px;line-height:.95}
        .sk-yer{display:flex;align-items:center;gap:14px;margin-top:22px;font-size:36px;font-weight:800;color:#A1CDE9;text-transform:uppercase;letter-spacing:1px}
        .sk-puanKutu{margin-top:48px;background:rgba(255,255,255,.07);border:2px solid rgba(255,255,255,.14);border-radius:40px;padding:48px 56px;display:flex;align-items:center;justify-content:space-between}
        .sk-puanSol{display:flex;flex-direction:column}
        .sk-puanBuyuk{font-size:132px;font-weight:900;font-style:italic;line-height:.9;display:flex;align-items:flex-end}
        .sk-puanBuyuk small{font-size:54px;color:#A1CDE9;margin-left:6px}
        .sk-yildiz{display:flex;gap:8px;margin-top:14px}
        .sk-yildiz span{font-size:44px;line-height:44px;color:#fbbf24}
        .sk-muhurRoz{display:flex;flex-direction:column;align-items:center;gap:6px}
        .sk-muhurRoz .s{font-size:86px;font-weight:900;font-style:italic;color:#3b82f6}
        .sk-muhurRoz .l{font-size:28px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#cfe4f4}
        .sk-bayraklar{margin-top:34px;display:flex;gap:20px}
        .sk-bayrak{display:flex;align-items:center;gap:12px;padding:20px 30px;border-radius:24px;font-size:36px;font-weight:900;font-style:italic;text-transform:uppercase;letter-spacing:.5px}
        .sk-arti{background:rgba(34,197,94,.16);border:2px solid rgba(34,197,94,.5);color:#4ade80}
        .sk-sorun{background:rgba(248,113,113,.14);border:2px solid rgba(248,113,113,.5);color:#f87171}
        .sk-satirlar{margin-top:44px;display:flex;flex-direction:column;gap:26px}
        .sk-satir{display:flex;align-items:center;justify-content:space-between}
        .sk-et{font-size:38px;font-weight:800;text-transform:uppercase;letter-spacing:.4px;color:#eaf4fb}
        .sk-noktalar{display:flex;gap:12px}
        .sk-noktalar i{width:36px;height:36px;border-radius:50%;background:rgba(255,255,255,.16);display:block}
        .sk-noktalar i.d{background:#3b82f6}
        .sk-damga{position:absolute;bottom:250px;right:66px;width:190px;height:190px;border-radius:50%;background:#fff;
          display:flex;flex-direction:column;align-items:center;justify-content:center;transform:rotate(-11deg);box-shadow:0 18px 40px rgba(0,0,0,.45)}
        .sk-damgaHalka{position:absolute;top:12px;left:12px;right:12px;bottom:12px;border:3px solid #3b82f6;border-radius:50%}
        .sk-damga img{width:92px;margin-bottom:6px;z-index:2}
        .sk-damga b{font-size:24px;font-weight:900;font-style:italic;text-transform:uppercase;letter-spacing:1px;color:#023E56;z-index:2}
        .sk-cta{margin-top:auto;display:flex;flex-direction:column}
        .sk-ctaBuyuk{font-size:56px;font-weight:900;font-style:italic;text-transform:uppercase;letter-spacing:-1px;line-height:1.02}
        .sk-ctaBuyuk b{color:#3b82f6}
        .sk-ctaAlt{display:flex;align-items:center;justify-content:space-between;margin-top:22px}
        .sk-site{font-size:40px;font-weight:800}
        .sk-kul{font-size:34px;font-weight:700;color:#A1CDE9}
      `}</style>

      <div className="sk-ust">
        <span className="sk-logo"><img src="/logo.png" alt="Bulevini" /></span>
        <span className="sk-etiket">Bina Karnesi</span>
      </div>

      <div className="sk-ad">{veri.ad}</div>
      <div className="sk-yer">📍 {(veri.ilce || 'İSTANBUL')}{veri.mahalle && veri.mahalle !== 'Bilinmiyor' ? ' · ' + veri.mahalle : ''}</div>

      <div className="sk-puanKutu">
        <div className="sk-puanSol">
          <div className="sk-puanBuyuk">{puan.toFixed(1)}<small>/5</small></div>
          <div className="sk-yildiz">{[1, 2, 3, 4, 5].map(s => (
            <span key={s} style={{ color: s <= Math.round(puan) ? '#fbbf24' : 'rgba(255,255,255,.2)' }}>★</span>
          ))}</div>
        </div>
        <div className="sk-muhurRoz"><div className="s">{veri.muhurSayisi}</div><div className="l">Mühür</div></div>
      </div>

      {((veri.arti || 0) > 0 || (veri.sorun || 0) > 0) && (
        <div className="sk-bayraklar">
          {(veri.arti || 0) > 0 && <div className="sk-bayrak sk-arti">✅ {veri.arti} Artı</div>}
          {(veri.sorun || 0) > 0 && <div className="sk-bayrak sk-sorun">🚩 {veri.sorun} Sorun</div>}
        </div>
      )}

      <div className="sk-satirlar">
        {kats.map((k, i) => {
          const dolu = Math.round(Number(k.score) || 0);
          return (
            <div className="sk-satir" key={i}>
              <span className="sk-et">{k.label}</span>
              <span className="sk-noktalar">{[1, 2, 3, 4, 5].map(n => (
                <i key={n} className={n <= dolu ? 'd' : ''} />
              ))}</span>
            </div>
          );
        })}
      </div>

      <div className="sk-damga">
        <div className="sk-damgaHalka" />
        <img src="/logo.png" alt="" />
        <b>Mühürlendi</b>
      </div>

      <div className="sk-cta">
        <div className="sk-ctaBuyuk">Sen de binanı <b>mühürle.</b></div>
        <div className="sk-ctaAlt"><span className="sk-site">bulevini.com</span><span className="sk-kul">@bulevini</span></div>
      </div>
    </div>
  );
});

StoryKart.displayName = 'StoryKart';
export default StoryKart;
