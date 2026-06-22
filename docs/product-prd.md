# CharacterOS — Product Requirements Document

**Product:** CharacterOS — AI Character Studio & Content Engine  
**Tagline:** Character → World → Content  
**Version:** 1.0 (MVP in progress)  
**Last Updated:** 2026-06-14

---

## 1. Problem Statement

AI image and video tools treat each generation as isolated. Creators building virtual influencers lose consistency — characters forget where they live, what they wear, who their friends are, and how they post. Prompt engineering becomes the bottleneck.

CharacterOS solves this by persisting a character's **World** and generating content from that memory without exposing prompts to users.

---

## 2. Product Thesis

```
Character  →  World  →  Content
```

| Layer | Purpose | Moat |
|-------|---------|------|
| Character | Identity anchor | Entry point |
| World | Persistent environment (home, places, people, routines) | **Primary differentiator** |
| Content | Posts, reels, campaigns grounded in world memory | Monetizable output |

**Canonical example:** Mimi — 23-year-old lifestyle creator in Powai, Mumbai. Her value is not her face alone; it is her apartment, friends, habits, favorite cafes, and content style.

---

## 3. Target Users

| Segment | Need | CharacterOS Value |
|---------|------|-------------------|
| AI influencer creators | Consistent personas across posts/reels | World memory + production briefs |
| Social media managers | Scale fictional brand characters | Campaign planner + content calendar |
| Agencies / brands | Product promotion via authentic characters | Brand deals + product promotion flows |
| Hobbyist creators | Character creation without prompt expertise | Intent → brief → generate |

---

## 4. Core User Flows

### 4.1 Primary Flow (Implemented — Demo Mode)

1. Open Studio dashboard (`/`)
2. Select active character (Mimi in demo)
3. Click intent button (Post, Reel, Product Promotion, etc.)
4. System assembles human-readable Production Brief from world memory
5. Generation runs via Higgsfield (or mock)
6. Asset appears in Recent Content; derivative actions offered

### 4.2 Character Creation (Planned)

| Mode | Flow |
|------|------|
| QUICK | Preferences → AI random character |
| DEEP_BUILDER | Questionnaire → structured character + bible |
| TEMPLATE | Marketplace template (future) |

### 4.3 World Building (Planned)

Residence → rooms → location library → friend network → routines → outfits. World completeness flag gates high-quality brief assembly.

### 4.4 Content Planning (Planned)

Campaign → content ideas → scheduled briefs → generation → publish/export.

---

## 5. Functional Requirements

### 5.1 Must Have (MVP)

| ID | Requirement | Status |
|----|-------------|--------|
| FR-01 | Persist character identity + bible | Schema ✅ · Service ✅ · UI stub |
| FR-02 | Persist world (residence, rooms, locations, social) | Schema ✅ · Service ✅ · UI stub |
| FR-03 | Intent-first generation (no prompt UI) | ✅ Dashboard |
| FR-04 | Production Brief assembly from world context | ✅ |
| FR-05 | Higgsfield image/video generation | ✅ (mock fallback) |
| FR-06 | Asset vault + generation history | ✅ API · partial UI |
| FR-07 | Derivative actions (caption, reel/story version, product placement) | ✅ API |
| FR-08 | User auth + multi-tenancy | Planned |
| FR-09 | Database persistence (not demo-only) | Planned |
| FR-10 | Character + world creation UI | Planned |
| FR-11 | `/api/v1` REST API per contracts | Spec ✅ · Routes ❌ |

### 5.2 Should Have (Phase 2)

- Content calendar and campaign planner UI
- Brief edit/approve before generate
- Async job queue with polling
- Instagram export bundles
- Credit system + billing tiers
- Video generation at scale

### 5.3 Could Have (Phase 3+)

- Character template marketplace
- Natural language intent input
- Social OAuth + scheduling
- Analytics and A/B testing
- Autonomous content agents
- API platform / white-label

---

## 6. Non-Functional Requirements

| Area | Requirement |
|------|-------------|
| Consistency | Appearance, wardrobe, personality, location auto-injected on every generation |
| Privacy | Multi-tenant isolation via `userId`; Supabase RLS planned |
| Performance | Async jobs for long-running video generation (production) |
| Reliability | Provider fallbacks: Higgsfield → Fal/Replicate (images); Veo/Kling/Runway (video) |
| UX | Users never see raw prompts; only human-readable brief fields |
| Demo | Full studio works without DB or API keys (Mimi mock) |

---

## 7. Key Differentiators

1. **World-first architecture** — not just a face + bio
2. **No prompt engineering** — Production Brief Engine compiles hidden prompts
3. **Consistency layer** — traits injected automatically
4. **Higgsfield-first generation** — model auto-selected by content goal
5. **Derivative actions** — retention from a single asset
6. **Eight-module domain model** — maps 1:1 to schema and services

---

## 8. Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| Time to first generation | < 2 min from signup (with seeded character) |
| Brief assembly accuracy | Location/wardrobe/mood match world data ≥ 90% |
| Generation completion rate | ≥ 95% (excluding provider outages) |
| User retention signal | ≥ 2 derivative actions per 5 generations |
| World completeness | ≥ 80% of active characters have residence + 3+ locations |

---

## 9. Out of Scope (MVP)

- Marketplace and revenue share
- Multi-character collab worlds
- Autonomous AI agents
- Native mobile apps
- Direct social publishing (export only in Phase 2)

---

## 10. Open Product Decisions

| Decision | Options | Current Lean |
|----------|---------|--------------|
| Auth | Supabase vs Clerk | Supabase |
| NL intents | Preset buttons vs parser | Presets now; NL later |
| Job processing | Sync vs worker | Sync MVP; worker production |
| UI library | ShadCN vs custom Tailwind | Custom now |
| Free tier | 1 char / 50 assets | Documented |

---

## Related Docs

- [project-memory.md](./project-memory.md) — session context and implementation status
- [architecture.md](./architecture.md) — system design
- [roadmap.md](./roadmap.md) — phased delivery
- [ui-guidelines.md](./ui-guidelines.md) — design system
- [api/API_CONTRACTS.md](./api/API_CONTRACTS.md) — REST spec
