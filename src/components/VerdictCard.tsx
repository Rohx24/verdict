"use client";

import { useMemo, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";

export type Verdict = {
  title: string;
  editorsCall: string;
  bestHook: { timestampSec: number; reasoning: string };
  vibe: "HYPE" | "CINEMATIC" | "DARK" | "COMEDY";
  editStrategy: string[];
  caption: string;
  hashtags: string[];
  avoid: string;
  confidence: number;
};

export type VisionObservation = {
  whatHappens: string;
  sceneType: string;
  notableMoments: { t: number; desc: string }[];
  vibe: "HYPE" | "CINEMATIC" | "DARK" | "COMEDY";
};

interface VerdictCardProps {
  verdict?: Verdict | null;
  vision?: VisionObservation | null;
  loading?: boolean;
}

export function VerdictCard({ verdict, vision, loading }: VerdictCardProps) {
  const [copied, setCopied] = useState(false);

  const timecode = useMemo(() => {
    if (!verdict) return "00:00";
    const minutes = Math.floor(verdict.bestHook.timestampSec / 60)
      .toString()
      .padStart(2, "0");
    const seconds = Math.floor(verdict.bestHook.timestampSec % 60)
      .toString()
      .padStart(2, "0");
    return `${minutes}:${seconds}`;
  }, [verdict]);

  const copyCaption = async () => {
    if (!verdict) return;
    await navigator.clipboard.writeText(verdict.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  if (!verdict) {
    return (
      <Card className="relative overflow-hidden border-white/10 bg-white/[0.02]">
        <CardContent className="flex h-full min-h-[360px] flex-col items-center justify-center gap-4 text-center text-white/70">
          <div className="h-10 w-10 animate-pulse rounded-full border border-[#92ff6f]/50 bg-[#92ff6f]/10" />
          <p className="text-lg font-semibold text-white">
            Upload a clip. Receive judgment.
          </p>
          <p className="text-sm text-white/60">
            The terminal stays cold until you submit.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="relative">
      <Card className="relative overflow-hidden border-white/10 bg-white/[0.04] shadow-[0_35px_120px_-70px_rgba(146,255,111,0.7)]">
        <CardHeader className="flex flex-col gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/70">
            <span className="rounded-full border border-[#92ff6f]/40 bg-[#92ff6f]/10 px-3 py-1 text-[#92ff6f]">
              Live verdict
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1">
              {verdict.vibe}
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <CardTitle className="text-2xl text-white">{verdict.title}</CardTitle>
            <div className="flex items-center gap-3">
              <span className="text-xs uppercase tracking-[0.18em] text-white/60">
                Confidence
              </span>
              <div className="h-2 w-28 overflow-hidden rounded-full border border-white/10 bg-white/5">
                <div
                  className="h-full bg-gradient-to-r from-[#6ef3b8] via-[#92ff6f] to-[#4be1ff] transition-all"
                  style={{ width: `${verdict.confidence}%` }}
                />
              </div>
              <span className="text-sm font-semibold text-white">
                {Math.round(verdict.confidence)}%
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 text-white">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#92ff6f]">
              Observed
            </p>
            <p className="mt-2 text-sm text-white/80">
              {vision?.whatHappens ?? "Awaiting observation..."}
            </p>
            {vision?.notableMoments?.length ? (
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/60">
                {vision.notableMoments.map((m, idx) => (
                  <span
                    key={`${m.t}-${idx}`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
                  >
                    {`${Math.round(m.t)}s — ${m.desc}`}
                  </span>
                ))}
              </div>
            ) : null}
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-[#92ff6f]/40 bg-[#0b120f]/70 px-4 py-5">
            <div className="absolute left-3 top-3 h-2 w-2 animate-ping rounded-full bg-[#92ff6f]" />
            <p
              className={cn(
                "text-2xl font-semibold uppercase tracking-[0.08em] text-[#92ff6f] drop-shadow-lg",
                "animate-stamp",
              )}
            >
              Editor&apos;s Call
            </p>
            <p className="mt-2 text-lg font-semibold text-white">
              {verdict.editorsCall}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#92ff6f]">
              Best Hook — {timecode}
            </p>
            <p className="mt-2 text-base text-white/80">{verdict.bestHook.reasoning}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-[#92ff6f]">
              Edit Strategy
            </p>
            <ul className="mt-2 space-y-2 text-sm text-white/80">
              {verdict.editStrategy.map((line) => (
                <li key={line} className="flex gap-2">
                  <span className="text-[#92ff6f]">•</span>
                  <span>{line}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.18em] text-[#92ff6f]">
                Ready-to-post caption
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={copyCaption}
                className="hover:-translate-y-[1px]"
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
            <p className="mt-2 text-base text-white/80">{verdict.caption}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {verdict.hashtags.map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-white/80"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-4 shadow-[0_0_20px_-10px_rgba(239,68,68,0.8)]">
            <p className="text-xs uppercase tracking-[0.18em] text-red-200">
              What not to do
            </p>
            <p className="mt-2 text-base font-semibold text-red-100">{verdict.avoid}</p>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="pointer-events-none absolute inset-0 rounded-3xl border border-white/10 bg-black/30 backdrop-blur-sm">
          <div className="absolute inset-0 bg-black/30 opacity-60" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 animate-ping rounded-full border border-[#92ff6f]/60 bg-[#92ff6f]/20" />
          </div>
        </div>
      )}
    </div>
  );
}
