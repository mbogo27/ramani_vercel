---
type: trajectory
label: Patient Inquiry Journey
domain: patient_experience
traversal_mode: sequential
entry_node: '[[_index]]'
exit_node: '[[IF-operations]]'
estimated_nodes: 6
---

# Trajectory — Patient Inquiry Journey

## What This Trajectory Is

A named traversal path for the most common patient interaction: a new or returning patient who arrives with a question and needs to leave with enough confidence to book.

This is not a hyperedge — it does not encode behavioral logic.
It is a map of the most likely path through the vault for a general inquiry, so the bootloader doesn't have to discover it fresh every session.

Think of it as a saved route.

## The Path

[_index]
↓ signal detected → audience class identified
[class-audience-*]
↓ tone calibrated → service interest identified
[class-services]
↓ if specific procedure named → expand one member
[nodes/services/{specific-service}]
↓ if hesitation or doubt detected → load credibility
[proof-points]
↓ if pricing asked → surface offer
[new-patient-special]
↓ close with booking CTA
[IF-operations]

## Step-by-Step

**Step 1 — Entry (_index)**
Read incoming signals.
Identify: emotional state, audience class, service interest.
If emotional signals present → exit trajectory,
activate [[HE-emotional-escalation]] immediately.

**Step 2 — Audience Class (class-audience-*)**
Load the matching audience class at z=2.
Calibrate tone. Identify primary booking trigger.
Identify friction remover for this segment.
Do NOT expand to leaf nodes yet.

**Step 3 — Service Class (class-services)**
Identify service category of interest at z=2.
If patient named a specific procedure → expand that node only.
If patient is browsing generally → stay at z=2, summarize.

**Step 4 — Proof Points (proof-points) — conditional**
Condition: load only if patient signals hesitation, doubt, or comparison shopping.
Pick the one most relevant proof point.
Do not list all metrics.

**Step 5 — Offer (new-patient-special) — conditional**
Condition: load only if patient asks about pricing directly
AND has not already expressed cost sensitivity.
State plainly: Ksh 1,000, no qualifiers.

**Step 6 — CTA (IF-operations)**
Close with one booking action.
WhatsApp number or walk-in — never both.

## Exit Conditions

| Condition | Exit |
|-----------|------|
| Patient books or signals intent to visit | Trajectory complete |
| Emotional signals detected at any step | Hand off to HE-emotional-escalation |
| Urgent pain signal detected at any step | Hand off to HE-emergency-pain-response |
| Negative review context detected | Hand off to HE-negative-review-response |
| Patient asks about children | Expand to pediatric-care, load class-audience-families |

## What This Trajectory Does NOT Cover

- Emergency pain → [[HE-emergency-pain-response]]
- Complaint or anger → [[HE-emotional-escalation]]
- Review responses → [[HE-negative-review-response]] or [[HE-positive-review-response]]
- Insurance confirmation → direct call to [[IF-operations]]

Those are handled by their hyperedges directly.
This trajectory is for the clean, calm, curiosity-driven inquiry.

## Node Budget Usage

| Step | Node | Budget Cost |
|------|------|-------------|
| 1 | _index | 1 |
| 2 | class-audience-* | 1 |
| 3 | class-services | 1 |
| 3b | specific service node (conditional) | 1 |
| 4 | proof-points (conditional) | 1 |
| 5 | new-patient-special (conditional) | 1 |
| 6 | IF-operations | 1 |
| — | tone-guide (always loaded) | 1 |
| **Total** | | **6–8 / 20 budget** |

Well within the 20-node budget. Leaves room for follow-up
questions in the same session.

## Related
- [[_index]]
- [[class-services]]
- [[proof-points]]
- [[new-patient-special]]
- [[IF-operations]]
- [[HE-booking-conversion]]
- [[HE-emotional-escalation]]

