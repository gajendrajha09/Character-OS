import { ArrowRight, Globe, Sparkles, Wand2 } from "lucide-react";

const steps = [
  { icon: Sparkles, label: "Create Character", desc: "Identity & personality" },
  { icon: Globe, label: "Build World", desc: "Home, places, friends" },
  { icon: Wand2, label: "Generate Content", desc: "Posts, reels, campaigns" },
];

export function FlowStrip() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2 rounded-2xl border border-white/[0.04] bg-white/[0.02] px-4 py-3 backdrop-blur-sm sm:gap-4">
      {steps.map((step, i) => {
        const Icon = step.icon;
        return (
          <div key={step.label} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                <Icon className="h-3.5 w-3.5 text-accent" />
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-200">{step.label}</p>
                <p className="hidden text-[10px] text-zinc-600 sm:block">{step.desc}</p>
              </div>
            </div>
            {i < steps.length - 1 && (
              <ArrowRight className="hidden h-3.5 w-3.5 text-zinc-700 sm:block" />
            )}
          </div>
        );
      })}
    </div>
  );
}
