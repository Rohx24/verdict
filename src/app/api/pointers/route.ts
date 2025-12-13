import { NextResponse } from "next/server";
import { z } from "zod";
import OpenAI from "openai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const inputSchema = z.object({
  platform: z.enum(["reels", "tiktok"]),
  vibe: z.enum(["HYPE", "CINEMATIC", "COMEDY", "DARK"]),
  brief: z.string().min(4),
  durationSec: z.number().positive(),
  frames: z
    .array(z.object({ t: z.number(), jpgBase64: z.string().min(10) }))
    .min(0)
    .max(12)
    .optional(),
  videoDescription: z.string().optional(),
});

const pointerSchema = z.object({
  t: z.number(),
  title: z.string(),
  instruction: z.string(),
  category: z.enum(["caption", "transition", "sfx", "speed", "zoom", "color"]),
  intensity: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

const responseSchema = z.object({
  summary: z.string(),
  pointers: z.array(pointerSchema).min(6).max(10),
});

type PointersResponse = z.infer<typeof responseSchema>;

const mockPointers: PointersResponse = {
  summary: "Lean into crowd energy, punchy cuts, and meme captions to hype the clip.",
  pointers: [
    {
      t: 2,
      title: "Open on impact",
      instruction: "Start with the loudest reaction shot; add a meme caption top bar.",
      category: "caption",
      intensity: 2,
    },
    {
      t: 6,
      title: "Bass drop zoom",
      instruction: "Micro-zoom on the main subject as the beat lands.",
      category: "zoom",
      intensity: 3,
    },
    {
      t: 9,
      title: "Speed pop",
      instruction: "Ramp speed x1.6 for 0.7s, then snap back to normal.",
      category: "speed",
      intensity: 2,
    },
    {
      t: 13,
      title: "SFX hit",
      instruction: "Layer a whoosh into a metallic hit on the transition.",
      category: "sfx",
      intensity: 2,
    },
    {
      t: 16,
      title: "Caption punch",
      instruction: "Add a two-word meme caption synced to the reaction.",
      category: "caption",
      intensity: 1,
    },
    {
      t: 20,
      title: "Outro call",
      instruction: "Fade to a CTA card with a quick stinger sfx.",
      category: "transition",
      intensity: 1,
    },
  ],
};

async function generateWithOpenAI(input: z.infer<typeof inputSchema>): Promise<PointersResponse> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return mockPointers;

  const openai = new OpenAI({ apiKey });
  const hasFrames = input.frames && input.frames.length > 0;
  const baseMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: [
        "You are a decisive video editor creating timeline pointers.",
        "No hedging. 6-10 pointers, well distributed across duration.",
        "Respect platform and vibe. Mention visible details if frames provided.",
      ].join(" "),
    },
  ];

  if (hasFrames) {
    const textContent = [
      `Platform: ${input.platform}`,
      `Vibe: ${input.vibe}`,
      `Brief: ${input.brief}`,
      `Duration: ${Math.round(input.durationSec)}s`,
      "Create 6-10 pointers referencing visible content.",
      "Respond with strict JSON:",
      JSON.stringify({
        summary: "string",
        pointers: [
          {
            t: "number (seconds)",
            title: "string",
            instruction: "string",
            category: "caption|transition|sfx|speed|zoom|color",
            intensity: "1|2|3",
          },
        ],
      }),
    ].join("\n");

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      ...baseMessages,
      {
        role: "user",
        content: [
          { type: "text", text: textContent },
          ...(input.frames ?? []).map((f) => ({
            type: "image_url" as const,
            image_url: { url: `data:image/jpeg;base64,${f.jpgBase64}`, detail: "low" as const },
          })),
        ],
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.6,
      messages,
      response_format: { type: "json_object" },
    });
    const raw = completion.choices[0]?.message?.content;
    const parsed = raw ? responseSchema.safeParse(JSON.parse(raw)) : null;
    if (!parsed || !parsed.success) {
      return mockPointers;
    }
    return parsed.data;
  }

  const textOnly = [
    `Platform: ${input.platform}`,
    `Vibe: ${input.vibe}`,
    `Brief: ${input.brief}`,
    `Duration: ${Math.round(input.durationSec)}s`,
    `Video description: ${input.videoDescription ?? "Not provided"}`,
    "Create 6-10 pointers across the timeline.",
    "Respond with strict JSON.",
  ].join("\n");

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.6,
    messages: [
      ...baseMessages,
      {
        role: "user",
        content: textOnly,
      },
    ],
    response_format: { type: "json_object" },
  });
  const raw = completion.choices[0]?.message?.content;
  const parsed = raw ? responseSchema.safeParse(JSON.parse(raw)) : null;
  if (!parsed || !parsed.success) {
    return mockPointers;
  }
  return parsed.data;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = inputSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const data = parsed.data;
    if (!data.frames?.length && !data.videoDescription) {
      return NextResponse.json(
        { error: "Provide frames or a videoDescription for context." },
        { status: 400 },
      );
    }

    const result = await generateWithOpenAI(data);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Pointer generation failed", error);
    return NextResponse.json(mockPointers, { status: 200 });
  }
}
