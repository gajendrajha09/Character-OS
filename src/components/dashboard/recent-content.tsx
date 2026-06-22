"use client";



import { Film, Image, Sparkles } from "lucide-react";

import { useGeneration } from "./generation-context";



const typeConfig = {

  IMAGE: { icon: Image, label: "Post" },

  VIDEO: { icon: Film, label: "Reel" },

};



function formatDate(iso: string): string {

  const d = new Date(iso);

  const now = new Date();

  const diffMs = now.getTime() - d.getTime();

  const diffH = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffH < 1) return "Just now";

  if (diffH < 24) return `${diffH}h ago`;

  const diffD = Math.floor(diffH / 24);

  if (diffD < 7) return `${diffD}d ago`;

  return d.toLocaleDateString([], { month: "short", day: "numeric" });

}



export function RecentContent() {

  const { assets, loading, character } = useGeneration();

  const displayName = character?.name ?? "Character";



  return (

    <section>

      <div className="mb-4 flex items-end justify-between">

        <div>

          <h2 className="text-lg font-semibold text-white">Recent Content</h2>

          <p className="text-sm text-zinc-500">Generated from {displayName}&apos;s world</p>

        </div>

        {assets.length > 0 && (

          <span className="text-xs text-zinc-600">{assets.length} assets</span>

        )}

      </div>



      {loading && assets.length === 0 ? (

        <p className="text-sm text-zinc-600">Loading content...</p>

      ) : assets.length === 0 ? (

        <div className="rounded-2xl border border-dashed border-white/10 px-6 py-10 text-center">

          <Sparkles className="mx-auto mb-2 h-5 w-5 text-zinc-600" />

          <p className="text-sm text-zinc-500">

            No content yet — click Generate Post to create your first asset

          </p>

        </div>

      ) : (

        <div className="flex gap-3 overflow-x-auto pb-2">

          {assets.map((item) => {

            const config = typeConfig[item.type] ?? { icon: Image, label: "Asset" };

            const Icon = config.icon;

            const isMock = item.metadata?.mock === true;

            return (

              <article key={item.id} className="group w-48 shrink-0">

                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900">

                  {/* eslint-disable-next-line @next/next/no-img-element */}

                  <img

                    src={item.thumbnailUrl ?? item.url}

                    alt={item.name}

                    className="h-full w-full object-cover transition group-hover:scale-105"

                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                  <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-black/40 px-2 py-1 backdrop-blur-sm">

                    <Icon className="h-3 w-3 text-white/80" />

                    <span className="text-[10px] font-medium text-white/80">{config.label}</span>

                  </div>

                  {isMock && (

                    <span className="absolute right-2 top-2 rounded bg-amber-500/20 px-1.5 py-0.5 text-[9px] text-amber-300">

                      Mock

                    </span>

                  )}

                  <div className="absolute bottom-0 w-full p-3">

                    <p className="line-clamp-2 text-sm font-medium leading-tight text-white">

                      {item.name}

                    </p>

                    <div className="mt-1.5 space-y-0.5">

                      <p className="text-[10px] text-white/60">

                        {item.characterName ?? displayName}

                        {item.campaignTitle ? ` · ${item.campaignTitle}` : ""}

                      </p>

                      <p className="text-[10px] text-white/40">{formatDate(item.createdAt)}</p>

                    </div>

                  </div>

                </div>

              </article>

            );

          })}

        </div>

      )}

    </section>

  );

}


