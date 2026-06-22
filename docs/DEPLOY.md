# Deploying CharacterOS

## Quick live link (GitHub Pages)

The repo includes a static landing page at [`docs/index.html`](./index.html) — no build step required.

1. Open **GitHub → Character-OS → Settings → Pages**
2. Under **Build and deployment**, set **Source** to **Deploy from a branch**
3. Choose branch **main** and folder **/docs**
4. Save — GitHub publishes within ~1 minute

**Live URL:** [https://gajendrajha09.github.io/Character-OS/](https://gajendrajha09.github.io/Character-OS/)

The static page links to the repo for running the full studio locally. Add Mimi demo images under `docs/images/mimi/` (copy from `public/images/mimi/` when available) to show the portrait on Pages.

## Full Next.js app (local or Vercel)

The interactive studio (`/` landing + `/studio` dashboard) is a Next.js 15 app with API routes. It needs a Node runtime — GitHub Pages cannot host it as-is.

### Local

```bash
npm install
npm run dev
```

- Landing: [http://localhost:3000](http://localhost:3000)
- Studio: [http://localhost:3000/studio](http://localhost:3000/studio)

### Vercel (recommended for production)

1. Import [github.com/gajendrajha09/Character-OS](https://github.com/gajendrajha09/Character-OS) on [vercel.com](https://vercel.com)
2. Deploy with default Next.js settings
3. Optional env vars: `HIGGSFIELD_API_KEY`, `DATABASE_URL`, etc. (see `.env.example`)

Vercel gives you a live URL for both the landing page and the full studio with API routes.
