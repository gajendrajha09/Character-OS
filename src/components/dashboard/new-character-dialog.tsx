"use client";



import { BookOpen, ChevronRight, Loader2, Sparkles, Wand2, X } from "lucide-react";

import { useEffect, useState } from "react";

import { useGeneration } from "./generation-context";



type NewCharacterDialogProps = {

  open: boolean;

  onClose: () => void;

};



export function NewCharacterDialog({ open, onClose }: NewCharacterDialogProps) {

  const { createCharacter } = useGeneration();

  const [creating, setCreating] = useState(false);

  const [quickName, setQuickName] = useState("");

  const [quickCity, setQuickCity] = useState("Mumbai");



  useEffect(() => {

    if (open) {

      document.body.style.overflow = "hidden";

    } else {

      document.body.style.overflow = "";

    }

    return () => {

      document.body.style.overflow = "";

    };

  }, [open]);



  const handleQuickCreate = async () => {

    if (!quickName.trim()) return;

    setCreating(true);

    try {

      await createCharacter({ name: quickName.trim(), city: quickCity.trim() || "Mumbai" });

      setQuickName("");

      onClose();

    } catch (err) {

      alert(err instanceof Error ? err.message : "Failed to create character");

    } finally {

      setCreating(false);

    }

  };



  if (!open) return null;



  return (

    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">

      <button

        type="button"

        className="absolute inset-0 bg-black/70 backdrop-blur-sm"

        onClick={onClose}

        aria-label="Close"

      />

      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-white/10 bg-[#12121a] shadow-2xl">

        <div className="flex items-center justify-between border-b border-white/[0.06] px-6 py-5">

          <div>

            <h2 className="text-xl font-semibold text-white">Create a character</h2>

            <p className="mt-1 text-sm text-zinc-500">

              Character + World + Campaign created automatically

            </p>

          </div>

          <button

            type="button"

            onClick={onClose}

            className="flex h-9 w-9 items-center justify-center rounded-lg text-zinc-500 transition hover:bg-white/5 hover:text-zinc-200"

          >

            <X className="h-4 w-4" />

          </button>

        </div>



        <div className="grid gap-4 p-6 sm:grid-cols-2">

          <div className="relative overflow-hidden rounded-2xl border border-accent/20 bg-accent/[0.03] p-6 sm:col-span-2">

            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent" />

            <div className="relative">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10">

                <Sparkles className="h-6 w-6 text-accent" />

              </div>

              <h3 className="text-lg font-semibold text-white">Quick Character</h3>

              <p className="mt-2 text-sm leading-relaxed text-zinc-500">

                Generates identity, bible, world (residence + locations), outfits, and an active

                campaign — ready to generate content immediately.

              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">

                <input

                  type="text"

                  placeholder="Character name"

                  value={quickName}

                  onChange={(e) => setQuickName(e.target.value)}

                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-accent/40 focus:outline-none"

                />

                <input

                  type="text"

                  placeholder="City (e.g. Mumbai)"

                  value={quickCity}

                  onChange={(e) => setQuickCity(e.target.value)}

                  className="rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-zinc-600 focus:border-accent/40 focus:outline-none"

                />

              </div>

              <button

                type="button"

                disabled={creating || !quickName.trim()}

                onClick={handleQuickCreate}

                className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent/20 px-5 py-2.5 text-sm font-medium text-accent-glow transition hover:bg-accent/30 disabled:opacity-50"

              >

                {creating ? (

                  <Loader2 className="h-4 w-4 animate-spin" />

                ) : (

                  <>

                    Generate now

                    <ChevronRight className="h-4 w-4" />

                  </>

                )}

              </button>

            </div>

          </div>



          <button

            type="button"

            disabled

            className="group relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 text-left opacity-50"

          >

            <div className="relative">

              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white/5">

                <BookOpen className="h-6 w-6 text-zinc-400" />

              </div>

              <h3 className="text-lg font-semibold text-white">Deep Character Builder</h3>

              <p className="mt-2 text-sm leading-relaxed text-zinc-500">

                Guided multi-step wizard — coming after generation engine validation.

              </p>

              <ul className="mt-4 space-y-1.5 text-xs text-zinc-600">

                {["Identity · Lifestyle · Career", "Home · Friends · Relationships", "Fashion · Goals · Personality"].map((item) => (

                  <li key={item} className="flex items-center gap-2">

                    <Wand2 className="h-3 w-3 text-zinc-600" />

                    {item}

                  </li>

                ))}

              </ul>

            </div>

          </button>

        </div>

      </div>

    </div>

  );

}


