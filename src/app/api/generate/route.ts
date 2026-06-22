import { NextResponse } from "next/server";
import {
  generationService,
  type GenerateContentIntent,
} from "@/lib/services/generation.service";

const INTENT_MAP: Record<string, GenerateContentIntent> = {
  post: "Generate Post",
  reel: "Generate Reel",
  promo: "Generate Product Promotion",
  calendar: "Generate Content Calendar",
  story: "Generate Story Sequence",
  campaign: "Generate Campaign",
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      characterId?: string;
      action?: string;
      intent?: GenerateContentIntent;
    };

    const characterId =
      body.characterId ??
      process.env.DEMO_CHARACTER_ID ??
      "00000000-0000-4000-8000-000000000001";

    const action = body.action ?? "post";
    const intent =
      body.intent ?? INTENT_MAP[action] ?? ("Generate Post" as GenerateContentIntent);

    const result = await generationService.generateFromIntent(characterId, intent);

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
