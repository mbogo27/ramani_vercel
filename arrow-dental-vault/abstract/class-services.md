---
type: abstract
label: Services
zoom_level: 2
domain: services
membership_mode: explicit
members:
  - nodes/services/general-dentistry.md
  - nodes/services/cosmetic-dentistry.md
  - nodes/services/restorative-dentistry.md
  - nodes/services/pediatric-care.md
expansion_cost: 4
related:
  - HE-booking-conversion
  - tone-guide
  - STC-operations
---

# Abstract Class — Services

## What This Class Represents

All clinical services offered by Arrow Dental Centre. Use this node when the patient's query is about services generally. 
Expand to member nodes only when the patient names a specific service or procedure.

## When NOT to Expand

- "What services do you offer?" → summarize from this class, don't expand 
- "Do you do dental work?" → answer from this class alone 
- General browsing, no specific signal → stay at z=2

## When to Expand

- Patient names a specific procedure → expand to that member only
- Patient mentions children → expand to [[pediatric-care]]
- Patient mentions pain/urgency → expand to [[general-dentistry]] then activate [[HE-emergency-pain-response]]
- Patient mentions implants/braces → expand to [[restorative-dentistry]] or [[cosmetic-dentistry]]

## Summary (for z=2 responses)

Arrow Dental offers four service categories:
general/preventive dentistry, cosmetic dentistry, restorative dentistry, and pediatric care for children aged 2-16. All services are walk-in friendly across four branches. 

## Members
- [[general-dentistry]] — fillings, extractions, cleaning, root canals
- [[cosmetic-dentistry]] — braces, veneers, whitening 
- [[restorative-dentistry]] — implants, crowns, bridges, dentures, gum treatment 
- [[pediatric-care]] — gentle care for ages 2-16

