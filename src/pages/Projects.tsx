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

/* ─── Initial animation data (facade) ───────────────────── */

const TITLE_TEXT = "Exterior Facade & Balconies Restoration";

const SCOPE_LINES = [
  "Complete restoration of exterior facade and balcony structures.",
  "Includes waterproofing membrane replacement, concrete spall repair,",
  "railing replacement, and protective coating across all elevations.",
];

/* ─── Agent message ──────────────────────────────────────── */

type AgentMsg = { text: string; color: "gray" | "green" };

function getTimedAgentMsg(e: number): AgentMsg {
  if (e >= 8500)
    return { text: "● Compliance Agent — RFP generated, ready for marketplace ✓", color: "green" };
  if (e >= 4500)
    return { text: "● Compliance Agent — generating RFP from source data...", color: "gray" };
  if (e >= 2000)
    return { text: "● Compliance Agent — critical issue: Exterior Facade, 1 year remaining...", color: "gray" };
  return { text: "● Compliance Agent — scanning component inventory...", color: "gray" };
}

/* ─── Flow particle ─────────────────────────────────────── */

const FlowParticle = ({ active }: { active: boolean }) => (
  <AnimatePresence>
    {active && (
      <motion.div
        key="p"
        initial={{ x: 0, y: 0, opacity: 1 }}
        animate={{ x: [0, 55, 120], y: [0, -7, 0], opacity: [1, 1, 0] }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.38, ease: "easeOut", times: [0, 0.45, 1] }}
        style={{
          position: "absolute",
          right: 0,
          top: "50%",
          marginTop: -2,
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "#4F6BFF",
          pointerEvents: "none",
          zIndex: 20,
        }}
      />
    )}
  </AnimatePresence>
);

/* ─── Page ───────────────────────────────────────────────── */

const Projects = () => {
  const navigate = useNavigate();

  const [elapsed, setElapsed]             = useState(0);
  const [selectedId, setSelectedId]       = useState("facade");
  const [hasSwitched, setHasSwitched]     = useState(false);
  const [switchAgentMsg, setSwitchAgentMsg] = useState<AgentMsg | null>(null);
  const [hoveredCard, setHoveredCard]     = useState<string | null>(null);

  const reset = useCallback(() => {
    setElapsed(0);
    setSelectedId("facade");
    setHasSwitched(false);
    setSwitchAgentMsg(null);
    setHoveredCard(null);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  /* ── Handle component switch ── */
  const handleSelect = useCallback((id: string) => {
    if (id === selectedId) return;
    const comp = COMPONENTS.find((c) => c.id === id)!;
    setSelectedId(id);
    if (!hasSwitched) setHasSwitched(true);
    setSwitchAgentMsg({
      text: `● Compliance Agent — generating RFP for ${comp.name}...`,
      color: "gray",
    });
    setTimeout(() => {
      setSwitchAgentMsg({
        text: "● Compliance Agent — RFP generated, ready for marketplace ✓",
        color: "green",
      });
    }, 1500);
  }, [selectedId, hasSwitched]);

  /* ── Derived state ── */
  const selectedComp      = COMPONENTS.find((c) => c.id === selectedId)!;
  const secondaryComps    = COMPONENTS.filter((c) => c.id !== selectedId);
  const agentMsg: AgentMsg = switchAgentMsg ?? getTimedAgentMsg(elapsed);

  /* ── Initial animation visibility (facade only) ── */
  const alertVisible    = elapsed >= 1500;
  const nameVisible     = elapsed >= 2500;
  const pillCount       = elapsed >= 2800 ? 3 : elapsed >= 2700 ? 2 : elapsed >= 2600 ? 1 : 0;
  const divider1        = elapsed >= 3000;
  const detailCount     = Math.min(4, Math.max(0, Math.floor((elapsed - 3000) / 80)));
  const divider2        = elapsed >= 3400;
  const sourceHeader    = elapsed >= 4000;
  const sourceCount     = elapsed >= 4300 ? 3 : elapsed >= 4150 ? 2 : elapsed >= 4000 ? 1 : 0;
  const particles       = [
    elapsed >= 4100 && elapsed < 4520,
    elapsed >= 4250 && elapsed < 4670,
    elapsed >= 4400 && elapsed < 4820,
  ];

  /* ── RFP animation visibility ── */
  const rfpLogo           = elapsed >= 5000;
  const rfpType           = elapsed >= 5200;
  const titleCharsCount   = elapsed >= 5400 ? Math.min(TITLE_TEXT.length, Math.floor((elapsed - 5400) / 10)) : 0;
  const titleText         = TITLE_TEXT.substring(0, titleCharsCount);
  const rfpOrg            = elapsed >= 5800;
  const scopeHeader       = elapsed >= 6000;
  const scopeLineCount    = elapsed >= 6600 ? 3 : elapsed >= 6400 ? 2 : elapsed >= 6200 ? 1 : 0;
  const specsVisible      = elapsed >= 6800;
  const attachmentsVisible = elapsed >= 7300;
  const buttonVisible     = elapsed >= 8000;

  /* ── "Other Flagged" section timing ── */
  const secondaryLabelVisible = elapsed >= 9000;
  const secondary1Visible     = elapsed >= 9300;
  const secondary2Visible     = elapsed >= 9600;
  const secondaryItemVisible  = [secondary1Visible, secondary2Visible];

  /* ── Alert banner data ── */
  const alertData =
    !hasSwitched || selectedComp.risk === "Critical"
      ? {
          bg:     "rgba(239,68,68,0.08)",
          border: "rgba(239,68,68,0.2)",
          color:  "#EF4444",
          text:   "Critical: End-of-life component detected",
        }
      : {
          bg:     "rgba(245,158,11,0.08)",
          border: "rgba(245,158,11,0.2)",
          color:  "#F59E0B",
          text:   "Flagged: Component approaching end of life",
        };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeItem="projects"
        visitedItems={["overview", "inventory", "financials"]}
      />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div className="mx-auto" style={{ maxWidth: 1100, padding: "44px 50px 36px" }}>
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings › ABC Condominium Association, Inc. › Projects"
            activeItem="projects"
          />

          {/* Agent status */}
          <div style={{ height: 26, marginBottom: 18, display: "flex", alignItems: "center" }}>
            <AnimatePresence mode="wait">
              <motion.p
                key={agentMsg.text}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  fontFamily: "monospace",
                  fontSize: 13,
                  color: agentMsg.color === "green" ? "#10B981" : "#8B92A8",
                }}
              >
                {agentMsg.text}
              </motion.p>
            </AnimatePresence>
          </div>

          {/* ── Two-column layout ── */}
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

            {/* ══ LEFT COLUMN ══ */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Alert banner */}
              <AnimatePresence mode="wait">
                {alertVisible && (
                  <motion.div
                    key={hasSwitched ? selectedId : "initial"}
                    initial={{ opacity: 0 }}
                    animate={
                      hasSwitched
                        ? { opacity: 1 }
                        : { opacity: 1, x: [0, -2, 2, -2, 2, 0] }
                    }
                    exit={{ opacity: 0 }}
                    transition={
                      hasSwitched
                        ? { duration: 0.2 }
                        : { opacity: { duration: 0.2 }, x: { duration: 0.28, delay: 0.1 } }
                    }
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: alertData.bg,
                      border: `1px solid ${alertData.border}`,
                      borderRadius: 8,
                      padding: "9px 14px",
                      marginBottom: 14,
                    }}
                  >
                    <AlertTriangle size={15} style={{ color: alertData.color, flexShrink: 0 }} />
                    <p style={{ fontSize: 13, fontWeight: 500, color: alertData.color }}>
                      {alertData.text}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Main component card ── */}
              <div
                style={{
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  padding: "16px 18px",
                  overflow: "visible",
                  marginBottom: 16,
                }}
              >
                <AnimatePresence mode="wait">
                  {/* ── Initial progressive animation (facade) ── */}
                  {!hasSwitched ? (
                    <motion.div
                      key="facade-initial"
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    >
                      {/* Name */}
                      <AnimatePresence>
                        {nameVisible && (
                          <motion.p
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.22 }}
                            style={{
                              fontSize: 19,
                              fontWeight: 700,
                              color: "#0F1729",
                              marginBottom: 10,
                              lineHeight: 1.2,
                            }}
                          >
                            Exterior Facade &amp; Balconies
                          </motion.p>
                        )}
                      </AnimatePresence>

                      {/* Pills */}
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, minHeight: 22, flexWrap: "wrap" }}>
                        {pillCount >= 1 && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.18 }}
                            style={{ fontSize: 12, background: "#F8F9FC", border: "1px solid #E8EBF0", borderRadius: 4, padding: "2px 8px", color: "#5A6178" }}
                          >
                            Structural
                          </motion.span>
                        )}
                        {pillCount >= 2 && (
                          <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.18 }}>
                            <ConditionIndicator condition="Poor" />
                          </motion.div>
                        )}
                        {pillCount >= 3 && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.18 }}
                            style={{ fontSize: 12, fontWeight: 500, color: "#EF4444" }}
                          >
                            1 year RUL
                          </motion.span>
                        )}
                      </div>

                      {/* Divider 1 + Component Details */}
                      {divider1 && (
                        <>
                          <div style={{ height: 1, background: "#E8EBF0", margin: "10px 0 8px" }} />
                          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 7 }}>
                            Component Details
                          </p>
                        </>
                      )}

                      {/* Detail rows */}
                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {[
                          { label: "Location",       value: "Main Building Exterior", mono: false, risk: false },
                          { label: "Estimated Cost", value: "$425,000",               mono: true,  risk: false },
                          { label: "Last Inspection",value: "March 2025",             mono: false, risk: false },
                          { label: "Risk Level",     value: "Critical",               mono: false, risk: true  },
                        ].slice(0, detailCount).map((row) => (
                          <motion.div
                            key={row.label}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.18 }}
                            style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}
                          >
                            <span style={{ color: "#9CA3B8" }}>{row.label}</span>
                            {row.risk ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444" }} />
                                <span style={{ color: "#EF4444" }}>{row.value}</span>
                              </div>
                            ) : (
                              <span style={{ color: "#0F1729", fontFamily: row.mono ? "monospace" : "inherit", fontWeight: row.mono ? 500 : 400 }}>
                                {row.value}
                              </span>
                            )}
                          </motion.div>
                        ))}
                      </div>

                      {/* Divider 2 + Source Data */}
                      {divider2 && (
                        <>
                          <div style={{ height: 1, background: "#E8EBF0", margin: "10px 0 8px" }} />
                          <AnimatePresence>
                            {sourceHeader && (
                              <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.18 }}
                                style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 8 }}
                              >
                                Source Data
                              </motion.p>
                            )}
                          </AnimatePresence>

                          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                            {[
                              { iconBg: "#EFF6FF", iconColor: "#3B82F6", Icon: ImageIcon,  text: "Facade inspection photos (3)" },
                              { iconBg: "#FEF2F2", iconColor: "#EF4444", Icon: FileText,   text: "Structural assessment report.pdf" },
                              { iconBg: "#F3E8FF", iconColor: "#8B5CF6", Icon: Clipboard,  text: "Maintenance history — 2019-2025" },
                            ].slice(0, sourceCount).map((src, i) => (
                              <div key={i} style={{ position: "relative" }}>
                                <motion.div
                                  initial={{ opacity: 0, x: -4 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.22 }}
                                  style={{ display: "flex", alignItems: "center", gap: 10, height: 32 }}
                                >
                                  <div style={{ width: 26, height: 26, borderRadius: 6, background: src.iconBg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <src.Icon size={13} style={{ color: src.iconColor }} />
                                  </div>
                                  <span style={{ fontSize: 12, color: "#5A6178" }}>{src.text}</span>
                                </motion.div>
                                <FlowParticle active={particles[i]} />
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </motion.div>

                  ) : (
                    /* ── Static card for switched component ── */
                    <motion.div
                      key={selectedId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p style={{ fontSize: 19, fontWeight: 700, color: "#0F1729", marginBottom: 10, lineHeight: 1.2 }}>
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
                      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 7 }}>
                        Component Details
                      </p>

                      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                        {[
                          { label: "Location",        value: selectedComp.location,       mono: false, isRisk: false },
                          { label: "Estimated Cost",  value: selectedComp.cost,           mono: true,  isRisk: false },
                          { label: "Last Inspection", value: selectedComp.lastInspection, mono: false, isRisk: false },
                          { label: "Risk Level",      value: selectedComp.risk,           mono: false, isRisk: true  },
                        ].map((row) => (
                          <div key={row.label} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13 }}>
                            <span style={{ color: "#9CA3B8" }}>{row.label}</span>
                            {row.isRisk ? (
                              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: selectedComp.riskColor }} />
                                <span style={{ color: selectedComp.riskColor }}>{row.value}</span>
                              </div>
                            ) : (
                              <span style={{ color: "#0F1729", fontFamily: row.mono ? "monospace" : "inherit", fontWeight: row.mono ? 500 : 400 }}>
                                {row.value}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      <div style={{ height: 1, background: "#E8EBF0", margin: "10px 0 8px" }} />
                      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 8 }}>
                        Source Data
                      </p>

                      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                        {selectedComp.sources.map((src, i) => {
                          const Icon = SOURCE_ICON_MAP[src.icon];
                          return (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, height: 32 }}>
                              <div style={{ width: 26, height: 26, borderRadius: 6, background: src.bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Icon size={13} style={{ color: src.color }} />
                              </div>
                              <span style={{ fontSize: 12, color: "#5A6178" }}>{src.label}</span>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Other Flagged Components ── */}
              <AnimatePresence>
                {secondaryLabelVisible && (
                  <motion.p
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    style={{
                      fontSize: 11,
                      fontWeight: 500,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "#9CA3B8",
                      marginBottom: 8,
                    }}
                  >
                    Other Flagged Components
                  </motion.p>
                )}
              </AnimatePresence>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {secondaryComps.map((comp, i) => {
                  const isHovered = hoveredCard === comp.id;
                  const badgeIsCritical = comp.risk === "Critical";
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
                            background: "white",
                            border: isHovered ? "1px solid #4F6BFF" : "1px solid #E8EBF0",
                            borderRadius: 10,
                            padding: "14px 16px",
                            cursor: "pointer",
                            boxShadow: isHovered ? "0 0 0 3px rgba(79,107,255,0.08)" : "none",
                            transition: "border-color 200ms ease, box-shadow 200ms ease",
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
                                background: badgeIsCritical ? "#FEE2E2" : "#FEF3C7",
                                color: badgeIsCritical ? "#EF4444" : "#D97706",
                                borderRadius: 4,
                                padding: "2px 7px",
                                flexShrink: 0,
                              }}
                            >
                              {comp.risk}
                            </span>
                          </div>

                          {/* Condition bar */}
                          <div style={{ marginBottom: 6 }}>
                            <ConditionIndicator condition={comp.condition} />
                          </div>

                          {/* RUL + Cost */}
                          <div style={{ display: "flex", gap: 16 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <Clock size={12} style={{ color: "#9CA3B8", flexShrink: 0 }} />
                              <span style={{ fontSize: 12, color: "#5A6178" }}>{comp.rul}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                              <DollarSign size={12} style={{ color: "#9CA3B8", flexShrink: 0 }} />
                              <span style={{ fontSize: 12, color: "#5A6178", fontFamily: "monospace" }}>{comp.cost}</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  );
                })}
              </div>
            </div>

            {/* ══ RIGHT COLUMN: RFP Document ══ */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 10 }}>

              {/* Document card */}
              <div
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
                      key="rfp-initial"
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
                              <span style={{ fontWeight: 700, color: "#4F6BFF" }}>study</span>
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
                            style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, color: "#9CA3B8", marginBottom: 5 }}
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
                                { label: "Est. Budget",   value: "$425,000 — $480,000" },
                                { label: "Timeline",      value: "Q2 2026 — Q4 2026" },
                                { label: "Priority",      value: "Critical" },
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
                    /* ── Static RFP for switched component ── */
                    <motion.div
                      key={selectedId}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {/* Logo row */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                        <p style={{ fontSize: 14, lineHeight: 1 }}>
                          <span style={{ fontWeight: 700, color: "#0F1729" }}>RECO</span>
                          <span style={{ fontWeight: 700, color: "#4F6BFF" }}>study</span>
                          <sup style={{ fontSize: 9, color: "#9CA3B8", fontWeight: 400 }}>™</sup>
                        </p>
                        <p style={{ fontFamily: "monospace", fontSize: 11, color: "#9CA3B8" }}>
                          {selectedComp.rfp.id}
                        </p>
                      </div>

                      <div style={{ height: 1, background: "#E8EBF0", marginBottom: 12 }} />

                      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, color: "#9CA3B8", marginBottom: 5 }}>
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
              </div>

              {/* Send to Marketplace — stays visible once appeared */}
              <AnimatePresence>
                {buttonVisible && (
                  <motion.button
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    onClick={() => navigate("/marketplace")}
                    style={{
                      width: "100%",
                      height: 44,
                      background: "#4F6BFF",
                      color: "white",
                      border: "none",
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 500,
                      cursor: "pointer",
                      flexShrink: 0,
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
