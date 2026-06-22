# CharacterOS — Folder Structure

```
characteros/
├── .env.example                        # Template for required env vars
├── package.json
├── tsconfig.json
│
├── prisma/
│   ├── schema.prisma                   # Full database schema
│   └── migrations/                     # Prisma migration history (planned)
│
├── docs/
│   ├── architecture/
│   │   ├── MODULE_ARCHITECTURE.md      # Eight modules + generation pipeline
│   │   ├── PRODUCT_ARCHITECTURE.md
│   │   ├── PRODUCTION_BRIEF_SYSTEM.md
│   │   ├── ER_DIAGRAM.md
│   │   ├── FOLDER_STRUCTURE.md         # This file
│   │   ├── MIGRATION_PLAN.md
│   │   └── EXTENSIBILITY.md
│   ├── api/
│   │   └── API_CONTRACTS.md
│   └── prompts/
│       ├── PROMPT_SYSTEM.md
│       ├── character-generation.md
│       ├── character-bible.md
│       ├── world-generation.md
│       ├── location-creation.md
│       ├── friend-creation.md
│       ├── lifestyle-generation.md
│       ├── content-calendar.md
│       ├── product-promotion.md
│       ├── instagram-caption.md
│       ├── trending-reel.md
│       └── hashtag-generation.md
│
├── src/
│   ├── lib/
│   │   ├── db/
│   │   │   └── prisma.ts               # Prisma client singleton
│   │   │
│   │   ├── modules/                    # Eight product modules + Generation
│   │   │   ├── index.ts                # Barrel export
│   │   │   │
│   │   │   ├── character-bible/
│   │   │   │   └── index.ts                      # Facade → services/character + bible
│   │   │   │
│   │   │   ├── world-builder/
│   │   │   │   └── index.ts                      # Facade → services/world
│   │   │   │
│   │   │   ├── location-library/
│   │   │   │   └── index.ts                      # Facade → services/world (locations)
│   │   │   │
│   │   │   ├── friend-network/
│   │   │   │   └── index.ts                      # Facade → services/world (social)
│   │   │   │
│   │   │   ├── content-planner/
│   │   │   │   ├── index.ts
│   │   │   │   └── content-planner.service.ts    # Stub — ContentIdea, Post, Reel
│   │   │   │
│   │   │   ├── campaign-planner/
│   │   │   │   ├── index.ts
│   │   │   │   └── campaign-planner.service.ts   # Stub — Campaign, BrandDeal
│   │   │   │
│   │   │   ├── asset-vault/
│   │   │   │   ├── index.ts
│   │   │   │   └── asset-vault.service.ts        # Stub — Asset, Prompt
│   │   │   │
│   │   │   ├── production-brief-engine/
│   │   │   │   └── index.ts                      # Facade → services + ai/brief-assembler
│   │   │   │
│   │   │   └── generation/                       # Re-exports src/lib/ai/ generation layer
│   │   │       └── index.ts                      # Higgsfield MCP + provider router facade
│   │   │
│   │   ├── services/                   # Core service implementations (wrapped by modules)
│   │   │   ├── index.ts
│   │   │   ├── character.service.ts
│   │   │   ├── bible.service.ts
│   │   │   ├── world.service.ts
│   │   │   └── production-brief.service.ts
│   │   │
│   │   ├── ai/                         # AI orchestration (wrapped by generation module)
│   │   │   ├── brief-assembler.ts
│   │   │   ├── context-builder.ts
│   │   │   ├── intent-parser.ts
│   │   │   ├── generation-router.ts
│   │   │   ├── mcp/
│   │   │   │   └── generation-client.ts    # Higgsfield MCP client
│   │   │   └── providers/
│   │   │       ├── higgsfield-mcp.provider.ts
│   │   │       ├── fal.provider.ts
│   │   │       ├── replicate.provider.ts
│   │   │       └── openai.provider.ts
│   │   │
│   │   └── validators/                 # Zod schemas
│   │       ├── character.schema.ts
│   │       └── world.schema.ts
│   │
│   └── types/
│       ├── character.ts
│       ├── world.ts
│       ├── production-brief.ts
│       └── generation.ts
│
└── dist/                               # Compiled output (tsc)
```

---

## Module → Entity Mapping

| Module Directory | Owns (Prisma models) |
|------------------|----------------------|
| `character-bible/` | `Character`, `CharacterBible`, `Occupation`, `Routine`, `Hobby`, `Outfit` |
| `world-builder/` | `World`, `Residence`, `Room` |
| `location-library/` | `Location` |
| `friend-network/` | `Friend`, `FamilyMember`, `Pet` |
| `content-planner/` | `ContentIdea`, `Post`, `Reel`, `ProductPromotion` |
| `campaign-planner/` | `Campaign`, `BrandDeal`, `WorldEvent` |
| `asset-vault/` | `Asset`, `Prompt` |
| `production-brief-engine/` | `ProductionBrief` |
| `generation/` | `GenerationJob` (orchestration only) |

See [MODULE_ARCHITECTURE.md](./MODULE_ARCHITECTURE.md) for full ownership rules and generation pipeline.

---

## Layer Responsibilities

| Layer | Directory | Responsibility |
|-------|-----------|----------------|
| **Modules** | `src/lib/modules/` | Domain business logic, one folder per product module |
| **Generation** | `src/lib/modules/generation/` | Higgsfield MCP bridge, provider routing, job dispatch |
| **Validators** | `src/lib/validators/` | Zod input/output schemas |
| **Types** | `src/types/` | Shared TypeScript interfaces |
| **DB** | `prisma/` + `src/lib/db/` | Schema, migrations, Prisma client |
| **Docs** | `docs/` | Architecture, API contracts, prompt templates |

---

## Planned (not yet in repo)

These paths from the original plan remain for Phase 2+ implementation:

```
src/app/api/v1/                         # Next.js route handlers
src/lib/supabase/                       # Auth + storage clients
src/lib/jobs/                           # Async generation job processor
src/components/                         # UI (ShadCN)
```

The flat `src/lib/services/` and `src/lib/ai/` directories hold **implementations**; `src/lib/modules/` exposes **module-facing facades** that thin-wrap them. Do not duplicate logic in both places.

---

## Environment Variables

```env
# Database
DATABASE_URL=postgresql://...
DIRECT_URL=postgresql://...

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Image Generation
FAL_API_KEY=...
REPLICATE_API_TOKEN=r8_...

# Video Generation — Higgsfield MCP (Provider #1)
HIGGSFIELD_API_KEY=
GOOGLE_VEO_API_KEY=
KLING_API_KEY=
```

---

## Import Aliases

```json
// tsconfig.json paths
{
  "@/*": ["./src/*"]
}
```

Usage:

```typescript
import { productionBriefService } from "@/lib/modules/production-brief-engine";
import { routeGeneration } from "@/lib/modules/generation";
```
