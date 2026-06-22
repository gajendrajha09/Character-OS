import { NextResponse } from "next/server";
import { generationService } from "@/lib/services/generation.service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const job = await generationService.getJob(id);

  if (!job) {
    return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: job.id,
      characterId: job.characterId,
      campaignId: job.campaignId,
      status: job.status,
      provider: job.provider,
      prompt: job.prompt,
      result: job.result,
      error: job.error,
      createdAt: job.createdAt,
      startedAt: job.startedAt,
      completedAt: job.completedAt,
    },
  });
}
