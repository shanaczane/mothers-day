"use client";

import { useEffect, useState } from "react";

interface Petal {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  rotate: number;
}

export default function Home() {
  const [petals, setPetals] = useState<Petal[]>([]);

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

  return (
    <>
      <style>{css}</style>

      <div className="bg-glow" />

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
          <div className="photo-wrap">
            <div className="frame-ring">
              <div className="frame-inner">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/mom.jpg" alt="Inay" className="photo" />
              </div>
            </div>
            <span className="fr" style={{ top: "-12px", left: "14px", animationDelay: "0s" }}>🌹</span>
            <span className="fr" style={{ top: "-12px", right: "14px", animationDelay: "1s" }}>🌸</span>
            <span className="fr" style={{ bottom: "-4px", left: "2px", animationDelay: "2s" }}>🌺</span>
            <span className="fr" style={{ bottom: "-4px", right: "2px", animationDelay: "0.5s" }}>🌷</span>
          </div>

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
              <span className="hl">Work hard po ako para sa inyo at si Tatay.</span>
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

  .photo-wrap { position:relative;margin-bottom:1.8rem;opacity:0;animation:fadeDown 1s ease .4s forwards; }
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
  .photo { width:100%;height:100%;object-fit:cover;display:block; }

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
`;
