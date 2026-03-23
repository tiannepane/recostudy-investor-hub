import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Image as ImageIcon,
  FileText,
  Clipboard,
  Paperclip,
  Clock,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ConditionIndicator from "@/components/ConditionIndicator";
import type { Condition } from "@/components/ConditionIndicator";

/* ─── Component data ─────────────────────────────────────── */

type SourceIcon = "image" | "file" | "clipboard";

interface ComponentDef {
  id: string;
  name: string;
  category: string;
  condition: Condition;
  rul: string;
  rulColor: string;
  location: string;
  cost: string;
  lastInspection: string;
  risk: string;
  riskColor: string;
  sources: { icon: SourceIcon; label: string; bg: string; color: string }[];
  rfp: {
    id: string;
    title: string;
    scope: string;
    area: string;
    budget: string;
    timeline: string;
    priority: string;
    attachments: string[];
  };
}

const COMPONENTS: ComponentDef[] = [
  {
    id: "facade",
    name: "Exterior Facade & Balconies",
    category: "Structural",
    condition: "Poor",
    rul: "1 year RUL",
    rulColor: "#EF4444",
    location: "Main Building Exterior",
    cost: "$425,000",
    lastInspection: "March 2025",
    risk: "Critical",
    riskColor: "#EF4444",
    sources: [
      { icon: "image",     label: "Facade inspection photos (3)",       bg: "#EFF6FF", color: "#3B82F6" },
      { icon: "file",      label: "Structural assessment report.pdf",   bg: "#FEF2F2", color: "#EF4444" },
      { icon: "clipboard", label: "Maintenance history — 2019-2025",    bg: "#F3E8FF", color: "#8B5CF6" },
    ],
    rfp: {
      id: "RFP-2026-001",
      title: "Exterior Facade & Balconies Restoration",
      scope:
        "Complete restoration of exterior facade and balcony structures. Includes waterproofing membrane replacement, concrete spall repair, railing replacement, and protective coating application across all building elevations.",
      area: "Main Building Exterior",
      budget: "$425,000 — $480,000",
      timeline: "Q2 2026 — Q4 2026",
      priority: "Critical",
      attachments: ["Structural Assessment Report", "Facade Inspection Photos"],
    },
  },
  {
    id: "roof",
    name: "Roof Membrane",
    category: "Roofing",
    condition: "Fair",
    rul: "3 years RUL",
    rulColor: "#F59E0B",
    location: "Full Rooftop — Level 20",
    cost: "$180,000",
    lastInspection: "January 2025",
    risk: "Moderate",
    riskColor: "#F59E0B",
    sources: [
      { icon: "image",     label: "Roof inspection photos (5)",         bg: "#EFF6FF", color: "#3B82F6" },
      { icon: "file",      label: "Roofing condition report.pdf",       bg: "#FEF2F2", color: "#EF4444" },
      { icon: "clipboard", label: "Warranty records — 2017-2025",       bg: "#F3E8FF", color: "#8B5CF6" },
    ],
    rfp: {
      id: "RFP-2026-002",
      title: "Roof Membrane Replacement",
      scope:
        "Full replacement of rooftop waterproofing membrane across all roof sections. Includes removal of existing membrane, substrate inspection and repair, installation of new TPO membrane system, and drainage improvements.",
      area: "Full Rooftop — Level 20",
      budget: "$180,000 — $210,000",
      timeline: "Q3 2026 — Q4 2026",
      priority: "Moderate",
      attachments: ["Roofing Condition Report", "Warranty Records"],
    },
  },
  {
    id: "elevator",
    name: "Elevator Systems",
    category: "Mechanical",
    condition: "Fair",
    rul: "5 years RUL",
    rulColor: "#F59E0B",
    location: "All 4 Elevator Shafts",
    cost: "$290,000",
    lastInspection: "February 2025",
    risk: "Moderate",
    riskColor: "#F59E0B",
    sources: [
      { icon: "image",     label: "Elevator inspection photos (2)",     bg: "#EFF6FF", color: "#3B82F6" },
      { icon: "file",      label: "Mechanical systems audit.pdf",       bg: "#FEF2F2", color: "#EF4444" },
      { icon: "clipboard", label: "Service history — 2018-2025",        bg: "#F3E8FF", color: "#8B5CF6" },
    ],
    rfp: {
      id: "RFP-2026-003",
      title: "Elevator Systems Modernization",
      scope:
        "Full modernization of all 4 elevator systems including cab refurbishment, control system upgrade, door operator replacement, and safety system compliance updates per TSSA requirements.",
      area: "All 4 Elevator Shafts",
      budget: "$290,000 — $330,000",
      timeline: "Q1 2027 — Q3 2027",
      priority: "Moderate",
      attachments: ["Mechanical Systems Audit", "Service History"],
    },
  },
];

/* ─── Icon map ───────────────────────────────────────────── */

const SOURCE_ICON_MAP: Record<SourceIcon, React.ElementType> = {
  image:     ImageIcon,
  file:      FileText,
  clipboard: Clipboard,
};

/* ─── RFP text data ──────────────────────────────────────── */

const TITLE_TEXT = "Exterior Facade & Balconies Restoration";

const SCOPE_LINES = [
  "Complete restoration of exterior facade and balcony structures.",
  "Includes waterproofing membrane replacement, concrete spall repair,",
  "railing replacement, and protective coating across all elevations.",
];

/* ─── Phase 1 scan items ─────────────────────────────────── */

const SCAN_ITEMS = [
  { name: "Parking Structure",           color: "#10B981", badge: "Good · 8 yrs",    t: 1500 },
  { name: "Plumbing Systems",            color: "#10B981", badge: "Good · 7 yrs",    t: 2000 },
  { name: "Elevator Systems",            color: "#F59E0B", badge: "Fair · 5 yrs",    t: 2500 },
  { name: "Roof Membrane",               color: "#F59E0B", badge: "Fair · 3 yrs",    t: 3000 },
  { name: "Lobby & Common Areas",        color: "#F59E0B", badge: "Fair · 4 yrs",    t: 3500 },
  { name: "Exterior Facade & Balconies", color: "#EF4444", badge: "Critical · 1 yr", t: 4000 },
] as const;

/* ─── Page ───────────────────────────────────────────────── */

type AgentMsg = { text: string; hex: string };

const Projects = () => {
  const navigate = useNavigate();

  const [elapsed, setElapsed]               = useState(0);
  const [phase, setPhase]                   = useState<"scan" | "content">("scan");
  const [selectedId, setSelectedId]         = useState("facade");
  const [hasSwitched, setHasSwitched]       = useState(false);
  const [switchAgentMsg, setSwitchAgentMsg] = useState<AgentMsg | null>(null);
  const [hoveredCard, setHoveredCard]       = useState<string | null>(null);
  const [btnHover, setBtnHover]             = useState(false);

  const reset = useCallback(() => {
    setElapsed(0);
    setPhase("scan");
    setSelectedId("facade");
    setHasSwitched(false);
    setSwitchAgentMsg(null);
    setHoveredCard(null);
    setBtnHover(false);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  // Phase transition
  useEffect(() => {
    if (elapsed >= 6000 && phase === "scan") setPhase("content");
  }, [elapsed, phase]);

  /* ── Handle component switch ── */
  const handleSelect = useCallback((id: string) => {
    if (id === selectedId) return;
    const comp = COMPONENTS.find((c) => c.id === id)!;
    setSelectedId(id);
    if (!hasSwitched) setHasSwitched(true);
    setSwitchAgentMsg({ text: `● Compliance Agent — generating RFP for ${comp.name}...`, hex: "#8B92A8" });
    setTimeout(() => {
      setSwitchAgentMsg({
        text: "● Compliance Agent — RFP generated, ready for marketplace ✓",
        hex: "#10B981",
      });
    }, 1500);
  }, [selectedId, hasSwitched]);

  /* ── Derived state ── */
  const selectedComp   = COMPONENTS.find((c) => c.id === selectedId)!;
  const secondaryComps = COMPONENTS.filter((c) => c.id !== selectedId);

  /* ── Phase 1 derived ── */
  const scanItemsVisible = SCAN_ITEMS.map((item) => elapsed >= item.t);
  const facadePulsed     = elapsed >= 4200;
  const othersDimmed     = elapsed >= 4800;

  const phase1Agent: AgentMsg | null =
    elapsed < 300 ? null :
    elapsed >= 5500 ? { text: "● Compliance Agent — generating RFP...", hex: "#F59E0B" } :
    elapsed >= 4200 ? { text: "● Compliance Agent — critical component identified: Exterior Facade & Balconies", hex: "#EF4444" } :
                      { text: "● Compliance Agent — scanning building inventory for critical components...", hex: "#10B981" };

  /* ── Phase 2 derived ── */
  const alertVisible   = phase === "content" && (hasSwitched || elapsed >= 6600);
  const cardVisible    = phase === "content" && (hasSwitched || elapsed >= 6800);
  const rfpCardVisible = phase === "content" && (hasSwitched || elapsed >= 7000);

  // Initial RFP animation timing (starts at 7.0s)
  const rfpLogo          = elapsed >= 7000;
  const rfpType          = elapsed >= 7300;
  const titleCharsCount  = elapsed >= 7500
    ? Math.min(TITLE_TEXT.length, Math.floor(((elapsed - 7500) / 800) * TITLE_TEXT.length))
    : 0;
  const titleText        = TITLE_TEXT.substring(0, titleCharsCount);
  const rfpOrg           = elapsed >= 7900;
  const scopeHeader      = elapsed >= 8100;
  const scopeLineCount   = elapsed >= 8700 ? 3 : elapsed >= 8500 ? 2 : elapsed >= 8300 ? 1 : 0;
  const specsVisible     = elapsed >= 8900;
  const attachmentsVisible = elapsed >= 9200;
  const buttonVisible    = elapsed >= 9800;

  const secondaryLabelVisible = elapsed >= 10000;
  const secondaryItemVisible  = [elapsed >= 10000, elapsed >= 10300];

  const phase2Agent: AgentMsg = switchAgentMsg ??
    (elapsed >= 9500
      ? { text: "● Compliance Agent — RFP generated, ready for marketplace ✓", hex: "#10B981" }
      : { text: "● Compliance Agent — analyzing component data...", hex: "#8B92A8" });

  /* ── Alert banner data (for switched components) ── */
  const switchedAlertData = selectedComp.risk === "Critical"
    ? { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", iconColor: "#EF4444", textColor: "#EF4444", text: "Critical: End-of-life component detected" }
    : { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", iconColor: "#F59E0B", textColor: "#F59E0B", text: "Flagged: Component approaching end of life" };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeItem="projects"
        visitedItems={["overview", "inventory", "financials"]}
      />

      <main className="flex-1" style={{ marginLeft: 260, position: "relative", overflow: "hidden" }}>

        {/* ══════════════════════════════════════════════════
            PHASE 1 — Dark AI Discovery Scan Overlay
        ══════════════════════════════════════════════════ */}
        <AnimatePresence>
          {phase === "scan" && (
            <motion.div
              key="scan-overlay"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
              style={{
                position: "absolute",
                inset: 0,
                background: "#0A0F1E",
                zIndex: 45,
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {/* Agent text — top-left */}
              <div style={{ position: "absolute", top: 44, left: 50, right: 50 }}>
                <AnimatePresence mode="wait">
                  {phase1Agent && (
                    <motion.p
                      key={phase1Agent.hex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        fontFamily: "monospace",
                        fontSize: 13,
                        color: phase1Agent.hex,
                      }}
                    >
                      {phase1Agent.text}
                    </motion.p>
                  )}
                </AnimatePresence>
              </div>

              {/* Centered scan container */}
              <AnimatePresence>
                {elapsed >= 1000 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    style={{
                      width: "100%",
                      maxWidth: 640,
                      padding: "0 24px",
                    }}
                  >
                    {/* Title */}
                    <p style={{ fontSize: 24, fontWeight: 700, color: "white", marginBottom: 6, textAlign: "center" }}>
                      Analyzing 24 building components...
                    </p>
                    <p style={{ fontSize: 15, color: "#94A3B8", marginBottom: 20, textAlign: "center" }}>
                      Identifying end-of-life risk and maintenance priority
                    </p>

                    {/* Scan rows */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {SCAN_ITEMS.map((item, i) => {
                        const isFacade    = i === 5;
                        const isPulsed    = isFacade && facadePulsed;
                        const isDimmed    = othersDimmed && !isFacade;
                        return (
                          <AnimatePresence key={item.name}>
                            {scanItemsVisible[i] && (
                              <motion.div
                                initial={{ opacity: 0, x: -12 }}
                                animate={{
                                  opacity: isDimmed ? 0.3 : 1,
                                  x: 0,
                                  boxShadow: isPulsed
                                    ? "0 0 0 3px rgba(239,68,68,0.4)"
                                    : "none",
                                }}
                                transition={{
                                  opacity: { duration: isDimmed ? 0.4 : 0.3 },
                                  x: { duration: 0.3, ease: "easeOut" },
                                  boxShadow: { duration: 0.3 },
                                }}
                                style={{
                                  background: isPulsed ? "#1E1525" : "#141B2D",
                                  borderRadius: 8,
                                  padding: "14px 20px",
                                  borderLeft: `3px solid ${item.color}`,
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "space-between",
                                  transition: "background 0.3s ease",
                                }}
                              >
                                <span style={{ fontSize: 14, fontWeight: 500, color: "white" }}>
                                  {item.name}
                                </span>
                                <span
                                  style={{
                                    fontFamily: "monospace",
                                    fontSize: 11,
                                    color: item.color,
                                    flexShrink: 0,
                                  }}
                                >
                                  {item.badge}
                                </span>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══════════════════════════════════════════════════
            Page chrome — always rendered, revealed in Phase 2
        ══════════════════════════════════════════════════ */}
        <div className="mx-auto" style={{ maxWidth: 1100, padding: "44px 50px 36px" }}>
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings › ABC Condominium Association, Inc. › Projects"
            activeItem="projects"
          />

          {/* ══════════════════════════════════════════════
              PHASE 2 — Two-column layout
          ══════════════════════════════════════════════ */}
          <AnimatePresence>
            {phase === "content" && (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{ display: "flex", gap: "3%", alignItems: "flex-start" }}
              >

                {/* ══ LEFT COLUMN (45%) ══ */}
                <div style={{ flex: "0 0 42%", minWidth: 0 }}>

                  {/* ── Main component card ── */}
                  <AnimatePresence mode="wait">
                    {cardVisible && (
                      <>
                        {!hasSwitched ? (
                          /* Initial Phase 2 facade card */
                          <motion.div
                            key="facade-phase2"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            style={{
                              borderRadius: 12,
                              border: "1px solid #E8EBF0",
                              borderTop: "4px solid #EF4444",
                              background: "white",
                              padding: 24,
                              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                            }}
                          >
                            {/* Title */}
                            <p style={{ fontSize: 22, fontWeight: 700, color: "#0F1729", lineHeight: 1.2, marginBottom: 6 }}>
                              Exterior Facade &amp; Balconies
                            </p>

                            {/* Pills row */}
                            <div
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                marginBottom: 14,
                              }}
                            >
                              <span
                                style={{
                                  fontSize: 11,
                                  color: "#5A6178",
                                  background: "#F1F3F6",
                                  borderRadius: 4,
                                  padding: "2px 8px",
                                }}
                              >
                                Structural
                              </span>
                              <ConditionIndicator condition="Poor" />
                            </div>

                            {/* Divider */}
                            <div style={{ height: 1, background: "#F1F3F6", marginBottom: 14 }} />

                            {/* 3 detail rows */}
                            {[
                              { Icon: Clock,      label: "Remaining Useful Life", value: "1 year",   valueColor: "#EF4444", mono: false },
                              { Icon: DollarSign, label: "Estimated Cost",        value: "$425,000", valueColor: "#0F1729", mono: true  },
                            ].map((row, idx) => (
                              <div
                                key={idx}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  height: 36,
                                  borderBottom: "1px solid #F8F9FC",
                                }}
                              >
                                <row.Icon size={14} style={{ color: "#9CA3B8", flexShrink: 0, marginRight: 8 }} />
                                <span style={{ fontSize: 13, color: "#5A6178", flex: 1 }}>
                                  {row.label}
                                </span>
                                <span
                                  style={{
                                    fontSize: 13,
                                    fontWeight: 600,
                                    color: row.valueColor,
                                    fontFamily: row.mono ? "monospace" : "inherit",
                                  }}
                                >
                                  {row.value}
                                </span>
                              </div>
                            ))}

                          </motion.div>

                        ) : (

                          /* Static card for switched component (existing logic unchanged) */
                          <motion.div
                            key={selectedId}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{
                              borderRadius: 12,
                              border: "1px solid #E8EBF0",
                              borderTop: "4px solid #EF4444",
                              background: "white",
                              boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
                              padding: 24,
                            }}
                          >
                            <p style={{ fontSize: 22, fontWeight: 700, color: "#0F1729", marginBottom: 10, lineHeight: 1.2 }}>
                              {selectedComp.name}
                            </p>

                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 12, background: "#F8F9FC", border: "1px solid #E8EBF0", borderRadius: 4, padding: "2px 8px", color: "#5A6178" }}>
                                {selectedComp.category}
                              </span>
                              <ConditionIndicator condition={selectedComp.condition} />
                              <span style={{ fontSize: 12, fontWeight: 500, color: selectedComp.rulColor }}>
                                {selectedComp.rul}
                              </span>
                            </div>

                            <div style={{ height: 1, background: "#E8EBF0", margin: "10px 0 8px" }} />

                            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                              {[
                                { label: "Remaining Useful Life", value: selectedComp.rul, mono: false, color: selectedComp.rulColor },
                                { label: "Estimated Cost",        value: selectedComp.cost, mono: true,  color: "#0F1729" },
                              ].map((row) => (
                                <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                                  <span style={{ color: "#9CA3B8" }}>{row.label}</span>
                                  <span style={{ color: row.color, fontFamily: row.mono ? "monospace" : "inherit", fontWeight: row.mono ? 500 : 600 }}>
                                    {row.value}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </>
                    )}
                  </AnimatePresence>

                  {/* ── Other Flagged Components ── */}
                  <AnimatePresence>
                    {secondaryLabelVisible && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 5,
                          marginTop: 24,
                          marginBottom: 8,
                        }}
                      >
                        <Sparkles size={11} style={{ color: "#9CA3B8" }} />
                        <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8" }}>
                          Also flagged by Compliance Agent
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {secondaryComps.map((comp, i) => {
                      const isHovered = hoveredCard === comp.id;
                      const isSelected = comp.id === selectedId;
                      return (
                        <AnimatePresence key={comp.id}>
                          {secondaryItemVisible[i] && (
                            <motion.div
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.25 }}
                              onClick={() => handleSelect(comp.id)}
                              onMouseEnter={() => setHoveredCard(comp.id)}
                              onMouseLeave={() => setHoveredCard(null)}
                              style={{
                                background: "#F8F9FC",
                                border: isSelected || isHovered ? "1px solid #4F6BFF" : "1px solid #EEEFF2",
                                borderRadius: 10,
                                padding: "14px 16px",
                                cursor: "pointer",
                                boxShadow: isSelected || isHovered ? "0 0 0 3px rgba(79,107,255,0.08)" : "none",
                                transition: "border-color 200ms ease, box-shadow 200ms ease, background 200ms ease",
                              }}
                            >
                              {/* Top row: name + badge */}
                              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                                <p style={{ fontSize: 14, fontWeight: 600, color: "#0F1729" }}>
                                  {comp.name}
                                </p>
                                <span
                                  style={{
                                    fontSize: 10,
                                    fontWeight: 500,
                                    background: "#FEF3C7",
                                    color: "#D97706",
                                    borderRadius: 4,
                                    padding: "2px 7px",
                                    flexShrink: 0,
                                  }}
                                >
                                  Moderate
                                </span>
                              </div>

                              {/* Condition bar */}
                              <div style={{ marginBottom: 6 }}>
                                <ConditionIndicator condition={comp.condition} />
                              </div>

                              {/* RUL + Cost */}
                              <p style={{ fontSize: 12, color: "#5A6178" }}>
                                {comp.rul.replace("years", "yrs").replace("year", "yr")} · {comp.cost}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      );
                    })}
                  </div>

                  {/* Agent status — footer */}
                  <div style={{ marginTop: 12, minHeight: 18 }}>
                    <AnimatePresence mode="wait">
                      <motion.p
                        key={phase2Agent.text}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          fontFamily: "monospace",
                          fontSize: 12,
                          color: phase2Agent.hex,
                        }}
                      >
                        {phase2Agent.text}
                      </motion.p>
                    </AnimatePresence>
                  </div>
                </div>

                {/* ══ RIGHT COLUMN (55%) — RFP Document ══ */}
                <div style={{ flex: "0 0 55%", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>

                  {/* Document card */}
                  <AnimatePresence>
                    {rfpCardVisible && (
                      <motion.div
                        key={hasSwitched ? selectedId : "rfp-initial"}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        style={{
                          flex: 1,
                          borderRadius: 4,
                          background: "white",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
                          padding: "20px 22px",
                        }}
                      >
                        <AnimatePresence mode="wait">

                          {/* ── Initial progressive RFP (facade) ── */}
                          {!hasSwitched ? (
                            <motion.div
                              key="rfp-initial-content"
                              exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            >
                              {/* Logo row */}
                              <AnimatePresence>
                                {rfpLogo && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}
                                  >
                                    <p style={{ fontSize: 14, lineHeight: 1 }}>
                                      <span style={{ fontWeight: 700, color: "#0F1729" }}>RECO</span>
                                      <span style={{ fontWeight: 700, color: "#0F1729" }}>study</span>
                                      <sup style={{ fontSize: 9, color: "#9CA3B8", fontWeight: 400 }}>™</sup>
                                    </p>
                                    <p style={{ fontFamily: "monospace", fontSize: 11, color: "#9CA3B8" }}>RFP-2026-001</p>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {rfpLogo && <div style={{ height: 1, background: "#E8EBF0", marginBottom: 12 }} />}

                              <AnimatePresence>
                                {rfpType && (
                                  <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ display: "inline-block", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#4F6BFF", background: "#EFF3FF", borderRadius: 4, padding: "3px 10px", marginBottom: 8 }}
                                  >
                                    Request for Proposal
                                  </motion.p>
                                )}
                              </AnimatePresence>

                              {titleCharsCount > 0 && (
                                <p style={{ fontSize: 17, fontWeight: 700, color: "#0F1729", marginBottom: 4, lineHeight: 1.3, minHeight: 22 }}>
                                  {titleText}
                                  {titleCharsCount < TITLE_TEXT.length && (
                                    <span style={{ opacity: 0.35, fontWeight: 300 }}>|</span>
                                  )}
                                </p>
                              )}

                              <AnimatePresence>
                                {rfpOrg && (
                                  <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ fontSize: 13, color: "#5A6178", marginBottom: 12 }}
                                  >
                                    ABC Condominium Association, Inc.
                                  </motion.p>
                                )}
                              </AnimatePresence>

                              {rfpOrg && <div style={{ height: 1, background: "#E8EBF0", marginBottom: 10 }} />}

                              <AnimatePresence>
                                {scopeHeader && (
                                  <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, color: "#9CA3B8", marginBottom: 5 }}
                                  >
                                    Scope of Work
                                  </motion.p>
                                )}
                              </AnimatePresence>

                              <div style={{ marginBottom: 10, minHeight: scopeLineCount > 0 ? scopeLineCount * 22 : 0 }}>
                                {SCOPE_LINES.slice(0, scopeLineCount).map((line, i) => (
                                  <motion.p
                                    key={i}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                    style={{ fontSize: 12, color: "#5A6178", lineHeight: 1.55 }}
                                  >
                                    {line}
                                  </motion.p>
                                ))}
                              </div>

                              <AnimatePresence>
                                {specsVisible && (
                                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                                    <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, color: "#9CA3B8", marginBottom: 7 }}>
                                      Specifications
                                    </p>
                                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px 16px", marginBottom: 10 }}>
                                      {[
                                        { label: "Building Area", value: "Main Building Exterior" },
                                        { label: "Est. Budget",   value: "$425,000 — $480,000"   },
                                        { label: "Timeline",      value: "Q2 2026 — Q4 2026"     },
                                        { label: "Priority",      value: "Critical"               },
                                      ].map((spec) => (
                                        <div key={spec.label}>
                                          <p style={{ fontSize: 10, color: "#9CA3B8", marginBottom: 2 }}>{spec.label}</p>
                                          <p style={{ fontSize: 12, fontWeight: 500, color: "#0F1729" }}>{spec.value}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <AnimatePresence>
                                {attachmentsVisible && (
                                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                                    <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, color: "#9CA3B8", marginBottom: 7 }}>
                                      Attachments
                                    </p>
                                    <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
                                      {["Structural Assessment Report", "Facade Inspection Photos"].map((att) => (
                                        <div
                                          key={att}
                                          style={{ display: "flex", alignItems: "center", gap: 5, background: "#F8F9FC", border: "1px solid #E8EBF0", borderRadius: 4, padding: "4px 9px" }}
                                        >
                                          <Paperclip size={11} style={{ color: "#9CA3B8" }} />
                                          <span style={{ fontSize: 11, color: "#5A6178" }}>{att}</span>
                                        </div>
                                      ))}
                                    </div>
                                    <div style={{ height: 1, background: "#E8EBF0", marginBottom: 8 }} />
                                    <p style={{ fontSize: 10, color: "#9CA3B8", fontStyle: "italic" }}>
                                      Generated by RECOstudy Compliance Agent &nbsp;·&nbsp; March 20, 2026
                                    </p>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>

                          ) : (

                            /* ── Static RFP for switched component (unchanged) ── */
                            <motion.div
                              key={selectedId}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                <p style={{ fontSize: 14, lineHeight: 1 }}>
                                  <span style={{ fontWeight: 700, color: "#0F1729" }}>RECO</span>
                                  <span style={{ fontWeight: 700, color: "#0F1729" }}>study</span>
                                  <sup style={{ fontSize: 9, color: "#9CA3B8", fontWeight: 400 }}>™</sup>
                                </p>
                                <p style={{ fontFamily: "monospace", fontSize: 11, color: "#9CA3B8" }}>
                                  {selectedComp.rfp.id}
                                </p>
                              </div>

                              <div style={{ height: 1, background: "#E8EBF0", marginBottom: 12 }} />

                              <p style={{ display: "inline-block", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700, color: "#4F6BFF", background: "#EFF3FF", borderRadius: 4, padding: "3px 10px", marginBottom: 8 }}>
                                Request for Proposal
                              </p>
                              <p style={{ fontSize: 17, fontWeight: 700, color: "#0F1729", marginBottom: 4, lineHeight: 1.3 }}>
                                {selectedComp.rfp.title}
                              </p>
                              <p style={{ fontSize: 13, color: "#5A6178", marginBottom: 12 }}>
                                ABC Condominium Association, Inc.
                              </p>

                              <div style={{ height: 1, background: "#E8EBF0", marginBottom: 10 }} />

                              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, color: "#9CA3B8", marginBottom: 5 }}>
                                Scope of Work
                              </p>
                              <p style={{ fontSize: 12, color: "#5A6178", lineHeight: 1.55, marginBottom: 10 }}>
                                {selectedComp.rfp.scope}
                              </p>

                              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, color: "#9CA3B8", marginBottom: 7 }}>
                                Specifications
                              </p>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px 16px", marginBottom: 10 }}>
                                {[
                                  { label: "Building Area", value: selectedComp.rfp.area     },
                                  { label: "Est. Budget",   value: selectedComp.rfp.budget   },
                                  { label: "Timeline",      value: selectedComp.rfp.timeline },
                                  { label: "Priority",      value: selectedComp.rfp.priority },
                                ].map((spec) => (
                                  <div key={spec.label}>
                                    <p style={{ fontSize: 10, color: "#9CA3B8", marginBottom: 2 }}>{spec.label}</p>
                                    <p style={{ fontSize: 12, fontWeight: 500, color: "#0F1729" }}>{spec.value}</p>
                                  </div>
                                ))}
                              </div>

                              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, color: "#9CA3B8", marginBottom: 7 }}>
                                Attachments
                              </p>
                              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
                                {selectedComp.rfp.attachments.map((att) => (
                                  <div
                                    key={att}
                                    style={{ display: "flex", alignItems: "center", gap: 5, background: "#F8F9FC", border: "1px solid #E8EBF0", borderRadius: 4, padding: "4px 9px" }}
                                  >
                                    <Paperclip size={11} style={{ color: "#9CA3B8" }} />
                                    <span style={{ fontSize: 11, color: "#5A6178" }}>{att}</span>
                                  </div>
                                ))}
                              </div>

                              <div style={{ height: 1, background: "#E8EBF0", marginBottom: 8 }} />
                              <p style={{ fontSize: 10, color: "#9CA3B8", fontStyle: "italic" }}>
                                Generated by RECOstudy Compliance Agent &nbsp;·&nbsp; March 20, 2026
                              </p>
                            </motion.div>
                          )}

                        </AnimatePresence>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Send to Marketplace — payoff button */}
                  <AnimatePresence>
                    {buttonVisible && (
                      <motion.button
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        onClick={() => navigate("/marketplace")}
                        onMouseEnter={() => setBtnHover(true)}
                        onMouseLeave={() => setBtnHover(false)}
                        style={{
                          width: "100%",
                          height: 48,
                          background: "#4F6BFF",
                          color: "white",
                          border: "none",
                          borderRadius: 10,
                          fontSize: 16,
                          fontWeight: 600,
                          cursor: "pointer",
                          flexShrink: 0,
                          boxShadow: btnHover ? "0 4px 20px rgba(79,107,255,0.35)" : "none",
                          transition: "box-shadow 200ms ease",
                        }}
                      >
                        Send to Marketplace ›
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Projects;
