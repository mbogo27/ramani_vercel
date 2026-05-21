# Tools

## Purpose

This file defines the minimal executable tool surface for the MVV version of Arrow Dental.

It also serves as the structured operational reference for facts that may later move to a live backend.

## Tooling Principle

- Static clinic facts can live here during MVV
- Patient-specific facts must come from runtime tools
- Write actions must be explicit and confirmable
- Sensitive data must stay session-scoped

## Minimal Tool Set

### Operations

Purpose:
Read-only clinic operations data used in common patient questions.

Use for:

- branch locations
- business hours
- services list
- contact details
- booking guidance
- insurance checks
- payment methods
- installment availability
- published offers

Returns:

- branch names and addresses
- hours by day
- service inventory
- phone and WhatsApp contact
- pricing facts
- insurance facts
- offer facts

Current MVV source:

- the static facts defined in this file

Structured facts:

#### Branches

- Nairobi CBD - Main: Pension Towers, Loita Street, 2nd Floor
- Nairobi CBD - Specialist: Pension Towers, Loita Street, 5th Floor
- Thika Road: CPA Centre, 2nd Floor, Thika Road
- Thika Town: Thika Gateway Plaza, Gakere Road, 2nd Floor

#### Business Hours

- Monday: 7:00 am - 9:00 pm
- Tuesday: 7:00 am - 9:00 pm
- Wednesday: 7:00 am - 9:00 pm
- Thursday: 7:00 am - 9:00 pm
- Friday: 7:00 am - 9:00 pm
- Saturday: 7:00 am - 9:00 pm
- Sunday: 8:30 am - 6:00 pm

#### Services

- Dental Cleaning
- Tooth Extraction
- Gum Disease Treatment
- Pediatric Dental Care
- Braces
- Dental Crowns
- Dental Implants
- Teeth Whitening
- Dental Filling
- Dentures
- Teeth Replacement
- Root Canal Treatment
- Wisdom Teeth Removal

#### Contact

- Phone: 0740187579
- Alternate Phone: 0740 579 064
- WhatsApp: 0740187579
- Alternate WhatsApp: 0740 579 064
- Email: arrowdentalke@gmail.com
- Booking flow: WhatsApp message -> staff confirms slot within 5 minutes

#### Service Groups

- General Dentistry: fillings, extractions, root canals, full mouth cleaning
- Cosmetic Dentistry: braces, veneers, teeth whitening
- Restorative Dentistry: implants, crowns, bridges, dentures, gum disease treatment, wisdom teeth removal
- Pediatric Care: gentle, educational, fear-free care for ages 2 to 16

#### Pricing

- Consultation: Ksh 1,000
- Extraction / Tooth Removal: From Ksh 3,000
- Fillings and Bonding: From Ksh 5,000
- Cleaning and Scaling: From Ksh 6,000
- Root Canal: From Ksh 12,000
- Crowns: From Ksh 26,000
- Bridges: From Ksh 25,000 per unit
- Braces and Alignment: From Ksh 90,000 per jaw; From Ksh 160,000 both jaws
- Teeth Whitening: From Ksh 28,000
- Veneers: From Ksh 24,000 per tooth
- Masking / Cosmetic Bonding: From Ksh 5,000
- Dentures and Replacement: From Ksh 13,000
- Dental Implants: From Ksh 140,000

Pricing notes:

- Consultation is Ksh 1,000 at all branches
- All other listed service prices are starting points
- Final pricing is confirmed after clinical assessment

#### Payment Methods

- Cash
- Card
- M-Pesa

#### Insurance

- SHA/NHIF for Civil Servants
- AAR
- APA
- CIC Group
- Liaison Group
- SAHAM Assurance
- Equity
- Eagle Africa
- Unisure Mua
- First Assurance
- Takaful
- UAP
- Minet
- Kenyan Alliance
- MTN
- Madiso
- Laser Insurance Brokers
- Carepay m-tiba
- NIS Retirees
- Fidelity
- Britam
- Heritage
- Clarkson
- Trident
- Kenya Pipeline Company

Insurance note:

- confirm the patient's specific plan before visit when needed

#### Installments

- Installments are available for braces
- Installments are available for implants

#### Offers

- New Patient Special: Ksh 1,000 consultation plus X-ray included

Offer rules:

- mention offers only if relevant
- do not create or imply unlisted offers

Constraints:

- read-only
- do not invent missing branches, services, or hours
- do not invent pricing, insurance partners, offers, or payment methods
- if the question asks for unavailable operational facts, say they are not in the current MVV

### Patient Data

Purpose:
Patient-specific lookup such as appointments or patient history indicators.

Use for:

- patient lookup
- appointment lookup

Rules:

- never source this from Markdown policy text
- session-scoped only
- requires authenticated or trusted session context

### Messaging

Purpose:
Outbound communication such as confirmations and reminders.

Use for:

- booking confirmations
- reminders

Rules:

- treat as write actions
- require explicit confirmation before send
- do not send to a number that did not come from session context

### Reviews

Purpose:
Support review monitoring and reply drafting.

Use for:

- recent review retrieval
- draft reply generation

Rules:

- drafts are acceptable
- public posting should require human approval

## Decision Boundaries

- If a user asks where the clinic is, use Operations
- If a user asks opening hours, use Operations
- If a user asks what services are offered, use Operations
- If a user asks about their own appointment, use Patient Data
- If the assistant is about to contact a patient, use Messaging with confirmation
- If the assistant is responding to a public review, use Reviews with human approval

## Expansion Rule

Split this file only when:

- operations facts move to a live data source
- patient data becomes real and needs stricter schemas
- messaging gains multiple action flows
- review handling becomes operationally complex
