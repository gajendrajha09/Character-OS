"use client";



import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

import { useGeneration } from "./generation-context";



const actions = [

  { id: "post", label: "Generate Post", emoji: "📸", accent: "from-violet-500 to-purple-600", featured: true },

  { id: "reel", label: "Generate Reel", emoji: "🎬", accent: "from-rose-500 to-orange-500" },

  { id: "promo", label: "Product Promotion", emoji: "✨", accent: "from-amber-500 to-yellow-600" },

  { id: "calendar", label: "Content Calendar", emoji: "📅", accent: "from-cyan-500 to-blue-600" },

  { id: "story", label: "Story Sequence", emoji: "📱", accent: "from-pink-500 to-rose-600" },

  { id: "campaign", label: "Generate Campaign", emoji: "🚀", accent: "from-emerald-500 to-teal-600" },

];



export function PrimaryActions() {

  const { generate, generating, character } = useGeneration();

  const name = character?.name ?? "your character";



  return (

    <section>

      <p className="mb-4 text-center text-sm text-zinc-500 lg:text-left">

        What should <span className="font-medium text-zinc-300">{name}</span> create today?

      </p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">

        {actions.map((action) => {

          const isLoading = generating === action.id;

          return (

            <button

              key={action.id}

              type="button"

              disabled={Boolean(generating) || !character}

              onClick={() => generate(action.id)}

              className={cn(

                "group relative overflow-hidden rounded-2xl border border-white/[0.06] p-4 text-left transition-all duration-300",

                "hover:scale-[1.02] hover:border-white/10 hover:shadow-lg hover:shadow-accent/5",

                "disabled:opacity-60 disabled:hover:scale-100",

                action.featured && "ring-1 ring-accent/30",

                isLoading && "ring-2 ring-accent/50"

              )}

            >

              <div className={cn("absolute inset-0 bg-gradient-to-br opacity-[0.06]", action.accent)} />

              {isLoading ? (

                <Loader2 className="relative mb-3 h-6 w-6 animate-spin text-accent" />

              ) : (

                <span className="relative mb-3 block text-2xl">{action.emoji}</span>

              )}

              <span className="relative block text-sm font-semibold leading-tight text-white">

                {action.label}

              </span>

            </button>

          );

        })}

      </div>

    </section>

  );

}


