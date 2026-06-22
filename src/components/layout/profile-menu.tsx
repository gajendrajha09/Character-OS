"use client";

import {
  BookOpen,
  Coins,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

const STUB_USER = {
  name: "Gajendra Jha",
  email: "gajendra@characteros.app",
  initials: "GJ",
  credits: 250,
} as const;

type ProfileMenuItem = {
  id: string;
  label: string;
  icon: typeof User;
  description?: string;
  disabled?: boolean;
  onSelect: () => void;
};

function ProfileMenuPanel({
  onClose,
  panelRef,
  panelStyle,
}: {
  onClose: () => void;
  panelRef: React.RefObject<HTMLDivElement | null>;
  panelStyle?: React.CSSProperties;
}) {
  const menuItems: ProfileMenuItem[] = [
    {
      id: "profile",
      label: "Profile",
      icon: User,
      description: "View and edit creator profile",
      onSelect: () => console.log("[ProfileMenu] Open profile"),
    },
    {
      id: "credits",
      label: "Generation Credits",
      icon: Coins,
      description: `${STUB_USER.credits} credits available`,
      onSelect: () => console.log("[ProfileMenu] View generation credits"),
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      description: "App preferences",
      onSelect: () => console.log("[ProfileMenu] Open settings"),
    },
    {
      id: "help",
      label: "Help & Docs",
      icon: BookOpen,
      description: "Guides and documentation",
      onSelect: () => console.log("[ProfileMenu] Open help & docs"),
    },
    {
      id: "sign-out",
      label: "Sign out",
      icon: LogOut,
      disabled: true,
      onSelect: () => console.log("[ProfileMenu] Sign out (stub — no auth yet)"),
    },
  ];

  const actionableItems = menuItems.filter((item) => item.id !== "sign-out");
  const signOutItem = menuItems.find((item) => item.id === "sign-out");

  return (
    <div
      role="menu"
      aria-label="Profile menu"
      ref={panelRef}
      style={panelStyle}
      className="fixed z-[2147483647] w-72 overflow-hidden rounded-2xl border border-white/[0.06] bg-surface-raised/95 shadow-2xl shadow-black/40 backdrop-blur-xl"
    >
      <div className="border-b border-white/[0.06] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-rose-400/30 to-violet-500/30 text-xs font-semibold text-white ring-1 ring-white/10">
            {STUB_USER.initials}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-white">
              {STUB_USER.name}
            </p>
            <p className="truncate text-xs text-zinc-500">{STUB_USER.email}</p>
          </div>
        </div>
      </div>

      <div className="py-1">
        {actionableItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              onClick={() => {
                item.onSelect();
                onClose();
              }}
              className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition hover:bg-white/[0.03]"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-400">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-200">{item.label}</p>
                {item.description && (
                  <p className="truncate text-xs text-zinc-500">
                    {item.description}
                  </p>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {signOutItem && (
        <>
          <div className="border-t border-white/[0.06]" />
          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              disabled={signOutItem.disabled}
              title="Sign out is unavailable until auth is implemented"
              onClick={() => {
                signOutItem.onSelect();
                onClose();
              }}
              className={cn(
                "flex w-full items-center gap-3 px-4 py-2.5 text-left transition",
                signOutItem.disabled
                  ? "cursor-not-allowed opacity-50"
                  : "hover:bg-white/[0.03]"
              )}
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.03] text-zinc-400">
                <LogOut className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-zinc-200">
                  {signOutItem.label}
                </p>
                <p className="text-xs text-zinc-500">Coming soon</p>
              </div>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function ProfileMenu() {
  const PANEL_WIDTH = 288;
  const VIEWPORT_MARGIN = 8;
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties | undefined>(undefined);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePanelPosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const top = rect.bottom + 8;
    const desiredLeft = rect.right - PANEL_WIDTH;
    const maxLeft = window.innerWidth - PANEL_WIDTH - VIEWPORT_MARGIN;
    const left = Math.min(maxLeft, Math.max(VIEWPORT_MARGIN, desiredLeft));

    setPanelStyle({ top, left });
  };

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (
        (containerRef.current && containerRef.current.contains(event.target as Node)) ||
        (panelRef.current && panelRef.current.contains(event.target as Node))
      ) {
        return;
      }

      setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) return;

    updatePanelPosition();
    window.addEventListener("resize", updatePanelPosition);
    window.addEventListener("scroll", updatePanelPosition, true);
    return () => {
      window.removeEventListener("resize", updatePanelPosition);
      window.removeEventListener("scroll", updatePanelPosition, true);
    };
  }, [open]);

  const handleToggle = () => {
    if (!open) updatePanelPosition();
    setOpen((prev) => !prev);
  };

  return (
    <div ref={containerRef} className="relative z-[1000]">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleToggle}
        aria-label="Profile menu"
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-400/30 to-violet-500/30 text-[10px] font-semibold text-white ring-1 ring-white/10 transition hover:ring-white/20",
          open && "ring-white/25"
        )}
      >
        {STUB_USER.initials}
      </button>

      {mounted &&
        open &&
        createPortal(
          <ProfileMenuPanel
            onClose={() => setOpen(false)}
            panelRef={panelRef}
            panelStyle={panelStyle}
          />,
          document.body
        )}
    </div>
  );
}
