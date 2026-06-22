"use client";

import { ChevronDown, Loader2, Sparkles } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useGeneration } from "./generation-context";

const DERIVATIVE_LABELS = {
  CAPTION: "Generate Caption",
  REEL_VERSION: "Generate Reel Version",
  STORY_VERSION: "Generate Story Version",
  PRODUCT_PLACEMENT: "Generate Product Placement",
} as const;

export function ProductionBriefPanel() {
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const { lastResult, generating, generate, derive, character, provider } = useGeneration();

  const brief = lastResult?.brief;
  const isGenerating = Boolean(generating);

  const fields = brief
    ? [
        { label: "Content Type", value: String(brief.contentType ?? "Instagram Post") },
        { label: "Goal", value: String(brief.goal ?? "Lifestyle content") },
        { label: "Platform", value: String(brief.platform ?? "Instagram") },
        { label: "Campaign", value: String(brief.campaign ?? "—") },
        { label: "Character", value: String(brief.character ?? character?.name ?? "—") },
        { label: "Theme", value: String(brief.theme ?? "—") },
        ...(brief.duration ? [{ label: "Duration", value: String(brief.duration) }] : []),
      ]
    : [
        { label: "Content Type", value: "Instagram Post" },
        { label: "Goal", value: "Lifestyle — cozy morning aesthetic" },
        { label: "Platform", value: "Instagram" },
        { label: "Character", value: "Mimi" },
        { label: "Theme", value: "Monday Morning at Home" },
      ];

  return (
    <section className="rounded-3xl border border-white/[0.06] bg-surface-raised p-6">
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="text-lg font-semibold text-white">
              {lastResult ? "Content generated" : "Ready to create"}
            </h2>
          </div>
          <p className="mt-1 text-sm text-zinc-500">
            {lastResult
              ? `Model: ${lastResult.model} — ${lastResult.modelReason}`
              : `CharacterOS builds the brief from ${character?.name ?? "your character"}'s world — you just hit generate`}
          </p>
        </div>
        {lastResult?.mock && (
          <span className="rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-medium text-amber-400">
            Mock provider — set GENERATION_PROVIDER=higgsfield for live generation
          </span>
        )}
      </div>

      {lastResult?.asset && (
        <div className="mb-5 overflow-hidden rounded-2xl border border-white/[0.06]">
          <div className="relative aspect-[4/5] max-h-80 w-full bg-zinc-900 sm:max-w-xs">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lastResult.asset.url}
              alt={lastResult.asset.name}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="border-t border-white/[0.04] p-4">
            <p className="text-sm font-medium text-white">{lastResult.asset.name}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {lastResult.followUpActions.map((action) => (
                <button
                  key={action}
                  type="button"
                  disabled={isGenerating}
                  onClick={() => derive(lastResult.asset.id, action)}
                  className="rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-zinc-300 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50"
                >
                  {DERIVATIVE_LABELS[action]}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((field) => (
          <div
            key={field.label}
            className="rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3"
          >
            <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">
              {field.label}
            </p>
            <p className="mt-1 text-sm font-medium text-zinc-200">{field.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          disabled={isGenerating}
          onClick={() => generate("post")}
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-muted px-6 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition hover:opacity-90 disabled:opacity-60 sm:flex-none sm:px-8"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating via {provider}...
            </>
          ) : (
            "Generate Post"
          )}
        </button>

        <button
          type="button"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/[0.06] px-4 py-3 text-sm text-zinc-400 transition hover:bg-white/[0.03] hover:text-zinc-200"
        >
          Advanced Settings
          <ChevronDown
            className={cn("h-4 w-4 transition-transform", advancedOpen && "rotate-180")}
          />
        </button>
      </div>

      {advancedOpen && lastResult && (
        <div className="mt-4 rounded-xl border border-white/[0.04] bg-black/20 p-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-zinc-600">
            World context (auto-assembled)
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { label: "Location", value: brief?.location },
              { label: "Wardrobe", value: brief?.wardrobe },
              { label: "Mood", value: brief?.mood },
              { label: "Camera", value: brief?.camera },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-[10px] text-zinc-600">{f.label}</p>
                <p className="text-xs text-zinc-400">{String(f.value ?? "—")}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 border-t border-white/[0.04] pt-3 text-xs text-zinc-500">
            <p>Provider: {lastResult.provider ?? provider}</p>
            <p>Model: {lastResult.model}</p>
            <p>Brief ID: {lastResult.briefId}</p>
            <p>Job ID: {lastResult.jobId}</p>
          </div>
        </div>
      )}
    </section>
  );
}
