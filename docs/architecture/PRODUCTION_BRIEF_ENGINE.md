# CharacterOS — Production Brief Engine

**Version:** 1.0.0  
**Status:** Implemented (backend services)  
**Core Principle:** No prompt engineering required.

---

## Overview

The Production Brief Engine converts a one-click user intent (e.g. **"Generate Monday Morning Reel"**) into a human-readable production brief, then compiles hidden provider payloads for MCP generation. The user never writes prompts.

```
User Intent  →  Intent Parser  →  Brief Assembler  →  Production Brief (DB)
                                                      →  Prompt Compiler (hidden)
                                                      →  MCP Generation (Higgsfield #1)
```

---

## Mimi Example Flow

### World Memory

| Field | Value | Source |
|-------|-------|--------|
| Name | Mimi | `Character` |
| Lives | Powai | `World.city` + `Residence.neighborhood` |
| Occupation | Marketing Executive | `Occupation` |
| Hobbies | Coffee, Travel, Photography | `Hobby[]` |
| Personality | Playful, Luxury, Feminine | `CharacterBible.personality` |

### User Action

```
POST /api/v1/characters/{id}/briefs/generate
{ "intent": "Generate Monday Morning Reel" }
```

### System Output (Human-Readable)

```yaml
Character:   Mimi
Location:    Powai Apartment
Scene:       Monday Morning
Wardrobe:    Oversized Beige Sweater
Mood:        Cozy Luxury
Camera:      Handheld Lifestyle Vlog
Platform:    Instagram Reel
Duration:    15 sec
```

### Hidden Layer (Never Shown to User)

Stored in `ProductionBrief.promptHidden` and `ProductionBrief.generationPayload`:

```json
{
  "video": {
    "provider": "higgsfield",
    "prompt": "Handheld lifestyle vlog, 23-year-old Mimi...",
    "parameters": { "duration": 15, "aspectRatio": "9:16", "style": "UGC" }
  },
  "thumbnail": { "provider": "fal", "model": "fal-ai/flux-pro", "..." },
  "script": { "provider": "openai", "template": "TRENDING_REEL", "..." },
  "caption": { "provider": "openai", "template": "INSTAGRAM_CAPTION", "..." }
}
```

---

## Backend Modules

| Module | Path | Role |
|--------|------|------|
| Intent Parser | `src/lib/ai/intent-parser.ts` | Preset + keyword intent → `ParsedIntent` |
| Context Builder | `src/lib/ai/context-builder.ts` | Load Character → World → Content graph |
| Brief Assembler | `src/lib/ai/brief-assembler.ts` | Resolve location, wardrobe, mood, camera |
| Production Brief Service | `src/lib/services/production-brief.service.ts` | Persist brief, trigger generation |
| Generation Router | `src/lib/ai/generation-router.ts` | Route by type with fallback chain |
| MCP Client | `src/lib/ai/mcp/generation-client.ts` | Send payload to Higgsfield MCP |

---

## Assembly Rules

### Location

- `morning` + weekday → home residence (Powai Apartment) + `BEDROOM` or `LIVING_ROOM`
- `gym` → `Location` where `type = GYM`
- `cafe` → `Location` where `type = CAFE`

### Wardrobe

- Morning/home → `OutfitOccasion.LOUNGE` or `CASUAL`
- Score outfits against personality traits (luxury, feminine, playful)
- Fallback inference: luxury + feminine → **Oversized Beige Sweater**

### Mood

| Condition | Mood |
|-----------|------|
| luxury ≥ 7 AND playful ≥ 6 | Cozy Luxury |
| luxury ≥ 7 | Quiet Luxury |
| adventure ≥ 7 | Adventurous Energy |

### Camera

| Platform + Type | Camera |
|-----------------|--------|
| INSTAGRAM + REEL + lifestyle niche | Handheld Lifestyle Vlog |
| INSTAGRAM + POST + fashion | Editorial Lifestyle |
| TIKTOK + REEL | POV Handheld |
| gym scene | Action Handheld |

### Duration Defaults

| Platform | Default |
|----------|---------|
| Instagram Reel | 15 sec |
| TikTok | 15 sec |
| YouTube Shorts | 30 sec |
| Post | N/A |

---

## MCP Generation Protocol

### Tool: `generate_video`

**Server:** `higgsfield`  
**Endpoint env:** `HIGGSFIELD_MCP_URL` (default: `mcp://higgsfield/generate-video`)

### Request

```json
{
  "tool": "generate_video",
  "server": "higgsfield",
  "arguments": {
    "briefId": "uuid",
    "characterId": "uuid",
    "prompt": "<compiled hidden prompt from ProductionBrief.promptHidden>",
    "parameters": {
      "duration": 15,
      "aspectRatio": "9:16",
      "style": "UGC"
    },
    "payload": "<full ProductionBrief.generationPayload>"
  }
}
```

### Response

```json
{
  "success": true,
  "jobId": "higgsfield-job-uuid",
  "url": "https://..."
}
```

### Client Implementation

```typescript
import { mcpGenerationClient } from "@/lib/ai/mcp/generation-client";

await mcpGenerationClient.sendFromBriefPayload(
  briefId,
  characterId,
  generationPayload,
  promptHidden
);
```

Production wiring replaces the stub `dispatch()` with `CallMcpTool("higgsfield", "generate_video", arguments)`.

---

## Provider Routing

| Generation Type | Primary | Fallback |
|-----------------|---------|----------|
| VIDEO / REEL | Higgsfield MCP (#1) | — |
| IMAGE | Fal AI | Replicate |
| TEXT / CAPTION / BIBLE / SCRIPT | OpenAI | — |

See `src/lib/ai/generation-router.ts` and `src/lib/ai/providers/`.

---

## Prisma Model

```prisma
model ProductionBrief {
  id, characterId, contentType, intent
  character, locationId, roomId, outfitId
  scene, wardrobe, mood, camera, platform, duration
  status, assembledFrom, generationPayload, promptHidden
  contentIdeaId?, reelId?, postId?
}
```

Status flow: `DRAFT` → `APPROVED` → `GENERATING` → `COMPLETED` | `FAILED`

---

## Related Documents

| Document | Path |
|----------|------|
| Production Brief System (architecture) | `docs/architecture/PRODUCTION_BRIEF_SYSTEM.md` |
| API Contract | `docs/api/API_CONTRACTS.md` §11 |
| Prisma Schema | `prisma/schema.prisma` |
