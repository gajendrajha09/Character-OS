import { NextResponse } from "next/server";
import { memoryStore } from "@/lib/store/memory-store";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const record = memoryStore.getCharacter(id);

  if (!record) {
    return NextResponse.json({ success: false, error: "Character not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: record.character.id,
      name: record.character.name,
      age: record.character.age,
      contentNiche: record.character.contentNiche,
      brandVoice: record.character.brandVoice,
      status: record.character.status,
      bible: record.bible
        ? {
            personality: record.bible.personality,
            fashion: record.bible.fashion,
          }
        : null,
      occupation: record.occupation?.title ?? null,
      world: record.world
        ? {
            city: record.world.world.city,
            name: record.world.world.name,
            isComplete: record.world.world.isComplete,
            residence: record.world.residence?.neighborhood,
            locations: record.world.locations.map((l) => l.name),
          }
        : null,
      campaign: record.campaigns.find((c) => c.status === "ACTIVE") ?? record.campaigns[0],
      traits: record.bible?.personality
        ? Object.entries(record.bible.personality as Record<string, number>)
            .filter(([, v]) => v >= 6)
            .map(([k]) => k.charAt(0).toUpperCase() + k.slice(1))
        : [],
      avatarUrl: record.character.avatarUrl,
      portraitUrl: record.character.avatarUrl,
    },
  });
}
