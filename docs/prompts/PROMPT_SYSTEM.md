# CharacterOS — Prompt System Architecture

## Overview

All AI generation flows through a **Prompt Engine** that:

1. Loads **Context** from Character → World → Content graph
2. Selects the appropriate **Template**
3. Injects context variables
4. Routes to **LLM** (text) or **Image/Video Provider** (visual)
5. Persists output + canonical **Prompt** for consistency

---

## Prompt Engine Interface

```typescript
interface PromptEngine {
  build(template: PromptTemplate, context: CharacterContext, overrides?: Partial<PromptVariables>): BuiltPrompt;
  execute(built: BuiltPrompt, provider: ProviderConfig): Promise<GenerationResult>;
  savePrompt(characterId: string, result: GenerationResult, template: PromptTemplate): Promise<Prompt>;
}

interface CharacterContext {
  character: Character;
  bible: CharacterBible;
  world: World;
  residence?: Residence & { rooms: Room[] };
  locations: Location[];
  friends: Friend[];
  family: FamilyMember[];
  pets: Pet[];
  occupation?: Occupation;
  routines: Routine[];
  hobbies: Hobby[];
  outfits: Outfit[];
  events: WorldEvent[];
  canonicalPrompts: Prompt[];
  campaign?: Campaign;
}
```

---

## Variable Injection

All templates use `{{variable}}` syntax. Standard variables available in every template:

| Variable | Source |
|----------|--------|
| `{{character.name}}` | Character |
| `{{character.age}}` | Character |
| `{{character.contentNiche}}` | Character |
| `{{character.brandVoice}}` | Character |
| `{{bible.identity}}` | CharacterBible JSON |
| `{{bible.personality}}` | CharacterBible JSON |
| `{{bible.fashion}}` | CharacterBible JSON |
| `{{bible.lifestyle}}` | CharacterBible JSON |
| `{{world.city}}` | World |
| `{{world.summary}}` | World |
| `{{residence.description}}` | Residence |
| `{{locations.summary}}` | Aggregated Location list |
| `{{friends.summary}}` | Aggregated Friend list |
| `{{occupation.title}}` | Occupation |
| `{{outfits.summary}}` | Aggregated Outfit list |

---

## Template Registry

| Template | File | Provider | Output |
|----------|------|----------|--------|
| CHARACTER_GENERATION | `character-generation.md` | LLM | Character seed JSON |
| CHARACTER_BIBLE | `character-bible.md` | LLM | Bible JSON + Markdown |
| WORLD_GENERATION | `world-generation.md` | LLM | World + Residence + Locations |
| LOCATION_CREATION | `location-creation.md` | LLM + Fal | Location entity + image |
| FRIEND_CREATION | `friend-creation.md` | LLM + Fal | Friend entity + portrait |
| LIFESTYLE_GENERATION | `lifestyle-generation.md` | LLM | Routines, Hobbies, Outfits |
| CONTENT_CALENDAR | `content-calendar.md` | LLM | ContentIdea[] |
| PRODUCT_PROMOTION | `product-promotion.md` | LLM | ProductPromotion plan |
| INSTAGRAM_CAPTION | `instagram-caption.md` | LLM | Caption string |
| TRENDING_REEL | `trending-reel.md` | LLM + Higgsfield | Reel script + video |
| HASHTAG_GENERATION | `hashtag-generation.md` | LLM | Hashtag array |
| MEMORY_QUERY | `memory-query.md` | LLM | Natural language answer |
| ROOM_GENERATION | `room-generation.md` | LLM + Fal | Room entity + image |
| OUTFIT_GENERATION | `outfit-generation.md` | LLM + Fal | Outfit entity + image |

---

## Provider Routing

```
PromptTemplate
    │
    ├── Text-only templates → OpenAI GPT-5 (primary) / Claude (fallback)
    │
    ├── Image templates → Fal AI (primary) / Replicate (fallback)
    │
    └── Video templates → Higgsfield (primary) / Veo / Kling (fallback)
```

**Fallback chain:**
1. Primary provider fails → retry once
2. Still fails → fallback provider
3. Both fail → return `GENERATION_FAILED` with partial context saved

---

## Consistency Rules

1. **Canonical Prompts:** First successful image gen for a Location/Room/Outfit/Friend becomes `isCanonical: true`
2. **Reference Injection:** Subsequent generations include canonical prompt fragments in `{{canonical.location}}`, `{{canonical.character}}`
3. **Negative Prompts:** Shared character-level negative prompt stored on Character, injected into all image templates
4. **Version Tracking:** Prompt edits increment `version`; old versions retained for rollback

---

## Output Parsing

LLM templates specify JSON output schemas. The Prompt Engine validates with Zod before persisting.

```
LLM Response → JSON Parse → Zod Validate → Prisma Transaction → Return
```

Invalid JSON → retry with "Return valid JSON only" instruction (max 2 retries).
