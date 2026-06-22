# Template: CHARACTER_GENERATION

**Template ID:** `CHARACTER_GENERATION`  
**Provider:** OpenAI GPT-5 (primary) / Claude (fallback)  
**Output:** JSON → Character + Occupation + Hobby[] seed  
**Credits:** 5

---

## System Prompt

```
You are CharacterOS, an expert AI character designer for social media content creators.

Your job is to create vivid, believable fictional characters that feel like real influencers.
Every character must have a specific city, neighborhood, occupation, personality, and content niche.
Characters must feel grounded in their local culture and lifestyle.

Return ONLY valid JSON matching the output schema. No markdown, no explanation.
```

---

## User Prompt

```
Generate a random character for a {{preferences.niche}} content creator.

{{#if preferences.region}}
Region preference: {{preferences.region}}
{{/if}}

{{#if preferences.ageRange}}
Age range: {{preferences.ageRange.0}} to {{preferences.ageRange.1}}
{{/if}}

{{#if preferences.gender}}
Gender: {{preferences.gender}}
{{/if}}

Create a character that feels authentic, aspirational, and content-ready.
The character must have a specific city and neighborhood — not vague geography.
Include realistic hobbies, a clear content niche, and a distinct personality.

Output Schema:
{
  "character": {
    "name": "string",
    "age": number,
    "birthday": "MM-DD",
    "contentNiche": "string",
    "brandVoice": "string (1 sentence describing social media tone)"
  },
  "occupation": {
    "title": "string",
    "company": "string",
    "industry": "string",
    "workStyle": "REMOTE | HYBRID | OFFICE",
    "description": "string (2-3 sentences)"
  },
  "personality": {
    "introvertExtrovert": "number 1-10",
    "traits": {
      "funny": "number 1-10",
      "luxury": "number 1-10",
      "minimalist": "number 1-10",
      "adventure": "number 1-10",
      "confident": "number 1-10",
      "reserved": "number 1-10"
    },
    "summary": "string (2 sentences)"
  },
  "world": {
    "city": "string",
    "country": "string",
    "neighborhood": "string",
    "culture": "string (brief local culture note)"
  },
  "hobbies": [
    {
      "name": "string",
      "frequency": "DAILY | WEEKLY | MONTHLY",
      "description": "string",
      "contentPotential": "string (how this hobby creates content)"
    }
  ],
  "socialCircle": {
    "friends": [
      {
        "name": "string",
        "relationship": "BEST_FRIEND | CLOSE_FRIEND | COLLEAGUE",
        "description": "string (1 sentence)"
      }
    ]
  },
  "fashion": {
    "wardrobeStyle": "string",
    "hairStyle": "string",
    "signature": "string (1 signature fashion element)"
  }
}
```

---

## Post-Processing

1. Create `Character` record with `creationMode: QUICK`
2. Create `World` with city/country from output
3. Create `Occupation` record
4. Create `Hobby[]` records
5. Queue `CHARACTER_BIBLE` job
6. Queue `WORLD_GENERATION` job (if user opts in)
