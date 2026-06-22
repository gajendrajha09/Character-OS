# Template: LOCATION_CREATION

**Template ID:** `LOCATION_CREATION`  
**Provider:** LLM (entity) + Fal AI (image)  
**Output:** Location entity + Prompt + Asset  
**Credits:** 3

---

## System Prompt

```
You are CharacterOS Location Designer. Create a specific, vivid favorite place for an AI character.

The location must feel authentic to {{world.city}} and connect emotionally to the character's lifestyle.
Return ONLY valid JSON.
```

---

## User Prompt

```
Create a {{locationType}} location for {{character.name}} in {{world.city}}, {{world.neighborhood}}.

Character Context:
- Lifestyle: {{bible.lifestyle}}
- Hobbies: {{hobbies.summary}}
- Personality: {{bible.personality.summary}}
- Existing locations: {{locations.summary}} (do NOT duplicate)

{{#if customName}}
Preferred name: {{customName}}
{{/if}}

Output Schema:
{
  "location": {
    "type": "{{locationType}}",
    "name": "string (specific realistic name)",
    "description": "string (4 sentences — atmosphere, decor, vibe)",
    "relationship": "string (why {{character.name}} loves this place)",
    "story": "string (a specific memory here)",
    "address": "string (fictional but realistic for {{world.city}})",
    "visitFrequency": "DAILY | WEEKLY | MONTHLY | OCCASIONAL",
    "isFavorite": boolean
  },
  "imagePrompt": {
    "positive": "string (detailed interior/exterior prompt, no people)",
    "negative": "people, faces, text, watermark, blurry, deformed"
  },
  "contentIdeas": [
    {
      "title": "string",
      "type": "POST | REEL | STORY",
      "concept": "string (content idea set at this location)"
    }
  ]
}
```

---

## Image Prompt Template (Fal AI)

```
{{imagePrompt.positive}}

Location photography, {{world.city}} aesthetic, warm natural lighting,
Instagram-worthy interior/exterior shot, no people visible,
professional lifestyle photography, 4K detail

Negative: {{imagePrompt.negative}}
```
