import { useEffect, useMemo, useRef, useState } from "react"

const tokens = {
  bg: "#080810",
  bgSurface: "#0a0a14",
  bgCard: "#0f0f1a",
  border: "rgba(255,255,255,0.06)",
  text: "#dddbe8",
  textMuted: "#6b6880",
  hot: "#ff7055",
  warm: "#ffaa44",
  cold: "#5599ff",
  accent: "#9b8fff",
  success: "#44cc88",
  fontHead: "'Syne', sans-serif",
  fontMono: "'DM Mono', monospace",
}

const NODES = [
  { id: "brand", label: "Brand identity", temp: "hot", x: 330, y: 200, desc: "Sharpening Smiles. Touching Lives." },
  { id: "trust", label: "Patient trust", temp: "hot", x: 510, y: 115, desc: "15 years, 30+ staff, 150,000+ patients served." },
  { id: "treatments", label: "Treatments", temp: "hot", x: 148, y: 115, desc: "General, cosmetic, restorative, and pediatric care." },
  { id: "team", label: "Clinical team", temp: "warm", x: 565, y: 285, desc: "30+ dental professionals across CBD and Thika branches." },
  { id: "pricing", label: "Pricing", temp: "warm", x: 95, y: 285, desc: "Transparent pricing, payment plans for braces and implants." },
  { id: "booking", label: "Booking", temp: "warm", x: 378, y: 338, desc: "WhatsApp-first booking with 5 minute confirmation target." },
  { id: "location", label: "Location", temp: "cold", x: 190, y: 400, desc: "Nairobi CBD, Thika Road, and Thika Town branches." },
  { id: "insurance", label: "Insurance", temp: "cold", x: 505, y: 400, desc: "SHA/NHIF, AAR, APA, CIC, Britam, UAP, and more." },
]

const HYPEREDGES = [
  { id: "patient_journey", label: "patient_journey", nodes: ["trust", "treatments", "booking", "pricing"], color: tokens.accent },
  { id: "brand_voice", label: "brand_voice", nodes: ["brand", "trust", "team"], color: tokens.hot },
  { id: "intake_flow", label: "intake_flow", nodes: ["booking", "location", "insurance", "pricing"], color: tokens.success },
]

const WORKFLOW_SCHEMA = [
  {
    step: 1,
    sourceNode: "treatments",
    label: "What brings you in?",
    type: "select",
    required: true,
    options: [
      "Check-up or cleaning",
      "Toothache or pain",
      "Braces or smile alignment",
      "Whitening or veneers",
      "Missing tooth or implant",
      "Child dental visit",
      "Other",
    ],
  },
  {
    step: 2,
    sourceNode: "trust",
    label: "Your name",
    sublabel: "How should the clinic address you?",
    type: "text",
    key: "name",
    placeholder: "Full name",
    required: true,
  },
  {
    step: 3,
    sourceNode: "booking",
    label: "Best way to reach you",
    type: "contact",
    required: true,
    fields: [
      { key: "phone", placeholder: "Phone or WhatsApp", type: "tel", required: true },
      { key: "email", placeholder: "Email (optional)", type: "email", required: false },
    ],
  },
  {
    step: 4,
    sourceNode: "insurance",
    label: "Do you have cover?",
    sublabel: "We can confirm your specific plan before the visit.",
    type: "radio",
    required: false,
    options: ["SHA or NHIF", "AAR", "APA", "Britam", "CIC", "UAP", "Other provider", "No cover"],
  },
  {
    step: 5,
    sourceNode: "booking",
    label: "Preferred appointment slot",
    type: "slot",
    required: true,
    options: ["Weekday morning", "Weekday afternoon", "Saturday", "Sunday"],
  },
]

const SITE_NAV = [
  { id: "home", label: "Home", src: "brand, trust" },
  { id: "treatments", label: "Treatments", src: "treatments" },
  { id: "team", label: "Our team", src: "team" },
  { id: "pricing", label: "Pricing", src: "pricing" },
  { id: "book", label: "Book now", src: "booking, location" },
]

const TABS = [
  { id: "graph", label: "Graph" },
  { id: "website", label: "Website" },
  { id: "workflow", label: "Workflow" },
  { id: "agent", label: "Agent" },
]

const SURFACE_LABELS = {
  graph: "hypergraph substrate",
  website: "project_nav() -> 5 pages",
  workflow: "project_workflow(intake_flow)",
  agent: "project_agent() -> public light cone",
}

const TEMP_COLOR = { hot: tokens.hot, warm: tokens.warm, cold: tokens.cold }
const TEMP_SIZE = { hot: 22, warm: 16, cold: 12 }

async function callAgent(messages) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages,
    }),
  })

  const data = await response.json()
  if (!response.ok) {
    throw new Error(data?.error || "Agent request failed")
  }

  return data?.reply || "I could not generate a reply."
}

function hull(ids) {
  const points = ids.map((id) => NODES.find((node) => node.id === id))
  const cx = points.reduce((sum, point) => sum + point.x, 0) / points.length
  const cy = points.reduce((sum, point) => sum + point.y, 0) / points.length
  return [...points]
    .sort((a, b) => Math.atan2(a.y - cy, a.x - cx) - Math.atan2(b.y - cy, b.x - cx))
    .map((point) => {
      const dx = point.x - cx
      const dy = point.y - cy
      const length = Math.sqrt(dx * dx + dy * dy) || 1
      return `${point.x + (dx / length) * 30},${point.y + (dy / length) * 30}`
    })
    .join(" ")
}

function sourceChipStyle(active) {
  return {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 10px",
    borderRadius: 999,
    border: `1px solid ${active ? "rgba(155,143,255,0.24)" : "rgba(255,255,255,0.08)"}`,
    background: active ? "rgba(155,143,255,0.08)" : tokens.bgCard,
    color: active ? tokens.text : "#908aa9",
    fontFamily: tokens.fontMono,
    fontSize: 10,
  }
}

function optionButtonStyle(active) {
  return {
    padding: "12px 14px",
    borderRadius: 10,
    border: `1px solid ${active ? "rgba(155,143,255,0.28)" : "rgba(255,255,255,0.08)"}`,
    background: active ? "rgba(155,143,255,0.12)" : tokens.bgCard,
    color: active ? tokens.text : "#9d98b1",
    cursor: "pointer",
    textAlign: "left",
    fontFamily: tokens.fontHead,
    fontSize: 14,
    lineHeight: 1.45,
    boxShadow: active ? "0 0 0 1px rgba(155,143,255,0.1), 0 16px 40px rgba(155,143,255,0.08)" : "none",
  }
}

function inputStyle() {
  return {
    width: "100%",
    padding: "12px 14px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.1)",
    background: "#121221",
    color: tokens.text,
    fontFamily: tokens.fontHead,
    fontSize: 14,
    outline: "none",
  }
}

function cardStyle() {
  return {
    background: tokens.bgCard,
    border: `1px solid ${tokens.border}`,
    borderRadius: 14,
    boxShadow: "0 18px 50px rgba(0,0,0,0.22)",
  }
}

export default function RamaniDemo() {
  const [view, setView] = useState("graph")
  const [page, setPage] = useState("home")
  const [hoveredNode, setHoveredNode] = useState(null)
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [workflowError, setWorkflowError] = useState("")
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hi! I am the Arrow Dental assistant. Ask me about treatments, pricing, branches, or how to book.",
    },
  ])
  const [chatInput, setChatInput] = useState("")
  const [chatLoading, setChatLoading] = useState(false)
  const chatEndRef = useRef(null)

  useEffect(() => {
    const styleTag = document.createElement("style")
    styleTag.textContent = "@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700&family=DM+Mono:wght@300;400;500&display=swap');*{box-sizing:border-box;margin:0;padding:0}body{background:#080810;color:#dddbe8}"
    document.head.appendChild(styleTag)
    return () => document.head.removeChild(styleTag)
  }, [])

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, chatLoading])

  const activeStep = WORKFLOW_SCHEMA[currentStep]
  const progress = submitted ? 100 : ((currentStep + 1) / WORKFLOW_SCHEMA.length) * 100
  const nodeById = useMemo(() => {
    const map = {}
    NODES.forEach((node) => {
      map[node.id] = node
    })
    return map
  }, [])

  function setFieldValue(key, value) {
    setFormData((prev) => ({ ...prev, [key]: value }))
    setWorkflowError("")
  }

  function readStepValue(step) {
    if (step.type === "contact") {
      const phone = formData.phone || ""
      const email = formData.email || ""
      return [phone, email].filter(Boolean).join(" | ")
    }
    const key = step.key || step.sourceNode
    return formData[key] || ""
  }

  function validateStep(step) {
    if (!step.required) {
      return true
    }
    if (step.type === "contact") {
      return Boolean((formData.phone || "").trim())
    }
    const key = step.key || step.sourceNode
    return Boolean(String(formData[key] || "").trim())
  }

  function goNext() {
    if (!validateStep(activeStep)) {
      setWorkflowError("Please complete this step before continuing.")
      return
    }
    if (currentStep === WORKFLOW_SCHEMA.length - 1) {
      setSubmitted(true)
      return
    }
    setCurrentStep((prev) => prev + 1)
    setWorkflowError("")
  }

  function resetWorkflow() {
    setCurrentStep(0)
    setFormData({})
    setSubmitted(false)
    setWorkflowError("")
  }

  async function sendChat() {
    const value = chatInput.trim()
    if (!value || chatLoading) {
      return
    }

    const nextUserMessage = { role: "user", content: value }
    const visibleHistory = [...messages, nextUserMessage]

    setMessages(visibleHistory)
    setChatInput("")
    setChatLoading(true)

    try {
      const reply = await callAgent(visibleHistory)
      setMessages((prev) => [...prev, { role: "assistant", content: reply }])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: error.message || "The agent request failed. Please try again.",
        },
      ])
    } finally {
      setChatLoading(false)
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "radial-gradient(circle at top, rgba(155,143,255,0.12), transparent 30%), linear-gradient(180deg, #090913 0%, #080810 100%)",
        color: tokens.text,
        fontFamily: tokens.fontHead,
      }}
    >
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          borderBottom: `1px solid ${tokens.border}`,
          background: "rgba(10,10,20,0.92)",
          backdropFilter: "blur(10px)",
        }}
      >
        <div style={{ padding: "14px 24px", display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontWeight: 700, fontSize: 16, letterSpacing: "-0.03em" }}>Ramani OS</span>
            <span style={{ fontFamily: tokens.fontMono, fontSize: 10, color: tokens.textMuted }}>arrow-dental-vault</span>
          </div>
          <div style={{ marginLeft: "auto", display: "flex", gap: 6, flexWrap: "wrap" }}>
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setView(tab.id)}
                style={{
                  padding: "7px 14px",
                  borderRadius: 999,
                  border: "none",
                  cursor: "pointer",
                  fontFamily: tokens.fontHead,
                  fontSize: 13,
                  fontWeight: 600,
                  background: view === tab.id ? tokens.accent : "transparent",
                  color: view === tab.id ? "#fff" : "#8b87a0",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            padding: "7px 24px",
            borderTop: "1px solid rgba(255,255,255,0.04)",
            display: "flex",
            gap: 8,
            alignItems: "center",
          }}
        >
          <span style={{ fontFamily: tokens.fontMono, fontSize: 10, color: "#4a4860" }}>surface -&gt;</span>
          <span style={{ fontFamily: tokens.fontMono, fontSize: 10, color: tokens.accent }}>{SURFACE_LABELS[view]}</span>
        </div>
      </div>

      {view === "graph" && (
        <div style={{ padding: 24 }}>
          <div style={{ ...cardStyle(), padding: 20 }}>
            <svg width="100%" viewBox="0 0 660 450" style={{ display: "block", maxHeight: 460 }}>
              {HYPEREDGES.map((edge) => (
                <polygon
                  key={edge.id}
                  points={hull(edge.nodes)}
                  fill={edge.color}
                  fillOpacity={0.07}
                  stroke={edge.color}
                  strokeOpacity={0.22}
                  strokeWidth={1}
                  strokeDasharray="5 4"
                />
              ))}
              {HYPEREDGES.map((edge) =>
                edge.nodes.flatMap((a, index) =>
                  edge.nodes.slice(index + 1).map((b) => (
                    <line
                      key={`${edge.id}-${a}-${b}`}
                      x1={nodeById[a].x}
                      y1={nodeById[a].y}
                      x2={nodeById[b].x}
                      y2={nodeById[b].y}
                      stroke={edge.color}
                      strokeOpacity={0.16}
                      strokeWidth={1}
                    />
                  )),
                ),
              )}
              {NODES.map((node) => {
                const hovered = hoveredNode === node.id
                const radius = TEMP_SIZE[node.temp]
                const color = TEMP_COLOR[node.temp]
                return (
                  <g
                    key={node.id}
                    style={{ cursor: "pointer" }}
                    onMouseEnter={() => setHoveredNode(node.id)}
                    onMouseLeave={() => setHoveredNode(null)}
                  >
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r={radius + (hovered ? 7 : 0)}
                      fill={color}
                      fillOpacity={hovered ? 0.22 : 0.1}
                      stroke={color}
                      strokeWidth={1.5}
                      strokeOpacity={hovered ? 0.9 : 0.5}
                      style={{ transition: "all 0.15s" }}
                    />
                    <circle cx={node.x} cy={node.y} r={4} fill={color} opacity={0.9} />
                    <text x={node.x} y={node.y - radius - 8} textAnchor="middle" fill="#c0bed0" style={{ fontSize: 11, fontFamily: tokens.fontMono }}>
                      {node.label}
                    </text>
                    {hovered && (
                      <text x={node.x} y={node.y + radius + 16} textAnchor="middle" fill={tokens.accent} style={{ fontSize: 10, fontFamily: tokens.fontMono }}>
                        {node.desc}
                      </text>
                    )}
                  </g>
                )
              })}
              {HYPEREDGES.map((edge) => {
                const points = edge.nodes.map((id) => nodeById[id])
                const cx = points.reduce((sum, point) => sum + point.x, 0) / points.length
                const cy = points.reduce((sum, point) => sum + point.y, 0) / points.length
                return (
                  <text key={edge.id} x={cx} y={cy} textAnchor="middle" fill={edge.color} opacity={0.6} style={{ fontSize: 10, fontFamily: tokens.fontMono }}>
                    {edge.label}
                  </text>
                )
              })}
            </svg>

            <div style={{ display: "flex", gap: 20, flexWrap: "wrap", paddingTop: 12, borderTop: `1px solid ${tokens.border}`, marginTop: 10 }}>
              {Object.entries(TEMP_COLOR).map(([temp, color]) => (
                <div key={temp} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 8, height: 8, borderRadius: "50%", background: color }} />
                  <span style={{ fontFamily: tokens.fontMono, fontSize: 11, color: tokens.textMuted }}>{temp} node</span>
                </div>
              ))}
              {HYPEREDGES.map((edge) => (
                <div key={edge.id} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <div style={{ width: 18, borderTop: `2px dashed ${edge.color}` }} />
                  <span style={{ fontFamily: tokens.fontMono, fontSize: 11, color: tokens.textMuted }}>{edge.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {view === "website" && (
        <div style={{ display: "flex", minHeight: "calc(100vh - 92px)" }}>
          <aside
            style={{
              width: 212,
              borderRight: `1px solid ${tokens.border}`,
              padding: "18px 0",
              background: tokens.bgSurface,
              flexShrink: 0,
            }}
          >
            <div style={{ padding: "0 16px 14px", borderBottom: `1px solid ${tokens.border}`, marginBottom: 6 }}>
              <div style={{ fontWeight: 700, color: tokens.hot, marginBottom: 4 }}>Arrow Dental Centre</div>
              <div style={{ fontFamily: tokens.fontMono, fontSize: 10, color: tokens.textMuted }}>multi-branch | Nairobi CBD + Thika</div>
            </div>

            {SITE_NAV.map((item) => (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "10px 16px",
                  background: page === item.id ? "rgba(155,143,255,0.09)" : "transparent",
                  borderTop: "none",
                  borderRight: "none",
                  borderBottom: "none",
                  borderLeft: page === item.id ? `2px solid ${tokens.accent}` : "2px solid transparent",
                  cursor: "pointer",
                  textAlign: "left",
                }}
              >
                <div style={{ fontSize: 13, color: page === item.id ? tokens.text : "#7a7890", fontWeight: page === item.id ? 600 : 400 }}>
                  {item.label}
                </div>
                <div style={{ fontFamily: tokens.fontMono, fontSize: 9, color: "#4a4860", marginTop: 2 }}>
                  {"<- "}
                  {item.src}
                </div>
              </button>
            ))}
          </aside>

          <main style={{ flex: 1, padding: "34px 42px", overflowY: "auto" }}>
            {page === "home" && <WebHome onBook={() => setPage("book")} onTreatments={() => setPage("treatments")} />}
            {page === "treatments" && <WebTreatments />}
            {page === "team" && <WebTeam />}
            {page === "pricing" && <WebPricing />}
            {page === "book" && <WebBook />}
          </main>
        </div>
      )}

      {view === "workflow" && (
        <div style={{ padding: "28px 24px", maxWidth: 760, margin: "0 auto" }}>
          <div style={{ marginBottom: 18 }}>
            <h2 style={{ fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 6 }}>Vault-generated intake flow</h2>
            <div style={{ fontFamily: tokens.fontMono, fontSize: 11, color: tokens.accent }}>project_workflow(intake_flow)</div>
          </div>

          <div style={{ ...cardStyle(), padding: 18, marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
              <span style={{ fontFamily: tokens.fontMono, fontSize: 11, color: tokens.textMuted }}>
                step {submitted ? WORKFLOW_SCHEMA.length : currentStep + 1} of {WORKFLOW_SCHEMA.length}
              </span>
              <span style={{ fontFamily: tokens.fontMono, fontSize: 11, color: tokens.accent }}>crystallised from intake_flow</span>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div
                style={{
                  width: `${progress}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #9b8fff 0%, #ff7055 100%)",
                  transition: "width 0.24s ease",
                }}
              />
            </div>
          </div>

          {!submitted && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
              {WORKFLOW_SCHEMA.slice(0, currentStep)
                .filter((step) => readStepValue(step))
                .map((step) => (
                  <div key={step.step} style={sourceChipStyle(false)}>
                    <span style={{ color: "#b9b5ca" }}>{step.label}:</span>
                    <span>{readStepValue(step)}</span>
                  </div>
                ))}
            </div>
          )}

          {!submitted ? (
            <div
              style={{
                ...cardStyle(),
                padding: 24,
                border: "1px solid rgba(155,143,255,0.28)",
                boxShadow: "0 0 0 1px rgba(155,143,255,0.06), 0 18px 50px rgba(155,143,255,0.08)",
              }}
            >
              <div style={{ marginBottom: 22 }}>
                <div style={{ fontFamily: tokens.fontMono, fontSize: 10, color: tokens.accent, marginBottom: 8 }}>
                  source: {activeStep.sourceNode}
                </div>
                <h3 style={{ fontSize: 24, lineHeight: 1.15, letterSpacing: "-0.03em", marginBottom: activeStep.sublabel ? 8 : 0 }}>
                  {activeStep.label}
                </h3>
                {activeStep.sublabel && <p style={{ fontSize: 14, color: "#8f8aa4", lineHeight: 1.6 }}>{activeStep.sublabel}</p>}
              </div>

              <WorkflowStep step={activeStep} formData={formData} setFieldValue={setFieldValue} />

              {workflowError && <div style={{ marginTop: 14, fontSize: 13, color: tokens.hot }}>{workflowError}</div>}

              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 22 }}>
                <button
                  onClick={() => {
                    setCurrentStep((prev) => Math.max(prev - 1, 0))
                    setWorkflowError("")
                  }}
                  disabled={currentStep === 0}
                  style={{
                    padding: "11px 18px",
                    borderRadius: 10,
                    border: `1px solid ${tokens.border}`,
                    background: "transparent",
                    color: currentStep === 0 ? "#55536a" : tokens.text,
                    cursor: currentStep === 0 ? "not-allowed" : "pointer",
                    fontFamily: tokens.fontHead,
                    fontSize: 14,
                  }}
                >
                  Back
                </button>
                <button
                  onClick={goNext}
                  style={{
                    padding: "11px 18px",
                    borderRadius: 10,
                    border: "none",
                    background: currentStep === WORKFLOW_SCHEMA.length - 1 ? tokens.hot : tokens.accent,
                    color: "#fff",
                    cursor: "pointer",
                    fontFamily: tokens.fontHead,
                    fontSize: 14,
                    fontWeight: 600,
                  }}
                >
                  {currentStep === WORKFLOW_SCHEMA.length - 1 ? "Submit" : "Next"}
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{
                ...cardStyle(),
                padding: 24,
                border: "1px solid rgba(68,204,136,0.32)",
                background: "linear-gradient(180deg, rgba(68,204,136,0.08), rgba(15,15,26,1))",
              }}
            >
              <div style={{ fontFamily: tokens.fontMono, fontSize: 10, color: tokens.success, marginBottom: 10 }}>
                crystallised from intake_flow hyperedge
              </div>
              <h3 style={{ fontSize: 26, letterSpacing: "-0.03em", marginBottom: 8 }}>Intake captured.</h3>
              <p style={{ fontSize: 14, color: "#a19cb5", lineHeight: 1.7, marginBottom: 18 }}>
                {formData.name || "Patient"} is enquiring about {formData.treatments || "treatment"} and prefers the {formData.booking || "selected"} slot.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10, marginBottom: 16 }}>
                {[
                  ["Patient", formData.name || "-"],
                  ["Treatment", formData.treatments || "-"],
                  ["Contact", formData.phone || "-"],
                  ["Slot", formData.booking || "-"],
                ].map(([label, value]) => (
                  <div key={label} style={{ ...cardStyle(), padding: 14 }}>
                    <div style={{ fontFamily: tokens.fontMono, fontSize: 10, color: tokens.textMuted, marginBottom: 6 }}>{label}</div>
                    <div style={{ fontSize: 15, color: tokens.text }}>{value}</div>
                  </div>
                ))}
              </div>
              <button
                onClick={resetWorkflow}
                style={{
                  border: "none",
                  background: "transparent",
                  color: tokens.accent,
                  cursor: "pointer",
                  padding: 0,
                  fontFamily: tokens.fontMono,
                  fontSize: 11,
                }}
              >
                reset flow
              </button>
            </div>
          )}
        </div>
      )}

      {view === "agent" && (
        <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 92px)", maxWidth: 720, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ flex: 1, overflowY: "auto", padding: "20px 0", display: "flex", flexDirection: "column", gap: 10 }}>
            {messages.map((message, index) => (
              <div key={`${message.role}-${index}`} style={{ display: "flex", justifyContent: message.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 6 }}>
                {message.role === "assistant" && <span style={{ fontFamily: tokens.fontMono, fontSize: 9, color: tokens.accent, marginBottom: 2, flexShrink: 0 }}>agent</span>}
                <div
                  style={{
                    maxWidth: "80%",
                    padding: "11px 14px",
                    lineHeight: 1.6,
                    fontSize: 14,
                    borderRadius: message.role === "user" ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                    background: message.role === "user" ? tokens.accent : tokens.bgCard,
                    color: "#fff",
                    border: message.role === "assistant" ? `1px solid ${tokens.border}` : "none",
                  }}
                >
                  {message.content}
                </div>
              </div>
            ))}

            {chatLoading && (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
                <span style={{ fontFamily: tokens.fontMono, fontSize: 9, color: tokens.accent, marginBottom: 2 }}>agent</span>
                <div style={{ padding: "10px 14px", borderRadius: "14px 14px 14px 4px", background: tokens.bgCard, border: `1px solid ${tokens.border}`, display: "flex", gap: 4, alignItems: "center" }}>
                  {[0, 1, 2].map((dot) => (
                    <div
                      key={dot}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: tokens.accent,
                        animationName: "dot",
                        animationDuration: "1.2s",
                        animationDelay: `${dot * 0.2}s`,
                        animationTimingFunction: "ease-in-out",
                        animationIterationCount: "infinite",
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          <div style={{ padding: "14px 0 20px", borderTop: `1px solid ${tokens.border}`, display: "flex", gap: 8 }}>
            <input
              value={chatInput}
              onChange={(event) => setChatInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  sendChat()
                }
              }}
              disabled={chatLoading}
              placeholder="Ask about treatments, pricing, opening hours, or branches..."
              style={inputStyle()}
            />
            <button
              onClick={sendChat}
              disabled={chatLoading || !chatInput.trim()}
              style={{
                padding: "10px 18px",
                borderRadius: 10,
                border: "none",
                background: chatLoading || !chatInput.trim() ? "#2a2a3a" : tokens.accent,
                color: chatLoading || !chatInput.trim() ? "#6b6880" : "#fff",
                cursor: chatLoading || !chatInput.trim() ? "not-allowed" : "pointer",
                fontFamily: tokens.fontHead,
                fontSize: 14,
                fontWeight: 600,
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}

      <style>{`@keyframes dot{0%,100%{opacity:.2}50%{opacity:1}}`}</style>
    </div>
  )
}

function WorkflowStep({ step, formData, setFieldValue }) {
  if (step.type === "text") {
    return (
      <input
        value={formData[step.key || step.sourceNode] || ""}
        onChange={(event) => setFieldValue(step.key || step.sourceNode, event.target.value)}
        placeholder={step.placeholder}
        style={inputStyle()}
      />
    )
  }

  if (step.type === "contact") {
    return (
      <div style={{ display: "grid", gap: 10 }}>
        {step.fields.map((field) => (
          <input
            key={field.key}
            type={field.type}
            value={formData[field.key] || ""}
            onChange={(event) => setFieldValue(field.key, event.target.value)}
            placeholder={field.placeholder}
            style={inputStyle()}
          />
        ))}
      </div>
    )
  }

  if (step.type === "slot") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: 10 }}>
        {step.options.map((option) => (
          <button key={option} onClick={() => setFieldValue(step.sourceNode, option)} style={optionButtonStyle(formData[step.sourceNode] === option)}>
            {option}
          </button>
        ))}
      </div>
    )
  }

  if (step.type === "select" || step.type === "radio") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
        {step.options.map((option) => (
          <button key={option} onClick={() => setFieldValue(step.sourceNode, option)} style={optionButtonStyle(formData[step.sourceNode] === option)}>
            {option}
          </button>
        ))}
      </div>
    )
  }

  return null
}

function WebHome({ onBook, onTreatments }) {
  return (
    <div>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: tokens.fontMono, fontSize: 10, color: tokens.accent, letterSpacing: "0.08em", marginBottom: 12 }}>
          ARROW DENTAL CENTRE | MULTI-BRANCH KENYA
        </div>
        <h1 style={{ fontSize: 42, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1.04, marginBottom: 14, color: "#eeedf5" }}>
          Sharpening Smiles.
          <br />
          Touching Lives.
        </h1>
        <p style={{ fontSize: 15, color: "#8a8799", lineHeight: 1.7, maxWidth: 560, marginBottom: 24 }}>
          Walk-in friendly dental care across Nairobi CBD, Thika Road, and Thika Town. Modern treatment, wide insurance acceptance, and a warm team built for routine care, pain relief, and long-term smile confidence.
        </p>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={onBook} style={{ padding: "11px 22px", borderRadius: 10, border: "none", background: tokens.hot, color: "#fff", fontFamily: tokens.fontHead, fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
            WhatsApp to book
          </button>
          <button onClick={onTreatments} style={{ padding: "11px 22px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.12)", background: "transparent", color: tokens.text, fontFamily: tokens.fontHead, fontSize: 14, cursor: "pointer" }}>
            Explore treatments
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
        {[
          ["15 years", "in practice"],
          ["30+", "dental professionals"],
          ["150,000+", "patients served"],
          ["4 clinics", "across CBD and Thika"],
        ].map(([value, label]) => (
          <div key={value} style={{ ...cardStyle(), padding: "18px 20px" }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: tokens.hot, letterSpacing: "-0.03em" }}>{value}</div>
            <div style={{ fontSize: 13, color: tokens.textMuted, marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WebTreatments() {
  const items = [
    ["General dentistry", "Fillings, extractions, full mouth cleaning, and root canals with walk-in availability."],
    ["Cosmetic dentistry", "Braces, veneers, and whitening for patients looking to improve smile aesthetics."],
    ["Restorative dentistry", "Implants, crowns, bridges, dentures, and gum disease treatment."],
    ["Pediatric care", "Gentle, educational, fear-free dental care for children aged 2 to 16."],
    ["Pain relief visits", "Same-day assessment for toothache, swelling, and urgent discomfort."],
    ["Long-term care plans", "Treatment planning, follow-up care, and payment options for higher-ticket procedures."],
  ]

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 6 }}>Treatments</h2>
      <p style={{ fontSize: 14, color: tokens.textMuted, marginBottom: 24 }}>Full-service care aligned to the services, voice, and conversion rules in the vault.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
        {items.map(([name, description], index) => (
          <div key={name} style={{ ...cardStyle(), padding: "16px 18px" }}>
            <div style={{ width: 28, height: 28, borderRadius: 999, background: "rgba(155,143,255,0.12)", display: "flex", alignItems: "center", justifyContent: "center", color: tokens.accent, fontFamily: tokens.fontMono, fontSize: 11, marginBottom: 10 }}>
              0{index + 1}
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{name}</div>
            <div style={{ fontSize: 13, color: tokens.textMuted, lineHeight: 1.55 }}>{description}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WebTeam() {
  const teamCards = [
    ["30+ dental professionals", "Arrow Dental's clinical team spans dentists, support staff, and patient care teams serving Nairobi CBD, Thika Road, and Thika Town."],
    ["Generalists and specialists", "Patients can start at the main clinic and escalate to specialist care within the network when a procedure needs deeper expertise or follow-up."],
    ["Trust-led patient care", "The team operates with modern equipment, Kenya Dental Council licensing, and strict infection control protocols built around comfort and reassurance."],
  ]

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 6 }}>Our team</h2>
      <p style={{ fontSize: 14, color: tokens.textMuted, marginBottom: 24 }}>A multi-branch clinical team designed to handle routine visits, specialist escalation, and a reassuring patient experience.</p>
      <div style={{ display: "grid", gap: 10 }}>
        {teamCards.map(([title, description]) => (
          <div key={title} style={{ ...cardStyle(), padding: "18px 20px", display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "rgba(255,112,85,0.12)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: tokens.hot, flexShrink: 0, fontFamily: tokens.fontMono }}>
              team
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{title}</div>
              <div style={{ fontSize: 13, color: tokens.textMuted, lineHeight: 1.55 }}>{description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WebPricing() {
  const prices = [
    ["Consultation", "Ksh 1,000"],
    ["Extraction / tooth removal", "From Ksh 3,000"],
    ["Fillings and bonding", "From Ksh 5,000"],
    ["Cleaning and scaling", "From Ksh 6,000"],
    ["Root canal", "From Ksh 12,000"],
    ["Crowns", "From Ksh 26,000"],
    ["Teeth whitening", "From Ksh 28,000"],
    ["Braces and alignment", "From Ksh 90,000 per jaw"],
  ]

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 6 }}>Pricing</h2>
      <p style={{ fontSize: 14, color: tokens.textMuted, marginBottom: 24 }}>Transparent published pricing from the brand source. Final quotes are confirmed after clinical assessment.</p>
      <div style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${tokens.border}` }}>
        {prices.map(([service, price], index) => (
          <div
            key={service}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "13px 18px",
              background: index % 2 === 0 ? tokens.bgCard : tokens.bgSurface,
              borderBottom: index < prices.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
              gap: 12,
            }}
          >
            <span style={{ fontSize: 14 }}>{service}</span>
            <span style={{ fontFamily: tokens.fontMono, fontSize: 13, color: tokens.warm }}>{price}</span>
          </div>
        ))}
      </div>
      <p style={{ fontFamily: tokens.fontMono, fontSize: 11, color: tokens.textMuted, marginTop: 10 }}>
        Insurance examples: SHA/NHIF, AAR, APA, Britam, CIC, UAP. Confirm your specific plan before visiting.
      </p>
    </div>
  )
}

function WebBook() {
  const cards = [
    ["WhatsApp", "0740187579", "Fastest booking route. Staff aims to confirm within 5 minutes.", tokens.success, "https://wa.me/254740187579"],
    ["Nairobi CBD", "Pension Towers, Loita Street", "Main clinic on 2nd Floor and specialist clinic on 5th Floor.", tokens.hot, "https://maps.app.goo.gl/C5hyHLpoAgPDkzzr9"],
    ["Thika Road", "CPA Centre, 2nd Floor", "Good fit for corridor commuters and weekend visits.", tokens.warm, "https://maps.app.goo.gl/LaBGCsY3ZyFxZMb2A"],
    ["Thika Town", "Thika Gateway Plaza, 2nd Floor", "Convenient for Thika Town, Gatundu, Murang'a, and route traffic.", tokens.cold, "https://maps.app.goo.gl/gB6xXVVic6ncBzPg9"],
  ]

  return (
    <div>
      <h2 style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.03em", marginBottom: 6 }}>Book a visit</h2>
      <p style={{ fontSize: 14, color: tokens.textMuted, marginBottom: 24 }}>Monday to Saturday 7:00am-9:00pm. Sunday 8:30am-6:00pm. Walk-ins welcome at all branches.</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 10, marginBottom: 14 }}>
        {cards.map(([label, detail, note, color, href]) => (
          <div key={label} style={{ ...cardStyle(), padding: 20 }}>
            <div style={{ fontFamily: tokens.fontMono, fontSize: 10, color, marginBottom: 8 }}>{label}</div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 6 }}>{detail}</div>
            <div style={{ fontSize: 13, color: tokens.textMuted, lineHeight: 1.55 }}>{note}</div>
            <a href={href} target="_blank" rel="noreferrer" style={{ display: "inline-block", marginTop: 12, fontFamily: tokens.fontMono, fontSize: 11, color, textDecoration: "none" }}>
              {label === "WhatsApp" ? "open booking chat" : "get directions"}
            </a>
          </div>
        ))}
      </div>
      <div style={{ padding: "18px 20px", borderRadius: 14, background: "rgba(155,143,255,0.05)", border: "1px solid rgba(155,143,255,0.18)" }}>
        <div style={{ fontSize: 13, color: tokens.accent, fontWeight: 600, marginBottom: 6 }}>Pre-visit tip</div>
        <p style={{ fontSize: 13, color: "#8a8799", lineHeight: 1.6 }}>
          If you are in pain or you want a faster triage, send a short WhatsApp message before arrival so the clinic team can prepare.
        </p>
      </div>
    </div>
  )
}
