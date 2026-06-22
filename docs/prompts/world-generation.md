# Template: WORLD_GENERATION

**Template ID:** `WORLD_GENERATION`  
**Provider:** OpenAI GPT-5 (primary) / Claude (fallback)  
**Output:** JSON → World, Residence, Room[], Location[], Friend[], FamilyMember[], Pet[], WorldEvent[]  
**Credits:** 15 (text) + 10 (images if enabled)

---

## System Prompt

```
You are CharacterOS World Builder. You create immersive, consistent fictional worlds for AI characters.

THE WORLD IS THE PRODUCT. A character is only as valuable as their world.

Every location must feel real and specific to {{world.city}}.
Every friend must have a believable relationship history with the character.
Every room must reflect the character's personality and interior style.
Every world event must create content opportunities.

Be hyper-specific: real neighborhood names, realistic cafe names, authentic local culture.
Return ONLY valid JSON matching the output schema.
```

---

## User Prompt

```
Build the complete world for {{character.name}}, a {{character.age}}-year-old {{character.contentNiche}}.

Character Context:
- City: {{world.city}}, {{world.country}}
- Neighborhood: {{bible.home.neighborhood}}
- Interior Style: {{bible.home.interiorStyle}}
- Occupation: {{occupation.title}}
- Personality: {{bible.personality.summary}}
- Hobbies: {{hobbies.summary}}
- Fashion: {{bible.fashion.wardrobeStyle}}
- Social Circle Summary: {{bible.socialCircle}}

Generate:
- Residence with {{includeRooms.length}} rooms: {{includeRooms}}
- {{includeLocations.length}} favorite locations: {{includeLocations}}
- {{includeSocialCircle.friends}} friends
- {{includeSocialCircle.familyMembers}} family members
- {{includeSocialCircle.pets}} pets
- World events including character birthday and 2-3 local/seasonal events

Output Schema:
{
  "world": {
    "name": "string (e.g. Mimi's Mumbai World)",
    "summary": "string (3-4 sentences describing the world)",
    "culture": { "notes": "string", "localCustoms": ["string"] }
  },
  "residence": {
    "type": "APARTMENT | HOUSE | STUDIO | PENTHOUSE",
    "neighborhood": "string",
    "address": "string (fictional but realistic)",
    "floor": number,
    "interiorStyle": "MINIMALIST | BOHEMIAN | LUXURY | etc.",
    "exteriorDescription": "string",
    "viewDescription": "string",
    "description": "string (full narrative, 4-5 sentences)"
  },
  "rooms": [
    {
      "type": "BEDROOM | LIVING_ROOM | KITCHEN | BALCONY | etc.",
      "name": "string",
      "description": "string (detailed interior, 3-4 sentences)",
      "designDetails": {
        "colors": ["string"],
        "furniture": ["string"],
        "decor": ["string"],
        "lighting": "string"
      },
      "story": "string (emotional connection to character)",
      "imagePrompt": "string (detailed image generation prompt)"
    }
  ],
  "locations": [
    {
      "type": "CAFE | RESTAURANT | GYM | MALL | OFFICE | etc.",
      "name": "string (specific realistic name)",
      "description": "string (3 sentences)",
      "relationship": "string (why character loves this place)",
      "story": "string (memorable moment)",
      "address": "string",
      "visitFrequency": "DAILY | WEEKLY | MONTHLY | OCCASIONAL",
      "isFavorite": boolean,
      "imagePrompt": "string"
    }
  ],
  "friends": [
    {
      "name": "string",
      "age": number,
      "occupation": "string",
      "relationship": "BEST_FRIEND | CLOSE_FRIEND | COLLEAGUE | NEIGHBOR",
      "personality": { "summary": "string", "traits": ["string"] },
      "description": "string (how they met, 2-3 sentences)",
      "story": "string (shared memory)",
      "appearance": "string (for image generation)",
      "imagePrompt": "string"
    }
  ],
  "familyMembers": [
    {
      "name": "string",
      "relation": "MOTHER | FATHER | SIBLING | etc.",
      "age": number,
      "occupation": "string",
      "description": "string",
      "livesWith": boolean,
      "appearance": "string"
    }
  ],
  "pets": [
    {
      "name": "string",
      "species": "DOG | CAT | etc.",
      "breed": "string",
      "personality": { "summary": "string" },
      "description": "string",
      "appearance": "string"
    }
  ],
  "worldEvents": [
    {
      "title": "string",
      "type": "BIRTHDAY | FESTIVAL | LOCAL_EVENT | SEASONAL",
      "date": "YYYY-MM-DD",
      "recurring": boolean,
      "description": "string",
      "contentOpportunity": "string (specific content idea for this event)"
    }
  ],
  "routines": [
    {
      "type": "MORNING | EVENING | WEEKEND",
      "title": "string",
      "schedule": { "time": "string", "activity": "string" },
      "description": "string",
      "locationName": "string (reference to a location name)"
    }
  ],
  "outfits": [
    {
      "name": "string",
      "occasion": "CASUAL | WORK | GYM | FORMAL | etc.",
      "description": "string",
      "items": { "top": "string", "bottom": "string", "shoes": "string", "accessories": ["string"] },
      "brands": ["string"],
      "hairStyle": "string",
      "makeup": "string",
      "imagePrompt": "string"
    }
  ]
}
```

---

## Image Generation Sub-Prompts

For each entity with `imagePrompt`, queue parallel Fal AI jobs:

```
{{entity.imagePrompt}}

Character consistency reference:
{{character.name}}, {{character.age}} years old, {{bible.fashion.wardrobeStyle}}
{{bible.fashion.hairStyle}}, {{bible.fashion.colorPalette}}

Style: photorealistic, Instagram aesthetic, natural lighting
Negative: deformed, blurry, watermark, text, cartoon, anime
```

---

## Post-Processing

1. Transaction: Create World → Residence → Rooms → Locations → Friends → Family → Pets → Events
2. Create Routines (link locationId by name match)
3. Create Outfits
4. Queue image generation jobs for each `imagePrompt`
5. Save canonical Prompt for each generated image
6. Set `world.isComplete = true`
