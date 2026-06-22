"use client";

import { ArrowRight, Github, Plus } from "lucide-react";
import Link from "next/link";
import { NotificationsBell } from "./notifications-panel";
import { ProfileMenu } from "./profile-menu";

type HeaderProps = {
  onNewCharacter?: () => void;
};

export function Header({ onNewCharacter }: HeaderProps) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-white/[0.04] bg-surface/60 px-5 backdrop-blur-xl lg:px-8">
      <p className="text-sm text-zinc-500">
        <span className="font-medium text-zinc-300">Studio</span>
        <span className="mx-2 text-zinc-700">·</span>
        Mimi&apos;s universe
      </p>

      <div className="flex items-center gap-2">
        <a
          href="https://github.com/gajendrajha09/Character-OS"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-zinc-400 transition hover:bg-white/[0.08] hover:text-zinc-200 sm:inline-flex"
        >
          <Github className="h-4 w-4" />
          GitHub
        </a>
        <Link
          href="/studio"
          className="inline-flex h-9 items-center gap-2 rounded-full bg-accent px-4 text-sm font-medium text-white transition hover:bg-accent-muted"
        >
          Run Studio
          <ArrowRight className="h-4 w-4" />
        </Link>
        <button
          type="button"
          onClick={onNewCharacter}
          className="inline-flex h-9 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-sm font-medium text-zinc-200 transition hover:bg-white/[0.08] hover:text-white"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Character</span>
        </button>
        <NotificationsBell />
        <ProfileMenu />
      </div>
    </header>
  );
}
