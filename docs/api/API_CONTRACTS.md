# CharacterOS — API Contracts

**Base URL:** `/api/v1`  
**Auth:** Supabase JWT Bearer token in `Authorization` header  
**Content-Type:** `application/json`  
**Error Format:** `{ "error": { "code": string, "message": string, "details"?: object } }`

---

## Conventions

| Pattern | Description |
|---------|-------------|
| `{characterId}` | UUID path parameter |
| Async jobs | Endpoints that trigger AI return `{ jobId, status: "PENDING" }` — poll `GET /jobs/{jobId}` |
| World context | All generation endpoints auto-load Character → World → Content graph via Context Builder |
| Credits | Generation endpoints deduct credits; return `creditsUsed` in response |

---

## 1. Characters

### `POST /api/v1/characters`

Create a character manually (without AI generation).

**Request:**
```json
{
  "name": "Mimi",
  "age": 23,
  "contentNiche": "Lifestyle Creator",
  "creationMode": "DEEP_BUILDER"
}
```

**Response `201`:**
```json
{
  "id": "uuid",
  "name": "Mimi",
  "slug": "mimi",
  "status": "DRAFT",
  "creationMode": "DEEP_BUILDER",
  "createdAt": "2026-06-14T00:00:00Z"
}
```

**Errors:**
| Code | HTTP | Description |
|------|------|-------------|
| `CHARACTER_LIMIT_REACHED` | 403 | Free tier: max 1 character |
| `VALIDATION_ERROR` | 400 | Invalid input |

---

### `GET /api/v1/characters`

List user's characters.

**Query:** `?status=ACTIVE&page=1&limit=20`

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Mimi",
      "slug": "mimi",
      "avatarUrl": "https://...",
      "status": "ACTIVE",
      "contentNiche": "Lifestyle Creator",
      "world": { "city": "Mumbai", "isComplete": true },
      "assetCount": 42,
      "createdAt": "2026-06-14T00:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 20, "total": 1 }
}
```

---

### `GET /api/v1/characters/{characterId}`

Get full character with bible and world summary.

**Response `200`:**
```json
{
  "id": "uuid",
  "name": "Mimi",
  "slug": "mimi",
  "age": 23,
  "avatarUrl": "https://...",
  "status": "ACTIVE",
  "contentNiche": "Lifestyle Creator",
  "brandVoice": "Warm, aspirational, relatable",
  "bible": { "id": "uuid", "version": 2, "generatedAt": "..." },
  "world": {
    "id": "uuid",
    "city": "Mumbai",
    "isComplete": true,
    "locationCount": 8,
    "friendCount": 3
  },
  "occupation": { "title": "Marketing Executive", "company": "..." }
}
```

---

### `PATCH /api/v1/characters/{characterId}`

Update character fields.

**Request:**
```json
{
  "name": "Mimi Chen",
  "brandVoice": "Updated voice",
  "status": "ACTIVE"
}
```

**Response `200`:** Updated character object.

---

### `DELETE /api/v1/characters/{characterId}`

Cascade delete character and entire graph.

**Response `204`:** No content.

---

## 2. Generate Character

### `POST /api/v1/characters/generate`

AI-generate a random character (Quick Create flow).

**Request:**
```json
{
  "mode": "QUICK",
  "preferences": {
    "region": "South Asia",
    "niche": "Lifestyle",
    "ageRange": [20, 30]
  }
}
```

**Response `202` (async):**
```json
{
  "jobId": "uuid",
  "status": "PENDING",
  "type": "CHARACTER",
  "estimatedCredits": 5
}
```

**Job Output (`GET /jobs/{jobId}`):**
```json
{
  "status": "COMPLETED",
  "output": {
    "character": {
      "id": "uuid",
      "name": "Mimi",
      "age": 23,
      "contentNiche": "Lifestyle Creator"
    },
    "preview": {
      "occupation": "Marketing Executive",
      "city": "Powai, Mumbai",
      "personality": ["Confident", "Adventurous"],
      "hobbies": ["Coffee Shops", "Photography", "Travel"]
    }
  },
  "creditsUsed": 5
}
```

---

### `POST /api/v1/characters/generate/deep`

AI-generate from Deep Builder questionnaire answers.

**Request:**
```json
{
  "mode": "DEEP_BUILDER",
  "questionnaire": {
    "identity": { "name": "Mimi", "age": 23, "languages": ["English", "Hindi"] },
    "lifestyle": { "city": "Mumbai", "neighborhood": "Powai" },
    "career": { "title": "Marketing Executive" },
    "personality": { "introvertExtrovert": 7, "traits": ["funny", "adventurous"] },
    "fashion": { "style": "Minimalist chic" },
    "hobbies": ["Photography", "Travel"],
    "goals": ["Grow to 100K followers"],
    "socialMediaStyle": { "tone": "Warm", "platforms": ["INSTAGRAM"] }
  }
}
```

**Response `202`:** Same async job pattern as Quick Generate.

---

## 3. Generate Character Bible

### `POST /api/v1/characters/{characterId}/bible/generate`

Generate or regenerate the Character Bible from character + world data.

**Request:**
```json
{
  "regenerate": false,
  "sections": ["identity", "personality", "home", "socialCircle", "lifestyle", "fashion"]
}
```

**Response `202`:**
```json
{
  "jobId": "uuid",
  "status": "PENDING",
  "type": "BIBLE",
  "estimatedCredits": 3
}
```

**Job Output:**
```json
{
  "status": "COMPLETED",
  "output": {
    "bible": {
      "id": "uuid",
      "version": 1,
      "identity": {
        "name": "Mimi",
        "age": 23,
        "height": "5'6\"",
        "languages": ["English", "Hindi"],
        "education": "MBA, Mumbai University",
        "income": "Upper middle class"
      },
      "personality": {
        "introvertExtrovert": 7,
        "funny": 8,
        "luxury": 6,
        "minimalist": 7,
        "adventure": 9,
        "confident": 8,
        "reserved": 3
      },
      "home": { "city": "Mumbai", "neighborhood": "Powai", "interiorStyle": "Modern minimalist" },
      "socialCircle": { "summary": "..." },
      "lifestyle": { "restaurants": [], "cafes": [], "gyms": [], "travelDestinations": [] },
      "fashion": { "hairStyle": "...", "wardrobeStyle": "..." },
      "rawMarkdown": "# Mimi — Character Bible\n..."
    }
  },
  "creditsUsed": 3
}
```

---

### `GET /api/v1/characters/{characterId}/bible`

Get current bible.

**Response `200`:** Full bible object.

---

### `PATCH /api/v1/characters/{characterId}/bible`

Manual bible edits (increments version).

**Request:** Partial bible JSON sections.

**Response `200`:** Updated bible with incremented `version`.

---

## 4. Generate World

### `POST /api/v1/characters/{characterId}/world/generate`

Generate the full character world: residence, rooms, locations, social circle.

**Request:**
```json
{
  "includeResidence": true,
  "includeRooms": ["BEDROOM", "LIVING_ROOM", "KITCHEN", "BALCONY"],
  "includeLocations": ["CAFE", "GYM", "MALL", "OFFICE"],
  "includeSocialCircle": {
    "friends": 3,
    "familyMembers": 2,
    "pets": 1
  },
  "generateImages": true,
  "imageProvider": "FAL"
}
```

**Response `202`:**
```json
{
  "jobId": "uuid",
  "status": "PENDING",
  "type": "WORLD",
  "estimatedCredits": 25,
  "steps": [
    "residence",
    "rooms",
    "locations",
    "friends",
    "family",
    "pets",
    "world_events",
    "images"
  ]
}
```

**Job Output:**
```json
{
  "status": "COMPLETED",
  "output": {
    "world": {
      "id": "uuid",
      "city": "Mumbai",
      "isComplete": true,
      "summary": "Mimi's world centers on Powai, Mumbai..."
    },
    "residence": { "id": "uuid", "type": "APARTMENT", "neighborhood": "Powai" },
    "rooms": [{ "id": "uuid", "type": "BEDROOM", "name": "Mimi's Bedroom" }],
    "locations": [{ "id": "uuid", "type": "CAFE", "name": "Blue Tokai, Powai" }],
    "friends": [{ "id": "uuid", "name": "Priya", "relationship": "BEST_FRIEND" }],
    "familyMembers": [{ "id": "uuid", "name": "...", "relation": "MOTHER" }],
    "pets": [{ "id": "uuid", "name": "Mochi", "species": "CAT" }],
    "worldEvents": [{ "id": "uuid", "title": "Mimi's Birthday", "type": "BIRTHDAY" }]
  },
  "creditsUsed": 25
}
```

---

### `GET /api/v1/characters/{characterId}/world`

Get full world graph.

**Response `200`:**
```json
{
  "world": { "...": "..." },
  "residence": { "rooms": ["..."] },
  "locations": ["..."],
  "friends": ["..."],
  "familyMembers": ["..."],
  "pets": ["..."],
  "worldEvents": ["..."]
}
```

---

## 5. Generate Content Ideas

### `POST /api/v1/characters/{characterId}/content/ideas/generate`

Generate content ideas grounded in world memory.

**Request:**
```json
{
  "count": 30,
  "type": "POST",
  "platform": "INSTAGRAM",
  "theme": "Lifestyle",
  "dateRange": {
    "start": "2026-06-15",
    "end": "2026-07-15"
  },
  "campaignId": "uuid",
  "useWorldEvents": true,
  "locationIds": ["uuid"],
  "contentCategories": [
    "morning_routine",
    "coffee_shop",
    "gym",
    "fashion",
    "weekend_vlog"
  ]
}
```

**Response `202`:**
```json
{
  "jobId": "uuid",
  "status": "PENDING",
  "type": "CONTENT_IDEAS",
  "estimatedCredits": 8
}
```

**Job Output:**
```json
{
  "status": "COMPLETED",
  "output": {
    "contentIdeas": [
      {
        "id": "uuid",
        "title": "Sunday Morning at Blue Tokai",
        "type": "POST",
        "platform": "INSTAGRAM",
        "concept": "Mimi sits by the window at her favorite cafe...",
        "locationId": "uuid",
        "outfitId": "uuid",
        "scheduledDate": "2026-06-15T09:00:00Z",
        "imagePrompt": "A 23-year-old Indian woman in minimalist chic...",
        "status": "IDEA"
      }
    ],
    "count": 30
  },
  "creditsUsed": 8
}
```

---

## 6. Generate Product Promotion

### `POST /api/v1/characters/{characterId}/promotions/generate`

Generate a product promotion campaign grounded in character world.

**Request:**
```json
{
  "productName": "Nike Air Max 90",
  "productDescription": "Classic lifestyle sneaker, white/colorway",
  "campaignGoal": "Drive awareness among Mumbai lifestyle audience",
  "targetAudience": "Women 20-30, fitness and fashion conscious",
  "platform": "INSTAGRAM",
  "budget": 5000,
  "brandDealId": "uuid",
  "deliverables": {
    "posts": 3,
    "reels": 2,
    "stories": 5
  }
}
```

**Response `202`:**
```json
{
  "jobId": "uuid",
  "status": "PENDING",
  "type": "PRODUCT_PROMOTION",
  "estimatedCredits": 15
}
```

**Job Output:**
```json
{
  "status": "COMPLETED",
  "output": {
    "promotion": {
      "id": "uuid",
      "productName": "Nike Air Max 90",
      "status": "PLANNING",
      "contentPlan": {
        "strategy": "Integrate Nike into Mimi's gym routine and street style...",
        "deliverables": [
          { "type": "POST", "title": "Gym Morning in Nike", "location": "Powai Gym" },
          { "type": "REEL", "title": "Unboxing & First Walk", "format": "UNBOXING" },
          { "type": "CAROUSEL", "title": "3 Ways to Style Nike Air Max" }
        ],
        "postingSchedule": [
          { "date": "2026-06-20", "deliverableIndex": 0 },
          { "date": "2026-06-22", "deliverableIndex": 1 }
        ]
      }
    },
    "contentIdeas": ["..."],
    "creditsUsed": 15
  }
}
```

---

## 7. Generate Social Campaign

### `POST /api/v1/characters/{characterId}/campaigns/generate`

Generate a full social media campaign with calendar.

**Request:**
```json
{
  "title": "Monsoon in Mumbai",
  "type": "MONTHLY",
  "goal": "Grow engagement during monsoon season",
  "platforms": ["INSTAGRAM", "THREADS"],
  "startDate": "2026-07-01",
  "endDate": "2026-07-31",
  "contentMix": {
    "posts": 12,
    "reels": 8,
    "stories": 20
  },
  "themes": ["monsoon_fashion", "cafe_moments", "indoor_cozy", "city_rain"],
  "brandDealId": "uuid"
}
```

**Response `202`:**
```json
{
  "jobId": "uuid",
  "status": "PENDING",
  "type": "SOCIAL_CAMPAIGN",
  "estimatedCredits": 12
}
```

**Job Output:**
```json
{
  "status": "COMPLETED",
  "output": {
    "campaign": {
      "id": "uuid",
      "title": "Monsoon in Mumbai",
      "type": "MONTHLY",
      "status": "DRAFT",
      "startDate": "2026-07-01",
      "endDate": "2026-07-31",
      "brief": { "strategy": "...", "themes": ["..."] }
    },
    "contentIdeas": ["...40 items with scheduledDate..."],
    "worldEventsUsed": ["..."],
    "creditsUsed": 12
  }
}
```

---

## 8. Generate Caption

### `POST /api/v1/characters/{characterId}/content/caption/generate`

Generate platform-specific caption using world context.

**Request:**
```json
{
  "contentIdeaId": "uuid",
  "platform": "INSTAGRAM",
  "tone": "warm",
  "includeEmoji": true,
  "includeCTA": false,
  "maxLength": 2200,
  "context": {
    "locationId": "uuid",
    "outfitId": "uuid",
    "mood": "cozy Sunday morning"
  }
}
```

**Response `200` (sync — LLM only, no image):**
```json
{
  "caption": "Sunday mornings hit different when Blue Tokai is your second home ☕✨\n\nThere's something about that corner table by the window...",
  "platform": "INSTAGRAM",
  "characterCount": 187,
  "brandVoiceMatch": 0.92,
  "creditsUsed": 1
}
```

---

## 9. Generate Hashtags

### `POST /api/v1/characters/{characterId}/content/hashtags/generate`

Generate hashtags grounded in niche, location, and content.

**Request:**
```json
{
  "contentIdeaId": "uuid",
  "platform": "INSTAGRAM",
  "count": 20,
  "mix": {
    "niche": 5,
    "location": 3,
    "trending": 5,
    "branded": 2,
    "general": 5
  },
  "caption": "Optional caption for context"
}
```

**Response `200`:**
```json
{
  "hashtags": [
    "#MumbaiLifestyle",
    "#PowaiDiaries",
    "#CoffeeShopVibes",
    "#MinimalistFashion",
    "#LifestyleCreator"
  ],
  "categories": {
    "niche": ["#LifestyleCreator", "#MinimalistFashion"],
    "location": ["#MumbaiLifestyle", "#PowaiDiaries"],
    "trending": ["#CoffeeShopVibes"],
    "branded": [],
    "general": ["#SundayMorning", "#CozyVibes"]
  },
  "creditsUsed": 1
}
```

---

## 10. Supporting Endpoints

### Generation Jobs

#### `GET /api/v1/jobs/{jobId}`

Poll async job status.

**Response `200`:**
```json
{
  "id": "uuid",
  "type": "WORLD",
  "status": "PROCESSING",
  "progress": { "current": 3, "total": 8, "step": "locations" },
  "createdAt": "...",
  "startedAt": "...",
  "completedAt": null
}
```

---

### Character Memory AI

#### `POST /api/v1/characters/{characterId}/memory/query`

Ask questions about the character using world memory.

**Request:**
```json
{
  "query": "What would Mimi wear for a luxury dinner?",
  "generateContent": false
}
```

**Response `200`:**
```json
{
  "query": "What would Mimi wear for a luxury dinner?",
  "answer": "Mimi would choose her formal minimalist look — a sleek black midi dress from Zara, gold hoop earrings, strappy heels, and a subtle smoky eye...",
  "references": {
    "outfitId": "uuid",
    "locationIds": ["uuid"],
    "bibleSections": ["fashion", "personality"]
  },
  "creditsUsed": 1
}
```

---

### Image Generation

#### `POST /api/v1/characters/{characterId}/assets/generate`

Generate image via Fal AI (primary) or Replicate (fallback).

**Request:**
```json
{
  "promptId": "uuid",
  "positivePrompt": "Override or use stored prompt",
  "locationId": "uuid",
  "roomId": "uuid",
  "provider": "FAL",
  "model": "fal-ai/flux-pro",
  "parameters": { "width": 1024, "height": 1024, "steps": 28 }
}
```

**Response `202`:**
```json
{
  "jobId": "uuid",
  "status": "PENDING",
  "type": "IMAGE",
  "estimatedCredits": 2
}
```

---

### Instagram Export

#### `POST /api/v1/characters/{characterId}/posts/{postId}/export`

Export post bundle for Instagram.

**Request:**
```json
{
  "format": "BUNDLE",
  "includeAltText": true
}
```

**Response `200`:**
```json
{
  "exportBundle": {
    "platform": "INSTAGRAM",
    "format": "SINGLE",
    "caption": "...",
    "hashtags": ["..."],
    "altText": "...",
    "assets": [
      { "url": "https://...", "filename": "mimi-cafe-01.jpg", "width": 1080, "height": 1350 }
    ],
    "downloadUrl": "https://storage.../export.zip"
  }
}
```

---

## Error Codes Reference

| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid JWT |
| `FORBIDDEN` | 403 | Insufficient tier or credits |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `CHARACTER_LIMIT_REACHED` | 403 | Free tier character limit |
| `ASSET_LIMIT_REACHED` | 403 | Free tier asset limit (50) |
| `INSUFFICIENT_CREDITS` | 402 | Not enough credits |
| `GENERATION_FAILED` | 500 | AI provider error |
| `WORLD_INCOMPLETE` | 422 | World must be generated before content |
| `JOB_NOT_FOUND` | 404 | Invalid job ID |
| `PROVIDER_UNAVAILABLE` | 503 | Fal/Replicate/LLM down — auto-fallback attempted |

---

## Rate Limits

| Tier | Requests/min | Concurrent Jobs |
|------|-------------|-----------------|
| Free | 20 | 1 |
| Pro | 100 | 5 |
| Enterprise | 500 | 20 |

---

## Webhook Events (Future)

```
POST {user_webhook_url}
{
  "event": "generation.completed",
  "jobId": "uuid",
  "type": "WORLD",
  "characterId": "uuid",
  "timestamp": "..."
}
```

Supported events: `generation.completed`, `generation.failed`, `campaign.ready`, `export.ready`

---

## 11. Production Brief Engine

### `POST /api/v1/characters/{characterId}/briefs/generate`

Assemble a production brief from user intent — no prompt engineering required.

**Request:**
```json
{
  "intent": "Generate Monday Morning Reel",
  "platform": "INSTAGRAM"
}
```

**Response `201`:**
```json
{
  "id": "uuid",
  "status": "DRAFT",
  "brief": {
    "character": "Mimi",
    "location": "Powai Apartment",
    "scene": "Monday Morning",
    "wardrobe": "Oversized Beige Sweater",
    "mood": "Cozy Luxury",
    "camera": "Handheld Lifestyle Vlog",
    "platform": "INSTAGRAM",
    "duration": 15
  }
}
```

**Notes:**
- `promptHidden` and `generationPayload` are stored in DB but never returned to the client
- Intent presets: `Generate Monday Morning Reel`, `Generate Gym Content`, `Generate Coffee Shop Reel`, etc.
- Requires character with world memory (residence, routines, outfits recommended)

**Errors:**
| Code | HTTP | Description |
|------|------|-------------|
| `NOT_FOUND` | 404 | Character not found |
| `WORLD_INCOMPLETE` | 422 | World shell missing — create world first |
| `VALIDATION_ERROR` | 400 | Invalid intent or platform |

---

### `GET /api/v1/characters/{characterId}/briefs`

List production briefs for a character.

**Response `200`:**
```json
{
  "data": [
    {
      "id": "uuid",
      "intent": "Generate Monday Morning Reel",
      "status": "DRAFT",
      "scene": "Monday Morning",
      "createdAt": "2026-06-14T00:00:00Z"
    }
  ]
}
```

---

### `GET /api/v1/characters/{characterId}/briefs/{briefId}`

Get a single production brief (human-readable fields only).

**Response `200`:**
```json
{
  "id": "uuid",
  "status": "DRAFT",
  "intent": "Generate Monday Morning Reel",
  "brief": {
    "character": "Mimi",
    "location": "Powai Apartment",
    "scene": "Monday Morning",
    "wardrobe": "Oversized Beige Sweater",
    "mood": "Cozy Luxury",
    "camera": "Handheld Lifestyle Vlog",
    "platform": "INSTAGRAM",
    "duration": 15
  }
}
```

---

### `PATCH /api/v1/characters/{characterId}/briefs/{briefId}`

Edit brief fields before generation (still no prompts).

**Request:**
```json
{
  "wardrobe": "Silk Robe Set",
  "mood": "Quiet Luxury",
  "duration": 30
}
```

**Response `200`:** Updated brief object.

---

### `POST /api/v1/characters/{characterId}/briefs/{briefId}/generate`

Trigger MCP generation from an approved brief. Uses Higgsfield MCP (Provider #1) for video.

**Response `202`:**
```json
{
  "briefId": "uuid",
  "status": "GENERATING",
  "provider": "higgsfield-mcp",
  "estimatedCredits": 15
}
```

**On completion:** `ProductionBrief.status` → `COMPLETED`; linked `Reel` created (Phase 2).

**Errors:**
| Code | HTTP | Description |
|------|------|-------------|
| `PROVIDER_UNAVAILABLE` | 503 | Higgsfield MCP not configured |
| `INSUFFICIENT_CREDITS` | 402 | Not enough credits |
| `GENERATION_FAILED` | 500 | Provider error |

See also: [Production Brief Engine](../architecture/PRODUCTION_BRIEF_ENGINE.md)
