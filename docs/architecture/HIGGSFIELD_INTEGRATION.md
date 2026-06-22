# CharacterOS — Higgsfield Generation Integration

## Architecture

```
User Intent ("Generate Post")
        ↓
Auto Brief Builder (world memory + consistency layer)
        ↓
Model Selector (auto-picks Higgsfield model)
        ↓
HiggsfieldProvider → higgsfieldClient (MCP/API)
        ↓
Asset Vault (store + link to character/world)
        ↓
Recent Content Feed + Derivative Actions
```

## Provider Interface

`src/lib/ai/providers/types.ts`

- `generateImage()`
- `generateVideo()`
- `generateCarousel()`
- `generateProductPromo()`
- `generateReel()`

Primary: **HiggsfieldProvider** (`src/lib/ai/providers/higgsfield.provider.ts`)

Fallbacks: Fal, Replicate (via legacy adapter)

## Model Auto-Selection

`src/lib/ai/model-selector.ts`

| Content Goal | Higgsfield Model |
|--------------|------------------|
| Lifestyle | soul_2 |
| Product Photography | marketing_studio_image |
| Luxury Fashion | soul_2 |
| Influencer Portrait | soul_2 |
| Travel | soul_2 |
| Reels | seedance_2_0 |
| Product Video | marketing_studio_video |

## Character Consistency

`src/lib/ai/consistency-layer.ts` injects appearance, hair, face, wardrobe, personality, location into every prompt automatically.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/generate` | Generate from action (post, reel, promo, etc.) |
| GET | `/api/assets` | List generated assets |
| GET | `/api/generation/history` | Generation timeline |
| POST | `/api/assets/[id]/derive` | Caption, reel, story, product placement from asset |

## Configuration

```env
HIGGSFIELD_API_KEY=your_key          # Live generation
MOCK_GENERATION=true                 # Demo placeholders when key unset
DEMO_CHARACTER_ID=uuid               # Character for demo mode
```

## Derivative Actions (Retention)

After generation, users can:
- Generate Caption
- Generate Reel Version
- Generate Story Version
- Generate Product Placement

Each derives from the same world memory + source asset context.
