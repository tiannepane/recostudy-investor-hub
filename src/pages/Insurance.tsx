import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  File,
  Archive,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import ConditionIndicator from "@/components/ConditionIndicator";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

/* ─── CSS Keyframes ─────────────────────────────────────── */

const KEYFRAMES = `
@keyframes pulse-dot {
  0%, 100% { opacity: 0.3; transform: scale(0.8); }
  50% { opacity: 1; transform: scale(1); }
}
`;

/* ─── Dark scan lines ────────────────────────────────────── */

const SCAN_LINES = [
  { text: "> loading building inventory \u2014 24 components...", color: "#4ADE80" },
  { text: "> checking current risk classification...", color: "#4ADE80" },
  { text: "> scanning premium history...", color: "#4ADE80" },
  { text: "> identified 3 components elevating risk profile", color: "#4ADE80" },
  { text: "> benchmarking against comparable buildings...", color: "#F59E0B" },
  { text: "> current premium $6,200 above market average", color: "#F59E0B" },
];

/* ─── Processing overlay lines ───────────────────────────── */

const PROCESSING_LINES = [
  { text: "Compliance Agent \u2014 facade project marked complete", time: 300, color: "#C4CAD8" },
  { text: "Inventory Agent \u2014 component RUL updated: Exterior Facade \u2192 Restored", time: 1000, color: "#C4CAD8" },
  { text: "Marketplace Agent \u2014 project closed, contractor payment confirmed", time: 1700, color: "#C4CAD8" },
  { text: "Funding Agent \u2014 reserve balance updated post-disbursement", time: 2400, color: "#C4CAD8" },
  { text: "Insurance Agent \u2014 risk profile recalculated...", time: 3100, color: "#C4CAD8" },
  { text: "Insurance Agent \u2014 classification: High Risk \u2192 Moderate Risk \u2713", time: 4000, color: "#10B981" },
];

/* ─── Page ──────────────────────────────────────────────── */

type Phase = "dark" | "act1" | "processing" | "act2";

const Insurance = () => {
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<Phase>("dark");
  const [transitionHov, setTransitionHov] = useState(false);
  const [reviewHov, setReviewHov] = useState(false);
  const [procElapsed, setProcElapsed] = useState(0);

  const reset = useCallback(() => {
    setElapsed(0);
    setPhase("dark");
    setProcElapsed(0);
    setAct2Elapsed(0);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (elapsed >= 3800 && phase === "dark") setPhase("act1");
  }, [elapsed, phase]);

  // Dark phase
  const scanLineCount = Math.min(6, Math.max(0, Math.floor((elapsed - 200) / 350) + 1));
  const radarHit = elapsed >= 200 + 4 * 350 && elapsed < 200 + 4 * 350 + 200;
  const dimOthers = elapsed >= 3300;

  // Act 1 timings
  const showTitle     = elapsed >= 4500;
  const showPills     = elapsed >= 4800;
  const showColumns   = elapsed >= 5200;
  const showRiskRows  = [elapsed >= 5500, elapsed >= 5700, elapsed >= 5900];
  const showBars      = elapsed >= 5600;
  const showAgentLine = elapsed >= 6200;
  const showTransBtn  = elapsed >= 6800;

  const barProgress = showBars ? Math.min(1, (elapsed - 5600) / 600) : 0;

  // Processing overlay timer
  useEffect(() => {
    if (phase !== "processing") return;
    const id = setInterval(() => setProcElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, [phase]);

  // Processing: fade lines at 4800ms, show "Updating..." at 4800ms, exit at 5500ms
  const procLinesFaded = procElapsed >= 4800;
  const procUpdating = procElapsed >= 4800;
  useEffect(() => {
    if (phase === "processing" && procElapsed >= 5500) {
      setPhase("act2");
      setAct2Elapsed(0);
    }
  }, [phase, procElapsed]);

  // Act 2 timer
  const [act2Elapsed, setAct2Elapsed] = useState(0);
  useEffect(() => {
    if (phase !== "act2") return;
    const id = setInterval(() => setAct2Elapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, [phase]);

  const savingsBarPct = phase === "act2" && act2Elapsed > 200
    ? Math.min(92, ((act2Elapsed - 200) / 800) * 92)
    : 0;

  const handleToProcessing = () => {
    setProcElapsed(0);
    setPhase("processing");
  };

  const handleBackToAct1 = () => {
    setPhase("act1");
  };

  const RISK_ROWS: { name: string; condition: "Poor" | "Fair" }[] = [
    { name: "Exterior Facade & Balconies", condition: "Poor" },
    { name: "Roof Membrane", condition: "Poor" },
    { name: "Elevator Systems", condition: "Fair" },
  ];

  const DOC_ROWS = [
    { Icon: FileText, color: "#3B82F6", bg: "#EFF6FF", label: "Updated Reserve Study Report" },
    { Icon: File, color: "#EF4444", bg: "#FEF2F2", label: "Project Completion Certificate.pdf" },
    { Icon: Archive, color: "#8B5CF6", bg: "#F3E8FF", label: "Updated Component Inventory" },
  ];

  const cardStyle: React.CSSProperties = {
    background: "#FFFFFF",
    borderRadius: 12,
    border: "1px solid #E8EBF0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
  };

  const pillStyle: React.CSSProperties = {
    ...cardStyle,
    padding: "14px 20px",
    flex: 1,
    minWidth: 0,
  };

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden", background: "#F8F9FC" }}>
      <style>{KEYFRAMES}</style>

      <Sidebar
        activeItem="insurance"
        visitedItems={["overview", "inventory", "financials", "projects", "marketplace", "funding"]}
      />

      <main className="flex-1" style={{ marginLeft: 260, position: "relative", overflow: "hidden" }}>

        {/* ══ PHASE 0 — DARK SCAN ══ */}
        <AnimatePresence>
          {phase === "dark" && (
            <motion.div
              key="dark"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
              style={{
                position: "absolute",
                inset: 0,
                background: radarHit ? "#1A1A0A" : "#0A0F1E",
                zIndex: 45,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 200ms",
              }}
            >
              <div style={{ width: "100%", maxWidth: 600, padding: "0 24px" }}>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: "0.08em", color: "#94A3B8", marginBottom: 20 }}
                >
                  &#9679; Insurance Agent
                </motion.p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {SCAN_LINES.map((line, i) => {
                    if (i >= scanLineCount) return null;
                    const isAmber = i >= 4;
                    const dimmed = dimOthers && !isAmber;
                    return (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: dimmed ? 0.2 : 1 }}
                        transition={{ opacity: { duration: dimmed ? 0.4 : 0.15 } }}
                        style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: 13, color: line.color, margin: 0, lineHeight: 1.6 }}
                      >
                        {line.text}
                      </motion.p>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══ PROCESSING OVERLAY ══ */}
        <AnimatePresence>
          {phase === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.4 } }}
              transition={{ duration: 0.3 }}
              style={{
                position: "absolute",
                inset: 0,
                background: "#0A0F1E",
                zIndex: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div style={{ width: "100%", maxWidth: 560, padding: "0 24px" }}>
                {!procUpdating && (
                  <>
                    {/* Pulsing dots */}
                    <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 20 }}>
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: "#4F6BFF",
                            animation: `pulse-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
                          }}
                        />
                      ))}
                    </div>

                    {/* Processing lines */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      {PROCESSING_LINES.map((line) => {
                        if (procElapsed < line.time) return null;
                        return (
                          <motion.div
                            key={line.text}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: procLinesFaded ? 0 : 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                            style={{ display: "flex", alignItems: "flex-start", gap: 8 }}
                          >
                            <span style={{ color: "#4F6BFF", flexShrink: 0 }}>&#10022;</span>
                            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: line.color, lineHeight: 1.5 }}>
                              {line.text}
                            </span>
                          </motion.div>
                        );
                      })}
                    </div>
                  </>
                )}

                {/* "Updating..." text */}
                {procUpdating && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    style={{ fontSize: 16, color: "#9CA3B8", textAlign: "center" }}
                  >
                    Updating your insurance profile...
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ══ LIGHT LAYOUT ══ */}
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "28px 44px 20px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings > ABC Condominium Association, Inc. > Insurance"
            activeItem="insurance"
          />

          <AnimatePresence mode="wait">

            {/* ══════════════════════════════════════════
                ACT 1 — PRE-PROJECT
            ══════════════════════════════════════════ */}
            {phase === "act1" && (
              <motion.div
                key="act1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.4 } }}
                transition={{ duration: 0.4 }}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden" }}
              >
                <div style={{ width: "100%", maxWidth: 900 }}>

                  {/* Title */}
                  <AnimatePresence>
                    {showTitle && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} style={{ marginBottom: 14 }}>
                        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0F1729", marginBottom: 4 }}>Insurance</h1>
                        <p style={{ fontSize: 13, color: "#5A6178" }}>Understanding your current risk profile and what's driving your premium.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Top summary pills */}
                  <AnimatePresence>
                    {showPills && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.35 }}
                        style={{ display: "flex", gap: 20, marginBottom: 14 }}
                      >
                        <div style={pillStyle}>
                          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", color: "#9CA3B8", marginBottom: 4 }}>Current Classification</p>
                          <p style={{ fontSize: 20, fontWeight: 700, color: "#EF4444" }}>High Risk</p>
                        </div>
                        <div style={pillStyle}>
                          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", color: "#9CA3B8", marginBottom: 4 }}>Annual Premium</p>
                          <p style={{ fontSize: 20, fontWeight: 600, color: "#0F1729", fontFamily: "'JetBrains Mono', monospace" }}>$52,000 <span style={{ fontSize: 13, fontWeight: 400, color: "#9CA3B8" }}>/ yr</span></p>
                        </div>
                        <div style={pillStyle}>
                          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", color: "#9CA3B8", marginBottom: 4 }}>vs. Market Average</p>
                          <p style={{ fontSize: 20, fontWeight: 600, color: "#F59E0B", fontFamily: "'JetBrains Mono', monospace" }}>+$6,200</p>
                          <p style={{ fontSize: 11, color: "#9CA3B8" }}>above comparable buildings</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Two columns */}
                  <AnimatePresence>
                    {showColumns && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.35 }}
                        style={{ display: "flex", gap: 20 }}
                      >
                        {/* LEFT — Risk Components */}
                        <div style={{ width: "50%" }}>
                          <div style={{ ...cardStyle, padding: "20px 22px" }}>
                            <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 12 }}>
                              Components Elevating Risk
                            </p>

                            {RISK_ROWS.map((row, i) => (
                              <AnimatePresence key={row.name}>
                                {showRiskRows[i] && (
                                  <motion.div
                                    initial={{ opacity: 0, x: -6 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.25 }}
                                    style={{
                                      display: "flex",
                                      alignItems: "center",
                                      gap: 10,
                                      padding: "10px 0",
                                      borderBottom: i < RISK_ROWS.length - 1 ? "1px solid #F1F3F6" : "none",
                                    }}
                                  >
                                    <AlertTriangle size={14} style={{ color: "#EF4444", flexShrink: 0 }} />
                                    <span style={{ fontSize: 14, fontWeight: 500, color: "#0F1729", flex: 1 }}>{row.name}</span>
                                    <ConditionIndicator condition={row.condition} />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            ))}

                            <p style={{ fontSize: 12, color: "#9CA3B8", fontStyle: "italic", lineHeight: 1.5, marginTop: 12 }}>
                              Resolving the facade project alone could lower your classification and reduce your annual premium.
                            </p>
                          </div>
                        </div>

                        {/* RIGHT — Premium Benchmark */}
                        <div style={{ width: "50%" }}>
                          <div style={{ ...cardStyle, padding: "20px 22px" }}>
                            <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 12 }}>
                              Premium Benchmark
                            </p>

                            {/* Your building bar */}
                            <div style={{ marginBottom: 12 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                <span style={{ fontSize: 12, color: "#374151" }}>Your building</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#EF4444", fontFamily: "'JetBrains Mono', monospace" }}>$52,000</span>
                              </div>
                              <div style={{ width: "100%", height: 8, borderRadius: 4, background: "#F1F3F6", overflow: "hidden" }}>
                                <div style={{ width: `${barProgress * 100}%`, height: "100%", background: "#EF4444", borderRadius: 4, transition: "width 30ms linear" }} />
                              </div>
                            </div>

                            {/* Market average bar */}
                            <div style={{ marginBottom: 16 }}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                                <span style={{ fontSize: 12, color: "#374151" }}>Market average</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: "#10B981", fontFamily: "'JetBrains Mono', monospace" }}>$45,800</span>
                              </div>
                              <div style={{ width: "100%", height: 8, borderRadius: 4, background: "#F1F3F6", overflow: "hidden" }}>
                                <div style={{ width: `${barProgress * 88}%`, height: "100%", background: "#10B981", borderRadius: 4, transition: "width 30ms linear" }} />
                              </div>
                            </div>

                            <p style={{ fontSize: 13, color: "#5A6178", marginBottom: 8 }}>What would change your premium?</p>
                            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                              <span style={{ fontSize: 12, background: "#F8F9FC", border: "1px solid #E8EBF0", borderRadius: 6, padding: "4px 10px", color: "#5A6178" }}>
                                Complete critical repairs
                              </span>
                              <span style={{ fontSize: 12, background: "#F8F9FC", border: "1px solid #E8EBF0", borderRadius: 6, padding: "4px 10px", color: "#5A6178" }}>
                                Update component inventory
                              </span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Agent insight line */}
                  <AnimatePresence>
                    {showAgentLine && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }} style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 12 }}>
                        <Sparkles size={13} style={{ color: "#4F6BFF", flexShrink: 0 }} />
                        <span style={{ fontSize: 13, color: "#9CA3B8" }}>
                          Insurance Agent identified 3 components driving 92% of your excess premium.
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* CTA button */}
                  <AnimatePresence>
                    {showTransBtn && (
                      <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
                        <button
                          onClick={handleToProcessing}
                          onMouseEnter={() => setTransitionHov(true)}
                          onMouseLeave={() => setTransitionHov(false)}
                          style={{
                            background: transitionHov ? "#1E2A3B" : "#0F1729",
                            color: "white",
                            fontSize: 14,
                            fontWeight: 500,
                            borderRadius: 8,
                            padding: "0 28px",
                            height: 44,
                            border: "none",
                            cursor: "pointer",
                            transition: "background 200ms",
                          }}
                        >
                          See what happened after the project &rarr;
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════
                ACT 2 — POST-PROJECT
            ══════════════════════════════════════════ */}
            {phase === "act2" && (
              <motion.div
                key="act2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", overflow: "hidden" }}
              >
                <div style={{ width: "100%", maxWidth: 900 }}>

                  {/* Back link */}
                  <button onClick={handleBackToAct1} style={{ fontSize: 12, color: "#9CA3B8", background: "none", border: "none", cursor: "pointer", padding: 0, marginBottom: 8 }}>
                    &larr; Back to before
                  </button>

                  {/* Title */}
                  <div style={{ marginBottom: 14 }}>
                    <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0F1729", marginBottom: 4 }}>Insurance</h1>
                    <p style={{ fontSize: 13, color: "#5A6178" }}>Project completed. Risk profile improved, savings identified.</p>
                  </div>

                  {/* Top summary pills — staggered */}
                  <div style={{ display: "flex", gap: 20, marginBottom: 14 }}>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0 }} style={pillStyle}>
                      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", color: "#9CA3B8", marginBottom: 4 }}>Risk Classification</p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 18, fontWeight: 700, color: "#EF4444", textDecoration: "line-through", opacity: 0.5 }}>High Risk</span>
                        <ArrowRight size={14} style={{ color: "#9CA3B8", flexShrink: 0 }} />
                        <span style={{ fontSize: 18, fontWeight: 700, color: "#F59E0B" }}>Moderate Risk</span>
                      </div>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.15 }} style={pillStyle}>
                      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", color: "#9CA3B8", marginBottom: 4 }}>Projected Premium</p>
                      <p style={{ fontSize: 20, fontWeight: 600, color: "#10B981", fontFamily: "'JetBrains Mono', monospace" }}>$47,800 <span style={{ fontSize: 13, fontWeight: 400, color: "#9CA3B8" }}>/ yr</span></p>
                    </motion.div>
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: 0.3 }} style={pillStyle}>
                      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", color: "#9CA3B8", marginBottom: 4 }}>Est. Annual Savings</p>
                      <p style={{ fontSize: 20, fontWeight: 700, color: "#10B981", fontFamily: "'JetBrains Mono', monospace" }}>$4,200 <span style={{ fontSize: 13, fontWeight: 400, color: "#9CA3B8" }}>/ yr</span></p>
                      <p style={{ fontSize: 11, color: "#9CA3B8" }}>projected premium reduction</p>
                    </motion.div>
                  </div>

                  {/* Two columns */}
                  <div style={{ display: "flex", gap: 20 }}>
                    {/* LEFT — Project Completed */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.2 }}
                      style={{ width: "50%", ...cardStyle, padding: "20px 22px" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <CheckCircle size={14} style={{ color: "#10B981" }} />
                        </div>
                        <span style={{ fontSize: 16, fontWeight: 600, color: "#0F1729" }}>Project Completed</span>
                      </div>
                      <p style={{ fontSize: 14, color: "#5A6178", marginBottom: 2 }}>Exterior Facade &amp; Balconies Restoration</p>
                      <p style={{ fontSize: 12, color: "#9CA3B8", marginBottom: 14 }}>March 20, 2026 &middot; $438,000 project value</p>

                      <div style={{ height: 1, background: "#F1F3F6", marginBottom: 12 }} />

                      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 10 }}>
                        Documents Generated
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {DOC_ROWS.map((doc, i) => (
                          <motion.div
                            key={doc.label}
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2, delay: 0.3 + i * 0.15 }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 10,
                              height: 40,
                              borderBottom: i < DOC_ROWS.length - 1 ? "1px solid #F1F3F6" : "none",
                            }}
                          >
                            <div style={{ width: 28, height: 28, borderRadius: 7, background: doc.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <doc.Icon size={13} style={{ color: doc.color }} />
                            </div>
                            <span style={{ fontSize: 12, color: "#374151" }}>{doc.label}</span>
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>

                    {/* RIGHT — Premium Comparison */}
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.35 }}
                      style={{ width: "50%", ...cardStyle, padding: "20px 22px" }}
                    >
                      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 12 }}>
                        Premium Comparison
                      </p>

                      {/* Current / projected rows */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6, padding: "8px 10px" }}>
                        <span style={{ fontSize: 13, color: "#9CA3B8" }}>Current premium</span>
                        <span style={{ fontSize: 13, color: "#9CA3B8", textDecoration: "line-through" }}>$52,000 / yr</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, padding: "8px 10px", background: "rgba(16,185,129,0.05)", borderRadius: 6 }}>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "#0F1729" }}>Projected premium</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: "#10B981", fontFamily: "'JetBrains Mono', monospace" }}>$47,800 / yr</span>
                      </div>

                      {/* Coverage bar */}
                      <div style={{ marginBottom: 20 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: "#9CA3B8" }}>Coverage retained</span>
                          <span style={{ fontSize: 12, fontWeight: 600, color: "#10B981" }}>92%</span>
                        </div>
                        <div style={{ width: "100%", height: 8, borderRadius: 4, background: "#F1F3F6", overflow: "hidden" }}>
                          <div style={{ width: `${savingsBarPct}%`, height: "100%", background: "#10B981", borderRadius: 4, transition: "width 30ms linear" }} />
                        </div>
                      </div>

                      {/* CTA */}
                      <button
                        onMouseEnter={() => setReviewHov(true)}
                        onMouseLeave={() => setReviewHov(false)}
                        style={{
                          width: "100%",
                          height: 44,
                          background: reviewHov ? "#D97706" : "#F59E0B",
                          color: "white",
                          fontSize: 14,
                          fontWeight: 500,
                          borderRadius: 8,
                          border: "none",
                          cursor: "pointer",
                          transition: "background 200ms",
                          marginBottom: 8,
                        }}
                      >
                        Request Premium Review &rarr;
                      </button>
                    </motion.div>
                  </div>

                  {/* Notification toast + agent line */}
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#ECFDF5",
                        border: "1px solid #D1FAE5",
                        borderRadius: 8,
                        padding: "8px 14px",
                      }}
                    >
                      <CheckCircle size={14} style={{ color: "#10B981", flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#065F46" }}>
                        Notification sent to insurer@example.com
                      </span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 }}
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      <Sparkles size={13} style={{ color: "#10B981", flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#10B981" }}>
                        Insurance Agent &mdash; premium review initiated &#10003;
                      </span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Insurance;
