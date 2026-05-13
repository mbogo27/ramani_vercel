---
type: hyperedge
domain: patient_experience
label: Negative Review Response
kind: response-protocol
arity: 5
participants:
  - node: '[[tone-guide]]'
    role: tone-constraint
  - node: '[[forbidden-words]]'
    role: constraint
  - node: '[[brand-values]]'
    role: ruleset
  - node: '[[proof-points]]'
    role: credibility-anchor
  - node: '[[IF-operations]]'
    role: cta-endpoint

ghost_edge:
  type: sequence
  steps:
    - node: '[[brand-values]]'
      label: "Acknowledge — validate the patient's experience"
      condition: null
    - node: '[[tone-guide]]'
      label: "Apologize — without arguing or justifying"
      condition: null
    - node: '[[IF-operations]]'
      label: "Invite private resolution via WhatsApp or email"
      condition: null
    - node: '[[tone-guide]]'
      label: "Close warmly — short, human, genuine"
      condition: null
---

# Hyperedge — Negative Review Response

## Activation Condition

Fires when responding to a negative or critical patient review on Google, social media, or any public channel.

Trigger signals:
`negative review` `1 star` `2 star` `bad experience` `complaint` `public criticism` `disappointed` `never coming back`

## What This Hyperedge Does

Protects brand reputation in public while moving resolution private.
The goal is NOT to win the argument publicly.
The goal is to demonstrate accountability to everyone else reading.

## Ghost Edge Sequence

**Step 1 — Acknowledge (brand-values → Accountability + Respect)**
Validate the experience without confirming specific details.
Never argue. Never justify. Never say "actually."
> "We're sorry to hear this, [Name if available]."

**Step 2 — Apologize (tone-guide)**
State that this isn't the experience Arrow Dental wants for patients.
Short. Direct. No qualifiers.
> "This isn't the experience we want for any of our patients."

**Step 3 — Invite private resolution (IF-operations)**
Give both WhatsApp and email. Invite them to reach out.
Frame it as wanting to make things right — not damage control.
> "Please reach out to us on WhatsApp (0740187579) or email
> arrowdentalke@gmail.com — we'd genuinely love the chance
> to make this right."

**Step 4 — Close warmly (tone-guide)**
Short closing. Human. Genuine. No CTA beyond what was given in Step 3.

## Assembled Response Template

> "We're sorry to hear this, [Name if available]. This isn't the
> experience we want for any of our patients. Please reach out to
> us on WhatsApp (0740187579) or email arrowdentalke@gmail.com —
> we'd genuinely love the chance to make this right."

## Hard Constraints

- NEVER argue with the reviewer publicly
- NEVER justify the staff's actions or clinic's decisions
- NEVER mention costs, pricing, or monetary compensation
- NEVER promise specific outcomes publicly
- NEVER use "cost" even in passing — [[forbidden-words]]
- Stay within 60–80 words (Google review channel limit)
- Prose only — no lists, no headers

## What NOT to Load

Do NOT load [[proof-points]] in the response itself.
Proof points are for trust-building, not public dispute resolution.
The reviewer has already lost trust — numbers won't fix that publicly.

## Related
- [[tone-guide]]
- [[forbidden-words]]
- [[brand-values]]
- [[HE-emotional-escalation]]
- [[IF-operations]]