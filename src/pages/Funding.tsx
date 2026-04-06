import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DollarSign, Landmark } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AgentBar from "@/components/AgentBar";

/* ─── AgentBar thinking messages (900ms per step) ─────────── */

const THINKING_MESSAGES = [
  "retrieving reserve fund balance...",
  "pulling best bid from marketplace...",
  "calculating funding gap...",
  "gap identified, $68,000 shortfall",
  "scanning lending partners for eligibility...",
];

/* ─── Page ──────────────────────────────────────────────── */

const Funding = () => {
  const [elapsed, setElapsed] = useState(0);

  const reset = useCallback(() => setElapsed(0), []);

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  // Step index (0–4), advancing every 900ms
  const stepIndex = Math.min(THINKING_MESSAGES.length - 1, Math.floor(elapsed / 900));
  const thinkingMsg = THINKING_MESSAGES[stepIndex];

  // AgentBar: thinking until 4.5s, complete after
  const agentIsThinking = elapsed < 4500;
  const agentIsComplete = elapsed >= 4500;

  // Inline gap notice: shows on step 3, fades out once cards appear
  const showGapNotice = stepIndex >= 3 && elapsed < 5300;

  // Staged content reveals
  const showSubtitle  = elapsed >= 5000;
  const showLoanCards = elapsed >= 5300;
  const showGapCard   = elapsed >= 5800;

  // Reserve bar proportions
  const reservePct = (370000 / 438000) * 100; // ~84.5%

  return (
    <div className="flex min-h-screen" style={{ background: "#F8F9FC" }}>
      <Sidebar
        activeItem="funding"
        visitedItems={["overview", "inventory", "financials", "projects", "marketplace"]}
      />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 44px 48px" }}>
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings › Meridian Condominium Association, Inc. › Funding"
            activeItem="funding"
          />

          {/* ── Agent Bar ── */}
          <AgentBar
            agentName="Funding Agent"
            thinkingMessage={thinkingMsg}
            completeMessage="2 pre-approved solutions found"
            accentColor="#0EA5E9"
            isThinking={agentIsThinking}
            isComplete={agentIsComplete}
            isHidden={false}
          />

          {/* ── Inline gap notice (fades in at step 3, fades out when cards appear) ── */}
          <AnimatePresence>
            {showGapNotice && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 20 }}>
                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#F59E0B", flexShrink: 0 }} />
                  <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: "#5A6178" }}>
                    Funding gap: $68,000 identified
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Page heading (always visible) ── */}
          <div style={{ maxWidth: 900, marginBottom: 4 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0A0A0A" }}>
              Funding
            </h1>
          </div>

          {/* ── Subtitle (fades in at 5s) ── */}
          <div style={{ maxWidth: 900, marginBottom: 20, minHeight: 20 }}>
            <AnimatePresence>
              {showSubtitle && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  style={{ fontSize: 14, color: "#9CA3B8" }}
                >
                  RECOstudy matched your building to pre-approved lending partners.
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* ── Two-column layout ── */}
          <div
            style={{
              display: "flex",
              gap: 20,
              maxWidth: 900,
            }}
          >
            {/* ─── LEFT COLUMN — 35% Gap Summary ─── */}
            <div style={{ flex: "0 0 35%", minWidth: 0 }}>
              <AnimatePresence>
                {showGapCard && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{
                      background: "rgba(255, 255, 255, 0.85)",
                      backdropFilter: "blur(8px)",
                      borderRadius: 10,
                      border: "1px solid rgba(249, 115, 22, 0.15)",
                      boxShadow: "0 0 0 1px rgba(249,115,22,0.06), 0 8px 32px rgba(249,115,22,0.10)",
                      padding: 16,
                    }}
                  >
                    {/* Section label */}
                    <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9CA3B8", fontWeight: 500, marginBottom: 14 }}>
                      Gap Summary
                    </p>

                    {/* Reserve Balance */}
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 2 }}>Reserve Balance</p>
                      <p style={{ fontSize: 20, fontWeight: 600, color: "#0F1729", fontFamily: "'JetBrains Mono', monospace" }}>$370,000</p>
                    </div>
                    <div style={{ height: 1, background: "#EEEFF2", marginBottom: 12 }} />

                    {/* Best Bid */}
                    <div style={{ marginBottom: 12 }}>
                      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 2 }}>Best Bid</p>
                      <p style={{ fontSize: 20, fontWeight: 600, color: "#0F1729", fontFamily: "'JetBrains Mono', monospace" }}>$438,000</p>
                    </div>
                    <div style={{ height: 1, background: "#EEEFF2", marginBottom: 12 }} />

                    {/* Shortfall */}
                    <div style={{ marginBottom: 16 }}>
                      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 2 }}>Shortfall</p>
                      <p style={{ fontSize: 20, fontWeight: 700, color: "#0F1729", fontFamily: "'JetBrains Mono', monospace" }}>$68,000</p>
                    </div>

                    {/* Coverage bar */}
                    <div style={{ width: "100%", height: 6, borderRadius: 3, background: "#EEEFF2", overflow: "hidden", marginBottom: 6 }}>
                      <div style={{ width: `${reservePct}%`, height: "100%", background: "#0F1729", borderRadius: 3 }} />
                    </div>
                    <p style={{ fontSize: 11, color: "#9CA3B8", marginBottom: 16 }}>
                      84% covered by reserves
                    </p>

                    {/* Context note */}
                    <div style={{ height: 1, background: "#EEEFF2", marginBottom: 12 }} />
                    <p style={{ fontSize: 12, color: "#9CA3B8", lineHeight: 1.6, marginBottom: 12 }}>
                      Your building qualifies based on a current reserve study on file. No personal guarantees required.
                    </p>

                    {/* Agent status */}
                    <p style={{ fontSize: 11, fontStyle: "italic", color: "#9CA3B8" }}>
                      Funding Agent: 2 solutions matched &#10003;
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ─── RIGHT COLUMN — 65% Loan Options ─── */}
            <div style={{ flex: "0 0 calc(65% - 20px)", minWidth: 0, display: "flex", flexDirection: "column", gap: 12 }}>

              {/* Card 1 — Reserve Loan */}
              <AnimatePresence>
                {showLoanCards && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{
                      background: "#FFFFFF",
                      backdropFilter: "blur(6px)",
                      borderRadius: 10,
                      border: "1px solid rgba(15,23,41,0.10)",
                      boxShadow: "0 0 0 1px rgba(15,23,41,0.05), 0 8px 32px rgba(15,23,41,0.09)",
                      padding: 24,
                      minHeight: 180,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Icon row + badge */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                      <DollarSign size={18} style={{ color: "#9CA3B8" }} />
                      <span style={{ fontSize: 11, fontStyle: "italic", color: "#9CA3B8" }}>
                        Pre-Approved
                      </span>
                    </div>
                    <p style={{ fontSize: 10, color: "#9CA3B8", marginBottom: 3 }}>Recommended</p>
                    <p style={{ fontSize: 18, fontWeight: 600, color: "#0F1729", marginBottom: 4 }}>
                      Reserve Loan
                    </p>
                    <p style={{ fontSize: 13, color: "#9CA3B8", marginBottom: 10 }}>
                      5.2% APR &middot; Up to $300,000
                    </p>
                    <p style={{ fontSize: 13, color: "#5A6178", lineHeight: 1.5, marginBottom: 14, flex: 1 }}>
                      Competitive rate for associations with a current reserve study on file.
                    </p>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        style={{
                          background: "transparent",
                          color: "#0F1729",
                          fontSize: 13,
                          fontWeight: 500,
                          borderRadius: 7,
                          height: 40,
                          padding: "0 20px",
                          border: "1px solid #0F1729",
                          cursor: "pointer",
                          transition: "background 200ms, color 200ms",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#0F1729";
                          e.currentTarget.style.color = "#FFFFFF";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#0F1729";
                        }}
                      >
                        Review Offer &rarr;
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Card 2 — NYC LL97 Incentive */}
              <AnimatePresence>
                {showLoanCards && (
                  <motion.div
                    initial={{ y: 10, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.4, ease: "easeOut", delay: 0.12 }}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 10,
                      border: "1px solid rgba(15,23,41,0.06)",
                      boxShadow: "0 2px 8px rgba(15,23,41,0.05)",
                      padding: 24,
                      minHeight: 180,
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    {/* Icon row + badge */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                      <Landmark size={18} style={{ color: "#9CA3B8" }} />
                      <span style={{ fontSize: 11, fontStyle: "italic", color: "#9CA3B8" }}>
                        Eligible
                      </span>
                    </div>
                    <p style={{ fontSize: 18, fontWeight: 600, color: "#0F1729", marginBottom: 4 }}>
                      NYC LL97 Incentive
                    </p>
                    <p style={{ fontSize: 13, color: "#9CA3B8", marginBottom: 10 }}>
                      Up to $25,000 offset &middot; NY Green Bank eligible
                    </p>
                    <p style={{ fontSize: 13, color: "#5A6178", lineHeight: 1.5, marginBottom: 14, flex: 1 }}>
                      Available for energy-efficient facade and HVAC projects.
                    </p>
                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        style={{
                          background: "transparent",
                          color: "#0F1729",
                          fontSize: 13,
                          fontWeight: 500,
                          borderRadius: 7,
                          height: 40,
                          padding: "0 20px",
                          border: "1px solid #0F1729",
                          cursor: "pointer",
                          transition: "background 200ms, color 200ms",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#0F1729";
                          e.currentTarget.style.color = "#FFFFFF";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#0F1729";
                        }}
                      >
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
