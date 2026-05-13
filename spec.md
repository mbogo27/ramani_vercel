# Ramani OS Demo — Build Spec

**Purpose:** Friday demo. One Arrow Dental vault crystallising into three distinct surfaces in a single app — proving the Ramani OS thesis live.

---

## What you have coming in

- `arrow_dental.vault/` — full hand-built Ramani hypergraph vault (nodes, hyperedges, shadow nodes)
- `brand.md` — Arrow Dental brand voice, colours, tone
- `ramani-demo.jsx` — reference React implementation (graph view, 5-page website, workflow stub, chat stub)
- `.env` — `OPENROUTER_API_KEY` already set

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | React (JSX, no build step needed — runs in artifact/Vite) |
| Styling | Inline styles only — no Tailwind, no CSS modules |
| Fonts | Syne (headings/UI) + DM Mono (labels/code) via Google Fonts |
| Agent | OpenRouter REST API (`fetch`) — model `x-ai/grok-4-1-fast` |
| Vault data | Import directly from vault JSON files |
| Environment | `.env` via `import.meta.env.VITE_OPENROUTER_API_KEY` |

> **Note on OpenRouter SDK vs fetch:** The OpenRouter skill (https://openrouter.ai/skills/create-agent/SKILL.md) is Node/CLI-oriented. For this React browser app, call the OpenRouter REST API directly via `fetch` to `https://openrouter.ai/api/v1/chat/completions` with `Authorization: Bearer ${key}`. No SDK install needed.

---

## File structure

```
ramani-demo/
├── .env                          # VITE_OPENROUTER_API_KEY=...
├── src/
│   ├── main.jsx                  # React root
│   ├── App.jsx                   # Top-level shell + tab routing
│   ├── vault/
│   │   └── arrow_dental.js       # Vault data: nodes, hyperedges, workflow schema
│   ├── surfaces/
│   │   ├── GraphView.jsx         # Hypergraph visualisation
│   │   ├── WebsiteView.jsx       # 5-page navigable site
│   │   ├── WorkflowView.jsx      # Dynamic lead intake form (vault-generated)
│   │   └── AgentView.jsx         # Chat agent via OpenRouter
│   ├── components/
│   │   └── SurfaceLabel.jsx      # Shared surface label strip
│   └── styles/
│       └── tokens.js             # Design tokens (colours, spacing)
└── index.html
```

---

## Design tokens (from brand.md)

```js
// src/styles/tokens.js
export const tokens = {
  bg:        '#080810',
  bgSurface: '#0a0a14',
  bgCard:    '#0f0f1a',
  border:    'rgba(255,255,255,0.06)',
  text:      '#dddbe8',
  textMuted: '#6b6880',
  hot:       '#ff7055',   // hot node / primary CTA
  warm:      '#ffaa44',   // warm node / secondary
  cold:      '#5599ff',   // cold node / tertiary
  accent:    '#9b8fff',   // hyperedge / brand purple
  fontHead:  "'Syne', sans-serif",
  fontMono:  "'DM Mono', monospace",
}
```

---

## Vault data shape

Extract and normalise from `arrow_dental.vault/` into a single importable module:

```js
// src/vault/arrow_dental.js

export const NODES = [
  { id: 'brand',      label: 'Brand identity',   temp: 'hot',  x: 330, y: 200,
    desc: 'Arrow Dental brand promise and precision care' },
  { id: 'trust',      label: 'Patient trust',     temp: 'hot',  x: 510, y: 115,
    desc: 'Reviews, credentials, social proof' },
  { id: 'treatments', label: 'Treatments',        temp: 'hot',  x: 148, y: 115,
    desc: 'Full-service dental care menu' },
  { id: 'team',       label: 'Clinical team',     temp: 'warm', x: 565, y: 285,
    desc: 'Specialists and their expertise' },
  { id: 'pricing',    label: 'Pricing',           temp: 'warm', x: 95,  y: 285,
    desc: 'Transparent rates, no hidden costs' },
  { id: 'booking',    label: 'Booking',           temp: 'warm', x: 378, y: 338,
    desc: 'Appointment scheduling flow' },
  { id: 'location',   label: 'Location',          temp: 'cold', x: 190, y: 400,
    desc: 'Westlands, Nairobi — parking available' },
  { id: 'insurance',  label: 'Insurance',         temp: 'cold', x: 505, y: 400,
    desc: 'SHA, Jubilee, AAR, CIC, Britam, UAP' },
]

export const HYPEREDGES = [
  { id: 'patient_journey', label: 'patient_journey',
    nodes: ['trust','treatments','booking','pricing'], color: '#9b8fff' },
  { id: 'brand_voice',     label: 'brand_voice',
    nodes: ['brand','trust','team'],                  color: '#ff7055' },
  { id: 'intake_flow',     label: 'intake_flow',
    nodes: ['booking','location','insurance','pricing'], color: '#44cc88' },
]

// Workflow schema — drives the WorkflowView form (see below)
export const WORKFLOW_SCHEMA = [
  {
    step: 1,
    sourceNode: 'treatments',
    label: 'What brings you in?',
    type: 'select',
    required: true,
    options: [
      'Check-up / cleaning',
      'Toothache or pain',
      'Cosmetic (whitening, veneers)',
      'Orthodontics (braces / Invisalign)',
      'Missing tooth / implant',
      'Root canal',
      'Other',
    ],
  },
  {
    step: 2,
    sourceNode: 'trust',
    label: 'Your name',
    sublabel: 'How should we address you?',
    type: 'text',
    placeholder: 'Full name',
    required: true,
  },
  {
    step: 3,
    sourceNode: 'booking',
    label: 'Best way to reach you',
    type: 'contact',
    fields: [
      { key: 'phone', placeholder: 'Phone / WhatsApp', type: 'tel', required: true },
      { key: 'email', placeholder: 'Email (optional)', type: 'email', required: false },
    ],
  },
  {
    step: 4,
    sourceNode: 'insurance',
    label: 'Do you have dental insurance?',
    type: 'radio',
    required: false,
    options: ['Yes — SHA', 'Yes — Jubilee', 'Yes — AAR', 'Yes — CIC', 'Yes — Britam', 'Yes — UAP', 'No insurance'],
  },
  {
    step: 5,
    sourceNode: 'booking',
    label: 'Preferred appointment slot',
    type: 'slot',
    required: true,
    options: [
      'Mon-Fri morning (8am-12pm)',
      'Mon-Fri afternoon (12pm-5pm)',
      'Saturday (8am-4pm)',
      'Flexible — any slot',
    ],
  },
]
```

> **Vault integration note:** The `WORKFLOW_SCHEMA` is generated from the vault's `intake_flow` hyperedge — each step's `sourceNode` field references the vault node it was crystallised from. This is what you show on Friday: the form IS the vault, made tangible.

---

## Surface 1 — Hypergraph view

**Reference:** `GraphView` section of `ramani-demo.jsx` — this is correct, keep as-is.

Key behaviours:
- SVG canvas, `viewBox="0 0 660 450"`
- Convex hull polygons per hyperedge (filled + dashed stroke)
- Edges drawn between all node pairs within each hyperedge
- Nodes sized by temperature (`hot=22`, `warm=16`, `cold=12`)
- Hover: node radius expands +7px, desc text appears below
- Legend strip below SVG: temp colours + hyperedge dash colours
- Font rendering: use `style={{ fontSize, fontFamily }}` on SVG `<text>` elements (NOT bare SVG attributes)

---

## Surface 2 — Website (5 pages)

**Reference:** `WebsiteView` section of `ramani-demo.jsx` — correct, keep as-is.

Pages and their vault source nodes:

| Page | Vault source | Notes |
|------|-------------|-------|
| Home | `brand`, `trust` | Hero, stats, CTAs |
| Treatments | `treatments` | 6-card grid |
| Our team | `team` | 3 specialist cards |
| Pricing | `pricing` | Transparent rate table |
| Book now | `booking`, `location` | CTA cards + tip |

Sidebar nav shows vault source node as a dim label under each page name — this is the crystallisation breadcrumb, visible to the person you are demoing to.

---

## Surface 3 — Workflow (dynamic lead intake form)

**This is the redesigned surface.** Replace the old step-animation workflow with a vault-generated multi-step lead intake form.

### Concept

`project_workflow(intake_flow)` reads the `WORKFLOW_SCHEMA` from the vault and renders a dynamic form. Each step is displayed one at a time. The vault source node is shown as a label on each step — "this field came from the `insurance` node."

### Behaviour spec

- **One step visible at a time.** Step N is shown; steps N+1..end are hidden.
- **Progress bar** at top: fills as steps complete. Label shows `step N of 5`.
- **Step header** shows: step label, sublabel (if any), and a dim monospace tag `source: {sourceNode}` referencing the vault.
- **Input types:**
  - `text` / `tel` / `email` — standard `<input>` styled to match dark theme
  - `select` — styled dropdown or button-group (button-group preferred, one per option)
  - `radio` — same as select, button-group layout
  - `slot` — 2x2 grid of selectable time-slot cards
  - `contact` — renders multiple sub-fields stacked
- **Navigation:** Back + Next buttons. Next validates required fields before advancing. On final step, Next becomes "Submit".
- **Submit state:** Replace form with a confirmation card — patient name, treatment choice, slot. Show source vault label: `crystallised from intake_flow hyperedge`.
- **Reset link** on confirmation to restart.

### State shape

```js
const [currentStep, setCurrentStep] = useState(0)
const [formData, setFormData] = useState({})   // keyed by step sourceNode + field key
const [submitted, setSubmitted] = useState(false)
```

### Visual language

- Active step card: `border: 1px solid rgba(155,143,255,0.28)`, subtle purple glow
- Completed steps: shown as compact summary chips above the active card (not full form, just value)
- Source node tag: `fontFamily: DM Mono`, `fontSize: 10`, `color: accent` — makes the vault origin visible

---

## Surface 4 — Agent (OpenRouter + Grok)

### API call pattern

Use `fetch` directly — no SDK.

```js
const OPENROUTER_KEY = import.meta.env.VITE_OPENROUTER_API_KEY

async function callAgent(messages) {
  const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENROUTER_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://kongokega.com',   // OpenRouter requires this
      'X-Title': 'Ramani OS Demo',
    },
    body: JSON.stringify({
      model: 'x-ai/grok-4-1-fast',
      messages,
      stream: false,
    })
  })
  const data = await res.json()
  return data.choices[0].message.content
}
```

### System prompt (inject vault knowledge)

```js
const SYSTEM_PROMPT = `You are Arrow Dental Centre's AI assistant — an agentic surface projected from the Arrow Dental Ramani knowledge vault.

Vault knowledge:
- Arrow Dental is a modern, full-service dental clinic in Westlands, Nairobi, Kenya
- Services: general dentistry, cosmetic dentistry, orthodontics (braces + Invisalign), dental implants, teeth whitening, root canal therapy, extractions
- Pricing: Consultation KES 1,500 | Cleaning KES 3,500 | Filling from KES 4,000 | Root canal from KES 18,000 | Implant from KES 45,000 | Whitening from KES 8,000 | Braces from KES 85,000
- Hours: Mon-Sat 8am-6pm
- Contact: WhatsApp +254 700 000 000
- Location: Westlands, Nairobi — parking available
- Insurance accepted: SHA, Jubilee, AAR, CIC, Britam, UAP

If asked how you work: you are an agentic UI crystallised from the clinic's Ramani knowledge vault. The same vault data powers the website and the intake workflow — three surfaces, one substrate.
Be concise, warm, and helpful.`
```

### Conversation state

```js
const [messages, setMessages] = useState([
  { role: 'system', content: SYSTEM_PROMPT },
  { role: 'assistant', content: 'Hi! I am the Arrow Dental assistant. Ask me about treatments, pricing, or how to book.' }
])
```

On send:
1. Append `{ role: 'user', content: input }` to messages
2. Call `callAgent(messages)` — pass full history including system prompt
3. Append `{ role: 'assistant', content: reply }` to messages
4. Render only `role: user | assistant` messages (hide system prompt from UI)

### UI spec

- Chat bubble layout — user right (accent bg), assistant left (card bg)
- Typing indicator: three dots, staggered `animationDelay` (use separate `animationDelay` style prop, NOT shorthand `animation` string — known parse bug)
- Send on `Enter` keydown
- Input disabled while loading
- Small monospace label `agent` next to each assistant bubble

---

## App shell

```jsx
// App.jsx — tab routing between four surfaces

const TABS = [
  { id: 'graph',    label: 'Graph' },
  { id: 'website',  label: 'Website' },
  { id: 'workflow', label: 'Workflow' },
  { id: 'agent',    label: 'Agent' },
]

const SURFACE_LABELS = {
  graph:    'hypergraph substrate',
  website:  'project_nav() -> 5 pages',
  workflow: 'project_workflow(intake_flow)',
  agent:    'project_agent() -> public light cone',
}
```

Header: app name left, tabs right.
Sub-strip: dim `surface ->` label + bright surface operator label.

---

## Known gotchas (from reference implementation debugging)

1. **Apostrophes in JSX strings** — use double-quoted strings for any value containing an apostrophe. E.g. `"Arrow Dental's..."` not `'Arrow Dental's...'`
2. **`<-` in JSX text** — wraps as `{'<- '}` to prevent parser reading it as a tag opener
3. **SVG font props** — use `style={{ fontSize: 11, fontFamily: 'DM Mono,monospace' }}` on `<text>` elements, NOT bare `fontSize={11}` prop
4. **Animation shorthand** — use `animationName`, `animationDuration`, `animationDelay` as separate style props. The shorthand `animation: 'dot 1.2s 0.4s ease-in-out infinite'` silently breaks delays in React inline styles
5. **Non-ASCII characters** — avoid em dashes (`-`), middle dots, curly quotes, arrows in source strings; use plain ASCII equivalents

---

## Demo script (Friday)

1. Open on **Graph** — "this is the Arrow Dental Ramani vault. Eight nodes, three hyperedges. The thermal colour is how important each node is."
2. Switch to **Website** — "this is `project_nav()`. The same vault, crystallised into a navigable website. The sidebar shows which vault node each page came from."
3. Switch to **Workflow** — "this is `project_workflow()`. Same vault, crystallised into a dynamic intake form. Each field's source node is labelled. The form IS the graph."
4. Switch to **Agent** — "this is `project_agent()`. Same vault, no crystallisation — an agent traversing it directly. Ask it anything about the clinic." — live demo the chat.
5. Punchline: "one vault. Four surfaces. This is Ramani OS."
