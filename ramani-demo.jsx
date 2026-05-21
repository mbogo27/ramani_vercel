import { useEffect, useRef, useState } from "react"

const shellTokens = {
  bg: "#FBF4EA",
  bgPanel: "#FFFFFF",
  bgCard: "#F8EFE4",
  border: "#E5D8C7",
  text: "#1E1E1E",
  muted: "#6F6255",
  accent: "#B8662D",
  accentSoft: "rgba(244,124,44,0.12)",
  orange: "#f47c2c",
  green: "#2e9e57",
  red: "#d64545",
  yellow: "#e7a52b",
  mono: "'JetBrains Mono', monospace",
  sans: "'Poppins', sans-serif",
}

const siteTokens = {
  primary: "#F47C2C",
  primaryDark: "#E46E1F",
  beige: "#F6EAD7",
  beigeSoft: "#FBF4EA",
  beigeDeep: "#EEDFC5",
  brown: "#6B3D16",
  brownDark: "#4F2A0F",
  text: "#1E1E1E",
  textSoft: "#4B4B4B",
  border: "#E5D8C7",
  white: "#FFFFFF",
  graySoft: "#FAFAFA",
  success: "#2E9E57",
  error: "#D64545",
  shadow: "0 12px 28px rgba(107,61,22,0.08)",
}

const TABS = [
  { id: "graph", label: "Graph" },
  { id: "website", label: "Website" },
  { id: "content", label: "Content Gen" },
  { id: "agent", label: "Agent" },
  { id: "admin", label: "Admin" },
]

const SURFACE_LABELS = {
  graph: "hypergraph substrate",
  website: "project_nav() -> light website projection",
  content: "project_content() -> vault-grounded generation",
  agent: "project_agent() -> partial projections",
  admin: "staff_mode() -> vault edits + appointments",
}

const GRAPH_NODES = [
  { id: "brand", label: "Brand", temp: "hot", x: 340, y: 190, desc: "Warm, trustworthy, family-oriented care." },
  { id: "trust", label: "Trust", temp: "hot", x: 510, y: 110, desc: "15 years, 30+ professionals, 150,000+ patients." },
  { id: "services", label: "Services", temp: "hot", x: 165, y: 110, desc: "General, cosmetic, restorative, and pediatric care." },
  { id: "pricing", label: "Pricing", temp: "warm", x: 108, y: 280, desc: "Transparent rates and consultation offer." },
  { id: "booking", label: "Booking", temp: "warm", x: 350, y: 340, desc: "Website form and agent both capture appointment requests." },
  { id: "team", label: "Team", temp: "warm", x: 560, y: 278, desc: "Main clinic, specialist clinic, and branch network." },
  { id: "reviews", label: "Reviews", temp: "cold", x: 190, y: 405, desc: "Standalone proof and social feedback surface." },
  { id: "locations", label: "Locations", temp: "cold", x: 505, y: 405, desc: "Nairobi CBD, Thika Road, and Thika Town." },
]

const GRAPH_EDGES = [
  { id: "patient_journey", label: "patient_journey", nodes: ["services", "trust", "pricing", "booking"], color: "#8ab4ff" },
  { id: "brand_surface", label: "brand_surface", nodes: ["brand", "trust", "team"], color: "#f47c2c" },
  { id: "proof_loop", label: "proof_loop", nodes: ["reviews", "trust", "booking"], color: "#2e9e57" },
]

const WEBSITE_PAGES = [
  { id: "home", label: "Home", source: "brand, trust" },
  { id: "about", label: "About Us", source: "brand, team" },
  { id: "services", label: "Services", source: "services" },
  { id: "pricing", label: "Pricing", source: "pricing" },
  { id: "reviews", label: "Reviews", source: "trust, reviews" },
  { id: "book", label: "Book Appointment", source: "booking, locations, intake_flow" },
]

const BRANCHES = [
  {
    name: "Nairobi CBD - Main",
    address: "Pension Towers, Loita Street",
    floor: "2nd Floor",
    map: "https://maps.app.goo.gl/C5hyHLpoAgPDkzzr9",
    note: "General and cosmetic care, walk-ins welcome.",
  },
  {
    name: "Nairobi CBD - Specialist",
    address: "Pension Towers, Loita Street",
    floor: "5th Floor",
    map: "https://maps.app.goo.gl/C5hyHLpoAgPDkzzr9",
    note: "Escalation path for specialist procedures.",
  },
  {
    name: "Thika Road",
    address: "CPA Centre, Thika Road",
    floor: "2nd Floor",
    map: "https://maps.app.goo.gl/LaBGCsY3ZyFxZMb2A",
    note: "Convenient for corridor commuters and evening visits.",
  },
  {
    name: "Thika Town",
    address: "Thika Gateway Plaza, Gakere Road",
    floor: "2nd Floor",
    map: "https://maps.app.goo.gl/gB6xXVVic6ncBzPg9",
    note: "Good fit for Thika Town and surrounding routes.",
  },
]

const SERVICES = [
  { title: "General Dentistry", icon: "plus", body: "Checkups, cleanings, fillings, extractions, and root canals with a gentle approach." },
  { title: "Cosmetic Dentistry", icon: "spark", body: "Braces, whitening, and veneers for smile improvement without aggressive sales language." },
  { title: "Restorative Dentistry", icon: "shield", body: "Implants, crowns, bridges, dentures, and gum disease treatment with reassurance-first guidance." },
  { title: "Pediatric Care", icon: "smile", body: "Fear-free dental care for children aged 2 to 16, with parent-focused communication." },
  { title: "Pain Relief Visits", icon: "bolt", body: "Urgent pain, swelling, or discomfort triaged quickly across the branch network." },
  { title: "Insurance Guidance", icon: "check", body: "SHA/NHIF, AAR, APA, CIC Group, Britam, UAP, and many more supported plans." },
]

const PRICING = [
  ["Consultation", "Ksh 1,000"],
  ["Extraction / Tooth Removal", "From Ksh 3,000"],
  ["Fillings and Bonding", "From Ksh 5,000"],
  ["Cleaning and Scaling", "From Ksh 6,000"],
  ["Root Canal", "From Ksh 12,000"],
  ["Crowns", "From Ksh 26,000"],
  ["Braces and Alignment", "From Ksh 90,000 per jaw"],
  ["Teeth Whitening", "From Ksh 28,000"],
  ["Dental Implants", "From Ksh 140,000"],
]

const REVIEWS = [
  {
    author: "Mercy Alego",
    location: "Thika",
    rating: 5,
    text: "The next day, a nurse called to check on my recovery. That follow-up made me feel genuinely cared for.",
  },
  {
    author: "Kelvin Obare",
    location: "Thika Town",
    rating: 5,
    text: "I got an honest, detailed assessment and felt that my health was the real priority.",
  },
  {
    author: "Onsase",
    location: "Nairobi",
    rating: 5,
    text: "The whitening result looked bright and natural, and the team worked carefully to avoid sensitivity.",
  },
  {
    author: "Innocent Ndetei",
    location: "Nairobi",
    rating: 5,
    text: "My treatment options were explained clearly and the gentle approach made the visit comfortable.",
  },
]

const BOOKING_SERVICES = [
  "General checkup",
  "Cleaning",
  "Root canal",
  "Braces consultation",
  "Teeth whitening",
  "Dental implant assessment",
  "Pediatric visit",
  "Emergency pain visit",
]

const CONTENT_CONTEXT_NODES = [
  "design_spec",
  "brand_voice",
  "services",
  "pricing",
  "reviews",
  "offers",
  "locations",
]

const APPOINTMENTS_KEY = "ramani_sqlite_demo_appointments"
const VAULT_KEY = "ramani_live_vault_demo"
const ADMIN_AUTH_KEY = "ramani_admin_authenticated"
const CHAT_API_URL = "/api/chat"

const INITIAL_VAULT = {
  brand: {
    name: "Arrow Dental",
    fullName: "Arrow Dental Centre",
    tagline: "Sharpening Smiles. Touching Lives",
    summary:
      "Arrow Dental Centre is a leading multi-branch clinic in Kenya, serving Nairobi CBD, Thika Road, and Thika Town with comprehensive dental care, modern technology, and wide insurance acceptance.",
    shortDescription:
      "Arrow Dental Centre is a leading multi-branch clinic in Kenya providing comprehensive dental solutions across Nairobi CBD, Thika Road, and Thika Town.",
    mission: "To offer exceptional dental care through innovative, quality and affordable service delivery.",
    vision: "To be the most preferred dental clinic in Nairobi through exceptional standards and customer experience.",
  },
  contact: {
    primaryWhatsapp: "0119384741",
    whatsapp: "0740187579",
    alternate: "0740 579 064",
    email: "arrowdentalke@gmail.com",
  },
  hours: {
    weekday: "7:00 am - 9:00 pm",
    sunday: "8:30 am - 6:00 pm",
  },
  locations: [
    {
      name: "Nairobi CBD - Main",
      address: "Pension Towers, Loita Street",
      floor: "2nd Floor",
      map: "https://maps.app.goo.gl/C5hyHLpoAgPDkzzr9",
      note: "General and cosmetic care, walk-ins welcome.",
    },
    {
      name: "Nairobi CBD - Specialist",
      address: "Pension Towers, Loita Street",
      floor: "5th Floor",
      map: "https://maps.app.goo.gl/C5hyHLpoAgPDkzzr9",
      note: "Escalation path for specialist procedures.",
    },
    {
      name: "Thika Road",
      address: "CPA Centre, Thika Road",
      floor: "2nd Floor",
      map: "https://maps.app.goo.gl/LaBGCsY3ZyFxZMb2A",
      note: "Convenient for corridor commuters and evening visits.",
    },
    {
      name: "Thika Town",
      address: "Thika Gateway Plaza, Gakere Road",
      floor: "2nd Floor",
      map: "https://maps.app.goo.gl/gB6xXVVic6ncBzPg9",
      note: "Good fit for Thika Town and surrounding routes.",
    },
  ],
  services: [
    { title: "General Dentistry", icon: "plus", body: "Fillings, extractions, disimpactions, root canals, and full mouth cleaning with a gentle approach." },
    { title: "Cosmetic Dentistry", icon: "spark", body: "Braces, composite veneers, zirconia veneers, and teeth whitening for smile improvement without aggressive sales language." },
    { title: "Restorative Dentistry", icon: "shield", body: "Implants, crowns, bridges, partial dentures, and complete dentures with reassurance-first guidance." },
    { title: "Pediatric Care", icon: "smile", body: "Gentle, educational, fear-free care for children aged 2 to 16." },
    { title: "Pain Relief Visits", icon: "bolt", body: "Urgent pain, swelling, or discomfort triaged quickly across the branch network." },
    { title: "Insurance Guidance", icon: "check", body: "SHA, AAR, APA, CIC, Britam, UAP, and many more supported plans." },
  ],
  pricing: [
    { service: "Consultation", price: "Ksh 1,000" },
    { service: "Extraction / Tooth Removal", price: "From Ksh 4,000" },
    { service: "Fillings & Bonding", price: "From Ksh 5,000" },
    { service: "Cleaning & Scaling", price: "From Ksh 6,000" },
    { service: "Root Canal", price: "From Ksh 12,000" },
    { service: "Crowns", price: "From Ksh 26,000" },
    { service: "Braces & Alignment", price: "From Ksh 90,000 per jaw / From Ksh 160,000 both jaws" },
    { service: "Bridges", price: "From Ksh 25,000 per unit" },
    { service: "Teeth Whitening (Bleaching)", price: "From Ksh 28,000" },
    { service: "Composite Veneers (Masking)", price: "From Ksh 5,000 per tooth" },
    { service: "Zirconia Veneers", price: "From Ksh 25,000 per tooth" },
    { service: "Partial Dentures", price: "From Ksh 13,000" },
    { service: "Complete Dentures", price: "From Ksh 25,000" },
    { service: "Dental Implants", price: "From Ksh 140,000" },
  ],
  reviews: REVIEWS,
  voice: {
    personality: "Warm, professional, reassuring, expert",
    style: "Short sentences | conversational but authoritative | educational, not salesy | one clear CTA",
    emotionalOutcome: "Patients should feel heard, relieved, and confident.",
  },
  contentRules: {
    instagramCaptionLength: "120-160 words",
    hashtagsMode: "Use exactly 3 hashtags: #arrowdental #nairobidentist #kenyandentist",
    ctaRule: "End with one clear CTA.",
    pricingRule: "Do not volunteer pricing unless asked directly. Use starting-from language for non-consultation services.",
    visualRule: "Use brand-colored placeholder blocks and SVG icon language. Do not assume real patient photography.",
  },
  forbiddenWords: {
    bannedTerms: "cheap | free | guaranteed results | fear-based language",
    apologyGuardrail: 'Do not use "cost" in apology contexts.',
    consultationGuardrail: 'Never describe any service, offer, or consultation as "free".',
  },
  hashtags: {
    permanent: "#arrowdental | #nairobidentist | #kenyandentist",
    note: "Do not invent alternative brand hashtags. Use the permanent three for Instagram outputs in this demo.",
  },
  insurance: {
    providers:
      "APA | MINET | UAP | CIC | BRITAM | AAR | LIAISON | GA | HERITAGE | Eagle Africa | EQUITY | FIRST ASSURANCE | TAKAFUL | KENBRIGHT | KENGEN | PACIS | SANLAM | SEDGWICK | MTN | MADISON | LASER INSURANCE BROKERS | CAREPAY MTIBA | NIS RETIREES | FIDELITY | CLARKSON | Kenya Pipeline Company | SHA (Civil Servants) | SHA (TSC) | SHA (National Police & Prisons) | LUCENT | KEBS | DEFINITE ASSURANCE | UNISURE | ICEA LION M-TIBA",
    note: "Do not mention NHIF. Ask the patient which insurance they have to confirm coverage.",
  },
  payments: {
    methods: "Cash | Card | M-Pesa",
    installments: "Available for braces and implants",
  },
  bookingOptions: {
    services: BOOKING_SERVICES,
    times: ["Morning", "Afternoon", "Evening"],
  },
  offers: {
    consultationOffer: "Consultation is Ksh 1,000 and includes oral examination and X-ray.",
    bracesPaymentPlan: "Payment plans are available for braces.",
    implantsPaymentPlan: "Payment plans are available for implants.",
  },
}

const VAULT_NODE_LABELS = {
  brand: "Brand",
  contact: "Contact",
  hours: "Hours",
  locations: "Locations",
  services: "Services",
  pricing: "Pricing",
  reviews: "Reviews",
  voice: "Voice",
  contentRules: "Content Rules",
  forbiddenWords: "Forbidden Words",
  hashtags: "Hashtags",
  insurance: "Insurance",
  payments: "Payments",
  bookingOptions: "Booking Options",
  offers: "Offers",
}

function formatVaultValue(value) {
  if (Array.isArray(value)) {
    return value.join(" | ")
  }
  return String(value ?? "")
}

function parseVaultValue(value) {
  const trimmed = value.trim()
  if (trimmed.includes(" | ")) {
    return trimmed
      .split("|")
      .map((item) => item.trim())
      .filter(Boolean)
  }
  return trimmed
}

function parseMarkdownFields(block) {
  const result = {}

  block.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) {
      return
    }

    const separatorIndex = trimmed.indexOf(":")
    if (separatorIndex === -1) {
      return
    }

    const key = trimmed.slice(0, separatorIndex).trim()
    const value = trimmed.slice(separatorIndex + 1).trim()
    result[key] = parseVaultValue(value)
  })

  return result
}

function serializeVaultNode(nodeKey, value) {
  if (Array.isArray(value)) {
    const sections = value
      .map((item, index) => {
        const body = Object.entries(item)
          .map(([field, fieldValue]) => `${field}: ${formatVaultValue(fieldValue)}`)
          .join("\n")
        return `## Item ${index + 1}\n${body}`
      })
      .join("\n\n")

    return `# ${nodeKey}\n\n${sections}`.trim()
  }

  const body = Object.entries(value)
    .map(([field, fieldValue]) => `${field}: ${formatVaultValue(fieldValue)}`)
    .join("\n")

  return `# ${nodeKey}\n\n${body}`.trim()
}

function parseVaultNode(nodeKey, markdown) {
  const template = INITIAL_VAULT[nodeKey]
  const normalized = (markdown || "").replace(/\r\n/g, "\n").trim()
  const body = normalized.replace(/^#\s+[^\n]+\n*/m, "").trim()

  if (Array.isArray(template)) {
    const sections = body
      .split(/\n(?=##\s+)/)
      .map((section) => section.trim())
      .filter((section) => section.startsWith("## "))

    if (sections.length === 0) {
      throw new Error("Array-like vault nodes need one or more ## Item sections.")
    }

    const parsed = sections
      .map((section) => {
        const body = section
          .split("\n")
          .slice(1)
          .join("\n")
        return parseMarkdownFields(body)
      })
      .filter((item) => Object.keys(item).length > 0)

    if (parsed.length === 0) {
      throw new Error("No editable fields were found in this markdown node.")
    }

    return parsed
  }

  const parsed = parseMarkdownFields(body)
  if (Object.keys(parsed).length === 0) {
    throw new Error("No editable fields were found in this markdown node.")
  }
  return parsed
}

function vaultNodeHelp(nodeKey) {
  if (Array.isArray(INITIAL_VAULT[nodeKey])) {
    return "Markdown format: one ## Item block per entry, then key: value lines inside each block."
  }
  return "Markdown format: simple key: value lines. For list values, separate entries with |."
}

function getConsultationPrice(vault) {
  return vault.pricing.find((entry) => String(entry.service).toLowerCase() === "consultation")?.price || "Ksh 1,000"
}

function getConsultationOfferText(vault) {
  return `Consultation is ${getConsultationPrice(vault)} and includes oral examination and X-ray.`
}

function isPriceQuestion(text) {
  return /\b(price|pricing|cost|charges|fee|how much)\b/i.test(text || "")
}

function buildAgentSystemPrompt(vault, userText) {
  const locationText = vault.locations.map((location) => `${location.name}: ${location.address}, ${location.floor}`).join("; ")
  const serviceText = vault.services.map((service) => service.title).join(", ")
  const pricingText = vault.pricing.map((entry) => `${entry.service}: ${entry.price}`).join("; ")
  const priceAsked = isPriceQuestion(userText)

  return `You are ${vault.brand.fullName}'s AI assistant.

Ground truth:
- Business: ${vault.brand.fullName}
- Tagline: ${vault.brand.tagline}
- Locations: ${locationText}
- Hours: Monday to Saturday ${vault.hours.weekday}, Sunday ${vault.hours.sunday}
- Contact: WhatsApp ${vault.contact.whatsapp}, alternate ${vault.contact.alternate}, email ${vault.contact.email}
- Services: ${serviceText}
- Published pricing: ${pricingText}
- Offer: ${getConsultationOfferText(vault)}
- Insurance note: ${vault.insurance.note}
- Payment note: ${vault.payments.installments}

Tone rules:
- ${vault.voice.personality}
- ${vault.voice.style}
- Empathy first for pain, fear, complaints, or distress
- Never use these terms: ${vault.forbiddenWords.bannedTerms}
- ${vault.forbiddenWords.apologyGuardrail}
- ${vault.forbiddenWords.consultationGuardrail}
- Pricing gate: ${priceAsked ? "The user has explicitly asked about price, so you may mention pricing." : "The user has not explicitly asked about price, so do not mention any prices, consultation fee, or Ksh amounts."}
- Never use the consultation fee as a CTA unless the user explicitly asked about price
- If pricing is explicitly asked: consultation is ${getConsultationPrice(vault)} with no qualifier
- If pricing is explicitly asked: for non-consultation services, use starting-from language

Return clean markdown when useful for readability.`
}

function buildContentSystemPrompt(vault) {
  return `You are Ramani OS content generation for ${vault.brand.fullName}.

Use the vault as your context:
- Design system: light, warm, terracotta and beige, family-friendly, modern healthcare
- Brand: ${vault.brand.tagline}
- Brand summary: ${vault.brand.shortDescription}
- Services: ${vault.services.map((service) => service.title).join(", ")}
- Pricing: ${vault.pricing.map((entry) => `${entry.service} ${entry.price}`).join("; ")}
- Offer: ${getConsultationOfferText(vault)}
- Locations: ${vault.locations.map((location) => location.name).join(", ")}
- Hours: Monday to Saturday ${vault.hours.weekday}, Sunday ${vault.hours.sunday}
- Voice: ${vault.voice.personality}
- Writing style: ${vault.voice.style}
- Content rules: ${vault.contentRules.instagramCaptionLength}; ${vault.contentRules.ctaRule}; ${vault.contentRules.pricingRule}
- Visual rule: ${vault.contentRules.visualRule}
- Forbidden words: ${vault.forbiddenWords.bannedTerms}
- Guardrails: ${vault.forbiddenWords.consultationGuardrail}; ${vault.forbiddenWords.apologyGuardrail}
- Hashtags: ${vault.hashtags.permanent}

Instagram-specific output rules for this demo:
- Never use the word "free"
- Never say "Open 7 days"
- If consultation is mentioned, say: "${getConsultationOfferText(vault)}"
- If payment plans are relevant, use: "${vault.offers.bracesPaymentPlan}" or "${vault.offers.implantsPaymentPlan}"
- Use exactly these 3 hashtags and no others: ${vault.hashtags.permanent}
- Do not invent testimonials, named patients, or quotes
- Do not suggest real-patient photography; keep visual notes aligned to placeholder imagery and SVG-friendly design language

Generate concise, polished marketing copy grounded in those facts and obey every guardrail above.
Return clean markdown when useful for readability.`
}

function pageCardStyle() {
  return {
    background: shellTokens.bgPanel,
    border: `1px solid ${shellTokens.border}`,
    borderRadius: 18,
    boxShadow: "0 24px 48px rgba(0,0,0,0.22)",
  }
}

function shellInputStyle() {
  return {
    width: "100%",
    height: 46,
    borderRadius: 12,
    border: `1px solid ${shellTokens.border}`,
    background: shellTokens.bgCard,
    color: shellTokens.text,
    padding: "0 14px",
    fontSize: 14,
    fontFamily: shellTokens.sans,
    outline: "none",
  }
}

function siteInputStyle(hasError = false) {
  return {
    width: "100%",
    height: 52,
    borderRadius: 6,
    border: `1px solid ${hasError ? siteTokens.error : siteTokens.border}`,
    background: siteTokens.graySoft,
    color: siteTokens.text,
    padding: "0 16px",
    fontSize: 15,
    fontFamily: shellTokens.sans,
    outline: "none",
  }
}

function siteTextareaStyle(hasError = false) {
  return {
    width: "100%",
    minHeight: 104,
    borderRadius: 6,
    border: `1px solid ${hasError ? siteTokens.error : siteTokens.border}`,
    background: siteTokens.graySoft,
    color: siteTokens.text,
    padding: "14px 16px",
    fontSize: 15,
    fontFamily: shellTokens.sans,
    outline: "none",
    resize: "vertical",
  }
}

function primarySiteButton() {
  return {
    background: siteTokens.primary,
    color: "#fff",
    border: "none",
    borderRadius: 4,
    padding: "14px 28px",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    fontFamily: shellTokens.sans,
  }
}

function secondarySiteButton() {
  return {
    background: "transparent",
    color: siteTokens.brown,
    border: `1px solid ${siteTokens.brown}`,
    borderRadius: 4,
    padding: "14px 28px",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    fontFamily: shellTokens.sans,
  }
}

function edgeHull(ids) {
  const points = ids.map((id) => GRAPH_NODES.find((node) => node.id === id))
  const cx = points.reduce((sum, point) => sum + point.x, 0) / points.length
  const cy = points.reduce((sum, point) => sum + point.y, 0) / points.length
  return [...points]
    .sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx))
    .map((point) => {
      const dx = point.x - cx
      const dy = point.y - cy
      const length = Math.sqrt(dx * dx + dy * dy) || 1
      return `${point.x + (dx / length) * 26},${point.y + (dy / length) * 26}`
    })
    .join(" ")
}

function detectBookingIntent(text) {
  const hasStrongIntent =
    /\b(book|appointment|schedule|i want to come in|i'd like to come in|can i book|i want to book|make an appointment|reserve a slot|book me in)\b/i.test(text)

  const intentPrefix = /\b(i (want|need|'d like) (a |to )|(book|schedule|come in for|get) (a |))/i
  const serviceWords = /\b(cleaning|checkup|check-up|whitening|braces|implant|root canal|extraction|filling|crown)\b/i
  const hasServiceWithIntent = intentPrefix.test(text) && serviceWords.test(text)

  return hasStrongIntent || hasServiceWithIntent
}

function extractService(text) {
  const lower = text.toLowerCase()
  if (lower.includes("clean")) return "Cleaning"
  if (lower.includes("root canal")) return "Root canal"
  if (lower.includes("brace")) return "Braces consultation"
  if (lower.includes("whiten")) return "Teeth whitening"
  if (lower.includes("implant")) return "Dental implant assessment"
  if (lower.includes("child") || lower.includes("kid") || lower.includes("pediatric")) return "Pediatric visit"
  if (lower.includes("pain") || lower.includes("emergency")) return "Emergency pain visit"
  if (lower.includes("checkup") || lower.includes("check-up")) return "General checkup"
  return ""
}

function createMessageId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

function parseMarkdownToHtml(markdown) {
  let html = escapeHtml(markdown || "")
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer" style="color:#B8662D;text-decoration:underline;">$1</a>')
  html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
  html = html.replace(/\*([^*]+)\*/g, "<em>$1</em>")
  html = html.replace(/\n/g, "<br />")
  return html
}

function MarkdownText({ text, style }) {
  return <div style={style} dangerouslySetInnerHTML={{ __html: parseMarkdownToHtml(text) }} />
}

function mergeVaultState(base, saved) {
  if (Array.isArray(base)) {
    return Array.isArray(saved) ? saved : base
  }

  if (!base || typeof base !== "object") {
    return saved === undefined ? base : saved
  }

  const output = { ...base }
  Object.keys(saved || {}).forEach((key) => {
    output[key] = key in base ? mergeVaultState(base[key], saved[key]) : saved[key]
  })
  return output
}

function loadAppointments() {
  if (typeof window === "undefined") {
    return []
  }

  try {
    const raw = window.localStorage.getItem(APPOINTMENTS_KEY)
    const parsed = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function loadVault() {
  if (typeof window === "undefined") {
    return INITIAL_VAULT
  }

  try {
    const raw = window.localStorage.getItem(VAULT_KEY)
    if (!raw) {
      return INITIAL_VAULT
    }
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === "object" ? mergeVaultState(INITIAL_VAULT, parsed) : INITIAL_VAULT
  } catch {
    return INITIAL_VAULT
  }
}

function loadAdminAuthenticated() {
  if (typeof window === "undefined") {
    return false
  }

  try {
    return window.localStorage.getItem(ADMIN_AUTH_KEY) === "true"
  } catch {
    return false
  }
}

async function callChatApi(payload) {
  const response = await fetch(CHAT_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  const raw = await response.text()
  let data = {}
  try {
    data = raw ? JSON.parse(raw) : {}
  } catch {
    throw new Error(raw || "Agent request failed")
  }

  if (!response.ok) {
    throw new Error(data?.error?.message || data?.error || "Agent request failed")
  }

  return data?.reply || data?.choices?.[0]?.message?.content || "I could not generate a reply."
}

async function callAgent(messages, vault) {
  const response = await callChatApi({
    mode: "agent",
    messages,
    vault,
  })
  return response
}

async function generateContent(prompt, platform, tone, vault) {
  const response = await callChatApi({
    mode: "content-gen",
    prompt,
    platform,
    tone,
    vault,
  })
  return response
}

export default function RamaniDemo() {
  const [view, setView] = useState("graph")
  const [websitePage, setWebsitePage] = useState("home")
  const [hoveredNode, setHoveredNode] = useState(null)
  const [vault, setVault] = useState(() => loadVault())
  const [appointments, setAppointments] = useState(() => loadAppointments())
  const [formNotice, setFormNotice] = useState("")
  const [bookingErrors, setBookingErrors] = useState({})
  const [bookingForm, setBookingForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    branch: INITIAL_VAULT.locations[0].name,
    service: "",
    date: "",
    time: "",
    patientType: "New Patient",
    insurance: "",
    notes: "",
  })
  const [contentPrompt, setContentPrompt] = useState("")
  const [contentPlatform, setContentPlatform] = useState("Instagram")
  const [contentTone, setContentTone] = useState("Warm and professional")
  const [contentLoading, setContentLoading] = useState(false)
  const [contentOutput, setContentOutput] = useState("")
  const [messages, setMessages] = useState([
    {
      id: createMessageId(),
      role: "assistant",
      kind: "text",
      content: "Hi! I can answer clinic questions, or I can book an appointment and project a confirmation card right here in the chat.",
    },
  ])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const [chatProjection, setChatProjection] = useState(null)
  const [adminAuthenticated, setAdminAuthenticated] = useState(() => loadAdminAuthenticated())
  const [adminCredentials, setAdminCredentials] = useState({ username: "admin", password: "arrowdental" })
  const [adminError, setAdminError] = useState("")
  const [selectedNode, setSelectedNode] = useState("pricing")
  const [nodeEditor, setNodeEditor] = useState(serializeVaultNode("pricing", INITIAL_VAULT.pricing))
  const [adminNotice, setAdminNotice] = useState("")
  const chatEndRef = useRef(null)

  useEffect(() => {
    const styleTag = document.createElement("style")
    styleTag.textContent =
      "@import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');*{box-sizing:border-box}body{margin:0;background:#FBF4EA;font-family:'Poppins',sans-serif;color:#1E1E1E}"
    document.head.appendChild(styleTag)
    return () => document.head.removeChild(styleTag)
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(APPOINTMENTS_KEY, JSON.stringify(appointments))
    }
  }, [appointments])

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(VAULT_KEY, JSON.stringify(vault))
    }
  }, [vault])

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(ADMIN_AUTH_KEY, adminAuthenticated ? "true" : "false")
    }
  }, [adminAuthenticated])

  useEffect(() => {
    setNodeEditor(serializeVaultNode(selectedNode, vault[selectedNode]))
  }, [selectedNode, vault])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, chatLoading])

  useEffect(() => {
    setBookingForm((prev) => {
      const validBranches = vault.locations.map((location) => location.name)
      const validServices = vault.bookingOptions?.services || []
      const nextBranch = validBranches.includes(prev.branch) ? prev.branch : validBranches[0] || ""
      const nextService = !prev.service || validServices.includes(prev.service) ? prev.service : ""

      if (nextBranch === prev.branch && nextService === prev.service) {
        return prev
      }

      return {
        ...prev,
        branch: nextBranch,
        service: nextService,
      }
    })
  }, [vault.locations, vault.bookingOptions])

  function addAppointment(record) {
    setAppointments((prev) => [
      {
        id: prev.length + 1,
        createdAt: new Date().toISOString(),
        dbLabel: "SQLite demo store",
        ...record,
      },
      ...prev,
    ])
  }

  function handleBookingField(key, value) {
    setBookingForm((prev) => ({ ...prev, [key]: value }))
    setBookingErrors((prev) => ({ ...prev, [key]: "" }))
    setFormNotice("")
  }

  function normalizeTimeLabel(value) {
    if (!value) {
      return ""
    }
    if (["morning", "afternoon", "evening"].includes(value.toLowerCase())) {
      return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
    }
    return value
  }

  function submitBookingForm() {
    const nextErrors = {}
    if (!bookingForm.fullName.trim()) nextErrors.fullName = "Name is required."
    if (!bookingForm.phone.trim()) nextErrors.phone = "Phone is required."
    if (!bookingForm.service.trim()) nextErrors.service = "Service is required."
    if (!bookingForm.date.trim()) nextErrors.date = "Date is required."
    if (!bookingForm.time.trim()) nextErrors.time = "Preferred time is required."

    if (Object.keys(nextErrors).length > 0) {
      setBookingErrors(nextErrors)
      return
    }

    addAppointment({
      source: "form",
      fullName: bookingForm.fullName,
      phone: bookingForm.phone,
      email: bookingForm.email,
      branch: bookingForm.branch,
      service: bookingForm.service,
      date: bookingForm.date,
      time: normalizeTimeLabel(bookingForm.time),
      patientType: bookingForm.patientType,
      insurance: bookingForm.insurance,
      notes: bookingForm.notes,
    })

    setFormNotice("Appointment saved. The team can now review it in admin.")
    setBookingForm((prev) => ({
      ...prev,
      fullName: "",
      phone: "",
      email: "",
      service: "",
      date: "",
      time: "",
      insurance: "",
      notes: "",
    }))
  }

  async function runContentGeneration() {
    if (!contentPrompt.trim() || contentLoading) {
      return
    }

    setContentLoading(true)
    setContentOutput("")

    try {
      const output = await generateContent(contentPrompt, contentPlatform, contentTone, vault)
      setContentOutput(output)
    } catch (error) {
      setContentOutput(error.message || "Generation failed.")
    } finally {
      setContentLoading(false)
    }
  }

  function pushAssistantText(content) {
    setMessages((prev) => [...prev, { id: createMessageId(), role: "assistant", kind: "text", content }])
  }

  function beginChatBooking(seedText) {
    const seededService = extractService(seedText)
    setChatProjection({
      service: seededService,
      fullName: "",
      phone: "",
      date: "",
      time: "",
      branch: vault.locations[0]?.name || "",
    })
    pushAssistantText("I can project a booking form here. Fill it in, save it, or close it if you do not want to continue.")
  }

  async function sendChat() {
    const value = chatInput.trim()
    if (!value || chatLoading) {
      return
    }

    setMessages((prev) => [...prev, { id: createMessageId(), role: "user", kind: "text", content: value }])
    setChatInput("")

    if (detectBookingIntent(value)) {
      beginChatBooking(value)
      return
    }

    setChatLoading(true)
    try {
      const requestMessages = [...messages, { role: "user", content: value }]
        .filter((message) => message.kind !== "projection")
        .map((message) => ({ role: message.role, content: message.content }))
      const reply = await callAgent(requestMessages, vault)
      pushAssistantText(reply)
    } catch (error) {
      pushAssistantText(error.message || "The assistant could not respond.")
    } finally {
      setChatLoading(false)
    }
  }

  function confirmProjectedAppointment(appointment) {
    addAppointment({
      source: "chat",
      fullName: appointment.fullName,
      phone: appointment.phone,
      email: "",
      branch: appointment.branch,
      service: appointment.service,
      date: appointment.date,
      time: normalizeTimeLabel(appointment.time),
      patientType: "New Patient",
      insurance: "",
      notes: "Captured via chat projection.",
    })
    setChatProjection(null)
    pushAssistantText("Confirmed. Your appointment request has been captured.")
  }

  function closeProjectedAppointment() {
    setChatProjection(null)
    pushAssistantText("No problem. I closed the booking form. You can still ask a question or start a new booking later.")
  }

  function attemptAdminLogin() {
    if (adminCredentials.username === "admin" && adminCredentials.password === "arrowdental") {
      setAdminAuthenticated(true)
      setAdminError("")
      setAdminNotice("Admin mode unlocked. Vault edits will project live across the demo.")
      return
    }
    setAdminError("Invalid staff credentials.")
  }

  function saveVaultNode() {
    try {
      const parsed = parseVaultNode(selectedNode, nodeEditor)
      setVault((prev) => {
        const nextVault = { ...prev, [selectedNode]: parsed }

        if (selectedNode === "pricing") {
          nextVault.offers = {
            ...nextVault.offers,
            consultationOffer: getConsultationOfferText(nextVault),
          }
        }

        return nextVault
      })
      setAdminNotice(`Vault node "${selectedNode}" updated. Website and future agent/content responses now read the new state.`)
      setAdminError("")
    } catch {
      setAdminError("That JSON is not valid. Fix the syntax before saving.")
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top, rgba(244,124,44,0.10), transparent 28%), linear-gradient(180deg, #FBF4EA 0%, #F7EBDD 100%)",
        color: shellTokens.text,
        fontFamily: shellTokens.sans,
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 30,
          background: "rgba(251,244,234,0.94)",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${shellTokens.border}`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, padding: "14px 24px" }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700 }}>{vault.brand.name} | Ramani OS</div>
            <div style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.muted }}>arrow-dental-vault</div>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 8, flexWrap: "wrap" }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                style={{
                  border: "none",
                  borderRadius: 999,
                  padding: "8px 14px",
                  cursor: "pointer",
                  fontFamily: shellTokens.sans,
                  fontSize: 13,
                  fontWeight: 600,
                  color: view === tab.id ? "#fff" : shellTokens.muted,
                  background: view === tab.id ? shellTokens.orange : "transparent",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div style={{ padding: "8px 24px", borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <span style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.muted }}>surface -&gt; </span>
          <span style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.accent }}>{SURFACE_LABELS[view]}</span>
        </div>
      </div>

      {view === "graph" && (
        <div style={{ padding: 24 }}>
          <div style={{ ...pageCardStyle(), padding: 20 }}>
            <svg width="100%" viewBox="0 0 660 450" style={{ display: "block", maxHeight: 500 }}>
              {GRAPH_EDGES.map((edge) => (
                <polygon
                  key={edge.id}
                  points={edgeHull(edge.nodes)}
                  fill={edge.color}
                  fillOpacity={0.08}
                  stroke={edge.color}
                  strokeOpacity={0.28}
                  strokeDasharray="5 4"
                />
              ))}
              {GRAPH_EDGES.map((edge) =>
                edge.nodes.flatMap((a, index) =>
                  edge.nodes.slice(index + 1).map((b) => {
                    const nodeA = GRAPH_NODES.find((node) => node.id === a)
                    const nodeB = GRAPH_NODES.find((node) => node.id === b)
                    return <line key={`${edge.id}-${a}-${b}`} x1={nodeA.x} y1={nodeA.y} x2={nodeB.x} y2={nodeB.y} stroke={edge.color} strokeOpacity={0.2} />
                  }),
                ),
              )}
              {GRAPH_NODES.map((node) => {
                const color =
                  node.temp === "hot" ? shellTokens.orange : node.temp === "warm" ? shellTokens.yellow : shellTokens.accent
                const radius = node.temp === "hot" ? 22 : node.temp === "warm" ? 16 : 12
                const active = hoveredNode === node.id
                return (
                  <g key={node.id} onMouseEnter={() => setHoveredNode(node.id)} onMouseLeave={() => setHoveredNode(null)} style={{ cursor: "pointer" }}>
                    <circle cx={node.x} cy={node.y} r={radius + (active ? 7 : 0)} fill={color} fillOpacity={0.14} stroke={color} strokeWidth={1.4} />
                    <circle cx={node.x} cy={node.y} r={4} fill={color} />
                    <text x={node.x} y={node.y - radius - 8} textAnchor="middle" fill={shellTokens.text} style={{ fontSize: 11, fontFamily: shellTokens.mono }}>
                      {node.label}
                    </text>
                    {active && (
                      <text x={node.x} y={node.y + radius + 16} textAnchor="middle" fill={shellTokens.accent} style={{ fontSize: 10, fontFamily: shellTokens.mono }}>
                        {node.desc}
                      </text>
                    )}
                  </g>
                )
              })}
            </svg>

            <div style={{ display: "flex", gap: 18, flexWrap: "wrap", borderTop: `1px solid ${shellTokens.border}`, paddingTop: 12, marginTop: 10 }}>
              {[
                ["hot", shellTokens.orange],
                ["warm", shellTokens.yellow],
                ["cold", shellTokens.accent],
              ].map(([label, color]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                  <span style={{ fontFamily: shellTokens.mono, fontSize: 11, color: shellTokens.muted }}>{label} node</span>
                </div>
              ))}
              {GRAPH_EDGES.map((edge) => (
                <div key={edge.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 18, borderTop: `2px dashed ${edge.color}` }} />
                  <span style={{ fontFamily: shellTokens.mono, fontSize: 11, color: shellTokens.muted }}>{edge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === "website" && (
        <div style={{ display: "flex", minHeight: "calc(100vh - 92px)", padding: 24 }}>
          <div style={{ ...pageCardStyle(), display: "flex", width: "100%", overflow: "hidden" }}>
            <aside
              style={{
                width: 230,
                flexShrink: 0,
                background: siteTokens.white,
                borderRight: `1px solid ${siteTokens.border}`,
                padding: 18,
              }}
            >
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: siteTokens.brownDark, lineHeight: 1.15 }}>{vault.brand.name}</div>
                <div style={{ fontSize: 12, color: siteTokens.textSoft, marginTop: 4 }}>{vault.brand.tagline}</div>
              </div>
              {WEBSITE_PAGES.map((page) => (
                <button
                  key={page.id}
                  onClick={() => setWebsitePage(page.id)}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    background: websitePage === page.id ? siteTokens.beige : "transparent",
                    border: "none",
                    borderLeft: `3px solid ${websitePage === page.id ? siteTokens.primary : "transparent"}`,
                    padding: "12px 14px",
                    marginBottom: 8,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ color: siteTokens.text, fontWeight: 600, fontSize: 14 }}>{page.label}</div>
                  <div style={{ color: siteTokens.textSoft, fontSize: 11, marginTop: 4, fontFamily: shellTokens.mono }}>{page.source}</div>
                </button>
              ))}
            </aside>

            <main style={{ flex: 1, overflowY: "auto", background: siteTokens.beigeSoft }}>
              <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 24px 48px" }}>
                <WebsitePanel
                  page={websitePage}
                  setPage={setWebsitePage}
                  vault={vault}
                  bookingForm={bookingForm}
                  bookingErrors={bookingErrors}
                  formNotice={formNotice}
                  handleBookingField={handleBookingField}
                  submitBookingForm={submitBookingForm}
                />
              </div>
            </main>
          </div>
        </div>
      )}

      {view === "content" && (
        <div style={{ display: "flex", minHeight: "calc(100vh - 92px)", padding: 24, gap: 18 }}>
          <div style={{ ...pageCardStyle(), width: 340, flexShrink: 0, padding: 18 }}>
            <div style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.muted, letterSpacing: "0.08em", marginBottom: 8 }}>
              VAULT GROUNDING
            </div>
            <h2 style={{ margin: 0, fontSize: 24 }}>Content Gen</h2>
            <p style={{ color: shellTokens.muted, fontSize: 14, lineHeight: 1.7 }}>
              This surface uses the vault as visible context: design spec, brand voice, services, pricing, reviews, and location nodes.
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "14px 0 18px" }}>
              {CONTENT_CONTEXT_NODES.map((node) => (
                <span
                  key={node}
                  style={{
                    fontFamily: shellTokens.mono,
                    fontSize: 10,
                    padding: "6px 9px",
                    borderRadius: 6,
                    border: `1px solid ${shellTokens.border}`,
                    background: shellTokens.accentSoft,
                    color: shellTokens.accent,
                  }}
                >
                  {node}
                </span>
              ))}
            </div>

            <div style={{ marginBottom: 10, fontSize: 11, color: shellTokens.muted, fontFamily: shellTokens.mono }}>Prompt</div>
            <textarea
              value={contentPrompt}
              onChange={(event) => setContentPrompt(event.target.value)}
              placeholder="Generate a family-friendly Instagram post about pediatric care and Sunday availability."
              style={{ ...shellInputStyle(), minHeight: 120, padding: 14, resize: "vertical" }}
            />

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 12 }}>
              <div>
                <div style={{ marginBottom: 6, fontSize: 11, color: shellTokens.muted, fontFamily: shellTokens.mono }}>Platform</div>
                <select value={contentPlatform} onChange={(event) => setContentPlatform(event.target.value)} style={shellInputStyle()}>
                  <option>Instagram</option>
                  <option>Facebook</option>
                  <option>WhatsApp Broadcast</option>
                  <option>Website Copy</option>
                </select>
              </div>
              <div>
                <div style={{ marginBottom: 6, fontSize: 11, color: shellTokens.muted, fontFamily: shellTokens.mono }}>Tone</div>
                <select value={contentTone} onChange={(event) => setContentTone(event.target.value)} style={shellInputStyle()}>
                  <option>Warm and professional</option>
                  <option>Family-friendly and reassuring</option>
                  <option>Educational and direct</option>
                </select>
              </div>
            </div>

            <button
              onClick={runContentGeneration}
              disabled={contentLoading}
              style={{
                marginTop: 14,
                width: "100%",
                border: "none",
                borderRadius: 10,
                padding: "12px 16px",
                background: contentLoading ? "#2b3241" : shellTokens.orange,
                color: "#fff",
                fontWeight: 600,
                cursor: contentLoading ? "not-allowed" : "pointer",
                fontFamily: shellTokens.sans,
              }}
            >
              {contentLoading ? "Generating from vault..." : "Generate from Vault"}
            </button>

            <div style={{ marginTop: 22 }}>
              <div style={{ marginBottom: 10, fontSize: 11, color: shellTokens.muted, fontFamily: shellTokens.mono }}>UPCOMING FEATURES</div>
              {[
                ["HeyGen Hyperframes", "HTML to deterministic video generation from generated copy."],
                ["Image Generation", "Campaign visual drafts grounded in the same service and pricing context."],
                ["Media Assets", "Image nodes as first-class vault objects in Ramani."],
              ].map(([title, body]) => (
                <div key={title} style={{ ...pageCardStyle(), padding: 12, marginBottom: 10 }}>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
                  <div style={{ fontSize: 12, color: shellTokens.muted, lineHeight: 1.6, marginTop: 4 }}>{body}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...pageCardStyle(), flex: 1, padding: 20 }}>
            <div style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.muted, letterSpacing: "0.08em", marginBottom: 8 }}>
              OUTPUT
            </div>
            {!contentOutput ? (
              <div
                style={{
                  minHeight: 320,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  border: `1px dashed ${shellTokens.border}`,
                  borderRadius: 14,
                  color: shellTokens.muted,
                  padding: 24,
                }}
              >
                <div>
                  <div style={{ fontSize: 16, color: shellTokens.text, marginBottom: 8 }}>Vault-grounded content will appear here.</div>
                  <div style={{ fontFamily: shellTokens.mono, fontSize: 11 }}>design_spec + services + pricing + reviews + offers</div>
                </div>
              </div>
            ) : (
              <div style={{ ...pageCardStyle(), padding: 18, minHeight: 320 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                  <span
                    style={{
                      padding: "4px 8px",
                      borderRadius: 999,
                      background: shellTokens.accentSoft,
                      color: shellTokens.accent,
                      fontFamily: shellTokens.mono,
                      fontSize: 10,
                    }}
                  >
                    {contentPlatform}
                  </span>
                  <span style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.muted }}>{contentTone}</span>
                </div>
                <MarkdownText text={contentOutput} style={{ lineHeight: 1.75, fontSize: 15 }} />
              </div>
            )}
          </div>
        </div>
      )}

      {view === "admin" && (
        <div style={{ display: "flex", minHeight: "calc(100vh - 92px)", padding: 24, gap: 18 }}>
          <aside style={{ ...pageCardStyle(), width: 360, flexShrink: 0, padding: 20 }}>
            <div style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.muted, marginBottom: 8 }}>ADMIN MODE</div>
            <h2 style={{ margin: 0, fontSize: 24 }}>Staff Login</h2>
            <p style={{ color: shellTokens.muted, fontSize: 14, lineHeight: 1.7 }}>
              This is the live vault control surface. Changes made here update the shared state used by the website projection, content generation, and future agent replies.
            </p>

            {!adminAuthenticated ? (
              <div style={{ marginTop: 18 }}>
                <div style={{ ...pageCardStyle(), padding: 14, marginBottom: 14, background: shellTokens.accentSoft }}>
                  <div style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.accent, marginBottom: 6 }}>DEMO CREDENTIALS</div>
                  <div style={{ fontSize: 13 }}>username: <strong>admin</strong></div>
                  <div style={{ fontSize: 13, marginTop: 4 }}>password: <strong>arrowdental</strong></div>
                </div>

                <div style={{ marginBottom: 10 }}>
                  <div style={{ marginBottom: 6, fontSize: 11, color: shellTokens.muted, fontFamily: shellTokens.mono }}>Username</div>
                  <input
                    value={adminCredentials.username}
                    onChange={(event) => setAdminCredentials((prev) => ({ ...prev, username: event.target.value }))}
                    style={shellInputStyle()}
                  />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ marginBottom: 6, fontSize: 11, color: shellTokens.muted, fontFamily: shellTokens.mono }}>Password</div>
                  <input
                    type="password"
                    value={adminCredentials.password}
                    onChange={(event) => setAdminCredentials((prev) => ({ ...prev, password: event.target.value }))}
                    style={shellInputStyle()}
                  />
                </div>

                {adminError && <div style={{ color: shellTokens.red, fontSize: 13, marginBottom: 12 }}>{adminError}</div>}

                <button
                  onClick={attemptAdminLogin}
                  style={{
                    width: "100%",
                    border: "none",
                    borderRadius: 10,
                    padding: "12px 16px",
                    background: shellTokens.orange,
                    color: "#fff",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: shellTokens.sans,
                  }}
                >
                  Enter Admin Mode
                </button>
              </div>
            ) : (
              <div style={{ marginTop: 18 }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 600 }}>Live Vault Editor</div>
                    <div style={{ fontSize: 12, color: shellTokens.muted }}>Markdown-aware editor for vault nodes</div>
                  </div>
                  <button
                    onClick={() => {
                      setAdminAuthenticated(false)
                      setAdminNotice("")
                      setAdminError("")
                    }}
                    style={{
                      border: `1px solid ${shellTokens.border}`,
                      borderRadius: 999,
                      padding: "6px 10px",
                      background: "transparent",
                      color: shellTokens.text,
                      cursor: "pointer",
                      fontFamily: shellTokens.mono,
                      fontSize: 10,
                    }}
                  >
                    Logout
                  </button>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ marginBottom: 6, fontSize: 11, color: shellTokens.muted, fontFamily: shellTokens.mono }}>Vault Node</div>
                  <select value={selectedNode} onChange={(event) => setSelectedNode(event.target.value)} style={shellInputStyle()}>
                    {Object.keys(VAULT_NODE_LABELS).map((nodeKey) => (
                      <option key={nodeKey} value={nodeKey}>
                        {VAULT_NODE_LABELS[nodeKey]}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ ...pageCardStyle(), padding: 12, marginBottom: 12 }}>
                  <div style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.accent, marginBottom: 6 }}>.md NODE FORMAT</div>
                  <div style={{ fontSize: 13, color: shellTokens.muted, lineHeight: 1.7 }}>{vaultNodeHelp(selectedNode)}</div>
                </div>

                <textarea
                  value={nodeEditor}
                  onChange={(event) => {
                    setNodeEditor(event.target.value)
                    setAdminNotice("")
                    setAdminError("")
                  }}
                  style={{ ...shellInputStyle(), minHeight: 360, height: 360, padding: 14, resize: "vertical" }}
                />

                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button
                    onClick={saveVaultNode}
                    style={{
                      flex: 1,
                      border: "none",
                      borderRadius: 10,
                      padding: "12px 16px",
                      background: shellTokens.green,
                      color: "#fff",
                      fontWeight: 600,
                      cursor: "pointer",
                      fontFamily: shellTokens.sans,
                    }}
                  >
                    Save Vault Node
                  </button>
                  <button
                    onClick={() => {
                      setNodeEditor(serializeVaultNode(selectedNode, vault[selectedNode]))
                      setAdminNotice("")
                      setAdminError("")
                    }}
                    style={{
                      borderRadius: 10,
                      padding: "12px 16px",
                      background: "transparent",
                      color: shellTokens.text,
                      border: `1px solid ${shellTokens.border}`,
                      cursor: "pointer",
                      fontFamily: shellTokens.sans,
                    }}
                  >
                    Reset
                  </button>
                </div>

                {(adminNotice || adminError) && (
                  <div style={{ marginTop: 12, color: adminError ? shellTokens.red : shellTokens.green, fontSize: 13, lineHeight: 1.6 }}>
                    {adminError || adminNotice}
                  </div>
                )}
              </div>
            )}
          </aside>

          <div style={{ flex: 1, display: "grid", gridTemplateRows: "auto 1fr", gap: 18 }}>
            <div style={{ ...pageCardStyle(), padding: 18 }}>
              <div style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.muted, marginBottom: 12 }}>LIVE STATE</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
                {[
                  ["locations", vault.locations.length],
                  ["services", vault.services.length],
                  ["pricing rows", vault.pricing.length],
                  ["appointments", appointments.length],
                ].map(([label, value]) => (
                  <div key={label} style={{ ...pageCardStyle(), padding: 14 }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: shellTokens.orange }}>{value}</div>
                    <div style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.muted }}>{label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: 18 }}>
              <div style={{ ...pageCardStyle(), padding: 18 }}>
                <div style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.muted, marginBottom: 8 }}>LIVE NODE SNAPSHOT</div>
                <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>{VAULT_NODE_LABELS[selectedNode]}</div>
                <div style={{ ...pageCardStyle(), padding: 14, background: shellTokens.bgCard }}>
                  <pre style={{ margin: 0, whiteSpace: "pre-wrap", fontFamily: shellTokens.mono, fontSize: 12, lineHeight: 1.8, color: shellTokens.text }}>{nodeEditor}</pre>
                </div>
              </div>

              <div style={{ ...pageCardStyle(), padding: 18, overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 14 }}>
                  <div>
                    <div style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.muted, marginBottom: 6 }}>SQLITE DEMO TABLE</div>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>Appointments</div>
                  </div>
                  <div style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.accent }}>source: form | chat</div>
                </div>

                <div style={{ border: `1px solid ${shellTokens.border}`, borderRadius: 12, overflow: "hidden" }}>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1.2fr 1fr 1fr 0.8fr",
                      padding: "12px 14px",
                      background: shellTokens.bgCard,
                      fontFamily: shellTokens.mono,
                      fontSize: 10,
                      color: shellTokens.muted,
                    }}
                  >
                    <div>Patient</div>
                    <div>Service</div>
                    <div>Slot</div>
                    <div>Source</div>
                  </div>
                  {appointments.length === 0 ? (
                    <div style={{ padding: 18, fontSize: 14, color: shellTokens.muted }}>No appointment records yet.</div>
                  ) : (
                    appointments.map((item) => (
                      <div
                        key={`${item.source}-${item.id}-${item.createdAt}`}
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1.2fr 1fr 1fr 0.8fr",
                          padding: "13px 14px",
                          borderTop: `1px solid ${shellTokens.border}`,
                          fontSize: 13,
                          alignItems: "start",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>{item.fullName}</div>
                          <div style={{ fontSize: 11, color: shellTokens.muted, marginTop: 4 }}>{item.phone}</div>
                        </div>
                        <div>{item.service}</div>
                        <div>
                          {item.date}
                          <br />
                          <span style={{ color: shellTokens.muted }}>{item.time || "No time set"}</span>
                        </div>
                        <div>
                          <span
                            style={{
                              padding: "4px 8px",
                              borderRadius: 999,
                              background: item.source === "chat" ? "rgba(46,158,87,0.15)" : "rgba(244,124,44,0.14)",
                              color: item.source === "chat" ? shellTokens.green : shellTokens.orange,
                              fontFamily: shellTokens.mono,
                              fontSize: 10,
                            }}
                          >
                            {item.source}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {view === "agent" && (
        <div style={{ display: "flex", minHeight: "calc(100vh - 92px)", padding: 24, gap: 18 }}>
          <aside style={{ ...pageCardStyle(), width: 320, flexShrink: 0, padding: 18 }}>
            <div style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.muted, marginBottom: 8 }}>PARTIAL PROJECTION CONTEXT</div>
            <h2 style={{ margin: 0, fontSize: 24 }}>Agent</h2>
            <div style={{ color: shellTokens.muted, fontSize: 14, lineHeight: 1.7, margin: "10px 0 18px" }}>
              Ask about branches, services, pricing, reviews, or booking. When booking intent appears, the form is projected directly into chat.
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 18 }}>
              {["booking", "locations", "pricing", "reviews", "design_spec"].map((node) => (
                <span
                  key={node}
                  style={{
                    fontFamily: shellTokens.mono,
                    fontSize: 10,
                    padding: "6px 9px",
                    borderRadius: 6,
                    border: `1px solid ${shellTokens.border}`,
                    background: shellTokens.accentSoft,
                    color: shellTokens.accent,
                  }}
                >
                  {node}
                </span>
              ))}
            </div>
            <div style={{ ...pageCardStyle(), padding: 14, color: shellTokens.muted, fontSize: 13 }}>
              Booking submissions are captured for staff review in Admin Mode.
            </div>
          </aside>

          <div style={{ ...pageCardStyle(), flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
            <div style={{ padding: 18, borderBottom: `1px solid ${shellTokens.border}` }}>
              <div style={{ fontSize: 20, fontWeight: 700 }}>Agent + Partial Projections</div>
              <div style={{ fontSize: 13, color: shellTokens.muted, marginTop: 4 }}>
                General questions use the grounded agent. Booking intent projects a form directly into chat for quick confirmation.
              </div>
            </div>

            <div style={{ flex: 1, overflowY: "auto", padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
              {messages.map((message, index) => (
                <div key={`${message.role}-${message.kind}-${index}`} style={{ display: "flex", justifyContent: message.role === "user" ? "flex-end" : "flex-start" }}>
                  <div
                    style={{
                      maxWidth: "78%",
                      padding: "12px 14px",
                      borderRadius: message.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: message.role === "user" ? shellTokens.orange : shellTokens.bgCard,
                      color: message.role === "user" ? "#fff" : shellTokens.text,
                      border: message.role === "assistant" ? `1px solid ${shellTokens.border}` : "none",
                      lineHeight: 1.7,
                      fontSize: 14,
                    }}
                  >
                    {message.role === "assistant" && (
                      <div style={{ fontFamily: shellTokens.mono, fontSize: 9, color: shellTokens.accent, marginBottom: 6 }}>AGENT</div>
                    )}
                    {message.role === "assistant" ? <MarkdownText text={message.content} /> : message.content}
                  </div>
                </div>
              ))}

              {chatProjection && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <ProjectedBookingForm
                    draft={chatProjection}
                    locations={vault.locations}
                    serviceOptions={vault.bookingOptions?.services || []}
                    timeOptions={vault.bookingOptions?.times || ["Morning", "Afternoon", "Evening"]}
                    onClose={closeProjectedAppointment}
                    onSubmit={confirmProjectedAppointment}
                  />
                </div>
              )}

              {chatLoading && (
                <div style={{ display: "flex", justifyContent: "flex-start" }}>
                  <div style={{ padding: "12px 14px", borderRadius: "16px 16px 16px 4px", background: shellTokens.bgCard, border: `1px solid ${shellTokens.border}` }}>
                    <span style={{ display: "inline-flex", gap: 4 }}>
                      {[0, 1, 2].map((dot) => (
                        <span
                          key={dot}
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            background: shellTokens.accent,
                            animationName: "dot",
                            animationDuration: "1.2s",
                            animationDelay: `${dot * 0.2}s`,
                            animationTimingFunction: "ease-in-out",
                            animationIterationCount: "infinite",
                            display: "inline-block",
                          }}
                        />
                      ))}
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div style={{ padding: 18, borderTop: `1px solid ${shellTokens.border}`, display: "flex", gap: 10 }}>
              <input
                value={chatInput}
                onChange={(event) => setChatInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendChat()
                  }
                }}
                placeholder="Ask about branches, services, pricing, or say you want to book..."
                style={shellInputStyle()}
              />
              <button
                onClick={sendChat}
                disabled={!chatInput.trim() || chatLoading}
                style={{
                  border: "none",
                  borderRadius: 12,
                  padding: "0 20px",
                  background: !chatInput.trim() || chatLoading ? "#D8C8B4" : shellTokens.orange,
                  color: "#fff",
                  fontWeight: 600,
                  cursor: !chatInput.trim() || chatLoading ? "not-allowed" : "pointer",
                  fontFamily: shellTokens.sans,
                }}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`@keyframes dot{0%,100%{opacity:.25}50%{opacity:1}}`}</style>
    </div>
  )
}

function WebsitePanel({ page, setPage, vault, bookingForm, bookingErrors, formNotice, handleBookingField, submitBookingForm }) {
  const branches = vault.locations
  const services = vault.services
  const pricing = vault.pricing
  const reviews = vault.reviews
  const bookingServices = vault.bookingOptions?.services || []
  const bookingTimes = vault.bookingOptions?.times || ["Morning", "Afternoon", "Evening"]

  return (
    <div style={{ color: siteTokens.text }}>
      {page === "home" && (
        <div>
          <section
            style={{
              background: siteTokens.white,
              border: `1px solid ${siteTokens.border}`,
              boxShadow: siteTokens.shadow,
              padding: "36px 32px",
              display: "grid",
              gridTemplateColumns: "minmax(0, 1fr) minmax(320px, 480px)",
              gap: 28,
              marginBottom: 28,
            }}
          >
            <div>
              <div style={{ fontSize: 11, color: siteTokens.primary, letterSpacing: "0.12em", fontWeight: 700, marginBottom: 12 }}>MULTI-BRANCH DENTAL CARE</div>
              <h1 style={{ fontSize: 56, lineHeight: 1.1, margin: "0 0 14px", maxWidth: 560 }}>
                {vault.brand.tagline}
              </h1>
              <p style={{ fontSize: 18, lineHeight: 1.7, color: siteTokens.textSoft, maxWidth: 640, marginBottom: 22 }}>
                {vault.brand.summary}
              </p>
              <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button onClick={() => setPage("book")} style={primarySiteButton()}>
                  Book appointment
                </button>
                <button onClick={() => setPage("services")} style={secondarySiteButton()}>
                  Explore services
                </button>
              </div>
            </div>

            <div
              style={{
                background: `linear-gradient(135deg, ${siteTokens.beige} 0%, ${siteTokens.beigeDeep} 55%, #f6d6bd 100%)`,
                minHeight: 320,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexDirection: "column",
                padding: 24,
                color: siteTokens.brown,
              }}
            >
              <div style={{ width: 96, height: 96, borderRadius: "50%", border: `2px solid ${siteTokens.primary}`, marginBottom: 16, position: "relative" }}>
                <div style={{ position: "absolute", inset: 16, borderRadius: "50%", background: siteTokens.primary }} />
              </div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>Imagery slots populated from the Ramani media vault.</div>
              <div style={{ fontSize: 13, color: siteTokens.textSoft, marginTop: 8, textAlign: "center", maxWidth: 280 }}>
                Demo placeholder blocks only. No real photography is used in this preview.
              </div>
            </div>
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16, marginBottom: 28 }}>
            {[
              ["15 years", "of trusted dental care"],
              ["30+", "dental professionals"],
              ["150,000+", "patients served"],
              ["7:00 am - 9:00 pm", "Monday to Saturday"],
            ].map(([value, label]) => (
              <div key={value} style={{ background: siteTokens.white, border: `1px solid ${siteTokens.border}`, padding: 24, boxShadow: siteTokens.shadow }}>
                <div style={{ fontSize: 30, fontWeight: 700, color: siteTokens.primary }}>{value}</div>
                <div style={{ fontSize: 14, color: siteTokens.textSoft, marginTop: 6 }}>{label}</div>
              </div>
            ))}
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16 }}>
            {services.slice(0, 3).map((item) => (
              <ServiceCard key={item.title} item={item} />
            ))}
          </section>
        </div>
      )}

      {page === "about" && (
        <div style={{ display: "grid", gap: 22 }}>
          <section style={{ background: siteTokens.white, border: `1px solid ${siteTokens.border}`, padding: 32, boxShadow: siteTokens.shadow }}>
            <div style={{ fontSize: 11, color: siteTokens.primary, letterSpacing: "0.12em", fontWeight: 700, marginBottom: 10 }}>ABOUT US</div>
            <h2 style={{ fontSize: 42, margin: "0 0 12px" }}>Warm care, modern dentistry, and a network patients can trust.</h2>
            <p style={{ fontSize: 16, color: siteTokens.textSoft, lineHeight: 1.8, maxWidth: 760 }}>
              {vault.brand.fullName} is a multi-branch clinic built around accessibility, reassurance, and long-term oral health. From walk-in checkups to specialist escalation, the clinic combines family-friendly care with modern equipment and broad insurance acceptance.
            </p>
          </section>
          <section style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 18 }}>
            <div style={{ background: siteTokens.white, border: `1px solid ${siteTokens.border}`, padding: 28, boxShadow: siteTokens.shadow }}>
              <h3 style={{ fontSize: 24, marginTop: 0 }}>What guides the clinic</h3>
              <div style={{ display: "grid", gap: 12 }}>
                {[
                  ["Respect", "Every patient concern is treated seriously and answered with clarity."],
                  ["Trust", "The team listens first, then informs with calm, practical guidance."],
                  ["Innovation", "Modern technology is used where it improves comfort and quality."],
                  ["Accountability", "Concerns are handled directly and escalated privately when needed."],
                ].map(([title, body]) => (
                  <div key={title} style={{ paddingBottom: 12, borderBottom: `1px solid ${siteTokens.border}` }}>
                    <div style={{ fontWeight: 600, marginBottom: 4 }}>{title}</div>
                    <div style={{ color: siteTokens.textSoft, lineHeight: 1.7, fontSize: 15 }}>{body}</div>
                  </div>
                ))}
              </div>
            </div>
            <div
              style={{
                background: `linear-gradient(180deg, ${siteTokens.beige} 0%, ${siteTokens.white} 100%)`,
                border: `1px solid ${siteTokens.border}`,
                padding: 28,
                boxShadow: siteTokens.shadow,
              }}
            >
              <h3 style={{ fontSize: 24, marginTop: 0 }}>Location network</h3>
              {branches.map((branch) => (
                <div key={branch.name} style={{ marginBottom: 14 }}>
                  <div style={{ fontWeight: 600 }}>{branch.name}</div>
                  <div style={{ color: siteTokens.textSoft, fontSize: 15 }}>{branch.address}</div>
                  <div style={{ color: siteTokens.textSoft, fontSize: 15 }}>{branch.floor}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}

      {page === "services" && (
        <div>
          <section style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: siteTokens.primary, letterSpacing: "0.12em", fontWeight: 700, marginBottom: 10 }}>SERVICES</div>
            <h2 style={{ fontSize: 42, margin: "0 0 12px" }}>Care for routine visits, urgent pain, and long-term smile goals.</h2>
            <p style={{ fontSize: 16, color: siteTokens.textSoft, lineHeight: 1.8, maxWidth: 760 }}>
              The website projection stays light and welcoming, while the content still comes from the same Ramani vault nodes used by the graph, content generation, and agent surfaces.
            </p>
          </section>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 16 }}>
            {services.map((item) => (
              <ServiceCard key={item.title} item={item} />
            ))}
          </section>
        </div>
      )}

      {page === "pricing" && (
        <div>
          <section style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: siteTokens.primary, letterSpacing: "0.12em", fontWeight: 700, marginBottom: 10 }}>PRICING</div>
            <h2 style={{ fontSize: 42, margin: "0 0 12px" }}>Transparent starting points with confirmation after assessment.</h2>
            <p style={{ fontSize: 16, color: siteTokens.textSoft, lineHeight: 1.8, maxWidth: 780 }}>
              Consultation is {pricing[0]?.price || "Ksh 1,000"}. For other services, the clinic uses starting-from pricing and confirms the final quote after clinical assessment.
            </p>
          </section>
          <div style={{ background: siteTokens.white, border: `1px solid ${siteTokens.border}`, boxShadow: siteTokens.shadow }}>
            {pricing.map((entry, index) => (
              <div
                key={entry.service}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: 14,
                  padding: "18px 22px",
                  background: index % 2 === 0 ? siteTokens.white : siteTokens.beigeSoft,
                  borderBottom: index < pricing.length - 1 ? `1px solid ${siteTokens.border}` : "none",
                }}
              >
                <div style={{ fontSize: 15 }}>{entry.service}</div>
                <div style={{ fontWeight: 600, color: siteTokens.primary }}>{entry.price}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {page === "reviews" && (
        <div>
          <section style={{ marginBottom: 22 }}>
            <div style={{ fontSize: 11, color: siteTokens.primary, letterSpacing: "0.12em", fontWeight: 700, marginBottom: 10 }}>REVIEWS</div>
            <h2 style={{ fontSize: 42, margin: "0 0 12px" }}>A standalone proof surface for the demo.</h2>
            <p style={{ fontSize: 16, color: siteTokens.textSoft, lineHeight: 1.8, maxWidth: 760 }}>
              This page exists separately because patient trust is a distinct projection from the vault, not just a subsection buried inside the homepage.
            </p>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 10, padding: "10px 14px", background: siteTokens.white, border: `1px solid ${siteTokens.border}` }}>
              <span style={{ fontSize: 28, fontWeight: 700, color: siteTokens.primary }}>4.9</span>
              <span style={{ color: siteTokens.textSoft }}>average patient sentiment snapshot</span>
            </div>
          </section>
          <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {reviews.map((review) => (
              <div key={review.author} style={{ background: siteTokens.white, border: `1px solid ${siteTokens.border}`, padding: 22, boxShadow: siteTokens.shadow }}>
                <div style={{ color: siteTokens.primary, marginBottom: 10 }}>{"*".repeat(review.rating)}</div>
                <div style={{ fontSize: 15, color: siteTokens.textSoft, lineHeight: 1.8, marginBottom: 14 }}>{review.text}</div>
                <div style={{ fontWeight: 600 }}>{review.author}</div>
                <div style={{ fontSize: 13, color: siteTokens.textSoft }}>{review.location}</div>
              </div>
            ))}
          </section>
        </div>
      )}

      {page === "book" && (
        <div>
          <section style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, color: siteTokens.primary, letterSpacing: "0.12em", fontWeight: 700, marginBottom: 10 }}>BOOK APPOINTMENT</div>
            <h2 style={{ fontSize: 42, margin: "0 0 12px" }}>Contact, location, and full intake in one page.</h2>
            <p style={{ fontSize: 16, color: siteTokens.textSoft, lineHeight: 1.8, maxWidth: 840 }}>
              Monday to Saturday {vault.hours.weekday}. Sunday {vault.hours.sunday}. This page combines contact details, map access, and the full appointment intake flow.
            </p>
          </section>

          <section style={{ display: "grid", gridTemplateColumns: "0.95fr 1.05fr", gap: 18, alignItems: "start" }}>
            <div style={{ display: "grid", gap: 16 }}>
              <div style={{ background: siteTokens.white, border: `1px solid ${siteTokens.border}`, padding: 24, boxShadow: siteTokens.shadow }}>
                <h3 style={{ marginTop: 0, fontSize: 24 }}>Reach the clinic</h3>
                <div style={{ color: siteTokens.textSoft, lineHeight: 1.8, fontSize: 15 }}>
                  <div><strong>WhatsApp:</strong> {vault.contact.whatsapp}</div>
                  <div><strong>Alternate:</strong> {vault.contact.alternate}</div>
                  <div><strong>Email:</strong> {vault.contact.email}</div>
                  <div><strong>Hours:</strong> Monday to Saturday {vault.hours.weekday}</div>
                  <div><strong>Sunday:</strong> {vault.hours.sunday}</div>
                </div>
              </div>

              {branches.map((branch) => (
                <div key={branch.name} style={{ background: siteTokens.white, border: `1px solid ${siteTokens.border}`, padding: 22, boxShadow: siteTokens.shadow }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 600 }}>{branch.name}</div>
                      <div style={{ color: siteTokens.textSoft, lineHeight: 1.7, marginTop: 6, fontSize: 15 }}>
                        {branch.address}
                        <br />
                        {branch.floor}
                      </div>
                    </div>
                    <a href={branch.map} target="_blank" rel="noreferrer" style={{ color: siteTokens.primary, fontWeight: 600, fontSize: 14, textDecoration: "none" }}>
                      Maps
                    </a>
                  </div>
                  <div
                    style={{
                      marginTop: 14,
                      background: `linear-gradient(135deg, ${siteTokens.beige} 0%, ${siteTokens.beigeDeep} 100%)`,
                      minHeight: 120,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      textAlign: "center",
                      padding: 18,
                      color: siteTokens.brown,
                      fontSize: 13,
                    }}
                  >
                    Map and imagery slot populated from the Ramani media vault.
                  </div>
                </div>
              ))}
            </div>

            <div style={{ background: siteTokens.white, border: `1px solid ${siteTokens.border}`, padding: 28, boxShadow: siteTokens.shadow }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline", marginBottom: 16 }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: 24 }}>Appointment intake form</h3>
                  <div style={{ color: siteTokens.textSoft, fontSize: 14, marginTop: 6 }}>Appointment requests are routed to the team for review.</div>
                </div>
                <div style={{ fontFamily: shellTokens.mono, fontSize: 11, color: siteTokens.primary }}>intake_flow</div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <FormField label="Full name" error={bookingErrors.fullName}>
                  <input value={bookingForm.fullName} onChange={(event) => handleBookingField("fullName", event.target.value)} style={siteInputStyle(Boolean(bookingErrors.fullName))} />
                </FormField>
                <FormField label="Phone / WhatsApp" error={bookingErrors.phone}>
                  <input value={bookingForm.phone} onChange={(event) => handleBookingField("phone", event.target.value)} style={siteInputStyle(Boolean(bookingErrors.phone))} />
                </FormField>
                <FormField label="Email">
                  <input value={bookingForm.email} onChange={(event) => handleBookingField("email", event.target.value)} style={siteInputStyle()} />
                </FormField>
                <FormField label="Patient type">
                  <select value={bookingForm.patientType} onChange={(event) => handleBookingField("patientType", event.target.value)} style={siteInputStyle()}>
                    <option>New Patient</option>
                    <option>Returning Patient</option>
                  </select>
                </FormField>
                <FormField label="Preferred branch">
                  <select value={bookingForm.branch} onChange={(event) => handleBookingField("branch", event.target.value)} style={siteInputStyle()}>
                    {branches.map((branch) => (
                      <option key={branch.name}>{branch.name}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Service" error={bookingErrors.service}>
                  <select value={bookingForm.service} onChange={(event) => handleBookingField("service", event.target.value)} style={siteInputStyle(Boolean(bookingErrors.service))}>
                    <option value="">Select service</option>
                    {bookingServices.map((service) => (
                      <option key={service}>{service}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Preferred date" error={bookingErrors.date}>
                  <input type="date" value={bookingForm.date} onChange={(event) => handleBookingField("date", event.target.value)} style={siteInputStyle(Boolean(bookingErrors.date))} />
                </FormField>
                <FormField label="Preferred time" error={bookingErrors.time}>
                  <select value={bookingForm.time} onChange={(event) => handleBookingField("time", event.target.value)} style={siteInputStyle(Boolean(bookingErrors.time))}>
                    <option value="">Select time</option>
                    {bookingTimes.map((timeOption) => (
                      <option key={timeOption}>{timeOption}</option>
                    ))}
                  </select>
                </FormField>
                <FormField label="Insurance">
                  <input value={bookingForm.insurance} onChange={(event) => handleBookingField("insurance", event.target.value)} placeholder="e.g. AAR, SHA/NHIF" style={siteInputStyle()} />
                </FormField>
                <FormField label="Notes">
                  <textarea value={bookingForm.notes} onChange={(event) => handleBookingField("notes", event.target.value)} style={siteTextareaStyle()} />
                </FormField>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", gap: 14, alignItems: "center", marginTop: 18, flexWrap: "wrap" }}>
                <button onClick={submitBookingForm} style={primarySiteButton()}>
                  Save appointment
                </button>
                {formNotice && <div style={{ fontSize: 14, color: siteTokens.success }}>{formNotice}</div>}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

function FormField({ label, error, children }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{ fontSize: 13, fontWeight: 600 }}>{label}</label>
      {children}
      <div style={{ minHeight: 18, fontSize: 12, color: siteTokens.error }}>{error || ""}</div>
    </div>
  )
}

function ServiceCard({ item }) {
  return (
    <div style={{ background: siteTokens.white, border: `1px solid ${siteTokens.border}`, padding: 28, boxShadow: siteTokens.shadow }}>
      <div style={{ width: 54, height: 54, borderRadius: 12, background: siteTokens.beige, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
        <IconMark name={item.icon} color={siteTokens.primary} />
      </div>
      <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>{item.title}</div>
      <div style={{ color: siteTokens.textSoft, lineHeight: 1.8, fontSize: 15 }}>{item.body}</div>
    </div>
  )
}

function IconMark({ name, color }) {
  if (name === "plus") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 5v14M5 12h14" stroke={color} strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === "spark") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === "shield") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 3l7 3v5c0 4.5-2.7 7.8-7 10-4.3-2.2-7-5.5-7-10V6l7-3Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      </svg>
    )
  }

  if (name === "smile") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
        <path d="M8.5 14.5c.8 1.2 2 1.8 3.5 1.8s2.7-.6 3.5-1.8" stroke={color} strokeWidth="2" strokeLinecap="round" />
        <path d="M9.5 10h.01M14.5 10h.01" stroke={color} strokeWidth="2.6" strokeLinecap="round" />
      </svg>
    )
  }

  if (name === "bolt") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M13 2 5 13h5l-1 9 8-11h-5l1-9Z" stroke={color} strokeWidth="2" strokeLinejoin="round" />
      </svg>
    )
  }

  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12h4l2 5 3-10 2 5h3" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ProjectedBookingForm({ draft, locations, serviceOptions, timeOptions, onClose, onSubmit }) {
  const [form, setForm] = useState({
    fullName: draft.fullName || "",
    phone: draft.phone || "",
    service: draft.service || "",
    date: draft.date || "",
    time: draft.time || "",
    branch: draft.branch || locations[0]?.name || "",
  })
  const [error, setError] = useState("")

  function updateField(key, value) {
    setForm((prev) => ({ ...prev, [key]: value }))
    setError("")
  }

  function submit() {
    if (!form.fullName.trim() || !form.phone.trim() || !form.service.trim() || !form.date.trim() || !form.time.trim()) {
      setError("Complete name, phone, service, date, and preferred time before saving.")
      return
    }
    onSubmit(form)
  }

  return (
    <div
      style={{
        width: "min(420px, 100%)",
        background: shellTokens.bgPanel,
        border: `1px solid ${shellTokens.border}`,
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 16px 32px rgba(107,61,22,0.10)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center", marginBottom: 12 }}>
        <div>
          <div style={{ fontFamily: shellTokens.mono, fontSize: 9, color: shellTokens.accent, marginBottom: 4 }}>PARTIAL PROJECTION</div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Appointment Form</div>
        </div>
        <button
          onClick={onClose}
          style={{
            border: `1px solid ${shellTokens.border}`,
            background: "transparent",
            color: shellTokens.muted,
            borderRadius: 999,
            padding: "4px 10px",
            cursor: "pointer",
            fontFamily: shellTokens.mono,
            fontSize: 10,
          }}
        >
          close
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        <div style={{ gridColumn: "1 / -1" }}>
          <div style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.muted, marginBottom: 6 }}>Name</div>
          <input value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} style={shellInputStyle()} />
        </div>
        <div>
          <div style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.muted, marginBottom: 6 }}>Phone</div>
          <input value={form.phone} onChange={(event) => updateField("phone", event.target.value)} style={shellInputStyle()} />
        </div>
        <div>
          <div style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.muted, marginBottom: 6 }}>Branch</div>
          <select value={form.branch} onChange={(event) => updateField("branch", event.target.value)} style={shellInputStyle()}>
            {locations.map((branch) => (
              <option key={branch.name}>{branch.name}</option>
            ))}
          </select>
        </div>
        <div style={{ gridColumn: "1 / -1" }}>
          <div style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.muted, marginBottom: 6 }}>Service</div>
          <select value={form.service} onChange={(event) => updateField("service", event.target.value)} style={shellInputStyle()}>
            <option value="">Select service</option>
            {serviceOptions.map((service) => (
              <option key={service}>{service}</option>
            ))}
          </select>
        </div>
        <div>
          <div style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.muted, marginBottom: 6 }}>Date</div>
          <input type="date" value={form.date} onChange={(event) => updateField("date", event.target.value)} style={shellInputStyle()} />
        </div>
        <div>
          <div style={{ fontFamily: shellTokens.mono, fontSize: 10, color: shellTokens.muted, marginBottom: 6 }}>Preferred time</div>
          <select value={form.time} onChange={(event) => updateField("time", event.target.value)} style={shellInputStyle()}>
            <option value="">Select time</option>
            {timeOptions.map((timeOption) => (
              <option key={timeOption}>{timeOption}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div style={{ marginTop: 10, color: shellTokens.red, fontSize: 12 }}>{error}</div>}

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        <button
          onClick={submit}
          style={{
            flex: 1,
            border: "none",
            borderRadius: 10,
            padding: "11px 14px",
            background: shellTokens.green,
            color: "#fff",
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: shellTokens.sans,
          }}
        >
          Save appointment
        </button>
        <button
          onClick={onClose}
          style={{
            borderRadius: 10,
            padding: "11px 14px",
            background: "transparent",
            color: shellTokens.text,
            border: `1px solid ${shellTokens.border}`,
            cursor: "pointer",
            fontFamily: shellTokens.sans,
          }}
        >
          Exit
        </button>
      </div>
    </div>
  )
}
