---
type: hyperedge
domain: conversion
label: Booking Conversion
kind: conversion-scenario
arity: 6
participants:
  - node: '[[tone-guide]]'
    role: tone-constraint
  - node: '[[forbidden-words]]'
    role: constraint
  - node: '[[class-services]]'
    role: subject
  - node: '[[new-patient-special]]'
    role: offer
  - node: '[[proof-points]]'
    role: credibility-anchor
  - node: '[[IF-operations]]'
    role: cta-endpoint

ghost_edge:
  type: conditional
  steps:
    - node: '[[_index]]'
      label: "Identify audience class from signals"
      condition: null
    - node: '[[class-services]]'
      label: "Identify service interest — stay at z=2 unless specific"
      condition: null
    - node: '[[tone-guide]]'
      label: "Calibrate tone to audience class"
      condition: null
    - node: '[[proof-points]]'
      label: "Load if patient signals hesitation or comparison"
      condition: "if hesitation_signal == true"
    - node: '[[new-patient-special]]'
      label: "Surface offer if patient asks about cost"
      condition: "if pricing_signal == true AND cost_sensitive == false"
    - node: '[[forbidden-words]]'
      label: "Suppress offer if patient already expressed cost concern"
      condition: "if cost_sensitive == true"
    - node: '[[IF-operations]]'
      label: "Close with single booking CTA"
      condition: null
---

# Hyperedge — Booking Conversion

## Activation Condition

Fires when the patient signals intent to book, inquires about
services, or is moving toward a decision.

Trigger signals:
`book` `appointment` `schedule` `visit` `come in` `walk in`
`how much` `price` `cost` `do you offer` `what services`
`can you help with` `I need`

## What This Hyperedge Does

This is the primary conversion engine of the vault. It assembles
the right combination of: audience tone + service info + credibility
+ offer + CTA — calibrated to who is asking.

The audience class detected at Step 1 governs everything downstream.

## Audience → Trigger → Friction Remover Map

| Audience Class | Primary Trigger | Friction Remover |
|---------------|----------------|-----------------|
| Families | "Pediatric care available now" | "No referral needed" |
| CBD Professionals | "Open until 7pm" | "Walk-ins welcome" |
| Thika Commuters | "Sunday hours: 8:30am–6pm" | "Book via WhatsApp — skip the queue" |
| Cost-Sensitive | "Payment plans available" | "Transparent pricing, no surprises" |
| Nervous Patients | "Gentle, painless approach" | "Walk in — no pressure" |

## Ghost Edge Sequence

**Step 1 — Audience identification (_index)**
Read signals to identify which audience class is present.
If unclear → default to tone-guide base tone, stay at z=2.

**Step 2 — Service identification (class-services)**
Stay at z=2 unless patient names a specific procedure.
If specific → expand to that leaf node only.

**Step 3 — Tone calibration (tone-guide + audience class)**
Apply the audience-specific tone calibration.
CBD professionals → efficient and direct.
Nervous patients → empathy before information.
Families → speak to parent, not child.

**Step 4 — Credibility injection (proof-points)**
Condition: only if patient signals hesitation, comparison, or doubt about quality.
Pick the one proof point most relevant to their concern.
Do not list all metrics.

**Step 5 — Offer surfacing (new-patient-special)**
Condition: only if patient asks about price AND has NOT already expressed cost sensitivity.
State plainly: "Ksh 1,000 — includes full oral diagnosis and X-ray."
No qualifiers.

**Step 6 — Cost-sensitive suppression (forbidden-words)**
Condition: if patient has already expressed affordability concern.
Do NOT restate the Ksh 1,000 fee.
Mention payment plans instead.
Direct to WhatsApp to discuss options privately.

**Step 7 — Booking CTA (IF-operations → get_booking_channel)**
Close with exactly one CTA.
"WhatsApp us on 0740187579 to book — we confirm within 5 minutes."
Or: "Walk in anytime — no appointment needed."
Never both in the same response.

## Hard Constraints

- Never lead with price unprompted
- Never use "cheap" or "free" — [[forbidden-words]]
- One CTA only — WhatsApp number OR walk-in, never both
- If emotional signals detected mid-flow →
  pause conversion, activate [[HE-emotional-escalation]] first
- Never list all services — stay at z=2 unless asked

## Related
- [[tone-guide]]
- [[forbidden-words]]
- [[class-services]]
- [[new-patient-special]]
- [[proof-points]]
- [[IF-operations]]
- [[HE-emotional-escalation]]