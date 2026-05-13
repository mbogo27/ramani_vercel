# Ramani Vercel App

Deployable Vercel version of the Ramani OS demo for Arrow Dental Centre.

## What Changed In This Copy

- frontend copied into a clean project folder
- browser-side OpenRouter call removed
- Vercel serverless function added at `api/chat.js`
- OpenRouter key now stays server-side as `OPENROUTER_API_KEY`

## Local Development

Install dependencies:

```bash
npm install
```

Frontend only:

```bash
npm run dev
```

Full app with Vercel function locally:

```bash
vercel dev
```

For local server-side chat, create `.env` from `.env.example` and set:

```bash
OPENROUTER_API_KEY=your_key_here
```

## Deploy To Vercel

Project settings:

- Framework Preset: `Vite`
- Build Command: `npm run build`
- Output Directory: `dist`

Environment variable:

```bash
OPENROUTER_API_KEY=your_key_here
```

Do not use `VITE_OPENROUTER_API_KEY` in this project.

## GitHub Upload

1. Create a new empty GitHub repository.
2. Open a terminal in this folder.
3. Run:

```bash
git init
git add .
git commit -m "Initial Vercel-ready Ramani app"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

4. Import that GitHub repo into Vercel and add `OPENROUTER_API_KEY` in the Vercel dashboard before deploying.
