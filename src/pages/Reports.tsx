import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  CheckCircle,
  Send,
  Landmark,
  Shield,
  Users,
  ClipboardList,
  Sparkles,
  ChevronLeft,
  Calendar,
  Bell,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

/* ─── Keyframes ─────────────────────────────────────────── */

const KEYFRAMES = `
@keyframes blink-live {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
`;

/* ─── Data ──────────────────────────────────────────────── */

const REPORT_ITEMS = [
  { label: "Reserve Fund Status", sublabel: "1.2MB \u00b7 2 mins ago" },
  { label: "Financial Summary", sublabel: "840KB \u00b7 5 mins ago" },
  { label: "Building Condition Overview", sublabel: "2.1MB \u00b7 12 mins ago" },
  { label: "Upcoming Major Projects", sublabel: "560KB \u00b7 1 min ago" },
];

const RECENT_REQUESTS = [
  { text: "Annual Board Report requested", date: "Mar 15" },
  { text: "Lender Package \u2014 refinancing review", date: "Feb 28" },
  { text: "Insurance renewal documentation", date: "Feb 12" },
];

interface Act2Card {
  category: string;
  IconComp: React.ElementType;
  iconColor: string;
  iconBg: string;
  reports: string[];
}

const ACT2_CARDS: Act2Card[] = [
  {
    category: "For Lenders",
    IconComp: Landmark,
    iconColor: "#3B82F6",
    iconBg: "#EFF6FF",
    reports: ["RECOscore\u2122 Lender Report", "30-Year Fund Projection", "Fannie Mae Eligibility Summary"],
  },
  {
    category: "For Insurers",
    IconComp: Shield,
    iconColor: "#10B981",
    iconBg: "#F0FDF4",
    reports: ["RECOscore\u2122 Insurance Report", "Component Risk Summary", "Project Completion Certificate"],
  },
  {
    category: "For Regulators",
    IconComp: ClipboardList,
    iconColor: "#F59E0B",
    iconBg: "#FFF7ED",
    reports: ["LL97 Emissions Report", "LL11 Facade Inspection Summary", "LL84 Energy Benchmarking Export"],
  },
  {
    category: "For the Board",
    IconComp: Users,
    iconColor: "#8B5CF6",
    iconBg: "#F3E8FF",
    reports: ["Full Reserve Fund Study", "Capital Project Timeline", "Reserve Funding Strategy Report"],
  },
];

/* ─── Generate button ────────────────────────────────────── */

const GenBtn = () => {
  const [h, setH] = useState(false);
  return (
    <button
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      style={{
        background: h ? "#4F6BFF" : "white",
        color: h ? "white" : "#4F6BFF",
        border: `1px solid ${h ? "#4F6BFF" : "#E8EBF0"}`,
        fontSize: 11,
        fontWeight: 500,
        borderRadius: 6,
        padding: "4px 10px",
        cursor: "pointer",
        transition: "all 200ms",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      Generate
    </button>
  );
};

/* ─── Act 2 card ─────────────────────────────────────────── */

const Act2CardComp = ({ card, delay }: { card: Act2Card; delay: number }) => {
  const [hov, setHov] = useState(false);
  const Icon = card.IconComp;
  return (
    <motion.div
      initial={{ y: 10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3, delay }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: "#FFFFFF",
        borderRadius: 14,
        border: `1px solid ${hov ? "#4F6BFF" : "#E8EBF0"}`,
        padding: 22,
        boxShadow: hov ? "0 0 0 3px rgba(79,107,255,0.08)" : "0 2px 8px rgba(0,0,0,0.05)",
        transition: "border-color 200ms, box-shadow 200ms",
        cursor: "pointer",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: card.iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <Icon size={20} style={{ color: card.iconColor }} />
        </div>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#0F1729" }}>
          {card.category}
        </span>
      </div>
      <div style={{ height: 1, background: "#F1F3F6", marginBottom: 10 }} />
      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {card.reports.map((name) => (
          <div
            key={name}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 6,
            }}
          >
            <span style={{ fontSize: 13, color: "#374151" }}>{name}</span>
            <GenBtn />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

/* ─── Page ──────────────────────────────────────────────── */

type View = "main" | "library";

const Reports = () => {
  const [elapsed, setElapsed] = useState(0);
  const [view, setView] = useState<View>("main");
  const [exploreHov, setExploreHov] = useState(false);

  const reset = useCallback(() => {
    setElapsed(0);
    setView("main");
  }, []);

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  // Timings — notification appears first, then a pause before the rest
  const showPill = elapsed >= 300;
  const showBody = elapsed >= 500;
  const showMeta = elapsed >= 700;
  const showPackageHeader = elapsed >= 3000;
  const reportStart = 3500;
  const showDelivery = elapsed >= 6000;
  const showExploreBtn = elapsed >= 6500;

  // Recent requests (fade in after notification settles)
  const recentVisible = RECENT_REQUESTS.map((_, i) => elapsed >= 2500 + i * 150);

  // Agent status
  const agentText =
    elapsed < 6000
      ? "Reporting Agent is assembling documents..."
      : "\u2713 4 documents compiled, package ready";
  const agentColor = elapsed < 6000 ? "#5A6178" : "#10B981";
  const agentItalic = elapsed < 6000;

  const handleExplore = () => {
    setView("library");
  };

  const handleBackToMain = () => {
    setView("main");
  };

  return (
    <div className="flex" style={{ height: "100vh", overflow: "hidden", background: "#F8F9FC" }}>
      <style>{KEYFRAMES}</style>
      <Sidebar
        activeItem="reports"
        visitedItems={[
          "overview", "inventory", "financials", "projects",
          "marketplace", "funding", "insurance",
        ]}
      />

      <main className="flex-1" style={{ marginLeft: 260, overflow: "hidden", height: "100vh" }}>
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
            breadcrumb="Buildings > ABC Condominium Association, Inc. > Reports"
            activeItem="reports"
          />

          <AnimatePresence mode="wait">

            {/* ══════════════════════════════════════════════════
                MAIN VIEW — Two columns
            ══════════════════════════════════════════════════ */}
            {view === "main" && (
              <motion.div
                key="main"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.4 } }}
                transition={{ duration: 0.4 }}
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

                {/* ─── LEFT COLUMN — 38% ─── */}
                <div style={{ flex: "0 0 38%", minWidth: 0, display: "flex", flexDirection: "column" }}>

                  {/* Title */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4 }}
                    style={{ marginBottom: 20 }}
                  >
                    <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0F1729", marginBottom: 3 }}>
                      Reports
                    </h1>
                    <p style={{ fontSize: 13, color: "#5A6178" }}>
                      Your building data, formatted for every stakeholder.
                    </p>
                  </motion.div>

                  {/* Push notification card — slides in from top */}
                  <motion.div
                    initial={{ y: -30, opacity: 0, scale: 0.97 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    transition={{ duration: 0.45, ease: "easeOut", delay: 0.15 }}
                    style={{
                      background: "#0F1729",
                      borderRadius: 16,
                      borderTop: "3px solid #F59E0B",
                      padding: "22px 24px",
                      boxShadow: "0 12px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(245,158,11,0.1)",
                      marginBottom: 14,
                      position: "relative",
                    }}
                  >
                    {/* Pulsing amber dot — top right */}
                    <span
                      style={{
                        position: "absolute",
                        top: 14,
                        right: 16,
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: "#F59E0B",
                        boxShadow: "0 0 8px rgba(245,158,11,0.5)",
                        animation: "blink-live 1.5s ease-in-out infinite",
                      }}
                    />

                    {/* Header row: bell icon + pill + timestamp */}
                    <AnimatePresence>
                      {showPill && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.2 }}
                          style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}
                        >
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: 8,
                              background: "rgba(245,158,11,0.12)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                            }}
                          >
                            <Bell size={14} style={{ color: "#F59E0B" }} />
                          </div>
                          <span
                            style={{
                              fontSize: 11,
                              fontWeight: 700,
                              color: "#F59E0B",
                              letterSpacing: "0.04em",
                              textTransform: "uppercase",
                            }}
                          >
                            Incoming Request
                          </span>
                          <span style={{ fontSize: 11, color: "#64748B", marginLeft: "auto" }}>
                            9:37 AM
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Body */}
                    <AnimatePresence>
                      {showBody && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <p style={{ fontSize: 16, fontWeight: 700, color: "white", marginBottom: 4 }}>
                            Unit 4B is under contract.
                          </p>
                          <p style={{ fontSize: 13, color: "#94A3B8", lineHeight: 1.6, marginBottom: 14 }}>
                            Buyer&apos;s attorney has requested a Status Certificate.
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {showBody && (
                      <div style={{ height: 1, background: "rgba(255,255,255,0.06)", marginBottom: 12 }} />
                    )}

                    {/* Meta rows */}
                    <AnimatePresence>
                      {showMeta && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          style={{ display: "flex", flexDirection: "column", gap: 8 }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <Calendar size={13} style={{ color: "#64748B", flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: "#64748B", flex: 1 }}>Received</span>
                            <span style={{ fontSize: 12, fontWeight: 500, color: "white" }}>Today, 9:37 AM</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <FileText size={13} style={{ color: "#64748B", flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: "#64748B", flex: 1 }}>Required</span>
                            <span style={{ fontSize: 12, fontWeight: 500, color: "white" }}>Status Certificate</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>

                  {/* Agent status */}
                  <div style={{ display: "flex", alignItems: "center", gap: 5, minHeight: 18, marginBottom: 20 }}>
                    <Sparkles size={12} style={{ color: agentColor, flexShrink: 0 }} />
                    <motion.span
                      key={agentText}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.25 }}
                      style={{
                        fontSize: 12,
                        color: agentColor,
                        fontStyle: agentItalic ? "italic" : "normal",
                      }}
                    >
                      {agentText}
                    </motion.span>
                  </div>

                  {/* Recent Requests */}
                  <div>
                    <p
                      style={{
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.06em",
                        color: "#9CA3B8",
                        marginBottom: 8,
                      }}
                    >
                      Recent Requests
                    </p>
                    {RECENT_REQUESTS.map((req, i) => (
                      <AnimatePresence key={i}>
                        {recentVisible[i] && (
                          <motion.div
                            initial={{ y: 4, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ duration: 0.25 }}
                            style={{
                              background: "white",
                              borderRadius: 8,
                              border: "1px solid #F1F3F6",
                              padding: "10px 14px",
                              marginBottom: 6,
                              display: "flex",
                              alignItems: "center",
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: "#D1D5DB",
                                flexShrink: 0,
                              }}
                            />
                            <span style={{ fontSize: 12, fontWeight: 500, color: "#374151", flex: 1 }}>
                              {req.text}
                            </span>
                            <span style={{ fontSize: 11, color: "#9CA3B8", flexShrink: 0 }}>
                              {req.date}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    ))}
                  </div>
                </div>

                {/* ─── RIGHT COLUMN — 58% ─── */}
                <div style={{ flex: "0 0 58%", minWidth: 0, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden" }}>

                  {/* Package header */}
                  <AnimatePresence>
                    {showPackageHeader && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          marginBottom: 12,
                          flexShrink: 0,
                        }}
                      >
                        <span style={{ fontSize: 16, fontWeight: 700, color: "#0F1729" }}>
                          Status Certificate Package
                        </span>
                        <span style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: "#3B82F6",
                          background: "#EFF6FF",
                          borderRadius: 20,
                          padding: "3px 10px",
                        }}>
                          Auto-assembled by Reporting Agent
                        </span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Package card */}
                  <div
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 14,
                      border: "1px solid #E8EBF0",
                      padding: 20,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                      flexShrink: 0,
                    }}
                  >
                    {REPORT_ITEMS.map((item, i) => {
                      const itemStart = reportStart + i * 500;
                      const isVisible = elapsed >= itemStart;
                      const isDone = elapsed >= itemStart + 400;
                      if (!isVisible) return null;
                      return (
                        <motion.div
                          key={item.label}
                          initial={{ x: -6, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ duration: 0.25 }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            background: "#F8F9FC",
                            borderRadius: 8,
                            padding: "12px 14px",
                            border: "1px solid #ECEEF2",
                            marginBottom: 8,
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                            {isDone ? (
                              <CheckCircle size={15} style={{ color: "#10B981", flexShrink: 0 }} />
                            ) : (
                              <div
                                className="animate-spin"
                                style={{
                                  width: 15,
                                  height: 15,
                                  borderRadius: "50%",
                                  border: "2px solid #E5E7EB",
                                  borderTopColor: "#4F6BFF",
                                  flexShrink: 0,
                                }}
                              />
                            )}
                            <div style={{ minWidth: 0 }}>
                              <span style={{ fontSize: 13, fontWeight: 600, color: "#0F1729", display: "block" }}>
                                {item.label}
                              </span>
                              {isDone && (
                                <span style={{ fontSize: 11, color: "#9CA3B8" }}>{item.sublabel}</span>
                              )}
                            </div>
                          </div>
                          <AnimatePresence>
                            {isDone && (
                              <motion.span
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                  background: "#ECFDF5",
                                  color: "#10B981",
                                  fontSize: 11,
                                  borderRadius: 4,
                                  padding: "2px 8px",
                                  flexShrink: 0,
                                  marginLeft: 6,
                                }}
                              >
                                Generated
                              </motion.span>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      );
                    })}

                    {/* Delivery row */}
                    <AnimatePresence>
                      {showDelivery && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <div style={{ height: 1, background: "#F1F3F6", margin: "4px 0 10px" }} />
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                              <Send size={13} style={{ color: "#4F6BFF", flexShrink: 0 }} />
                              <span style={{ fontSize: 12, color: "#5A6178" }}>
                                Ready to send to: buyer-attorney@legalfirm.com
                              </span>
                            </div>
                            <button style={{
                              background: "#4F6BFF",
                              color: "white",
                              fontSize: 12,
                              fontWeight: 500,
                              borderRadius: 8,
                              padding: "7px 16px",
                              border: "none",
                              cursor: "pointer",
                              whiteSpace: "nowrap",
                              marginLeft: 8,
                            }}>
                              Send Package &rarr;
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Explore button */}
                  <AnimatePresence>
                    {showExploreBtn && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        style={{ display: "flex", justifyContent: "center", marginTop: 14, flexShrink: 0 }}
                      >
                        <button
                          onClick={handleExplore}
                          onMouseEnter={() => setExploreHov(true)}
                          onMouseLeave={() => setExploreHov(false)}
                          style={{
                            background: "white",
                            color: exploreHov ? "#4F6BFF" : "#374151",
                            border: `1.5px solid ${exploreHov ? "#4F6BFF" : "#E8EBF0"}`,
                            fontSize: 13,
                            fontWeight: 500,
                            borderRadius: 8,
                            padding: "10px 20px",
                            cursor: "pointer",
                            boxShadow: exploreHov ? "0 0 0 3px rgba(79,107,255,0.08)" : "none",
                            transition: "all 200ms",
                          }}
                        >
                          Explore all report types &rarr;
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            )}

            {/* ══════════════════════════════════════════════════
                ACT 2 — Full-page report library
            ══════════════════════════════════════════════════ */}
            {view === "library" && (
              <motion.div
                key="library"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.4 } }}
                transition={{ duration: 0.4 }}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  overflow: "hidden",
                }}
              >
                <div style={{ width: "100%", maxWidth: 860 }}>

                  {/* Back link */}
                  <button
                    onClick={handleBackToMain}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                      fontSize: 13,
                      color: "#9CA3B8",
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      marginBottom: 12,
                    }}
                  >
                    <ChevronLeft size={14} />
                    Back to trigger
                  </button>

                  {/* Header */}
                  <h1 style={{ fontSize: 28, fontWeight: 700, color: "#0F1729", marginBottom: 4 }}>
                    All Report Types
                  </h1>
                  <p style={{ fontSize: 14, color: "#5A6178", marginBottom: 24 }}>
                    Everything RECOstudy can generate for your building.
                  </p>

                  {/* 2x2 grid */}
                  <div style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}>
                    {ACT2_CARDS.map((card, i) => (
                      <Act2CardComp key={card.category} card={card} delay={i * 0.15} />
                    ))}
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

export default Reports;
