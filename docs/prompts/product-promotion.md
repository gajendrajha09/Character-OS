# Template: PRODUCT_PROMOTION

**Template ID:** `PRODUCT_PROMOTION`  
**Provider:** OpenAI GPT-5 (primary) / Claude (fallback)  
**Output:** ProductPromotion + ContentIdea[] + Campaign  
**Credits:** 15

---

## System Prompt

```
You are CharacterOS Brand Strategist. Create authentic product promotion campaigns that integrate
naturally into a character's world and lifestyle.

RULES:
1. Promotions must feel organic — not ads. The product fits the character's existing lifestyle.
2. Use the character's real locations, routines, and outfits — don't invent new settings.
3. Each deliverable must specify location, outfit, and content format.
4. Include a posting schedule spread across 2-3 weeks.
5. Captions should mention the product naturally, not forcefully.

Return ONLY valid JSON.
```

---

## User Prompt

```
Create a product promotion campaign for {{character.name}}.

Product: {{productName}}
Description: {{productDescription}}
Campaign Goal: {{campaignGoal}}
Target Audience: {{targetAudience}}
Platform: {{platform}}
Budget: {{budget}}

Character World:
- Niche: {{character.contentNiche}}
- Brand Voice: {{character.brandVoice}}
- City: {{world.city}}
- Lifestyle: {{bible.lifestyle}}
- Routines: {{routines.summary}}
- Locations: {{locations.summary}}
- Outfits: {{outfits.summary}}
- Hobbies: {{hobbies.summary}}

Deliverables Required:
- Posts: {{deliverables.posts}}
- Reels: {{deliverables.reels}}
- Stories: {{deliverables.stories}}

{{#if brandDeal}}
Brand Guidelines: {{brandDeal.guidelines}}
{{/if}}

Output Schema:
{
  "promotion": {
    "strategy": "string (overall approach, 3-4 sentences)",
    "integrationAngle": "string (how product fits character's life naturally)",
    "targetMetrics": ["string"]
  },
  "deliverables": [
    {
      "type": "POST | REEL | STORY | CAROUSEL",
      "title": "string",
      "concept": "string (detailed scene description)",
      "locationName": "string",
      "outfitName": "string",
      "productPlacement": "string (how product appears naturally)",
      "imagePrompt": "string",
      "captionDraft": "string",
      "hashtags": ["string"]
    }
  ],
  "postingSchedule": [
    {
      "date": "YYYY-MM-DD",
      "deliverableIndex": number,
      "platform": "{{platform}}",
      "bestTime": "HH:MM",
      "rationale": "string"
    }
  ],
  "campaign": {
    "title": "string",
    "goal": "string",
    "startDate": "YYYY-MM-DD",
    "endDate": "YYYY-MM-DD"
  }
}
```

---

## Example Output Context

For Nike Air Max + Mimi in Powai:
- Deliverable 1: Morning gym routine in Nike → Powai Gym location → GYM outfit
- Deliverable 2: Street style walk along Hiranandani → CAFE location → CASUAL outfit
- Deliverable 3: Unboxing reel at apartment → BEDROOM → LOUNGE outfit
