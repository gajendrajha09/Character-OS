# CharacterOS — UI Guidelines

**Product:** CharacterOS — AI Character Studio & Content Engine  
**Last Updated:** 2026-06-14

---

## 1. UX Philosophy

1. **Intent-first, not prompt-first** — Primary actions are outcome buttons (Generate Reel, Generate Post), not free-text prompt fields.
2. **Single studio page** — Dashboard (`/`) is the command center. Deep modules (Character, World, Content) are secondary surfaces.
3. **Human-readable briefs** — Users see Production Brief fields (scene, wardrobe, mood, location). Raw prompts are never exposed.
4. **Demo-first development** — Studio works without DB or API keys (Mimi mock). Show mock mode badge when `HIGGSFIELD_API_KEY` is missing.
5. **Progressive disclosure** — Advanced brief fields live in collapsible sections; don't overwhelm on first interaction.
6. **Derivative retention** — Post-generation follow-up actions (caption, reel version, story, product placement) stay visible in the brief panel.

---

## 2. Information Architecture

### Current Pages

| Path | Status | Purpose |
|------|--------|---------|
| `/` | ✅ Live | Studio dashboard — generation hub |
| `/character` | ❌ Planned | Character bible, lifestyle, outfits |
| `/world` | ❌ Planned | Residence, rooms, locations, social |
| `/content` | ❌ Planned | Calendar, campaigns, posts/reels |

Sidebar nav items for Character, World, Content currently use hash anchors (`#character`, `#world`, `#content`) — placeholders only.

### Dashboard Section Order

```
FlowStrip → CharacterHero → PrimaryActions → CreatorStats
→ RecentContent → ProductionBriefPanel → GenerationHistory
→ WorldMap → AdvancedModules
```

**FlowStrip** communicates the product mantra visually: Create → Build World → Generate.

---

## 3. Interaction Patterns

### Primary Action Flow

1. User clicks intent button (e.g. "Generate Reel")
2. Button shows loading state (`Loader2` spin)
3. `GenerationContext.generate()` calls `/api/generate`
4. Production Brief panel updates with assembled brief
5. Recent Content feed + Creator Stats refresh
6. Derivative action buttons appear in brief panel

### Featured Action

"Generate Reel" receives accent ring treatment — it is the hero CTA.

### Character Selection

Header hosts character selector + "New Character" button. Creation dialog exists as stub (`NewCharacterDialog`).

### World Map

Visual graph of world nodes (apartment, cafe, gym, etc.) — contextual, not navigational yet.

---

## 4. Design System

### Theme

- **Dark-only** — `className="dark"` on `<html>`
- Premium creator-tool aesthetic
- Subtle glass / border effects over deep surfaces

### Color Tokens (`tailwind.config.ts`)

| Token | Hex | Usage |
|-------|-----|-------|
| `surface` | `#0a0a0f` | Main background |
| `surface-raised` | `#12121a` | Cards, panels |
| `surface-overlay` | `#1a1a26` | Elevated elements |
| `surface-border` | `#2a2a3a` | Borders |
| `accent` | `#a78bfa` | Primary actions, highlights |
| `accent-muted` | `#7c6df0` | Secondary accent |
| `accent-glow` | `#c4b5fd` | Gradients |
| `warm` | `#f59e0b` | Secondary warmth |

### Typography

| Role | Font |
|------|------|
| Sans | Geist Sans (`--font-geist-sans`) |
| Mono | Geist Mono (`--font-geist-mono`) |

Headings may use `.text-gradient` utility: accent-glow → white → accent.

### Visual Patterns

- Radial gradient overlays: violet (top-left), amber (bottom-right)
- Borders: `border-white/[0.06]` for subtle glass
- Corner radius: `rounded-2xl` (cards), `rounded-3xl` (hero panels)
- Action buttons: gradient accent backgrounds at ~6% opacity
- Grid pattern: `bg-grid-pattern` available for backgrounds

### Icons

Lucide React throughout. Common icons:

| Icon | Usage |
|------|-------|
| `Sparkles` | Generation, AI actions |
| `Globe` | World |
| `Wand2` | Brief / magic |
| `LayoutDashboard` | Studio nav |
| `Loader2` | Loading states |

### Animation

| Pattern | Class / Keyframe |
|---------|------------------|
| Entry | `fade-in`, `slide-up` |
| Hover (actions) | `scale-[1.02]` |
| Loading | `Loader2` + `animate-spin` |

---

## 5. Component Conventions

### Layout (`src/components/layout/`)

| Component | Responsibility |
|-----------|----------------|
| `AppShell` | Sidebar + Header + scrollable main |
| `Sidebar` | Primary nav + Advanced modules accordion |
| `Header` | Character selector + New Character |

### Dashboard (`src/components/dashboard/`)

| Component | Responsibility |
|-----------|----------------|
| `DashboardView` | Orchestrates sections; wraps `GenerationProvider` |
| `PrimaryActions` | Six intent buttons |
| `ProductionBriefPanel` | Brief display + derivative actions |
| `RecentContent` | Horizontal asset feed |
| `GenerationHistory` | Timeline |
| `WorldMap` | World node visualization |
| `GenerationContext` | Shared state: assets, history, generate(), derive() |

### Component Library Status

ShadCN is **planned** (per PRODUCT_ARCHITECTURE.md) but **not installed**. Current UI uses custom Tailwind components. When adopting ShadCN:

- Prefer Radix primitives for dialogs, dropdowns, accordions
- Map ShadCN theme to existing color tokens
- Do not break dark-only constraint

---

## 6. Responsive Behavior

| Breakpoint | Behavior |
|------------|----------|
| Mobile | Sidebar hidden; hamburger or bottom nav TBD |
| Tablet (`md`) | Primary actions: 3-column grid |
| Desktop (`lg`) | Sidebar visible; primary actions: 6-column grid |
| Max width | `max-w-6xl` (1152px) content container |

Primary actions grid: `2-col` mobile → `3-col` tablet → `6-col` desktop.

---

## 7. Primary Actions (Intent Buttons)

| Action | Intent Type | Notes |
|--------|-------------|-------|
| Generate Post | POST | Static image content |
| Generate Reel | REEL | Featured / accent ring |
| Product Promotion | PRODUCT | Brand integration |
| Content Calendar | CALENDAR | Planning (stub backend) |
| Story Sequence | STORY | Multi-frame (stub) |
| Campaign | CAMPAIGN | Campaign brief (stub) |

Each maps to `intent-parser` presets. Natural language input is future scope.

---

## 8. Production Brief Panel

### User-Visible Fields

Display in readable order:

1. Character
2. Scene
3. Location
4. Wardrobe
5. Mood
6. Camera
7. Platform
8. Duration

### Hidden (Never Show)

- `promptHidden`
- `generationPayload`
- Provider model IDs (unless debug mode)

### Derivative Actions (Post-Generation)

| Action | API |
|--------|-----|
| Generate Caption | `/api/assets/[id]/derive` |
| Generate Reel Version | same |
| Generate Story Version | same |
| Generate Product Placement | same |

Show as secondary buttons below brief summary.

---

## 9. States & Feedback

| State | Treatment |
|-------|-----------|
| Loading generation | Button spinner + disabled state |
| Mock mode | Badge in header or near primary actions |
| Empty feed | Placeholder with CTA to generate first content |
| Error | Inline message in brief panel; retry on primary action |
| No character | Prompt to create character (future) |

---

## 10. Accessibility & Content

- Maintain sufficient contrast on `surface` backgrounds (accent on dark)
- Loading buttons must be `disabled` + `aria-busy`
- Brief fields use semantic labels, not placeholder-only inputs
- Use sentence case for UI copy; title case for character names and brand

---

## 11. Do / Don't

| Do | Don't |
|----|-------|
| Show world-derived context in briefs | Expose raw prompts or JSON payloads |
| Lead with outcome buttons | Default to empty prompt textarea |
| Keep studio as home base | Scatter generation across many pages (MVP) |
| Use design tokens from `tailwind.config.ts` | Introduce ad-hoc hex colors |
| Indicate demo/mock mode clearly | Silently fail or show broken images |

---

## Related Docs

- [project-memory.md](./project-memory.md) — component inventory and UI decisions
- [product-prd.md](./product-prd.md) — user flows
- [architecture.md](./architecture.md) — frontend structure
- [architecture/PRODUCT_ARCHITECTURE.md](./architecture/PRODUCT_ARCHITECTURE.md) — original product architecture
