"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { UploadPanel } from "@/components/UploadPanel";
import { VerdictCard, type Verdict, type VisionObservation } from "@/components/VerdictCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "../../../lib/supabaseClient";

type Platform = "reels" | "tiktok" | null;
type Goal = "viral" | "cinematic" | "funny" | null;

export const dynamic = "force-dynamic";

interface SampledFrames {
  frames: string[];
  durationSec: number;
}

async function sampleFramesFromSource(src: string): Promise<SampledFrames> {
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.preload = "auto";
  video.src = src;

  await new Promise<void>((resolve, reject) => {
    const onLoaded = () => resolve();
    const onError = () => reject(new Error("Unable to load video for sampling."));
    video.addEventListener("loadedmetadata", onLoaded, { once: true });
    video.addEventListener("error", onError, { once: true });
  });

  const duration = video.duration || 0;
  const frameCount = 10;
  const start = duration * 0.05;
  const end = duration * 0.95;
  const step = frameCount > 1 ? (end - start) / (frameCount - 1) : 0;
  const times = Array.from({ length: frameCount }, (_, i) => start + i * step);

  const canvas = document.createElement("canvas");
  const targetWidth = 512;
  const ratio = video.videoHeight && video.videoWidth ? video.videoHeight / video.videoWidth : 9 / 16;
  canvas.width = targetWidth;
  canvas.height = Math.round(targetWidth * ratio);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available for frame sampling.");

  const frames: string[] = [];

  for (const t of times) {
    await new Promise<void>((resolve, reject) => {
      const onSeeked = () => resolve();
      const onError = () => reject(new Error("Seek failed while sampling frames."));
      video.currentTime = Math.min(Math.max(t, 0), Math.max(duration - 0.05, 0));
      video.addEventListener("seeked", onSeeked, { once: true });
      video.addEventListener("error", onError, { once: true });
    });

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    try {
      const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
      const base64 = dataUrl.replace("data:image/jpeg;base64,", "");
      frames.push(base64);
    } catch {
      throw new Error(
        "Frame extraction blocked (CORS). Upload a local file or use a link that allows cross-origin access.",
      );
    }
  }

  // Reduce if payload is too large
  const totalChars = frames.reduce((acc, f) => acc + f.length, 0);
  if (totalChars > 1_500_000 && frames.length > 6) {
    return { frames: frames.slice(0, 6), durationSec: duration };
  }

  return { frames: frames.slice(0, 10), durationSec: duration };
}

export default function StudioPage() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [videoLink, setVideoLink] = useState("");
  const [platform, setPlatform] = useState<Platform>(null);
  const [goal, setGoal] = useState<Goal>(null);
  const [loading, setLoading] = useState(false);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [vision, setVision] = useState<VisionObservation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [frames, setFrames] = useState<string[]>([]);
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [sampling, setSampling] = useState(false);
  const [sampleError, setSampleError] = useState<string | null>(null);
  const [sourceUrl, setSourceUrl] = useState<string | null>(null);
  const [lastVideoLabel, setLastVideoLabel] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);

  useEffect(() => {
    let url: string | null = null;
    if (file) {
      url = URL.createObjectURL(file);
    } else if (videoLink) {
      url = videoLink;
    }
    setSourceUrl(url);
    setLastVideoLabel(file?.name ?? (videoLink ? "Linked video" : null));
    return () => {
      if (url && file) URL.revokeObjectURL(url);
    };
  }, [file, videoLink]);

  useEffect(() => {
    if (!sourceUrl) {
      setFrames([]);
      setDurationSec(null);
      return;
    }
    let cancelled = false;
    const sample = async () => {
      setSampling(true);
      setSampleError(null);
      try {
        const result = await sampleFramesFromSource(sourceUrl);
        if (cancelled) return;
        setFrames(result.frames);
        setDurationSec(result.durationSec);
      } catch (err) {
        const msg =
          err instanceof Error
            ? err.message
            : "Could not sample frames. Try another video or upload locally.";
        setSampleError(msg);
        setFrames([]);
        setDurationSec(null);
      } finally {
        if (!cancelled) setSampling(false);
      }
    };
    sample();
    return () => {
      cancelled = true;
    };
  }, [sourceUrl]);

  const canGenerate = useMemo(() => {
    return Boolean(platform && frames.length > 0);
  }, [platform, frames.length]);

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError(null);
    setVerdict(null);
    setVision(null);

    try {
      const payload = {
        platform: platform === "reels" ? "reels" : "tiktok",
        goal: goal ?? undefined,
        filename: file?.name,
        durationSec: durationSec ?? undefined,
        frames,
      };

      const res = await fetch("/api/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.verdict) {
        throw new Error(data.error || "Failed to generate verdict");
      }

      setVerdict(data.verdict as Verdict);
      setVision((data.vision as VisionObservation) ?? null);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.replace("/auth");
  };

  const handleTimelineRedirect = () => {
    if (!sourceUrl) return;
    const payload = {
      videoUrl: sourceUrl,
      label: lastVideoLabel ?? "Studio video",
      platform,
      goal,
    };
    if (typeof window !== "undefined") {
      sessionStorage.setItem("timelineSource", JSON.stringify(payload));
    }
    router.push("/timeline");
  };

  const handleResample = () => {
    if (!sourceUrl) return;
    setFrames([]);
    setDurationSec(null);
    setSampleError(null);
    setSampling(true);
    sampleFramesFromSource(sourceUrl)
      .then((result) => {
        setFrames(result.frames);
        setDurationSec(result.durationSec);
      })
      .catch((err) => {
        const msg =
          err instanceof Error
            ? err.message
            : "Could not sample frames. Try another video or upload locally.";
        setSampleError(msg);
        setFrames([]);
        setDurationSec(null);
      })
      .finally(() => setSampling(false));
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-8 px-6 py-10 md:px-10 lg:px-12">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.24em] text-[#92ff6f]">
            Editor&apos;s Verdict
          </p>
          <h1 className="text-4xl font-semibold text-white">Judgment, not presets.</h1>
          <p className="text-sm text-white/60">
            Upload once. Get one decisive verdict grounded in your actual frames.
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/80">
          <div className="flex flex-col">
            <span className="text-xs uppercase tracking-[0.14em] text-white/50">Signed in</span>
            <span className="font-semibold text-white">{email ?? "…"}</span>
          </div>
          <Button variant="outline" size="sm" href="/editor" className="hover:-translate-y-[1px]">
            Editor
          </Button>
          <Button variant="outline" size="sm" href="/timeline" className="hover:-translate-y-[1px]">
            Timeline
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSignOut}
            className="hover:-translate-y-[1px]"
          >
            Sign out
          </Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-2 items-start">
        <div className="space-y-4">
          <Card className="flex flex-col gap-3 border-white/10 bg-white/[0.04] px-4 py-4 sticky top-4 z-10">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#92ff6f]">Launch</p>
                <p className="text-sm text-white/70">
                  Generate a single authoritative verdict grounded in the sampled frames.
                </p>
                {sampleError ? (
                  <p className="mt-1 text-xs text-red-200">{sampleError}</p>
                ) : null}
              </div>
              <Button
                size="lg"
                onClick={handleGenerate}
                disabled={!canGenerate || loading || sampling}
                className="min-w-[180px]"
              >
                {loading ? "Analyzing…" : "Generate Verdict"}
              </Button>
            </div>
          </Card>

          <UploadPanel
            file={file}
            videoLink={videoLink}
            platform={platform}
            goal={goal}
            framesCount={frames.length}
            sampling={sampling}
            onFileChange={(f) => {
              setFile(f);
              setVideoLink("");
              setVerdict(null);
              setVision(null);
            }}
            onLinkChange={(link) => {
              setVideoLink(link);
              if (link) setFile(null);
              setVerdict(null);
              setVision(null);
            }}
            onPlatformChange={setPlatform}
            onGoalChange={setGoal}
            onResample={handleResample}
          />

          {error ? (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              {error}
            </div>
          ) : null}
        </div>

        <div className="space-y-3 min-h-full">
          <VerdictCard verdict={verdict} vision={vision} loading={loading} />
          <Card className="flex flex-col gap-3 border-white/10 bg-white/[0.04] px-4 py-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#92ff6f]">
                  Timeline
                </p>
                <p className="text-sm text-white/70">
                  Jump to timeline with this video to place edit pointers.
                </p>
              </div>
              <Button
                size="lg"
                variant="outline"
                onClick={handleTimelineRedirect}
                disabled={!sourceUrl}
              >
                Open Timeline
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </main>
  );
}
