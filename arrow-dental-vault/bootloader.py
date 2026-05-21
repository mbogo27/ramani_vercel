import os
import re
import json
import sqlite3
import requests
import urllib.parse
import frontmatter
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
MODEL = "mistralai/ministral-14b-2512"  # swap freely via OpenRouter

# ─────────────────────────────────────────────
# SESSION STATE
# ─────────────────────────────────────────────

session = {
    "vault_path": None,
    "manifest": None,
    "index": None,
    "loaded_nodes": [],      # slugs of loaded nodes this session
    "budget_used": 0,
    "budget_max": 20,
    "trace": [],             # log of every bootloader decision
    "context_payload": [],   # assembled content chunks for LLM
    "emergency_override": False,
}

# ─────────────────────────────────────────────
# TRACE HELPER
# ─────────────────────────────────────────────

def log(message: str):
    """Append a message to the session trace and print it."""
    session["trace"].append(message)
    print(f"[TRACE] {message}")

# ─────────────────────────────────────────────
# 1. LOAD MANIFEST
# ─────────────────────────────────────────────

def load_manifest(vault_path: str) -> dict:
    """
    Read _manifest.md from vault root.
    Sets session budget, emergency override flag, and domain map.
    Must be called before any other function.
    """
    session["vault_path"] = Path(vault_path)
    manifest_path = session["vault_path"] / "_manifest.md"

    post = frontmatter.load(str(manifest_path))

    manifest = {
        "vault": post.get("vault"),
        "version": post.get("version"),
        "domain": post.get("domain"),
        "authority": post.get("authority"),
        "content": post.content,
    }

    # Set budget from manifest content
    budget_match = re.search(r"default_budget:\s*(\d+)", post.content)
    if budget_match:
        session["budget_max"] = int(budget_match.group(1))

    # Set emergency override
    emergency_match = re.search(r"emergency_override:\s*(true|false)", post.content)
    if emergency_match:
        session["emergency_override"] = emergency_match.group(1) == "true"

    session["manifest"] = manifest
    log(f"Manifest loaded — vault: {manifest['vault']} | "
        f"version: {manifest['version']} | "
        f"budget: {session['budget_max']} | "
        f"emergency_override: {session['emergency_override']}")

    return manifest

# ─────────────────────────────────────────────
# 2. LOAD INDEX
# ─────────────────────────────────────────────

def load_index() -> list[dict]:
    """
    Read _index.md from vault root.
    Parses the entry points table into a list of routing rules:
    [{ signals: [...], entry_node: str, z_level: str, notes: str }]
    """
    index_path = session["vault_path"] / "_index.md"
    post = frontmatter.load(str(index_path))

    routes = []
    # Parse markdown table rows — skip header and separator rows
    for line in post.content.splitlines():
        if not line.startswith("|"):
            continue
        cols = [c.strip() for c in line.strip("|").split("|")]
        if len(cols) < 4:
            continue
        if cols[0] in ("Signal", "------", "---"):
            continue
        if "---" in cols[0]:
            continue

        signals_raw = cols[0]
        entry_node_raw = cols[1]
        z_level = cols[2]
        notes = cols[3] if len(cols) > 3 else ""

        # Extract slug from [[slug]] wikilink syntax
        node_match = re.search(r"\[\[(.+?)\]\]", entry_node_raw)
        entry_node = node_match.group(1) if node_match else entry_node_raw

        # Split comma-separated signals into list
        signals = [s.strip().lower() for s in signals_raw.split(",")]

        routes.append({
            "signals": signals,
            "entry_node": entry_node,
            "z_level": z_level,
            "notes": notes,
        })

    session["index"] = routes
    log(f"Index loaded — {len(routes)} routing rules found")
    return routes

# ─────────────────────────────────────────────
# 3. DETECT SIGNALS
# ─────────────────────────────────────────────

def detect_signals(query: str) -> list[str]:
    """
    Tokenize the query and match tokens against all known
    index signals. Returns list of matched signals.
    """
    query_lower = query.lower()
    matched = []

    for route in session["index"]:
        for signal in route["signals"]:
            if signal in query_lower:
                if signal not in matched:
                    matched.append(signal)

    log(f"Signals detected: {matched if matched else 'none'}")
    return matched

# ─────────────────────────────────────────────
# 4. ROUTE
# ─────────────────────────────────────────────

def route(signals: list[str]) -> list[dict]:
    """
    Match detected signals against index routing rules.
    Returns ordered list of entry points to activate.
    Emergency signals are always sorted to the top.
    """
    EMERGENCY_SIGNALS = {
        "pain", "severe pain", "emergency", "urgent",
        "hurts badly", "killing me", "can't sleep",
        "swollen", "abscess", "please help"
    }

    matched_routes = []
    seen_nodes = set()

    for route_rule in session["index"]:
        for signal in signals:
            if signal in route_rule["signals"]:
                node = route_rule["entry_node"]
                if node not in seen_nodes:
                    matched_routes.append(route_rule)
                    seen_nodes.add(node)
                break

    # Sort emergency routes to top if override enabled
    if session["emergency_override"]:
        matched_routes.sort(
            key=lambda r: any(s in EMERGENCY_SIGNALS for s in r["signals"]),
            reverse=True
        )

    # Sort by z-level priority: z=1 > z=2 > z=3 (ensures audience classes load before interface nodes)
    def z_priority(route):
        z_level = route["z_level"]
        priority_map = {"z=1": 3, "z=2": 2, "z=3": 1, "trajectory": 0}
        return priority_map.get(z_level, 0)
    
    matched_routes.sort(key=z_priority, reverse=True)

    if matched_routes:
        for r in matched_routes:
            log(f"Route matched: {r['entry_node']} "
                f"(z={r['z_level']}) via signals {r['signals']}")
    else:
        log("No route matched — falling back to TJ-patient-inquiry")
        matched_routes.append({
            "entry_node": "TJ-patient-inquiry",
            "z_level": "trajectory",
            "signals": [],
            "notes": "fallback"
        })

    return matched_routes

# ─────────────────────────────────────────────
# 5. RESOLVE PATH
# ─────────────────────────────────────────────

STC_ALIAS_MAP = {
    "IF-operations": "STC-operations",
}


def resolve_path(slug: str) -> Path | None:
    """
    Given a node slug (e.g. 'HE-emergency-pain-response',
    'tone-guide', 'class-services', 'IF-operations'),
    find its actual file path in the vault by searching
    all subdirectories.
    Returns Path if found, None if not found.
    """
    vault = session["vault_path"]
    resolved_slug = STC_ALIAS_MAP.get(slug, slug)

    # Direct root-level files first (_manifest, _index)
    for ext in [".md"]:
        direct = vault / f"{resolved_slug}{ext}"
        if direct.exists():
            return direct

    # Search all subdirectories
    for md_file in vault.rglob("*.md"):
        if md_file.stem == resolved_slug:
            return md_file

    log(f"WARNING: Could not resolve path for slug '{slug}'")
    return None

# ─────────────────────────────────────────────
# 6. LOAD NODE
# ─────────────────────────────────────────────

def load_node(slug: str) -> dict | None:
    """
    Load a single vault node by slug.
    Reads file, parses frontmatter, extracts content.
    Tracks budget. Refuses to load if budget exceeded
    (unless emergency_override is active).
    Returns node dict or None if not found / budget exceeded.
    """
    # Check if already loaded this session
    if slug in session["loaded_nodes"]:
        log(f"Node '{slug}' already loaded this session — skipping")
        return None

    # Check budget
    if session["budget_used"] >= session["budget_max"]:
        if not session["emergency_override"]:
            log(f"Budget exceeded ({session['budget_used']}/{session['budget_max']}) "
                f"— cannot load '{slug}'")
            return None
        else:
            log(f"Emergency override active — loading '{slug}' beyond budget")

    path = resolve_path(slug)
    if not path:
        return None

    post = frontmatter.load(str(path))

    node = {
        "slug": slug,
        "path": str(path),
        "type": post.get("type", "unknown"),
        "label": post.get("label", slug),
        "domain": post.get("domain", "unknown"),
        "tags": post.get("tags", []),
        "related": post.get("related", []),
        "shadow": post.get("shadow", False),
        "expansion_cost": post.get("expansion_cost", 1),
        "content": post.content,
        "metadata": post.metadata,
    }

    session["loaded_nodes"].append(slug)
    session["budget_used"] += 1
    session["context_payload"].append({
        "slug": slug,
        "label": node["label"],
        "content": node["content"],
    })

    log(f"Loaded node '{slug}' | type: {node['type']} | "
        f"budget: {session['budget_used']}/{session['budget_max']}")

    return node


def row_to_dict(row):
    return dict(row) if row is not None else None


def resolve_stc_db_path(endpoint_ref: str) -> Path:
    path = Path(endpoint_ref)
    return path if path.is_absolute() else session["vault_path"] / path


def get_stc_post(stc_slug: str):
    path = resolve_path(stc_slug)
    if not path:
        return None
    return frontmatter.load(str(path))


def get_stc_capability(post, capability_id: str):
    for cap in post.get("capabilities", []):
        if cap.get("id") == capability_id:
            return cap
    return None


def execute_stc(stc_slug: str, capability_id: str, params: dict):
    post = get_stc_post(stc_slug)
    if not post:
        log(f"STC node '{stc_slug}' not found")
        return None

    capability = get_stc_capability(post, capability_id)
    if not capability:
        log(f"Capability '{capability_id}' not found in STC '{stc_slug}'")
        return None

    transport = post.get("transport", "").lower()
    log(f"Executing STC '{stc_slug}' capability '{capability_id}' via transport '{transport}'")

    if transport == "sqlite":
        return execute_sqlite_stc(post, capability_id, params)

    if transport == "rest" and post.get("system") == "whatsapp-business-api":
        return execute_whatsapp_stc(capability_id, params)

    if transport == "rest" and post.get("system") == "google-maps-places-api":
        return execute_gmaps_stc(post, capability_id, params)

    log(f"Unsupported STC transport '{transport}' for node '{stc_slug}'")
    return None


def execute_sqlite_stc(post, capability_id: str, params: dict):
    db_path = resolve_stc_db_path(post.get("endpoint_ref", ""))
    if not db_path.exists():
        log(f"SQLite database not found at {db_path}")
        return {"error": "database not found"}

    conn = sqlite3.connect(str(db_path))
    conn.row_factory = sqlite3.Row
    cur = conn.cursor()

    try:
        if capability_id == "lookup_patient_by_phone":
            row = cur.execute(
                "SELECT patient_name, last_visit_date, insurance_status FROM patients WHERE phone_number = ?",
                (params.get("phone_number"),)
            ).fetchone()
            return row_to_dict(row) or {"message": "no patient record found"}

        if capability_id == "get_upcoming_appointments":
            patient_id = params.get("patient_id")
            date_range = params.get("date_range", "next_7_days")
            if date_range == "next_7_days":
                rows = cur.execute(
                    "SELECT appointment_date, appointment_time, branch, procedure_type "
                    "FROM appointments "
                    "WHERE patient_id = ? "
                    "AND appointment_date BETWEEN date('now') AND date('now', '+7 days') "
                    "ORDER BY appointment_date, appointment_time",
                    (patient_id,)
                ).fetchall()
            else:
                rows = cur.execute(
                    "SELECT appointment_date, appointment_time, branch, procedure_type "
                    "FROM appointments WHERE patient_id = ? ORDER BY appointment_date, appointment_time",
                    (patient_id,)
                ).fetchall()
            return [dict(r) for r in rows]

        if capability_id == "get_contact_details":
            row = cur.execute(
                "SELECT whatsapp, phone, email FROM contact_details LIMIT 1"
            ).fetchone()
            return row_to_dict(row) or {}

        if capability_id == "get_branch_info":
            branch_name = params.get("branch_name")
            if branch_name and branch_name.lower() != "all":
                rows = cur.execute(
                    "SELECT branch_name, address, floor, maps_link FROM branches "
                    "WHERE LOWER(branch_name) = LOWER(?)",
                    (branch_name,)
                ).fetchall()
            else:
                rows = cur.execute(
                    "SELECT branch_name, address, floor, maps_link FROM branches ORDER BY branch_name"
                ).fetchall()
            return [dict(r) for r in rows]

        if capability_id == "get_operating_hours":
            rows = cur.execute(
                "SELECT day, open_time, close_time FROM operating_hours"
            ).fetchall()
            result = {
                "weekday_open": None,
                "weekday_close": None,
                "sunday_open": None,
                "sunday_close": None,
            }
            for r in rows:
                day = r["day"].lower()
                if day == "weekday":
                    result["weekday_open"] = r["open_time"]
                    result["weekday_close"] = r["close_time"]
                if day == "sunday":
                    result["sunday_open"] = r["open_time"]
                    result["sunday_close"] = r["close_time"]
            return result

        if capability_id == "get_insurance_list":
            provider_name = params.get("provider_name")
            if provider_name:
                rows = cur.execute(
                    "SELECT provider_name, accepted FROM insurance "
                    "WHERE LOWER(provider_name) = LOWER(?) ORDER BY provider_name",
                    (provider_name,)
                ).fetchall()
            else:
                rows = cur.execute(
                    "SELECT provider_name, accepted FROM insurance ORDER BY provider_name"
                ).fetchall()
            return [dict(r) for r in rows]

        if capability_id == "get_recent_reviews":
            max_results = int(params.get("max_results", 5) or 5)
            min_rating = params.get("min_rating")
            sql = (
                "SELECT reviewer_name, rating, review_text, review_date, reply_status "
                "FROM gmaps_reviews WHERE 1=1 "
            )
            args = []
            if min_rating is not None:
                sql += "AND rating >= ? "
                args.append(min_rating)
            sql += "ORDER BY review_date DESC LIMIT ?"
            args.append(max_results)
            rows = cur.execute(sql, tuple(args)).fetchall()
            return [dict(r) for r in rows]

        if capability_id == "draft_review_reply":
            reply_text = params.get("reply_text", "")
            return {
                "review_id": params.get("review_id"),
                "draft_reply": reply_text,
                "character_count": len(reply_text),
                "status": "draft_ready",
            }

        log(f"Unknown SQLite capability '{capability_id}'")
        return {"error": "unknown capability"}
    finally:
        conn.close()


def execute_whatsapp_stc(capability_id: str, params: dict):
    recipient_phone = params.get("recipient_phone")
    if not recipient_phone:
        log("WhatsApp action missing recipient_phone")
        return {"error": "missing recipient_phone"}

    if capability_id == "send_booking_confirmation":
        body = (
            f"Hello {params.get('patient_name', 'Patient')}, your booking for "
            f"{params.get('appointment_date')} at {params.get('branch_name')} is confirmed. "
            "Please reply here if you need directions."
        )
        redirect_url = (
            "https://api.whatsapp.com/send?phone="
            f"{urllib.parse.quote_plus(recipient_phone)}&text="
            f"{urllib.parse.quote_plus(body)}"
        )
        return {
            "message_id": "whatsapp-demo-booking-001",
            "status": "redirect_pending",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "redirect_url": redirect_url,
        }

    if capability_id == "send_recall_reminder":
        body = (
            f"Hello {params.get('patient_name', 'Patient')}, we noticed your last visit was "
            f"on {params.get('last_visit_date')}. It may be time to schedule your next checkup. "
            "Please reply here to book your appointment."
        )
        redirect_url = (
            "https://api.whatsapp.com/send?phone="
            f"{urllib.parse.quote_plus(recipient_phone)}&text="
            f"{urllib.parse.quote_plus(body)}"
        )
        return {
            "message_id": "whatsapp-demo-recall-001",
            "status": "redirect_pending",
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "redirect_url": redirect_url,
        }

    log(f"Unknown WhatsApp capability '{capability_id}'")
    return {"error": "unknown capability"}


def execute_gmaps_stc(post, capability_id: str, params: dict):
    db_path = session["vault_path"] / "data" / "arrow-dental.db"
    if not db_path.exists():
        log(f"Google Maps fallback database not found at {db_path}")
        return {"error": "database not found"}

    if capability_id == "get_recent_reviews":
        # Local fallback for demo reviews data.
        conn = sqlite3.connect(str(db_path))
        conn.row_factory = sqlite3.Row
        cur = conn.cursor()
        try:
            max_results = int(params.get("max_results", 5) or 5)
            min_rating = params.get("min_rating")
            sql = (
                "SELECT reviewer_name, rating, review_text, review_date, reply_status "
                "FROM gmaps_reviews WHERE 1=1 "
            )
            args = []
            if min_rating is not None:
                sql += "AND rating >= ? "
                args.append(min_rating)
            sql += "ORDER BY review_date DESC LIMIT ?"
            args.append(max_results)
            rows = cur.execute(sql, tuple(args)).fetchall()
            return [dict(r) for r in rows]
        finally:
            conn.close()

    if capability_id == "draft_review_reply":
        reply_text = params.get("reply_text", "")
        return {
            "review_id": params.get("review_id"),
            "draft_reply": reply_text,
            "character_count": len(reply_text),
            "status": "draft_ready",
        }

    log(f"Unknown Google Maps capability '{capability_id}'")
    return {"error": "unknown capability"}


def select_stc_capability(stc_slug: str, query: str) -> tuple[str, dict]:
    query_lower = query.lower()

    if stc_slug in ("IF-operations", "STC-operations"):
        if any(term in query_lower for term in ["hour", "opening", "closing", "what time", "working hours", "sunday", "open", "are you open"]):
            return "get_operating_hours", {"day": "all"}
        if any(term in query_lower for term in ["insurance", "nhif", "sha", "cover"]):
            return "get_insurance_list", {"provider_name": None}
        if any(term in query_lower for term in ["branch", "location", "address", "directions", "maps", "nearest", "closest", "thika"]):
            return "get_branch_info", {"branch_name": "all"}
        return "get_contact_details", {}

    if stc_slug == "STC-patient-db":
        if any(term in query_lower for term in ["appointment", "visit", "schedule", "book"]):
            return "get_upcoming_appointments", {"patient_id": 1, "date_range": "next_7_days"}
        return "lookup_patient_by_phone", {"phone_number": "0712345678"}

    if stc_slug == "STC-gmaps-reviews":
        return "get_recent_reviews", {"place_id": "ChIJ_arrow_dental_cbd", "max_results": 5, "min_rating": 4}

    return "", {}

# ─────────────────────────────────────────────
# 7. EXTRACT WIKILINKS
# ─────────────────────────────────────────────

def extract_wikilinks(content: str) -> list[str]:
    """
    Extract all [[slug]] wikilinks from a markdown content string.
    Returns list of slug strings.
    """
    return re.findall(r"\[\[(.+?)\]\]", content)

# ─────────────────────────────────────────────
# 8. TRAVERSE
# ─────────────────────────────────────────────

def traverse(entry_node_slug: str, query: str = "") -> list[dict]:
    """
    Starting from an entry node, load it and follow its
    participant links and ghost edge steps.
    For hyperedges: load all participants listed in frontmatter.
    For abstract classes: load class node but NOT members
      (members only expand on explicit signal).
    For leaf nodes: load node and its direct related nodes
      if budget allows.
    Returns list of all nodes loaded during traversal.
    """
    loaded = []

    entry = load_node(entry_node_slug)
    if not entry:
        return loaded
    loaded.append(entry)

    node_type = entry.get("type", "unknown")

    # ── Hyperedge traversal ──
    if node_type == "hyperedge":
        log(f"Traversing hyperedge '{entry_node_slug}'")

        # Always load tone-guide and forbidden-words first
        for core_slug in ["tone-guide", "forbidden-words"]:
            node = load_node(core_slug)
            if node:
                loaded.append(node)

        # Load participants from frontmatter
        participants = entry["metadata"].get("participants", [])
        for p in participants:
            raw = p.get("node", "")
            slug_match = re.search(r"\[\[(.+?)\]\]", raw)
            if not slug_match:
                continue
            slug = slug_match.group(1)
            # Skip already loaded core nodes
            if slug in session["loaded_nodes"]:
                continue
            node = load_node(slug)
            if node:
                loaded.append(node)

        # Follow ghost edge steps if present
        ghost = entry["metadata"].get("ghost_edge", {})
        steps = ghost.get("steps", [])
        if steps:
            log(f"Ghost edge type: {ghost.get('type')} | "
                f"{len(steps)} steps")
            for i, step in enumerate(steps):
                raw = step.get("node", "")
                slug_match = re.search(r"\[\[(.+?)\]\]", raw)
                if not slug_match:
                    continue
                slug = slug_match.group(1)
                label = step.get("label", "")
                condition = step.get("condition")
                log(f"  Ghost step {i+1}: '{slug}' — {label}"
                    + (f" [condition: {condition}]" if condition else ""))
                # Load if not already loaded
                if slug not in session["loaded_nodes"]:
                    node = load_node(slug)
                    if node:
                        loaded.append(node)

    # ── Abstract class traversal ──
    elif node_type == "abstract":
        log(f"Traversing abstract class '{entry_node_slug}' — staying at z=2")
        for core_slug in ["tone-guide", "forbidden-words"]:
            node = load_node(core_slug)
            if node:
                loaded.append(node)
        
        # Procedure expansion for specific named procedures
        PROCEDURE_MAP = {
            "root canal": "restorative-dentistry",
            "whitening": "cosmetic-dentistry",
            "braces": "cosmetic-dentistry",
            "implant": "restorative-dentistry",
            "children": "pediatric-care",
            "kids": "pediatric-care",
        }
        
        for keyword, member_slug in PROCEDURE_MAP.items():
            if keyword in query.lower():
                if member_slug not in session["loaded_nodes"]:
                    node = load_node(member_slug)
                    if node:
                        loaded.append(node)
                        log(f"Procedure expansion: '{keyword}' → '{member_slug}'")
        
        # Load direct related nodes if budget allows
        related = entry.get("related", [])
        for slug in related:  # load all related nodes
            if slug not in session["loaded_nodes"]:
                node = load_node(slug)
                if node:
                    loaded.append(node)

    # ── Trajectory traversal ──
    elif node_type == "trajectory":
        log(f"Traversing trajectory '{entry_node_slug}'")
        # Always load voice constraints even in fallback
        for core_slug in ["tone-guide", "forbidden-words"]:
            node = load_node(core_slug)
            if node:
                loaded.append(node)

    # ── Leaf node traversal ──
    elif node_type == "concept":
        log(f"Traversing leaf node '{entry_node_slug}'")
        # Load direct related nodes if budget allows
        related = entry.get("related", [])
        for slug in related[:2]:   # max 2 related nodes per leaf
            if slug not in session["loaded_nodes"]:
                node = load_node(slug)
                if node:
                    loaded.append(node)

    # ── STC node ──
    elif node_type == "stc":
        log(f"Traversing STC node '{entry_node_slug}'")
        capability_id, stc_params = select_stc_capability(entry_node_slug, query)
        if capability_id:
            result = execute_stc(entry_node_slug, capability_id, stc_params)
            if result is not None:
                session["context_payload"].append({
                    "slug": f"{entry_node_slug}.{capability_id}",
                    "label": f"{entry_node_slug} → {capability_id}",
                    "content": json.dumps(result, indent=2)
                })
        else:
            log(f"No STC capability selected for '{entry_node_slug}'")

    # ── Interface node ──
    elif node_type == "interface":
        log(f"Interface node '{entry_node_slug}' loaded — "
            f"data retrieval deferred to runtime")

    return loaded

# ─────────────────────────────────────────────
# 9. ASSEMBLE CONTEXT
# ─────────────────────────────────────────────

def assemble_context(query: str) -> str:
    """
    Compose the final context string to send to the LLM.
    Combines:
      - Active node contents from context_payload
      - Query
      - Hard constraint reminder from manifest agent rules
    Returns a single string: the system prompt body.
    """
    sections = []

    sections.append("# Ramani Context Payload\n")
    sections.append(f"**Vault:** {session['manifest']['vault']} "
                    f"v{session['manifest']['version']}\n")
    sections.append(f"**Nodes loaded:** {session['budget_used']} / "
                    f"{session['budget_max']}\n")
    sections.append("---\n")

    for chunk in session["context_payload"]:
        sections.append(f"## [{chunk['slug']}] {chunk['label']}\n")
        sections.append(chunk["content"])
        sections.append("\n---\n")

    sections.append("# Agent Rules (from manifest)\n")
    sections.append(
        "1. Answer ONLY from the context payload above. "
        "Do not use general knowledge.\n"
        "2. Always apply tone-guide rules before generating output.\n"
        "3. If forbidden-words node is loaded, verify your response "
        "contains none of the listed words.\n"
        "4. Follow ghost edge sequence order exactly if a hyperedge "
        "was activated.\n"
        "5. End every patient-facing response with exactly one CTA.\n"
    )

    sections.append(f"\n# Patient Query\n{query}\n")

    context = "\n".join(sections)
    log(f"Context assembled — {len(context)} characters")
    return context

# ─────────────────────────────────────────────
# 10. CALL LLM
# ─────────────────────────────────────────────

def call_llm(context: str) -> str:
    """
    Send assembled context to OpenRouter.
    Returns the model's response string.
    """
    if not OPENROUTER_API_KEY:
        log("ERROR: OPENROUTER_API_KEY not set in .env")
        return "[LLM call failed — no API key]"

    headers = {
        "Authorization": f"Bearer {OPENROUTER_API_KEY}",
        "Content-Type": "application/json",
    }

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a patient-facing AI assistant for Arrow Dental Centre. "
                    "You must answer strictly from the context payload provided. "
                    "Never use general knowledge. Never deviate from tone-guide rules. "
                    "Never use forbidden words. Always end with exactly one CTA."
                )
            },
            {
                "role": "user",
                "content": context
            }
        ],
        "temperature": 0.3,    # low temp — deterministic, rule-following
        "max_tokens": 300,
    }

    log(f"Calling LLM via OpenRouter — model: {MODEL}")

    try:
        response = requests.post(
            OPENROUTER_URL,
            headers=headers,
            json=payload,
            timeout=30
        )
        response.raise_for_status()
        result = response.json()
        content = result["choices"][0]["message"]["content"]
        log("LLM response received")
        return content

    except requests.exceptions.RequestException as e:
        log(f"LLM call failed: {e}")
        return f"[LLM call failed: {e}]"

# ─────────────────────────────────────────────
# 11. PRINT TRACE
# ─────────────────────────────────────────────

def print_trace():
    """Print the full session logic trace."""
    print("\n" + "="*60)
    print("LOGIC TRACE")
    print("="*60)
    for i, entry in enumerate(session["trace"], 1):
        print(f"  [{i:02d}] {entry}")
    print(f"\n  Nodes loaded: {session['loaded_nodes']}")
    print(f"  Budget used:  {session['budget_used']}/{session['budget_max']}")
    print("="*60 + "\n")

# ─────────────────────────────────────────────
# 12. RESET SESSION
# ─────────────────────────────────────────────

def reset_session():
    """Clear session state between queries."""
    session["loaded_nodes"] = []
    session["budget_used"] = 0
    session["trace"] = []
    session["context_payload"] = []
    log("Session reset")

# ─────────────────────────────────────────────
# 13. BOOT — MAIN ENTRY POINT
# ─────────────────────────────────────────────

def boot(vault_path: str, query: str) -> str:
    """
    Full bootloader pipeline for a single query.

    1. Load manifest + index (once per vault)
    2. Reset session state
    3. Detect signals in query
    4. Route to entry nodes
    5. Traverse from each entry node
    6. Assemble context
    7. Call LLM
    8. Print trace
    9. Return response
    """
    # Step 1 — Load vault contract (skip if already loaded)
    if not session["manifest"]:
        load_manifest(vault_path)
        load_index()

    # Step 2 — Fresh session per query
    reset_session()

    # Step 3 — Detect signals
    signals = detect_signals(query)

    if not signals:
        log("No signals detected — loading fallback trajectory")

    # Step 4 — Route
    routes = route(signals)

    # Step 5 — Traverse each matched entry node
    for r in routes:
        traverse(r["entry_node"], query)
        # Stop after first hyperedge — it owns the response
        if r["z_level"] == "z=1":
            log("Hyperedge activated — stopping multi-route traversal")
            break

    # Step 6 — Assemble context
    context = assemble_context(query)

    # Step 7 — Call LLM
    response = call_llm(context)

    # Step 8 — Print trace
    print_trace()

    # Step 9 — Return
    print("\n" + "="*60)
    print("RESPONSE")
    print("="*60)
    print(response)
    print("="*60 + "\n")

    return response


# ─────────────────────────────────────────────
# ENTRY POINT
# ─────────────────────────────────────────────

if __name__ == "__main__":
    VAULT = "."

    # Pre-load vault contract
    load_manifest(VAULT)
    load_index()

    # Run test queries
    queries = [
        # Families
        "My son is 8 years old, is he too young for braces?",
        "My daughter is terrified of the dentist, how do you handle young children?",
        
        # CBD Professionals
        "I work in town, can I come in during lunch?",
        "Do you have evening appointments? I can't leave work during the day",
        
        # Thika Commuters
        "I'm in Thika, which branch is closest to me?",
        "Are you open on Sundays? I'm along Thika Road",
        
        # Cost Sensitive
        "I'm on a tight budget, what's the cheapest option?",
        "I already told you I can't afford much — do I still have to pay for a consultation?",
        
        # Nervous Patients
        "I'm terrified of needles, will I need an injection?",
        "I haven't been to a dentist in 6 years, I'm embarrassed",
    ]

    for q in queries:
        print(f"\n{'='*60}")
        print(f"QUERY: {q}")
        print('='*60)
        boot(VAULT, q)
