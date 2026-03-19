import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { DollarSign, Landmark } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AgentStatus from "@/components/AgentStatus";

const agentMessages = [
  {
    text: "Funding Agent — analyzing reserve data against lending criteria...",
    color: "gray" as const,
    startTime: 0,
  },
  {
    text: "Funding Agent — funding solution identified ✓",
    color: "green" as const,
    startTime: 2500,
  },
];

const Funding = () => {
  const [elapsed, setElapsed] = useState(0);

  const reset = useCallback(() => {
    setElapsed(0);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(interval);
  }, []);

  const card1Visible = elapsed >= 3000;
  const card2Visible = elapsed >= 3800;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeItem="funding"
        visitedItems={["overview", "inventory", "financials", "projects", "marketplace"]}
      />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: 60 }}>
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings › ABC Condominium Association, Inc. › Funding"
          />

          <div className="mb-8">
            <AgentStatus messages={agentMessages} elapsed={elapsed} />
          </div>

          {/* Context summary bar */}
          <div
            className="rounded-lg px-4 py-3 mb-4"
            style={{
              borderLeft: "3px solid #EF4444",
              border: "1px solid #FEE2E2",
              borderLeftWidth: 3,
              borderLeftColor: "#EF4444",
              background: "#FEF9F9",
            }}
          >
            <p className="text-body-text" style={{ fontSize: 14 }}>
              Exterior Facade project: Best bid{" "}
              <span className="font-mono font-medium">$438,000</span> · Available reserves:{" "}
              <span className="font-mono font-medium">$370,000</span> · Gap:{" "}
              <span className="font-mono font-medium" style={{ color: "#EF4444" }}>
                $68,000
              </span>
            </p>
          </div>

          <p className="text-body-text mb-6" style={{ fontSize: 14 }}>
            RECollab connected your reserve data to our lending partners — no application needed.
          </p>

          {/* Funding Cards */}
          <div className="flex flex-col gap-4">
            {/* Card 1: Reserve Loan */}
            {card1Visible && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="rounded-xl bg-card p-6 flex items-start gap-4"
                style={{
                  border: "1px solid hsl(var(--border))",
                  borderLeftWidth: 3,
                  borderLeftColor: "#10B981",
                  background: "#FAFFFE",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                }}
              >
                <div
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{ width: 40, height: 40, background: "#ECFDF5" }}
                >
                  <DollarSign size={20} style={{ color: "#10B981" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <p className="text-heading font-semibold" style={{ fontSize: 16 }}>
                      Reserve Loan — Pre-Approved
                    </p>
                    <span
                      className="text-[12px] font-medium ml-3 flex-shrink-0"
                      style={{
                        color: "#10B981",
                        background: "#ECFDF5",
                        borderRadius: 100,
                        padding: "2px 10px",
                      }}
                    >
                      Eligible
                    </span>
                  </div>
                  <p className="text-body-text mb-2" style={{ fontSize: 14 }}>
                    <span className="font-mono font-medium">5.2% APR</span> · Up to{" "}
                    <span className="font-mono font-medium">$300,000</span>
                  </p>
                  <p className="text-breadcrumb" style={{ fontSize: 13 }}>
                    Competitive rate for associations with current reserve studies. No personal
                    guarantees required.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Card 2: NYC LL97 */}
            {card2Visible && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="rounded-xl border border-border bg-card/50 p-6 flex items-start gap-4"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <div
                  className="flex items-center justify-center rounded-full flex-shrink-0"
                  style={{ width: 40, height: 40, background: "#EFF6FF" }}
                >
                  <Landmark size={20} style={{ color: "#3B82F6" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-heading font-semibold mb-1" style={{ fontSize: 16 }}>
                    NYC LL97 Compliance Incentive
                  </p>
                  <p className="text-body-text mb-4" style={{ fontSize: 14 }}>
                    Up to <span className="font-mono font-medium">$25,000</span> offset · NY Green
                    Bank eligible
                  </p>
                  <button
                    className="w-full rounded-lg font-medium"
                    style={{
                      height: 40,
                      background: "transparent",
                      border: "1px solid #4F6BFF",
                      color: "#4F6BFF",
                      fontSize: 14,
                      cursor: "pointer",
                    }}
                  >
                    Apply
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Funding;
