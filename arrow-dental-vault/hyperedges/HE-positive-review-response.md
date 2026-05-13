---
type: hyperedge
domain: patient_experience
label: Positive Review Response
kind: response-protocol
arity: 4
participants:
  - node: '[[tone-guide]]'
    role: tone-constraint
  - node: '[[brand-values]]'
    role: ruleset
  - node: '[[proof-points]]'
    role: brand-reinforcement
  - node: '[[IF-operations]]'
    role: soft-reference

ghost_edge:
  type: sequence
  steps:
    - node: '[[tone-guide]]'
      label: "Thank warmly — genuine, not formulaic"
      condition: null
    - node: '[[brand-values]]'
      label: "Reinforce one brand value relevant to their review"
      condition: null
    - node: '[[proof-points]]'
      label: "Close with educational tip or forward-looking note"
      condition: null
---

# Hyperedge — Positive Review Response

## Activation Condition

Fires when responding to a positive or glowing review on Google, Instagram, Facebook, or any public channel.

Trigger signals:
`5 star` `great experience` `thank you` `loved it` `amazing staff` `will come back` `highly recommend` `best dentist`

## What This Hyperedge Does

Reinforces the relationship without pushing conversion.
This patient has already converted — they don't need a booking CTA.
The goal is warmth, brand reinforcement, and gentle forward momentum.

## Ghost Edge Sequence

**Step 1 — Thank warmly (tone-guide)**
Genuine thanks. Specific to what they mentioned if possible.
Not formulaic. Not corporate.
> "Thank you so much for sharing this, [Name] — it genuinely
> means a lot to the whole team."

**Step 2 — Reinforce one brand value (brand-values)**
Pick the value most relevant to what they praised.
One sentence. Don't list all four values.

| They praised | Reinforce |
|-------------|-----------|
| Staff kindness | Trust / Respect |
| Pain-free experience | Innovation |
| Aftercare follow-up | Accountability |
| Overall quality | All four — pick Trust |

**Step 3 — Educational tip or forward note (proof-points)**
Close with something useful — a subtle oral health tip, or a
warm "see you at your next visit" framing.
No booking CTA. No WhatsApp number. No promotional language.

> "We look forward to seeing you at your next visit — remember,
> regular cleanings every 6 months keep that smile at its best."

## Hard Constraints

- NO booking CTA — they have already converted
- NO WhatsApp number in the response
- NO promotional language or offers
- Stay within 60–80 words (Google review channel limit)
- Prose only — no lists, no headers
- One educational tip maximum — don't lecture

## Related
- [[tone-guide]]
- [[brand-values]]
- [[proof-points]]