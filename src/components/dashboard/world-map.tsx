"use client";

import { Building2, Coffee, Dumbbell, Home, Plane, ShoppingBag, User, Users } from "lucide-react";
import { worldNodes } from "@/lib/mock/dashboard-data";
import { cn } from "@/lib/utils";

const nodeIcons: Record<string, typeof Home> = {
  character: User,
  home: Home,
  work: Building2,
  place: Coffee,
  person: Users,
};

const nodeColors: Record<string, string> = {
  character: "border-accent/40 bg-accent/10 text-accent-glow shadow-accent/20",
  home: "border-amber-500/30 bg-amber-500/10 text-amber-300",
  work: "border-blue-500/30 bg-blue-500/10 text-blue-300",
  place: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
  person: "border-rose-500/30 bg-rose-500/10 text-rose-300",
};

const nodeIconOverride: Record<string, typeof Home> = {
  Gym: Dumbbell,
  Mall: ShoppingBag,
  "Travel Spot": Plane,
  "Favorite Cafe": Coffee,
};

function NodeThumbnail({
  imageUrl,
  label,
  isRoot,
}: {
  imageUrl?: string;
  label: string;
  isRoot?: boolean;
}) {
  if (!imageUrl) return null;

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={imageUrl}
      alt={label}
      className={cn(
        "shrink-0 rounded-lg object-cover ring-1 ring-white/10",
        isRoot ? "h-8 w-8" : "h-7 w-7"
      )}
    />
  );
}

export function WorldMap() {
  const root = worldNodes.find((n) => n.type === "character")!;
  const children = worldNodes.filter((n) => n.type !== "character");

  return (
    <section className="rounded-3xl border border-white/[0.06] bg-gradient-to-b from-surface-raised to-surface p-6 lg:p-8">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-accent/70">
            Character World
          </p>
          <h2 className="mt-1 text-xl font-semibold text-white">
            {root.label}&apos;s universe
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Every place and person — ready to become content
          </p>
        </div>
        <button
          type="button"
          className="hidden rounded-lg border border-white/10 px-3 py-1.5 text-xs text-zinc-400 transition hover:bg-white/5 hover:text-zinc-200 sm:block"
        >
          Expand world →
        </button>
      </div>

      {/* Desktop graph */}
      <div className="relative hidden min-h-[340px] lg:block">
        <svg className="absolute inset-0 h-full w-full" aria-hidden>
          {children.map((node) => (
            <line
              key={`line-${node.id}`}
              x1={`${root.x}%`}
              y1={`${root.y + 6}%`}
              x2={`${node.x}%`}
              y2={`${node.y}%`}
              stroke="rgba(167,139,250,0.15)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          ))}
        </svg>

        {worldNodes.map((node) => {
          const Icon = nodeIconOverride[node.label] ?? nodeIcons[node.type] ?? Coffee;
          const isRoot = node.type === "character";
          return (
            <div
              key={node.id}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 transition-transform hover:scale-105",
                isRoot && "z-10"
              )}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div
                className={cn(
                  "flex cursor-pointer items-center gap-2 rounded-xl border px-3 py-2 shadow-lg backdrop-blur-sm",
                  nodeColors[node.type],
                  isRoot && "px-4 py-2.5 shadow-accent/10"
                )}
              >
                {node.imageUrl ? (
                  <NodeThumbnail imageUrl={node.imageUrl} label={node.label} isRoot={isRoot} />
                ) : (
                  <Icon className={cn("shrink-0", isRoot ? "h-4 w-4" : "h-3.5 w-3.5")} />
                )}
                <span className={cn("whitespace-nowrap font-medium", isRoot ? "text-sm" : "text-xs")}>
                  {node.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Mobile list */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:hidden">
        {worldNodes.map((node) => {
          const Icon = nodeIconOverride[node.label] ?? nodeIcons[node.type] ?? Coffee;
          return (
            <div
              key={node.id}
              className={cn(
                "flex items-center gap-2 rounded-xl border px-3 py-2.5",
                nodeColors[node.type]
              )}
            >
              {node.imageUrl ? (
                <NodeThumbnail imageUrl={node.imageUrl} label={node.label} />
              ) : (
                <Icon className="h-3.5 w-3.5 shrink-0" />
              )}
              <span className="text-xs font-medium">{node.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
