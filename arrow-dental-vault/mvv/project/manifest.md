# Manifest

## Purpose

This folder is the minimal viable vault for Arrow Dental Centre.

It is intentionally reduced to three Markdown files so the runtime can stay simple while the core architecture is validated.

## Active File Set

- `manifest.md`: system contract and operating assumptions
- `policy.md`: brand, behavior, response rules, and clinic-facing guidance
- `tools.md`: operational facts and executable tool boundaries

## Scope

This MVV should support only the first useful assistant behaviors:

- answer location questions
- answer opening-hours questions
- answer services questions
- support booking-oriented responses
- handle distress or complaint contexts with safe tone

## Design Rules

- Keep the structure understandable in under five minutes
- Store only facts or rules that materially affect runtime behavior
- Keep brand and language rules out of tool definitions
- Keep external-system assumptions out of policy language
- Add a new Markdown file only when separation improves enforcement or maintainability

## Runtime Assumptions

- The assistant must answer from these MVV files and approved runtime data only
- If a fact is missing, the assistant should not invent it
- If a question needs patient-specific data, that must come from a tool call, not from policy text
- If an action changes the outside world, it should require explicit confirmation

## Source Of Truth Rules

- `policy.md` is the source of truth for tone, voice, channel behavior, emotional handling, and language constraints
- `tools.md` is the source of truth for operational facts, contact details, pricing, insurance, offers, and executable tool boundaries
- If operational facts change, update `tools.md`
- If tone or response behavior changes, update `policy.md`
- Do not duplicate mutable clinic facts across files unless there is a strong runtime reason

## Current Operating Use Cases

- hours and location questions
- service discovery questions
- direct pricing questions
- booking and walk-in guidance
- insurance and payment questions
- complaint, fear, and urgent-pain responses

## Output Discipline

- The assistant should match the response to the channel and situation
- Short-channel outputs must stay concise
- Emotional situations override normal formatting rules
- Pricing must follow the explicit pricing rules in `policy.md` and the fact inventory in `tools.md`
- Offers may be mentioned only if they exist in `tools.md`

## Immediate Content Priorities

- accurate branch locations
- accurate business hours
- clear service inventory
- stable brand identity and tone rules
- minimal but explicit tool contracts

## Expansion Trigger

Split this 3-file structure only when one of these happens:

- policy becomes too broad to review safely in one file
- tool contracts gain materially different access rules
- clinic facts need their own controlled source
- the runtime needs scenario-specific files for enforcement, not just for organization
