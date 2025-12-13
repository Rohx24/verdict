export interface SampledFrame {
  t: number;
  jpgBase64: string;
}

export interface SampleFramesResult {
  durationSec: number;
  frames: SampledFrame[];
}

/**
 * Sample evenly spaced frames from a video source URL.
 * Skips the first/last 5% of the video, captures up to `count` frames,
 * and downscales to `targetWidth` for manageable payloads.
 */
export async function extractFrames(
  src: string,
  count = 10,
  targetWidth = 512,
  quality = 0.7,
): Promise<SampleFramesResult> {
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
  if (!duration) throw new Error("Cannot sample frames: unknown duration.");

  const start = duration * 0.05;
  const end = duration * 0.95;
  const frameCount = Math.min(Math.max(count, 1), 12);
  const step = frameCount > 1 ? (end - start) / (frameCount - 1) : 0;
  const times = Array.from({ length: frameCount }, (_, i) => start + i * step);

  const ratio =
    video.videoHeight && video.videoWidth
      ? video.videoHeight / video.videoWidth
      : 9 / 16;
  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = Math.round(targetWidth * ratio);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not available for frame sampling.");

  const frames: SampledFrame[] = [];

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
      const dataUrl = canvas.toDataURL("image/jpeg", quality);
      const base64 = dataUrl.replace("data:image/jpeg;base64,", "");
      frames.push({ t, jpgBase64: base64 });
    } catch {
      throw new Error(
        "Frame extraction blocked (CORS). Upload a local file or use a link that allows cross-origin access.",
      );
    }
  }

  // Reduce payload if oversized
  const totalChars = frames.reduce((acc, f) => acc + f.jpgBase64.length, 0);
  if (totalChars > 1_800_000 && frames.length > 8) {
    return { durationSec: duration, frames: frames.slice(0, 8) };
  }

  return { durationSec: duration, frames };
}
