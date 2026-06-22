"use client";

import { useGeneration } from "./generation-context";

export function GenerationHistory() {
  const { history, loading } = useGeneration();

  if (loading && history.length === 0) return null;
  if (history.length === 0) return null;

  return (
    <section className="rounded-2xl border border-white/[0.04] bg-white/[0.02] p-5">
      <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-zinc-500">
        Generation History
      </h2>
      <div className="space-y-2">
        {history.slice(0, 8).map((entry) => (
          <div
            key={entry.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/[0.03] bg-black/20 px-3 py-2 text-xs"
          >
            <div className="flex items-center gap-3">
              <span
                className={
                  entry.status === "COMPLETED"
                    ? "text-emerald-400"
                    : entry.status === "FAILED"
                      ? "text-red-400"
                      : "text-amber-400"
                }
              >
                {entry.status}
              </span>
              <span className="text-zinc-400">{entry.type}</span>
              <span className="text-zinc-600">{entry.provider}</span>
              {entry.model && <span className="text-zinc-600">{entry.model}</span>}
            </div>
            <span className="text-zinc-600">
              {new Date(entry.createdAt).toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
