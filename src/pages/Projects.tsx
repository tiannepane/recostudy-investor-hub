import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Image as ImageIcon,
  FileText,
  Clipboard,
  Paperclip,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import ConditionIndicator from "@/components/ConditionIndicator";

/* ─── Agent message ──────────────────────────────────────── */

type AgentMsg = { text: string; color: "gray" | "green" };

function getAgentMsg(e: number): AgentMsg {
  if (e >= 8500)
    return { text: "● Compliance Agent — RFP generated, ready for marketplace ✓", color: "green" };
  if (e >= 4500)
    return { text: "● Compliance Agent — generating RFP from source data...", color: "gray" };
  if (e >= 2000)
    return { text: "● Compliance Agent — critical issue: Exterior Facade, 1 year remaining...", color: "gray" };
  return { text: "● Compliance Agent — scanning component inventory...", color: "gray" };
}

/* ─── Data ───────────────────────────────────────────────── */

const TITLE_TEXT = "Exterior Facade & Balconies Restoration";

const SCOPE_LINES = [
  "Complete restoration of exterior facade and balcony structures.",
  "Includes waterproofing membrane replacement, concrete spall repair,",
  "railing replacement, and protective coating across all elevations.",
];

const DETAIL_ROWS = [
  { label: "Location", value: "Main Building Exterior", mono: false, risk: false },
  { label: "Estimated Cost", value: "$425,000", mono: true, risk: false },
  { label: "Last Inspection", value: "March 2025", mono: false, risk: false },
  { label: "Risk Level", value: "Critical", mono: false, risk: true },
];

const SOURCE_FILES = [
  { iconBg: "#EFF6FF", iconColor: "#3B82F6", Icon: ImageIcon, text: "Facade inspection photos (3)" },
  { iconBg: "#FEF2F2", iconColor: "#EF4444", Icon: FileText, text: "Structural assessment report.pdf" },
  { iconBg: "#F3E8FF", iconColor: "#8B5CF6", Icon: Clipboard, text: "Maintenance history — 2019-2025" },
];

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
  const [elapsed, setElapsed] = useState(0);

  const reset = useCallback(() => setElapsed(0), []);

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  /* computed visibility */
  const alertVisible   = elapsed >= 1500;
  const nameVisible    = elapsed >= 2500;
  const pillCount      = elapsed >= 2800 ? 3 : elapsed >= 2700 ? 2 : elapsed >= 2600 ? 1 : 0;
  const divider1       = elapsed >= 3000;
  const detailCount    = Math.min(4, Math.max(0, Math.floor((elapsed - 3000) / 80)));
  const divider2       = elapsed >= 3400;
  const sourceHeader   = elapsed >= 4000;
  const sourceCount    = elapsed >= 4300 ? 3 : elapsed >= 4150 ? 2 : elapsed >= 4000 ? 1 : 0;
  const particles      = [
    elapsed >= 4100 && elapsed < 4520,
    elapsed >= 4250 && elapsed < 4670,
    elapsed >= 4400 && elapsed < 4820,
  ];

  /* RFP elements */
  const rfpLogo           = elapsed >= 5000;
  const rfpType           = elapsed >= 5200;
  const titleCharsCount   = elapsed >= 5400
    ? Math.min(TITLE_TEXT.length, Math.floor((elapsed - 5400) / 10))
    : 0;
  const titleText         = TITLE_TEXT.substring(0, titleCharsCount);
  const rfpOrg            = elapsed >= 5800;
  const scopeHeader       = elapsed >= 6000;
  const scopeLineCount    = elapsed >= 6600 ? 3 : elapsed >= 6400 ? 2 : elapsed >= 6200 ? 1 : 0;
  const specsVisible      = elapsed >= 6800;
  const attachmentsVisible = elapsed >= 7300;
  const buttonVisible     = elapsed >= 8000;

  const agentMsg = getAgentMsg(elapsed);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeItem="projects"
        visitedItems={["overview", "inventory", "financials"]}
      />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div
          className="mx-auto"
          style={{ maxWidth: 1100, padding: "44px 50px 36px" }}
        >
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings › ABC Condominium Association, Inc. › Projects"
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
          <div style={{ display: "flex", gap: 24 }}>

            {/* ── LEFT: Flagged Component ── */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* Alert banner */}
              <AnimatePresence>
                {alertVisible && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, x: [0, -2, 2, -2, 2, 0] }}
                    transition={{
                      opacity: { duration: 0.2 },
                      x: { duration: 0.28, delay: 0.1 },
                    }}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      background: "rgba(239,68,68,0.08)",
                      border: "1px solid rgba(239,68,68,0.2)",
                      borderRadius: 8,
                      padding: "9px 14px",
                      marginBottom: 14,
                    }}
                  >
                    <AlertTriangle size={15} style={{ color: "#EF4444", flexShrink: 0 }} />
                    <p style={{ fontSize: 13, fontWeight: 500, color: "#EF4444" }}>
                      Critical: End-of-life component detected
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Component detail card */}
              <div
                style={{
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
                  padding: "16px 18px",
                  overflow: "visible",
                }}
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

                {/* Metadata pills */}
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, minHeight: 22, flexWrap: "wrap" }}>
                  {pillCount >= 1 && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.18 }}
                      style={{
                        fontSize: 12,
                        background: "#F8F9FC",
                        border: "1px solid #E8EBF0",
                        borderRadius: 4,
                        padding: "2px 8px",
                        color: "#5A6178",
                      }}
                    >
                      Structural
                    </motion.span>
                  )}
                  {pillCount >= 2 && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.85 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.18 }}
                    >
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
                    <p
                      style={{
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "#9CA3B8",
                        marginBottom: 7,
                      }}
                    >
                      Component Details
                    </p>
                  </>
                )}

                {/* Detail rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                  {DETAIL_ROWS.slice(0, detailCount).map((row, i) => (
                    <motion.div
                      key={row.label}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.18 }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        fontSize: 13,
                      }}
                    >
                      <span style={{ color: "#9CA3B8" }}>{row.label}</span>
                      {row.risk ? (
                        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444" }} />
                          <span style={{ color: "#EF4444" }}>{row.value}</span>
                        </div>
                      ) : (
                        <span
                          style={{
                            color: "#0F1729",
                            fontFamily: row.mono ? "monospace" : "inherit",
                            fontWeight: row.mono ? 500 : 400,
                          }}
                        >
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
                          style={{
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            color: "#9CA3B8",
                            marginBottom: 8,
                          }}
                        >
                          Source Data
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {SOURCE_FILES.slice(0, sourceCount).map((src, i) => (
                        <div key={i} style={{ position: "relative" }}>
                          <motion.div
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.22 }}
                            style={{ display: "flex", alignItems: "center", gap: 10, height: 32 }}
                          >
                            <div
                              style={{
                                width: 26,
                                height: 26,
                                borderRadius: 6,
                                background: src.iconBg,
                                flexShrink: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
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
              </div>
            </div>

            {/* ── RIGHT: RFP Document ── */}
            <div
              style={{
                flex: 1,
                minWidth: 0,
                display: "flex",
                flexDirection: "column",
                gap: 10,
              }}
            >
              {/* Document card — paper styling */}
              <div
                style={{
                  flex: 1,
                  borderRadius: 4,
                  background: "white",
                  boxShadow:
                    "0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
                  padding: "20px 22px",
                }}
              >
                {/* Logo row */}
                <AnimatePresence>
                  {rfpLogo && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 14,
                      }}
                    >
                      <p style={{ fontSize: 14, lineHeight: 1 }}>
                        <span style={{ fontWeight: 700, color: "#0F1729" }}>RECO</span>
                        <span style={{ fontWeight: 700, color: "#4F6BFF" }}>study</span>
                        <sup style={{ fontSize: 9, color: "#9CA3B8", fontWeight: 400 }}>™</sup>
                      </p>
                      <p style={{ fontFamily: "monospace", fontSize: 11, color: "#9CA3B8" }}>
                        RFP-2026-001
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {rfpLogo && (
                  <div style={{ height: 1, background: "#E8EBF0", marginBottom: 12 }} />
                )}

                {/* REQUEST FOR PROPOSAL label */}
                <AnimatePresence>
                  {rfpType && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.1em",
                        fontWeight: 600,
                        color: "#9CA3B8",
                        marginBottom: 5,
                      }}
                    >
                      Request for Proposal
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Title — typewriter */}
                {titleCharsCount > 0 && (
                  <p
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#0F1729",
                      marginBottom: 4,
                      lineHeight: 1.3,
                      minHeight: 22,
                    }}
                  >
                    {titleText}
                    {titleCharsCount < TITLE_TEXT.length && (
                      <span style={{ opacity: 0.35, fontWeight: 300 }}>|</span>
                    )}
                  </p>
                )}

                {/* Org name */}
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

                {rfpOrg && (
                  <div style={{ height: 1, background: "#E8EBF0", marginBottom: 10 }} />
                )}

                {/* Scope of Work */}
                <AnimatePresence>
                  {scopeHeader && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        fontSize: 10,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                        color: "#9CA3B8",
                        marginBottom: 5,
                      }}
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

                {/* Specifications */}
                <AnimatePresence>
                  {specsVisible && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p
                        style={{
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          fontWeight: 600,
                          color: "#9CA3B8",
                          marginBottom: 7,
                        }}
                      >
                        Specifications
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: "7px 16px",
                          marginBottom: 10,
                        }}
                      >
                        {[
                          { label: "Building Area", value: "Main Building Exterior" },
                          { label: "Est. Budget", value: "$425,000 — $480,000" },
                          { label: "Timeline", value: "Q2 2026 — Q4 2026" },
                          { label: "Priority", value: "Critical" },
                        ].map((spec) => (
                          <div key={spec.label}>
                            <p style={{ fontSize: 10, color: "#9CA3B8", marginBottom: 2 }}>
                              {spec.label}
                            </p>
                            <p style={{ fontSize: 12, fontWeight: 500, color: "#0F1729" }}>
                              {spec.value}
                            </p>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Attachments */}
                <AnimatePresence>
                  {attachmentsVisible && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <p
                        style={{
                          fontSize: 10,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          fontWeight: 600,
                          color: "#9CA3B8",
                          marginBottom: 7,
                        }}
                      >
                        Attachments
                      </p>
                      <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 12 }}>
                        {["Structural Assessment Report", "Facade Inspection Photos"].map((att) => (
                          <div
                            key={att}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 5,
                              background: "#F8F9FC",
                              border: "1px solid #E8EBF0",
                              borderRadius: 4,
                              padding: "4px 9px",
                            }}
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

              {/* Send to Marketplace button */}
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
