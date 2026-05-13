---

## 4. Structured Tool Contracts (STC)

### 4.1 The Problem

Standard AI integrations with external systems suffer from two failure modes:

**LLM-side failure:** The model hallucinates capabilities, invents parameters, or calls tools with invalid inputs because it has no formal schema to reason against — only a description.

**System-side failure:** External calls happen without validation, scope enforcement, or audit trail. The LLM can call anything it has access to, with any parameters, at any time.

Both failures share a root cause: **the boundary between probabilistic reasoning and deterministic execution is undefined.**

Ramani solves this with Structured Tool Contracts — a vault-native primitive that sits at that boundary and makes it formal, verifiable, and topology-enforced.

---

### 4.2 The Architecture

```
┌─────────────────────────────────────────┐
│            LLM (probabilistic)          │
│   reasons over constrained search space │
└──────────────────┬──────────────────────┘
                   │  context payload (assembled by bootloader)
                   │  soft constraints (injected as instructions)
┌──────────────────▼──────────────────────┐
│         Vault / SSoT (cold state)       │
│   constrains what is knowable/doable    │
│   topology enforces scope               │
└──────────────────┬──────────────────────┘
                   │  STC nodes (executable contracts)
                   │  hard constraints (enforced by bootloader)
┌──────────────────▼──────────────────────┐
│     External world (deterministic)      │
│   databases, APIs, tools, indexes       │
│   verifiable, auditable, typed          │
└─────────────────────────────────────────┘
```

The vault is the SSoT for what the LLM can reason over.
The STC nodes are the executable boundary of that knowledge.
Nothing crosses from probabilistic to deterministic without a schema,
a constraint set, and a topology check.

This makes Ramani a **unified substrate** — not just for knowledge, but
for the full operational surface of a domain. Every external capability
a system needs is declared in the vault, scoped by topology, and
executable by the bootloader. The vault does not just store knowledge —
it governs action.

---

### 4.3 What STC Replaces

STC supersedes the Interface Node primitive (`interfaces/IF-*.md`).

Interface nodes described *what exists.* STC nodes specify *what can be
done, under what conditions, returning what shape, with what constraints.*

The distinction:
- Interface node = pointer with capability stubs
- STC node = pointer + capability stubs as executable schema

Every previous `IF-*.md` should be migrated to `stc/STC-*.md`.
The `interfaces/` directory is deprecated in Ramani v0.2+.

---

### 4.4 STC Node Specification

**File location:** `vault/stc/STC-{system}-{scope}.md`

**Full schema:**

```yaml
---
type: stc
label: Human-readable contract name
system: system-identifier
transport: rest | graphql | grpc | sdk | function | sqlite | search
endpoint_ref: url | function_name | db_path | index_name
version: semver

auth:
  required: true | false
  method: bearer | api_key | basic | session | none
  scope: what credential is needed
  source: env | session | vault_config

capabilities:
  - id: capability_slug
    kind: query | action | tool | search
    direction: inbound | outbound | bidirectional
    method: GET | POST | PUT | DELETE | QUERY | CALL | SEARCH | EXECUTE
    description: what this capability does in one line

    params:
      - name: param_name
        type: string | int | bool | float | object | list
        required: true | false
        source: session | query | vault | hardcoded | env
        default: optional_default_value
        validation: optional regex or range constraint

    returns:
      shape: object | list | scalar | void
      fields: [field1, field2, field3]
      sensitive: true | false      # PII or confidential data flag
      ephemeral: true              # always true — results never written to vault

    constraints:
      hard:                        # enforced by bootloader — violation = abort
        - rule_as_string
      soft:                        # injected into LLM context as instructions
        - preference_as_string

    confirmation_required: false   # true for write/action capabilities
    rate_limit:
      max_calls_per_session: N
      max_calls_per_minute: N

activated_by:
  - HE-hyperedge-slug
  - TJ-trajectory-slug

topology_scope:
  description: which parts of the graph can reach this STC
  unreachable_from:
    - HE-other-hyperedge   # explicit denial list
---

# STC — {Label}

## Purpose
What this contract exists to do and why.

## Topology Scope
Which agents, in which contexts, can activate this contract.
Describe what is unreachable and why.

## Capabilities Summary
Brief description of each capability and when to use it.

## Fallback Behavior
What the bootloader and LLM should do if this STC is unreachable
or returns an error.

## Data Handling Rules
How results must be treated. PII handling. Retention policy.
```

---

### 4.5 Constraint Types

Constraints are the executable heart of STC. They are not documentation —
they are enforced rules.

#### Hard Constraints

Enforced mechanically by the bootloader before any capability executes.
If a hard constraint is violated, the capability is aborted and the
violation is logged in the trace. The LLM is never involved.

```yaml
constraints:
  hard:
    - result_must_not_be_stored_in_vault
    - result_is_ephemeral_session_scope_only
    - params_must_come_from_session_not_vault
    - max_calls_per_session: 1
    - auth_required: true
    - sensitive_fields_must_not_appear_in_trace
    - confirmation_required_before_write
```

Hard constraint categories:

| Category | Examples |
|----------|---------|
| Data scope | result_ephemeral, no_vault_write, no_cross_session |
| Auth | auth_required, scope_check, token_valid |
| Rate | max_calls_per_session, max_calls_per_minute |
| Topology | only_reachable_from, blocked_from |
| Action safety | confirmation_required, dry_run_first |

#### Soft Constraints

Injected into the LLM context payload as instructions. They shape
how the LLM interprets and presents the result. The LLM can deviate,
but every deviation is recorded in the logic trace.

```yaml
constraints:
  soft:
    - prefer_summarized_result_over_raw
    - surface_only_fields_relevant_to_query
    - highlight_whatsapp_contact_for_mobile_context
    - if_result_empty_suggest_fallback_action
    - present_sensitive_fields_with_care
```

---

### 4.6 Transport Types

STC is transport-agnostic. The bootloader's `execute_stc()` function
dispatches based on the `transport` field.

| Transport | Use case | Example |
|-----------|---------|---------|
| `rest` | External API calls | Google Maps, payment gateway |
| `sqlite` | Local database queries | Demo data, offline-first apps |
| `graphql` | Graph-native API queries | Structured data with relations |
| `grpc` | High-performance internal services | Microservice calls |
| `function` | Python/JS function calls | Custom business logic |
| `sdk` | Third-party SDK wrapping | WhatsApp Business API |
| `search` | Vector or keyword search index | Semantic product search |
| `llm` | Nested LLM sub-call | Agent-within-agent reasoning |

---

### 4.7 Permission by Topology

STC nodes are not globally accessible. They are reachable only through
the graph paths that link to them. An agent cannot call a capability
it cannot reach — not because of a role check, but because the topology
does not connect it.

```
HE-emergency-pain-response
    ├── activates ──> STC-operations [get_contact_details]     ✅ reachable
    └── cannot reach ──> STC-patient-db [get_appointments]     ❌ unreachable

HE-appointment-inquiry
    ├── activates ──> STC-patient-db [get_appointments]        ✅ reachable
    └── cannot reach ──> STC-billing [get_invoice]             ❌ unreachable
```

This is permission-by-topology made operational at the execution layer.
No RBAC system required. No permission table to maintain. The graph
structure is the access control.

When new capabilities are added, their scope is defined by which
hyperedges and trajectories link to them — not by editing a permission
matrix elsewhere. Permissions are a property of the graph, not a
separate system.

---

### 4.8 Capability Kinds

**Query** — read-only data retrieval. Most common.
```yaml
kind: query
direction: inbound
# Returns data. Cannot modify external state.
```

**Action** — write or trigger operation. Requires confirmation gate.
```yaml
kind: action
direction: outbound
confirmation_required: true
# Modifies external state. Bootloader requires explicit confirmation
# node to be traversed before execution.
```

**Tool** — wraps a function or SDK. May be read or write.
```yaml
kind: tool
direction: bidirectional
# Custom business logic. Treated as action if it modifies state.
```

**Search** — queries a search index. Returns ranked results.
```yaml
kind: search
direction: inbound
# Returns ranked list. Result shape includes relevance scores.
```

---

### 4.9 The Confirmation Gate (for write capabilities)

Any STC capability with `kind: action` or `confirmation_required: true`
requires a confirmation node to be traversed before execution.

A confirmation node is a leaf node that encodes:
- What action is about to be taken
- What parameters will be used
- What the agent must communicate to the user before proceeding
- What the abort path is

```yaml
---
type: concept
domain: confirmations
label: Confirm WhatsApp Message Send
related:
  - STC-whatsapp-send-message
confirmation_for: STC-whatsapp [send_message]
---

# Confirmation Gate — Send WhatsApp Message

## Before Executing

The agent must:
1. Show the user the message content
2. Show the recipient number (last 4 digits only if sensitive)
3. Wait for explicit confirmation signal ("yes", "send it", "confirm")
4. On abort signal: cancel, log, do not retry

## Abort Signals
"no", "cancel", "stop", "don't send", "wait"

## On Confirmation
Proceed to STC-whatsapp [send_message]

## On Abort
Log abort in trace. Return to previous context. Do not retry.
```

The bootloader enforces the confirmation gate. The LLM cannot skip it.

---

### 4.10 STC as Unified Tool Substrate

This is the broader architectural implication of STC.

Every external system a domain needs — database, API, communication
channel, search engine, payment processor, calendar — can be declared
as an STC node in the vault. The vault becomes the single declaration
surface for the entire operational capability of the domain.

This has a structural consequence: **a sufficiently complete Ramani vault
is a self-describing system.** It knows:
- What it knows (leaf nodes, abstract classes)
- How it behaves (hyperedges, trajectories)
- What it can do (STC nodes)
- Who can do what in which context (topology)

A new agent, tool, or integration added to this system declares itself
in the vault. It does not require a separate configuration system,
permission matrix, or integration document. The graph is the registry.

Traditional SaaS replaces this with: a separate tool per capability,
a separate permission system per tool, a separate integration layer
per connection, and a separate documentation system for all of it.

Ramani collapses these into a single navigable substrate. The vault
is not just a knowledge store — it is the operating model of the
domain, fully machine-readable and agent-traversable.

**Implication for product development:**
Any capability that can be expressed as an STC node can be built,
governed, and connected from within the vault. The vault becomes
the development surface, not just the knowledge surface. Teams
building on Ramani are not configuring tools — they are extending
a graph.

---

### 4.11 Vault Directory Update

```
vault/
├── _manifest.md
├── _index.md
├── nodes/
├── abstract/
├── hyperedges/
├── trajectories/
├── stc/                    ← replaces interfaces/
│   └── STC-{system}.md
└── heatmaps/
```

`interfaces/` is deprecated. All `IF-*.md` files should be migrated
to `stc/STC-*.md` with full capability schemas and constraint sets.

---

### 4.12 Bootloader Integration

The bootloader gains one new primary function and two helpers:

```
execute_stc(stc_slug, capability_id, params)
  → validate_params(capability, params)
  → enforce_hard_constraints(capability, session)
  → check_topology(stc_slug, active_hyperedge)
  → dispatch(transport, endpoint, params, auth)
  → inject_soft_constraints(capability, result, context_payload)
  → log_stc_execution(stc_slug, capability_id, result_shape, trace)
  → return ephemeral_result
```

The result is injected into the context payload as ephemeral data.
It is never written to the vault, never persisted across sessions,
and never passed to another STC call without explicit hyperedge linking.

---
