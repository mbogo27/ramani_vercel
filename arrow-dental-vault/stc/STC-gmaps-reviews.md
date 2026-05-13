---
type: stc
label: Google Maps Reviews Contract
system: google-maps-places-api
transport: rest
endpoint_ref: https://maps.googleapis.com/maps/api/place
version: 0.1

auth:
  required: true
  method: api_key
  scope: places_api_read_reviews
  source: env

capabilities:
  - id: get_recent_reviews
    kind: query
    direction: inbound
    method: GET
    description: Fetches recent Google Maps reviews for Arrow Dental branches

    params:
      - name: place_id
        type: string
        required: true
        source: vault
        default: ChIJ_arrow_dental_cbd    # vault-stored place ID
      - name: max_results
        type: int
        required: false
        source: hardcoded
        default: 5
      - name: min_rating
        type: int
        required: false
        source: query
        default: null

    returns:
      shape: list
      fields: [reviewer_name, rating, review_text, review_date, reply_status]
      sensitive: false
      ephemeral: true

    constraints:
      hard:
        - result_must_not_be_stored_in_vault
        - max_calls_per_session: 3
        - rate_limit_per_minute: 10
      soft:
        - sort_by_most_recent_first
        - flag_unanswered_negative_reviews_for_priority
        - do_not_surface_reviewer_personal_details_beyond_display_name

    confirmation_required: false

  - id: draft_review_reply
    kind: tool
    direction: outbound
    method: POST
    description: >
      Drafts a reply to a specific Google Maps review.
      Does NOT post — returns draft for human approval.

    params:
      - name: review_id
        type: string
        required: true
        source: session
      - name: reply_text
        type: string
        required: true
        source: session       # LLM-generated, passed by bootloader

    returns:
      shape: object
      fields: [review_id, draft_reply, character_count, status]
      sensitive: false
      ephemeral: true

    constraints:
      hard:
        - does_not_post_automatically
        - human_approval_required_before_publish
        - reply_must_be_under_4096_characters
        - result_must_not_be_stored_in_vault
      soft:
        - apply_tone_guide_to_draft
        - apply_forbidden_words_check_before_returning
        - flag_if_reply_addresses_specific_clinical_claims
        - negative_review_replies_must_follow_HE-negative-review-response

    confirmation_required: true
    rate_limit:
      max_calls_per_session: 5

activated_by:
  - HE-negative-review-response
  - HE-positive-review-response

topology_scope:
  description: >
    Reachable only from review-response hyperedges.
    Patient inquiry, emergency, and booking hyperedges
    cannot reach review data or draft replies.
    The draft_review_reply capability requires a confirmation
    gate before the draft is returned to the operator.
  unreachable_from:
    - HE-emergency-pain-response
    - HE-emotional-escalation
    - HE-booking-conversion
    - TJ-patient-inquiry
---

# STC — Google Maps Reviews Contract

## Purpose
Two capabilities: fetch recent reviews for monitoring and triage,
and draft replies for human-approved posting.

The draft capability is intentionally non-autonomous — it produces
a draft, not a published reply. A human operator approves before
anything reaches Google Maps. This is a deliberate design choice:
public reputation management should never be fully automated.

## Topology Scope
Review-response hyperedges only. The booking and emergency
hyperedges have no business reading or replying to reviews.

## Why Draft-Only for Replies
Posting to Google Maps is irreversible in the short term.
The vault governs what can be said — the human governs whether
it gets said publicly. The confirmation gate enforces this split.

## Fallback Behavior
If API unreachable: log failure, notify operator via trace,
do not attempt to fabricate review content. Return empty list
with fallback message.