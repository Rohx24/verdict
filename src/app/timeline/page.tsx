"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { extractFrames, type SampledFrame } from "@/lib/extractFrames";

type Platform = "reels" | "tiktok";
type Vibe = "HYPE" | "CINEMATIC" | "COMEDY" | "DARK";

type Pointer = {
  t: number;
  title: string;
  instruction: string;
  category: "caption" | "transition" | "sfx" | "speed" | "zoom" | "color";
  intensity: 1 | 2 | 3;
};

const vibeOptions: Vibe[] = ["HYPE", "CINEMATIC", "COMEDY", "DARK"];
const platformOptions: Platform[] = ["reels", "tiktok"];

export default function TimelinePage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [brief, setBrief] = useState("Make it hype with meme captions.");
  const [platform, setPlatform] = useState<Platform>("reels");
  const [vibe, setVibe] = useState<Vibe>("HYPE");
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [frames, setFrames] = useState<SampledFrame[]>([]);
  const [sampling, setSampling] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pointers, setPointers] = useState<Pointer[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [videoDescription, setVideoDescription] = useState("");

  // Prefill from studio via sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("timelineSource");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as {
        videoUrl?: string;
        label?: string;
        platform?: Platform | null;
        goal?: string | null;
      };
      if (parsed.videoUrl) {
        setVideoUrl(parsed.videoUrl);
      }
      if (parsed.platform) {
        setPlatform(parsed.platform);
      }
      // goal is ignored here; timeline uses vibe instead
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    let url: string | null = null;
    if (file) {
      url = URL.createObjectURL(file);
      setVideoUrl(url);
      setVideoDescription("");
    }
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [file]);

  // Capture duration when metadata loads
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onLoaded = () => setDurationSec(video.duration || null);
    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, [videoUrl]);

  // Sample frames when videoUrl changes
  useEffect(() => {
    if (!videoUrl) {
      setFrames([]);
      setDurationSec(null);
      return;
    }
    let cancelled = false;
    const run = async () => {
      setSampling(true);
      setError(null);
      try {
        const res = await extractFrames(videoUrl, 10);
        if (cancelled) return;
        setFrames(res.frames);
        setDurationSec(res.durationSec);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "Could not sample frames. Try a local upload.";
        setError(msg);
        setFrames([]);
      } finally {
        if (!cancelled) setSampling(false);
      }
    };
    run();
    return () => {
      cancelled = true;
    };
  }, [videoUrl]);

  const canGenerate = useMemo(() => {
    return Boolean(durationSec && brief.trim().length > 3 && (frames.length > 0 || videoDescription));
  }, [brief, durationSec, frames.length, videoDescription]);

  const handleGenerate = async () => {
    if (!durationSec || !canGenerate) return;
    setLoading(true);
    setError(null);
    setPointers([]);
    setSummary(null);
    try {
      const payload = {
        platform,
        vibe,
        brief,
        durationSec,
        frames: frames.length
          ? frames.map((f) => ({ t: f.t, jpgBase64: f.jpgBase64 }))
          : undefined,
        videoDescription: frames.length ? undefined : videoDescription || undefined,
      };
      const res = await fetch("/api/pointers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data.pointers) {
        throw new Error(data.error || "Failed to generate pointers");
      }
      setPointers(data.pointers as Pointer[]);
      setSummary(data.summary as string);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handlePointerClick = (idx: number, time: number) => {
    setSelectedIdx(idx);
    const video = videoRef.current;
    if (video && !Number.isNaN(time)) {
      video.currentTime = time;
      video.play().catch(() => undefined);
    }
  };

  const copyShotList = async () => {
    const text = pointers
      .map(
        (p) =>
          `${formatTime(p.t)} — ${p.title} [${p.category}] (x${p.intensity})\n${p.instruction}`,
      )
      .join("\n\n");
    await navigator.clipboard.writeText(text);
  };

  const markers = useMemo(() => {
    if (!durationSec || !pointers.length) return [];
    return pointers.map((p, idx) => ({
      left: `${Math.min((p.t / durationSec) * 100, 100)}%`,
      active: selectedIdx === idx,
    }));
  }, [durationSec, pointers, selectedIdx]);

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 md:px-10 lg:px-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#92ff6f]">
            Timeline Pointers
          </p>
          <h1 className="text-4xl font-semibold text-white">Annotate the cut.</h1>
          <p className="text-sm text-white/70">
            Drop a clip, add a brief, and get timestamped edit pointers you can jump to.
          </p>
        </div>
        <Button variant="outline" size="sm" href="/studio">
          Back to Studio
        </Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <Card className="overflow-hidden border-white/10 bg-white/[0.03]">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white">Video & Timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <label className="block text-xs uppercase tracking-[0.18em] text-[#92ff6f]">
                Upload video
              </label>
              <input
                type="file"
                accept=".mp4,.mov,.webm"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f && f.size > 80 * 1024 * 1024) {
                    setError("Max file size is 80MB.");
                    return;
                  }
                  setFile(f ?? null);
                  setPointers([]);
                  setSummary(null);
                }}
                className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80"
              />
            </div>

            {!frames.length && (
              <div className="space-y-2">
                <label className="block text-xs uppercase tracking-[0.18em] text-[#92ff6f]">
                  Describe the video (fallback)
                </label>
                <textarea
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white/80"
                  placeholder="e.g., crowd at a concert, handheld shots, neon lights"
                />
              </div>
            )}

            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/40">
              {videoUrl ? (
                <video
                  ref={videoRef}
                  src={videoUrl}
                  controls
                  className="w-full rounded-t-3xl"
                />
              ) : (
                <div className="flex h-48 items-center justify-center text-white/60">
                  Upload a video to preview
                </div>
              )}
              <div className="relative h-10 bg-white/5">
                <div className="absolute inset-x-6 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/10" />
                {markers.map((m, idx) => (
                  <button
                    key={idx}
                    className={`absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full transition ${
                      m.active
                        ? "bg-[#92ff6f] shadow-[0_0_12px_rgba(146,255,111,0.8)]"
                        : "bg-white/60 hover:bg-[#92ff6f]"
                    }`}
                    style={{ left: m.left }}
                    onClick={() => handlePointerClick(idx, pointers[idx].t)}
                    aria-label={`Jump to ${formatTime(pointers[idx].t)}`}
                  />
                ))}
              </div>
              <div className="flex items-center justify-between px-4 py-2 text-xs text-white/60">
                <span>Frames: {sampling ? "Sampling…" : frames.length}</span>
                {durationSec ? <span>Duration: {formatTime(durationSec)}</span> : null}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white">Creative Brief</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 md:grid-cols-2">
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-[#92ff6f]">
                  Platform
                </span>
                <select
                  value={platform}
                  onChange={(e) => setPlatform(e.target.value as Platform)}
                  className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-white"
                >
                  {platformOptions.map((p) => (
                    <option key={p} value={p}>
                      {p === "reels" ? "Instagram Reels" : "TikTok"}
                    </option>
                  ))}
                </select>
              </label>
              <label className="space-y-2">
                <span className="text-xs uppercase tracking-[0.18em] text-[#92ff6f]">
                  Vibe
                </span>
                <select
                  value={vibe}
                  onChange={(e) => setVibe(e.target.value as Vibe)}
                  className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-white"
                >
                  {vibeOptions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="space-y-2">
              <label className="text-xs uppercase tracking-[0.18em] text-[#92ff6f]">
                Creative brief
              </label>
              <textarea
                value={brief}
                onChange={(e) => setBrief(e.target.value)}
                rows={4}
                className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-white"
                placeholder="e.g., Make it hype, add meme captions, fast cuts."
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button size="lg" onClick={handleGenerate} disabled={!canGenerate || loading || sampling}>
                {loading ? "Generating…" : "Generate pointers"}
              </Button>
              <Button
                variant="outline"
                size="lg"
                onClick={copyShotList}
                disabled={!pointers.length}
                title="Copy shot list"
              >
                Copy Shot List
              </Button>
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            ) : null}

            {summary ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-sm text-white/80">
                {summary}
              </div>
            ) : null}

            <div className="space-y-3">
              {pointers.map((p, idx) => (
                <button
                  key={`${p.title}-${idx}`}
                  onClick={() => handlePointerClick(idx, p.t)}
                  className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
                    selectedIdx === idx
                      ? "border-[#92ff6f]/70 bg-[#92ff6f]/10"
                      : "border-white/10 bg-black/30 hover:border-[#92ff6f]/50"
                  }`}
                >
                  <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-white/60">
                    <span>{formatTime(p.t)}</span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px]">
                      {p.category} · x{p.intensity}
                    </span>
                  </div>
                  <p className="mt-1 text-lg font-semibold text-white">{p.title}</p>
                  <p className="text-sm text-white/70">{p.instruction}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.14em] text-white/60">
                    <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1">
                      {p.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

function formatTime(t: number) {
  const minutes = Math.floor(t / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(t % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}
