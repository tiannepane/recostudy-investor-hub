import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle,
  Send,
  Landmark,
  Shield,
  Users,
  Building,
  ChevronDown,
  Inbox,
  Download,
  ExternalLink,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AgentBar from "@/components/AgentBar";

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
  { text: "Lender Package, refinancing review", date: "Feb 28" },
  { text: "Insurance renewal documentation", date: "Feb 12" },
];

interface LibraryCardDef {
  category: string;
  IconComp: React.ElementType;
  reports: string[];
  isRegulators?: boolean;
}

const LIBRARY_CARDS: LibraryCardDef[] = [
  {
    category: "For Lenders",
    IconComp: Landmark,
    reports: ["RECOscore\u2122 Lender Report", "30-Year Fund Projection", "Fannie Mae Eligibility Summary"],
  },
  {
    category: "For Insurers",
    IconComp: Shield,
    reports: ["RECOscore\u2122 Insurance Report", "Component Risk Summary", "Project Completion Certificate"],
  },
  {
    category: "For Regulators",
    IconComp: Building,
    reports: [],
    isRegulators: true,
  },
  {
    category: "For the Board",
    IconComp: Users,
    reports: ["Full Reserve Fund Study", "Quarterly Meeting Report", "Reserve Funding Strategy Report"],
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
        background: "white",
        color: h ? "#0F1729" : "#5A6178",
        border: `1px solid ${h ? "#0F1729" : "rgba(15,23,41,0.06)"}`,
        fontSize: 12,
        fontWeight: 500,
        borderRadius: 6,
        padding: "4px 12px",
        cursor: "pointer",
        transition: "border-color 150ms, color 150ms",
        whiteSpace: "nowrap",
        flexShrink: 0,
      }}
    >
      Generate
    </button>
  );
};

/* ─── Regulator resource row ─────────────────────────────── */

const RegulatorRow = () => {
  const [hov, setHov] = useState(false);
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <span style={{ fontSize: 13, color: "#9CA3B8", fontStyle: "italic", flex: 1 }}>
          Compliance Resource Center
        </span>
        <a
          href="https://www.nyc.gov/site/buildings/index.page"
          target="_blank"
          rel="noopener noreferrer"
          onMouseEnter={() => setHov(true)}
          onMouseLeave={() => setHov(false)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 3,
            fontSize: 12,
            color: "#5A6178",
            textDecoration: hov ? "underline" : "none",
            flexShrink: 0,
            cursor: "pointer",
          }}
        >
          <ExternalLink size={12} />
          Open
        </a>
      </div>
      <p style={{ fontSize: 11, color: "#9CA3B8", marginTop: 4 }}>
        Direct links to NYC DOB compliance requirements
      </p>
    </div>
  );
};

/* ─── Report row (with hover) ────────────────────────────── */

const ReportRow = ({ name, isLast }: { name: string; isLast: boolean }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        height: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 6,
        borderBottom: isLast ? "none" : "1px solid #F1F3F7",
        background: hov ? "#F8F9FC" : "transparent",
        transition: "background 150ms",
        borderRadius: hov ? 4 : 0,
        padding: "0 4px",
      }}
    >
      <span style={{ fontSize: 13, color: "#0F1729" }}>{name}</span>
      <GenBtn />
    </div>
  );
};

/* ─── Library card ───────────────────────────────────────── */

const LibraryCard = ({ card }: { card: LibraryCardDef }) => {
  const Icon = card.IconComp;
  const titleColor = card.isRegulators ? "#9CA3B8" : "#0F1729";
  const cardBorder = card.isRegulators ? "1px dashed rgba(15,23,41,0.06)" : "1px solid rgba(15,23,41,0.06)";
  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 10,
        border: cardBorder,
        boxShadow: "0 2px 8px rgba(15,23,41,0.05)",
        padding: 16,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <Icon size={20} style={{ color: titleColor, flexShrink: 0 }} />
        <span style={{ fontSize: 15, fontWeight: 600, color: titleColor }}>{card.category}</span>
      </div>
      <div style={{ height: 1, background: "#EEEFF2", marginBottom: 10 }} />
      {card.isRegulators ? (
        <RegulatorRow />
      ) : (
        <div>
          {card.reports.map((name, i) => (
            <ReportRow key={name} name={name} isLast={i === card.reports.length - 1} />
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Recent request row ─────────────────────────────────── */

const RecentRow = ({ req }: { req: { text: string; date: string } }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        height: 36,
        display: "flex",
        alignItems: "center",
        padding: "0 10px",
        background: hov ? "#F8F9FC" : "transparent",
        borderBottom: "1px solid rgba(15,23,41,0.06)",
        cursor: "default",
        transition: "background 150ms",
      }}
    >
      <span style={{ fontSize: 13, color: "#0F1729", flex: 1 }}>{req.text}</span>
      <span style={{ fontSize: 12, color: "#9CA3B8", flexShrink: 0 }}>{req.date}</span>
    </div>
  );
};

/* ─── Inline "View →" link ───────────────────────────────── */

const ViewLink = () => {
  const [hov, setHov] = useState(false);
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        fontSize: 12,
        color: "#5A6178",
        cursor: "pointer",
        textDecoration: hov ? "underline" : "none",
        flexShrink: 0,
      }}
    >
      View →
    </span>
  );
};

/* ─── Page ──────────────────────────────────────────────── */

const Reports = () => {
  const [elapsed, setElapsed] = useState(0);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [trigHov, setTrigHov] = useState(false);

  const reset = useCallback(() => {
    setElapsed(0);
    setLibraryOpen(false);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  // Timings
  const showPackageHeader = elapsed >= 3000;
  const reportStart = 3500;
  const showDelivery = elapsed >= 6000;
  const showExploreBtn = elapsed >= 6500;
  const agentDone = elapsed >= 6000;

  // Recent requests (fade in after notification settles)
  const recentVisible = RECENT_REQUESTS.map((_, i) => elapsed >= 2500 + i * 150);

  return (
    <div className="flex" style={{ minHeight: "100vh", background: "#F8F9FC" }}>
      <style>{KEYFRAMES}</style>
      <Sidebar
        activeItem="reports"
        visitedItems={[
          "overview", "inventory", "financials", "projects",
          "marketplace", "funding", "insurance",
        ]}
      />

      <main className="flex-1" style={{ marginLeft: 260, overflowY: "auto", minHeight: "100vh" }}>
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "32px 44px 48px",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings › Meridian Condominium Association, Inc. › Reports"
            activeItem="reports"
          />

          {/* ── Page title + subtitle — full width, above everything ── */}
          <div style={{ maxWidth: 900, width: "100%", margin: "0 auto", marginBottom: 12 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0A0A0A", margin: 0, marginBottom: 3 }}>
              Reports
            </h1>
            <p style={{ fontSize: 14, color: "#9CA3B8", margin: 0 }}>
              Your building data, formatted for every stakeholder.
            </p>
          </div>

          <motion.div
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            style={{
              display: "flex",
              flexDirection: "column",
              maxWidth: 900,
              width: "100%",
              margin: "0 auto",
            }}
          >
            {/* ─── Agent Bar ─── */}
            <AgentBar
              agentName="Reporting Agent"
              thinkingMessage="assembling Status Certificate package..."
              completeMessage="Status Certificate package compiled, ready to send"
              accentColor="#6366F1"
              isThinking={!agentDone}
              isComplete={agentDone}
              isHidden={false}
            />

            {/* ─── Slim inbox banner ─── */}
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              style={{
                height: 44,
                width: "100%",
                background: "#FFFFFF",
                border: "1px solid rgba(15,23,41,0.06)",
                borderRadius: 8,
                padding: "0 16px",
                display: "flex",
                alignItems: "center",
                gap: 10,
                marginBottom: 8,
                flexShrink: 0,
                boxSizing: "border-box",
                boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
              }}
            >
              <Inbox size={16} style={{ color: "#9CA3B8", flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 500, color: "#9CA3B8", flexShrink: 0 }}>
                New request
              </span>
              <div style={{ width: 1, height: 16, background: "#EEEFF2", flexShrink: 0 }} />
              <span style={{ fontSize: 13, color: "#0F1729", flex: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                Unit 4B is under contract; buyer&apos;s attorney has requested a Status Certificate.
              </span>
              <span style={{ fontSize: 12, color: "#9CA3B8", flexShrink: 0 }}>Today, 9:37 AM</span>
              <ViewLink />
            </motion.div>

            {/* ─── RECENT REQUESTS label + rows ─── */}
            <div style={{ marginBottom: 20, flexShrink: 0 }}>
              <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 4 }}>
                Recent Requests
              </p>
              <div style={{ maxHeight: 120, overflow: "hidden" }}>
                {RECENT_REQUESTS.map((req, i) => (
                  <AnimatePresence key={i}>
                    {recentVisible[i] && (
                      <motion.div
                        initial={{ y: 4, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.25 }}
                      >
                        <RecentRow req={req} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                ))}
              </div>
            </div>

            {/* ─── Status Certificate Package (full width) ─── */}
            <div style={{ display: "flex", flexDirection: "column" }}>

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
                      <span style={{ fontSize: 18, fontWeight: 700, color: "#0F1729" }}>
                        Status Certificate Package
                      </span>
                      <span style={{ fontSize: 11, color: "#9CA3B8", fontStyle: "italic" }}>
                        Auto-assembled by Reporting Agent
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Package card */}
                <div
                  style={{
                    background: "rgba(255, 255, 255, 0.90)",
                    backdropFilter: "blur(6px)",
                    borderRadius: 10,
                    border: "1px solid rgba(15, 23, 41, 0.08)",
                    boxShadow: "0 0 0 1px rgba(15,23,41,0.04), 0 8px 24px rgba(15,23,41,0.07)",
                    padding: 20,
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
                          padding: "0 14px",
                          border: "1px solid #ECEEF2",
                          marginBottom: 8,
                          height: 52,
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                          {isDone ? (
                            <CheckCircle size={15} style={{ color: "#0F1729", flexShrink: 0 }} />
                          ) : (
                            <div
                              className="animate-spin"
                              style={{
                                width: 15,
                                height: 15,
                                borderRadius: "50%",
                                border: "2px solid #EEEFF2",
                                borderTopColor: "#0F1729",
                                flexShrink: 0,
                              }}
                            />
                          )}
                          <div style={{ minWidth: 0 }}>
                            <span style={{ fontSize: 14, fontWeight: 500, color: "#0F1729", display: "block" }}>
                              {item.label}
                            </span>
                            {isDone && (
                              <span style={{ fontSize: 12, color: "#9CA3B8" }}>{item.sublabel}</span>
                            )}
                          </div>
                        </div>
                        <AnimatePresence>
                          {isDone && (
                            <motion.div
                              initial={{ opacity: 0, scale: 0.8 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ duration: 0.2 }}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 4,
                                flexShrink: 0,
                                marginLeft: 8,
                              }}
                            >
                              <Download size={12} style={{ color: "#9CA3B8" }} />
                              <span style={{ fontSize: 12, color: "#9CA3B8" }}>Ready</span>
                            </motion.div>
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
                        <div style={{ height: 1, background: "#EEEFF2", margin: "4px 0 14px" }} />
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Send size={13} style={{ color: "#9CA3B8", flexShrink: 0 }} />
                            <span style={{ fontSize: 12, color: "#9CA3B8" }}>
                              Ready to send to: buyer-attorney@legalfirm.com
                            </span>
                          </div>
                          <button style={{
                            background: "#0F1729",
                            color: "white",
                            fontSize: 14,
                            fontWeight: 500,
                            borderRadius: 7,
                            height: 40,
                            padding: "0 20px",
                            border: "none",
                            cursor: "pointer",
                            whiteSpace: "nowrap",
                            marginLeft: 12,
                          }}>
                            Send Package &rarr;
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

            </div>

          </motion.div>

          {/* ── All Report Types collapsible — full width, below two columns ── */}
          <AnimatePresence>
            {showExploreBtn && (
              <motion.div
                key="library-section"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ maxWidth: 900, width: "100%", margin: "16px auto 0" }}
              >
                {/* Trigger row */}
                <div
                  onClick={() => setLibraryOpen((o) => !o)}
                  onMouseEnter={() => setTrigHov(true)}
                  onMouseLeave={() => setTrigHov(false)}
                  style={{
                    background: (trigHov || libraryOpen) ? "#F8F9FC" : "white",
                    border: "1px solid rgba(15,23,41,0.06)",
                    borderRadius: 8,
                    padding: "12px 16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    transition: "background 150ms",
                    userSelect: "none",
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, color: "#0F1729" }}>
                    All Report Types
                  </span>
                  <ChevronDown
                    size={16}
                    style={{
                      color: "#9CA3B8",
                      transform: libraryOpen ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 350ms ease-in-out",
                      flexShrink: 0,
                    }}
                  />
                </div>

                {/* Expandable content */}
                <div
                  style={{
                    overflow: "hidden",
                    maxHeight: libraryOpen ? 600 : 0,
                    opacity: libraryOpen ? 1 : 0,
                    transition: "max-height 350ms ease-in-out, opacity 250ms ease-in-out",
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 16,
                      paddingTop: 12,
                      paddingBottom: 4,
                    }}
                  >
                    {LIBRARY_CARDS.map((card) => (
                      <LibraryCard key={card.category} card={card} />
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
