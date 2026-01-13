"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFFmpeg } from "@/lib/ffmpegClient";

type Marker = {
  t: number;
  title: string;
  instruction: string;
  category: string;
};

export default function EditorPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [durationSec, setDurationSec] = useState<number>(0);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioStartSec, setAudioStartSec] = useState(0);
  const [audioTrimInSec, setAudioTrimInSec] = useState(0);
  const [audioTrimOutSec, setAudioTrimOutSec] = useState<number>(9999);

  const [markers, setMarkers] = useState<Marker[]>([]);
  const [loadingExport, setLoadingExport] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const [draggingAudio, setDraggingAudio] = useState(false);
  const [dragStartX, setDragStartX] = useState(0);
  const [startStartSec, setStartStartSec] = useState(0);

  // auto-fill from studio video if sessionStorage present
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = sessionStorage.getItem("timelineSource");
    if (stored && !videoUrl) {
      try {
        const parsed = JSON.parse(stored) as { videoUrl?: string };
        if (parsed.videoUrl) setVideoUrl(parsed.videoUrl);
      } catch {
        // ignore
      }
    }
  }, [videoUrl]);

  useEffect(() => {
    if (!videoFile) return;
    const url = URL.createObjectURL(videoFile);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoFile]);

  useEffect(() => {
    if (!audioFile) return;
    const url = URL.createObjectURL(audioFile);
    setAudioUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [audioFile]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onLoaded = () => setDurationSec(video.duration || 0);
    video.addEventListener("loadedmetadata", onLoaded);
    return () => video.removeEventListener("loadedmetadata", onLoaded);
  }, [videoUrl]);

  // Sync audio with video playback
  useEffect(() => {
    const video = videoRef.current;
    const audio = audioRef.current;
    if (!video || !audio) return;
    const onTime = () => {
      if (!audioUrl || !audioFile) return;
      const desired = video.currentTime - audioStartSec + audioTrimInSec;
      if (desired < audioTrimInSec) {
        audio.pause();
        return;
      }
      if (Math.abs(audio.currentTime - desired) > 0.25) {
        audio.currentTime = desired;
      }
      if (!video.paused && audio.paused) audio.play().catch(() => undefined);
    };
    const onPlay = () => {
      if (audioUrl && desiredAudioTime() >= audioTrimInSec) {
        audio.play().catch(() => undefined);
      }
    };
    const onPause = () => audio.pause();

    const desiredAudioTime = () =>
      video.currentTime - audioStartSec + audioTrimInSec;

    video.addEventListener("timeupdate", onTime);
    video.addEventListener("seeked", onTime);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    return () => {
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("seeked", onTime);
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
    };
  }, [audioUrl, audioFile, audioStartSec, audioTrimInSec]);

  // Fetch markers (mock or api/pointers)
  useEffect(() => {
    const fetchMarkers = async () => {
      try {
        const res = await fetch("/api/pointers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            platform: "reels",
            vibe: "HYPE",
            brief: "Quick pass for pointers",
            durationSec: Math.max(durationSec || 30, 30),
            videoDescription: "Generic crowd and energy",
          }),
        });
        const data = await res.json();
        if (data?.pointers) setMarkers(data.pointers);
      } catch {
        setMarkers([
          { t: 2, title: "Intro hit", instruction: "Punchy caption", category: "caption" },
          { t: 6, title: "Zoom pop", instruction: "Micro zoom", category: "zoom" },
          { t: 10, title: "Beat drop", instruction: "Add whoosh + cut", category: "sfx" },
        ]);
      }
    };
    fetchMarkers();
  }, [durationSec]);

  const pixelsPerSecond = 30;
  const audioBlockWidth = useMemo(() => {
    const audio = audioRef.current;
    const len = audio?.duration ?? 8;
    const duration = Math.max(4, len - audioTrimInSec - Math.max(0, len - audioTrimOutSec));
    return duration * pixelsPerSecond;
  }, [audioTrimInSec, audioTrimOutSec]);

  const handleAudioDragStart = (e: React.MouseEvent) => {
    setDraggingAudio(true);
    setDragStartX(e.clientX);
    setStartStartSec(audioStartSec);
  };
  const handleAudioDrag = (e: React.MouseEvent) => {
    if (!draggingAudio) return;
    const deltaPx = e.clientX - dragStartX;
    const deltaSec = deltaPx / pixelsPerSecond;
    setAudioStartSec(Math.max(0, startStartSec + deltaSec));
  };
  const handleAudioDragEnd = () => setDraggingAudio(false);

  const timelineWidth = useMemo(() => {
    return Math.max(600, (durationSec || 30) * pixelsPerSecond);
  }, [durationSec]);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60)
      .toString()
      .padStart(2, "0");
    const s = Math.floor(t % 60)
      .toString()
      .padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleExport = async () => {
    if (!videoFile || !audioFile) {
      setMessage("Upload video and audio first.");
      return;
    }
    setLoadingExport(true);
    setMessage("Loading renderer…");
    setProgress(null);
    try {
      const ffmpeg = await getFFmpeg();
      ffmpeg.on("progress", ({ ratio }: { ratio?: number }) => {
        setProgress(Math.min(100, Math.round((ratio || 0) * 100)));
      });
      const { fetchFile } = await import("@ffmpeg/util");
      ffmpeg.writeFile("input.mp4", await fetchFile(videoFile));
      ffmpeg.writeFile("input-audio", await fetchFile(audioFile));

      const hasTrim = audioTrimOutSec > audioTrimInSec;
      const delayMs = Math.max(0, Math.round(audioStartSec * 1000));

      const args = [
        "-i",
        "input.mp4",
        "-i",
        "input-audio",
      ];

      const filters: string[] = [];
      if (hasTrim && audioTrimOutSec < 9999) {
        filters.push(
          `[1:a]atrim=start=${audioTrimInSec}:end=${audioTrimOutSec},asetpts=PTS-STARTPTS,adelay=${delayMs}|${delayMs}[aud]`,
        );
      } else {
        filters.push(`[1:a]adelay=${delayMs}|${delayMs},asetpts=PTS-STARTPTS[aud]`);
      }
      filters.push(`[0:a][aud]amix=inputs=2:duration=first:dropout_transition=2[mix]`);

      args.push(
        "-filter_complex",
        filters.join(";"),
        "-map",
        "0:v",
        "-map",
        "[mix]",
        "-c:v",
        "copy",
        "-c:a",
        "aac",
        "-shortest",
        "out.mp4",
      );

      try {
        await ffmpeg.exec(args);
      } catch {
        // fallback re-encode video
        await ffmpeg.exec([
          "-i",
          "input.mp4",
          "-i",
          "input-audio",
          "-filter_complex",
          filters.join(";"),
          "-map",
          "0:v",
          "-map",
          "[mix]",
          "-c:v",
          "libx264",
          "-preset",
          "veryfast",
          "-c:a",
          "aac",
          "-shortest",
          "out.mp4",
        ]);
      }

      const data = await ffmpeg.readFile("out.mp4");
      const blob = new Blob([data], { type: "video/mp4" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "edited.mp4";
      a.click();
      setMessage("Export complete.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Export failed.";
      setMessage(msg);
    } finally {
      setLoadingExport(false);
      setProgress(null);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-6 px-6 py-8 md:px-10 lg:px-12">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[#92ff6f]">Editor</p>
          <h1 className="text-3xl font-semibold text-white">Lightweight Mix + Timeline</h1>
          <p className="text-sm text-white/70">
            Upload video and audio, place the audio, and export with ffmpeg.wasm.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" href="/timeline">
            Timeline
          </Button>
          <Button variant="outline" onClick={() => document.getElementById("video-input")?.click()}>
            Upload Video
          </Button>
          <Button variant="outline" onClick={() => document.getElementById("audio-input")?.click()}>
            Upload Audio
          </Button>
          <Button onClick={handleExport} disabled={loadingExport || !videoFile || !audioFile}>
            {loadingExport ? "Exporting…" : "Export MP4"}
          </Button>
        </div>
      </header>

      <input
        id="video-input"
        type="file"
        accept=".mp4,.mov,.webm"
        className="hidden"
        onChange={(e) => setVideoFile(e.target.files?.[0] ?? null)}
      />
      <input
        id="audio-input"
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={(e) => setAudioFile(e.target.files?.[0] ?? null)}
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] items-start">
        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white">Preview</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/40">
              {videoUrl ? (
                <video ref={videoRef} src={videoUrl} controls className="w-full" />
              ) : (
                <div className="flex h-48 items-center justify-center text-white/60">
                  Upload a video to preview
                </div>
              )}
              <audio ref={audioRef} src={audioUrl ?? undefined} />
            </div>
            <div className="flex gap-3 text-sm text-white/70">
              <span>Video: {videoFile?.name ?? "None"}</span>
              <span>Audio: {audioFile?.name ?? "None"}</span>
              {durationSec ? <span>Duration: {formatTime(durationSec)}</span> : null}
            </div>

            <div
              className="relative overflow-auto rounded-3xl border border-white/10 bg-black/30 p-4"
              ref={timelineRef}
            >
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/60 mb-2">
                <span className="w-16 text-right">Ruler</span>
                <div className="relative h-8 flex-1">
                  <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-white/10" />
                  {Array.from({ length: Math.ceil((durationSec || 30) / 2) }, (_, idx) => {
                    const i = idx;
                    return (
                      <div
                        key={i}
                        className="absolute top-0 flex h-full flex-col items-center text-[10px]"
                        style={{ left: `${(i * 2 * pixelsPerSecond) / timelineWidth * 100}%` }}
                      >
                        <span className="h-3 w-px bg-white/30" />
                        <span className="mt-1 text-white/50">{i * 2}s</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-3" style={{ minWidth: `${timelineWidth}px` }}>
                <TrackRow label="Video">
                  <div className="relative h-12 rounded-xl bg-gradient-to-r from-[#0f1a10] to-[#0c1219] border border-white/10">
                    {markers.map((m, idx) => (
                      <div
                        key={idx}
                        className="absolute top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-[#92ff6f] shadow-[0_0_12px_rgba(146,255,111,0.8)] cursor-pointer"
                        style={{ left: `${(m.t / (durationSec || 30)) * 100}%` }}
                        title={m.title}
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.currentTime = m.t;
                            videoRef.current.play().catch(() => undefined);
                          }
                        }}
                      />
                    ))}
                  </div>
                </TrackRow>

                <TrackRow label="Audio">
                  <div className="relative h-14 rounded-xl bg-gradient-to-r from-[#0f111a] to-[#0b0f14] border border-white/10">
                    {audioUrl ? (
                      <div
                        className="absolute top-1 left-0 flex h-12 items-center rounded-lg bg-gradient-to-r from-[#6ef3b8]/40 via-[#92ff6f]/30 to-[#4be1ff]/30 px-3 text-sm text-white shadow-[0_10px_40px_-20px_rgba(146,255,111,0.8)] cursor-grab active:cursor-grabbing"
                        style={{
                          width: `${audioBlockWidth}px`,
                          transform: `translateX(${audioStartSec * pixelsPerSecond}px)`,
                        }}
                        onMouseDown={handleAudioDragStart}
                        onMouseMove={handleAudioDrag}
                        onMouseUp={handleAudioDragEnd}
                        onMouseLeave={handleAudioDragEnd}
                      >
                        <div className="flex-1">
                          <p className="text-xs uppercase tracking-[0.14em] text-white/70">Audio</p>
                          <p className="text-xs text-white/80">Start: {formatTime(audioStartSec)}</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setAudioFile(null);
                            setAudioUrl(null);
                          }}
                        >
                          Delete
                        </Button>
                      </div>
                    ) : (
                      <div className="flex h-full items-center justify-center text-white/50 text-sm">
                        Upload audio to place it
                      </div>
                    )}
                  </div>
                </TrackRow>
              </div>
            </div>

            {audioUrl ? (
              <div className="grid gap-3 md:grid-cols-3">
                <label className="space-y-1 text-sm text-white/80">
                  Start offset (s)
                  <input
                    type="number"
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white"
                    value={audioStartSec}
                    onChange={(e) => setAudioStartSec(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </label>
                <label className="space-y-1 text-sm text-white/80">
                  Trim in (s)
                  <input
                    type="number"
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white"
                    value={audioTrimInSec}
                    onChange={(e) => setAudioTrimInSec(Math.max(0, parseFloat(e.target.value) || 0))}
                  />
                </label>
                <label className="space-y-1 text-sm text-white/80">
                  Trim out (s)
                  <input
                    type="number"
                    className="w-full rounded-lg border border-white/15 bg-black/40 px-3 py-2 text-white"
                    value={audioTrimOutSec}
                    onChange={(e) =>
                      setAudioTrimOutSec(Math.max(audioTrimInSec, parseFloat(e.target.value) || 0))
                    }
                  />
                </label>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/[0.03]">
          <CardHeader className="border-b border-white/10">
            <CardTitle className="text-white">AI Markers</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {markers.map((m, idx) => (
              <button
                key={idx}
                className="w-full rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-left hover:border-[#92ff6f]/50"
                onClick={() => {
                  if (videoRef.current) {
                    videoRef.current.currentTime = m.t;
                    videoRef.current.play().catch(() => undefined);
                  }
                }}
              >
                <div className="flex items-center justify-between text-xs uppercase tracking-[0.14em] text-white/60">
                  <span>{formatTime(m.t)}</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px]">
                    {m.category}
                  </span>
                </div>
                <p className="mt-1 text-lg font-semibold text-white">{m.title}</p>
                <p className="text-sm text-white/70">{m.instruction}</p>
              </button>
            ))}
          </CardContent>
        </Card>
      </div>

      {message ? (
        <div className="rounded-2xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white/80">
          {message} {progress !== null ? `Progress: ${progress}%` : null}
        </div>
      ) : null}
    </main>
  );
}

function TrackRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-16 text-xs uppercase tracking-[0.14em] text-white/60">{label}</div>
      <div className="flex-1">{children}</div>
    </div>
  );
}
