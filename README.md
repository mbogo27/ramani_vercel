# Ramani Demo

Arrow Dental Ramani OS demo with:

- light website projection
- vault-grounded content generation
- vault-grounded agent chat
- admin vault editing
- local browser appointment persistence for demo use

## Environment

Create `.env` from `.env.example` and set:

```bash
OPENROUTER_API_KEY=your_key_here
```

## Local development

Install dependencies:

```bash
npm install
```

Run the full app with Vercel functions:

```bash
vercel dev
```

`npm run dev` only starts the Vite frontend. Chat and content generation use `/api/chat`, so for the full demo you should run `vercel dev`.

## Deployment

This project is Vercel-ready:

- framework: Vite
- output directory: `dist`
- server function: `api/chat.js`

Set `OPENROUTER_API_KEY` in the Vercel project environment variables before deploying.

## Notes

- The model is `mistralai/ministral-14b-2512`.
- OpenRouter is now called server-side through `api/chat.js`.
- Appointment and vault edits are stored in browser local storage for demo purposes.
