import { NextResponse } from "next/server";
import { generationService } from "@/lib/services/generation.service";
import type { DerivativeAction } from "@/types/generation";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = (await request.json()) as {
      characterId?: string;
      action: DerivativeAction;
    };

    const characterId =
      body.characterId ??
      process.env.DEMO_CHARACTER_ID ??
      "00000000-0000-4000-8000-000000000001";

    const result = await generationService.deriveFromAsset(
      characterId,
      id,
      body.action
    );

    return NextResponse.json({ success: true, data: result });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Derivation failed";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
