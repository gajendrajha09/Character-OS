# CharacterOS

**AI Character Studio & Content Engine**

> Character → World → Content

CharacterOS is the permanent memory system for AI characters. Unlike generic AI image tools, it remembers everything about a character's world — where they live, who their friends are, what they wear, where they go — and generates consistent content from that world.

---

## Eight-Module Architecture

```
CharacterOS
├ Character Bible          → identity, personality, lifestyle
├ World Builder            → home, residence, rooms
├ Location Library         → cafes, gyms, favorite places
├ Friend Network           → friends, family, pets
├ Content Planner          → ideas, posts, reels
├ Campaign Planner         → campaigns, brand deals, events
├ Asset Vault              → images, videos, prompts
└ Production Brief Engine  → intent → human-readable brief

              ↓

        Higgsfield MCP (+ Fal, OpenAI, Replicate fallbacks)

              ↓

     Images / Videos / Reels
```

Users express **intent** (e.g. "Generate Monday Morning Reel"). The Production Brief Engine reads world memory, assembles a brief, and the Generation layer dispatches to **Higgsfield MCP** for video and **Fal AI** / **OpenAI** for images and text — no prompt engineering required.

Full module spec: [Module Architecture](docs/architecture/MODULE_ARCHITECTURE.md)

---

## Architecture Documentation

| Document | Description |
|----------|-------------|
| [Module Architecture](docs/architecture/MODULE_ARCHITECTURE.md) | Eight modules, entity mapping, generation pipeline, Mimi example |
| [Product Architecture](docs/architecture/PRODUCT_ARCHITECTURE.md) | Entity definitions, relationships, system design |
| [Production Brief Engine](docs/architecture/PRODUCTION_BRIEF_ENGINE.md) | Backend implementation: intent → brief → MCP |
| [Production Brief System](docs/architecture/PRODUCTION_BRIEF_SYSTEM.md) | Intent → brief → MCP generation flow |
| [ER Diagram](docs/architecture/ER_DIAGRAM.md) | Full entity-relationship diagram |
| [Prisma Schema](prisma/schema.prisma) | Complete database schema |
| [API Contracts](docs/api/API_CONTRACTS.md) | REST API endpoint specifications |
| [Folder Structure](docs/architecture/FOLDER_STRUCTURE.md) | Project directory layout |
| [Prompt System](docs/prompts/PROMPT_SYSTEM.md) | AI prompt engine architecture |

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | TypeScript, Prisma, Supabase (planned) |
| Database | PostgreSQL |
| LLM | OpenAI GPT-5 / Claude (fallback) |
| Image | Fal AI (primary), Replicate (fallback) |
| Video | **Higgsfield MCP** (primary), Veo, Kling (fallback) |

---

## Backend Modules

Core services under `src/lib/`:

| Module | Path |
|--------|------|
| Character Database | `src/lib/services/character.service.ts` |
| World Builder | `src/lib/services/world.service.ts` |
| Character Bible | `src/lib/services/bible.service.ts` |
| Production Brief Engine | `src/lib/services/production-brief.service.ts` |
| Context Builder | `src/lib/ai/context-builder.ts` |
| Brief Assembler | `src/lib/ai/brief-assembler.ts` |
| Intent Parser | `src/lib/ai/intent-parser.ts` |
| Generation Router | `src/lib/ai/generation-router.ts` |
| Higgsfield MCP Client | `src/lib/ai/mcp/generation-client.ts` |
| Providers | `src/lib/ai/providers/` (Higgsfield, OpenAI, Fal, Replicate) |

---

## Getting Started

```bash
npm install
cp .env.example .env.local
npm run db:validate
npm run db:generate
npm run typecheck
```

---

## Docker

Build and run with Docker Compose:

```bash
docker compose up --build
```

App will be available at `http://localhost:3000` and PostgreSQL at `localhost:5432`.

To run Prisma migrations against the Docker database:

```bash
docker compose exec app npx prisma migrate deploy
```

To stop containers:

```bash
docker compose down
```

---

## License

Proprietary. All rights reserved.
