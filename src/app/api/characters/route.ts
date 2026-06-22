import { NextResponse } from "next/server";
import { memoryStore } from "@/lib/store/memory-store";

export async function GET() {
  const records = memoryStore.listCharacters();
  return NextResponse.json({
    success: true,
    data: records.map((r) => ({
      id: r.character.id,
      name: r.character.name,
      age: r.character.age,
      contentNiche: r.character.contentNiche,
      status: r.character.status,
      world: r.world
        ? { city: r.world.world.city, isComplete: r.world.world.isComplete }
        : null,
      campaign: r.campaigns[0]?.title ?? null,
    })),
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      age?: number;
      contentNiche?: string;
      city?: string;
      mode?: "quick" | "deep";
    };

    if (!body.name?.trim()) {
      return NextResponse.json(
        { success: false, error: "Character name is required" },
        { status: 400 }
      );
    }

    const record = memoryStore.createQuickCharacter({
      name: body.name.trim(),
      age: body.age,
      contentNiche: body.contentNiche,
      city: body.city ?? "Mumbai",
    });

    return NextResponse.json({
      success: true,
      data: {
        id: record.character.id,
        name: record.character.name,
        age: record.character.age,
        contentNiche: record.character.contentNiche,
        world: {
          city: record.world?.world.city,
          isComplete: record.world?.world.isComplete,
        },
        campaign: record.campaigns[0]?.title,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create character";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
