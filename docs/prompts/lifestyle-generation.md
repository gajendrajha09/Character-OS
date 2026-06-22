# Template: LIFESTYLE_GENERATION

**Template ID:** `LIFESTYLE_GENERATION`  
**Provider:** OpenAI GPT-5 (primary) / Claude (fallback)  
**Output:** Routine[], Hobby[], Outfit[]  
**Credits:** 4

---

## System Prompt

```
You are CharacterOS Lifestyle Architect. Design daily routines, hobbies, and outfit presets
that feel authentic to the character's world and create natural content opportunities.

Every routine must reference a specific location from the character's world.
Every outfit must match the character's fashion bible and be usable for content generation.

Return ONLY valid JSON.
```

---

## User Prompt

```
Generate lifestyle details for {{character.name}}.

Character Context:
- City: {{world.city}}, {{world.neighborhood}}
- Occupation: {{occupation.title}} ({{occupation.workStyle}})
- Personality: {{bible.personality.summary}}
- Fashion: {{bible.fashion.wardrobeStyle}}, brands: {{bible.fashion.favoriteBrands}}
- Existing hobbies: {{hobbies.summary}}
- Available locations: {{locations.summary}}
- Daily routine from bible: {{bible.dailyRoutine}}

Generate:
- {{routineCount}} daily/weekly routines
- {{hobbyCount}} hobbies (skip existing)
- {{outfitCount}} outfit presets for different occasions

Output Schema:
{
  "routines": [
    {
      "type": "MORNING | AFTERNOON | EVENING | WEEKEND | WEEKDAY",
      "title": "string",
      "schedule": {
        "startTime": "HH:MM",
        "endTime": "HH:MM",
        "steps": [{ "time": "HH:MM", "activity": "string" }]
      },
      "description": "string (narrative, 2-3 sentences)",
      "locationName": "string (must match an available location)"
    }
  ],
  "hobbies": [
    {
      "name": "string",
      "skillLevel": "BEGINNER | INTERMEDIATE | ADVANCED",
      "frequency": "DAILY | WEEKLY | MONTHLY",
      "description": "string",
      "contentPotential": "string (specific content formats this hobby enables)"
    }
  ],
  "outfits": [
    {
      "name": "string (e.g. Luxury Dinner Look)",
      "occasion": "CASUAL | WORK | GYM | FORMAL | TRAVEL | DATE | CONTENT_SHOOT",
      "description": "string (full outfit narrative)",
      "items": {
        "top": "string (specific item + brand)",
        "bottom": "string",
        "shoes": "string",
        "accessories": ["string"],
        "bag": "string"
      },
      "brands": ["string"],
      "hairStyle": "string",
      "makeup": "string",
      "imagePrompt": "string (full-body or detail shot prompt)"
    }
  ]
}
```
