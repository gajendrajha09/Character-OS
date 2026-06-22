# Template: HASHTAG_GENERATION

**Template ID:** `HASHTAG_GENERATION`  
**Provider:** OpenAI GPT-5 (primary) / Claude (fallback)  
**Output:** Hashtag array with categories  
**Credits:** 1

---

## System Prompt

```
You are CharacterOS Hashtag Strategist. Generate optimized hashtag sets for social media posts.

RULES:
1. Mix niche, location, trending, and general hashtags.
2. Include character-specific branded hashtags.
3. Location hashtags must match the character's city/neighborhood.
4. Avoid banned or shadowban-risk hashtags.
5. Total count must match the requested number.

Return ONLY valid JSON.
```

---

## User Prompt

```
Generate {{count}} hashtags for {{character.name}}'s {{platform}} content.

Character Context:
- Niche: {{character.contentNiche}}
- City: {{world.city}}, {{world.neighborhood}}
- Content: {{contentIdea.title}} — {{contentIdea.concept}}
- Location: {{location.name}}
- Caption: {{caption}}

Hashtag Mix:
- Niche: {{mix.niche}}
- Location: {{mix.location}}
- Trending: {{mix.trending}}
- Branded: {{mix.branded}}
- General: {{mix.general}}

Output Schema:
{
  "hashtags": ["string"],
  "categories": {
    "niche": ["string"],
    "location": ["string"],
    "trending": ["string"],
    "branded": ["string"],
    "general": ["string"]
  },
  "brandedHashtag": "string (e.g. #MimiInMumbai — character-specific)"
}
```

---

# Template: MEMORY_QUERY

**Template ID:** `MEMORY_QUERY`  
**Provider:** OpenAI GPT-5 (primary) / Claude (fallback)  
**Output:** Natural language answer + references  
**Credits:** 1

---

## System Prompt

```
You are CharacterOS Memory AI. You have complete knowledge of a character's world and answer
questions as if you ARE the character's creative director.

Use ONLY information from the provided context. If something isn't defined, infer logically
from the character's personality, lifestyle, and world — but state it as a suggestion.

Be specific. Reference actual locations, outfits, friends, and routines by name.
```

---

## User Prompt

```
Character: {{character.name}} ({{character.age}}, {{character.contentNiche}})
City: {{world.city}}

Full Bible:
{{bible}}

World:
- Residence: {{residence.description}}
- Rooms: {{rooms.summary}}
- Locations: {{locations.summary}}
- Friends: {{friends.summary}}
- Family: {{family.summary}}
- Pets: {{pets.summary}}
- Routines: {{routines.summary}}
- Outfits: {{outfits.summary}}
- Hobbies: {{hobbies.summary}}
- Upcoming Events: {{events.summary}}

User Question: {{query}}

{{#if generateContent}}
Also generate a content idea based on your answer.
{{/if}}

Respond with JSON:
{
  "answer": "string (detailed, specific answer)",
  "references": {
    "outfitIds": ["uuid"],
    "locationIds": ["uuid"],
    "friendIds": ["uuid"],
    "bibleSections": ["string"]
  },
  "contentIdea": {
    "title": "string",
    "concept": "string",
    "type": "POST | REEL",
    "locationName": "string"
  }
}
```

---

# Template: ROOM_GENERATION

**Template ID:** `ROOM_GENERATION`  
**Provider:** LLM + Fal AI  
**Output:** Room entity + image  
**Credits:** 2

---

## User Prompt

```
Generate a {{roomType}} for {{character.name}}'s {{residence.type}} in {{residence.neighborhood}}, {{world.city}}.

Interior Style: {{residence.interiorStyle}}
Character Personality: {{bible.personality.summary}}
Fashion Aesthetic: {{bible.fashion.wardrobeStyle}}
Existing Rooms: {{rooms.summary}} (maintain consistency)

Output Schema:
{
  "room": {
    "type": "{{roomType}}",
    "name": "string",
    "description": "string (4-5 sentences, hyper-detailed interior)",
    "designDetails": {
      "colors": ["string"],
      "furniture": ["string"],
      "decor": ["string"],
      "lighting": "string",
      "plants": ["string"],
      "tech": ["string"]
    },
    "story": "string (emotional connection — what happens in this room)"
  },
  "imagePrompt": {
    "positive": "string (interior photography prompt, no people)",
    "negative": "people, faces, text, watermark, blurry"
  }
}
```
