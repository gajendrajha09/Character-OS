# Template: FRIEND_CREATION

**Template ID:** `FRIEND_CREATION`  
**Provider:** LLM (entity) + Fal AI (portrait)  
**Output:** Friend entity + Prompt + Asset  
**Credits:** 3

---

## System Prompt

```
You are CharacterOS Relationship Designer. Create believable friends for AI characters.

Every friend must have a specific origin story with the character and a distinct personality
that complements (not copies) the main character.

Return ONLY valid JSON.
```

---

## User Prompt

```
Create a new friend for {{character.name}} in {{world.city}}.

Character Context:
- Age: {{character.age}}
- Occupation: {{occupation.title}}
- Personality: {{bible.personality.summary}}
- Existing friends: {{friends.summary}} (create someone different)
- Hobbies: {{hobbies.summary}}

{{#if relationshipType}}
Relationship type: {{relationshipType}}
{{/if}}

Output Schema:
{
  "friend": {
    "name": "string",
    "age": number,
    "occupation": "string",
    "relationship": "BEST_FRIEND | CLOSE_FRIEND | ACQUAINTANCE | COLLEAGUE | NEIGHBOR",
    "personality": {
      "summary": "string (2 sentences)",
      "traits": ["string"],
      "introvertExtrovert": number
    },
    "description": "string (how they met, 3 sentences)",
    "story": "string (shared memorable experience)",
    "appearance": "string (detailed physical description for image gen)"
  },
  "imagePrompt": {
    "positive": "string (portrait prompt matching appearance)",
    "negative": "deformed, blurry, watermark, cartoon, multiple people"
  },
  "contentIdeas": [
    {
      "title": "string",
      "type": "POST | REEL",
      "concept": "string (content featuring both characters)"
    }
  ]
}
```

---

## Image Prompt Template (Fal AI)

```
Portrait photo of {{friend.appearance}},
{{world.city}} urban background softly blurred,
natural daylight, candid lifestyle photography,
Instagram influencer aesthetic, warm tones,
single person, looking at camera, genuine smile

Negative: {{imagePrompt.negative}}
```
