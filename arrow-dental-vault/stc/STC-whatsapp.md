---
type: stc
label: WhatsApp Business Contract
system: whatsapp-business-api
transport: rest
endpoint_ref: https://api.whatsapp.com/v1/messages
version: 0.1

auth:
  required: true
  method: bearer
  scope: whatsapp_business_send
  source: env

capabilities:
  - id: send_booking_confirmation
    kind: action
    direction: outbound
    method: POST
    description: Sends a booking confirmation message to patient WhatsApp

    params:
      - name: recipient_phone
        type: string
        required: true
        source: session
        validation: "^\\+254[0-9]{9}$"
      - name: patient_name
        type: string
        required: true
        source: session
      - name: appointment_date
        type: string
        required: true
        source: session
      - name: branch_name
        type: string
        required: true
        source: session

    returns:
      shape: object
      fields: [message_id, status, timestamp]
      sensitive: false
      ephemeral: true

    constraints:
      hard:
        - confirmation_required_before_send
        - recipient_phone_must_be_from_session_not_vault
        - message_content_must_pass_forbidden_words_check
        - result_must_not_be_stored_in_vault
        - max_calls_per_session: 1
      soft:
        - apply_tone_guide_to_message_content
        - include_branch_directions_link
        - include_whatsapp_number_for_questions

    confirmation_required: true
    rate_limit:
      max_calls_per_session: 1

  - id: send_recall_reminder
    kind: action
    direction: outbound
    method: POST
    description: Sends a recall/checkup reminder to a patient

    params:
      - name: recipient_phone
        type: string
        required: true
        source: session
        validation: "^\\+254[0-9]{9}$"
      - name: patient_name
        type: string
        required: true
        source: session
      - name: last_visit_date
        type: string
        required: true
        source: session

    returns:
      shape: object
      fields: [message_id, status, timestamp]
      sensitive: false
      ephemeral: true

    constraints:
      hard:
        - confirmation_required_before_send
        - recipient_phone_must_be_from_session_not_vault
        - message_content_must_pass_forbidden_words_check
        - max_calls_per_session: 1
        - do_not_send_if_patient_opted_out
      soft:
        - open_with_personal_check_in_on_last_visit
        - do_not_mention_consultation_fee_in_recall_message
        - one_cta_only_whatsapp_number

    confirmation_required: true
    rate_limit:
      max_calls_per_session: 1

activated_by:
  - HE-booking-conversion
  - TJ-recall-reminder

topology_scope:
  description: >
    Write capability — scoped to booking and recall contexts only.
    Cannot be reached from review, emergency, or inquiry hyperedges.
    Both capabilities require a confirmation gate.
    Sending a message to a real patient phone number is irreversible.
    The topology and confirmation gate together enforce this.
  unreachable_from:
    - HE-emergency-pain-response
    - HE-emotional-escalation
    - HE-negative-review-response
    - HE-positive-review-response
    - TJ-patient-inquiry
---

# STC — WhatsApp Business Contract

## Purpose
Outbound WhatsApp messaging for booking confirmations and
recall reminders. Both capabilities are write operations —
they modify the real world by sending a message to a patient.

## Why Both Capabilities Require Confirmation Gates
A message sent to the wrong number, at the wrong time, with
the wrong content, cannot be unsent. The confirmation gate
is not bureaucracy — it is the minimum viable safety layer
for an outbound action that reaches a real person.

## Topology Scope
Booking and recall contexts only. An agent in an emergency
pain session cannot trigger a recall reminder. An agent
responding to a negative review cannot send a booking
confirmation. The scope is enforced by the graph.

## Fallback Behavior
If API unreachable: log failure in trace, surface manual
WhatsApp number to operator, do not retry automatically.
Never attempt to send via alternate channel without explicit
operator instruction.

## Data Handling
Recipient phone numbers come from session only — never from
vault. Message content is ephemeral. Send status is logged
in trace but phone numbers are masked (last 4 digits only).