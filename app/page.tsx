"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ─── Types ─── */
interface Petal {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  rotate: number;
}

/* ─── Crop state ─── */
const STAGE = 280;
const OUT = 192;

export default function Home() {
  const [petals, setPetals] = useState<Petal[]>([]);

  // Crop modal
  const [cropOpen, setCropOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [hasPhoto, setHasPhoto] = useState(false);
  const [croppedUrl, setCroppedUrl] = useState("");

  const cropImgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // crop transform
  const scaleRef = useRef(1);
  const minScaleRef = useRef(1);
  const oxRef = useRef(0);
  const oyRef = useRef(0);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setPetals(
      Array.from({ length: 22 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 8,
        duration: 6 + Math.random() * 6,
        size: 8 + Math.random() * 14,
        rotate: Math.random() * 360,
      })),
    );
  }, []);

  // Load mom.jpg directly into canvas — no crop modal on page open
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      const scale = Math.max(OUT / img.naturalWidth, OUT / img.naturalHeight);
      const sw = img.naturalWidth * scale;
      const sh = img.naturalHeight * scale;
      ctx.clearRect(0, 0, OUT, OUT);
      ctx.drawImage(img, (OUT - sw) / 2, (OUT - sh) / 2, sw, sh);
      setHasPhoto(true);
    };
    img.onerror = () => {};
    img.src = "/mom.jpg";
  }, []);

  /* ── apply transform to crop img ── */
  const applyT = useCallback(() => {
    if (!cropImgRef.current) return;
    cropImgRef.current.style.transform = `translate(${oxRef.current}px,${oyRef.current}px) scale(${scaleRef.current})`;
  }, []);

  const clamp = useCallback((natW: number, natH: number) => {
    const sw = natW * scaleRef.current,
      sh = natH * scaleRef.current;
    oxRef.current = Math.min(0, Math.max(STAGE - sw, oxRef.current));
    oyRef.current = Math.min(0, Math.max(STAGE - sh, oyRef.current));
  }, []);

  const setZoomVal = useCallback(
    (z: number, cx = STAGE / 2, cy = STAGE / 2, natW: number, natH: number) => {
      const imgX = (cx - oxRef.current) / scaleRef.current;
      const imgY = (cy - oyRef.current) / scaleRef.current;
      scaleRef.current = Math.min(
        minScaleRef.current * 4,
        Math.max(minScaleRef.current, z),
      );
      oxRef.current = cx - imgX * scaleRef.current;
      oyRef.current = cy - imgY * scaleRef.current;
      clamp(natW, natH);
      applyT();
      setZoom(scaleRef.current);
    },
    [applyT, clamp],
  );

  /* ── file pick ── */
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const url = URL.createObjectURL(file);
    setImgSrc(url);
  };

  /* ── when crop img loads, open modal ── */
  const handleImgLoad = () => {
    const img = cropImgRef.current!;
    const natW = img.naturalWidth,
      natH = img.naturalHeight;
    img.style.width = natW + "px";
    img.style.height = natH + "px";
    const ms = Math.max(STAGE / natW, STAGE / natH);
    minScaleRef.current = ms;
    scaleRef.current = ms;
    oxRef.current = (STAGE - natW * ms) / 2;
    oyRef.current = (STAGE - natH * ms) / 2;
    applyT();
    setZoom(ms);
    setCropOpen(true);
  };

  /* ── drag ── */
  const dragRef = useRef<{ sx: number; sy: number } | null>(null);

  const onMouseDown = (e: React.MouseEvent) => {
    dragRef.current = {
      sx: e.clientX - oxRef.current,
      sy: e.clientY - oyRef.current,
    };
    e.preventDefault();
  };
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current || !cropImgRef.current) return;
      const natW = cropImgRef.current.naturalWidth;
      const natH = cropImgRef.current.naturalHeight;
      oxRef.current = e.clientX - dragRef.current.sx;
      oyRef.current = e.clientY - dragRef.current.sy;
      clamp(natW, natH);
      applyT();
    };
    const onUp = () => {
      dragRef.current = null;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, [applyT, clamp]);

  /* ── touch ── */
  const lastTRef = useRef<React.TouchList | null>(null);
  const lastDistRef = useRef<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    lastTRef.current = e.touches;
    if (e.touches.length === 2) {
      lastDistRef.current = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
    }
    e.preventDefault();
  };

  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!cropImgRef.current || !lastTRef.current) return;
    const natW = cropImgRef.current.naturalWidth;
    const natH = cropImgRef.current.naturalHeight;
    if (e.touches.length === 1 && lastTRef.current.length >= 1) {
      oxRef.current += e.touches[0].clientX - lastTRef.current[0].clientX;
      oyRef.current += e.touches[0].clientY - lastTRef.current[0].clientY;
      clamp(natW, natH);
      applyT();
    } else if (e.touches.length === 2) {
      const d = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      if (lastDistRef.current) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const cx =
          (e.touches[0].clientX + e.touches[1].clientX) / 2 - rect.left;
        const cy = (e.touches[0].clientY + e.touches[1].clientY) / 2 - rect.top;
        setZoomVal(
          scaleRef.current * (d / lastDistRef.current),
          cx,
          cy,
          natW,
          natH,
        );
      }
      lastDistRef.current = d;
    }
    lastTRef.current = e.touches;
  };

  /* ── confirm crop ── */
  const confirmCrop = () => {
    const img = cropImgRef.current!;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, OUT, OUT);
    const srcX = -oxRef.current / scaleRef.current;
    const srcY = -oyRef.current / scaleRef.current;
    const srcW = STAGE / scaleRef.current;
    const srcH = STAGE / scaleRef.current;
    ctx.drawImage(img, srcX, srcY, srcW, srcH, 0, 0, OUT, OUT);
    setCroppedUrl(canvas.toDataURL("image/jpeg", 0.92));
    setHasPhoto(true);
    setCropOpen(false);
  };

  return (
    <>
      <style>{css}</style>

      <div className="bg-glow" />

      {/* Petals */}
      {petals.map((p) => (
        <div
          key={p.id}
          className="petal"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size * 1.2,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
          }}
        />
      ))}

      <div className="page">
        <div className="content">
          {/* Ornament */}
          <div className="ornament">
            <div className="ornament-line" />
            <span className="ornament-icon">🌸</span>
            <div className="ornament-line r" />
          </div>

          {/* Photo Frame */}
          <div
            className="photo-wrap"
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleFile}
            />
            <div className="frame-ring">
              <div className="frame-inner">
                <canvas
                  ref={canvasRef}
                  width={OUT}
                  height={OUT}
                  style={{
                    width: OUT,
                    height: OUT,
                    display: hasPhoto ? "block" : "none",
                  }}
                />
                {!hasPhoto && (
                  <div className="photo-placeholder">
                    <span style={{ fontSize: "2.4rem" }}>👩</span>
                    <div className="hint">
                      Tap to add
                      <br />
                      Inay&apos;s photo
                    </div>
                  </div>
                )}
              </div>
            </div>
            <span
              className="fr"
              style={{ top: "-12px", left: "14px", animationDelay: "0s" }}
            >
              🌹
            </span>
            <span
              className="fr"
              style={{ top: "-12px", right: "14px", animationDelay: "1s" }}
            >
              🌸
            </span>
            <span
              className="fr"
              style={{ bottom: "-4px", left: "2px", animationDelay: "2s" }}
            >
              🌺
            </span>
            <span
              className="fr"
              style={{ bottom: "-4px", right: "2px", animationDelay: "0.5s" }}
            >
              🌷
            </span>
          </div>

          {/* Download cropped photo */}
          {croppedUrl && (
            <a
              href={croppedUrl}
              download="mom.jpg"
              className="download-btn"
            >
              ⬇ Download cropped photo → replace public/mom.jpg → redeploy
            </a>
          )}

          {/* Title */}
          <div className="title-wrap">
            <span className="t-main">Happy Mother&apos;s Day</span>
            <span className="t-name">Inay</span>
          </div>

          {/* Divider */}
          <div className="divider">
            <div className="dline" />
            <span className="dheart">💗</span>
            <div className="dline" />
          </div>

          {/* Message */}
          <div className="message">
            <p>
              Thank po, Inay, sa lahat ng sakripisyo niyo.
              <br />
              Mahal na mahal po namin kayo.
              <br />
              <span className="hl">
                Work hard po ako para sa inyo at si Tatay.
              </span>
              <br />
              <br />
              Sa bawat araw, kayo po ang aming
              <br />
              <span className="hl">lakas at inspirasyon</span>.<br />
              Walang salita ang sapat upang ilarawan
              <br />
              ang aming pagmamahal sa inyo.
              <br />
              <br />
              <span className="hl">Salamat sa lahat, Inay.</span>
            </p>
          </div>
        </div>
      </div>

      {/* Crop img (hidden, triggers modal on load) */}
      {imgSrc && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          ref={cropImgRef}
          src={imgSrc}
          alt=""
          onLoad={handleImgLoad}
          style={{
            display: "none",
            position: "absolute",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Crop Modal */}
      {cropOpen && (
        <div className="crop-overlay">
          <div className="crop-title">
            Position &amp; zoom Inay&apos;s photo
          </div>
          <div
            className="crop-stage"
            onMouseDown={onMouseDown}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={() => {
              lastTRef.current = null;
              lastDistRef.current = null;
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={cropImgRef}
              src={imgSrc}
              alt=""
              onLoad={handleImgLoad}
              className="crop-img"
              draggable={false}
            />
          </div>
          <div className="crop-hint">
            Drag to reposition · Pinch or slider to zoom
          </div>
          <div className="crop-zoom">
            <label>Zoom</label>
            <input
              type="range"
              min={minScaleRef.current}
              max={minScaleRef.current * 4}
              step="0.01"
              value={zoom}
              onChange={(e) => {
                const img = cropImgRef.current!;
                setZoomVal(
                  parseFloat(e.target.value),
                  STAGE / 2,
                  STAGE / 2,
                  img.naturalWidth,
                  img.naturalHeight,
                );
              }}
            />
          </div>
          <div className="crop-btns">
            <button
              className="crop-btn cancel"
              onClick={() => setCropOpen(false)}
            >
              Cancel
            </button>
            <button className="crop-btn confirm" onClick={confirmCrop}>
              Apply ✓
            </button>
          </div>
        </div>
      )}
    </>
  );
}

const css = `
  *, *::before, *::after { box-sizing: border-box; }
  :root {
    --rose: #c8526b; --rose-light: #e8849a; --rose-pale: #f2b8c6;
    --gold: #d4a853; --gold-light: #e8c878; --cream: #f9f0e8;
    --deep: #1a0a14; --deep2: #2d0f20; --deep3: #3d1530;
  }
  html,body { margin:0;padding:0;width:100%;min-height:100vh;background:var(--deep);overflow-x:hidden; }

  .bg-glow {
    position:fixed;inset:0;pointer-events:none;z-index:0;
    background:
      radial-gradient(ellipse 80% 60% at 50% 0%,rgba(200,82,107,.20) 0%,transparent 70%),
      radial-gradient(ellipse 60% 40% at 80% 80%,rgba(212,168,83,.12) 0%,transparent 60%),
      radial-gradient(ellipse 50% 50% at 20% 60%,rgba(200,82,107,.10) 0%,transparent 60%),
      linear-gradient(180deg,#1a0a14 0%,#2d0f20 50%,#1a0a14 100%);
  }

  .petal {
    position:fixed;top:-30px;border-radius:50% 0 50% 0;
    background:linear-gradient(135deg,var(--rose-pale),var(--rose-light));
    opacity:0;animation:fall linear infinite;pointer-events:none;z-index:1;
  }
  @keyframes fall {
    0%{opacity:0;transform:translateY(-30px) rotate(0deg)}
    10%{opacity:.55} 90%{opacity:.25}
    100%{opacity:0;transform:translateY(110vh) rotate(720deg)}
  }

  .page {
    min-height:100vh;display:flex;flex-direction:column;
    align-items:center;justify-content:center;
    position:relative;padding:2.5rem 1.5rem 3.5rem;z-index:10;
  }
  .content { width:100%;max-width:420px;display:flex;flex-direction:column;align-items:center; }

  .ornament { display:flex;align-items:center;gap:1rem;margin-bottom:1.8rem;opacity:0;animation:fadeUp 1s ease .2s forwards; }
  .ornament-line { width:55px;height:1px;background:linear-gradient(90deg,transparent,var(--gold)); }
  .ornament-line.r { background:linear-gradient(90deg,var(--gold),transparent); }
  .ornament-icon { font-size:1.3rem;filter:drop-shadow(0 0 8px rgba(212,168,83,.6)); }

  /* Photo frame — NO spin */
  .photo-wrap { position:relative;margin-bottom:1.8rem;opacity:0;animation:fadeDown 1s ease .4s forwards;cursor:pointer; }
  .frame-ring {
    width:204px;height:204px;border-radius:50%;
    background:linear-gradient(135deg,#d4a853 0%,#c8526b 40%,#e8849a 70%,#e8c878 100%);
    display:flex;align-items:center;justify-content:center;
    box-shadow:0 0 30px rgba(200,82,107,.25),0 0 60px rgba(212,168,83,.10);
  }
  .frame-inner {
    width:192px;height:192px;border-radius:50%;
    background:var(--deep2);overflow:hidden;
    display:flex;align-items:center;justify-content:center;
  }
  .photo-placeholder {
    width:100%;height:100%;display:flex;flex-direction:column;
    align-items:center;justify-content:center;gap:.4rem;
    background:linear-gradient(135deg,var(--deep2),var(--deep3));transition:background .3s;
  }
  .photo-placeholder:hover { background:linear-gradient(135deg,var(--deep3),#4d1a38); }
  .hint { font-family:'Cormorant Garamond',serif;font-size:.68rem;color:var(--rose-pale);text-align:center;letter-spacing:.08em;opacity:.75;padding:0 1.2rem;line-height:1.6; }

  .fr { position:absolute;font-size:1.2rem;animation:floatR 3s ease-in-out infinite;filter:drop-shadow(0 0 6px rgba(200,82,107,.4)); }
  @keyframes floatR { 0%,100%{transform:translateY(0) rotate(-10deg)} 50%{transform:translateY(-9px) rotate(10deg)} }

  .title-wrap { text-align:center;margin-bottom:.5rem;opacity:0;animation:fadeUp 1s ease .7s forwards; }
  .t-main {
    font-family:'Playfair Display',serif;font-size:clamp(2.2rem,9vw,3.3rem);font-weight:700;line-height:1.05;
    background:linear-gradient(135deg,var(--cream) 0%,var(--rose-pale) 50%,var(--cream) 100%);
    -webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;
    display:block;filter:drop-shadow(0 2px 20px rgba(200,82,107,.3));
  }
  .t-name {
    font-family:'Pinyon Script',cursive;font-size:clamp(2.6rem,11vw,4rem);color:var(--rose-light);
    display:block;line-height:1.1;text-shadow:0 0 40px rgba(200,82,107,.5);margin-top:-.15rem;
  }

  .divider { display:flex;align-items:center;gap:.8rem;margin:1.4rem 0;width:100%;opacity:0;animation:fadeUp 1s ease .9s forwards; }
  .dline { flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(200,82,107,.4),transparent); }
  .dheart { font-size:.9rem;animation:pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.35)} }

  .message { text-align:center;padding:0 .5rem;opacity:0;animation:fadeUp 1s ease 1.1s forwards; }
  .message p {
    font-family:'Cormorant Garamond',serif;font-size:clamp(1rem,3.6vw,1.18rem);
    font-style:italic;font-weight:300;line-height:1.85;margin:0;
    color:rgba(249,240,232,.74);letter-spacing:.02em;
  }
  .hl { color:var(--rose-pale)!important;font-style:normal!important;font-weight:400!important; }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)}  to{opacity:1;transform:translateY(0)} }
  @keyframes fadeDown { from{opacity:0;transform:translateY(-20px)} to{opacity:1;transform:translateY(0)} }

  .download-btn {
    display:block;font-family:'Cormorant Garamond',serif;font-size:.7rem;
    letter-spacing:.08em;text-align:center;color:var(--gold);
    border:1px solid rgba(212,168,83,.35);border-radius:999px;
    padding:.45rem 1.2rem;margin-bottom:1.2rem;text-decoration:none;
    background:rgba(212,168,83,.07);transition:background .2s;
  }
  .download-btn:hover { background:rgba(212,168,83,.15); }

  /* ── Crop Modal ── */
  .crop-overlay {
    position:fixed;inset:0;z-index:1000;
    background:rgba(10,3,8,.96);backdrop-filter:blur(10px);
    display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.2rem;
    padding:1.5rem;
  }
  .crop-title { font-family:'Cormorant Garamond',serif;font-size:.78rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);opacity:.85; }
  .crop-stage {
    position:relative;width:280px;height:280px;border-radius:50%;overflow:hidden;
    border:2px solid rgba(200,82,107,.5);background:#0d0509;
    cursor:grab;touch-action:none;box-shadow:0 0 40px rgba(200,82,107,.15);
  }
  .crop-stage:active { cursor:grabbing; }
  .crop-img { position:absolute;top:0;left:0;transform-origin:0 0;pointer-events:none;user-select:none;-webkit-user-drag:none; }
  .crop-hint { font-family:'Cormorant Garamond',serif;font-size:.72rem;color:rgba(249,240,232,.38);letter-spacing:.05em;text-align:center; }
  .crop-zoom { display:flex;align-items:center;gap:.8rem; }
  .crop-zoom label { font-family:'Cormorant Garamond',serif;font-size:.72rem;color:var(--rose-pale);opacity:.65;letter-spacing:.1em; }
  .crop-zoom input[type=range] { -webkit-appearance:none;width:150px;height:2px;background:rgba(200,82,107,.3);border-radius:2px;outline:none;cursor:pointer; }
  .crop-zoom input[type=range]::-webkit-slider-thumb { -webkit-appearance:none;width:16px;height:16px;border-radius:50%;background:var(--rose-light);cursor:pointer;box-shadow:0 0 8px rgba(200,82,107,.6); }
  .crop-btns { display:flex;gap:.8rem; }
  .crop-btn { font-family:'Cormorant Garamond',serif;font-size:.78rem;letter-spacing:.14em;text-transform:uppercase;padding:.55rem 1.6rem;border-radius:999px;cursor:pointer;border:none;transition:all .25s; }
  .crop-btn.cancel { background:rgba(255,255,255,.05);color:rgba(249,240,232,.45);border:1px solid rgba(255,255,255,.1); }
  .crop-btn.cancel:hover { background:rgba(255,255,255,.1);color:rgba(249,240,232,.7); }
  .crop-btn.confirm { background:var(--rose);color:var(--cream);box-shadow:0 0 18px rgba(200,82,107,.4); }
  .crop-btn.confirm:hover { background:var(--rose-light);box-shadow:0 0 24px rgba(200,82,107,.6); }
`;
