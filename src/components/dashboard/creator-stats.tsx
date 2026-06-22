"use client";

import { useGeneration } from "./generation-context";

const labels = [
  { key: "posts" as const, label: "Posts Generated" },
  { key: "reels" as const, label: "Reels Generated" },
  { key: "campaigns" as const, label: "Campaigns Active" },
  { key: "assetsThisMonth" as const, label: "Assets This Month" },
  { key: "readyToPublish" as const, label: "Ready to Publish" },
];

export function CreatorStats() {
  const { stats, loading } = useGeneration();

  return (
    <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {labels.map(({ key, label }) => (
        <div
          key={key}
          className="rounded-2xl border border-white/[0.04] bg-white/[0.02] px-4 py-4 transition hover:border-white/[0.08]"
        >
          <p className="text-2xl font-bold tabular-nums text-white">
            {loading ? "—" : stats[key]}
          </p>
          <p className="mt-1 text-xs leading-snug text-zinc-500">{label}</p>
        </div>
      ))}
    </section>
  );
}
