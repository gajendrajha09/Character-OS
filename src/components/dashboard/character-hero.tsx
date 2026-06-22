"use client";



import { MapPin, Sparkles } from "lucide-react";

import { useGeneration } from "./generation-context";



export function CharacterHero() {

  const { character, loading } = useGeneration();



  if (loading && !character) {

    return (

      <section className="h-48 animate-pulse rounded-3xl border border-white/[0.06] bg-surface-raised" />

    );

  }



  if (!character) {

    return (

      <section className="rounded-3xl border border-dashed border-white/10 px-8 py-12 text-center">

        <Sparkles className="mx-auto mb-3 h-6 w-6 text-accent" />

        <h2 className="text-lg font-semibold text-white">No character yet</h2>

        <p className="mt-2 text-sm text-zinc-500">

          Create a character to start generating world-aware content

        </p>

      </section>

    );

  }



  const c = character;
  const portraitUrl = c.portraitUrl ?? "/images/mimi/portrait.jpg";

  return (

    <section className="relative overflow-hidden rounded-3xl border border-white/[0.06] bg-gradient-to-br from-surface-raised via-[#14141f] to-surface-raised">

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(167,139,250,0.12),transparent_50%)]" />

      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_rgba(245,158,11,0.06),transparent_40%)]" />



      <div className="relative grid min-h-[420px] lg:grid-cols-[1.1fr_1fr] lg:min-h-[480px]">

        <div className="relative min-h-[320px] lg:min-h-full">

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={portraitUrl}
            alt={`${c.name} portrait`}
            className="absolute inset-0 h-full w-full object-cover object-top"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:via-[#0a0a0f]/30 lg:to-[#0a0a0f]/90" />

          <div className="absolute inset-0 flex items-end justify-center pb-8 lg:items-center lg:justify-start lg:pl-12 lg:pb-0">

            <div className="relative hidden lg:block">

              <div className="h-80 w-64 overflow-hidden rounded-[2rem] shadow-2xl shadow-black/40 ring-1 ring-white/10">

                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={portraitUrl}
                  alt={`${c.name} portrait`}
                  className="h-full w-full object-cover object-top"
                />

              </div>

              <div className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-b from-accent/20 to-transparent blur-2xl" />

            </div>

          </div>

          <div className="absolute left-5 top-5 flex items-center gap-2 rounded-full border border-white/10 bg-black/30 px-3 py-1.5 backdrop-blur-md">

            <span className="relative flex h-2 w-2">

              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />

              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />

            </span>

            <span className="text-xs font-medium text-emerald-300">Living character</span>

          </div>

        </div>



        <div className="flex flex-col justify-center px-6 pb-8 pt-4 lg:px-10 lg:py-12">

          <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-accent/80">

            Active Character

          </p>

          <h1 className="text-5xl font-bold tracking-tight text-white lg:text-6xl">{c.name}</h1>

          {c.age && <p className="mt-2 text-lg text-zinc-400">{c.age} years old</p>}



          <div className="mt-6 space-y-2">

            {c.occupation && <p className="text-base text-zinc-200">{c.occupation}</p>}

            {c.location && (

              <p className="flex items-center gap-2 text-sm text-zinc-400">

                <MapPin className="h-3.5 w-3.5 text-accent/70" />

                {c.location}

              </p>

            )}

          </div>



          {c.contentNiche && (

            <div className="mt-5 inline-flex items-center gap-2 self-start rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">

              <Sparkles className="h-3.5 w-3.5 text-accent" />

              <span className="text-sm font-medium text-accent-glow">{c.contentNiche}</span>

            </div>

          )}



          {c.traits && c.traits.length > 0 && (

            <div className="mt-5 flex flex-wrap gap-2">

              {c.traits.map((trait) => (

                <span

                  key={trait}

                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-zinc-300"

                >

                  {trait}

                </span>

              ))}

            </div>

          )}



          <div className="mt-8 grid gap-3 border-t border-white/[0.06] pt-6 sm:grid-cols-2">

            <div>

              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">

                Current Campaign

              </p>

              <p className="mt-0.5 text-sm font-medium text-zinc-200">

                {c.campaign ?? "—"}

              </p>

            </div>

            <div>

              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">

                Current Mood

              </p>

              <p className="mt-0.5 text-sm font-medium text-zinc-200">{c.mood ?? "Cozy Luxury"}</p>

            </div>

            <div className="sm:col-span-2">

              <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-600">

                Current World

              </p>

              <p className="mt-0.5 text-sm font-medium text-zinc-200">

                {c.worldName ?? `${c.name}'s World`}

              </p>

            </div>

          </div>

        </div>

      </div>

    </section>

  );

}


