import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Layers,
  Users,
  FileText,
  Landmark,
  Shield,
  Building2,
  AlertTriangle,
  Check,
  ChevronLeft,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AgentStatus from "@/components/AgentStatus";

/* ─── Data ──────────────────────────────────────────────── */

const STATUS_REPORTS = [
  "Reserve fund study (current)",
  "Financial statements summary",
  "Special assessment disclosure",
];

const PACKAGES = [
  {
    id: "status",
    name: "Status Certificate",
    icon: FileText,
    iconColor: "#4F6BFF",
    desc: "Required for every unit transaction.",
    reports: STATUS_REPORTS,
    primary: true,
  },
  {
    id: "refi",
    name: "Refinancing Package",
    icon: Landmark,
    iconColor: "#8B92A8",
    desc: "Everything a lender needs in one place.",
    reports: [
      "RECOscore Lender Report",
      "30-Year Fund Projection",
      "Fannie Mae Eligibility Summary",
    ],
    primary: false,
  },
  {
    id: "insurance",
    name: "Insurance Renewal Package",
    icon: Shield,
    iconColor: "#8B92A8",
    desc: "Prepared for annual insurance review.",
    reports: [
      "RECOscore Insurance Report",
      "Component Risk Summary",
      "Project Completion Certificates",
    ],
    primary: false,
  },
];

const STAKEHOLDERS = [
  {
    id: "lenders",
    icon: Landmark,
    label: "Lenders",
    reports: [
      "RECOscore Lender Report",
      "30-Year Fund Projection",
      "Fannie Mae Eligibility Summary",
    ],
  },
  {
    id: "insurers",
    icon: Shield,
    label: "Insurers",
    reports: [
      "RECOscore Insurance Report",
      "Component Risk Summary",
      "Project Completion Certificate",
    ],
  },
  {
    id: "regulators",
    icon: Building2,
    label: "Regulators",
    reports: [
      "LL97 Emissions Report",
      "LL11 Facade Inspection Summary",
      "LL84 Energy Benchmarking Export",
      "LL88 Lighting Compliance Report",
    ],
  },
  {
    id: "board",
    icon: Users,
    label: "Board",
    reports: [
      "Full Reserve Fund Study",
      "Capital Project Timeline",
      "Reserve Funding Strategy Report",
    ],
  },
];

const agentMessages = [
  {
    text: "Reports Agent — Status Certificate compiled, ready to send ✓",
    color: "green" as const,
    startTime: 11000,
  },
];

/* ─── Types ─────────────────────────────────────────────── */

type View = "landing" | "packages" | "individual";
type BtnState = "generate" | "generating" | "done";

/* ─── Small sub-components ──────────────────────────────── */

const StakeholderCard = ({
  label,
  icon,
  onClick,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        height: 120,
        borderRadius: 12,
        border: hov ? "1.5px solid #4F6BFF" : "1px solid hsl(var(--border))",
        background: hov ? "rgba(79,107,255,0.02)" : "hsl(var(--card))",
        boxShadow: hov
          ? "0 4px 12px rgba(79,107,255,0.10)"
          : "0 1px 3px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        cursor: "pointer",
        transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
      }}
    >
      {icon}
      <span style={{ fontSize: 14, fontWeight: 500, color: "hsl(var(--heading))" }}>
        {label}
      </span>
    </div>
  );
};

const ReportRow = ({ name, isLast }: { name: string; isLast: boolean }) => {
  const [hov, setHov] = useState(false);
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex",
        alignItems: "center",
        height: 48,
        padding: "0 16px",
        borderBottom: isLast ? "none" : "1px solid hsl(var(--border))",
        background: hov ? "hsl(var(--background))" : "transparent",
        transition: "background 0.15s ease",
      }}
    >
      <span style={{ flex: 1, fontSize: 14, fontWeight: 500, color: "hsl(var(--heading))" }}>
        {name}
      </span>
      <button
        style={{
          height: 30,
          padding: "0 14px",
          background: "transparent",
          border: "1px solid #E8EBF0",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          color: "hsl(var(--heading))",
          cursor: "pointer",
        }}
      >
        Generate
      </button>
    </div>
  );
};

/* ─── Back button ────────────────────────────────────────── */

const BackBtn = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    style={{
      display: "flex",
      alignItems: "center",
      gap: 4,
      fontSize: 13,
      color: "#5A6178",
      background: "none",
      border: "none",
      cursor: "pointer",
      padding: "0 0 14px 0",
    }}
  >
    <ChevronLeft size={14} />
    Back to Reports
  </button>
);

/* ─── Page ──────────────────────────────────────────────── */

const Reports = () => {
  const [elapsed, setElapsed] = useState(0);
  const [view, setView] = useState<View>("landing");
  const [demoActive, setDemoActive] = useState(true);
  const [landingHighlight, setLandingHighlight] = useState<
    "packages" | "individual" | null
  >(null);
  const [statusHighlighted, setStatusHighlighted] = useState(false);
  const [btnState, setBtnState] = useState<BtnState>("generate");
  const [checkmarks, setCheckmarks] = useState([false, false, false]);
  const [readyBadge, setReadyBadge] = useState(false);
  const [selectedStakeholder, setSelectedStakeholder] = useState<string | null>(
    null
  );
  const [hoveredLanding, setHoveredLanding] = useState<
    "packages" | "individual" | null
  >(null);

  const reset = useCallback(() => {
    setElapsed(0);
    setView("landing");
    setDemoActive(true);
    setLandingHighlight(null);
    setStatusHighlighted(false);
    setBtnState("generate");
    setCheckmarks([false, false, false]);
    setReadyBadge(false);
    setSelectedStakeholder(null);
    setHoveredLanding(null);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!demoActive) return;
    const e = elapsed;
    if (e >= 4000) setLandingHighlight("packages");
    if (e >= 5000) setView("packages");
    if (e >= 6000) setStatusHighlighted(true);
    if (e >= 7000) setBtnState((p) => (p === "generate" ? "generating" : p));
    if (e >= 8000) setCheckmarks((p) => (p[0] ? p : [true, false, false]));
    if (e >= 8600) setCheckmarks((p) => (p[1] ? p : [true, true, false]));
    if (e >= 9200) setCheckmarks((p) => (p[2] ? p : [true, true, true]));
    if (e >= 10000) {
      setBtnState((p) => (p === "generating" ? "done" : p));
      setReadyBadge(true);
    }
  }, [elapsed, demoActive]);

  const showNotification = elapsed >= 1500 && elapsed < 4000;

  const goBack = () => {
    setDemoActive(false);
    setView("landing");
    setSelectedStakeholder(null);
  };

  const landingCardStyle = (id: "packages" | "individual"): React.CSSProperties => {
    const active = landingHighlight === id || hoveredLanding === id;
    return {
      flex: 1,
      height: 160,
      borderRadius: 12,
      border: active ? "2px solid #4F6BFF" : "1px solid hsl(var(--border))",
      background: "hsl(var(--card))",
      boxShadow: active
        ? "0 4px 16px rgba(79,107,255,0.12)"
        : "0 1px 3px rgba(0,0,0,0.04)",
      transform: landingHighlight === id ? "scale(1.02)" : "scale(1)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      cursor: "pointer",
      transition: "border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease",
    };
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeItem="reports"
        visitedItems={[
          "overview",
          "inventory",
          "financials",
          "projects",
          "marketplace",
          "funding",
          "insurance",
        ]}
      />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div
          className="mx-auto"
          style={{ maxWidth: 1200, padding: 60, position: "relative" }}
        >
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings › ABC Condominium Association, Inc. › Reports"
            activeItem="reports"
          />

          <div style={{ marginBottom: 20 }}>
            <AgentStatus messages={agentMessages} elapsed={elapsed} />
          </div>

          {/* ── Notification ── */}
          <AnimatePresence>
            {showNotification && (
              <motion.div
                initial={{ x: 80, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: 80, opacity: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  top: 108,
                  right: 0,
                  zIndex: 100,
                  maxWidth: 360,
                  background: "#FFFFFF",
                  borderRadius: 12,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
                  borderLeft: "4px solid #F59E0B",
                  padding: "14px 16px",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 10,
                }}
              >
                <AlertTriangle
                  size={16}
                  style={{ color: "#F59E0B", flexShrink: 0, marginTop: 2 }}
                />
                <div>
                  <p
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#0F1729",
                      marginBottom: 3,
                    }}
                  >
                    Unit 4B is in contract
                  </p>
                  <p style={{ fontSize: 13, color: "#5A6178" }}>
                    Buyer's attorney has requested a Status Certificate.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Views ── */}
          <AnimatePresence mode="wait">
            {/* Landing */}
            {view === "landing" && (
              <motion.div
                key="landing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
              >
                <p
                  className="text-heading"
                  style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}
                >
                  Reports
                </p>
                <p style={{ fontSize: 14, color: "#5A6178", marginBottom: 32 }}>
                  Your building data, formatted for every stakeholder.
                </p>
                <div style={{ display: "flex", gap: 16 }}>
                  <div
                    style={landingCardStyle("packages")}
                    onClick={() => {
                      setDemoActive(false);
                      setView("packages");
                    }}
                    onMouseEnter={() => setHoveredLanding("packages")}
                    onMouseLeave={() => setHoveredLanding(null)}
                  >
                    <Layers size={32} style={{ color: "#9CA3B8" }} />
                    <div style={{ textAlign: "center" }}>
                      <p
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: "hsl(var(--heading))",
                          marginBottom: 4,
                        }}
                      >
                        Special Packages
                      </p>
                      <p style={{ fontSize: 13, color: "#5A6178" }}>
                        Pre-bundled reports for common scenarios
                      </p>
                    </div>
                  </div>

                  <div
                    style={landingCardStyle("individual")}
                    onClick={() => {
                      setDemoActive(false);
                      setView("individual");
                    }}
                    onMouseEnter={() => setHoveredLanding("individual")}
                    onMouseLeave={() => setHoveredLanding(null)}
                  >
                    <Users size={32} style={{ color: "#9CA3B8" }} />
                    <div style={{ textAlign: "center" }}>
                      <p
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: "hsl(var(--heading))",
                          marginBottom: 4,
                        }}
                      >
                        Individual Reports
                      </p>
                      <p style={{ fontSize: 13, color: "#5A6178" }}>
                        Generate reports by stakeholder
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Packages */}
            {view === "packages" && (
              <motion.div
                key="packages"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <BackBtn onClick={goBack} />

                <p
                  style={{
                    fontSize: 20,
                    fontWeight: 600,
                    color: "hsl(var(--heading))",
                    marginBottom: 16,
                  }}
                >
                  Special Packages
                </p>

                <div style={{ display: "flex", gap: 16 }}>
                  {PACKAGES.map((pkg) => {
                    const Icon = pkg.icon;
                    const isStatus = pkg.id === "status";
                    const highlighted = isStatus && statusHighlighted;

                    return (
                      <div
                        key={pkg.id}
                        style={{
                          flex: 1,
                          borderRadius: 12,
                          border: highlighted
                            ? "1.5px solid #4F6BFF"
                            : "1px solid hsl(var(--border))",
                          background: "hsl(var(--card))",
                          padding: 16,
                          position: "relative",
                          boxShadow: highlighted
                            ? "0 0 0 4px rgba(79,107,255,0.10), 0 1px 3px rgba(0,0,0,0.04)"
                            : "0 1px 3px rgba(0,0,0,0.04)",
                          transition: "border-color 0.4s, box-shadow 0.4s",
                        }}
                      >
                        {/* Ready to Send badge */}
                        {isStatus && readyBadge && (
                          <motion.span
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              position: "absolute",
                              top: 12,
                              left: 12,
                              fontSize: 11,
                              fontWeight: 500,
                              color: "#10B981",
                              background: "#ECFDF5",
                              borderRadius: 100,
                              padding: "2px 8px",
                            }}
                          >
                            Ready to Send
                          </motion.span>
                        )}

                        {/* Icon top-right */}
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "flex-end",
                            marginBottom: 8,
                          }}
                        >
                          <Icon size={20} style={{ color: pkg.iconColor }} />
                        </div>

                        {/* Name + desc */}
                        <p
                          style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: "hsl(var(--heading))",
                            marginBottom: 3,
                            marginTop: isStatus && readyBadge ? 12 : 0,
                          }}
                        >
                          {pkg.name}
                        </p>
                        <p
                          style={{
                            fontSize: 12,
                            color: "#5A6178",
                            marginBottom: 12,
                            lineHeight: 1.4,
                          }}
                        >
                          {pkg.desc}
                        </p>

                        {/* Report items */}
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 7,
                            marginBottom: 14,
                          }}
                        >
                          {pkg.reports.map((report, ri) => {
                            const done = isStatus && checkmarks[ri];
                            return (
                              <div
                                key={report}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 8,
                                }}
                              >
                                <motion.div
                                  initial={false}
                                  animate={{
                                    backgroundColor: done ? "#10B981" : "transparent",
                                    scale: done ? [1, 1.2, 1] : 1,
                                  }}
                                  transition={{ duration: 0.3, ease: "easeOut" }}
                                  style={{
                                    width: 16,
                                    height: 16,
                                    borderRadius: "50%",
                                    border: done ? "none" : "1.5px solid #D1D5DB",
                                    flexShrink: 0,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                  }}
                                >
                                  {done && <Check size={9} color="white" />}
                                </motion.div>
                                <span style={{ fontSize: 12, color: "#5A6178" }}>
                                  {report}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Button */}
                        {isStatus ? (
                          <AnimatePresence mode="wait">
                            {btnState === "generate" && (
                              <motion.button
                                key="gen"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                  width: "100%",
                                  height: 36,
                                  background: "#4F6BFF",
                                  color: "white",
                                  border: "none",
                                  borderRadius: 8,
                                  fontSize: 13,
                                  fontWeight: 500,
                                  cursor: "pointer",
                                }}
                              >
                                Generate
                              </motion.button>
                            )}
                            {btnState === "generating" && (
                              <motion.button
                                key="generating"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                style={{
                                  width: "100%",
                                  height: 36,
                                  background: "#4F6BFF",
                                  color: "white",
                                  border: "none",
                                  borderRadius: 8,
                                  fontSize: 13,
                                  fontWeight: 500,
                                  cursor: "not-allowed",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  gap: 8,
                                }}
                              >
                                <div
                                  style={{
                                    width: 13,
                                    height: 13,
                                    borderRadius: "50%",
                                    border: "2px solid rgba(255,255,255,0.3)",
                                    borderTopColor: "white",
                                    animation: "spin 0.8s linear infinite",
                                  }}
                                />
                                Generating...
                              </motion.button>
                            )}
                            {btnState === "done" && (
                              <motion.div
                                key="done"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                style={{ display: "flex", gap: 8 }}
                              >
                                <button
                                  style={{
                                    flex: 1,
                                    height: 36,
                                    background: "#10B981",
                                    color: "white",
                                    border: "none",
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontWeight: 500,
                                    cursor: "pointer",
                                  }}
                                >
                                  Download
                                </button>
                                <button
                                  style={{
                                    flex: 1,
                                    height: 36,
                                    background: "transparent",
                                    color: "#10B981",
                                    border: "1.5px solid #10B981",
                                    borderRadius: 8,
                                    fontSize: 13,
                                    fontWeight: 500,
                                    cursor: "pointer",
                                  }}
                                >
                                  Share →
                                </button>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        ) : (
                          <button
                            style={{
                              width: "100%",
                              height: 36,
                              background: "transparent",
                              color: "hsl(var(--heading))",
                              border: "1px solid #E8EBF0",
                              borderRadius: 8,
                              fontSize: 13,
                              fontWeight: 500,
                              cursor: "pointer",
                            }}
                          >
                            Generate
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* Individual Reports */}
            {view === "individual" && (
              <motion.div
                key="individual"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <BackBtn onClick={goBack} />

                <AnimatePresence mode="wait">
                  {!selectedStakeholder ? (
                    <motion.div
                      key="grid"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p
                        style={{
                          fontSize: 20,
                          fontWeight: 600,
                          color: "hsl(var(--heading))",
                          marginBottom: 20,
                          textAlign: "center",
                        }}
                      >
                        Who is this report for?
                      </p>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 16,
                          maxWidth: 560,
                          margin: "0 auto",
                        }}
                      >
                        {STAKEHOLDERS.map((s) => {
                          const Icon = s.icon;
                          return (
                            <StakeholderCard
                              key={s.id}
                              label={s.label}
                              icon={
                                <Icon size={24} style={{ color: "#9CA3B8" }} />
                              }
                              onClick={() => setSelectedStakeholder(s.id)}
                            />
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="report-list"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                          marginBottom: 16,
                        }}
                      >
                        <button
                          onClick={() => setSelectedStakeholder(null)}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 3,
                            fontSize: 13,
                            color: "#5A6178",
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: 0,
                          }}
                        >
                          <ChevronLeft size={14} />
                        </button>
                        <p
                          style={{
                            fontSize: 20,
                            fontWeight: 600,
                            color: "hsl(var(--heading))",
                          }}
                        >
                          {
                            STAKEHOLDERS.find(
                              (s) => s.id === selectedStakeholder
                            )?.label
                          }
                        </p>
                      </div>

                      <div
                        className="rounded-xl border border-border bg-card/50"
                        style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                      >
                        {STAKEHOLDERS.find(
                          (s) => s.id === selectedStakeholder
                        )?.reports.map((report, i, arr) => (
                          <ReportRow
                            key={report}
                            name={report}
                            isLast={i === arr.length - 1}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Reports;
