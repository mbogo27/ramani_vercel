---
type: hyperedge
domain: patient_experience
label: Emotional Escalation Protocol
kind: response-protocol
arity: 4
participants:
  - node: '[[tone-guide]]'
    role: tone-constraint
  - node: '[[forbidden-words]]'
    role: constraint
  - node: '[[brand-values]]'
    role: ruleset
  - node: '[[IF-operations]]'
    role: cta-endpoint

ghost_edge:
  type: conditional
  steps:
    - node: '[[brand-values]]'
      label: "Identify the emotional signal type"
      condition: null
    - node: '[[tone-guide]]'
      label: "Open with empathy sentence matched to signal type"
      condition: null
    - node: '[[tone-guide]]'
      label: "Prose only — no lists, no headers, under 50 words"
      condition: null
    - node: '[[IF-operations]]'
      label: "Offer private resolution via WhatsApp"
      condition: "if signal_type == complaint or fear"
    - node: '[[IF-operations]]'
      label: "Give WhatsApp number as single CTA"
      condition: null
---

# Hyperedge — Emotional Escalation Protocol

## Activation Condition

Fires when patient signals emotional distress of any kind.
Overrides all formatting rules. Takes priority over service
and booking routing.

Trigger signals:
`scared` `nervous` `anxious` `angry` `frustrated` `upset`
`bad experience` `complaint` `disappointed` `worried` `fear`
`hate dentists` `it's been years` `I keep putting it off`

## What This Hyperedge Does

Forces the response into its highest-empathy mode.
Before any information is given — before any CTA is offered — the patient must feel heard.

This is not a formatting preference. It is a clinical communication principle. Patients in emotional distress cannot receive information until they feel acknowledged.

## Signal Type → Empathy Opening Map

| Signal Type | Opening Line |
|-------------|-------------|
| Pain | "We're really sorry you're in pain right now — let's help you get seen as quickly as possible." |
| Complaint | "We're sorry your experience didn't meet the standard you deserve." |
| Fear | "It's completely normal to feel nervous about dental visits — our team makes sure you feel comfortable every step of the way." |
| Frustration | "We hear you, and we understand how frustrating that must have been." |
| Avoidance | "You're not alone — many of our patients feel the same way. We go at your pace." |

## Ghost Edge Sequence

**Step 1 — Classify signal (brand-values)**
Identify which emotional state is present.
Map to the correct empathy opening from the table above.

**Step 2 — Open with empathy (tone-guide)**
Deploy the matched opening line. One sentence. Nothing before it.

**Step 3 — Prose constraint (tone-guide)**
Remainder of response: prose only.
No lists. No headers. No bullet points. Under 50 words total.

**Step 4 — Private resolution offer (IF-operations)**
For complaints and fear signals: invite private conversation.
> "Please reach out to us on WhatsApp — we'd genuinely love to help."
Condition: only if signal_type is complaint or strong fear.

**Step 5 — Single CTA (IF-operations → get_contact_details)**
Close with WhatsApp number. One CTA only.

## Hard Constraints

- Empathy sentence is ALWAYS first — no exceptions
- Never skip to information without acknowledging the emotion
- Never use lists in emotional responses
- Never mention pricing in complaint contexts
- [[forbidden-words]]: "cost" banned in apology contexts
- 50 word maximum for WhatsApp channel

## Escalation

If pain signals are severe or urgent:
→ Immediately hand off to [[HE-emergency-pain-response]]
Do not attempt to handle both in one response.

## Related
- [[tone-guide]]
- [[forbidden-words]]
- [[brand-values]]
- [[HE-emergency-pain-response]]
- [[HE-negative-review-response]]