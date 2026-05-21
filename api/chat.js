const OPENROUTER_MODEL = "mistralai/ministral-14b-2512"

function parseBody(body) {
  if (!body) {
    return {}
  }
  if (typeof body === "string") {
    try {
      return JSON.parse(body)
    } catch {
      return {}
    }
  }
  return body
}

function readVault(body) {
  return body?.vault && typeof body.vault === "object" ? body.vault : null
}

function isPriceQuestion(text) {
  return /\b(price|pricing|cost|charges|fee|how much)\b/i.test(text || "")
}

function getConsultationPrice(vault) {
  return vault?.pricing?.find((entry) => String(entry.service).toLowerCase() === "consultation")?.price || "Ksh 1,000"
}

function getConsultationOfferText(vault) {
  return `Consultation is ${getConsultationPrice(vault)} and includes oral examination and X-ray.`
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

async function readJsonSafe(response) {
  const raw = await response.text()
  if (!raw) {
    return {}
  }

  try {
    return JSON.parse(raw)
  } catch {
    return { error: { message: raw } }
  }
}

async function callOpenRouter({ apiKey, origin, messages }) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": origin,
      "X-Title": "Ramani OS Demo",
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages,
      stream: false,
    }),
  })

  const data = await readJsonSafe(response)
  if (!response.ok) {
    return {
      ok: false,
      error: data?.error?.message || data?.message || "Agent request failed",
    }
  }

  return {
    ok: true,
    reply: data?.choices?.[0]?.message?.content || "I could not generate a reply.",
    model: OPENROUTER_MODEL,
  }
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST")
    return res.status(405).json({ error: "Method not allowed" })
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: "Missing OPENROUTER_API_KEY on the server." })
  }

  const body = parseBody(req.body)
  const vault = readVault(body)
  const origin = req.headers.origin || `https://${req.headers.host || "localhost"}`

  if (!vault) {
    return res.status(400).json({ error: "Request must include the current vault state." })
  }

  const mode = body?.mode || "agent"

  if (mode === "content-gen") {
    const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : ""
    const platform = typeof body?.platform === "string" ? body.platform.trim() : "Website"
    const tone = typeof body?.tone === "string" ? body.tone.trim() : "Warm and professional"

    if (!prompt) {
      return res.status(400).json({ error: "Content generation requires a prompt." })
    }

    const result = await callOpenRouter({
      apiKey,
      origin,
      messages: [
        { role: "system", content: buildContentSystemPrompt(vault) },
        { role: "user", content: `Platform: ${platform}\nTone: ${tone}\nRequest: ${prompt}` },
      ],
    })

    if (!result.ok) {
      return res.status(502).json({ error: result.error })
    }

    return res.status(200).json({ reply: result.reply, model: result.model })
  }

  const messages = Array.isArray(body?.messages) ? body.messages : null
  if (!messages || messages.length === 0) {
    return res.status(400).json({ error: "Request must include a non-empty messages array." })
  }

  const latestUserMessage = [...messages].reverse().find((message) => message.role === "user")?.content || ""
  const result = await callOpenRouter({
    apiKey,
    origin,
    messages: [{ role: "system", content: buildAgentSystemPrompt(vault, latestUserMessage) }, ...messages],
  })

  if (!result.ok) {
    return res.status(502).json({ error: result.error })
  }

  return res.status(200).json({ reply: result.reply, model: result.model })
}
