---
type: hyperedge
domain: clinical_ops
label: Emergency Pain Response
kind: response-protocol
arity: 4
participants:
  - node: '[[tone-guide]]'
    role: tone-constraint
  - node: '[[forbidden-words]]'
    role: constraint
  - node: '[[general-dentistry]]'
    role: subject
  - node: '[[IF-operations]]'
    role: cta-endpoint

ghost_edge:
  type: sequence
  steps:
    - node: '[[tone-guide]]'
      label: "Open with empathy — one sentence, acknowledge the pain"
      condition: null
    - node: '[[IF-operations]]'
      label: "Give ONE action: WhatsApp number only"
      condition: null
    - node: '[[IF-operations]]'
      label: "Confirm walk-in availability"
      condition: null
    - node: '[[tone-guide]]'
      label: "Close with one brief comfort note"
      condition: null
---

# Hyperedge — Emergency Pain Response

## Activation Condition

Fires when patient signals severe, urgent, or acute dental pain.

Trigger signals:
`pain` `severe pain` `emergency` `hurts badly` `can't sleep` `swollen` `abscess` `urgent` `please help` `tooth is killing me`

This hyperedge has HIGHEST priority. It overrides all other routing including context budget checks.

## What This Hyperedge Does

Strips the response down to its minimum effective form.
No service lists. No pricing. No insurance. No clinical detail.
Just: empathy → one action → confirmation → comfort.

Every word that is not one of those four things is removed.

## Ghost Edge Sequence

**Step 1 — Empathy (tone-guide)**
Open with acknowledgement of pain. One sentence. No exceptions.
> "We're really sorry you're in pain right now — let's help you
> get seen as quickly as possible."

**Step 2 — One Action (IF-operations → get_contact_details)**
Give the WhatsApp number. Nothing else.
> "Please WhatsApp us now on 0740187579."

**Step 3 — Walk-in Confirmation (IF-operations → get_branch_info)**
Confirm they don't need an appointment.
> "We welcome walk-ins and will see you as soon as you arrive."

**Step 4 — Comfort Close (tone-guide)**
One brief human note. Not clinical. Not procedural.
> "Our team will take good care of you."

## Assembled Response Template

> "We're really sorry you're in pain right now — let's help you
> get seen as quickly as possible. Please WhatsApp us now on
> 0740187579. We welcome walk-ins and will see you as soon as
> you arrive. Our team will take good care of you."

## Hard Constraints

- Do NOT list services
- Do NOT mention pricing or consultation fee
- Do NOT mention insurance
- Do NOT ask clarifying questions about the pain
- Do NOT exceed 50 words
- forbidden-words: "cost" is banned in this context entirely

## Related
- [[tone-guide]]
- [[forbidden-words]]
- [[HE-emotional-escalation]]
- [[IF-operations]]