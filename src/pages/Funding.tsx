import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Landmark, Sparkles } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

/* ─── Constants ──────────────────────────────────────────── */

const SCAN_LINES = [
  { text: "> retrieving reserve fund balance...", color: "#4ADE80" },
  { text: "> pulling best bid from marketplace...", color: "#4ADE80" },
  { text: "> calculating funding gap...", color: "#4ADE80" },
  { text: "> gap identified \u2014 $68,000 shortfall", color: "#F59E0B" },
  { text: "> scanning lending partners for eligibility...", color: "#4ADE80" },
  { text: "> 1 pre-approved solution found", color: "#4ADE80" },
];

/* ─── Page ──────────────────────────────────────────────── */

type Phase = "dark" | "light";

const Funding = () => {
  const [elapsed, setElapsed] = useState(0);
  const [phase, setPhase] = useState<Phase>("dark");

  const reset = useCallback(() => {
    setElapsed(0);
    setPhase("dark");
  }, []);

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (elapsed >= 3500 && phase === "dark") setPhase("light");
  }, [elapsed, phase]);

  // Dark phase derived
  const scanLineCount = Math.min(6, Math.max(0, Math.floor((elapsed - 200) / 350) + 1));
  const dimOthers = elapsed >= 3200;
  const radarHit = elapsed >= 200 + 3 * 350 && elapsed < 200 + 3 * 350 + 200; // line 4 (amber) appearance

  // Light phase derived (absolute ms)
  const showTitle      = elapsed >= 4000;
  const showGapCard    = elapsed >= 4300;
  const showCard1      = elapsed >= 4800;
  const showCard2      = elapsed >= 5200;

  // Reserve bar proportions
  const reservePct = (370000 / 438000) * 100; // ~84.5%

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden", background: "#F8F9FC" }}>
      <Sidebar
        activeItem="funding"
        visitedItems={["overview", "inventory", "financials", "projects", "marketplace"]}
      />

      <main className="flex-1" style={{ marginLeft: 260, position: "relative", overflow: "hidden" }}>

        {/* ══ DARK SCAN PHASE ══ */}
        <AnimatePresence>
          {phase === "dark" && (
            <motion.div
              key="dark"
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.6, ease: "easeInOut" } }}
              style={{
                position: "absolute",
                inset: 0,
                background: radarHit ? "#1A0F0F" : "#0A0F1E",
                zIndex: 45,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "background 200ms",
              }}
            >
              <div style={{ width: "100%", maxWidth: 580, padding: "0 24px" }}>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "#94A3B8",
                    marginBottom: 20,
                  }}
                >
                  &#9679; Funding Agent
                </motion.p>

                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {SCAN_LINES.map((line, i) => {
                    if (i >= scanLineCount) return null;
                    const isAmber = i === 3;
                    const isLastTwo = i >= 4;
                    const dimmed = dimOthers && !isAmber && !isLastTwo;
                    return (
                      <motion.p
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: dimmed ? 0.2 : 1 }}
                        transition={{ opacity: { duration: dimmed ? 0.4 : 0.15 } }}
                        style={{
                          fontFamily: "'Courier New', Courier, monospace",
                          fontSize: 13,
                          color: line.color,
                          margin: 0,
                          lineHeight: 1.6,
                        }}
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

        {/* ══ LIGHT LAYOUT ══ */}
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "32px 44px 24px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings > ABC Condominium Association, Inc. > Funding"
            activeItem="funding"
          />

          {/* Title */}
          <AnimatePresence>
            {showTitle && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                style={{ maxWidth: 900, width: "100%", margin: "0 auto", marginBottom: 20 }}
              >
                <h1 style={{ fontSize: 26, fontWeight: 700, color: "#0F1729", marginBottom: 4 }}>
                  Funding
                </h1>
                <p style={{ fontSize: 13, color: "#5A6178" }}>
                  RECOstudy matched your building to pre-approved lending partners.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Two-column layout */}
          <div
            style={{
              flex: 1,
              display: "flex",
              gap: "4%",
              maxWidth: 900,
              width: "100%",
              margin: "0 auto",
              minHeight: 0,
              overflow: "hidden",
            }}
          >

            {/* ─── LEFT COLUMN — 40% Gap Analysis ─── */}
            <div style={{ flex: "0 0 40%", minWidth: 0 }}>
              <AnimatePresence>
                {showGapCard && (
                  <motion.div
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 14,
                      border: "1px solid #E8EBF0",
                      padding: 28,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    {/* Section label */}
                    <p style={{ fontSize: 13, textTransform: "uppercase", color: "#9CA3B8", letterSpacing: "0.06em", marginBottom: 16 }}>
                      Funding Gap
                    </p>

                    {/* Stat: Reserve Balance */}
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ fontSize: 11, textTransform: "uppercase", color: "#9CA3B8", letterSpacing: "0.04em", marginBottom: 2 }}>Reserve Balance</p>
                      <p style={{ fontSize: 28, fontWeight: 700, color: "#0F1729" }}>$370,000</p>
                    </div>
                    <div style={{ height: 1, background: "#F1F3F6", marginBottom: 16 }} />

                    {/* Stat: Best Bid */}
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ fontSize: 11, textTransform: "uppercase", color: "#9CA3B8", letterSpacing: "0.04em", marginBottom: 2 }}>Best Bid</p>
                      <p style={{ fontSize: 28, fontWeight: 700, color: "#0F1729" }}>$438,000</p>
                    </div>
                    <div style={{ height: 1, background: "#F1F3F6", marginBottom: 16 }} />

                    {/* Stat: Shortfall */}
                    <div style={{ marginBottom: 20 }}>
                      <p style={{ fontSize: 11, textTransform: "uppercase", color: "#9CA3B8", letterSpacing: "0.04em", marginBottom: 2 }}>Shortfall</p>
                      <p style={{ fontSize: 28, fontWeight: 700, color: "#EF4444" }}>$68,000</p>
                    </div>

                    {/* Coverage bar */}
                    <p style={{ fontSize: 11, textTransform: "uppercase", color: "#9CA3B8", letterSpacing: "0.04em", marginBottom: 6 }}>Coverage</p>
                    <div style={{ width: "100%", height: 10, borderRadius: 5, background: "#EF4444", overflow: "hidden", marginBottom: 6 }}>
                      <div style={{ width: `${reservePct}%`, height: "100%", background: "#4F6BFF", borderRadius: 5 }} />
                    </div>
                    <p style={{ fontSize: 12, color: "#5A6178", marginBottom: 20 }}>
                      84% covered by reserves &middot; $68,000 remaining
                    </p>

                    {/* Context note */}
                    <div style={{ height: 1, background: "#F1F3F6", marginBottom: 16 }} />
                    <p style={{ fontSize: 12, color: "#5A6178", lineHeight: 1.6, marginBottom: 16 }}>
                      Your building qualifies based on a current reserve study on file. No personal guarantees required.
                    </p>

                    {/* Agent status */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Sparkles size={12} style={{ color: "#4F6BFF", flexShrink: 0 }} />
                      <span style={{ fontSize: 12, color: "#10B981" }}>
                        Funding Agent &mdash; 2 solutions matched &#10003;
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─── RIGHT COLUMN — 56% Solution Cards ─── */}
            <div style={{ flex: "0 0 56%", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Card 1 — Reserve Loan */}
              <AnimatePresence>
                {showCard1 && (
                  <motion.div
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 14,
                      border: "1px solid #E8EBF0",
                      padding: 22,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    {/* Top row */}
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#ECFDF5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <DollarSign size={20} style={{ color: "#10B981" }} />
                      </div>
                      <div style={{ flex: 1 }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#10B981", background: "#ECFDF5", borderRadius: 20, padding: "3px 10px" }}>
                        Pre-Approved
                      </span>
                    </div>
                    <p style={{ fontSize: 17, fontWeight: 700, color: "#0F1729", marginBottom: 4 }}>
                      Reserve Loan
                    </p>
                    <p style={{ fontSize: 13, color: "#374151", marginBottom: 10 }}>
                      5.2% APR &middot; Up to $300,000
                    </p>
                    <p style={{ fontSize: 12, color: "#5A6178", lineHeight: 1.5, marginBottom: 14 }}>
                      Competitive rate for associations with a current reserve study on file.
                    </p>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button style={{
                        background: "#0F1729",
                        color: "white",
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 8,
                        padding: "10px 22px",
                        border: "none",
                        cursor: "pointer",
                      }}>
                        Review Offer &rarr;
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Card 2 — NYC LL97 Incentive */}
              <AnimatePresence>
                {showCard2 && (
                  <motion.div
                    initial={{ y: 8, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 14,
                      border: "1px solid #E8EBF0",
                      padding: 22,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#EFF6FF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Landmark size={20} style={{ color: "#3B82F6" }} />
                      </div>
                      <div style={{ flex: 1 }} />
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#3B82F6", background: "#EFF6FF", borderRadius: 20, padding: "3px 10px" }}>
                        Eligible
                      </span>
                    </div>
                    <p style={{ fontSize: 17, fontWeight: 700, color: "#0F1729", marginBottom: 4 }}>
                      NYC LL97 Incentive
                    </p>
                    <p style={{ fontSize: 13, color: "#374151", marginBottom: 10 }}>
                      Up to $25,000 offset &middot; NY Green Bank eligible
                    </p>
                    <p style={{ fontSize: 12, color: "#5A6178", lineHeight: 1.5, marginBottom: 14 }}>
                      Available for energy-efficient facade and HVAC projects.
                    </p>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button style={{
                        background: "#0F1729",
                        color: "white",
                        fontSize: 13,
                        fontWeight: 600,
                        borderRadius: 8,
                        padding: "10px 22px",
                        border: "none",
                        cursor: "pointer",
                      }}>
                        Review Offer &rarr;
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Funding;
