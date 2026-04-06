import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Image as ImageIcon,
  FileText,
  Clipboard,
  Paperclip,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AgentBar from "@/components/AgentBar";
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
      { icon: "clipboard", label: "Maintenance history 2019-2025",    bg: "#F3E8FF", color: "#8B5CF6" },
    ],
    rfp: {
      id: "RFP-2026-001",
      title: "Exterior Facade & Balconies Restoration",
      scope:
        "Complete restoration of exterior facade and balcony structures. Includes waterproofing membrane replacement, concrete spall repair, railing replacement, and protective coating application across all building elevations.",
      area: "Main Building Exterior",
      budget: "$425,000 - $480,000",
      timeline: "Q2 2026 - Q4 2026",
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
    location: "Full Rooftop, Level 20",
    cost: "$180,000",
    lastInspection: "January 2025",
    risk: "Moderate",
    riskColor: "#F59E0B",
    sources: [
      { icon: "image",     label: "Roof inspection photos (5)",         bg: "#EFF6FF", color: "#3B82F6" },
      { icon: "file",      label: "Roofing condition report.pdf",       bg: "#FEF2F2", color: "#EF4444" },
      { icon: "clipboard", label: "Warranty records 2017-2025",       bg: "#F3E8FF", color: "#8B5CF6" },
    ],
    rfp: {
      id: "RFP-2026-002",
      title: "Roof Membrane Replacement",
      scope:
        "Full replacement of rooftop waterproofing membrane across all roof sections. Includes removal of existing membrane, substrate inspection and repair, installation of new TPO membrane system, and drainage improvements.",
      area: "Full Rooftop, Level 20",
      budget: "$180,000 - $210,000",
      timeline: "Q3 2026 - Q4 2026",
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
      { icon: "clipboard", label: "Service history 2018-2025",        bg: "#F3E8FF", color: "#8B5CF6" },
    ],
    rfp: {
      id: "RFP-2026-003",
      title: "Elevator Systems Modernization",
      scope:
        "Full modernization of all 4 elevator systems including cab refurbishment, control system upgrade, door operator replacement, and safety system compliance updates per TSSA requirements.",
      area: "All 4 Elevator Shafts",
      budget: "$290,000 - $330,000",
      timeline: "Q1 2027 - Q3 2027",
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

const TITLE_TEXT  = "Exterior Facade & Balconies Restoration";
const SCOPE_LINES = [
  "Complete restoration of exterior facade and balcony structures.",
  "Includes waterproofing membrane replacement, concrete spall repair,",
  "railing replacement, and protective coating across all elevations.",
];

/* ─── Compact scan card rows ─────────────────────────────── */

const COMPACT_SCAN_ITEMS = [
  { name: "Parking Structure", color: "#10B981", badge: "Good · 8 yrs", t: 400  },
  { name: "Plumbing Systems",  color: "#10B981", badge: "Good · 7 yrs", t: 900  },
  { name: "Elevator Systems",  color: "#F59E0B", badge: "Fair · 5 yrs", t: 1400 },
] as const;

/* ─── AgentBar thinking messages ─────────────────────────── */

const THINKING_MESSAGES = [
  "scanning building inventory for critical components...",
  "analyzing 24 components for end-of-life risk...",
  "cross-referencing maintenance history...",
  "flagging components with RUL < 2 years...",
];

/* ─── Page ───────────────────────────────────────────────── */


const Projects = () => {
  const navigate = useNavigate();

  const [elapsed, setElapsed]               = useState(0);
  const [selectedId, setSelectedId]         = useState("facade");
  const [hasSwitched, setHasSwitched]       = useState(false);
  const [hoveredCard, setHoveredCard]       = useState<string | null>(null);

  const reset = useCallback(() => {
    setElapsed(0);
    setSelectedId("facade");
    setHasSwitched(false);
    setHoveredCard(null);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  /* ── AgentBar: thinking until 3.5s, complete after ── */
  const agentIsThinking = elapsed < 3500;
  const agentIsComplete = elapsed >= 3500;
  const thinkingMsg = THINKING_MESSAGES[
    Math.min(THINKING_MESSAGES.length - 1, Math.floor(elapsed / 900))
  ];

  /* ── Inline notice: appears at 2s, fades out at 5s ── */
  const showNotice = elapsed >= 2000 && elapsed < 5000;

  /* ── Handle component switch ── */
  const handleSelect = useCallback((id: string) => {
    if (id === selectedId) return;
    const comp = COMPONENTS.find((c) => c.id === id)!;
    setSelectedId(id);
    if (!hasSwitched) setHasSwitched(true);
  }, [selectedId, hasSwitched]);

  /* ── Derived state ── */
  const selectedComp   = COMPONENTS.find((c) => c.id === selectedId)!;
  const secondaryComps = COMPONENTS.filter((c) => c.id !== selectedId);

  /* ── Content timings ── */
  // Right column (RFP) appears at 4s; left column at 4.5s
  const rfpCardVisible = hasSwitched || elapsed >= 4000;
  const cardVisible    = hasSwitched || elapsed >= 4500;

  // RFP progressive reveal (baseline: 4000ms)
  const rfpLogo        = elapsed >= 4000;
  const rfpType        = elapsed >= 4200;
  const titleCharsCount = elapsed >= 4400
    ? Math.min(TITLE_TEXT.length, Math.floor(((elapsed - 4400) / 800) * TITLE_TEXT.length))
    : 0;
  const titleText        = TITLE_TEXT.substring(0, titleCharsCount);
  const rfpOrg           = elapsed >= 4900;
  const scopeHeader      = elapsed >= 5100;
  const scopeLineCount   = elapsed >= 5700 ? 3 : elapsed >= 5500 ? 2 : elapsed >= 5300 ? 1 : 0;
  const specsVisible     = elapsed >= 5900;
  const attachmentsVisible = elapsed >= 6200;
  const buttonVisible    = elapsed >= 6800;

  const secondaryLabelVisible = hasSwitched || elapsed >= 4700;
  const secondaryItemVisible  = [hasSwitched || elapsed >= 4700, hasSwitched || elapsed >= 5000];

  /* ── Alert banner style for switched component ── */
  const switchedAlertData = selectedComp.risk === "Critical"
    ? { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", iconColor: "#EF4444", textColor: "#EF4444", text: "Critical: End-of-life component detected" }
    : { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", iconColor: "#F59E0B", textColor: "#F59E0B", text: "Flagged: Component approaching end of life" };

  return (
    <div className="flex min-h-screen" style={{ background: "#FFFFFF" }}>
      <Sidebar
        activeItem="projects"
        visitedItems={["overview", "inventory", "financials"]}
      />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div className="mx-auto" style={{ maxWidth: 1100, padding: "44px 50px 48px" }}>
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings › Meridian Condominium Association, Inc. › Projects"
            activeItem="projects"
          />

          {/* ── Agent Bar ── */}
          <AgentBar
            agentName="Compliance Agent"
            thinkingMessage={thinkingMsg}
            completeMessage="1 critical component flagged: Exterior Facade &amp; Balconies"
            accentColor="#6366F1"
            isThinking={agentIsThinking}
            isComplete={agentIsComplete}
            isHidden={false}
          />


          {/* ══ MAIN CONTENT — Two-column layout ══ */}
          <div style={{ display: "flex", gap: "3%", alignItems: "flex-start" }}>

            {/* ══ LEFT COLUMN (45%) ══ */}
            <div style={{ flex: "0 0 42%", minWidth: 0 }}>

                  {/* ── Main component card ── */}
                  <AnimatePresence mode="wait">
                    {cardVisible && (
                      <>
                        {!hasSwitched ? (
                          <motion.div
                            key="facade-phase2"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, transition: { duration: 0.2 } }}
                            transition={{ duration: 0.35, ease: "easeOut" }}
                            style={{
                              borderRadius: 10,
                              border: "1px solid rgba(220, 38, 38, 0.12)",
                              borderLeft: "3px solid #0F1729",
                              background: "rgba(255, 255, 255, 0.85)",
                              backdropFilter: "blur(8px)",
                              boxShadow: "0 0 0 1px rgba(220,38,38,0.05), 0 8px 32px rgba(220,38,38,0.09)",
                              padding: 24,
                            }}
                          >
                            <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9CA3B8", fontWeight: 500, marginBottom: 6 }}>
                              Critical: Action Required
                            </p>
                            <p style={{ fontSize: 20, fontWeight: 700, color: "#0F1729", lineHeight: 1.2, marginBottom: 8 }}>
                              Exterior Facade &amp; Balconies
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
                              <span style={{ fontSize: 12, color: "#5A6178", background: "#F8F9FC", border: "1px solid rgba(15,23,41,0.06)", borderRadius: 4, padding: "2px 8px" }}>
                                Structural
                              </span>
                              <ConditionIndicator condition="Poor" />
                            </div>
                            <div style={{ height: 1, background: "#EEEFF2", marginBottom: 14 }} />
                            {/* Remaining Useful Life row — amber dot, no red */}
                            <div style={{ display: "flex", alignItems: "center", height: 36, borderBottom: "1px solid #F8F9FC" }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B", flexShrink: 0, marginRight: 8, display: "inline-block" }} />
                              <span style={{ fontSize: 13, color: "#5A6178", flex: 1 }}>Remaining Useful Life</span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#0F1729" }}>1 year</span>
                            </div>
                            {/* Estimated Cost row */}
                            <div style={{ display: "flex", alignItems: "center", height: 36 }}>
                              <DollarSign size={14} style={{ color: "#9CA3B8", flexShrink: 0, marginRight: 8 }} />
                              <span style={{ fontSize: 13, color: "#5A6178", flex: 1 }}>Estimated Cost</span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#0F1729", fontFamily: "'JetBrains Mono', monospace" }}>$425,000</span>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key={selectedId}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.25 }}
                            style={{
                              borderRadius: 10,
                              border: selectedComp.risk === "Critical" ? "1px solid rgba(220, 38, 38, 0.12)" : "1px solid rgba(249, 115, 22, 0.15)",
                              borderLeft: "3px solid #0F1729",
                              background: "rgba(255, 255, 255, 0.85)",
                              backdropFilter: "blur(8px)",
                              boxShadow: selectedComp.risk === "Critical"
                                ? "0 0 0 1px rgba(220,38,38,0.05), 0 8px 32px rgba(220,38,38,0.09)"
                                : "0 0 0 1px rgba(249,115,22,0.06), 0 8px 32px rgba(249,115,22,0.10)",
                              padding: 24,
                            }}
                          >
                            <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9CA3B8", fontWeight: 500, marginBottom: 6 }}>
                              {selectedComp.risk === "Critical" ? "Critical: Action Required" : "Flagged: Monitor Closely"}
                            </p>
                            <p style={{ fontSize: 20, fontWeight: 700, color: "#0F1729", marginBottom: 8, lineHeight: 1.2 }}>
                              {selectedComp.name}
                            </p>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 12, background: "#F8F9FC", border: "1px solid rgba(15,23,41,0.06)", borderRadius: 4, padding: "2px 8px", color: "#5A6178" }}>
                                {selectedComp.category}
                              </span>
                              <ConditionIndicator condition={selectedComp.condition} />
                            </div>
                            <div style={{ height: 1, background: "#EEEFF2", margin: "10px 0 8px" }} />
                            {/* Remaining Useful Life row — amber dot */}
                            <div style={{ display: "flex", alignItems: "center", height: 36, borderBottom: "1px solid #F8F9FC" }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B", flexShrink: 0, marginRight: 8, display: "inline-block" }} />
                              <span style={{ fontSize: 13, color: "#5A6178", flex: 1 }}>Remaining Useful Life</span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#0F1729" }}>{selectedComp.rul}</span>
                            </div>
                            {/* Estimated Cost row */}
                            <div style={{ display: "flex", alignItems: "center", height: 36 }}>
                              <DollarSign size={14} style={{ color: "#9CA3B8", flexShrink: 0, marginRight: 8 }} />
                              <span style={{ fontSize: 13, color: "#5A6178", flex: 1 }}>Estimated Cost</span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#0F1729", fontFamily: "'JetBrains Mono', monospace" }}>{selectedComp.cost}</span>
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
                        style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 24, marginBottom: 8 }}
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
                      const isHovered  = hoveredCard === comp.id;
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
                                background: "rgba(255, 255, 255, 0.85)",
                                backdropFilter: "blur(8px)",
                                border: isSelected || isHovered ? "1px solid #4F6BFF" : "1px solid rgba(249,115,22,0.09)",
                                borderRadius: 10,
                                padding: "12px 14px",
                                cursor: "pointer",
                                boxShadow: isSelected || isHovered ? "0 0 0 3px rgba(79,107,255,0.08)" : "0 0 0 1px rgba(249,115,22,0.04), 0 8px 32px rgba(249,115,22,0.06)",
                                transition: "border-color 200ms ease, box-shadow 200ms ease",
                              }}
                            >
                              <p style={{ fontSize: 14, fontWeight: 600, color: "#0F1729", marginBottom: 6 }}>{comp.name}</p>
                              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#F59E0B", flexShrink: 0, display: "inline-block" }} />
                                <ConditionIndicator condition={comp.condition} />
                              </div>
                              <p style={{ fontSize: 12, color: "#9CA3B8" }}>
                                {comp.rul.replace("years", "yrs").replace("year", "yr")} · {comp.cost}
                              </p>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      );
                    })}
                  </div>

                </div>

                {/* ══ RIGHT COLUMN (55%) — RFP Document ══ */}
                <div style={{ flex: "0 0 55%", minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>
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
                          border: "1px solid rgba(15,23,41,0.06)",
                          boxShadow: "0 2px 8px rgba(15,23,41,0.05)",
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
                              <AnimatePresence>
                                {rfpLogo && (
                                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
                                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}
                                  >
                                    <p style={{ fontSize: 13, lineHeight: 1 }}>
                                      <span style={{ fontWeight: 700, color: "#0F1729" }}>RECO</span>
                                      <span style={{ fontWeight: 700, color: "#4F6BFF" }}>study</span>
                                      <sup style={{ fontSize: 9, color: "#9CA3B8", fontWeight: 400 }}>™</sup>
                                    </p>
                                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#9CA3B8" }}>RFP-2026-001</p>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              {rfpLogo && <div style={{ height: 1, background: "#E8EBF0", marginBottom: 12 }} />}

                              <AnimatePresence>
                                {rfpType && (
                                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
                                    style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9CA3B8", marginBottom: 8 }}
                                  >
                                    Request for Proposal
                                  </motion.p>
                                )}
                              </AnimatePresence>

                              {titleCharsCount > 0 && (
                                <p style={{ fontSize: 18, fontWeight: 700, color: "#0F1729", marginBottom: 4, lineHeight: 1.3, minHeight: 22 }}>
                                  {titleText}
                                  {titleCharsCount < TITLE_TEXT.length && (
                                    <span style={{ opacity: 0.35, fontWeight: 300 }}>|</span>
                                  )}
                                </p>
                              )}

                              <AnimatePresence>
                                {rfpOrg && (
                                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
                                    style={{ fontSize: 13, color: "#5A6178", marginBottom: 12 }}
                                  >
                                    Meridian Condominium Association, Inc.
                                  </motion.p>
                                )}
                              </AnimatePresence>

                              {rfpOrg && <div style={{ height: 1, background: "#E8EBF0", marginBottom: 10 }} />}

                              <AnimatePresence>
                                {scopeHeader && (
                                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
                                    style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, color: "#9CA3B8", marginBottom: 5 }}
                                  >
                                    Scope of Work
                                  </motion.p>
                                )}
                              </AnimatePresence>

                              <div style={{ marginBottom: 10, minHeight: scopeLineCount > 0 ? scopeLineCount * 22 : 0 }}>
                                {SCOPE_LINES.slice(0, scopeLineCount).map((line, i) => (
                                  <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}
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
                                        { label: "Est. Budget",   value: "$425,000 - $480,000"   },
                                        { label: "Timeline",      value: "Q2 2026 - Q4 2026"     },
                                        { label: "Priority",      value: "Critical"               },
                                      ].map((spec) => (
                                        <div key={spec.label}>
                                          <p style={{ fontSize: 11, color: "#9CA3B8", marginBottom: 2 }}>{spec.label}</p>
                                          <p style={{ fontSize: 13, fontWeight: 500, color: "#0F1729" }}>{spec.value}</p>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>

                              <AnimatePresence>
                                {attachmentsVisible && (
                                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.2 }}>
                                    <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 7 }}>
                                      Attachments
                                    </p>
                                    <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
                                      {["Structural Assessment Report", "Facade Inspection Photos"].map((att) => (
                                        <div key={att} style={{ display: "flex", alignItems: "center", gap: 5, background: "#F8F9FC", border: "1px solid rgba(15,23,41,0.06)", borderRadius: 4, padding: "4px 9px" }}>
                                          <Paperclip size={11} style={{ color: "#9CA3B8" }} />
                                          <span style={{ fontSize: 12, color: "#5A6178" }}>{att}</span>
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

                            /* ── Static RFP for switched component ── */
                            <motion.div
                              key={selectedId}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                                <p style={{ fontSize: 13, lineHeight: 1 }}>
                                  <span style={{ fontWeight: 700, color: "#0F1729" }}>RECO</span>
                                  <span style={{ fontWeight: 700, color: "#4F6BFF" }}>study</span>
                                  <sup style={{ fontSize: 9, color: "#9CA3B8", fontWeight: 400 }}>™</sup>
                                </p>
                                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#9CA3B8" }}>{selectedComp.rfp.id}</p>
                              </div>
                              <div style={{ height: 1, background: "#E8EBF0", marginBottom: 12 }} />
                              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "#9CA3B8", marginBottom: 8 }}>
                                Request for Proposal
                              </p>
                              <p style={{ fontSize: 18, fontWeight: 700, color: "#0F1729", marginBottom: 4, lineHeight: 1.3 }}>{selectedComp.rfp.title}</p>
                              <p style={{ fontSize: 13, color: "#5A6178", marginBottom: 12 }}>Meridian Condominium Association, Inc.</p>
                              <div style={{ height: 1, background: "#E8EBF0", marginBottom: 10 }} />
                              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 5 }}>Scope of Work</p>
                              <p style={{ fontSize: 12, color: "#5A6178", lineHeight: 1.55, marginBottom: 10 }}>{selectedComp.rfp.scope}</p>
                              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 7 }}>Specifications</p>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "7px 16px", marginBottom: 10 }}>
                                {[
                                  { label: "Building Area", value: selectedComp.rfp.area     },
                                  { label: "Est. Budget",   value: selectedComp.rfp.budget   },
                                  { label: "Timeline",      value: selectedComp.rfp.timeline },
                                  { label: "Priority",      value: selectedComp.rfp.priority },
                                ].map((spec) => (
                                  <div key={spec.label}>
                                    <p style={{ fontSize: 11, color: "#9CA3B8", marginBottom: 2 }}>{spec.label}</p>
                                    <p style={{ fontSize: 13, fontWeight: 500, color: "#0F1729" }}>{spec.value}</p>
                                  </div>
                                ))}
                              </div>
                              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 7 }}>Attachments</p>
                              <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
                                {selectedComp.rfp.attachments.map((att) => (
                                  <div key={att} style={{ display: "flex", alignItems: "center", gap: 5, background: "#F8F9FC", border: "1px solid rgba(15,23,41,0.06)", borderRadius: 4, padding: "4px 9px" }}>
                                    <Paperclip size={11} style={{ color: "#9CA3B8" }} />
                                    <span style={{ fontSize: 12, color: "#5A6178" }}>{att}</span>
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

                  {/* Send to Marketplace */}
                  <AnimatePresence>
                    {buttonVisible && (
                      <motion.button
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35, ease: "easeOut" }}
                        onClick={() => navigate("/marketplace")}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#0F1729";
                          e.currentTarget.style.color = "#FFFFFF";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#0F1729";
                        }}
                        style={{
                          width: "100%",
                          height: 48,
                          background: "transparent",
                          color: "#0F1729",
                          border: "1px solid #0F1729",
                          borderRadius: 7,
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: "pointer",
                          flexShrink: 0,
                          transition: "background 200ms, color 200ms",
                        }}
                      >
                        Send to Marketplace ›
                      </motion.button>
                    )}
                  </AnimatePresence>
                </div>

          </div>
        </div>
      </main>
    </div>
  );
};

export default Projects;
