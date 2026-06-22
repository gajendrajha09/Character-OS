"use client";

import { Plus } from "lucide-react";
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
        <Link href="/studio" className="font-medium text-zinc-300 transition hover:text-white">
          Studio
        </Link>
        <span className="mx-2 text-zinc-700">·</span>
        Mimi&apos;s universe
      </p>

      <div className="flex items-center gap-2">
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
