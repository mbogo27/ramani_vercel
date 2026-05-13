---
type: stc
label: Operations Contract
system: arrow-dental-operations
transport: sqlite
endpoint_ref: ./data/arrow-dental.db
version: 0.1

auth:
  required: false
  method: none
  scope: local read-only
  source: env

capabilities:
  - id: get_contact_details
    kind: query
    direction: inbound
    method: QUERY
    description: Returns WhatsApp, phone, and email contact details

    params: []

    returns:
      shape: object
      fields: [whatsapp, phone, email]
      sensitive: false
      ephemeral: true

    constraints:
      hard:
        - result_is_read_only
        - result_must_not_be_stored_in_vault
        - max_calls_per_session: 3
      soft:
        - surface_whatsapp_number_first
        - for_emergency_context_show_only_whatsapp

    confirmation_required: false
    rate_limit:
      max_calls_per_session: 3

  - id: get_branch_info
    kind: query
    direction: inbound
    method: QUERY
    description: Returns branch name, address, floor, Google Maps link

    params:
      - name: branch_name
        type: string
        required: false
        source: query
        default: all

    returns:
      shape: list
      fields: [branch_name, address, floor, maps_link]
      sensitive: false
      ephemeral: true

    constraints:
      hard:
        - result_is_read_only
        - result_must_not_be_stored_in_vault
      soft:
        - if_audience_is_thika_surface_thika_branches_first
        - if_audience_is_cbd_surface_pension_towers_first
        - include_maps_link_for_directions_queries

    confirmation_required: false

  - id: get_operating_hours
    kind: query
    direction: inbound
    method: QUERY
    description: Returns opening and closing times per day

    params:
      - name: day
        type: string
        required: false
        source: query
        default: all

    returns:
      shape: object
      fields: [weekday_open, weekday_close, sunday_open, sunday_close]
      sensitive: false
      ephemeral: true

    constraints:
      hard:
        - result_is_read_only
      soft:
        - highlight_sunday_hours_for_thika_audience
        - highlight_evening_hours_for_cbd_professional_audience

    confirmation_required: false

  - id: get_insurance_list
    kind: query
    direction: inbound
    method: QUERY
    description: Returns accepted insurance providers

    params:
      - name: provider_name
        type: string
        required: false
        source: query
        default: null

    returns:
      shape: list
      fields: [provider_name, accepted]
      sensitive: false
      ephemeral: true

    constraints:
      hard:
        - result_is_read_only
        - always_append_whatsapp_confirmation_note
      soft:
        - if_provider_not_in_list_suggest_whatsapp_confirmation
        - never_guarantee_coverage_without_confirmation

    confirmation_required: false

activated_by:
  - HE-emergency-pain-response
  - HE-booking-conversion
  - HE-negative-review-response
  - TJ-patient-inquiry
  - _index

topology_scope:
  description: >
    Reachable from all patient-facing hyperedges and trajectories.
    This is the most permissively scoped STC in the vault —
    operational data (hours, location, contact) is safe to surface
    in any context.
  unreachable_from: []
---

# STC — Operations Contract

## Purpose
Provides read-only access to Arrow Dental's operational data:
contact details, branch information, operating hours, and
insurance acceptance. Backed by a local SQLite database for
demo purposes — production deploys point to live CMS or ERP.

## Why SQLite for Demo
Allows full bootloader testing without external API dependency.
The transport field is the only thing that changes when going
to production — the schema, constraints, and topology are identical.

## Topology Scope
Reachable from all hyperedges. Operational data is context-safe —
no PII, no financial data, no patient records.

## Fallback Behavior
If database unreachable: serve hardcoded reference values from
the STC node itself. Log fallback in trace. Never fabricate.

## Data Handling
No PII. Results are ephemeral. Safe to surface directly to patient.