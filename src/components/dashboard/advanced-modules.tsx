import { advancedModules } from "@/lib/mock/dashboard-data";

export function AdvancedModules() {
  return (
    <section className="border-t border-white/[0.04] pt-8">
      <p className="mb-3 text-xs font-medium uppercase tracking-[0.15em] text-zinc-600">
        Advanced Modules
      </p>
      <div className="flex flex-wrap gap-2">
        {advancedModules.map((mod) => (
          <a
            key={mod.label}
            href={mod.href}
            className="rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-1.5 text-xs text-zinc-500 transition hover:border-white/[0.08] hover:text-zinc-300"
          >
            {mod.label}
          </a>
        ))}
      </div>
    </section>
  );
}
