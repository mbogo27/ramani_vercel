# Project Detail

## Overview

This repository is a demo/prototype for **Ramani OS** using **Arrow Dental Centre** as the example business.

The main deliverable in this repo is a **single-page React app** that demonstrates how one knowledge substrate can be projected into multiple user-facing surfaces:

1. A **hypergraph view** of the clinic knowledge model
2. A **website surface** with five navigable sections
3. A **workflow surface** for lead intake / appointment capture
4. An **agent surface** that answers questions about the clinic via OpenRouter

The repo also contains a separate **`arrow-dental-vault/` knowledge vault and Python prototype runtime**, which appears to be the source material and earlier backend/runtime work behind the frontend demo.

## What Is In The Repo

### Frontend app

- `src/main.jsx`: React entrypoint
- `src/App.jsx`: mounts the main demo component
- `ramani-demo.jsx`: almost the entire product demo in one file
- `index.html`: Vite app shell
- `vite.config.js`: Vite config
- `package.json`: Vite + React scripts and dependencies

### Project documentation

- `spec.md`: intended build spec for the Friday demo
- `brand.md`: Arrow Dental brand/voice/source-of-truth content

### Knowledge vault / prototype backend

- `arrow-dental-vault/`: markdown knowledge graph, STC contracts, Python scripts, tests, and project notes
- `arrow-dental-vault/projectreport.md`: explains the vault/bootloader concept and runtime

## What The App Does Today

The current app is a **Vite + React 18** frontend with inline styles and no router library. State is handled locally with React hooks.

### 1. Graph surface

The `Graph` tab renders:

- clinic nodes such as brand, trust, treatments, booking, location, and insurance
- hyperedges such as `patient_journey`, `brand_voice`, and `intake_flow`
- hover interactions for node descriptions
- a legend for node temperature and hyperedge types

### 2. Website surface

The `Website` tab renders a mock clinic website with five sections:

- Home
- Treatments
- Our team
- Pricing
- Book now

This is implemented as in-app page switching, not a multi-route site.

### 3. Workflow surface

The `Workflow` tab renders a multi-step intake form driven by a local `WORKFLOW_SCHEMA`.

It includes:

- one-step-at-a-time form flow
- progress bar
- validation for required steps
- completion summary card
- visible node/source labels to show how the form is "crystallised" from the vault

### 4. Agent surface

The `Agent` tab renders a chat UI that now calls a **server-side Vercel function** at `/api/chat`.

Important implementation detail:

- the browser no longer holds the OpenRouter API key
- the Vercel function reads `OPENROUTER_API_KEY` from server environment variables
- the system prompt is injected server-side before calling OpenRouter

This is the safer deployment model for a public Vercel deployment.

## Main Architecture Reading

The project is best understood as two related layers:

### Layer 1: Demo frontend

The React app is the visible product demo. It shows the "one vault, multiple surfaces" idea in a way that is easy to present.

### Layer 2: Knowledge vault / runtime concept

The `arrow-dental-vault/` folder contains the deeper system idea:

- markdown nodes and hyperedges
- response and behavior rules
- STC tool contracts
- Python bootloader/runtime
- local demo data and smoke tests

This suggests the current React app is a **presentation/demo layer**, while the vault folder represents the broader **knowledge operating model** behind it.

## Tech Stack

- React 18
- Vite 5
- Plain JSX
- Inline styles only
- Google Fonts loaded at runtime
- OpenRouter REST API for the chat surface

## Build Status

The project builds successfully with:

```bash
npm run build
```

The Vite production build outputs to `dist/`.

## Deployment To Vercel

This repo is straightforward to deploy to Vercel because the frontend is a standard Vite app.

### Recommended Vercel settings

- **Framework Preset:** `Vite`
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Environment variable

For this Vercel-ready copy, set:

```bash
OPENROUTER_API_KEY=your_key_here
```

Do **not** use a `VITE_` prefix for the OpenRouter key in this project.

## Practical Deployment Steps

### Deployment flow

1. Push the repo to GitHub
2. Import the repo into Vercel
3. Set:
   - framework preset: `Vite`
   - build command: `npm run build`
   - output directory: `dist`
4. Add `OPENROUTER_API_KEY` in Vercel project settings
5. Deploy

## Conclusion

This project is a **demo frontend for Ramani OS** built around **Arrow Dental Centre**. This Vercel-ready copy is deployable as a Vite app with a server-side chat function, and the build is working.
