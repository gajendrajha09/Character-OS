# CharacterOS — Production Brief System

**Version:** 1.0.0  
**Status:** Architecture  
**Core Principle:** No prompt engineering required.

---

## 1. Problem

Traditional AI content tools force creators to write prompts:

```
"A 23-year-old Indian woman in an oversized beige sweater, morning light,
Powai apartment bedroom, cozy luxury aesthetic, handheld vlog style..."
```

CharacterOS eliminates this. The user expresses **intent**. The system reads **world memory** and produces a **Production Brief** — a human-readable shot list that compiles to provider prompts automatically.

```
User Intent  →  Production Brief  →  Prompt Compiler  →  MCP Generation
(natural)       (human-readable)      (hidden)              (Fal / Higgsfield)
```

---

## 2. The Mimi Example (Reference Flow)

### User's Character (World Memory)

| Field | Value | Source Entity |
|-------|-------|---------------|
| Name | Mimi | `Character` |
| Lives | Powai | `World.city` + `Residence.neighborhood` |
| Occupation | Marketing Executive | `Occupation` |
| Hobbies | Coffee, Travel, Photography | `Hobby[]` |
| Personality | Playful, Luxury, Feminine | `CharacterBible.personality` |

### User Action

```
[ Generate Monday Morning Reel ]
```

One click. No prompt box. No settings panel.

### CharacterOS Output: Production Brief

```yaml
Production Brief
─────────────────────────────────
Character:   Mimi
Location:    Powai Apartment        # Residence + Room (Bedroom/Living Room)
Scene:       Monday Morning         # Routine (MORNING) + WorldEvent context
Wardrobe:    Oversized Beige Sweater # Outfit resolved from occasion + personality
Mood:        Cozy Luxury            # Derived from personality (luxury + playful)
Camera:      Handheld Lifestyle Vlog # Platform default + content niche
Platform:    Instagram Reel
Duration:    15 sec
─────────────────────────────────
Status: Ready to Generate
[ Generate ]  [ Edit Brief ]  [ Save as Template ]
```

### What Happens Next (Hidden from User)

```
Production Brief
    │
    ▼
Brief Assembler (already ran — built the brief above)
    │
    ▼
Prompt Compiler
    ├── Script prompt  → LLM (GPT-5) → 15s scene breakdown
    ├── Image prompts  → Fal AI → thumbnail + key frames
    └── Video prompt   → Higgsfield → final reel
    │
    ▼
MCP Generation Bridge
    ├── mcp://fal/generate-image
    ├── mcp://openai/generate-script
    └── mcp://higgsfield/generate-video
    │
    ▼
Reel + Assets persisted to vault
```

The user never sees a prompt. They see a Production Brief they can understand and edit.

---

## 3. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER LAYER                               │
│                                                                  │
│   "Generate Monday Morning Reel"                                │
│   "Generate Gym Content"                                        │
│   "Generate Coffee Shop Post"                                   │
│                                                                  │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                      INTENT LAYER                                │
│                                                                  │
│   Intent Parser                                                  │
│   ├── Preset intents (button clicks)                            │
│   └── Natural language intents (future: "cozy morning vibe")   │
│                                                                  │
│   Output: ParsedIntent { type, scene, time, mood?, platform? }│
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    WORLD MEMORY LAYER                            │
│                                                                  │
│   Context Builder (Character → World → Content)                 │
│   ├── Character + Bible                                         │
│   ├── Residence + Rooms                                         │
│   ├── Locations, Routines, Outfits                              │
│   └── Canonical prompts + assets (visual consistency)           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   BRIEF ASSEMBLY LAYER                           │
│                                                                  │
│   Brief Assembler                                                │
│   ├── Resolve Location    (scene + time → room or place)       │
│   ├── Resolve Wardrobe    (occasion + personality → outfit)    │
│   ├── Resolve Mood        (personality traits → mood label)     │
│   ├── Resolve Camera      (platform + niche → camera style)    │
│   ├── Resolve Duration    (platform defaults)                    │
│   └── Resolve Scene       (intent + routines → scene label)    │
│                                                                  │
│   Output: ProductionBrief (human-readable, editable)            │
└──────────────────────────┬──────────────────────────────────────┘
                           │
              User reviews brief (optional edit)
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                   PROMPT COMPILER (HIDDEN)                       │
│                                                                  │
│   Converts ProductionBrief + World Context → provider payloads  │
│   User never interacts with this layer.                           │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    MCP GENERATION BRIDGE                         │
│                                                                  │
│   Dispatches compiled payloads to providers via MCP tools:       │
│   ├── generate_script    → OpenAI / Claude                      │
│   ├── generate_image     → Fal AI → Replicate fallback          │
│   ├── generate_video     → Higgsfield → Veo → Kling             │
│   ├── generate_caption   → OpenAI / Claude                      │
│   └── generate_hashtags  → OpenAI / Claude                      │
│                                                                  │
│   Tracks job status, persists outputs, deducts credits.          │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ▼
                    Reel / Post / Assets
```

---

## 4. Production Brief Schema

### Human-Readable Fields (shown to user)

| Field | Type | Example | Resolution Source |
|-------|------|---------|-------------------|
| `character` | string | Mimi | `Character.name` |
| `location` | string | Powai Apartment | `Residence` + `Room` or `Location` |
| `scene` | string | Monday Morning | `ParsedIntent` + `Routine` |
| `wardrobe` | string | Oversized Beige Sweater | `Outfit` or bible fashion inference |
| `mood` | string | Cozy Luxury | `CharacterBible.personality` mapping |
| `camera` | string | Handheld Lifestyle Vlog | Platform + niche defaults |
| `platform` | Platform | INSTAGRAM | Intent or user default |
| `format` | ContentFormat | REEL | Parsed from intent |
| `duration` | number | 15 | Platform defaults table |
| `title` | string | Monday Morning at Home | Auto-generated summary |

### Internal Resolution Fields (hidden, used by Prompt Compiler)

| Field | Type | Purpose |
|-------|------|---------|
| `characterId` | UUID | Character reference |
| `locationId` | UUID? | Resolved Location |
| `roomId` | UUID? | Resolved Room |
| `outfitId` | UUID? | Resolved Outfit |
| `routineId` | UUID? | Matched Routine |
| `worldEventId` | UUID? | Event context if applicable |
| `canonicalPromptIds` | UUID[] | Visual consistency anchors |
| `parsedIntent` | Json | Raw intent parse result |
| `worldContextHash` | string | Cache key for context snapshot |

### Compiled Fields (hidden, generated on "Generate" click)

| Field | Type | Purpose |
|-------|------|---------|
| `scriptPrompt` | text | LLM script generation |
| `videoPrompt` | text | Higgsfield/Veo/Kling payload |
| `imagePrompts` | text[] | Thumbnail + key frames |
| `captionPrompt` | text | Caption generation |
| `provider` | string | Selected video/image provider |
| `providerPayload` | Json | Full MCP request body |

---

## 5. Intent System

### Preset Intents (MVP — Button Clicks)

| Button Label | ParsedIntent |
|-------------|--------------|
| Generate Monday Morning Reel | `{ type: REEL, scene: "morning", day: "weekday", platform: INSTAGRAM }` |
| Generate Gym Content | `{ type: REEL, scene: "gym", locationType: GYM, platform: INSTAGRAM }` |
| Generate Coffee Shop Reel | `{ type: REEL, scene: "cafe", locationType: CAFE, platform: INSTAGRAM }` |
| Generate Weekend Vlog | `{ type: REEL, scene: "weekend", format: VLOG, platform: INSTAGRAM }` |
| Generate Fashion Shoot | `{ type: POST, scene: "fashion", format: CAROUSEL, platform: INSTAGRAM }` |
| Generate Instagram Post | `{ type: POST, scene: "lifestyle", platform: INSTAGRAM }` |

### Natural Language Intents (Phase 2)

```
"cozy monday morning at home"     → same as preset
"what would mimi wear to dinner"  → MEMORY_QUERY, not a brief
"generate 30 instagram posts"       → CONTENT_CALENDAR batch, not single brief
```

---

## 6. Brief Assembly Rules (Mimi Example)

### Step 1: Parse Intent

```
Input:  "Generate Monday Morning Reel"
Output: {
  type: REEL,
  scene: "morning",
  dayType: "WEEKDAY",
  dayName: "monday",
  platform: INSTAGRAM,
  format: TRENDING
}
```

### Step 2: Resolve Location

```
Rule: morning + weekday → home morning routine
Query: Routine WHERE type=MORNING AND characterId=mimi
Match: "Morning Coffee Ritual" → locationId=null (home)

Fallback: Residence in Powai
Select: Room type=BEDROOM or LIVING_ROOM (morning scenes)

Output:
  location: "Powai Apartment"
  roomId: bedroom-uuid
  locationLabel: "Powai Apartment — Bedroom"
```

### Step 3: Resolve Wardrobe

```
Rule: morning + home + weekday → CASUAL or LOUNGE occasion
Query: Outfit WHERE occasion IN (CASUAL, LOUNGE)
Filter: match personality (luxury, feminine)

If no exact outfit:
  Infer from bible.fashion:
    personality.luxury=8, personality.minimalist=7
    → "Oversized Beige Sweater" + soft neutral palette

Output:
  wardrobe: "Oversized Beige Sweater"
  outfitId: outfit-uuid (or inferred)
```

### Step 4: Resolve Mood

```
Rule: map personality traits → mood label

personality: { playful: 7, luxury: 8, feminine: 8 }
→ mood matrix lookup:
  luxury >= 7 AND playful >= 6 → "Cozy Luxury"
  luxury >= 7 AND playful < 6  → "Quiet Luxury"
  adventure >= 7             → "Adventurous Energy"

Output: mood: "Cozy Luxury"
```

### Step 5: Resolve Camera

```
Rule: platform + contentNiche → camera style

platform: INSTAGRAM + type: REEL + niche: "Lifestyle Creator"
→ "Handheld Lifestyle Vlog"

Other mappings:
  INSTAGRAM + POST + fashion  → "Editorial Lifestyle"
  TIKTOK + REEL + trending    → "POV Handheld"
  INSTAGRAM + REEL + gym      → "Action Handheld"
```

### Step 6: Resolve Duration

```
Platform defaults:
  INSTAGRAM REEL:  15 sec (default), max 90
  TIKTOK:          15 sec (default), max 60
  YOUTUBE SHORTS:  30 sec (default), max 60
  INSTAGRAM POST:  N/A (image)
```

### Step 7: Assemble Brief

```json
{
  "title": "Monday Morning at Home",
  "character": "Mimi",
  "location": "Powai Apartment",
  "scene": "Monday Morning",
  "wardrobe": "Oversized Beige Sweater",
  "mood": "Cozy Luxury",
  "camera": "Handheld Lifestyle Vlog",
  "platform": "INSTAGRAM",
  "format": "REEL",
  "duration": 15,
  "resolution": {
    "characterId": "uuid",
    "roomId": "uuid",
    "outfitId": "uuid",
    "routineId": "uuid",
    "canonicalPromptIds": ["uuid"]
  }
}
```

---

## 7. Prompt Compiler

The Prompt Compiler transforms a Production Brief into provider-ready payloads. **Users never see this layer.**

### Input
- ProductionBrief (human fields + resolution refs)
- Full WorldContext from Context Builder

### Output
- `CompiledGeneration` object with separate payloads per provider

### Mimi Example — Compiled Output

```json
{
  "script": {
    "provider": "openai",
    "model": "gpt-5",
    "template": "TRENDING_REEL",
    "variables": {
      "character.name": "Mimi",
      "scene": "Monday Morning",
      "location.description": "Modern minimalist bedroom, Powai apartment, floor-to-ceiling windows overlooking Hiranandani gardens",
      "outfit.description": "Oversized beige cashmere sweater, no makeup, hair in loose bun",
      "mood": "Cozy Luxury",
      "duration": 15
    }
  },
  "video": {
    "provider": "higgsfield",
    "template": "TRENDING_REEL",
    "prompt": "Handheld lifestyle vlog, 23-year-old Indian woman Mimi waking up in modern minimalist Powai apartment bedroom, oversized beige sweater, morning golden light through floor-to-ceiling windows, cozy luxury mood, she stretches and walks to kitchen making coffee, natural authentic UGC style, vertical 9:16, 15 seconds",
    "parameters": {
      "duration": 15,
      "aspectRatio": "9:16",
      "style": "UGC"
    }
  },
  "thumbnail": {
    "provider": "fal",
    "model": "fal-ai/flux-pro",
    "prompt": "Mimi in oversized beige sweater, Powai apartment bedroom, morning light, cozy luxury, lifestyle photography, vertical crop",
    "parameters": { "width": 1080, "height": 1920 }
  },
  "caption": {
    "provider": "openai",
    "template": "INSTAGRAM_CAPTION",
    "variables": {
      "contentIdea.title": "Monday Morning at Home",
      "mood": "cozy"
    }
  }
}
```

---

## 8. MCP Generation Bridge

CharacterOS uses MCP (Model Context Protocol) as the standard interface between the Prompt Compiler and external generation providers.

### Why MCP

| Without MCP | With MCP |
|-------------|----------|
| Hard-coded Fal/Replicate/Higgsfield clients | Swappable provider tools |
| Provider switch = code change | Provider switch = MCP config change |
| No standard observability | Unified tool call logging |
| Prompt logic scattered | Single bridge dispatches all generation |

### MCP Server: `characteros-generation`

CharacterOS runs an internal MCP server exposing generation tools:

```json
{
  "server": "characteros-generation",
  "tools": [
    {
      "name": "generate_script",
      "description": "Generate video script from production brief",
      "inputSchema": { "briefId": "uuid", "compiledScript": "object" }
    },
    {
      "name": "generate_image",
      "description": "Generate image via Fal AI with Replicate fallback",
      "inputSchema": { "prompt": "string", "model": "string", "parameters": "object" }
    },
    {
      "name": "generate_video",
      "description": "Generate video reel via Higgsfield/Veo/Kling",
      "inputSchema": { "prompt": "string", "provider": "string", "parameters": "object" }
    },
    {
      "name": "generate_caption",
      "description": "Generate platform caption from brief context",
      "inputSchema": { "briefId": "uuid", "platform": "string" }
    },
    {
      "name": "generate_hashtags",
      "description": "Generate hashtag set from brief context",
      "inputSchema": { "briefId": "uuid", "count": "number" }
    },
    {
      "name": "assemble_brief",
      "description": "Build production brief from character intent",
      "inputSchema": { "characterId": "uuid", "intent": "string | object" }
    }
  ]
}
```

### Generation Flow via MCP

```
Brief Assembler completes
    │
    ▼
User clicks [ Generate ]
    │
    ▼
Prompt Compiler → CompiledGeneration
    │
    ▼
MCP Bridge orchestrates (parallel where possible):

  Step 1: CallMcpTool("characteros-generation", "generate_script", {...})
          → returns script with scenes

  Step 2: CallMcpTool("characteros-generation", "generate_image", {...})
          → returns thumbnail (parallel with step 1)

  Step 3: CallMcpTool("characteros-generation", "generate_video", {...})
          → uses script from step 1
          → returns video URL

  Step 4: CallMcpTool("characteros-generation", "generate_caption", {...})
          → parallel with step 3

  Step 5: CallMcpTool("characteros-generation", "generate_hashtags", {...})
          → parallel with step 3
    │
    ▼
Persist: Reel + Assets + Post metadata
Update: ProductionBrief.status = COMPLETED
```

### MCP Provider Adapters

Each external provider is wrapped as an MCP-compatible adapter:

```
src/lib/mcp/
├── server.ts                    # characteros-generation MCP server
├── bridge.ts                    # Orchestration layer
├── adapters/
│   ├── fal.adapter.ts           # Fal AI image generation
│   ├── replicate.adapter.ts     # Replicate fallback
│   ├── openai.adapter.ts        # Script + caption + hashtags
│   ├── anthropic.adapter.ts     # LLM fallback
│   ├── higgsfield.adapter.ts    # Video (Phase 2)
│   ├── veo.adapter.ts           # Video fallback
│   └── kling.adapter.ts         # Video fallback
└── tools/
    ├── assemble-brief.tool.ts
    ├── generate-script.tool.ts
    ├── generate-image.tool.ts
    ├── generate-video.tool.ts
    ├── generate-caption.tool.ts
    └── generate-hashtags.tool.ts
```

---

## 9. Entity: ProductionBrief

Added to Prisma schema as first-class entity.

```
ProductionBrief
    ├── belongs to Character
    ├── optionally links to ContentIdea, Campaign, Reel
    ├── stores human-readable brief fields
    ├── stores resolution refs (roomId, outfitId, etc.)
    ├── stores compiled payloads (after Generate click)
    └── tracks status: DRAFT → APPROVED → GENERATING → COMPLETED
```

See `prisma/schema.prisma` model `ProductionBrief`.

---

## 10. User Edit Flow

Users can edit the brief before generating — still no prompts:

```
Production Brief
─────────────────────────────────
Character:   Mimi
Location:    [Powai Apartment        ▼]  ← dropdown: rooms + locations
Scene:       [Monday Morning         ▼]  ← dropdown: routines + presets
Wardrobe:    [Oversized Beige Sweater▼]  ← dropdown: outfits
Mood:        [Cozy Luxury            ▼]  ← dropdown: mood presets
Camera:      [Handheld Lifestyle Vlog▼]  ← dropdown: camera presets
Platform:    [Instagram Reel         ▼]
Duration:    [15 sec                 ▼]
─────────────────────────────────
```

Changing any field re-runs resolution for that field only. Prompt Compiler re-runs on Generate.

---

## 11. Brief Templates (Future)

Users can save a brief configuration as a reusable template:

```
"Mimi Monday Morning" → saved brief preset
"Gym Session"         → saved brief preset
"Coffee Shop Afternoon" → saved brief preset
```

Stored as `BriefTemplate` (Phase 2) — not in MVP schema.

---

## 12. Relationship to Existing Systems

| System | Role | Change |
|--------|------|--------|
| Context Builder | Loads world memory | Unchanged — feeds Brief Assembler |
| Prompt Engine | Template + variable injection | Called by Prompt Compiler, not by user |
| Prompt Templates | LLM/image/video templates | Unchanged — compiled automatically |
| ContentIdea | Planned content piece | Created from ProductionBrief on completion |
| Reel | Video output | Linked to ProductionBrief |
| GenerationJob | Async tracking | One job per brief generation |
| API Contracts | REST endpoints | New: `assemble-brief`, `generate-from-brief` |

---

## 13. MVP vs Phase 2

| Feature | MVP | Phase 2 |
|---------|-----|---------|
| Preset intent buttons | ✅ | |
| Brief assembly from world | ✅ | |
| User edit brief fields | ✅ | |
| Image generation via brief | ✅ (Fal) | |
| Caption + hashtags via brief | ✅ | |
| Script generation | ✅ (LLM) | |
| Video generation via brief | ❌ (script only) | ✅ (Higgsfield) |
| Natural language intents | ❌ | ✅ |
| Brief templates | ❌ | ✅ |
| MCP external exposure | Internal only | External MCP server for integrations |

---

## 14. Related Documents

| Document | Path |
|----------|------|
| API: Assemble Brief | `docs/api/API_CONTRACTS.md` §11 |
| MCP Protocol | `docs/architecture/MCP_GENERATION.md` |
| Prisma Model | `prisma/schema.prisma` → `ProductionBrief` |
| Prompt Compiler | `docs/prompts/PROMPT_SYSTEM.md` |
| Worked Example | `docs/architecture/examples/MIMI_MONDAY_MORNING_REEL.md` |
