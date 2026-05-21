---
vault: arrow-dental
version: 0.1
domain: dental_clinic
authority: Arrow Dental Centre Brand Brain V1.3
last_updated: 2026-05-21
---

# Ramani Manifest - Arrow Dental Centre

This vault is the cold-state knowledge graph for Arrow Dental Centre.
It encodes brand logic, clinical rules, voice constraints, and behavioral protocols for AI agents operating across patient-facing channels.

## Graph Manifesto

- This vault does NOT store patient records, appointments, or transactional data
- Transactional data lives in external systems, accessed via Interface Nodes only
- Agent responses must always align with brand voice defined in [[tone-guide]]
- Emotional escalation rules override ALL other formatting rules

## Domain Map

| Domain | Path | Description |
|--------|------|-------------|
| identity | nodes/identity | Brand core, mission, values |
| voice | nodes/voice | Tone, style, forbidden language |
| services | nodes/services | Clinical service definition |
| offers | nodes/offers | Active marketing offers |
| trust | nodes/trust | Proof points, testimonials |

## Traversal Budget

default_budget: 20 nodes
emergency_override: true # HE-emergency-pain-response bypasses budget check

## Agent Rules

1. Always load [[tone-guide]] before generating any patient-facing output
2. If emotional signals are detected, activate [[HE-emotional-escalation]] before anything else
3. Never load z=3 service nodes before checking audience class at z=2
4. Interface Nodes (IF-*) are pointers only - never cache their data in vault
5. Logic trace required for every session
6. Always re-read _manifest.md at session start - never rely on cached context
