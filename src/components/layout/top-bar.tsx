import Link from "next/link";
import { Fragment } from "react";

const TOP_LINKS = [
  { label: "Home", href: "/", internal: true },
  { label: "Work", href: "https://gajendrajha.myportfolio.com/work", internal: false },
  { label: "Application", href: "https://gajendrajha.myportfolio.com/application", internal: false },
  { label: "About me", href: "https://gajendrajha09.github.io/About-Me/", internal: false },
] as const;

type TopBarProps = {
  active?: "home" | "studio";
};

export function TopBar({ active }: TopBarProps) {
  return (
    <nav
      aria-label="Site"
      className="relative z-30 border-b border-white/[0.04] bg-[#0a0a10]/95 backdrop-blur-md"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-5 py-2.5 lg:px-8">
        {TOP_LINKS.map((link, i) => (
          <Fragment key={link.label}>
            {i > 0 && <span className="text-[10px] text-zinc-700">◆</span>}
            {link.internal ? (
              <Link
                href={link.href}
                className={`text-[11px] font-medium uppercase tracking-[0.12em] transition hover:text-zinc-200 ${
                  active === "home" && link.label === "Home" ? "text-accent-glow" : "text-zinc-500"
                }`}
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-medium uppercase tracking-[0.12em] text-zinc-500 transition hover:text-zinc-200"
              >
                {link.label}
              </a>
            )}
          </Fragment>
        ))}
      </div>
    </nav>
  );
}
