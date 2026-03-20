import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

/* ─── Data ──────────────────────────────────────────────── */

type AgentMsg = { text: string; color: "gray" | "green" };

function getAgentMsg(elapsed: number): AgentMsg {
  if (elapsed >= 7500)
    return { text: "● Marketplace Agent — funding gap detected, $68,000 shortfall ✓", color: "green" };
  if (elapsed >= 3500)
    return { text: "● Marketplace Agent — analyzing bid quality and pricing...", color: "gray" };
  return { text: "● Marketplace Agent — scanning contractor bids...", color: "gray" };
}

const BIDS = [
  {
    rank: 1,
    name: "Restoration Experts LLC",
    initial: "R",
    avatarBg: "#4F6BFF",
    stars: 4.8,
    responseTime: "2 hours response",
    responseColor: "#10B981",
    note: "Best price-to-quality ratio. Strong track record with similar facade projects.",
    amount: "$438,000",
    amountRaw: 438000,
  },
  {
    rank: 2,
    name: "Facade Solutions Group",
    initial: "F",
    avatarBg: "#F59E0B",
    stars: 4.6,
    responseTime: "4 hours response",
    responseColor: "#F59E0B",
    note: "Competitive pricing. Fewer comparable project references.",
    amount: "$455,000",
    amountRaw: 455000,
  },
  {
    rank: 3,
    name: "BuildRight Contractors",
    initial: "B",
    avatarBg: "#10B981",
    stars: 4.9,
    responseTime: "1 hour response",
    responseColor: "#10B981",
    note: "Highest rated, fastest response. Premium pricing.",
    amount: "$472,000",
    amountRaw: 472000,
  },
];

// Scan start times per row
const SCAN_TIMES = [3500, 4300, 5100];
const NOTE_TIMES = [4100, 4900, 5700];
const ROW_APPEAR_TIMES = [2000, 2400, 2800];

/* ─── Scan sweep overlay ────────────────────────────────── */

const ScanSweep = ({ scanning }: { scanning: boolean }) => (
  <AnimatePresence>
    {scanning && (
      <motion.div
        key="sweep"
        initial={{ x: "-100%", opacity: 1 }}
        animate={{ x: "100%", opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(90deg, transparent 0%, rgba(79,107,255,0.08) 40%, rgba(79,107,255,0.12) 50%, rgba(79,107,255,0.08) 60%, transparent 100%)",
          pointerEvents: "none",
          borderRadius: 12,
          zIndex: 2,
        }}
      />
    )}
  </AnimatePresence>
);

/* ─── Animated progress bar ─────────────────────────────── */

const FundingBar = ({ animate }: { animate: boolean }) => {
  const FILL_PCT = 84; // 370/438 ≈ 84%
  return (
    <div
      style={{
        position: "relative",
        height: 8,
        borderRadius: 4,
        background: "#EF4444",
        overflow: "hidden",
        marginBottom: 4,
      }}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: animate ? `${FILL_PCT}%` : 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          height: "100%",
          background: "#4F6BFF",
          borderRadius: "4px 0 0 4px",
        }}
      />
    </div>
  );
};

/* ─── Page ──────────────────────────────────────────────── */

const Marketplace = () => {
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);
  const [rfpVisible, setRfpVisible] = useState(false);
  const [bidsVisible, setBidsVisible] = useState([false, false, false]);
  const [scanning, setScanning] = useState([false, false, false]);
  const [notesVisible, setNotesVisible] = useState([false, false, false]);
  const [recommended, setRecommended] = useState(false);
  const [fundingVisible, setFundingVisible] = useState(false);
  const [barAnimate, setBarAnimate] = useState(false);
  const [gapVisible, setGapVisible] = useState(false);
  const [bidsHeaderVisible, setBidsHeaderVisible] = useState(false);

  const reset = useCallback(() => {
    setElapsed(0);
    setRfpVisible(false);
    setBidsVisible([false, false, false]);
    setScanning([false, false, false]);
    setNotesVisible([false, false, false]);
    setRecommended(false);
    setFundingVisible(false);
    setBarAnimate(false);
    setGapVisible(false);
    setBidsHeaderVisible(false);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const e = elapsed;

    if (e >= 500) setRfpVisible(true);
    if (e >= 1500) setBidsHeaderVisible(true);

    // Bid rows appear
    ROW_APPEAR_TIMES.forEach((t, i) => {
      if (e >= t) setBidsVisible((p) => { const n = [...p]; n[i] = true; return n; });
    });

    // Scan sweeps (fire once each — 60ms window)
    SCAN_TIMES.forEach((t, i) => {
      if (e >= t && e < t + 60) {
        setScanning((p) => { const n = [...p]; n[i] = true; return n; });
        setTimeout(() => setScanning((p) => { const n = [...p]; n[i] = false; return n; }), 700);
      }
    });

    // Notes appear
    NOTE_TIMES.forEach((t, i) => {
      if (e >= t) setNotesVisible((p) => { const n = [...p]; n[i] = true; return n; });
    });

    // Recommend row 1
    if (e >= 6000) setRecommended(true);

    // Funding card
    if (e >= 6500) setFundingVisible(true);
    if (e >= 6500) setBarAnimate(true);
    if (e >= 7300) setGapVisible(true);
  }, [elapsed]);

  const agentMsg = getAgentMsg(elapsed);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeItem="marketplace"
        visitedItems={["overview", "inventory", "financials", "projects"]}
      />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: "48px 60px 40px" }}>
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings › ABC Condominium Association, Inc. › Marketplace"
          />

          {/* Agent status */}
          <div style={{ height: 28, marginBottom: 20, display: "flex", alignItems: "center" }}>
            <AnimatePresence mode="wait">
              <motion.p
                key={agentMsg.text}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
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

          {/* ── RFP Card (dark) ── */}
          <AnimatePresence>
            {rfpVisible && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  borderRadius: 12,
                  background: "#0F1729",
                  overflow: "hidden",
                  display: "flex",
                  marginBottom: 20,
                  minHeight: 200,
                }}
              >
                {/* Left side */}
                <div style={{ flex: "0 0 55%", padding: "24px 28px" }}>
                  {/* Live badge */}
                  <span
                    style={{
                      display: "inline-block",
                      fontSize: 10,
                      fontWeight: 600,
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                      color: "white",
                      background: "#EF4444",
                      borderRadius: 4,
                      padding: "3px 8px",
                      marginBottom: 10,
                    }}
                  >
                    Live RFP
                  </span>

                  <p
                    style={{
                      fontSize: 20,
                      fontWeight: 700,
                      color: "white",
                      marginBottom: 4,
                      lineHeight: 1.3,
                    }}
                  >
                    Exterior Facade &amp; Balconies Restoration
                  </p>
                  <p style={{ fontSize: 13, color: "#8B92A8", marginBottom: 12 }}>
                    ABC Condominium Association, Inc.
                  </p>

                  <div style={{ height: 1, background: "#1E2440", marginBottom: 12 }} />

                  {/* Detail rows */}
                  {[
                    {
                      label: "Scope",
                      value: "Full exterior restoration, balcony waterproofing, structural repair",
                      mono: false,
                      valueColor: "#C4CAD8",
                    },
                    {
                      label: "Budget Range",
                      value: "$425,000 — $480,000",
                      mono: true,
                      valueColor: "#FFFFFF",
                    },
                    {
                      label: "Timeline",
                      value: "Q2 2026 — Q4 2026",
                      mono: false,
                      valueColor: "#C4CAD8",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      style={{
                        display: "flex",
                        gap: 12,
                        marginBottom: 6,
                        fontSize: 13,
                        alignItems: "flex-start",
                      }}
                    >
                      <span style={{ color: "#6B7394", flexShrink: 0, width: 92 }}>
                        {row.label}
                      </span>
                      <span
                        style={{
                          color: row.valueColor,
                          fontFamily: row.mono ? "monospace" : "inherit",
                          fontWeight: row.mono ? 500 : 400,
                          lineHeight: 1.4,
                        }}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}

                  {/* Priority row */}
                  <div
                    style={{
                      display: "flex",
                      gap: 12,
                      fontSize: 13,
                      alignItems: "center",
                    }}
                  >
                    <span style={{ color: "#6B7394", flexShrink: 0, width: 92 }}>
                      Priority
                    </span>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#EF4444",
                          flexShrink: 0,
                        }}
                      />
                      <span style={{ color: "#EF4444" }}>Critical</span>
                    </div>
                  </div>
                </div>

                {/* Right side: image with left-to-right gradient overlay */}
                <div style={{ flex: "0 0 45%", position: "relative", overflow: "hidden" }}>
                  <img
                    src="https://images.unsplash.com/photo-1486718448742-163732cd1544?w=500&h=300&fit=crop"
                    alt="Building facade"
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      display: "block",
                    }}
                  />
                  {/* Gradient overlay */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background:
                        "linear-gradient(to right, #0F1729 0%, rgba(15,23,41,0.6) 30%, transparent 70%)",
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Bid Leaderboard ── */}
          <AnimatePresence>
            {bidsHeaderVisible && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: "flex",
                  alignItems: "baseline",
                  gap: 8,
                  marginBottom: 12,
                }}
              >
                <p
                  style={{
                    fontSize: 18,
                    fontWeight: 600,
                    color: "hsl(var(--heading))",
                  }}
                >
                  Contractor Bids
                </p>
                <p style={{ fontSize: 13, color: "#9CA3B8" }}>3 received</p>
              </motion.div>
            )}
          </AnimatePresence>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
            {BIDS.map((bid, i) => {
              const isTop = bid.rank === 1;
              const dimmed = recommended && !isTop;
              return (
                <AnimatePresence key={bid.name}>
                  {bidsVisible[i] && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{
                        opacity: dimmed ? 0.7 : 1,
                        y: 0,
                      }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      style={{
                        position: "relative",
                        borderRadius: 12,
                        border:
                          recommended && isTop
                            ? "1.5px solid #10B981"
                            : "1px solid hsl(var(--border))",
                        background: "hsl(var(--card))",
                        boxShadow:
                          recommended && isTop
                            ? "0 0 0 3px rgba(16,185,129,0.08), 0 1px 4px rgba(0,0,0,0.06)"
                            : "0 1px 4px rgba(0,0,0,0.05)",
                        height: 80,
                        display: "flex",
                        alignItems: "center",
                        padding: "0 20px",
                        gap: 16,
                        overflow: "hidden",
                        transition: "border-color 0.4s ease, box-shadow 0.4s ease",
                      }}
                    >
                      {/* Scan sweep */}
                      <ScanSweep scanning={scanning[i]} />

                      {/* Recommended badge */}
                      <AnimatePresence>
                        {recommended && isTop && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.25 }}
                            style={{
                              position: "absolute",
                              top: 10,
                              right: 14,
                              fontSize: 11,
                              fontWeight: 600,
                              color: "#10B981",
                              background: "#ECFDF5",
                              borderRadius: 4,
                              padding: "2px 8px",
                              zIndex: 3,
                            }}
                          >
                            Recommended
                          </motion.span>
                        )}
                      </AnimatePresence>

                      {/* Rank */}
                      <p
                        style={{
                          fontFamily: "monospace",
                          fontSize: 24,
                          fontWeight: 700,
                          color: recommended && isTop ? "#10B981" : "#9CA3B8",
                          width: 36,
                          flexShrink: 0,
                          textAlign: "center",
                          transition: "color 0.4s ease",
                        }}
                      >
                        {bid.rank}
                      </p>

                      {/* Avatar */}
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: "50%",
                          background: bid.avatarBg,
                          flexShrink: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 16,
                          fontWeight: 700,
                          color: "white",
                        }}
                      >
                        {bid.initial}
                      </div>

                      {/* Name + stars */}
                      <div style={{ width: 200, flexShrink: 0 }}>
                        <p
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: "#0F1729",
                            marginBottom: 3,
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {bid.name}
                        </p>
                        <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                          <Star
                            size={13}
                            style={{ color: "#F59E0B", fill: "#F59E0B", flexShrink: 0 }}
                          />
                          <span style={{ fontSize: 13, color: "#5A6178" }}>{bid.stars}</span>
                        </div>
                      </div>

                      {/* Agent analysis section */}
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16, minWidth: 0 }}>
                        {/* Response time */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 5,
                            flexShrink: 0,
                          }}
                        >
                          <Clock size={13} style={{ color: bid.responseColor }} />
                          <span
                            style={{
                              fontSize: 13,
                              color: bid.responseColor,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {bid.responseTime}
                          </span>
                        </div>

                        {/* Agent note */}
                        <AnimatePresence>
                          {notesVisible[i] && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              style={{
                                fontSize: 13,
                                color: "#5A6178",
                                fontStyle: "italic",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                                minWidth: 0,
                              }}
                            >
                              {bid.note}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Bid amount */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p
                          style={{
                            fontSize: 10,
                            fontWeight: 500,
                            color: "#9CA3B8",
                            textTransform: "uppercase",
                            letterSpacing: "0.06em",
                            marginBottom: 3,
                          }}
                        >
                          Bid Amount
                        </p>
                        <p
                          style={{
                            fontFamily: "monospace",
                            fontSize: 22,
                            fontWeight: 600,
                            color: "#0F1729",
                          }}
                        >
                          {bid.amount}
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            })}
          </div>

          {/* ── Funding Gap Card ── */}
          <AnimatePresence>
            {fundingVisible && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  maxWidth: 500,
                  margin: "0 auto",
                  borderRadius: 12,
                  border: "1px solid hsl(var(--border))",
                  background: "hsl(var(--card))",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
                  padding: "20px 24px",
                }}
              >
                {/* Label */}
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: "#9CA3B8",
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    marginBottom: 14,
                  }}
                >
                  Funding Analysis
                </p>

                {/* Two values side by side */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: 14,
                    gap: 0,
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 11, color: "#9CA3B8", marginBottom: 3 }}>
                      Reserve Balance
                    </p>
                    <p
                      style={{
                        fontFamily: "monospace",
                        fontSize: 20,
                        fontWeight: 600,
                        color: "#0F1729",
                      }}
                    >
                      $370,000
                    </p>
                  </div>

                  <p
                    style={{
                      fontSize: 20,
                      color: "#D1D5DB",
                      padding: "0 16px",
                      flexShrink: 0,
                    }}
                  >
                    →
                  </p>

                  <div style={{ flex: 1, textAlign: "right" }}>
                    <p style={{ fontSize: 11, color: "#9CA3B8", marginBottom: 3 }}>
                      Best Bid
                    </p>
                    <p
                      style={{
                        fontFamily: "monospace",
                        fontSize: 20,
                        fontWeight: 600,
                        color: "#0F1729",
                      }}
                    >
                      $438,000
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <FundingBar animate={barAnimate} />

                {/* Gap label */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                  <AnimatePresence>
                    {gapVisible && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{ fontSize: 13, fontWeight: 600, color: "#EF4444" }}
                      >
                        Gap: $68,000
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>

                {/* CTA button */}
                <button
                  onClick={() => navigate("/funding")}
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
                  }}
                >
                  Explore Funding Options ›
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Marketplace;
