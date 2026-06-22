# CharacterOS — Database Migration Plan

## Overview

Migrations are applied in four phases, each building on the previous. All migrations use Prisma Migrate against Supabase PostgreSQL.

**Command workflow:**
```bash
npx prisma migrate dev --name <migration_name>
npx prisma generate
npx prisma db push  # dev only, if needed
```

---

## Migration 1: Foundation (`20260614000000_init`)

**Purpose:** User profiles, character layer, core enums.

### Tables Created
- `user_profiles`
- `credit_transactions`
- `characters`
- `character_bibles`

### Enums Created
- `CharacterStatus`, `CreationMode`, `SubscriptionTier`

### Indexes
- `characters(user_id)`
- `characters(user_id, slug)` UNIQUE
- `credit_transactions(user_id)`

### Supabase RLS Policies
```sql
-- user_profiles: users can only read/update their own profile
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON user_profiles
  FOR ALL USING (auth.uid() = user_id);

-- characters: users can only access their own characters
ALTER TABLE characters ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own characters" ON characters
  FOR ALL USING (auth.uid() = user_id);

-- character_bibles: access via character ownership
ALTER TABLE character_bibles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users access own bibles" ON character_bibles
  FOR ALL USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );
```

### Seed Data
None (user-generated only).

### Rollback
Drop tables in reverse order: `character_bibles` → `characters` → `credit_transactions` → `user_profiles`.

---

## Migration 2: World Layer (`20260614000001_world_layer`)

**Purpose:** The moat — World, Residence, Rooms, Locations, Social Circle, Lifestyle.

### Tables Created
- `worlds`
- `residences`
- `rooms`
- `locations`
- `friends`
- `family_members`
- `pets`
- `world_events`
- `occupations`
- `routines`
- `hobbies`
- `outfits`

### Enums Created
- `ResidenceType`, `InteriorStyle`, `RoomType`, `LocationType`, `VisitFrequency`
- `FriendRelation`, `FamilyRelation`, `PetSpecies`, `WorldEventType`
- `WorkStyle`, `RoutineType`, `SkillLevel`, `HobbyFrequency`, `OutfitOccasion`

### Indexes
- `worlds(character_id)` UNIQUE
- `residences(world_id)` UNIQUE
- `rooms(residence_id)`
- `locations(world_id)`, `locations(world_id, type)`
- `friends(world_id)`, `family_members(world_id)`, `pets(world_id)`
- `world_events(world_id)`, `world_events(world_id, date)`
- `routines(character_id)`, `hobbies(character_id)`, `outfits(character_id)`

### Foreign Key Notes
- `occupations.workplace_location_id` → `locations.id` (SetNull on delete)
- `routines.location_id` → `locations.id` (SetNull on delete)
- All World children cascade on World delete

### Supabase RLS Policies
```sql
-- Pattern: access via character ownership chain
CREATE POLICY "Users access own worlds" ON worlds
  FOR ALL USING (
    character_id IN (SELECT id FROM characters WHERE user_id = auth.uid())
  );

-- Apply same pattern to: residences, rooms, locations, friends,
-- family_members, pets, world_events, occupations, routines, hobbies, outfits
```

### Data Integrity Rules
- One World per Character (enforced by UNIQUE on `worlds.character_id`)
- One Residence per World (enforced by UNIQUE on `residences.world_id`)
- One Occupation per Character (enforced by UNIQUE on `occupations.character_id`)

### Rollback
Drop all world layer tables. Character layer unaffected.

---

## Migration 3: Content Layer (`20260614000002_content_layer`)

**Purpose:** Assets, Prompts, Campaigns, Content generation outputs.

### Tables Created
- `prompts`
- `assets`
- `brand_deals`
- `campaigns`
- `content_ideas`
- `posts`
- `reels`
- `product_promotions`
- `generation_jobs`

### Enums Created
- `AssetType`, `PromptType`, `PromptTemplate`
- `CampaignType`, `CampaignStatus`
- `ContentIdeaType`, `ContentIdeaStatus`
- `Platform`, `BrandDealStatus`
- `PostFormat`, `PostStatus`
- `ReelFormat`, `VideoProvider`, `ReelStatus`
- `ProductPromotionStatus`
- `GenerationJobStatus`, `GenerationJobType`

### Indexes
- `prompts(character_id)`, `prompts(character_id, template)`
- `assets(character_id)`, `assets(character_id, type)`
- `assets(location_id)`, `assets(room_id)`, `assets(campaign_id)`
- `campaigns(character_id)`, `campaigns(character_id, status)`
- `content_ideas(character_id)`, `content_ideas(campaign_id)`
- `content_ideas(character_id, scheduled_date)`
- `posts(character_id)`, `posts(character_id, status)`
- `reels(character_id)`, `reels(character_id, status)`
- `generation_jobs(character_id)`, `generation_jobs(user_id, status)`

### Foreign Key Notes
- `residences.prompt_id`, `rooms.prompt_id`, `locations.prompt_id`, `outfits.prompt_id`, `friends.prompt_id` → `prompts.id` (SetNull)
- `content_ideas.content_idea_id` on Post/Reel is UNIQUE (1:1)
- `campaigns.brand_deal_id` → SetNull on BrandDeal delete

### Supabase RLS
Same ownership chain pattern via `character_id → characters.user_id`.

### Supabase Storage Buckets
```sql
-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES
  ('character-assets', 'character-assets', true),
  ('character-exports', 'character-exports', false);

-- RLS: users upload to their character's folder
CREATE POLICY "Users upload own assets" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'character-assets' AND
    (storage.foldername(name))[1] IN (
      SELECT id::text FROM characters WHERE user_id = auth.uid()
    )
  );
```

### Rollback
Drop content layer tables. World + Character layers unaffected.

---

## Migration 4: Extensibility Stubs (`20260614000003_extensibility_stubs`)

**Purpose:** Future module tables — empty scaffolding, no active logic.

### Tables Created
- `character_templates`
- `memory_entries`
- `social_connections`
- `marketplace_listings`

### Notes
- These tables exist in schema but have **no API endpoints** in MVP
- No RLS policies until feature activation
- Indexed for future query patterns

### Rollback
Drop all four tables. No dependencies from MVP tables.

---

## Migration Execution Order

```
Phase 1 (MVP Launch):
  ✅ Migration 1: Foundation
  ✅ Migration 2: World Layer
  ✅ Migration 3: Content Layer
  ⬜ Migration 4: Extensibility Stubs (can ship with MVP, inactive)

Phase 2 (Video + Publishing):
  ⬜ Migration 5: video_generation_logs
  ⬜ Migration 6: social_connections RLS + activation
  ⬜ Migration 7: publishing_queue

Phase 3 (Marketplace):
  ⬜ Migration 8: marketplace_orders
  ⬜ Migration 9: marketplace_reviews
  ⬜ Migration 10: creator_payouts
```

---

## Migration Checklist (Per Migration)

- [ ] Update `prisma/schema.prisma`
- [ ] Run `npx prisma migrate dev --name <name>`
- [ ] Run `npx prisma generate`
- [ ] Apply Supabase RLS policies (manual SQL in `supabase/migrations/`)
- [ ] Verify indexes with `\di` in psql
- [ ] Test cascade deletes on staging
- [ ] Update API validators if schema changed
- [ ] Document breaking changes in CHANGELOG

---

## Zero-Downtime Strategy (Production)

1. All migrations must be **additive** (add columns/tables, never rename/drop in production)
2. Column renames: add new column → dual-write → migrate data → drop old column (separate migration)
3. Enum additions: safe (PostgreSQL adds enum values without lock)
4. Index creation: use `CREATE INDEX CONCURRENTLY` for large tables
5. RLS policy changes: test on staging with production-like data volume

---

## Backup & Recovery

| Environment | Backup Frequency | Retention |
|-------------|-----------------|-----------|
| Development | Manual | N/A |
| Staging | Daily (Supabase) | 7 days |
| Production | Daily (Supabase) + PITR | 30 days |

**Recovery procedure:**
1. Restore Supabase backup to new project
2. Update `DATABASE_URL` and `DIRECT_URL`
3. Run `npx prisma migrate deploy` to ensure schema sync
4. Verify RLS policies applied
