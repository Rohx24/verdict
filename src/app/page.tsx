import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CrtTv } from "@/components/CrtTv";

const features = [
  {
    title: "Find the hook",
    description: "The exact moment your video should open with.",
  },
  {
    title: "Choose the vibe",
    description: "Fast. Cinematic. Dark. Comedy. The AI decides.",
  },
  {
    title: "What NOT to do",
    description: "One wrong choice kills a reel. We warn you.",
  },
];

export default function Home() {
  const heroVideoSrc = "/hero.mp4";
  const heroPoster =
    "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='800' height='600' viewBox='0 0 800 600'><defs><linearGradient id='g' x1='0' x2='1' y1='0' y2='1'><stop stop-color='%23060c14' offset='0'/><stop stop-color='%23040a10' offset='1'/></linearGradient></defs><rect width='800' height='600' fill='url(%23g)'/><text x='50%' y='50%' fill='%2392ff6f' font-family='Space Grotesk, system-ui' font-size='22' text-anchor='middle' dominant-baseline='middle'>Hero Video</text></svg>";

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute left-1/2 top-10 h-64 w-[48rem] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(146,255,111,0.12),transparent_60%)] blur-3xl" />
        <div className="absolute -left-32 top-40 h-56 w-56 rounded-full bg-[radial-gradient(circle_at_center,rgba(111,241,255,0.12),transparent_55%)] blur-3xl" />
        <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,rgba(146,255,111,0.1),transparent_60%)] blur-3xl" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-60" />
      </div>

      <main className="relative z-20 mx-auto flex max-w-6xl flex-col px-6 pb-16 md:px-10 lg:px-12">
        <header className="flex items-center justify-between py-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-[0_10px_40px_-20px_rgba(146,255,111,0.7)] animate-fade-up" style={{ ["--delay" as string]: "0.05s" }}>
              <span className="text-xs font-semibold uppercase tracking-[0.28em] text-[#92ff6f]">
                EV
              </span>
            </div>
            <div className="animate-fade-up" style={{ ["--delay" as string]: "0.1s" }}>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Editor&apos;s Verdict
              </p>
              <p className="text-sm text-white/70">Instant edit intelligence</p>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-white/50 animate-fade-up" style={{ ["--delay" as string]: "0.15s" }}>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[#92ff6f]">
              Live feed
            </span>
            <span className="hidden h-px w-20 bg-gradient-to-r from-[#92ff6f] to-transparent md:block" />
          </div>
      </header>

      <section className="relative grid min-h-[82vh] items-center gap-12 py-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-8 animate-fade-up" style={{ ["--delay" as string]: "0.05s" }}>
          <div className="w-fit rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[#92ff6f] transition duration-500 hover:border-[#92ff6f]/60 hover:text-white">
            Vibe coding / Cinematic
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-semibold leading-[1.05] tracking-[-0.04em] text-white sm:text-5xl lg:text-7xl">
              THE EDITOR IS DEAD.
              <br />
              LONG LIVE THE VERDICT.
            </h1>
            <p className="max-w-2xl text-lg text-white/70 md:text-xl">
              Upload a clip. Get a confident edit decision in seconds. Built
              for creators who don&apos;t have time to guess.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="lg">Get your verdict</Button>
            <Button variant="outline" size="lg" href="#demo">
              See how it works
            </Button>
          </div>
          <div className="grid gap-4 text-sm text-white/60 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-lg transition duration-500 hover:-translate-y-1 hover:border-[#92ff6f]/60 hover:shadow-[0_20px_60px_-40px_rgba(146,255,111,0.9)]">
              <p className="text-xs uppercase tracking-[0.18em] text-[#92ff6f]">
                Confidence
              </p>
              <p className="mt-1 text-lg font-semibold text-white">92%</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-lg transition duration-500 hover:-translate-y-1 hover:border-[#92ff6f]/60 hover:shadow-[0_20px_60px_-40px_rgba(146,255,111,0.9)]">
              <p className="text-xs uppercase tracking-[0.18em] text-[#92ff6f]">
                Turnaround
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                Seconds, not hours
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 backdrop-blur-lg transition duration-500 hover:-translate-y-1 hover:border-[#92ff6f]/60 hover:shadow-[0_20px_60px_-40px_rgba(146,255,111,0.9)]">
              <p className="text-xs uppercase tracking-[0.18em] text-[#92ff6f]">
                Formats
              </p>
              <p className="mt-1 text-lg font-semibold text-white">
                Reels / Shorts / Trailers
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex items-center justify-center animate-fade-up" style={{ ["--delay" as string]: "0.12s" }}>
          <div className="absolute inset-10 -z-10 blur-3xl">
            <div className="h-full w-full rounded-full bg-[radial-gradient(circle_at_50%_50%,rgba(146,255,111,0.18),transparent_50%)]" />
          </div>
          <CrtTv src={heroVideoSrc} poster={heroPoster} />
        </div>
      </section>

      <section className="mt-6 grid gap-6 md:grid-cols-3" id="features">
        {features.map((feature) => (
          <Card
            key={feature.title}
            className="border-white/8 bg-white/[0.03] transition-all duration-500 hover:-translate-y-1 hover:border-[#92ff6f]/50 hover:shadow-[0_25px_90px_-50px_rgba(146,255,111,0.8)] animate-fade-up"
            style={{ ["--delay" as string]: "0.1s" }}
          >
            <CardHeader className="border-b border-white/5 pb-4">
              <CardTitle className="text-2xl text-white">
                {feature.title}
              </CardTitle>
                <div className="h-px w-16 bg-gradient-to-r from-[#92ff6f] to-transparent" />
              </CardHeader>
              <CardContent className="text-base leading-relaxed text-white/70">
                {feature.description}
              </CardContent>
            </Card>
          ))}
        </section>

      <section
        id="demo"
        className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch"
      >
        <Card className="border-white/12 bg-gradient-to-br from-white/[0.06] via-[#0c1017] to-[#0a0d12] animate-fade-up" style={{ ["--delay" as string]: "0.05s" }}>
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#92ff6f]">
                Editor&apos;s Call
              </p>
                <CardTitle className="text-3xl text-white">
                  Release the reel
                </CardTitle>
              </div>
              <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
                Verdict Ready
              </div>
            </CardHeader>
            <CardContent className="space-y-6 text-white/80">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-white/50">
                  Best Hook
                </p>
                <p className="mt-2 text-2xl font-semibold text-white">
                  00:07 — “Sirens, smoke, and your face in the glow.”
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    Caption
                  </p>
                  <p className="mt-2 text-lg text-white">
                    “This city chews up editors. The AI spits verdicts.”
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                    Avoid This
                  </p>
                  <ul className="mt-2 space-y-2 text-sm leading-relaxed">
                    <li>• No lens flares over the hook.</li>
                    <li>• Don&apos;t crossfade into silence.</li>
                    <li>• Keep the cut under 17s.</li>
                  </ul>
                </div>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                {[
                  { label: "Grade", value: "Charcoal / Acid" },
                  { label: "Motion", value: "Fast → Freeze → Impact" },
                  { label: "Output", value: "Vertical • 9:16" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
                  >
                    <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">
                      {item.label}
                    </p>
                    <p className="mt-2 text-sm font-semibold text-white">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col justify-between border-white/12 bg-[#0a0e14]/90 animate-fade-up" style={{ ["--delay" as string]: "0.1s" }}>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.22em] text-[#92ff6f]">
                  Timeline
                  </p>
                  <p className="text-xl font-semibold text-white">
                    Shot-by-shot verdict
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full border border-white/10 bg-white/10" />
              </div>
              <div className="space-y-4">
                {[
                  {
                    time: "00:00",
                    call: "Static. Let the smoke breathe.",
                  },
                  {
                    time: "00:07",
                    call: "Hard cut to the sirens. Voice drops in.",
                  },
                  {
                    time: "00:13",
                    call: "Freeze-frame, add caption. Punchy sfx.",
                  },
                  {
                    time: "00:16",
                    call: "Beat out. No fade. Land on title card.",
                  },
                ].map((item) => (
                  <div
                    key={item.time}
                    className="relative overflow-hidden rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3"
                  >
                    <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-[#92ff6f] via-[#4be1ff] to-transparent" />
                    <div className="pl-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                        {item.time}
                      </p>
                      <p className="mt-1 text-sm font-semibold text-white">
                        {item.call}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
            <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-[#92ff6f]/20 via-transparent to-[#4be1ff]/20 px-4 py-3 text-sm text-white/80">
              The verdict leans cinematic, dark, and fast. Your first three
              seconds decide everything—keep them sharp.
            </div>
            </CardContent>
          </Card>
        </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
        <Card className="border-white/10 bg-gradient-to-r from-[#0d141e] via-[#0c1119] to-[#0a0d13] animate-fade-up" style={{ ["--delay" as string]: "0.05s" }}>
          <CardContent className="grid gap-6 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-[#92ff6f]">
                Copyright-safe soundtracks
              </p>
                <CardTitle className="text-3xl text-white">
                  Music that matches your clip&apos;s mood.
                </CardTitle>
                <p className="text-base text-white/70">
                  Generate original music that fits your cut—no stolen audio,
                  no takedowns. Powered by MusicGPT.
                </p>
                <p className="text-xs uppercase tracking-[0.2em] text-white/50">
                  Optional. No stolen audio.
                </p>
              </div>
              <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-5">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(146,255,111,0.14),transparent_35%)] opacity-80" />
                <div className="relative space-y-4">
                  {[
                    { label: "Mood lock", value: "Cinematic / Brooding" },
                    { label: "BPM", value: "88 → 96 (rise)" },
                    { label: "Safety", value: "100% copyright-safe" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/30 px-4 py-3"
                    >
                      <span className="text-xs uppercase tracking-[0.2em] text-white/50">
                        {item.label}
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-white/10 bg-white/[0.03] animate-fade-up" style={{ ["--delay" as string]: "0.1s" }}>
            <CardContent className="space-y-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[#92ff6f]">
                Final CTA
              </p>
              <CardTitle className="text-3xl text-white">
                Stop guessing. Get the verdict.
              </CardTitle>
              <p className="text-base text-white/70">
                Your reel deserves a ruthless, confident editor. Ours never gets
                tired.
              </p>
              <Button size="lg" href="/auth" className="w-fit">
                Sign In
              </Button>
            </CardContent>
          </Card>
        </section>
      </main>
    </div>
  );
}
