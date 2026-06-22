# Template: TRENDING_REEL

**Template ID:** `TRENDING_REEL`  
**Provider:** LLM (script) + Higgsfield/Veo/Kling (video)  
**Output:** Reel entity + script + video  
**Credits:** 20 (Phase 2+)

---

## System Prompt

```
You are CharacterOS Reel Director. Create trending, viral-format video scripts grounded in
a character's world.

RULES:
1. Script must follow a specific trending format (GRWM, Day in My Life, POV, Get Ready With Me, etc.)
2. Every scene must use a location from the character's world.
3. Include scene-by-scene breakdown with timing, action, and dialogue/voiceover.
4. Match the character's personality and brand voice.
5. Duration: 15-60 seconds.

Return ONLY valid JSON.
```

---

## User Prompt

```
Create a trending reel script for {{character.name}}.

Character Context:
- Niche: {{character.contentNiche}}
- Brand Voice: {{character.brandVoice}}
- City: {{world.city}}
- Personality: {{bible.personality.summary}}

World Locations: {{locations.summary}}
Outfits: {{outfits.summary}}
Routines: {{routines.summary}}

Reel Settings:
- Format: {{format}} (TRENDING | UGC | INFLUENCER | VLOG | REVIEW | TUTORIAL | UNBOXING)
- Platform: {{platform}}
- Target Duration: {{duration}} seconds
- Trend Reference: {{trendReference}}

{{#if contentIdea}}
Content Idea: {{contentIdea.title}} — {{contentIdea.concept}}
Location: {{location.name}}
Outfit: {{outfit.name}}
{{/if}}

Output Schema:
{
  "reel": {
    "title": "string",
    "format": "{{format}}",
    "duration": number,
    "hook": "string (first 2 seconds — must stop scroll)",
    "musicSuggestion": "string (trending audio style)",
    "caption": "string (Instagram caption for the reel)",
    "hashtags": ["string"]
  },
  "script": {
    "scenes": [
      {
        "sceneNumber": number,
        "duration": "number (seconds)",
        "locationName": "string",
        "action": "string (what character does)",
        "voiceover": "string (what character says)",
        "cameraAngle": "string (close-up, wide, POV, etc.)",
        "transition": "string (cut, swipe, zoom)"
      }
    ]
  },
  "videoPrompt": {
    "provider": "HIGGSFIELD | VEO | KLING",
    "prompt": "string (full video generation prompt)",
    "parameters": {
      "duration": number,
      "aspectRatio": "9:16",
      "style": "UGC | CINEMATIC | TRENDING"
    }
  },
  "thumbnailPrompt": "string (Fal AI thumbnail image prompt)"
}
```

---

## Video Provider Routing

```
Format: TRENDING, UGC → Higgsfield (primary)
Format: CINEMATIC, REVIEW → Veo (primary)
Format: VLOG, TUTORIAL → Kling (primary)
All formats → fallback chain: primary → secondary → tertiary
```

---

## Higgsfield Prompt Template

```
{{videoPrompt.prompt}}

Character: {{character.name}}, {{bible.fashion.hairStyle}}, {{bible.fashion.wardrobeStyle}}
Setting: {{location.description}}
Style: {{videoPrompt.parameters.style}}, vertical 9:16, natural lighting
Duration: {{videoPrompt.parameters.duration}}s

Scene breakdown:
{{#each script.scenes}}
Scene {{sceneNumber}} ({{duration}}s): {{action}} at {{locationName}}. {{voiceover}}
{{/each}}
```

---

## Phase 2 Note

This template is architected but **not implemented in MVP Phase 1**.
Reel records can be created with script + caption only; `videoUrl` populated in Phase 2.
