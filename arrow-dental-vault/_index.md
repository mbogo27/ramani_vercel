---
type: index
vault: arrow-dental
---

# Vault Index - Arrow Dental Centre

## Entry Points

This table maps incoming query signals to their first node. 
The bootloader reads this before touching anything else. 

| Signal | Entry Node | Z-Level | Notes |
|--------|-----------|---------|-------|
| pain, urgent, emergency, hurts badly, swollen | [[HE-emergency-pain-response]] | z=1 | Overrides all other routing |
| worst, rude, bad experience, complaint, disappointed, never coming back, terrible, waiting too long | [[HE-negative-review-response]] | z=1 | Load tone-guide first |
| scared, nervous, anxious, fear | [[HE-emotional-escalation]] | z=1 | Empathy before information |
| book, appointment, schedule, visit | [[HE-booking-conversion]] | z=1 | Check audience class |
| price, cost, how much, afford | [[HE-booking-conversion]] | z=1 | Check cost-sensitive flag |
| opening hours, what time, closing time, are you open, working hours | [[IF-operations]] | z=3 | Direct interface call |
| services, what do you offer, treatment | [[class-services]] | z=2 | Expand only if specific service asked |
| children, kids, baby, toddler | [[class-audience-families]] | z=2 | Then narrow to [[pediatric-care]] → activate [[HE-booking-conversion]] |
| insurance, SHA, NHIF, cover | [[IF-operations]] | z=3 | Insurance list lives in interface |
| review, thank you, great experience | [[HE-positive-review-response]] | z=1 | No booking CTA |
| implants, braces, whitening, veneers | [[class-services]] | z=2 | Expand to specific service node |
| scared, nervous, anxious, putting off, hate dentists, never been, it's been years, phobia, terrified | [[class-audience-nervous-patients]] | z=2 | Empathy before information |
| does it hurt, will it hurt, is it painful, never had, first time, root canal fear | [[class-audience-nervous-patients]] | z=2 | Load restorative-dentistry if procedure named |
| putting off, keep avoiding, haven't been in years, finally, need to come in | [[class-audience-nervous-patients]] | z=2 | Avoidance is a nervous patient signal |
| lunch, work, working hours, during the day, after work, lunchtime | [[class-audience-cbd-professionals]] | z=2 | CBD time-constraint signals |
| thika, along thika, thika road, sunday | [[class-audience-thika-commuters]] | z=2 | Co-load with IF-operations for location+hours queries |
| thika, branch, nearest branch, closest, near me, location, where are you, find you | [[IF-operations]] | z=3 | Route to branch info directly |
| tight budget, cheapest, cheap, on a budget, low budget, can't afford, affordable option | [[HE-booking-conversion]] | z=1 | Broader cost-sensitivity signals with guardrails |
| embarrassed, ashamed, haven't been in years, been a while, long time, years since, it's been | [[class-audience-nervous-patients]] | z=2 | Shame/avoidance signals |

## Domain Adjacency

Identity → Voice → Hyperedges (always this direction)
Never traverse from Hyperedge → Identity (identity is upstream, not downstrea,)

## Heatmap Hooks

| Context | Heatmap |
|---------|---------|
| New patient onboarding | HM-new-patient (not yet built) |
| Emergency triage  | HM-emergency (not yet built) |