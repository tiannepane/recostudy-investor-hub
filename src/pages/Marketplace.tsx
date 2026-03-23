import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Clock, Sparkles, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

/* ─── Data ──────────────────────────────────────────────── */

type AgentMsg = { text: string; color: "gray" | "green" };

function getAgentMsg(elapsed: number): AgentMsg {
  if (elapsed >= 5000)
    return { text: "● Marketplace Agent — recommended: Restoration Experts LLC ✓", color: "green" };
  if (elapsed >= 2000)
    return { text: "● Marketplace Agent — analyzing bid quality and pricing...", color: "gray" };
  return { text: "● Marketplace Agent — scanning contractor bids...", color: "gray" };
}

const BIDS = [
  {
    rank: 1,
    name: "Restoration Experts LLC",
    photo: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=80&h=80&fit=crop",
    stars: 4.8,
    responseTime: "Response within 3 business days",
    responseColor: "#5A6178",
    note: "Best price-to-quality ratio for this project scope. Strong track record with 12 comparable facade restoration projects in the GTA.",
    amount: "$438,000",
  },
  {
    rank: 2,
    name: "Facade Solutions Group",
    photo: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=80&h=80&fit=crop",
    stars: 4.6,
    responseTime: "Response within 5 business days",
    responseColor: "#5A6178",
    note: "Competitive pricing with solid structural credentials. Fewer directly comparable facade references but strong overall portfolio.",
    amount: "$455,000",
  },
  {
    rank: 3,
    name: "BuildRight Contractors",
    photo: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=80&h=80&fit=crop",
    stars: 4.9,
    responseTime: "Response within 4 business days",
    responseColor: "#5A6178",
    note: "Highest rated contractor on the platform with fastest initial response. Premium pricing reflects their demand — budget accordingly.",
    amount: "$472,000",
  },
];

// Timing per spec (ms)
const ROW_APPEAR_TIMES = [1000, 1200, 1400];
const SCAN_TIMES       = [2000, 3300, 3800];
const NOTE_TIMES       = [2800, 3600, 4100];

/* ─── Scan sweep overlay ─────────────────────────────────── */

const ScanSweep = ({ scanning }: { scanning: boolean }) => (
  <AnimatePresence>
    {scanning && (
      <motion.div
        key="sweep"
        initial={{ x: "-100%", opacity: 1 }}
        animate={{ x: "100%", opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
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

/* ─── Animated funding progress bar ─────────────────────── */

const FundingBar = ({ animate }: { animate: boolean }) => (
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
      animate={{ width: animate ? "84%" : 0 }}
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

/* ─── Page ───────────────────────────────────────────────── */

const Marketplace = () => {
  const navigate = useNavigate();

  const [elapsed, setElapsed]               = useState(0);
  const [rfpVisible, setRfpVisible]         = useState(false);
  const [bidsHeaderVisible, setBidsHeaderVisible] = useState(false);
  const [bidsVisible, setBidsVisible]       = useState([false, false, false]);
  const [scanning, setScanning]             = useState([false, false, false]);
  const [notesVisible, setNotesVisible]     = useState([false, false, false]);
  const [recommended, setRecommended]       = useState(false);
  const [modalVisible, setModalVisible]     = useState(false);
  const [modalDismissed, setModalDismissed] = useState(false);
  const [barAnimate, setBarAnimate]         = useState(false);

  const reset = useCallback(() => {
    setElapsed(0);
    setRfpVisible(false);
    setBidsHeaderVisible(false);
    setBidsVisible([false, false, false]);
    setScanning([false, false, false]);
    setNotesVisible([false, false, false]);
    setRecommended(false);
    setModalVisible(false);
    setModalDismissed(false);
    setBarAnimate(false);
  }, []);

  // Timer
  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  // Animation triggers
  useEffect(() => {
    const e = elapsed;

    if (e >= 0)   setRfpVisible(true);
    if (e >= 500) setBidsHeaderVisible(true);

    ROW_APPEAR_TIMES.forEach((t, i) => {
      if (e >= t)
        setBidsVisible((p) => { const n = [...p]; n[i] = true; return n; });
    });

    SCAN_TIMES.forEach((t, i) => {
      if (e >= t && e < t + 60) {
        setScanning((p) => { const n = [...p]; n[i] = true; return n; });
        setTimeout(
          () => setScanning((p) => { const n = [...p]; n[i] = false; return n; }),
          600,
        );
      }
    });

    NOTE_TIMES.forEach((t, i) => {
      if (e >= t)
        setNotesVisible((p) => { const n = [...p]; n[i] = true; return n; });
    });

    if (e >= 4500) setRecommended(true);

    if (e >= 7500 && !modalDismissed) {
      setModalVisible(true);
      setBarAnimate(true);
    }
  }, [elapsed, modalDismissed]);

  const agentMsg  = getAgentMsg(elapsed);
  const showModal = modalVisible && !modalDismissed;

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
            activeItem="marketplace"
          />

          {/* Agent status */}
          <div style={{ height: 28, marginBottom: 16, display: "flex", alignItems: "center" }}>
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

          {/* ── RFP Card — compressed ── */}
          <AnimatePresence>
            {rfpVisible && (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  borderRadius: 12,
                  overflow: "hidden",
                  position: "relative",
                  marginBottom: 16,
                  maxHeight: 150,
                }}
              >
                {/* Full-bleed background image */}
                <img
                  src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1200&h=300&fit=crop"
                  alt=""
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    display: "block",
                  }}
                />
                {/* Dark overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(10,15,30,0.55)",
                  }}
                />
                {/* Left — 65% */}
                <div style={{ flex: "0 0 65%", padding: 16, overflow: "hidden", position: "relative", zIndex: 1 }}>
                  {/* Badge + title on one line */}
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        fontSize: 9,
                        fontWeight: 600,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "white",
                        background: "#EF4444",
                        borderRadius: 4,
                        padding: "2px 7px",
                        flexShrink: 0,
                      }}
                    >
                      Live RFP
                    </span>
                    <p
                      style={{
                        fontSize: 18,
                        fontWeight: 700,
                        color: "white",
                        lineHeight: 1.1,
                        margin: 0,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      Exterior Facade &amp; Balconies Restoration
                    </p>
                  </div>

                  {/* Detail rows */}
                  {[
                    {
                      label: "Scope",
                      value: "Full exterior restoration, balcony waterproofing, structural repair",
                      mono: false,
                      valueColor: "#C4CAD8",
                    },
                    {
                      label: "Budget",
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
                    {
                      label: "Priority",
                      value: "Critical",
                      mono: false,
                      valueColor: "#EF4444",
                    },
                  ].map((row) => (
                    <div
                      key={row.label}
                      style={{
                        display: "flex",
                        gap: 10,
                        marginBottom: 3,
                        fontSize: 12,
                        alignItems: "flex-start",
                      }}
                    >
                      <span style={{ color: "#6B7394", flexShrink: 0, width: 56 }}>
                        {row.label}
                      </span>
                      <span
                        style={{
                          color: row.valueColor,
                          fontFamily: row.mono ? "monospace" : "inherit",
                          fontWeight: row.mono ? 500 : 400,
                          lineHeight: 1.2,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {row.value}
                      </span>
                    </div>
                  ))}
                </div>

              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Bid Leaderboard header ── */}
          <AnimatePresence>
            {bidsHeaderVisible && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ marginBottom: 10 }}
              >
                <p style={{ fontSize: 16, fontWeight: 700, color: "#0F1729", marginBottom: 4 }}>
                  Contractor Bids
                </p>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Sparkles size={12} style={{ color: "#4F6BFF" }} />
                  <p style={{ fontSize: 13, color: "#5A6178", margin: 0 }}>
                    3 bids received · Ranked by Marketplace Agent
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Bid rows ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {BIDS.map((bid, i) => {
              const isTop  = bid.rank === 1;
              const dimmed = recommended && !isTop;
              return (
                <AnimatePresence key={bid.name}>
                  {bidsVisible[i] && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: dimmed ? 0.65 : 1, y: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                      style={{
                        position: "relative",
                        borderRadius: 12,
                        border:
                          recommended && isTop
                            ? "1.5px solid #10B981"
                            : "1px solid #E8EBF0",
                        background: "hsl(var(--card))",
                        boxShadow:
                          recommended && isTop
                            ? "0 0 0 3px rgba(16,185,129,0.08), 0 1px 4px rgba(0,0,0,0.06)"
                            : "0 1px 4px rgba(0,0,0,0.05)",
                        padding: "12px 16px",
                        overflow: "hidden",
                        transition: "border-color 0.4s ease, box-shadow 0.4s ease",
                      }}
                    >
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
                              top: 8,
                              right: 12,
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

                      {/* Main bid row — ~44px tall */}
                      <div style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 44 }}>
                        {/* Rank */}
                        <p
                          style={{
                            fontFamily: "monospace",
                            fontSize: 20,
                            fontWeight: 700,
                            color: recommended && isTop ? "#10B981" : "#9CA3B8",
                            width: 26,
                            flexShrink: 0,
                            textAlign: "center",
                            transition: "color 0.4s ease",
                            margin: 0,
                          }}
                        >
                          {bid.rank}
                        </p>

                        {/* Photo avatar */}
                        <img
                          src={bid.photo}
                          alt={bid.name}
                          style={{
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            objectFit: "cover",
                            flexShrink: 0,
                          }}
                        />

                        {/* Name + stars */}
                        <div style={{ width: 190, flexShrink: 0 }}>
                          <p
                            style={{
                              fontSize: 14,
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
                              size={12}
                              style={{ color: "#F59E0B", fill: "#F59E0B", flexShrink: 0 }}
                            />
                            <span style={{ fontSize: 12, color: "#5A6178" }}>{bid.stars}</span>
                          </div>
                        </div>

                        {/* Response time */}
                        <div style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
                          <Clock size={12} style={{ color: bid.responseColor }} />
                          <span
                            style={{ fontSize: 12, color: bid.responseColor, whiteSpace: "nowrap" }}
                          >
                            {bid.responseTime}
                          </span>
                        </div>

                        <div style={{ flex: 1 }} />

                        {/* Bid amount */}
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <p
                            style={{
                              fontSize: 10,
                              fontWeight: 500,
                              color: "#9CA3B8",
                              textTransform: "uppercase",
                              letterSpacing: "0.06em",
                              marginBottom: 2,
                            }}
                          >
                            Bid Amount
                          </p>
                          <p
                            style={{
                              fontFamily: "monospace",
                              fontSize: 20,
                              fontWeight: 600,
                              color: "#0F1729",
                              margin: 0,
                            }}
                          >
                            {bid.amount}
                          </p>
                        </div>
                      </div>

                      {/* AI analysis block — slides in below */}
                      <AnimatePresence>
                        {notesVisible[i] && (
                          <motion.div
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            style={{
                              marginTop: 8,
                              background: "rgba(79,107,255,0.06)",
                              borderLeft: "3px solid #4F6BFF",
                              borderRadius: "0 6px 6px 0",
                              padding: "8px 12px",
                              display: "flex",
                              alignItems: "flex-start",
                              gap: 6,
                            }}
                          >
                            <Sparkles
                              size={14}
                              style={{ color: "#4F6BFF", flexShrink: 0, marginTop: 1 }}
                            />
                            <p
                              style={{
                                fontSize: 12.5,
                                color: "#3D4F7C",
                                margin: 0,
                                lineHeight: 1.4,
                              }}
                            >
                              {bid.note}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            })}
          </div>
        </div>
      </main>

      {/* ── Funding Modal ── */}
      <AnimatePresence>
        {showModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              onClick={() => setModalDismissed(true)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15,23,41,0.6)",
                backdropFilter: "blur(4px)",
                zIndex: 100,
              }}
            />

            {/* Centered wrapper */}
            <div
              style={{
                position: "fixed",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 101,
                pointerEvents: "none",
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{
                  maxWidth: 440,
                  width: "calc(100% - 48px)",
                  background: "white",
                  borderRadius: 16,
                  padding: 28,
                  boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
                  position: "relative",
                  pointerEvents: "auto",
                }}
              >
                {/* X close */}
                <button
                  onClick={() => setModalDismissed(true)}
                  style={{
                    position: "absolute",
                    top: 16,
                    right: 16,
                    width: 24,
                    height: 24,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: 0,
                  }}
                >
                  <X size={16} style={{ color: "#9CA3B8" }} />
                </button>

                {/* Label */}
                <p
                  style={{
                    fontSize: 10,
                    fontWeight: 500,
                    color: "#9CA3B8",
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    marginBottom: 8,
                  }}
                >
                  Funding Analysis
                </p>

                {/* Title */}
                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: "#0F1729",
                    marginBottom: 6,
                  }}
                >
                  Reserve Fund Shortfall
                </p>

                {/* Subtitle */}
                <p style={{ fontSize: 13, color: "#5A6178", marginBottom: 16 }}>
                  Your reserve balance doesn't fully cover the recommended bid.
                </p>

                {/* Divider */}
                <div style={{ height: 1, background: "#F1F3F7", marginBottom: 16 }} />

                {/* Two columns */}
                <div style={{ display: "flex", marginBottom: 14 }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: 11, color: "#9CA3B8", marginBottom: 4 }}>
                      Reserve Balance
                    </p>
                    <p
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 24,
                        fontWeight: 600,
                        color: "#0F1729",
                        margin: 0,
                      }}
                    >
                      $370,000
                    </p>
                  </div>
                  <div style={{ flex: 1, textAlign: "right" }}>
                    <p style={{ fontSize: 11, color: "#9CA3B8", marginBottom: 4 }}>
                      Recommended Bid
                    </p>
                    <p
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 24,
                        fontWeight: 600,
                        color: "#0F1729",
                        margin: 0,
                      }}
                    >
                      $438,000
                    </p>
                  </div>
                </div>

                {/* Progress bar */}
                <FundingBar animate={barAnimate} />

                {/* Shortfall label */}
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#EF4444", margin: 0 }}>
                    Shortfall: $68,000
                  </p>
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
                    marginBottom: 10,
                  }}
                >
                  View Funding Solutions →
                </button>

                {/* Dismiss note */}
                <p style={{ fontSize: 11, color: "#9CA3B8", textAlign: "center", margin: 0 }}>
                  or dismiss to continue reviewing bids
                </p>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Marketplace;
