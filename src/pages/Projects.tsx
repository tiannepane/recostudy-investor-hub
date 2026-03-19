import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wrench, Check } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AgentStatus from "@/components/AgentStatus";
import ConditionIndicator from "@/components/ConditionIndicator";
import type { Condition } from "@/components/ConditionIndicator";

const projectsData: {
  name: string;
  condition: Condition;
  rul: number;
  cost: string;
  highlighted: boolean;
  subtitle?: string;
  extraBadge?: string;
}[] = [
  {
    name: "Exterior Facade & Balconies",
    condition: "Poor",
    rul: 1,
    cost: "$425,000",
    highlighted: true,
    subtitle: "Completion required to avoid NYC Unsafe violation status.",
    extraBadge: "LL11: 87 days",
  },
  { name: "Parking Structure Concrete", condition: "Fair", rul: 5, cost: "$185,000", highlighted: false },
  { name: "Rooftop HVAC Unit", condition: "Fair", rul: 12, cost: "$45,000", highlighted: false },
  { name: "Elevator Motor System", condition: "Good", rul: 15, cost: "$78,000", highlighted: false },
  { name: "Fire Suppression Riser", condition: "Good", rul: 20, cost: "$32,000", highlighted: false },
  { name: "Lobby Tile Flooring", condition: "Excellent", rul: 22, cost: "$18,500", highlighted: false },
];

const rfpItems = [
  "Scope: Exterior Facade & Balconies restoration — ABC Condominium Association",
  "Structural repairs: Concrete spalling, rebar exposure, waterproofing",
  "Timeline: 2026 completion required",
  "Budget: $425,000–$480,000",
];

const agentMessages = [
  { text: "Procurement Agent — scanning for end-of-life components...", color: "gray" as const, startTime: 0 },
  { text: "Procurement Agent — end-of-life detected ✓", color: "green" as const, startTime: 2500 },
  { text: "Procurement Agent — RFP generated ✓", color: "green" as const, startTime: 5000 },
];

const ROW_STAGGER_MS = 120;

const Projects = () => {
  const [elapsed, setElapsed] = useState(0);
  const [visibleRows, setVisibleRows] = useState(0);

  const reset = useCallback(() => {
    setElapsed(0);
    setVisibleRows(0);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (elapsed >= 2000 && visibleRows < projectsData.length) {
      const idx = Math.floor((elapsed - 2000) / ROW_STAGGER_MS);
      setVisibleRows(Math.min(idx + 1, projectsData.length));
    }
  }, [elapsed, visibleRows]);

  const showRFP = elapsed >= 5000;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeItem="projects" visitedItems={["overview", "inventory", "financials"]} />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: 60 }}>
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings › ABC Condominium Association, Inc. › Projects"
          />

          <div className="mb-8">
            <AgentStatus messages={agentMessages} elapsed={elapsed} />
          </div>

          <div className="relative">
            {/* Projects Table */}
            <div
              className="rounded-xl border border-border bg-card/50 p-6"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <p
                className="text-[11px] font-medium text-breadcrumb mb-4"
                style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}
              >
                Upcoming Projects
              </p>

              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                    {["NAME", "CONDITION", "REMAINING USEFUL LIFE", "COST"].map((col) => (
                      <th
                        key={col}
                        className="text-breadcrumb font-semibold pb-3"
                        style={{
                          fontSize: 11,
                          letterSpacing: "0.06em",
                          textAlign: col === "COST" ? "right" : "left",
                          paddingRight: col === "COST" ? 0 : 12,
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {projectsData.slice(0, visibleRows).map((row) => (
                        <motion.tr
                          key={row.name}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          style={{
                            borderBottom: "1px solid hsl(var(--border))",
                            background: row.highlighted ? "#FFFBEB" : undefined,
                            borderLeft: row.highlighted ? "3px solid #F59E0B" : "3px solid transparent",
                          }}
                        >
                          <td
                            className="py-3 pr-3"
                            style={{ height: row.highlighted ? 68 : 52 }}
                          >
                            <p className="text-[14px] text-heading font-medium">{row.name}</p>
                            {row.subtitle && (
                              <p className="text-[12px] text-breadcrumb mt-0.5">{row.subtitle}</p>
                            )}
                          </td>
                          <td className="py-3 pr-3">
                            <div className="flex items-center gap-2 flex-wrap">
                              <ConditionIndicator condition={row.condition} />
                              {row.extraBadge && (
                                <span
                                  className="text-[12px] font-medium"
                                  style={{
                                    color: "#F59E0B",
                                    background: "#FFFBEB",
                                    borderRadius: 100,
                                    padding: "2px 10px",
                                    border: "1px solid #FDE68A",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {row.extraBadge}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 pr-3 text-[14px] font-mono text-heading">
                            {row.rul}{" "}
                            <span className="text-breadcrumb">
                              {row.rul === 1 ? "year" : "years"}
                            </span>
                          </td>
                          <td className="py-3 text-[14px] font-mono font-medium text-heading text-right">
                            {row.cost}
                          </td>
                        </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* RFP Slide-in Card */}
            <AnimatePresence>
              {showRFP && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 28 }}
                  className="absolute top-0 right-0 rounded-xl border border-border bg-card p-6"
                  style={{ width: 380, boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <p
                      className="text-heading pr-4"
                      style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.4 }}
                    >
                      RFP — Exterior Facade & Balconies Restoration
                    </p>
                    <Wrench size={18} style={{ color: "#F59E0B", flexShrink: 0, marginTop: 2 }} />
                  </div>

                  <div className="flex flex-col gap-3 mb-5">
                    {rfpItems.map((item) => (
                      <div key={item} className="flex items-start gap-2">
                        <div
                          className="flex items-center justify-center rounded-full flex-shrink-0"
                          style={{ width: 18, height: 18, background: "#10B981", marginTop: 2 }}
                        >
                          <Check size={11} color="white" />
                        </div>
                        <p className="text-body-text" style={{ fontSize: 13, lineHeight: 1.5 }}>
                          {item}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    className="w-full text-white font-medium rounded-lg"
                    style={{
                      height: 44,
                      background: "#4F6BFF",
                      fontSize: 14,
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    Send to Marketplace →
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Projects;
