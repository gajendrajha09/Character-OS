"use client";

import { Bell, CheckCircle2, ImageIcon, Video, XCircle } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useGeneration } from "@/components/dashboard/generation-context";
import { cn } from "@/lib/utils";
import type { GenerationHistoryEntry, GenerationType } from "@/types/generation";

function getTaskLabel(type: GenerationType): string {
  switch (type) {
    case "IMAGE":
      return "Post";
    case "VIDEO":
    case "REEL":
      return "Reel";
    default:
      return type.charAt(0) + type.slice(1).toLowerCase().replace(/_/g, " ");
  }
}

function formatNotificationTime(iso: string): string {
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getCharacterName(
  entry: GenerationHistoryEntry,
  characterName: string | undefined,
  characters: { id: string; name: string }[]
): string {
  const match = characters.find((c) => c.id === entry.characterId);
  return match?.name ?? characterName ?? "Character";
}

type NotificationsPanelProps = {
  notifications: GenerationHistoryEntry[];
  characterName?: string;
  characters: { id: string; name: string }[];
  onClose: () => void;
  panelRef: React.RefObject<HTMLDivElement | null>;
  panelStyle?: React.CSSProperties;
};

function NotificationsPanel({
  notifications,
  characterName,
  characters,
  onClose,
  panelRef,
  panelStyle,
}: NotificationsPanelProps) {
  return (
    <div
      role="dialog"
      aria-label="Notifications"
      ref={panelRef}
      style={panelStyle}
      className="fixed z-[2147483647] w-80 overflow-hidden rounded-2xl border border-white/[0.06] bg-[#12121a] shadow-2xl shadow-black/40"
    >
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <h2 className="text-sm font-semibold text-white">Notifications</h2>
        <span className="text-xs text-zinc-500">
          {notifications.length} {notifications.length === 1 ? "task" : "tasks"}
        </span>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-6 py-10 text-center">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03]">
              <Bell className="h-4 w-4 text-zinc-500" />
            </div>
            <p className="text-sm font-medium text-zinc-300">No notifications yet</p>
            <p className="mt-1 text-xs text-zinc-500">
              Completed generation jobs will appear here
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-white/[0.04]">
            {notifications.map((entry) => {
              const isCompleted = entry.status === "COMPLETED";
              const TaskIcon =
                entry.type === "VIDEO" || entry.type === "REEL" ? Video : ImageIcon;

              return (
                <li key={entry.id}>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex w-full gap-3 px-4 py-3 text-left transition hover:bg-white/[0.03]"
                  >
                    <div
                      className={cn(
                        "mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border",
                        isCompleted
                          ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                          : "border-red-500/20 bg-red-500/10 text-red-400"
                      )}
                    >
                      <TaskIcon className="h-3.5 w-3.5" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-zinc-200">
                          {getTaskLabel(entry.type)}{" "}
                          <span className="font-normal text-zinc-500">
                            for {getCharacterName(entry, characterName, characters)}
                          </span>
                        </p>
                        {isCompleted ? (
                          <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-400" />
                        ) : (
                          <XCircle className="h-3.5 w-3.5 shrink-0 text-red-400" />
                        )}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs">
                        <span
                          className={cn(
                            "font-medium",
                            isCompleted ? "text-emerald-400/80" : "text-red-400/80"
                          )}
                        >
                          {entry.status === "COMPLETED" ? "Completed" : "Failed"}
                        </span>
                        <span className="text-zinc-600">·</span>
                        <span className="text-zinc-500">
                          {formatNotificationTime(entry.createdAt)}
                        </span>
                      </div>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

export function NotificationsBell() {
  const PANEL_WIDTH = 320;
  const VIEWPORT_MARGIN = 8;
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [lastOpenedAt, setLastOpenedAt] = useState(() => Date.now());
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelStyle, setPanelStyle] = useState<React.CSSProperties | undefined>(undefined);

  const { history, character, characters } = useGeneration();

  const notifications = useMemo(
    () =>
      history.filter(
        (entry) => entry.status === "COMPLETED" || entry.status === "FAILED"
      ),
    [history]
  );

  const unreadCount = useMemo(
    () =>
      notifications.filter(
        (entry) => new Date(entry.createdAt).getTime() > lastOpenedAt
      ).length,
    [notifications, lastOpenedAt]
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePanelPosition = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const top = rect.bottom + 10;
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
    if (!open) {
      setLastOpenedAt(Date.now());
      updatePanelPosition();
    }
    setOpen((prev) => !prev);
  };

  return (
    <div ref={containerRef} className="relative z-[1000]">
      <button
        type="button"
        onClick={handleToggle}
        aria-label="Notifications"
        aria-expanded={open}
        ref={buttonRef}
        className={cn(
          "relative flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.06] text-zinc-500 transition hover:bg-white/[0.04] hover:text-zinc-300",
          open && "border-white/10 bg-white/[0.04] text-zinc-300"
        )}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-[#12121a]" />
        )}
      </button>

      {mounted &&
        open &&
        createPortal(
          <NotificationsPanel
            notifications={notifications}
            characterName={character?.name}
            characters={characters}
            onClose={() => setOpen(false)}
            panelRef={panelRef}
            panelStyle={panelStyle}
          />,
          document.body
        )}
    </div>
  );
}
