import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  FileText,
  Landmark,
  Shield,
  Building2,
  Users,
  Check,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AgentStatus from "@/components/AgentStatus";

const agentMessages = [
  {
    text: "Reports Agent — compiling stakeholder packages...",
    color: "gray" as const,
    startTime: 0,
  },
];

const specialPackages = [
  {
    highlighted: true,
    badge: { text: "Ready to Send", color: "#10B981", bg: "#ECFDF5" },
    icon: { component: FileText, color: "#F59E0B", bg: "#FFFBEB" },
    title: "Status Certificate",
    subtitle: "Required for every unit transaction.",
    checklist: [
      "Reserve fund study (current)",
      "Financial statements summary",
      "Special assessment disclosure",
    ],
    buttons: [
      { text: "Download", variant: "green" },
      { text: "Share →", variant: "blue" },
    ],
  },
  {
    highlighted: false,
    badge: null,
    icon: { component: Landmark, color: "#4F6BFF", bg: "#EFF6FF" },
    title: "Refinancing Package",
    subtitle: "Everything a lender needs in one place.",
    checklist: [
      "RECOscore Lender Report",
      "30-Year Fund Projection",
      "Fannie Mae Eligibility Summary",
    ],
    buttons: [{ text: "Generate", variant: "blue-full" }],
  },
  {
    highlighted: false,
    badge: null,
    icon: { component: Shield, color: "#10B981", bg: "#ECFDF5" },
    title: "Insurance Renewal Package",
    subtitle: "Prepared for annual insurance review.",
    checklist: [
      "RECOscore Insurance Report",
      "Component Risk Summary",
      "Project Completion Certificates",
    ],
    buttons: [{ text: "Generate", variant: "blue-full" }],
  },
];

const individualCards = [
  {
    title: "For Lenders",
    Icon: Landmark,
    reports: [
      "RECOscore Lender Report",
      "30-Year Fund Projection",
      "Fannie Mae Eligibility Summary",
    ],
  },
  {
    title: "For Insurers",
    Icon: Shield,
    reports: [
      "RECOscore Insurance Report",
      "Component Risk Summary",
      "Project Completion Certificate",
    ],
  },
  {
    title: "For Regulators",
    Icon: Building2,
    reports: [
      "LL97 Emissions Report",
      "LL11 Facade Inspection Summary",
      "LL84 Energy Benchmarking Export",
      "LL88 Lighting Compliance Report",
    ],
  },
  {
    title: "For the Board",
    Icon: Users,
    reports: [
      "Full Reserve Fund Study",
      "Capital Project Timeline",
      "Reserve Funding Strategy Report",
    ],
  },
];

const Reports = () => {
  const [elapsed, setElapsed] = useState(0);

  const reset = useCallback(() => {
    setElapsed(0);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(interval);
  }, []);

  const bannerVisible = elapsed >= 500;
  const specialVisible = elapsed >= 1000;
  const individualVisible = elapsed >= 2500;
  const pulseActive = elapsed >= 3500;

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
        <div className="mx-auto" style={{ maxWidth: 1200, padding: 60 }}>
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings › ABC Condominium Association, Inc. › Reports"
          />

          <div className="mb-8">
            <AgentStatus messages={agentMessages} elapsed={elapsed} />
          </div>

          {/* Notification Banner */}
          <AnimatePresence>
            {bannerVisible && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4 }}
                className="flex items-center gap-3 rounded-lg mb-6 px-4 py-3"
                style={{ background: "#FFFBEB", border: "1px solid #FDE68A" }}
              >
                <AlertTriangle size={16} style={{ color: "#F59E0B", flexShrink: 0 }} />
                <p style={{ fontSize: 14, color: "#92400E" }}>
                  Unit 4B is in contract. Buyer's attorney has requested a Status Certificate.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Heading */}
          <h1 className="text-heading font-bold mb-1" style={{ fontSize: 28 }}>
            Reports
          </h1>
          <p className="text-body-text mb-6" style={{ fontSize: 15 }}>
            Your building data, formatted for every stakeholder.
          </p>

          {/* Special Packages */}
          <p className="text-heading font-semibold mb-4" style={{ fontSize: 20 }}>
            Special Packages
          </p>
          <div className="flex gap-4 mb-8">
            {specialPackages.map((pkg, i) => {
              const IconComp = pkg.icon.component;
              return (
                <AnimatePresence key={pkg.title}>
                  {specialVisible && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut", delay: i * 0.12 }}
                      className="flex-1 rounded-xl bg-card/50 p-5 flex flex-col"
                      style={{
                        border: pkg.highlighted
                          ? "2px solid #4F6BFF"
                          : "1px solid hsl(var(--border))",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      }}
                    >
                      {/* Top row: badge + icon */}
                      <div className="flex items-start justify-between mb-3">
                        {pkg.badge ? (
                          <span
                            className="text-[12px] font-medium"
                            style={{
                              color: pkg.badge.color,
                              background: pkg.badge.bg,
                              borderRadius: 100,
                              padding: "2px 10px",
                            }}
                          >
                            {pkg.badge.text}
                          </span>
                        ) : (
                          <div />
                        )}
                        <div
                          className="flex items-center justify-center rounded-full flex-shrink-0"
                          style={{ width: 36, height: 36, background: pkg.icon.bg }}
                        >
                          <IconComp size={18} style={{ color: pkg.icon.color }} />
                        </div>
                      </div>

                      <p className="text-heading font-semibold mb-1" style={{ fontSize: 16 }}>
                        {pkg.title}
                      </p>
                      <p className="text-breadcrumb mb-3" style={{ fontSize: 13 }}>
                        {pkg.subtitle}
                      </p>

                      <div className="flex flex-col gap-2 mb-4 flex-1">
                        {pkg.checklist.map((item) => (
                          <div key={item} className="flex items-center gap-2">
                            <div
                              className="flex items-center justify-center rounded-full flex-shrink-0"
                              style={{ width: 16, height: 16, background: "#10B981" }}
                            >
                              <Check size={10} color="white" />
                            </div>
                            <span className="text-body-text" style={{ fontSize: 13 }}>
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2 mt-auto">
                        {pkg.buttons.map((btn) => {
                          if (btn.variant === "green") {
                            return (
                              <button
                                key={btn.text}
                                className="flex-1 text-white font-medium rounded-lg"
                                style={{
                                  height: 36,
                                  background: "#10B981",
                                  fontSize: 13,
                                  border: "none",
                                  cursor: "pointer",
                                  boxShadow: pulseActive
                                    ? "0 0 0 4px rgba(79,107,255,0.25)"
                                    : "none",
                                  transition: "box-shadow 0.8s ease-in-out",
                                  animation: pulseActive ? "pulse-glow 1.5s ease-in-out 2" : "none",
                                }}
                              >
                                {btn.text}
                              </button>
                            );
                          }
                          if (btn.variant === "blue") {
                            return (
                              <button
                                key={btn.text}
                                className="flex-1 text-white font-medium rounded-lg"
                                style={{
                                  height: 36,
                                  background: "#4F6BFF",
                                  fontSize: 13,
                                  border: "none",
                                  cursor: "pointer",
                                }}
                              >
                                {btn.text}
                              </button>
                            );
                          }
                          return (
                            <button
                              key={btn.text}
                              className="w-full text-white font-medium rounded-lg"
                              style={{
                                height: 36,
                                background: "#4F6BFF",
                                fontSize: 13,
                                border: "none",
                                cursor: "pointer",
                              }}
                            >
                              {btn.text}
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            })}
          </div>

          {/* Individual Reports */}
          <p className="text-heading font-semibold mb-4" style={{ fontSize: 20 }}>
            Individual Reports
          </p>
          <div className="grid grid-cols-2 gap-4">
            {individualCards.map((card, i) => {
              const IconComp = card.Icon;
              return (
                <AnimatePresence key={card.title}>
                  {individualVisible && (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, ease: "easeOut", delay: i * 0.1 }}
                      className="rounded-xl border border-border bg-card/50 p-5"
                      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <IconComp size={18} className="text-breadcrumb" />
                        <p className="text-heading font-semibold" style={{ fontSize: 15 }}>
                          {card.title}
                        </p>
                      </div>
                      <div className="flex flex-col">
                        {card.reports.map((report, ri) => (
                          <div
                            key={report}
                            className="flex items-center justify-between py-2"
                            style={{
                              borderBottom:
                                ri < card.reports.length - 1
                                  ? "1px solid hsl(var(--border))"
                                  : "none",
                            }}
                          >
                            <span className="text-body-text" style={{ fontSize: 14 }}>
                              {report}
                            </span>
                            <button
                              className="rounded font-medium px-2 py-0.5"
                              style={{
                                fontSize: 12,
                                background: "transparent",
                                border: "1px solid #4F6BFF",
                                color: "#4F6BFF",
                                cursor: "pointer",
                              }}
                            >
                              Generate
                            </button>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;
