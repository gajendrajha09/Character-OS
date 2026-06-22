# CharacterOS — Project Memory

**Purpose:** Persistent context for new Cursor sessions. Captures product vision, architecture decisions, and implementation status as of 2026-06-14.

**Current milestone:** Milestone 2 — Generation Engine ✅ (MockProvider workflow proven)

**Product:** CharacterOS — AI Character Studio & Content Engine  
**Tagline:** Character → World → Content  
**Repo:** `characteros` (Next.js 15, TypeScript, Prisma, PostgreSQL)

---

## Project Vision

CharacterOS is the permanent memory system for AI characters. Unlike generic AI image tools that forget context between sessions, CharacterOS persists a character's entire world — where they live, who their friends are, what they wear, where they go — and generates consistent social content from that world.

The long-term vision is a creator operating system where users express **intent** ("Generate Monday Morning Reel") and the platform handles world-aware brief assembly, model selection, generation, and asset management — no prompt engineering required.

---

## Core Product Thesis

```
Character  →  World  →  Content
```

Most competitors stop at **Character** (a face + bio). CharacterOS's moat is the **World**:

> Mimi isn't valuable because she's a face. She's valuable because she lives in Powai, has a specific apartment, specific friends, specific habits, specific favorite places, and a specific content style. That world generates infinite content.

| Layer | Purpose | Moat Value |
|-------|---------|------------|
| Character | Identity anchor — who they are | Entry point |
| World | Persistent environment — where/how they live | **Primary differentiator** |
| Content | Generated outputs grounded in world memory | Monetizable output |

---

## Target Users

| Segment | Need | CharacterOS Value |
|---------|------|-------------------|
| AI influencer creators | Consistent virtual personas across posts/reels | World memory + production briefs |
| Social media managers | Scale content for fictional brand characters | Campaign planner + content calendar |
| Agencies / brands | Product promotion via authentic character integration | Brand deals + product promotion flows |
| Hobbyist creators | Quick character creation without prompt expertise | One-click intent → brief → generate |

**Reference persona:** Mimi — 23-year-old lifestyle creator in Powai, Mumbai. Marketing executive, playful/luxury/feminine personality, used throughout docs as the canonical walkthrough character.

---

## Key Differentiators

1. **World-first architecture** — Residence, rooms, locations, social circle, routines, outfits all persist and feed generation.
2. **No prompt engineering** — Production Brief Engine translates intent into human-readable briefs; prompts are compiled and hidden.
3. **Consistency layer** — Appearance, hair, wardrobe, personality, and location context auto-injected into every generation.
4. **Higgsfield-first generation** — Primary provider for images and video with model auto-selection by content goal.
5. **Derivative actions** — Post-generation retention: caption, reel version, story version, product placement from same asset.
6. **Eight-module product architecture** — Clear domain boundaries map 1:1 to Prisma entities and services.

---

## Current Completed Features

### Milestone 2 — Generation Engine ✅ (2026-06-14)

**Goal:** Validate core product loop without auth, billing, or external APIs.

```
Create Character → Create World → Click Generate Post → Receive Image → Asset in Recent Content
```

**Proven end-to-end with MockProvider.**

| Component | Status | Path |
|-----------|--------|------|
| MockProvider | ✅ | `src/lib/ai/providers/mock.provider.ts` |
| HiggsfieldProvider (+ generatePost) | ✅ Ready, not active | `src/lib/ai/providers/higgsfield.provider.ts` |
| Provider factory | ✅ | `src/lib/ai/providers/provider-factory.ts` — `GENERATION_PROVIDER=mock\|higgsfield` |
| In-memory store | ✅ | `src/lib/store/memory-store.ts` — characters, worlds, campaigns, jobs, assets, briefs |
| Generation service (refactored) | ✅ | `src/lib/services/generation.service.ts` — job lifecycle + campaign linking |
| Context builder (memory path) | ✅ | `src/lib/ai/context-builder.ts` loads from memory store |
| Brief assembler (+ campaign/theme/goal) | ✅ | `src/lib/ai/brief-assembler.ts` |
| Quick Character creation API | ✅ | `POST /api/characters` — character + world + campaign |
| Job status API | ✅ | `GET /api/jobs/[id]` |
| Recent Content (live assets) | ✅ | `src/components/dashboard/recent-content.tsx` |
| New Character dialog (wired) | ✅ | `src/components/dashboard/new-character-dialog.tsx` |

**Generation job lifecycle (in-memory):**
```
PENDING (queued) → PROCESSING → COMPLETED | FAILED
```

**Asset links:** characterId, campaignId, jobId, briefId — all persisted in memory store.

**Provider switch:** Set `GENERATION_PROVIDER=higgsfield` + `HIGGSFIELD_API_KEY` when ready to replace MockProvider. Same pipeline, no flow changes.

**Explicitly deferred (per milestone scope):** Auth, billing, subscriptions, user accounts, notifications, team features, publishing, Prisma migrations, `/api/v1`.

### Architecture & Schema (Complete)
- Full Prisma schema with 30+ models across Character, World, Content, Asset, and Production Brief layers
- Eight-module architecture documented and stubbed under `src/lib/modules/`
- API contracts specified for `/api/v1/*` (not yet fully implemented)
- Prompt system with 14+ template files in `docs/prompts/`
- ER diagram, migration plan, extensibility plan documented

### Backend Services (Partial)
- **Character Bible:** `character.service.ts`, `bible.service.ts` — CRUD + bible generation stubs
- **World Builder:** `world.service.ts` — world, residence, rooms, locations, friends, family, pets
- **Production Brief Engine:** `production-brief.service.ts`, `brief-assembler.ts`, `intent-parser.ts`, `context-builder.ts`
- **Generation Service:** `generation.service.ts` — intent → brief → provider → asset; uses `getActiveProvider()` (MockProvider default)
- **In-Memory Store:** `memory-store.ts` — full character/world/campaign/asset/job persistence without DB
- **AI Providers:** MockProvider (active), HiggsfieldProvider (ready), OpenAI, Fal, Replicate, legacy adapter
- **Consistency Layer:** `consistency-layer.ts` — auto-inject character traits into prompts
- **Model Selector:** `model-selector.ts` — auto-pick Higgsfield model by content goal

### API Routes (MVP — Non-v1)
| Route | Method | Purpose |
|-------|--------|---------|
| `/api/characters` | GET, POST | List characters; Quick Character + World + Campaign creation |
| `/api/characters/[id]` | GET | Character detail (bible, world, campaign) |
| `/api/generate` | POST | Generate from action intent |
| `/api/assets` | GET | List assets by characterId |
| `/api/generation/history` | GET | Generation timeline |
| `/api/assets/[id]/derive` | POST | Derivative actions from asset |
| `/api/jobs/[id]` | GET | Generation job status + result |

### Frontend Dashboard (Complete — MockProvider Mode)
- Single-page studio dashboard at `/` with intent-first UX
- **Generate Post** is featured primary action
- Quick Character dialog creates character + world + campaign in memory
- CharacterHero, PrimaryActions, RecentContent wired to `GenerationContext` (active character, not hardcoded Mimi)
- Recent Content shows real generated assets: preview, type, date, character, campaign
- Production Brief panel: campaign, theme, goal, location, wardrobe, mood (no prompts shown)
- GenerationContext: `createCharacter()`, `selectCharacter()`, `generate()`, `refresh()`
- Mimi pre-seeded in memory store as demo character (`DEMO_CHARACTER_ID`)

### Generation Pipeline (Working — MockProvider)
```
User Intent → Intent Parser → Context Builder (memory) → Brief Assembler
→ Consistency Layer → Model Selector → getActiveProvider() [MockProvider]
→ Memory Store (job + brief + asset) → Recent Content
```

---

## Database Schema

PostgreSQL via Prisma. Supabase planned for auth, storage, RLS.

### Layer Summary

| Layer | Models |
|-------|--------|
| User & Billing | UserProfile, CreditTransaction |
| Character | Character, CharacterBible |
| World (The Moat) | World, Residence, Room, Location, Friend, FamilyMember, Pet, WorldEvent |
| Lifestyle | Occupation, Routine, Hobby, Outfit |
| Asset | Asset, Prompt |
| Content | Campaign, ContentIdea, Post, Reel, ProductPromotion, BrandDeal |
| Production | ProductionBrief, GenerationJob |
| Future Stubs | CharacterTemplate, MemoryEntry, SocialConnection, MarketplaceListing |

### Key Enums
- CharacterStatus: DRAFT, ACTIVE, ARCHIVED
- CreationMode: QUICK, DEEP_BUILDER, TEMPLATE
- ProductionBriefStatus: DRAFT, APPROVED, GENERATING, COMPLETED, FAILED
- GenerationJobType: CHARACTER, BIBLE, WORLD, LOCATION, IMAGE, REEL, etc.
- VideoProvider: HIGGSFIELD, VEO, KLING, RUNWAY, OTHER
- Platform: INSTAGRAM, TIKTOK, YOUTUBE, YOUTUBE_SHORTS, etc.

### Multi-Tenancy
- All entities scoped by `userId` via Character.userId
- UserProfile links to Supabase auth.users
- Planned RLS policies mirror Prisma access patterns
- Subscription tiers: FREE (1 character, 50 assets), PRO, ENTERPRISE

---

## Entity Relationships

```
UserProfile 1──N Character
Character 1──1 CharacterBible
Character 1──1 World
Character 1──1 Occupation
Character 1──N Routine, Hobby, Outfit, Asset, Prompt, Campaign, Post, Reel, ProductionBrief, GenerationJob

World 1──1 Residence 1──N Room
World 1──N Location, Friend, FamilyMember, Pet, WorldEvent
Location N──1 WorldEvent, ContentIdea, Routine, Occupation (workplace)

Campaign 1──N ContentIdea, Post, Reel, Asset
ContentIdea 1──1 Post OR Reel (optional)
BrandDeal 1──N Campaign, ProductPromotion

ProductionBrief N──1 Character, Location?, Room?, Outfit?, ContentIdea?, Reel?, Post?
Prompt 1──N Asset, Location, Room, Outfit, Friend (canonical visual DNA)
```

**Core rule:** Character is root. World is 1:1 with Character. Content outputs reference world entities (location, outfit, room) for consistency.

---

## Character System

### Character Entity
Root identity: name, slug, avatar, age, birthday, status, creationMode, contentNiche, brandVoice, socialMediaStyle, metadata.

### Creation Modes
| Mode | Flow |
|------|------|
| QUICK | AI random generation from preferences (region, niche, age) |
| DEEP_BUILDER | Questionnaire → structured character |
| TEMPLATE | Future: marketplace character templates |

### Character Bible
Auto-generated structured profile (JSON sections): identity, personality, home, socialCircle, lifestyle, fashion, goals, dailyRoutine, favoritePlaces. Versioned with rawMarkdown export. Source of truth for AI context injection.

### Lifestyle Extensions (Character-owned)
- **Occupation:** title, company, workStyle, workplaceLocationId
- **Routine:** MORNING/AFTERNOON/EVENING/WEEKEND schedules linked to locations
- **Hobby:** skill level, frequency, contentPotential
- **Outfit:** occasion-based wardrobe presets with items/brands JSON

### Service Paths
- `src/lib/services/character.service.ts`
- `src/lib/services/bible.service.ts`
- `src/lib/modules/character-bible/` (facade)

---

## World System

**The moat.** Explicit container for persistent environment.

### World
city, country, timezone, culture JSON, summary, isComplete flag.

### Residence
type (APARTMENT/HOUSE/STUDIO/PENTHOUSE/LOFT), neighborhood, interiorStyle, descriptions, imageUrl, linked Prompt.

### Room
BEDROOM, LIVING_ROOM, KITCHEN, BATHROOM, BALCONY, HOME_OFFICE, etc. designDetails JSON, story, canonical image.

### Location Library
Favorite places outside home: CAFE, GYM, MALL, OFFICE, PARK, etc. visitFrequency, isFavorite, relationship narrative.

### Friend Network
Friend (BEST_FRIEND, CLOSE_FRIEND, etc.), FamilyMember (MOTHER, SIBLING, etc.), Pet (DOG, CAT, etc.) — all scoped to World.

### WorldEvent
Calendar hooks: BIRTHDAY, FESTIVAL, SEASONAL, BRAND. contentOpportunity field suggests content angles. Links to Location and spawns ContentIdeas.

### Service Paths
- `src/lib/services/world.service.ts` (world + locations + social)
- `src/lib/modules/world-builder/`, `location-library/`, `friend-network/` (facades)

---

## Content System

### Planning Layer
- **Campaign:** WEEKLY/MONTHLY/SEASONAL/BRAND/EVENT with platform[], date range, brief JSON
- **ContentIdea:** Planned piece (POST/REEL/STORY/CAROUSEL/VLOG) with concept, locationId, outfitId, scheduledDate, status lifecycle (IDEA → PLANNED → GENERATED → PUBLISHED)
- **BrandDeal:** Monetization partnerships with deliverables JSON
- **ProductPromotion:** Product-specific campaigns with contentPlan JSON

### Output Layer
- **Post:** Static social post with caption, hashtags, assetIds[], exportBundle
- **Reel:** Video content with script, provider, duration, videoUrl, format (TRENDING/UGC/VLOG/etc.)

### Content Flow
```
WorldEvent/Campaign → ContentIdea → ProductionBrief → Generation → Post/Reel + Assets
```

### Service Status
- Content Planner: stub (`content-planner.service.ts`)
- Campaign Planner: stub (`campaign-planner.service.ts`)

---

## Production Brief System

**Core principle:** No prompt engineering required.

### Pipeline Stages
1. **Intent Parser** — button click or NL → ParsedIntent (type, scene, time, mood, platform)
2. **Context Builder** — load Character → World → Content graph
3. **Brief Assembler** — resolve location, wardrobe, mood, camera, duration, scene
4. **Prompt Compiler** (hidden) — brief + context → provider payloads
5. **MCP Generation** — dispatch to Higgsfield/OpenAI/Fal

### ProductionBrief Fields (User-Visible)
character, scene, wardrobe, mood, camera, platform, duration, location

### Hidden Fields
promptHidden, generationPayload — stored in DB, never returned to client

### Intent Presets
- Generate Monday Morning Reel
- Generate Gym Content
- Generate Coffee Shop Reel
- Generate Post / Product Promotion / Content Calendar / Story Sequence / Campaign

### Brief Status Lifecycle
DRAFT → APPROVED → GENERATING → COMPLETED (or FAILED)

### Reference Example (Mimi Monday Morning Reel)
| Field | Value | Source |
|-------|-------|--------|
| Character | Mimi | Character |
| Location | Powai Apartment — Bedroom | Residence + Room |
| Scene | Monday Morning | Routine (MORNING) |
| Wardrobe | Oversized Beige Sweater | Outfit |
| Mood | Cozy Luxury | Bible.personality |
| Camera | Handheld Lifestyle Vlog | Platform + niche default |
| Duration | 15 sec | Platform default |

### Service Paths
- `src/lib/services/production-brief.service.ts`
- `src/lib/ai/brief-assembler.ts`, `intent-parser.ts`, `context-builder.ts`
- `src/lib/modules/production-brief-engine/` (facade)

---

## Generation Provider Architecture

### Interface (`GenerationProvider`)
Methods: `generateImage()`, `generatePost()`, `generateProductPromo()`, `generateVideo()`, `generateReel()`, `generateCarousel()`

### Providers
| Provider | Status | When Active |
|----------|--------|-------------|
| **MockProvider** | ✅ Active default | `GENERATION_PROVIDER=mock` (default) |
| **HiggsfieldProvider** | ✅ Ready | `GENERATION_PROVIDER=higgsfield` + API key |

### Provider Selection
`src/lib/ai/providers/provider-factory.ts` → `getActiveProvider()` returns mock or higgsfield.

### Model Auto-Selection (`model-selector.ts`)
| Content Goal | Higgsfield Model |
|--------------|------------------|
| Lifestyle | soul_2 |
| Product Photography | marketing_studio_image |
| Reels | seedance_2_0 |

MockProvider uses its own labels (`mock-post-v1`, etc.).

### Consistency Layer
Auto-injects: appearance, hair, face, wardrobe, personality, style, locationContext, brandStyle. **Required on every generation.**

### Generation Service Flow (`generation.service.ts`)
1. Load context from memory store
2. Assemble brief (campaign, theme, goal included)
3. Consistency injection → hidden visual prompt
4. Create ProductionBrief + GenerationJob (PENDING → PROCESSING)
5. `getActiveProvider().generatePost()` (or image/reel/promo)
6. Store asset linked to character + campaign + job
7. Job COMPLETED → return brief + asset

### Memory Store (`src/lib/store/memory-store.ts`)
In-memory persistence: characters, worlds, campaigns, assets, jobs, briefs. Mimi seeded at `DEMO_CHARACTER_ID`.

### Provider Files
- `mock.provider.ts` — **active**
- `higgsfield.provider.ts` — ready for swap
- `provider-factory.ts` — env-based selection
- `generation-router.ts` — mock in routing chain

---

## Higgsfield Integration Plan

### Architecture
```
User Intent → Auto Brief Builder → Model Selector → HiggsfieldProvider
→ higgsfieldClient → Asset Vault → Recent Content + Derivative Actions
```

### Configuration
| Env Var | Purpose |
|---------|---------|
| `GENERATION_PROVIDER` | `mock` (default) or `higgsfield` |
| `HIGGSFIELD_API_KEY` | Live generation (when provider=higgsfield) |
| `HIGGSFIELD_API_BASE` | API endpoint (default: api.higgsfield.ai) |
| `MOCK_GENERATION` | Legacy flag; also triggers memory storage |
| `DEMO_CHARACTER_ID` | Pre-seeded Mimi character UUID |
| `NEXT_PUBLIC_DEMO_CHARACTER_ID` | Client-side default character |

### Current Status
- **MockProvider** active — full workflow proven without external APIs
- HiggsfieldProvider ready with `generatePost()` — swap via env when validated
- Generation service uses `getActiveProvider()` — no direct higgsfield hardcoding
- Dashboard shows "Mock provider" badge when `metadata.mock === true`

---

## Current Folder Structure

```
characteros/
├── prisma/schema.prisma
├── docs/
│   ├── project-memory.md         # ← START HERE (this file)
│   ├── product-prd.md
│   ├── architecture.md
│   ├── roadmap.md
│   ├── ui-guidelines.md
│   ├── architecture/             # Deep-dive docs
│   ├── api/API_CONTRACTS.md
│   └── prompts/
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   └── api/
│   │       ├── characters/route.ts
│   │       ├── characters/[id]/route.ts
│   │       ├── generate/route.ts
│   │       ├── assets/route.ts
│   │       ├── assets/[id]/derive/route.ts
│   │       ├── generation/history/route.ts
│   │       └── jobs/[id]/route.ts
│   ├── components/
│   │   ├── layout/
│   │   └── dashboard/
│   ├── lib/
│   │   ├── store/memory-store.ts  # In-memory persistence (Milestone 2)
│   │   ├── db/prisma.ts
│   │   ├── modules/
│   │   ├── services/
│   │   ├── ai/
│   │   │   └── providers/
│   │   │       ├── mock.provider.ts
│   │   │       ├── higgsfield.provider.ts
│   │   │       └── provider-factory.ts
│   │   ├── validators/
│   │   └── mock/dashboard-data.ts  # worldNodes only; assets are live
│   └── types/
└── tailwind.config.ts
```

### Module → Entity Mapping
| Module Directory | Owns |
|------------------|------|
| character-bible/ | Character, CharacterBible, Occupation, Routine, Hobby, Outfit |
| world-builder/ | World, Residence, Room |
| location-library/ | Location |
| friend-network/ | Friend, FamilyMember, Pet |
| content-planner/ | ContentIdea, Post, Reel, ProductPromotion |
| campaign-planner/ | Campaign, BrandDeal, WorldEvent |
| asset-vault/ | Asset, Prompt |
| production-brief-engine/ | ProductionBrief |
| generation/ | GenerationJob orchestration |

**Pattern:** `src/lib/modules/` = facades; `src/lib/services/` + `src/lib/ai/` = implementations. Do not duplicate logic.

---

## Current Routes

### Pages (App Router)
| Path | Component | Description |
|------|-----------|-------------|
| `/` | DashboardView | Main studio — intent-first generation hub |

No additional pages yet. Sidebar links (Character, World, Content) are hash anchors (`#character`, `#world`, `#content`) — not implemented.

### API Routes (Implemented)
| Path | Method | Body/Query |
|------|--------|------------|
| `/api/characters` | GET | — |
| `/api/characters` | POST | `{ name, age?, city?, contentNiche? }` |
| `/api/characters/[id]` | GET | — |
| `/api/generate` | POST | `{ characterId?, action?, intent? }` |
| `/api/assets` | GET | `?characterId=` |
| `/api/generation/history` | GET | `?characterId=` |
| `/api/assets/[id]/derive` | POST | `{ characterId, action }` |
| `/api/jobs/[id]` | GET | — |

### API Routes (Planned — `/api/v1`)
Full spec in `docs/api/API_CONTRACTS.md`. Includes characters CRUD, bible/world generation, content ideas, campaigns, briefs, jobs polling, memory query, image generation, Instagram export.

---

## Current Components

### Layout (`src/components/layout/`)
| Component | Role |
|-----------|------|
| AppShell | Sidebar + Header + scrollable main |
| Sidebar | Primary nav (Studio, Character, World, Content) + Advanced modules accordion |
| Header | Studio link + New Character + NotificationsBell + ProfileMenu |
| NotificationsBell (`notifications-panel.tsx`) | Task notifications dropdown (completed/failed jobs) with unread dot |
| ProfileMenu (`profile-menu.tsx`) | Avatar dropdown (Profile, Credits, Settings, Help, Sign out stub) |

### Dashboard (`src/components/dashboard/`)
| Component | Role |
|-----------|------|
| DashboardView | Orchestrates all sections, wraps GenerationProvider |
| FlowStrip | Create → Build World → Generate visual pipeline |
| CharacterHero | Active character from `useGeneration().character` (not static mock) |
| PrimaryActions | Six intent buttons; Generate Post featured; uses active character name |
| CreatorStats | Posts, reels, campaigns, assets counts (from live assets) |
| RecentContent | **Live generated assets** — preview, type, date, character, campaign |
| ProductionBriefPanel | Brief after generation + derivative actions; campaign/theme/goal |
| GenerationHistory | Timeline of past generations |
| WorldMap | Static `worldNodes` from mock data (not yet dynamic) |
| AdvancedModules | Links to eight module pages (stubs) |
| NewCharacterDialog | **Wired** — Quick Character creates character + world + campaign |
| GenerationContext | React context: characterId, character, assets, createCharacter(), generate(), derive(), refresh() |

---

## Current UI Decisions

### UX Philosophy
1. **Intent-first, not prompt-first** — Primary actions are outcome buttons, not text inputs
2. **Single studio page** — Dashboard is the command center; deep modules accessed later
3. **Human-readable briefs** — Users see Production Brief fields, never raw prompts
4. **Demo-first development** — Mimi character hardcoded for demo; works without DB/API keys
5. **Progressive disclosure** — Advanced brief fields (location, wardrobe, mood, camera) in collapsible section
6. **Derivative retention** — Post-generation follow-up actions visible in brief panel

### Dashboard Layout Order
FlowStrip → CharacterHero → PrimaryActions → CreatorStats → RecentContent → ProductionBriefPanel → GenerationHistory → WorldMap → AdvancedModules

### Interaction Patterns
- Primary action click → loading state on button → API call → brief panel updates → stats/feed refresh
- Featured action: "Generate Reel" has accent ring
- Mock mode badge shown when HIGGSFIELD_API_KEY missing
- Header bell opens notifications panel populated from `GenerationContext.history`
- Avatar opens profile panel with stub creator actions (no auth yet)
- **Overlay robustness:** notifications + profile menus render via `createPortal(..., document.body)` with viewport anchoring + very high z-index to avoid stacking-context clipping

### Responsive
- Sidebar hidden on mobile (`lg:flex`)
- Primary actions: 2-col mobile → 3-col tablet → 6-col desktop
- Max content width: 6xl (1152px)

---

## Design System

### Theme
Dark-only (`className="dark"` on html). Premium creator-tool aesthetic.

### Colors (tailwind.config.ts)
| Token | Value | Usage |
|-------|-------|-------|
| surface | #0a0a0f | Main background |
| surface-raised | #12121a | Cards, panels |
| surface-overlay | #1a1a26 | Elevated elements |
| surface-border | #2a2a3a | Borders |
| accent | #a78bfa | Primary actions, highlights |
| accent-muted | #7c6df0 | Secondary accent |
| accent-glow | #c4b5fd | Gradients |
| warm | #f59e0b | Secondary warmth |

### Typography
- Sans: Geist Sans (`--font-geist-sans`)
- Mono: Geist Mono (`--font-geist-mono`)

### Visual Patterns
- Radial gradient overlays (violet top-left, amber bottom-right)
- Border: `border-white/[0.06]` subtle glass effect
- Cards: `rounded-2xl` / `rounded-3xl`
- Action buttons: gradient accent backgrounds at 6% opacity
- Text gradient utility: `.text-gradient` (accent-glow → white → accent)
- Grid pattern background available via `bg-grid-pattern`

### Icons
Lucide React throughout (Sparkles, Globe, Wand2, LayoutDashboard, etc.)

### Animation
- fade-in, slide-up keyframes
- Hover: scale-[1.02] on action buttons
- Loading: Loader2 spin on active generation

### Not Yet Adopted
ShadCN components planned per PRODUCT_ARCHITECTURE.md but not installed. Current UI is custom Tailwind components.

---

## Future Roadmap

### Phase 1 — MVP (Current)
- [x] Schema + architecture docs
- [x] Core services (character, world, bible, production brief)
- [x] **Milestone 2: Generation Engine with MockProvider** ✅
- [x] Quick Character + World creation (in-memory)
- [x] Generate Post → asset in Recent Content (proven)
- [x] Generation job lifecycle (PENDING → PROCESSING → COMPLETED)
- [x] Dashboard UI wired to live generation context
- [ ] Supabase auth + RLS
- [ ] Full `/api/v1` route handlers
- [ ] Database migrations applied
- [ ] Swap MockProvider → HiggsfieldProvider (env switch ready)
- [ ] Deep Character Builder wizard

### Phase 2
- Video generation at scale (Higgsfield reels)
- Instagram publishing + export bundles
- Brand deals workflow
- TikTok/YouTube Shorts export
- Social scheduling
- Analytics + A/B testing

### Phase 3
- Marketplace (character templates, story packs, fashion packs)
- Character templates (schema stub exists)
- Creator revenue / commission system

### Phase 4
- AI agents for autonomous content
- Multi-character collab worlds
- API platform + white-label

---

## Known Technical Debt

1. **In-memory only** — No DB persistence yet; memory store resets on server restart
2. **Higgsfield not active** — MockProvider default; swap via `GENERATION_PROVIDER=higgsfield`
3. **No `/api/v1` routes** — Spec exists; MVP `/api/*` routes implemented
4. **WorldMap still static** — Uses `dashboard-data.ts` worldNodes, not live world graph
5. **No auth** — Local user IDs in memory store; no Supabase JWT
6. **Sync generation** — Jobs created and completed in same request (no background worker)
7. **Content/Campaign planner stubs** — Campaign auto-created on character; no planner UI
8. **ShadCN not installed** — Custom Tailwind components
9. **No Prisma migrations** — Schema defined but not applied
10. **Sidebar links are hash anchors** — No dedicated Character/World/Content pages
11. **Deep Character Builder** — Disabled in UI; Quick Character only
12. **Server restart loses data** — Memory store is ephemeral

---

## Pending Features

### High Priority
- Swap MockProvider → HiggsfieldProvider (set `GENERATION_PROVIDER=higgsfield`)
- Prisma migrations + persist memory store data to DB
- `/api/v1` route handlers per API_CONTRACTS.md
- Deep Character Builder wizard
- Background job worker + async polling
- Dynamic WorldMap from live world graph

### Medium Priority
- Content Planner: idea generation, calendar view
- Campaign Planner UI (campaigns auto-created; no management UI)
- Asset Vault UI: browse, tag, filter assets
- Production Brief edit before generate
- Credit system + billing (deferred per milestone scope)

### Medium Priority
- Content Planner: idea generation, calendar view
- Campaign Planner: campaign creation, world event scheduling
- Asset Vault UI: browse, tag, filter assets
- Production Brief edit before generate
- Credit system + billing
- Canonical prompt management

### Lower Priority
- Instagram export bundles
- Memory query UI ("What would Mimi wear for dinner?")
- Character templates marketplace
- Social connection OAuth (schema stub exists)
- Webhook events for generation completion

---

## Open Decisions

| Decision | Options | Current Lean |
|----------|---------|--------------|
| Auth provider | Supabase Auth vs Clerk | Supabase (schema references auth.users) |
| Image primary when Higgsfield unavailable | Fal vs Replicate | Fal primary, Replicate fallback |
| Job processing | In-route sync vs background worker | Sync for MVP; worker after Higgsfield swap |
| Provider default | Mock vs Higgsfield | **Mock** (Milestone 2 proven); Higgsfield next |
| UI component library | ShadCN vs custom Tailwind | Custom for now; ShadCN planned |
| Video fallback order | Veo → Kling → Runway | Documented but not implemented |
| Free tier limits | 1 char / 50 assets | Documented in PRODUCT_ARCHITECTURE |
| Natural language intents | Preset buttons only vs NL parser | Presets implemented; NL marked future |
| Storage | Supabase Storage vs S3 | Supabase planned |
| Higgsfield MCP vs direct API | MCP tools vs REST client | Both paths exist; direct API in higgsfield-client |

---

## Implementation Status

### Module Implementation Matrix

| Module | Schema | Types | Validators | Service | AI Layer | UI |
|--------|--------|-------|------------|---------|----------|-----|
| Character Bible | ✅ | ✅ | ✅ | ✅ | — | ✅ Quick create |
| World Builder | ✅ | ✅ | ✅ | ✅ | — | ✅ Auto with Quick |
| Location Library | ✅ | ✅ | ✅ | ✅ (via world) | — | ✅ In world |
| Friend Network | ✅ | ✅ | ✅ | ✅ (via world) | — | Stub |
| Content Planner | ✅ | — | — | Stub | — | — |
| Campaign Planner | ✅ | — | — | Stub | — | ✅ Auto-created |
| Asset Vault | ✅ | — | — | ✅ (memory) | — | ✅ Recent Content |
| Production Brief Engine | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ Panel |
| Generation | ✅ | ✅ | — | ✅ | ✅ | ✅ Dashboard |

### AI Layer Status

| Component | Status | Path |
|-----------|--------|------|
| Context Builder | ✅ | `src/lib/ai/context-builder.ts` |
| Intent Parser | ✅ | `src/lib/ai/intent-parser.ts` |
| Brief Assembler | ✅ | `src/lib/ai/brief-assembler.ts` |
| Consistency Layer | ✅ | `src/lib/ai/consistency-layer.ts` |
| Model Selector | ✅ | `src/lib/ai/model-selector.ts` |
| Generation Router | ✅ | `src/lib/ai/generation-router.ts` |
| Mock Provider | ✅ Active | `src/lib/ai/providers/mock.provider.ts` |
| Provider Factory | ✅ | `src/lib/ai/providers/provider-factory.ts` |
| Memory Store | ✅ | `src/lib/store/memory-store.ts` |
| Higgsfield Provider | ✅ Ready | `src/lib/ai/providers/higgsfield.provider.ts` |
| Higgsfield Client | ✅ | `src/lib/ai/mcp/higgsfield-client.ts` |
| OpenAI Provider | Stub | `src/lib/ai/providers/openai.provider.ts` |
| Fal Provider | Stub | `src/lib/ai/providers/fal.provider.ts` |
| Replicate Provider | Stub | `src/lib/ai/providers/replicate.provider.ts` |

### Environment Setup
```bash
npm install
cp .env.example .env.local
npm run db:validate
npm run db:generate
npm run typecheck
npm run dev
```

### Key Scripts (package.json)
| Script | Command |
|--------|---------|
| dev | next dev |
| build | next build |
| typecheck | tsc --noEmit |
| db:validate | prisma validate |
| db:generate | prisma generate |
| db:migrate | prisma migrate dev |

---

## Quick Reference for New Sessions

**Start here:**
1. Read this file for product context
2. `docs/roadmap.md` for milestone status
3. `src/lib/store/memory-store.ts` for in-memory data model
4. `src/lib/services/generation.service.ts` for generation flow
5. `src/lib/ai/providers/provider-factory.ts` for provider switching
6. `src/components/dashboard/generation-context.tsx` for UI state

**Demo character:** Mimi (pre-seeded in memory store at `DEMO_CHARACTER_ID`)  
**Primary user flow:** Create Character → Generate Post → Asset in Recent Content  
**Active provider:** MockProvider (`GENERATION_PROVIDER=mock`)  
**Next step:** Set `GENERATION_PROVIDER=higgsfield` to swap providers  
**Architecture mantra:** Character → World → Content

---

*Last updated: 2026-06-14 — Milestone 2 Generation Engine complete*
