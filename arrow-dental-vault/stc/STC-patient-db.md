---
type: stc
label: Patient Database Contract
system: arrow-dental-patient-db
transport: sqlite
endpoint_ref: ./data/arrow-dental.db
version: 0.1

auth:
  required: true
  method: session
  scope: patient_session_token
  source: session

capabilities:
  - id: lookup_patient_by_phone
    kind: query
    direction: inbound
    method: QUERY
    description: Retrieves patient profile by WhatsApp phone number

    params:
      - name: phone_number
        type: string
        required: true
        source: session
        validation: "^07[0-9]{8}$"

    returns:
      shape: object
      fields: [patient_name, last_visit_date, insurance_status]
      sensitive: true
      ephemeral: true

    constraints:
      hard:
        - result_must_not_be_stored_in_vault
        - result_is_ephemeral_session_scope_only
        - sensitive_fields_must_not_appear_in_trace
        - params_must_come_from_session_not_vault
        - max_calls_per_session: 1
        - auth_required: true
      soft:
        - greet_patient_by_first_name_only
        - do_not_volunteer_medical_history_unprompted
        - if_no_record_found_invite_to_book_as_new_patient

    confirmation_required: false
    rate_limit:
      max_calls_per_session: 1

  - id: get_upcoming_appointments
    kind: query
    direction: inbound
    method: QUERY
    description: Returns scheduled appointments for authenticated patient

    params:
      - name: patient_id
        type: string
        required: true
        source: session
      - name: date_range
        type: string
        required: false
        source: query
        default: next_7_days

    returns:
      shape: list
      fields: [appointment_date, appointment_time, branch, procedure_type]
      sensitive: true
      ephemeral: true

    constraints:
      hard:
        - result_must_not_be_stored_in_vault
        - result_is_ephemeral_session_scope_only
        - sensitive_fields_must_not_appear_in_trace
        - auth_required: true
        - max_calls_per_session: 2
      soft:
        - present_nearest_appointment_first
        - include_branch_directions_link_if_available
        - if_no_appointments_suggest_booking_via_whatsapp

    confirmation_required: false

activated_by:
  - HE-appointment-inquiry
  - TJ-patient-inquiry

topology_scope:
  description: >
    Strictly scoped. Only reachable from appointment-related
    hyperedges and trajectories. Emergency, review, and general
    inquiry hyperedges cannot reach patient records.
  unreachable_from:
    - HE-emergency-pain-response
    - HE-emotional-escalation
    - HE-negative-review-response
    - HE-positive-review-response
    - HE-booking-conversion
---

# STC — Patient Database Contract

## Purpose
Scoped read access to patient records for authenticated sessions.
Allows personalised responses when a patient is identified via
their WhatsApp number.

## Topology Scope
Tightly restricted. Only appointment-inquiry contexts can
reach patient data. All other hyperedges are explicitly blocked.
This is permission-by-topology enforced at the STC layer.

## PII Handling
All returned data is sensitive. Fields must never appear in
logic trace. Session-scoped only — destroyed at session end.
Never stored in vault under any circumstance.

## Fallback Behavior
If patient not found: invite to book as new patient.
If auth fails: request phone number, retry once, then fallback
to general information mode.
