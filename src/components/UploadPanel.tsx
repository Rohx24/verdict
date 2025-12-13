"use client";

import { ChangeEvent, DragEvent } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { cn } from "@/lib/utils";

type Platform = "reels" | "tiktok" | null;
type Goal = "viral" | "cinematic" | "funny" | null;

interface UploadPanelProps {
  file: File | null;
  videoLink: string;
  platform: Platform;
  goal: Goal;
  framesCount: number;
  sampling: boolean;
  onFileChange: (file: File | null) => void;
  onLinkChange: (value: string) => void;
  onPlatformChange: (value: Platform) => void;
  onGoalChange: (value: Goal) => void;
  onResample: () => void;
}

export function UploadPanel({
  file,
  videoLink,
  platform,
  goal,
  framesCount,
  sampling,
  onFileChange,
  onLinkChange,
  onPlatformChange,
  onGoalChange,
  onResample,
}: UploadPanelProps) {
  const handleFile = (event: ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0];
    if (!selected) return;
    if (selected.size > 50 * 1024 * 1024) {
      alert("Max file size is 50MB.");
      event.target.value = "";
      return;
    }
    onFileChange(selected);
    onLinkChange("");
  };

  const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    const dropped = event.dataTransfer.files?.[0];
    if (!dropped) return;
    if (dropped.size > 50 * 1024 * 1024) {
      alert("Max file size is 50MB.");
      return;
    }
    onFileChange(dropped);
    onLinkChange("");
  };

  const handleDragOver = (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
  };

  const clearSelection = () => {
    onFileChange(null);
    onLinkChange("");
  };

  return (
    <Card className="h-full border-white/10 bg-white/[0.03]">
      <CardHeader className="border-b border-white/10 pb-4">
        <CardTitle className="text-2xl text-white">Input Bay</CardTitle>
        <p className="text-sm text-white/60">Upload or paste. Pick platform. Fire the verdict.</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#92ff6f]">
            Upload or drop
          </p>
          <label
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="mt-2 flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-black/30 px-4 py-6 text-center text-white/70 transition hover:border-[#92ff6f]/60 hover:bg-white/5"
          >
            <input
              type="file"
              accept=".mp4,.mov,.webm"
              className="hidden"
              onChange={handleFile}
            />
            <span className="text-base font-semibold">Drag & drop your video</span>
            <span className="text-xs uppercase tracking-[0.18em] text-white/50">
              mp4 · mov · webm · max 50MB
            </span>
          </label>
          <div className="mt-3 flex items-center gap-3">
            <input
              value={videoLink}
              onChange={(e) => {
                onLinkChange(e.target.value);
                if (e.target.value) onFileChange(null);
              }}
              placeholder="Paste video link (YouTube / hosted MP4)"
              className="w-full rounded-2xl border border-white/15 bg-black/40 px-4 py-3 text-white outline-none ring-0 transition focus:border-[#92ff6f] focus:bg-white/[0.08]"
            />
            <Button variant="outline" onClick={clearSelection}>
              Clear
            </Button>
          </div>
          {file ? (
            <p className="mt-2 text-sm text-white/70">
              Selected: {file.name} — {(file.size / (1024 * 1024)).toFixed(1)} MB
            </p>
          ) : null}
          <div className="mt-2 flex items-center gap-3 text-sm text-white/70">
            <span className="text-xs uppercase tracking-[0.18em] text-[#92ff6f]">
              Frames
            </span>
            <span>{sampling ? "Sampling…" : `Frames sampled: ${framesCount}`}</span>
            <Button variant="outline" size="sm" onClick={onResample} disabled={sampling || (!file && !videoLink)}>
              Resample
            </Button>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#92ff6f]">Platform</p>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {(["reels", "tiktok"] as const).map((option) => (
              <button
                key={option}
                onClick={() => onPlatformChange(option)}
                className={cn(
                  "rounded-2xl border px-4 py-3 text-left transition",
                  platform === option
                    ? "border-[#92ff6f]/70 bg-[#92ff6f]/10 text-white"
                    : "border-white/15 bg-black/30 text-white/70 hover:border-[#92ff6f]/50",
                )}
              >
                <p className="text-sm font-semibold text-white capitalize">{option}</p>
                <p className="text-xs text-white/50">
                  {option === "reels" ? "Vertical, 9:16" : "Vertical, 9:16 + trending audio"}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-[#92ff6f]">Goal (optional)</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["viral", "cinematic", "funny"] as const).map((option) => (
              <button
                key={option}
                onClick={() => onGoalChange(goal === option ? null : option)}
                className={cn(
                  "rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition",
                  goal === option
                    ? "border-[#92ff6f]/60 bg-[#92ff6f]/10 text-white"
                    : "border-white/15 bg-black/30 text-white/60 hover:border-[#92ff6f]/50",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
