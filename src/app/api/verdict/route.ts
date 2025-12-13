import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const requestSchema = z.object({
  platform: z.enum(["reels", "tiktok"]),
  goal: z.enum(["viral", "cinematic", "funny"]).optional(),
  filename: z.string().optional(),
  durationSec: z.number().positive().optional(),
  frames: z.array(z.string().min(10)).min(1).max(12),
});

const visionSchema = z.object({
  whatHappens: z.string(),
  sceneType: z.string(),
  notableMoments: z
    .array(z.object({ t: z.number(), desc: z.string() }))
    .max(5),
  vibe: z.enum(["HYPE", "CINEMATIC", "DARK", "COMEDY"]),
});

const verdictSchema = z.object({
  title: z.string(),
  editorsCall: z.string(),
  bestHook: z.object({
    timestampSec: z.number(),
    reasoning: z.string(),
  }),
  vibe: z.enum(["HYPE", "CINEMATIC", "DARK", "COMEDY"]),
  editStrategy: z.array(z.string()).min(3).max(5),
  caption: z.string(),
  hashtags: z.array(z.string()).min(3),
  avoid: z.string(),
  confidence: z.number().min(0).max(100),
});

type Verdict = z.infer<typeof verdictSchema>;
type Vision = z.infer<typeof visionSchema>;

const mockVision: Vision = {
  whatHappens:
    "Dark alley with smoke, a figure turns toward flashing siren lights. Camera pushes in fast.",
  sceneType: "person",
  notableMoments: [
    { t: 3, desc: "Lights flash red/blue across the subject." },
    { t: 7, desc: "Silhouette faces camera with smoke behind." },
  ],
  vibe: "CINEMATIC",
};

const mockVerdict: Verdict = {
  title: "Verdict #001",
  editorsCall:
    "Hit hard at second 3, freeze on the scream, drop title in acid green.",
  bestHook: {
    timestampSec: 7,
    reasoning: "Sirens + smoke silhouette is the grabber. Land before the beat drops.",
  },
  vibe: "CINEMATIC",
  editStrategy: [
    "Open cold with ambient sound, then slam the beat at 0:03.",
    "Use rapid push-in on the protagonist with chromatic split.",
    "Flash the caption on freeze-frame; cut to black on impact.",
    "Add sub-bass riser and ash particles overlay.",
  ],
  caption: "This city chews up editors. The AI spits verdicts. #EditorsVerdict",
  hashtags: ["#EditorsVerdict", "#Cinematic", "#AIEdit"],
  avoid: "Do not crossfade into silence—cut hard to black at 0:15.",
  confidence: 92,
};

async function runVision(openai: OpenAI, frames: string[], context: string) {
  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content:
        "You are a sharp video observer. Give literal details. Do not guess. Return only JSON.",
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: [
            "Analyze these frames.",
            "Respond with strict JSON:",
            JSON.stringify({
              whatHappens: "2-4 sentence literal description of what is visible",
              sceneType: "car / person / screen recording / sports / etc",
              notableMoments: [{ t: 0, desc: "short" }],
              vibe: "HYPE|CINEMATIC|DARK|COMEDY",
            }),
            "Rules:",
            "- Mention at least 2 concrete visual details (subject + action).",
            "- If unsure, say 'unclear' instead of inventing.",
            "- Notable moments: 0-5 items, use seconds if you can infer.",
            `Context: ${context}`,
          ].join("\n"),
        },
        ...frames.map((f) => ({
          type: "image_url" as const,
          image_url: { url: `data:image/jpeg;base64,${f}`, detail: "low" as const },
        })),
      ],
    },
  ];

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.4,
    messages,
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("No response from vision model");
  return visionSchema.parse(JSON.parse(raw));
}

async function runVerdict(
  openai: OpenAI,
  input: z.infer<typeof requestSchema>,
  vision: Vision,
): Promise<Verdict> {
  const userContext = [
    input.platform === "reels" ? "Instagram Reels" : "TikTok",
    input.goal ? `Goal: ${input.goal}` : null,
    input.filename ? `Filename: ${input.filename}` : null,
    input.durationSec ? `Duration: ${Math.round(input.durationSec)}s` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  const system = [
    "You are a senior video editor. Be decisive. One option only.",
    "Keep it short, cinematic, and confident. Always include a warning.",
    "Use the observed visuals; do not invent. Mention at least 2 concrete visual details.",
    "If uncertain, say 'unclear'.",
    "Respond ONLY with JSON matching the provided schema.",
  ].join(" ");

  const schemaDescription = `
{
  "title": string,
  "editorsCall": string,
  "bestHook": { "timestampSec": number, "reasoning": string },
  "vibe": "HYPE" | "CINEMATIC" | "DARK" | "COMEDY",
  "editStrategy": string[] (3-5 items),
  "caption": string,
  "hashtags": string[] (>=3),
  "avoid": string,
  "confidence": number (0-100)
}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.65,
    messages: [
      { role: "system", content: system },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: [
              `Context: ${userContext}`,
              "Observed visuals:",
              `whatHappens: ${vision.whatHappens}`,
              `sceneType: ${vision.sceneType}`,
              `notableMoments: ${JSON.stringify(vision.notableMoments)}`,
              `visionVibe: ${vision.vibe}`,
              "Generate the verdict JSON using these visuals.",
              schemaDescription,
              "JSON only:",
            ].join("\n"),
          },
        ],
      },
    ],
    response_format: { type: "json_object" },
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) throw new Error("No response from LLM");
  const parsed = verdictSchema.parse(JSON.parse(raw));
  return parsed;
}

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const data = requestSchema.safeParse(json);
    if (!data.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { frames } = data.data;

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ verdict: mockVerdict, vision: mockVision, fallback: true });
    }

    const openai = new OpenAI({ apiKey });

    const context = [data.data.platform, data.data.goal, data.data.filename]
      .filter(Boolean)
      .join(" | ");

    const cappedFrames = frames.slice(0, Math.min(frames.length, 10));

    const vision = await runVision(openai, cappedFrames, context);
    const verdict = await runVerdict(openai, data.data, vision);

    return NextResponse.json({ verdict, vision });
  } catch (error) {
    console.error("Verdict generation failed", error);
    return NextResponse.json(
      { verdict: mockVerdict, vision: mockVision, fallback: true },
      { status: 200 },
    );
  }
}
