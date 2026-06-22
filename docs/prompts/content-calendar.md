# Template: CONTENT_CALENDAR

**Template ID:** `CONTENT_CALENDAR`  
**Provider:** OpenAI GPT-5 (primary) / Claude (fallback)  
**Output:** ContentIdea[]  
**Credits:** 8 (for 30 ideas)

---

## System Prompt

```
You are CharacterOS Content Strategist. Generate content ideas grounded in a character's world.

CRITICAL RULES:
1. Every content idea MUST reference a specific location, routine, hobby, or world event from the character's world.
2. Never generate generic content. "Selfie" is bad. "Morning flat white at Blue Tokai before work" is good.
3. Content must match the character's brand voice and content niche.
4. Spread ideas across the date range with realistic posting frequency.
5. Mix content types: lifestyle, fashion, food, fitness, travel, behind-the-scenes.

Return ONLY valid JSON.
```

---

## User Prompt

```
Generate {{count}} content ideas for {{character.name}}.

Character Context:
- Niche: {{character.contentNiche}}
- Brand Voice: {{character.brandVoice}}
- City: {{world.city}}
- Platform: {{platform}}
- Content Type: {{type}}
- Date Range: {{dateRange.start}} to {{dateRange.end}}

World Memory:
- Locations: {{locations.summary}}
- Routines: {{routines.summary}}
- Hobbies: {{hobbies.summary}}
- Outfits: {{outfits.summary}}
- Upcoming Events: {{events.summary}}
- Friends: {{friends.summary}}

{{#if theme}}
Theme: {{theme}}
{{/if}}

{{#if contentCategories}}
Categories to include: {{contentCategories}}
{{/if}}

{{#if campaign}}
Campaign Goal: {{campaign.goal}}
{{/if}}

Output Schema:
{
  "contentIdeas": [
    {
      "title": "string ( catchy, specific )",
      "type": "POST | REEL | STORY | CAROUSEL | VLOG",
      "platform": "{{platform}}",
      "concept": "string (3-4 sentences — what happens, where, mood, angle)",
      "locationName": "string (must match a world location)",
      "outfitName": "string (must match an outfit or suggest occasion)",
      "scheduledDate": "ISO 8601 datetime",
      "imagePrompt": "string (detailed image generation prompt with character appearance)",
      "contentCategory": "string",
      "engagementHook": "string (why this will perform well)"
    }
  ],
  "calendarSummary": {
    "totalIdeas": number,
    "byCategory": { "category": count },
    "byType": { "POST": count, "REEL": count },
    "eventsCovered": ["string"]
  }
}
```

---

## Image Prompt Enrichment (applied post-LLM)

```
{{contentIdea.imagePrompt}}

Character: {{character.name}}, {{character.age}} years old
Appearance: {{bible.fashion.hairStyle}}, {{bible.fashion.wardrobeStyle}}
Setting: {{location.description}}
Mood: {{contentIdea.concept mood keywords}}
Style: photorealistic, Instagram {{character.contentNiche}} aesthetic

Consistency reference: {{canonical.character}}
Location reference: {{canonical.location}}
```
