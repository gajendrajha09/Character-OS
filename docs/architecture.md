# CharacterOS — Architecture

**Stack:** Next.js 15 · TypeScript · Prisma · PostgreSQL · Supabase (planned) · Higgsfield  
**Last Updated:** 2026-06-14

> Deep-dive references: [MODULE_ARCHITECTURE.md](./architecture/MODULE_ARCHITECTURE.md) · [PRODUCTION_BRIEF_SYSTEM.md](./architecture/PRODUCTION_BRIEF_SYSTEM.md) · [API_CONTRACTS.md](./api/API_CONTRACTS.md) · [ER_DIAGRAM.md](./architecture/ER_DIAGRAM.md)

---

## 1. System Overview

CharacterOS is a **character memory and content engine**. Users express intent; the platform loads persisted world context, assembles a Production Brief, compiles hidden prompts, generates via Higgsfield, and stores assets.

```
┌─────────────────────────────────────────────────────────────┐
│                  Next.js 15 App (App Router)                 │
│  Dashboard UI  │  GenerationContext  │  Layout Shell       │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│              API Layer (Route Handlers)                      │
│  /api/generate  │  /api/assets  │  /api/generation/history  │
│  (MVP)          │  /api/v1/* planned                        │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    Service Layer                             │
│  character · world · bible · production-brief · generation   │
│  asset-vault · content-planner (stub) · campaign (stub)      │
└────────────────────────────┬────────────────────────────────┘
                             │
┌────────────────────────────▼────────────────────────────────┐
│                    AI Layer                                  │
│  intent-parser → context-builder → brief-assembler           │
│  consistency-layer → model-selector → generation-router      │
└────────────────────────────┬────────────────────────────────┘
                             │
        ┌────────────────────┼────────────────────┐
        ▼                    ▼                    ▼
   PostgreSQL           Higgsfield MCP        OpenAI / Fal
   (Prisma)            (primary gen)         (text / fallback)
```

---

## 2. Core Pipeline

### Generation Flow (Working)

```
User Intent
  → Intent Parser        (button / NL → ParsedIntent)
  → Context Builder      (Character → World → Content graph)
  → Brief Assembler      (scene, wardrobe, mood, camera, location)
  → Consistency Layer    (appearance, hair, personality injection)
  → Model Selector       (Higgsfield model by content goal)
  → Higgsfield Provider  (image / reel)
  → Asset Vault          (persist + canonical prompt)
  → Response             (brief summary + asset + derivative actions)
```

### Content Planning Flow (Planned)

```
WorldEvent / Campaign → ContentIdea → ProductionBrief → Generation → Post/Reel
```

---

## 3. Module Architecture

Eight product modules + shared Generation layer. Facades live in `src/lib/modules/`; implementations in `src/lib/services/` and `src/lib/ai/`.

| Module | Entities | Service | UI |
|--------|----------|---------|-----|
| Character Bible | Character, CharacterBible, Occupation, Routine, Hobby, Outfit | ✅ | Stub |
| World Builder | World, Residence, Room | ✅ | Stub |
| Location Library | Location | ✅ (via world) | Stub |
| Friend Network | Friend, FamilyMember, Pet | ✅ (via world) | Stub |
| Content Planner | ContentIdea, Post, Reel, ProductPromotion | Stub | — |
| Campaign Planner | Campaign, BrandDeal, WorldEvent | Stub | — |
| Asset Vault | Asset, Prompt | ✅ | — |
| Production Brief Engine | ProductionBrief | ✅ | ✅ Panel |
| Generation | GenerationJob | ✅ | ✅ Dashboard |

**Rule:** Do not duplicate logic between modules and services. Modules are facades; services own behavior.

---

## 4. Data Model

PostgreSQL via Prisma. Character is root; World is 1:1 with Character.

```
UserProfile 1──N Character
Character 1──1 CharacterBible, World, Occupation
Character 1──N Routine, Hobby, Outfit, Asset, Campaign, ProductionBrief

World 1──1 Residence 1──N Room
World 1──N Location, Friend, FamilyMember, Pet, WorldEvent

Campaign 1──N ContentIdea, Post, Reel
ProductionBrief N──1 Character, Location?, Room?, Outfit?, ContentIdea?
```

**Multi-tenancy:** All entities scoped by `Character.userId`. Supabase auth + RLS planned.

**Schema location:** `prisma/schema.prisma` (30+ models; migrations not yet applied)

---

## 5. API Surface

### Implemented (MVP)

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/generate` | POST | Generate from action intent |
| `/api/assets` | GET | List assets by characterId |
| `/api/generation/history` | GET | Generation timeline |
| `/api/assets/[id]/derive` | POST | Derivative actions |

### Planned (`/api/v1`)

Full REST spec: characters CRUD, bible/world generation, content ideas, campaigns, briefs, job polling, memory query, Instagram export. See [API_CONTRACTS.md](./api/API_CONTRACTS.md).

---

## 6. Provider Architecture

| Type | Primary | Fallback |
|------|---------|----------|
| Image | Higgsfield (`soul_2`, `marketing_studio_image`) | Fal, Replicate |
| Video / Reel | Higgsfield (`seedance_2_0`) | Veo, Kling, Runway |
| Text (caption, script) | OpenAI GPT-5 | Claude |
| Bible / World / Ideas | OpenAI GPT-5 | Claude |

**Model selection** (`model-selector.ts`): content goal → Higgsfield model mapping.

**Consistency layer** (`consistency-layer.ts`): auto-injects appearance, hair, wardrobe, personality, location from CharacterBible + brief.

**Demo mode:** `MOCK_GENERATION=true` + no `DATABASE_URL` → in-memory assets, Mimi mock briefs.

---

## 7. Frontend Architecture

Single-page studio at `/` (`DashboardView`).

| Layer | Location |
|-------|----------|
| Layout | `src/components/layout/` (AppShell, Sidebar, Header) |
| Dashboard | `src/components/dashboard/` |
| State | `GenerationContext` — generate(), derive(), refresh() |
| Types | `src/types/` |
| Mock data | `src/lib/mock/dashboard-data.ts` |

Sidebar links (Character, World, Content) are hash anchors — dedicated pages not built.

---

## 8. Folder Structure

```
characteros/
├── prisma/schema.prisma
├── docs/                          # Product + architecture docs
├── src/
│   ├── app/
│   │   ├── page.tsx               # Dashboard
│   │   └── api/                   # Route handlers
│   ├── components/
│   │   ├── layout/
│   │   └── dashboard/
│   ├── lib/
│   │   ├── db/prisma.ts
│   │   ├── modules/               # Eight module facades
│   │   ├── services/              # Core implementations
│   │   ├── ai/                    # Brief, providers, MCP
│   │   ├── validators/
│   │   └── mock/
│   └── types/
└── tailwind.config.ts
```

---

## 9. Production Brief System

**Principle:** No prompt engineering required.

| User-visible fields | Hidden fields |
|---------------------|---------------|
| character, scene, wardrobe, mood, camera, platform, duration, location | promptHidden, generationPayload |

**Lifecycle:** DRAFT → APPROVED → GENERATING → COMPLETED | FAILED

**Example (Mimi Monday Morning Reel):**

| Field | Value | Source |
|-------|-------|--------|
| Location | Powai Apartment — Bedroom | Residence + Room |
| Scene | Monday Morning | Routine (MORNING) |
| Wardrobe | Oversized Beige Sweater | Outfit |
| Mood | Cozy Luxury | Bible.personality |
| Camera | Handheld Lifestyle Vlog | Platform default |

---

## 10. Technical Debt

1. Dual Higgsfield paths (`higgsfield.provider.ts` + `higgsfield-mcp.provider.ts`)
2. No `/api/v1` routes despite full spec
3. Demo hardcoding (Mimi, `DEMO_CHARACTER_ID`)
4. Parallel DB + in-memory paths in `generation.service.ts`
5. No auth / JWT validation
6. Synchronous generation in API route (no job worker)
7. Content/Campaign planner stubs
8. No Prisma migrations applied
9. ShadCN planned but not installed

---

## 11. Environment

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection |
| `HIGGSFIELD_API_KEY` | Live generation |
| `MOCK_GENERATION` | Demo placeholders |
| `DEMO_CHARACTER_ID` | Server demo character |
| `NEXT_PUBLIC_DEMO_CHARACTER_ID` | Client demo character |

```bash
npm install
cp .env.example .env.local
npm run db:validate && npm run db:generate
npm run typecheck && npm run dev
```
