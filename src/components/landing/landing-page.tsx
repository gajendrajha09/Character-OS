"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRight, Github, MapPin, Sparkles, Wand2 } from "lucide-react";
import { TopBar } from "@/components/layout/top-bar";
import { MIMI_IMAGES } from "@/lib/mock/mimi-images";

const features = [
  {
    icon: Sparkles,
    title: "Character Bible",
    description: "Identity, personality, and lifestyle that persist across every generation.",
  },
  {
    icon: MapPin,
    title: "World Builder",
    description: "Homes, cafes, gyms, and favorite places — Mimi lives in Powai, Mumbai.",
  },
  {
    icon: Wand2,
    title: "Production Briefs",
    description: "Express intent once; the engine assembles world-aware content briefs.",
  },
];

export function LandingPage() {
  const [portraitError, setPortraitError] = useState(false);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#08080c] text-zinc-100">
      <TopBar active="home" />

      <div className="pointer-events-none absolute inset-0 bg-grid-pattern bg-[size:48px_48px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(167,139,250,0.12),transparent_50%)]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(245,158,11,0.06),transparent_40%)]" />

      <header className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-5 py-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-violet-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight text-white">CharacterOS</p>
            <p className="text-[10px] text-zinc-600">AI Character Studio</p>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <a
            href="https://github.com/gajendrajha09/Character-OS"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-sm text-zinc-400 transition hover:border-white/15 hover:text-zinc-200 sm:flex"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-muted"
          >
            Run Studio
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 pb-20 pt-8 lg:px-8 lg:pt-16">
        <section className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="animate-fade-in space-y-6">
            <p className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-3 py-1 text-xs font-medium text-accent-glow">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-glow" />
              Live demo — meet Mimi
            </p>
            <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-gradient">Character → World → Content</span>
            </h1>
            <p className="max-w-lg text-base leading-relaxed text-zinc-400 sm:text-lg">
              The permanent memory system for AI characters. CharacterOS remembers where they live,
              who their friends are, and what they wear — then generates consistent content from
              that world.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/studio"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/20 transition hover:opacity-90"
              >
                Launch Studio
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="https://github.com/gajendrajha09/Character-OS#readme"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-6 py-3 text-sm font-medium text-zinc-300 transition hover:border-white/15 hover:bg-white/[0.06]"
              >
                Read the docs
              </a>
            </div>
          </div>

          <div className="animate-slide-up relative mx-auto w-full max-w-sm lg:max-w-none">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-gradient-to-br from-surface-raised via-[#14141f] to-surface-raised shadow-2xl shadow-black/50">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(167,139,250,0.15),transparent_50%)]" />
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(245,158,11,0.08),transparent_40%)]" />

              <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-br from-pink-500/35 via-amber-400/20 to-violet-500/35">
                {!portraitError ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={MIMI_IMAGES.portrait}
                    alt="Mimi — lifestyle creator in Powai, Mumbai"
                    className="h-full w-full object-cover object-top"
                    onError={() => setPortraitError(true)}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-6xl font-bold text-white/15">
                    M
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent" />
              </div>

              <div className="relative space-y-3 p-6">
                <div className="flex items-center gap-2">
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald-400">
                    Demo character
                  </span>
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <MapPin className="h-3 w-3" />
                    Powai, Mumbai
                  </span>
                </div>
                <h2 className="text-2xl font-semibold text-white">Mimi</h2>
                <p className="text-sm leading-relaxed text-zinc-400">
                  23-year-old lifestyle creator. Marketing executive with playful, luxury, feminine
                  energy — apartment, cafe, gym, and friends all wired into her world graph.
                </p>
              </div>
            </div>
            <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-b from-accent/20 to-transparent blur-3xl" />
          </div>
        </section>

        <section className="mt-24 grid gap-4 sm:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-white/[0.06] bg-surface-raised/60 p-6 backdrop-blur-sm transition hover:border-white/10"
              >
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Icon className="h-5 w-5 text-accent-glow" />
                </div>
                <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-zinc-500">{feature.description}</p>
              </div>
            );
          })}
        </section>

        <section className="mt-16 rounded-2xl border border-white/[0.06] bg-surface-raised/40 px-6 py-8 text-center sm:px-10">
          <p className="text-sm text-zinc-500">
            Eight modules · Production Brief Engine · Higgsfield MCP integration
          </p>
          <Link
            href="/studio"
            className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-accent-glow transition hover:text-white"
          >
            Explore the full studio
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <footer className="relative z-10 border-t border-white/[0.04] px-5 py-8 text-center text-xs text-zinc-600">
        CharacterOS — AI Character Studio & Content Engine
      </footer>
    </div>
  );
}
