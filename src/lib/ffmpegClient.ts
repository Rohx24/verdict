type FFmpegModule = typeof import("@ffmpeg/ffmpeg");

let ffmpegInstance: Awaited<ReturnType<FFmpegModule["createFFmpeg"]>> | null = null;
let loadingPromise: Promise<Awaited<ReturnType<FFmpegModule["createFFmpeg"]>>> | null = null;

export async function getFFmpeg() {
  if (ffmpegInstance) return ffmpegInstance;
  if (loadingPromise) return loadingPromise;

  loadingPromise = (async () => {
    const { createFFmpeg } = (await import("@ffmpeg/ffmpeg")) as FFmpegModule;
    const ffmpeg = createFFmpeg({ log: false });
    await ffmpeg.load();
    ffmpegInstance = ffmpeg;
    return ffmpegInstance;
  })();

  return loadingPromise;
}
