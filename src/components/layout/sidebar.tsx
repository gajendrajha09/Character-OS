import {
  ChevronDown,
  Globe,
  LayoutDashboard,
  Sparkles,
  User,
  Wand2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { advancedModules } from "@/lib/mock/dashboard-data";

const primaryNav = [
  { id: "studio", label: "Studio", icon: LayoutDashboard, href: "/", active: true },
  { id: "character", label: "Character", icon: User, href: "#character" },
  { id: "world", label: "World", icon: Globe, href: "#world" },
  { id: "content", label: "Content", icon: Wand2, href: "#content" },
];

export function Sidebar() {
  return (
    <aside className="hidden w-56 shrink-0 flex-col border-r border-white/[0.04] bg-[#0c0c12] lg:flex">
      <div className="flex items-center gap-2.5 px-5 py-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-violet-600">
          <Sparkles className="h-3.5 w-3.5 text-white" />
        </div>
        <div>
          <p className="text-sm font-semibold tracking-tight text-white">CharacterOS</p>
          <p className="text-[10px] text-zinc-600">AI Character Studio</p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
        {primaryNav.map((item) => {
          const Icon = item.icon;
          return (
            <a
              key={item.id}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition",
                item.active
                  ? "bg-white/[0.06] font-medium text-white"
                  : "text-zinc-500 hover:bg-white/[0.03] hover:text-zinc-300"
              )}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-70" />
              {item.label}
            </a>
          );
        })}

        <div className="pt-6">
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-wider text-zinc-600 transition hover:text-zinc-400 [&::-webkit-details-marker]:hidden">
              <ChevronDown className="h-3.5 w-3.5 transition group-open:rotate-180" />
              Advanced
            </summary>
            <div className="mt-1 space-y-0.5 pl-2">
              {advancedModules.map((mod) => (
                <a
                  key={mod.label}
                  href={mod.href}
                  className="block rounded-lg px-3 py-1.5 text-xs text-zinc-600 transition hover:bg-white/[0.03] hover:text-zinc-400"
                >
                  {mod.label}
                </a>
              ))}
            </div>
          </details>
        </div>
      </nav>

      <div className="border-t border-white/[0.04] p-4">
        <p className="text-[10px] leading-relaxed text-zinc-700">
          Create → Build World → Generate
        </p>
      </div>
    </aside>
  );
}
