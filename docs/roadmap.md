# CharacterOS — Roadmap

**Last Updated:** 2026-06-14  
**Current Phase:** Phase 1 — MVP (Generation Engine complete ✅)

---

## Milestone 2 — Generation Engine ✅ COMPLETE

**Completed 2026-06-14.** Core product loop proven with MockProvider:

```
Create Character → Create World → Generate Post → Asset in Recent Content
```

See `docs/project-memory.md` for full implementation details.

**Next milestone:** Swap MockProvider → HiggsfieldProvider (`GENERATION_PROVIDER=higgsfield`)

---

## Phase Overview

| Phase | Theme | Goal |
|-------|-------|------|
| **1 — MVP** | Foundation + first real user loop | Auth, DB, character/world creation, live generation |
| **2 — Production** | Scale content output | Video, publishing, campaigns, billing |
| **3 — Marketplace** | Network effects | Templates, packs, creator revenue |
| **4 — Platform** | Autonomy + scale | AI agents, multi-character worlds, API/white-label |

---

## Phase 1 — MVP (Current)

### Completed ✅

- [x] Full Prisma schema (30+ models)
- [x] Eight-module architecture documented + stubbed
- [x] Core services: character, world, bible, production brief, generation, asset vault
- [x] AI layer: intent parser, context builder, brief assembler, consistency layer, model selector
- [x] Higgsfield provider + mock mode
- [x] MVP API routes (`/api/generate`, `/api/assets`, history, derive)
- [x] Dashboard UI with intent-first UX (demo mode)
- [x] Production Brief panel + derivative actions
- [x] Prompt system (14+ templates in `docs/prompts/`)
- [x] API contracts spec (`/api/v1`)
- [x] Project documentation (`project-memory.md`, PRD, architecture, UI guidelines)

### In Progress / Remaining

- [ ] Supabase auth integration + RLS policies
- [ ] Prisma migrations + Mimi seed data
- [ ] `/api/v1` route handlers
- [ ] Character creation UI (Quick + Deep Builder)
- [ ] World generation UI flow
- [ ] Connect dashboard to real DB (remove demo-only paths)
- [ ] Async job queue + `GET /jobs/{jobId}` polling

---

## Recommended Next Milestone

### Milestone: **"Real User Loop"**

**Goal:** A signed-in user can create a character, build a minimal world, generate content, and see persisted assets — without demo mocks.

**Why this milestone:** The generation pipeline and dashboard already work in demo mode. The gap is persistence, auth, and creation flows. Shipping this unlocks real user testing and validates the core thesis (Character → World → Content) end-to-end.

**Deliverables:**

| # | Deliverable | Depends On |
|---|-------------|------------|
| 1 | Supabase auth (signup, login, JWT middleware) | — |
| 2 | Prisma migrations + seed script (Mimi as optional seed) | Auth |
| 3 | `POST/GET /api/v1/characters` + bible generation endpoint | Migrations |
| 4 | `POST /api/v1/characters/{id}/world` + location endpoints | Characters |
| 5 | Wire dashboard `characterId` to authenticated user's character | API |
| 6 | Character creation modal (Quick mode minimum) | Characters API |
| 7 | Basic world setup step (residence + 2 locations) | World API |
| 8 | Remove hardcoded Mimi paths where DB record exists | All above |

**Exit criteria:**

- New user signs up → creates character → adds world → clicks "Generate Reel" → sees brief + asset in feed
- Data persists across sessions
- Multi-tenant isolation verified (user A cannot see user B's characters)
- Demo mode still works when `MOCK_GENERATION=true`

**Estimated scope:** 2–3 focused sprints (auth + migrations first, then creation UI, then dashboard wiring).

**Explicitly deferred to next milestone after this:**

- Full `/api/v1` surface (campaigns, content ideas, memory query)
- Brief edit/approve UI
- Background job worker
- ShadCN migration
- Content calendar UI

---

## Phase 2 — Production

- [ ] Video generation at scale (Higgsfield reels)
- [ ] Production Brief edit before generate
- [ ] Content Planner: idea generation + calendar view
- [ ] Campaign Planner: campaigns + world event scheduling
- [ ] Asset Vault UI (browse, tag, filter)
- [ ] Instagram publishing + export bundles
- [ ] TikTok / YouTube Shorts export
- [ ] Brand deals workflow
- [ ] Credit system + subscription tiers (FREE / PRO / ENTERPRISE)
- [ ] Social scheduling
- [ ] Analytics + A/B testing
- [ ] Background job processor for async generation
- [ ] Consolidate Higgsfield provider paths

---

## Phase 3 — Marketplace

- [ ] Character templates (schema stub exists)
- [ ] Story packs, fashion packs
- [ ] Marketplace listings
- [ ] Creator revenue / commission system
- [ ] Memory query UI ("What would Mimi wear for dinner?")

---

## Phase 4 — Platform

- [ ] AI agents for autonomous content
- [ ] Multi-character collab worlds
- [ ] Natural language intent parser
- [ ] API platform + white-label
- [ ] Webhook events for generation completion
- [ ] Social connection OAuth

---

## Priority Matrix (Pending Features)

### High

| Feature | Phase | Blocks |
|---------|-------|--------|
| Supabase auth + RLS | 1 | Everything multi-user |
| Prisma migrations + seed | 1 | Real persistence |
| `/api/v1` characters + world | 1 | Creation flows |
| Character/world creation UI | 1 | User onboarding |
| Dashboard → real DB | 1 | Demo exit |
| Async job polling | 1 | Video at scale |

### Medium

| Feature | Phase |
|---------|-------|
| Content Planner service + UI | 2 |
| Campaign Planner service + UI | 2 |
| Asset Vault UI | 2 |
| Brief edit before generate | 2 |
| Credit system + billing | 2 |
| Canonical prompt management | 2 |

### Lower

| Feature | Phase |
|---------|-------|
| Instagram export bundles | 2 |
| Memory query UI | 3 |
| Character templates marketplace | 3 |
| Social OAuth | 4 |
| Webhooks | 4 |

---

## Open Decisions (Roadmap Impact)

| Decision | Impact on Phase 1 | Current Lean |
|----------|-------------------|--------------|
| Job processing: sync vs worker | Affects video UX | Sync for MVP |
| Auth provider | Blocks milestone 1 | Supabase |
| Higgsfield MCP vs direct API | Provider consolidation | Direct API in client |
| ShadCN adoption | UI velocity vs consistency | Defer to Phase 2 |

---

## Related Docs

- [project-memory.md](./project-memory.md) — detailed implementation status
- [product-prd.md](./product-prd.md) — requirements
- [architecture.md](./architecture.md) — system design
