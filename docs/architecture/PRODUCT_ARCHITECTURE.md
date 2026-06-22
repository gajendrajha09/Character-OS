# CharacterOS — Product Architecture Document

**Product:** CharacterOS — AI Character Studio & Content Engine  
**Version:** 1.0.0 (Architecture Phase)  
**Status:** Pre-implementation  
**Last Updated:** 2026-06-14

---

## 1. Executive Summary

CharacterOS is a character memory and content engine. Unlike generic AI image tools, CharacterOS persists a character's **World** — residence, relationships, habits, favorite places, fashion, and content style — and uses that world to generate infinite, consistent content.

### Core Thesis

```
Character  →  World  →  Content
```

Most competitors stop at **Character** (a face + bio). CharacterOS's moat is the **World**:

> Mimi isn't valuable because she's a face. She's valuable because she lives in Powai, has a specific apartment, specific friends, specific habits, specific favorite places, and a specific content style. That world generates infinite content.

Every subsystem is designed around this hierarchy:

| Layer | Purpose | Moat Value |
|-------|---------|------------|
| **Character** | Identity anchor — who they are | Entry point |
| **World** | Persistent environment — where/how they live | **Primary differentiator** |
| **Content** | Generated outputs grounded in world memory | Monetizable output |

---

## 2. Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, ShadCN, Tailwind CSS |
| Backend | Supabase (Auth, Storage, Realtime, Edge Functions) |
| Database | PostgreSQL (via Supabase) |
| ORM | Prisma |
| LLM | OpenAI GPT-5 (primary) / Claude (fallback) |
| Image Generation | Fal AI (primary) / Replicate (fallback) |
| Video Generation | **Higgsfield MCP** (primary) / Veo, Kling (fallback) |

---

## 3. Module Architecture

CharacterOS is organized into **eight product modules** plus a shared **Generation** layer. Each module owns a domain slice of the world graph and maps to Prisma entities.

```
CharacterOS
├ Character Bible          → Character, CharacterBible, Occupation, Routine, Hobby, Outfit
├ World Builder            → World, Residence, Room
├ Location Library         → Location
├ Friend Network           → Friend, FamilyMember, Pet
├ Content Planner          → ContentIdea, Post, Reel
├ Campaign Planner         → Campaign, BrandDeal, WorldEvent
├ Asset Vault              → Asset, Prompt
└ Production Brief Engine  → ProductionBrief

              ↓

        Generation Layer
        (Higgsfield MCP + Provider Router)

              ↓

     Images / Videos / Reels
```

**Generation pipeline:** Users express intent → Production Brief Engine assembles a human-readable brief and compiles provider payloads → Generation layer dispatches via **Higgsfield MCP** (Provider #1 for video), **Fal AI** (images, Replicate fallback), and **OpenAI** (script, caption, hashtags).

Full module ownership, entity mapping, diagrams, and the Mimi "Monday Morning Reel" walkthrough: **[MODULE_ARCHITECTURE.md](./MODULE_ARCHITECTURE.md)** · [Production Brief System](./PRODUCTION_BRIEF_SYSTEM.md)

Backend stubs: `src/lib/modules/`

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     Next.js 15 App (App Router)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │ Character│  │   World  │  │ Content  │  │  Asset Vault     │ │
│  │  Module  │  │  Module  │  │  Engine  │  │                  │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
└───────┼─────────────┼─────────────┼──────────────────┼───────────┘
        │             │             │                  │
        ▼             ▼             ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│              API Layer (Next.js Route Handlers)                  │
│  ┌─────────────┐  ┌──────────────┐  ┌────────────────────────┐  │
│  │ Character   │  │ World        │  │ Content                │  │
│  │ Service     │  │ Service      │  │ Service                │  │
│  └──────┬──────┘  └──────┬───────┘  └───────────┬────────────┘  │
│         │                │                      │               │
│  ┌──────┴────────────────┴──────────────────────┴────────────┐  │
│  │              AI Orchestration Layer                        │  │
│  │  Prompt Engine │ Context Builder │ Generation Router       │  │
│  └──────┬─────────────────┬──────────────────┬───────────────┘  │
└─────────┼─────────────────┼──────────────────┼──────────────────┘
          │                 │                  │
          ▼                 ▼                  ▼
   ┌────────────┐   ┌─────────────┐   ┌──────────────────┐
   │ PostgreSQL │   │  Supabase   │   │ External APIs    │
   │  (Prisma)  │   │  Storage    │   │ OpenAI / Fal /   │
   │            │   │  Auth       │   │ Replicate        │
   └────────────┘   └─────────────┘   └──────────────────┘
```

### Request Flow: Content Generation

```
User Request
    │
    ▼
Content Service
    │
    ├── Load Character + Bible
    ├── Load World (Residence, Rooms, Locations, Social Circle)
    ├── Load relevant Assets + Prompts (visual consistency)
    ├── Build enriched context via Context Builder
    ├── Select prompt template
    ├── Call LLM (caption/plan) or Image API (visual)
    ├── Persist ContentIdea / Post / Asset
    └── Return structured output
```

---

## 5. Domain Model Overview

### 4.1 Three-Layer Entity Hierarchy

```
Character (identity)
    │
    ├── CharacterBible (structured personality & lifestyle profile)
    │
    └── World (environment container — THE MOAT)
            │
            ├── Residence
            │       └── Room[]
            │
            ├── Location[] (favorite places outside home)
            ├── Friend[]
            ├── FamilyMember[]
            ├── Pet[]
            ├── WorldEvent[] (birthdays, festivals, local events)
            │
            └── (linked lifestyle entities)
                    ├── Occupation
                    ├── Routine[]
                    ├── Hobby[]
                    └── Outfit[]

Content Layer (outputs grounded in World)
    │
    ├── Campaign[]
    │       ├── ContentIdea[]
    │       └── BrandDeal? (optional)
    │
    ├── Post[]
    ├── Reel[]
    ├── ProductPromotion[]
    │
    └── Asset[] (images, videos, prompts, workflows)
            └── Prompt (generation recipe)
```

---

## 6. Entity Definitions

### 5.1 Character Layer

#### Character
The root identity entity. Owns a World and all downstream content.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| userId | UUID | Supabase auth user |
| name | String | Display name |
| slug | String | URL-safe identifier |
| avatarUrl | String? | Primary portrait |
| age | Int? | Character age |
| birthday | DateTime? | For calendar events |
| status | Enum | DRAFT, ACTIVE, ARCHIVED |
| creationMode | Enum | QUICK, DEEP_BUILDER, TEMPLATE |
| contentNiche | String? | e.g. "Lifestyle Creator" |
| brandVoice | String? | Social media tone |
| socialMediaStyle | Json? | Platform-specific style prefs |
| metadata | Json? | Extensibility bag |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Relationships:**
- 1:1 → CharacterBible
- 1:1 → World
- 1:1 → Occupation
- 1:N → Routine, Hobby, Outfit
- 1:N → Asset, Campaign, Post, Reel, ProductPromotion

---

#### CharacterBible
Auto-generated structured profile. Source of truth for AI context injection.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| characterId | UUID | FK → Character (unique) |
| identity | Json | Name, age, height, languages, education, income |
| personality | Json | Traits: introvert/extrovert, funny, luxury, etc. |
| home | Json | City, neighborhood, design style summary |
| socialCircle | Json | Summary of relationships |
| lifestyle | Json | Restaurants, cafes, gyms, travel, weekend activities |
| fashion | Json | Hair, makeup, accessories, brands, wardrobe |
| goals | Json | Short/long-term character goals |
| dailyRoutine | Json | Morning/evening routines |
| favoritePlaces | Json | Place summaries |
| version | Int | Bible revision number |
| generatedAt | DateTime | Last AI generation timestamp |
| rawMarkdown | Text? | Human-readable bible export |

**Relationships:**
- N:1 → Character

---

### 5.2 World Layer (The Moat)

#### World
Explicit container for everything that makes a character's environment persistent and generative.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| characterId | UUID | FK → Character (unique) |
| name | String | e.g. "Mimi's Mumbai World" |
| city | String | Primary city |
| country | String? | |
| timezone | String? | For calendar/scheduling |
| culture | Json? | Local culture context |
| summary | Text? | AI-generated world overview |
| isComplete | Boolean | World generation finished |
| createdAt | DateTime | |
| updatedAt | DateTime | |

**Relationships:**
- 1:1 → Character
- 1:1 → Residence
- 1:N → Location, Friend, FamilyMember, Pet, WorldEvent

---

#### Residence
Character's home — apartment or house within the World.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| worldId | UUID | FK → World (unique) |
| type | Enum | APARTMENT, HOUSE, STUDIO, PENTHOUSE |
| neighborhood | String | e.g. "Powai" |
| address | String? | Fictional address |
| floor | Int? | |
| squareMeters | Float? | |
| interiorStyle | Enum | MINIMALIST, BOHEMIAN, LUXURY, etc. |
| exteriorDescription | Text? | Building/street view |
| viewDescription | Text? | Balcony/window view |
| description | Text | Full residence narrative |
| imageUrl | String? | Exterior image |
| promptId | UUID? | FK → Prompt used for generation |

**Relationships:**
- 1:1 → World
- 1:N → Room

---

#### Room
Individual spaces within a Residence.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| residenceId | UUID | FK → Residence |
| type | Enum | BEDROOM, LIVING_ROOM, KITCHEN, BATHROOM, BALCONY, HOME_OFFICE |
| name | String | Display name |
| description | Text | Interior narrative |
| designDetails | Json? | Furniture, colors, decor |
| story | Text? | Narrative connection to character |
| imageUrl | String? | Generated image |
| promptId | UUID? | FK → Prompt |
| sortOrder | Int | Display ordering |

**Relationships:**
- N:1 → Residence
- 1:N → Asset (room-specific assets)

---

#### Location
Favorite places outside the home — cafes, gyms, malls, offices, universities.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| worldId | UUID | FK → World |
| type | Enum | CAFE, RESTAURANT, GYM, MALL, OFFICE, UNIVERSITY, PARK, NIGHTLIFE, OTHER |
| name | String | e.g. "Blue Tokai, Powai" |
| description | Text | Place narrative |
| relationship | Text? | Why character loves this place |
| story | Text? | Memorable moment at this location |
| address | String? | Fictional address |
| visitFrequency | Enum | DAILY, WEEKLY, MONTHLY, OCCASIONAL |
| imageUrl | String? | Generated image |
| promptId | UUID? | FK → Prompt |
| isFavorite | Boolean | Top-tier favorite |

**Relationships:**
- N:1 → World
- 1:N → Asset, ContentIdea

---

#### Friend
Social circle — friends linked to the World.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| worldId | UUID | FK → World |
| name | String | |
| age | Int? | |
| occupation | String? | |
| personality | Json? | Trait summary |
| relationship | Enum | BEST_FRIEND, CLOSE_FRIEND, ACQUAINTANCE, COLLEAGUE, NEIGHBOR |
| description | Text | How they know the character |
| story | Text? | Shared history |
| appearance | Text? | Visual description for image gen |
| imageUrl | String? | Portrait |
| promptId | UUID? | FK → Prompt |

**Relationships:**
- N:1 → World

---

#### FamilyMember

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| worldId | UUID | FK → World |
| name | String | |
| relation | Enum | MOTHER, FATHER, SIBLING, GRANDPARENT, COUSIN, OTHER |
| age | Int? | |
| occupation | String? | |
| personality | Json? | |
| description | Text | |
| livesWith | Boolean | Co-resident |
| appearance | Text? | |
| imageUrl | String? | |

**Relationships:**
- N:1 → World

---

#### Pet

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| worldId | UUID | FK → World |
| name | String | |
| species | Enum | DOG, CAT, BIRD, FISH, OTHER |
| breed | String? | |
| personality | Json? | |
| description | Text | |
| appearance | Text? | |
| imageUrl | String? | |

**Relationships:**
- N:1 → World

---

#### WorldEvent
Calendar events within the character's world — birthdays, festivals, local events, brand moments.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| worldId | UUID | FK → World |
| title | String | |
| type | Enum | BIRTHDAY, FESTIVAL, LOCAL_EVENT, SEASONAL, BRAND, CUSTOM |
| date | DateTime | Event date |
| recurring | Boolean | Annual repeat |
| description | Text? | |
| contentOpportunity | Text? | AI-suggested content angle |
| locationId | UUID? | FK → Location (optional) |

**Relationships:**
- N:1 → World
- N:1 → Location (optional)
- 1:N → ContentIdea

---

### 5.3 Lifestyle Entities

#### Occupation

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| characterId | UUID | FK → Character (unique) |
| title | String | e.g. "Marketing Executive" |
| company | String? | |
| industry | String? | |
| income | String? | Range descriptor |
| workStyle | Enum | REMOTE, HYBRID, OFFICE |
| description | Text | |
| workplaceLocationId | UUID? | FK → Location (office) |

**Relationships:**
- 1:1 → Character
- N:1 → Location (workplace, optional)

---

#### Routine

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| characterId | UUID | FK → Character |
| type | Enum | MORNING, AFTERNOON, EVENING, WEEKEND |
| title | String | e.g. "Morning Coffee Ritual" |
| schedule | Json | Time blocks |
| description | Text | |
| locationId | UUID? | FK → Location (where routine happens) |

**Relationships:**
- N:1 → Character
- N:1 → Location (optional)

---

#### Hobby

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| characterId | UUID | FK → Character |
| name | String | e.g. "Photography" |
| skillLevel | Enum | BEGINNER, INTERMEDIATE, ADVANCED |
| frequency | Enum | DAILY, WEEKLY, MONTHLY |
| description | Text | |
| contentPotential | Text? | How this hobby drives content |

**Relationships:**
- N:1 → Character

---

#### Outfit

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| characterId | UUID | FK → Character |
| name | String | e.g. "Luxury Dinner Look" |
| occasion | Enum | CASUAL, WORK, GYM, FORMAL, TRAVEL, DATE, CONTENT_SHOOT |
| description | Text | Full outfit narrative |
| items | Json | Top, bottom, shoes, accessories |
| brands | Json? | Brand names |
| hairStyle | String? | |
| makeup | String? | |
| imageUrl | String? | Reference image |
| promptId | UUID? | FK → Prompt |

**Relationships:**
- N:1 → Character

---

### 5.4 Asset Layer

#### Asset
Universal media vault entry — images, videos, voice models, LoRAs, workflows.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| characterId | UUID | FK → Character |
| type | Enum | IMAGE, VIDEO, AUDIO, PROMPT, WORKFLOW, LORA, DOCUMENT |
| name | String | |
| url | String | Supabase Storage URL |
| thumbnailUrl | String? | |
| mimeType | String? | |
| fileSize | Int? | Bytes |
| width | Int? | Image/video width |
| height | Int? | |
| tags | String[] | Searchable tags |
| locationId | UUID? | FK → Location |
| roomId | UUID? | FK → Room |
| campaignId | UUID? | FK → Campaign |
| promptId | UUID? | FK → Prompt (generation recipe) |
| metadata | Json? | Provider, model, seed, etc. |
| createdAt | DateTime | |

**Relationships:**
- N:1 → Character
- N:1 → Location, Room, Campaign, Prompt (all optional)

---

#### Prompt
Reusable generation recipe — the DNA of visual consistency.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| characterId | UUID | FK → Character |
| name | String | e.g. "Mimi Bedroom — Morning Light" |
| type | Enum | IMAGE, VIDEO, CAPTION, NEGATIVE |
| template | Enum | Which system template was used |
| positivePrompt | Text | Main prompt text |
| negativePrompt | Text? | |
| model | String? | fal-ai/flux-pro, etc. |
| parameters | Json? | Steps, guidance, seed, LoRA refs |
| version | Int | Prompt revision |
| isCanonical | Boolean | Primary reference prompt for entity |
| createdAt | DateTime | |

**Relationships:**
- N:1 → Character
- 1:N → Asset, Location, Room, Outfit (referenced by)

---

### 5.5 Content Layer

#### Campaign
Content planning container — weekly/monthly/seasonal/brand campaigns.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| characterId | UUID | FK → Character |
| title | String | |
| type | Enum | WEEKLY, MONTHLY, SEASONAL, BRAND, EVENT, CUSTOM |
| goal | Text? | Campaign objective |
| platform | Enum[] | INSTAGRAM, TIKTOK, YOUTUBE, etc. |
| startDate | DateTime | |
| endDate | DateTime | |
| status | Enum | DRAFT, ACTIVE, COMPLETED, ARCHIVED |
| brief | Json? | Full campaign brief |
| brandDealId | UUID? | FK → BrandDeal (optional) |
| createdAt | DateTime | |

**Relationships:**
- N:1 → Character
- N:1 → BrandDeal (optional)
- 1:N → ContentIdea, Post, Asset

---

#### ContentIdea
Planned content piece before generation.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| characterId | UUID | FK → Character |
| campaignId | UUID? | FK → Campaign |
| worldEventId | UUID? | FK → WorldEvent |
| title | String | |
| type | Enum | POST, REEL, STORY, CAROUSEL, VLOG |
| platform | Enum | Target platform |
| concept | Text | Content concept description |
| locationId | UUID? | FK → Location (where content is set) |
| outfitId | UUID? | FK → Outfit |
| scheduledDate | DateTime? | Planned publish date |
| status | Enum | IDEA, PLANNED, GENERATED, PUBLISHED |
| caption | Text? | Generated caption |
| hashtags | String[]? | Generated hashtags |
| imagePrompt | Text? | Image generation prompt |
| sortOrder | Int? | Calendar ordering |

**Relationships:**
- N:1 → Character, Campaign, WorldEvent, Location, Outfit (optional)

---

#### BrandDeal
Monetization partnership linked to campaigns.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| characterId | UUID | FK → Character |
| brandName | String | e.g. "Nike" |
| product | String | Product name |
| budget | Decimal? | |
| deliverables | Json | Required content pieces |
| guidelines | Text? | Brand guidelines |
| status | Enum | PROPOSED, ACTIVE, COMPLETED |
| startDate | DateTime? | |
| endDate | DateTime? | |

**Relationships:**
- N:1 → Character
- 1:N → Campaign, ProductPromotion

---

#### Post
Generated static social post (Instagram, Threads, etc.).

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| characterId | UUID | FK → Character |
| campaignId | UUID? | FK → Campaign |
| contentIdeaId | UUID? | FK → ContentIdea |
| platform | Enum | INSTAGRAM, THREADS, FACEBOOK, X |
| format | Enum | SINGLE, CAROUSEL, STORY |
| caption | Text | |
| hashtags | String[] | |
| altText | Text? | Accessibility |
| assetIds | UUID[] | FK references to Asset |
| scheduledAt | DateTime? | |
| publishedAt | DateTime? | |
| status | Enum | DRAFT, SCHEDULED, PUBLISHED, ARCHIVED |
| exportBundle | Json? | Full export package metadata |

**Relationships:**
- N:1 → Character, Campaign, ContentIdea (optional)
- References → Asset[] (via assetIds)

---

#### Reel
Generated video content (Phase 2+ with Higgsfield/Veo/Kling).

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| characterId | UUID | FK → Character |
| campaignId | UUID? | FK → Campaign |
| contentIdeaId | UUID? | FK → ContentIdea |
| platform | Enum | INSTAGRAM, TIKTOK, YOUTUBE_SHORTS |
| title | String | |
| caption | Text | |
| hashtags | String[] | |
| videoUrl | String? | Generated video |
| thumbnailUrl | String? | |
| duration | Int? | Seconds |
| format | Enum | TRENDING, UGC, INFLUENCER, VLOG, REVIEW |
| provider | Enum? | HIGGSFIELD, VEO, KLING |
| script | Text? | Video script |
| status | Enum | DRAFT, GENERATING, READY, PUBLISHED |
| scheduledAt | DateTime? | |

**Relationships:**
- N:1 → Character, Campaign, ContentIdea (optional)

---

#### ProductPromotion
Product-specific content generation brief and outputs.

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary key |
| characterId | UUID | FK → Character |
| brandDealId | UUID? | FK → BrandDeal |
| productName | String | e.g. "Nike Air Max" |
| productDescription | Text? | |
| campaignGoal | Text | |
| targetAudience | Text? | |
| platform | Enum | |
| budget | Decimal? | |
| contentPlan | Json? | AI-generated plan |
| deliverables | Json? | Generated content references |
| status | Enum | BRIEF, PLANNING, GENERATING, COMPLETE |

**Relationships:**
- N:1 → Character, BrandDeal (optional)
- Generates → Post[], Reel[], ContentIdea[]

---

## 7. Relationship Matrix

| From | To | Cardinality | Description |
|------|----|-------------|-------------|
| User | Character | 1:N | User owns characters |
| Character | CharacterBible | 1:1 | Auto-generated profile |
| Character | World | 1:1 | Environment container |
| Character | Occupation | 1:1 | Primary job |
| Character | Routine | 1:N | Daily/weekly routines |
| Character | Hobby | 1:N | Interests |
| Character | Outfit | 1:N | Fashion presets |
| Character | Asset | 1:N | Media vault |
| Character | Prompt | 1:N | Generation recipes |
| Character | Campaign | 1:N | Content campaigns |
| Character | Post | 1:N | Social posts |
| Character | Reel | 1:N | Video content |
| Character | ProductPromotion | 1:N | Product promos |
| Character | BrandDeal | 1:N | Brand partnerships |
| World | Residence | 1:1 | Home |
| World | Location | 1:N | Favorite places |
| World | Friend | 1:N | Social circle |
| World | FamilyMember | 1:N | Family |
| World | Pet | 1:N | Pets |
| World | WorldEvent | 1:N | Calendar events |
| Residence | Room | 1:N | Interior spaces |
| Location | Asset | 1:N | Place-specific assets |
| Location | ContentIdea | 1:N | Content set at location |
| Location | Routine | 1:N | Routines at location |
| Location | WorldEvent | 1:N | Events at location |
| Occupation | Location | N:1 | Workplace location |
| Campaign | ContentIdea | 1:N | Planned pieces |
| Campaign | BrandDeal | N:1 | Optional brand link |
| Campaign | Post | 1:N | Generated posts |
| Campaign | Asset | 1:N | Campaign assets |
| ContentIdea | Post | 1:1 | Becomes post |
| ContentIdea | Reel | 1:1 | Becomes reel |
| BrandDeal | ProductPromotion | 1:N | Product campaigns |
| BrandDeal | Campaign | 1:N | Brand campaigns |
| Prompt | Asset | 1:N | Generated from prompt |
| Prompt | Location | 1:N | Place visual DNA |
| Prompt | Room | 1:N | Room visual DNA |
| Prompt | Outfit | 1:N | Outfit visual DNA |

---

## 8. AI Context Builder

Every generation request passes through the **Context Builder** which assembles world memory:

```
ContextBuilder.build(characterId, options)
    │
    ├── character       → name, age, niche, brandVoice
    ├── bible           → personality, fashion, lifestyle summaries
    ├── world           → city, culture, summary
    ├── residence       → home type, interior style, rooms[]
    ├── locations[]     → favorite places with descriptions
    ├── social          → friends[], family[], pets[]
    ├── occupation      → job, workplace
    ├── routines[]      → daily habits
    ├── hobbies[]       → interests
    ├── outfits[]       → fashion presets (if relevant)
    ├── events[]        → upcoming WorldEvents
    ├── assets[]        → reference images (canonical prompts)
    └── campaign        → brief, goal, platform (if campaign-scoped)
```

This context object is injected into all prompt templates, ensuring every output is grounded in the character's world.

---

## 9. Multi-Tenancy & Access Control

- All entities scoped by `userId` (via Character.userId)
- Supabase Row Level Security (RLS) policies mirror Prisma access patterns
- Free tier: 1 Character, 50 Assets
- Pro tier: Unlimited characters, full memory, export
- Credits: Per-generation billing tracked in separate `CreditTransaction` table (Phase 2)

---

## 10. Related Documents

| Document | Path |
|----------|------|
| Module Architecture | `docs/architecture/MODULE_ARCHITECTURE.md` |
| Production Brief System | `docs/architecture/PRODUCTION_BRIEF_SYSTEM.md` |
| ER Diagram | `docs/architecture/ER_DIAGRAM.md` |
| Prisma Schema | `prisma/schema.prisma` |
| API Contracts | `docs/api/API_CONTRACTS.md` |
| Prompt Templates | `docs/prompts/` |
| Folder Structure | `docs/architecture/FOLDER_STRUCTURE.md` |
| Migration Plan | `docs/architecture/MIGRATION_PLAN.md` |
| Extensibility Plan | `docs/architecture/EXTENSIBILITY.md` |
