# Project Report

## What This Project Is

This repository is a prototype "knowledge vault" and bootloader for Arrow Dental Centre.

It combines:

- A Markdown-based domain graph that stores brand, service, audience, and response logic
- Structured Tool Contracts (`stc/`) that define how the agent can access external systems
- A Python bootloader that reads the vault, routes a patient query, assembles context, and calls an LLM
- A local SQLite demo database used as the deterministic backend for operations, patient, and review data

The intent is not just content storage. The vault is acting as an operating model for a patient-facing AI assistant.

## Core Idea

The project is built around a Ramani-style graph:

- `_manifest.md` defines the vault contract, global rules, traversal budget, and safety constraints
- `_index.md` maps incoming language signals to entry nodes
- `hyperedges/` define behavior for scenarios like emergency pain, booking, emotional escalation, and review response
- `abstract/` defines z=2 classes such as service categories and audience segments
- `nodes/` contains leaf knowledge like tone, services, offers, proof points, and brand identity
- `stc/` defines executable tool contracts for operational data, patient data, WhatsApp, and Google Maps reviews
- `trajectories/` defines reusable traversal paths for general inquiry flows

In practice, the vault decides:

- What the assistant is allowed to know
- What it should load for a given query
- What it should not say
- Which external capabilities are reachable in a given context

## How The Runtime Works

`bootloader.py` is the main runtime.

High-level flow:

1. Load `_manifest.md`
2. Load `_index.md`
3. Reset session state for the new query
4. Detect routing signals from the patient message
5. Route to one or more entry nodes
6. Traverse the graph and load relevant nodes into a bounded context payload
7. Optionally execute an STC capability and inject the result into the context
8. Send the assembled context to OpenRouter
9. Print the logic trace and final response

Important implementation details:

- Session state tracks loaded nodes, budget use, trace logs, and context payload
- Default traversal budget is 20 nodes, taken from `_manifest.md`
- Emergency signals can override the budget
- The runtime always tries to load tone and language constraints before patient-facing generation
- The LLM call is configured through `.env` using `OPENROUTER_API_KEY`
- The current model in code is `mistralai/ministral-14b-2512`

## What Is Actually Implemented Today

Implemented and working locally:

- Manifest loading and routing index parsing
- Query signal detection and route selection
- Traversal logic for hyperedges, abstract classes, trajectories, leaf nodes, and STC nodes
- Local SQLite-backed STC execution for:
  - contact details
  - branch info
  - operating hours
  - insurance list
  - patient lookup
  - upcoming appointments
  - demo Google Maps reviews
- Demo WhatsApp execution path that returns a prefilled WhatsApp redirect URL instead of sending a real message
- Smoke test scripts for both the bootloader and STC paths

Defined in the vault but only partially enforced in code:

- Hard constraint enforcement from STC contracts
- Topology reachability checks before STC execution
- Confirmation gates for write actions
- Soft constraint injection from STC metadata
- Full migration from legacy `IF-*` references to STC-only traversal

## Current Folder Map

- `bootloader.py`: main runtime and traversal engine
- `_manifest.md`: vault-level rules and contract
- `_index.md`: signal-to-entry routing table
- `abstract/`: service and audience class nodes
- `hyperedges/`: response protocols and conversion/review logic
- `nodes/identity/`: brand positioning and values
- `nodes/voice/`: tone guide and forbidden language
- `nodes/services/`: specific clinical service categories
- `nodes/offers/`: active commercial offers
- `nodes/trust/`: proof points and credibility assets
- `stc/`: executable contract definitions
- `trajectories/`: reusable inquiry journey paths
- `data/arrow-dental.db`: local demo database
- `scripts/setup_demo_db.py`: recreates and seeds the demo database
- `scripts/test_bootloader_queries.py`: sample query runner
- `test_stc.py`: STC smoke test script

## Data And Tooling Model

The STC section is the most important architectural extension in this repo.

The repository treats external tools as structured contracts rather than ad hoc function calls. Each STC defines:

- transport
- auth assumptions
- capabilities
- parameter schema
- return shape
- hard constraints
- soft constraints
- activation scope
- topology restrictions

Current STCs:

- `STC-operations.md`: clinic contact, branches, hours, insurance
- `STC-patient-db.md`: patient lookup and appointment retrieval
- `STC-whatsapp.md`: outbound message actions
- `STC-gmaps-reviews.md`: review retrieval and reply drafting

This means the intended architecture is:

- Markdown graph for knowledge and behavior
- STC contracts for deterministic execution
- Bootloader as the policy and routing layer
- LLM only reasoning over bounded context, not the whole world

## Demo Data

The local SQLite database contains sample data for:

- patients
- appointments
- contact details
- branches
- operating hours
- insurance providers
- Google Maps-style reviews

This makes the repo testable without a live backend.

## Dependencies

From `requirements.txt`:

- `python-frontmatter`
- `requests`
- `python-dotenv`

There is no heavier framework here. It is a small Python prototype with Markdown content and SQLite.

## How To Run

Basic local usage:

1. Install dependencies from `requirements.txt`
2. Add `OPENROUTER_API_KEY` to `.env`
3. Rebuild demo data if needed with `python scripts/setup_demo_db.py`
4. Run the bootloader with `python bootloader.py`
5. Run STC smoke tests with `python test_stc.py`

## Notable Implementation Notes

- The content and architecture are ahead of the enforcement layer. The vault describes stronger safety and topology guarantees than the Python runtime currently enforces.
- There is a compatibility bridge from legacy `IF-operations` references to `STC-operations` inside `bootloader.py`, which shows the STC migration is in progress rather than fully complete.
- WhatsApp and Google Maps are represented as contracts first; only local/demo execution is implemented right now.
- Some markdown files contain encoding artifacts, which suggests the files were edited or viewed with inconsistent character encoding.

## Practical Reading Of The Project

This project is best understood as an early vertical slice of an agent system for a dental clinic:

- The vault defines the assistant's knowledge and behavior
- The bootloader turns vault structure into runtime context
- STCs define how the assistant touches real systems
- SQLite stands in for production operational systems
- OpenRouter provides the generation layer

It is already useful as a design prototype and test harness.
It is not yet a fully enforced production-safe agent runtime.

## Recommended Next Technical Steps

If this project continues, the highest-value next steps are:

1. Enforce STC hard constraints mechanically in `bootloader.py`
2. Add topology validation before every STC execution
3. Implement confirmation-gate handling for write actions like WhatsApp sends
4. Finish migrating legacy `IF-*` references to STC-only references
5. Add a real CLI entrypoint that accepts one query instead of relying on embedded test queries
6. Normalize file encoding across the vault
