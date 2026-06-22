import { NextResponse } from "next/server";
import { generationService } from "@/lib/services/generation.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const characterId =
    searchParams.get("characterId") ??
    process.env.DEMO_CHARACTER_ID ??
    "00000000-0000-4000-8000-000000000001";

  const assets = await generationService.listAssets(characterId);
  return NextResponse.json({ success: true, data: assets });
}
