# CharacterOS — Future Extensibility Plan

## Design Principles

1. **World-first:** Every new module must read from the World graph, not just Character
2. **Prompt-native:** New generation types add a template + handler, not a new system
3. **Provider-agnostic:** Image/video/LLM providers are swappable via Generation Router
4. **Schema-extensible:** Use `metadata Json?` fields before adding columns
5. **Stub early:** Create table stubs in MVP so migrations don't break later features

---

## Module Roadmap

```
MVP (Phase 1)          Phase 2              Phase 3              Phase 4
─────────────────────────────────────────────────────────────────────────
Character Creation     Video Generation     Marketplace          AI Agents
Character Bible        Instagram Publish    Character Templates  Multi-character
World Generation       Brand Deals          Story Packs          Collab Worlds
Asset Vault            Trending Reels       Fashion Packs        API Platform
Content Planner        TikTok Export        Location Packs       White-label
Image Generation       YouTube Shorts       Campaign Packs
Caption Generation     Social Scheduling    Creator Revenue
Instagram Export       Analytics            Commission System
Character Memory       A/B Testing
```

---

## 1. Video Generation (Phase 2)

### Architecture

```
ContentIdea (type: REEL)
    │
    ▼
Reel Handler
    │
    ├── LLM → trending-reel.md → script + scenes
    │
    └── Video Router
            ├── Higgsfield (TRENDING, UGC)
            ├── Veo (CINEMATIC, REVIEW)
            └── Kling (VLOG, TUTORIAL)
    │
    ▼
Reel record (videoUrl, thumbnailUrl, script)
    │
    ▼
Asset vault (type: VIDEO)
```

### Schema Additions (Migration 5)

```prisma
model VideoGenerationLog {
  id          String        @id @default(uuid())
  reelId      String
  provider    VideoProvider
  prompt      String        @db.Text
  parameters  Json
  status      GenerationJobStatus
  videoUrl    String?
  error       String?
  durationMs  Int?
  creditsUsed Int
  createdAt   DateTime      @default(now())

  reel Reel @relation(fields: [reelId], references: [id])
}
```

### Provider Interface

```typescript
interface VideoProvider {
  name: VideoProvider;
  generate(prompt: VideoPrompt, params: VideoParams): Promise<VideoResult>;
  estimateCredits(params: VideoParams): number;
  supportedFormats: ReelFormat[];
}
```

### Activation Steps
1. Implement `HiggsfieldProvider` in `src/lib/ai/providers/higgsfield.ts`
2. Activate `TRENDING_REEL` template handler
3. Add `POST /api/v1/characters/{id}/reels/generate` endpoint
4. Add video preview in Asset Vault UI
5. Enable credit pricing for video generation

---

## 2. Instagram Publishing (Phase 2)

### Architecture

```
Post (status: SCHEDULED)
    │
    ▼
Publishing Queue
    │
    ├── SocialConnection (Instagram OAuth token)
    │
    └── Instagram Graph API
            ├── Upload media container
            ├── Publish container
            └── Return media ID
    │
    ▼
Post (status: PUBLISHED, publishedAt, externalId)
```

### Schema Activation

Existing `SocialConnection` table activated with RLS:

```sql
CREATE POLICY "Users manage own connections" ON social_connections
  FOR ALL USING (auth.uid() = user_id);
```

### New Tables (Migration 7)

```prisma
model PublishingQueue {
  id          String   @id @default(uuid())
  postId      String
  platform    Platform
  scheduledAt DateTime
  status      Enum     // QUEUED, PUBLISHING, PUBLISHED, FAILED
  externalId  String?  // Platform media ID
  error       String?
  attempts    Int      @default(0)
  publishedAt DateTime?
  createdAt   DateTime @default(now())
}
```

### Activation Steps
1. Instagram Basic Display / Graph API OAuth flow
2. Store tokens in `SocialConnection`
3. Background cron (Supabase Edge Function) processes queue
4. Add "Publish" button on Post detail
5. Pro tier gate

---

## 3. Brand Deals (Phase 2)

### Architecture

Brand Deals are already in schema (`BrandDeal` → `Campaign` → `ProductPromotion`). Phase 2 activates the full workflow:

```
Brand Deal Created
    │
    ▼
Product Promotion Generated (product-promotion.md)
    │
    ├── Campaign auto-created
    ├── ContentIdeas[] with brand integration
    ├── Posts[] + Reels[] generated
    │
    ▼
Brand Deal Dashboard
    ├── Deliverable tracker
    ├── Approval workflow
    └── Performance metrics (Phase 3)
```

### Enhancements
- Brand guideline PDF upload → extract rules via LLM
- Deliverable approval status per content piece
- Brand-safe caption validation (LLM check against guidelines)
- Revenue tracking per deal

### No Schema Changes Required
Existing `BrandDeal`, `Campaign`, `ProductPromotion` tables sufficient for Phase 2.

---

## 4. Marketplace (Phase 3)

### Architecture

```
Creator publishes CharacterTemplate / WorldPack / StoryPack
    │
    ▼
MarketplaceListing (existing stub table)
    │
    ├── Preview assets (public)
    ├── Full payload (encrypted, delivered on purchase)
    │
    ▼
Buyer purchases → CreditTransaction
    │
    ▼
Template applied to new Character
    ├── bibleSeed → CharacterBible
    ├── worldSeed → World + Residence + Locations
    └── Customization wizard
```

### Schema Additions (Migration 8-10)

```prisma
model MarketplaceOrder {
  id        String   @id @default(uuid())
  listingId String
  buyerId   String
  sellerId  String
  price     Decimal
  status    Enum     // PENDING, COMPLETED, REFUNDED
  createdAt DateTime @default(now())
}

model MarketplaceReview {
  id        String @id @default(uuid())
  listingId String
  buyerId   String
  rating    Int
  comment   String?
  createdAt DateTime @default(now())
}

model CreatorPayout {
  id       String  @id @default(uuid())
  sellerId String
  amount   Decimal
  status   Enum    // PENDING, PAID
  period   String  // "2026-06"
}
```

### Revenue Model
- Platform commission: 20-30%
- Creator receives remainder via payout
- Credits or direct payment

### Pack Types
| Pack | Contents | Seed Field |
|------|----------|------------|
| Character Template | Bible + basic world | `CharacterTemplate.bibleSeed + worldSeed` |
| World Pack | Locations + residence + rooms | `MarketplaceListing.payload.worldSeed` |
| Story Pack | Pre-written ContentIdeas + narratives | `payload.storySeed` |
| Fashion Pack | Outfit[] presets | `payload.fashionSeed` |
| Location Pack | Location[] with prompts | `payload.locationSeed` |
| Campaign Pack | Full Campaign + ContentIdeas | `payload.campaignSeed` |

---

## 5. Character Templates (Phase 3)

### Architecture

Existing `CharacterTemplate` stub activated:

```
User selects template from marketplace or built-in gallery
    │
    ▼
Template Application Service
    │
    ├── Create Character (creationMode: TEMPLATE)
    ├── Apply bibleSeed → CharacterBible
    ├── Apply worldSeed → World graph
    ├── Queue image regeneration (personalize visuals)
    │
    ▼
Customization Wizard
    ├── Change name, city, niche
    ├── Re-generate world for new city
    └── Keep personality structure
```

### Built-in Templates (Launch Set)
- "Mumbai Lifestyle Girl"
- "NYC Finance Bro"
- "LA Fitness Creator"
- "London Fashion Student"
- "Dubai Luxury Influencer"

---

## 6. Character Memory (Phase 2 — Enhanced)

### MVP Implementation
Basic `POST /memory/query` using Context Builder + `memory-query.md` template.
Responses stored in `MemoryEntry` for conversation history.

### Phase 2 Enhancements

```
Memory System v2
    │
    ├── Vector Store (Supabase pgvector)
    │       ├── Embed all bible sections
    │       ├── Embed all location descriptions
    │       ├── Embed all content ideas + captions
    │       └── Embed all memory query/response pairs
    │
    ├── Semantic Search
    │       └── Query → top-K relevant context → LLM
    │
    ├── Memory Consolidation (cron)
    │       └── Summarize old entries into bible updates
    │
    └── Proactive Suggestions
            └── "Mimi's birthday is in 5 days — generate campaign?"
```

### Schema Addition

```prisma
model MemoryEmbedding {
  id          String   @id @default(uuid())
  characterId String
  sourceType  String   // "bible", "location", "content", "query"
  sourceId    String
  content     String   @db.Text
  embedding   Unsupported("vector(1536)")
  createdAt   DateTime @default(now())

  @@index([characterId])
}
```

Requires: `CREATE EXTENSION IF NOT EXISTS vector;` in Supabase.

---

## 7. Extensibility Patterns

### Adding a New Generation Type

1. Add enum value to `PromptTemplate` and `GenerationJobType`
2. Create template in `docs/prompts/<name>.md`
3. Create Zod output schema in `src/lib/validators/`
4. Create handler in `src/lib/jobs/handlers/`
5. Register in `job-processor.ts`
6. Add API endpoint in `src/app/api/v1/`
7. Add credit pricing in `credit-manager.ts`

### Adding a New Platform Export

1. Add enum value to `Platform`
2. Create export formatter in `src/lib/services/export.service.ts`
3. Add platform-specific caption/hashtag rules
4. Add export endpoint variant

### Adding a New Image/Video Provider

1. Implement provider interface in `src/lib/ai/providers/`
2. Register in `generation-router.ts` fallback chain
3. Add env var to `.env.example`
4. Add provider-specific parameter mapping

---

## Feature Flag Strategy

```typescript
// src/lib/feature-flags.ts
export const FEATURES = {
  VIDEO_GENERATION: process.env.FEATURE_VIDEO === 'true',
  INSTAGRAM_PUBLISH: process.env.FEATURE_PUBLISH === 'true',
  MARKETPLACE: process.env.FEATURE_MARKETPLACE === 'true',
  MEMORY_V2: process.env.FEATURE_MEMORY_V2 === 'true',
  BRAND_DEALS: process.env.FEATURE_BRAND_DEALS === 'true',
} as const;
```

All Phase 2+ features gated behind flags. MVP ships with all flags `false`.

---

## API Versioning

- MVP: `/api/v1/`
- Breaking changes: `/api/v2/` with v1 maintained for 6 months
- New modules can ship under v1 if additive (new endpoints only)

---

## Monitoring & Observability (Phase 2)

| Metric | Tool | Purpose |
|--------|------|---------|
| Generation success rate | Supabase logs | Provider health |
| Credit usage per user | Custom dashboard | Revenue tracking |
| Job queue depth | GenerationJob count | Scale workers |
| Prompt token usage | OpenAI/Anthropic dashboards | Cost optimization |
| World completion rate | World.isComplete analytics | Onboarding funnel |
| Content export rate | Post.exportBundle count | Feature adoption |
