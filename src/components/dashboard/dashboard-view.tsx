"use client";

import { useState } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { AdvancedModules } from "@/components/dashboard/advanced-modules";
import { CharacterHero } from "@/components/dashboard/character-hero";
import { CreatorStats } from "@/components/dashboard/creator-stats";
import { FlowStrip } from "@/components/dashboard/flow-strip";
import { GenerationProvider } from "@/components/dashboard/generation-context";
import { GenerationHistory } from "@/components/dashboard/generation-history";
import { NewCharacterDialog } from "@/components/dashboard/new-character-dialog";
import { PrimaryActions } from "@/components/dashboard/primary-actions";
import { ProductionBriefPanel } from "@/components/dashboard/production-brief-panel";
import { RecentContent } from "@/components/dashboard/recent-content";
import { WorldMap } from "@/components/dashboard/world-map";

export function DashboardView() {
  const [newCharacterOpen, setNewCharacterOpen] = useState(false);

  return (
    <GenerationProvider>
      <AppShell onNewCharacter={() => setNewCharacterOpen(true)}>
        <div className="relative min-h-full">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_0%,rgba(167,139,250,0.08),transparent_50%)]" />
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_80%_100%,rgba(245,158,11,0.04),transparent_40%)]" />

          <div className="relative mx-auto max-w-6xl space-y-8 px-5 py-8 lg:px-8 lg:py-10">
            <FlowStrip />
            <CharacterHero />
            <PrimaryActions />
            <CreatorStats />
            <RecentContent />
            <ProductionBriefPanel />
            <GenerationHistory />
            <WorldMap />
            <AdvancedModules />
          </div>
        </div>
      </AppShell>

      <NewCharacterDialog
        open={newCharacterOpen}
        onClose={() => setNewCharacterOpen(false)}
      />
    </GenerationProvider>
  );
}
