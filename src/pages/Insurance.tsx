import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Check, Paperclip } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AgentStatus from "@/components/AgentStatus";
import ConditionIndicator from "@/components/ConditionIndicator";
import type { Condition } from "@/components/ConditionIndicator";

const insuranceData: {
  name: string;
  condition: Condition;
  rul: number;
  cost: string;
  completed: boolean;
}[] = [
  {
    name: "Exterior Facade & Balconies",
    condition: "Excellent",
    rul: 25,
    cost: "$425,000",
    completed: true,
  },
  { name: "Parking Structure Concrete", condition: "Fair",      rul: 5,  cost: "$185,000", completed: false },
  { name: "Rooftop HVAC Unit",          condition: "Fair",      rul: 12, cost: "$45,000",  completed: false },
  { name: "Elevator Motor System",      condition: "Good",      rul: 15, cost: "$78,000",  completed: false },
  { name: "Fire Suppression Riser",     condition: "Good",      rul: 20, cost: "$32,000",  completed: false },
  { name: "Lobby Tile Flooring",        condition: "Excellent", rul: 22, cost: "$18,500",  completed: false },
];

const agentMessages = [
  {
    text: "Compliance Agent — preparing insurance update...",
    color: "gray" as const,
    startTime: 0,
  },
  {
    text: "Compliance Agent — project completion detected, notifying insurer...",
    color: "gray" as const,
    startTime: 3500,
  },
  {
    text: "Compliance Agent — insurer notified ✓",
    color: "green" as const,
    startTime: 5500,
  },
];

const ROW_STAGGER_MS = 120;

const Insurance = () => {
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
    if (elapsed >= 500 && visibleRows < insuranceData.length) {
      const idx = Math.floor((elapsed - 500) / ROW_STAGGER_MS);
      setVisibleRows(Math.min(idx + 1, insuranceData.length));
    }
  }, [elapsed, visibleRows]);

  const showNotification = elapsed >= 5000;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeItem="insurance"
        visitedItems={["overview", "inventory", "financials", "projects", "marketplace", "funding"]}
      />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: 60 }}>
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings › ABC Condominium Association, Inc. › Insurance"
          />

          <div className="mb-8">
            <AgentStatus messages={agentMessages} elapsed={elapsed} />
          </div>

          <div className="relative">
            {/* Table */}
            <div
              className="rounded-xl border border-border bg-card/50 p-6"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <p
                className="text-[11px] font-medium text-breadcrumb mb-4"
                style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}
              >
                Component Inventory
              </p>

              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                    {["NAME", "CONDITION", "REMAINING USEFUL LIFE", "COST", "STATUS"].map((col) => (
                      <th
                        key={col}
                        className="text-breadcrumb font-semibold pb-3"
                        style={{
                          fontSize: 11,
                          letterSpacing: "0.06em",
                          textAlign: col === "COST" ? "right" : "left",
                          paddingRight: col === "COST" || col === "STATUS" ? 0 : 12,
                        }}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {insuranceData.slice(0, visibleRows).map((row) => (
                        <motion.tr
                          key={row.name}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          style={{ borderBottom: "1px solid hsl(var(--border))" }}
                        >
                          <td
                            className="py-3 pr-3 text-[14px] text-heading font-medium"
                            style={{ height: 52 }}
                          >
                            {row.name}
                          </td>
                          <td className="py-3 pr-3">
                            <ConditionIndicator condition={row.condition} />
                          </td>
                          <td className="py-3 pr-3 text-[14px] font-mono text-heading">
                            {row.rul} <span className="text-breadcrumb">years</span>
                          </td>
                          <td className="py-3 pr-3 text-[14px] font-mono font-medium text-heading text-right">
                            {row.cost}
                          </td>
                          <td className="py-3 text-[14px]">
                            {row.completed && (
                              <div className="flex items-center gap-1.5">
                                <Check size={14} style={{ color: "#10B981" }} />
                                <span style={{ color: "#10B981", fontWeight: 500 }}>Completed</span>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* Insurance Notification Slide-in */}
            <AnimatePresence>
              {showNotification && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 28 }}
                  className="absolute top-0 right-0 rounded-xl border border-border bg-card p-6"
                  style={{ width: 400, boxShadow: "0 4px 24px rgba(0,0,0,0.10)" }}
                >
                  <div className="flex items-start justify-between mb-4">
                    <p className="text-heading font-semibold pr-4" style={{ fontSize: 15 }}>
                      Insurance Notification
                    </p>
                    <Shield size={18} style={{ color: "#10B981", flexShrink: 0 }} />
                  </div>

                  <div className="flex flex-col gap-3 mb-4">
                    <div>
                      <p
                        className="text-breadcrumb mb-0.5"
                        style={{
                          fontSize: 11,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        To
                      </p>
                      <p className="text-heading" style={{ fontSize: 14 }}>
                        insurer@example.com
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-breadcrumb mb-0.5"
                        style={{
                          fontSize: 11,
                          letterSpacing: "0.06em",
                          textTransform: "uppercase",
                        }}
                      >
                        Subject
                      </p>
                      <p
                        className="text-heading font-medium"
                        style={{ fontSize: 14, lineHeight: 1.4 }}
                      >
                        Building Update — Exterior Facade & Balconies Restoration Completed — ABC
                        Condominium Association
                      </p>
                    </div>
                    <div>
                      <p className="text-body-text" style={{ fontSize: 13, lineHeight: 1.5 }}>
                        This is an automated update to confirm completion of the Exterior Facade &
                        Balconies Restoration project. Updated reserve study and component records
                        attached.
                      </p>
                    </div>
                  </div>

                  <p
                    className="text-breadcrumb mb-2"
                    style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}
                  >
                    Attachments
                  </p>
                  <div className="flex gap-2 mb-4">
                    {["Reserve Study Report", "Updated Inventory"].map((att) => (
                      <div
                        key={att}
                        className="flex items-center gap-1.5 rounded px-2 py-1"
                        style={{ background: "#F8F9FC", border: "1px solid #E8EBF0" }}
                      >
                        <Paperclip size={11} className="text-breadcrumb" />
                        <span style={{ fontSize: 12, color: "#5A6180" }}>{att}</span>
                      </div>
                    ))}
                  </div>

                  <div
                    className="flex items-center gap-1.5 pt-3"
                    style={{ borderTop: "1px solid hsl(var(--border))" }}
                  >
                    <Check size={14} style={{ color: "#10B981" }} />
                    <span style={{ fontSize: 14, color: "#10B981", fontWeight: 500 }}>Sent</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Insurance;
