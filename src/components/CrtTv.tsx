"use client";

import { useEffect, useMemo, useRef, useState } from "react";

interface CrtTvProps {
  src: string;
  poster?: string;
}

const fallbackPoster =
  "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='640' height='800' viewBox='0 0 640 800'><defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop stop-color='%23090f17' offset='0'/><stop stop-color='%23060b12' offset='1'/></linearGradient></defs><rect width='640' height='800' fill='url(%23g)'/><path d='M120 120 L520 90 L500 680 L140 730 Z' fill='none' stroke='%2392ff6f' stroke-width='2' stroke-opacity='0.2'/></svg>";

/**
 * Cinematic CRT TV with cracked glass, scanlines, noise, RGB fringe, and parallax/flicker.
 * Drop an mp4 into /public and pass its path to `src`. Poster is optional.
 */
export function CrtTv({ src, poster }: CrtTvProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFlicker, setIsFlicker] = useState(false);

  const memoPoster = useMemo(() => poster ?? fallbackPoster, [poster]);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    let frame = 0;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handleMove = (event: MouseEvent) => {
      const rect = node.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      targetY = x * 6;
      targetX = y * -6;

      if (!frame) {
        frame = window.requestAnimationFrame(updateTilt);
      }
    };

    const updateTilt = () => {
      currentX += (targetX - currentX) * 0.08;
      currentY += (targetY - currentY) * 0.08;
      node.style.transform = `rotateX(${currentX.toFixed(2)}deg) rotateY(${currentY.toFixed(2)}deg) translateZ(0)`;
      frame = 0;
    };

    window.addEventListener("mousemove", handleMove);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      if (frame) window.cancelAnimationFrame(frame);
      node.style.transform = "";
    };
  }, []);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setIsFlicker(true);
      window.setTimeout(() => setIsFlicker(false), 140);
    }, 3200 + Math.random() * 1400);

    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative aspect-[4/5] w-full max-w-[520px] overflow-hidden rounded-[32px] border border-white/10 bg-gradient-to-br from-[#0c1118] via-[#05070a] to-[#0c0f15] p-4 shadow-[0_30px_120px_-50px_rgba(146,255,111,0.55)] transition-transform duration-500"
      style={{
        boxShadow:
          "0 25px 70px -40px rgba(146, 255, 111, 0.45), 0 30px 80px -45px rgba(75, 225, 255, 0.35)",
      }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[28px] border border-white/10 bg-gradient-to-b from-white/4 via-transparent to-[#92ff6f14]" />

      <div className="relative h-full w-full overflow-hidden rounded-[24px] border border-white/10 bg-black/80">
        <div className="absolute inset-0 z-10 opacity-70 mix-blend-screen" aria-hidden>
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(0deg, rgba(0,0,0,0.15) 0, rgba(0,0,0,0.15) 1px, transparent 1px, transparent 3px)",
              backgroundSize: "100% 4px",
              animation: "scanline 12s linear infinite",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "linear-gradient(120deg, rgba(146,255,111,0.08), rgba(75,225,255,0.12))",
              mixBlendMode: "screen",
              filter: "blur(18px)",
            }}
          />
        </div>

        <div
          className="absolute inset-0 z-20 opacity-55"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 30%, rgba(146,255,111,0.15), transparent 35%), radial-gradient(ellipse at 80% 70%, rgba(75,225,255,0.12), transparent 40%)",
            mixBlendMode: "screen",
          }}
        />

        <div
          className="absolute inset-0 z-20 opacity-35"
          aria-hidden
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.08) 0, rgba(255,255,255,0.02) 40%, transparent 65%)",
            mixBlendMode: "overlay",
          }}
        />

        <div
          className="absolute inset-0 z-30 pointer-events-none opacity-40"
          aria-hidden
          style={{
            backgroundImage:
              "linear-gradient(135deg, transparent 35%, rgba(255,255,255,0.08) 38%, transparent 42%), linear-gradient(225deg, transparent 50%, rgba(146,255,111,0.12) 53%, transparent 57%)",
            mixBlendMode: "screen",
          }}
        />

        <div
          className="absolute inset-0 z-30 pointer-events-none opacity-25"
          aria-hidden
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.32'/%3E%3C/svg%3E\")",
            animation: "noiseShift 1.2s steps(2) infinite",
            mixBlendMode: "soft-light",
          }}
        />

        <div
          className="absolute inset-0 z-30 pointer-events-none opacity-30"
          aria-hidden
          style={{
            backgroundImage: "url('/crack.png')",
            backgroundSize: "cover",
            mixBlendMode: "screen",
          }}
        />

        <video
          className={`relative z-0 h-full w-full object-cover ${isFlicker ? "brightness-125 contrast-115 saturate-125" : "brightness-105 contrast-105"} transition duration-150`}
          src={src}
          poster={memoPoster}
          autoPlay
          muted
          loop
          playsInline
        />

        <div
          className="pointer-events-none absolute inset-0 z-40 opacity-45"
          aria-hidden
          style={{
            boxShadow:
              "2px 0 22px rgba(146,255,111,0.25), -2px 0 22px rgba(75,225,255,0.25)",
            mixBlendMode: "screen",
          }}
        />
      </div>

      <div className="absolute -left-2 top-3 flex items-center gap-2 rounded-full border border-[#92ff6f]/40 bg-black/70 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#92ff6f] shadow-[0_0_24px_rgba(146,255,111,0.45)]">
        <span className="h-2 w-2 animate-pulse rounded-full bg-[#92ff6f]" />
        On Air
      </div>

      <div className="pointer-events-none absolute inset-0 rounded-[32px] border border-white/5 opacity-70" />
    </div>
  );
}
