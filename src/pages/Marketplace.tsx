import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AgentStatus from "@/components/AgentStatus";

const agentMessages = [
  {
    text: "Marketplace Agent — matching contractors to RFP...",
    color: "gray" as const,
    startTime: 0,
  },
  {
    text: "Marketplace Agent — 3 bids received ✓",
    color: "green" as const,
    startTime: 3500,
  },
  {
    text: "Marketplace Agent — funding gap detected, $68,000 shortfall",
    color: "gray" as const,
    startTime: 5000,
  },
];

const contractors = [
  {
    name: "Restoration Experts LLC",
    stars: 4.8,
    responseTime: "2 hours response",
    bid: "$438,000",
    bestValue: true,
  },
  {
    name: "Facade Solutions Group",
    stars: 4.6,
    responseTime: "4 hours response",
    bid: "$455,000",
    bestValue: false,
  },
  {
    name: "BuildRight Contractors",
    stars: 4.9,
    responseTime: "1 hour response",
    bid: "$472,000",
    bestValue: false,
  },
];

const Marketplace = () => {
  const [elapsed, setElapsed] = useState(0);

  const reset = useCallback(() => {
    setElapsed(0);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(interval);
  }, []);

  const contractorsVisible = elapsed >= 2500;
  const showFundingGap = elapsed >= 5000;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeItem="marketplace"
        visitedItems={["overview", "inventory", "financials", "projects"]}
      />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: 60 }}>
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings › ABC Condominium Association, Inc. › Marketplace"
          />

          <div className="mb-8">
            <AgentStatus messages={agentMessages} elapsed={elapsed} />
          </div>

          {/* RFP Summary Card */}
          <div
            className="rounded-xl border border-border bg-card/50 p-5 mb-6"
            style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
          >
            <div className="flex items-center gap-3 mb-1">
              <p className="text-heading font-semibold" style={{ fontSize: 16 }}>
                Exterior Facade & Balconies Restoration
              </p>
              <span
                className="text-[12px] font-medium"
                style={{
                  color: "#10B981",
                  background: "#ECFDF5",
                  borderRadius: 100,
                  padding: "2px 10px",
                }}
              >
                Live
              </span>
            </div>
            <p className="text-body-text" style={{ fontSize: 14 }}>
              ABC Condominium Association
            </p>
            <p className="text-body-text" style={{ fontSize: 14 }}>
              Budget:{" "}
              <span className="font-mono font-medium">$425,000–$480,000</span>
            </p>
          </div>

          {/* Contractor Bid Cards */}
          <div className="flex gap-4 mb-6">
            {contractors.map((c, i) => (
              <AnimatePresence key={c.name}>
                {contractorsVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut", delay: i * 0.15 }}
                    className="flex-1 rounded-xl border border-border bg-card/50 p-5 relative"
                    style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                  >
                    {c.bestValue && (
                      <span
                        className="absolute top-4 right-4 text-[12px] font-medium"
                        style={{
                          color: "#10B981",
                          background: "#ECFDF5",
                          borderRadius: 100,
                          padding: "2px 10px",
                        }}
                      >
                        Best Value
                      </span>
                    )}
                    <p
                      className="text-heading font-semibold mb-2"
                      style={{ fontSize: 16, paddingRight: c.bestValue ? 88 : 0 }}
                    >
                      {c.name}
                    </p>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      <Star size={14} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
                      <span className="text-body-text" style={{ fontSize: 14 }}>
                        {c.stars}
                      </span>
                      <span
                        className="text-[12px] font-medium"
                        style={{
                          color: "#10B981",
                          background: "#ECFDF5",
                          borderRadius: 100,
                          padding: "2px 10px",
                        }}
                      >
                        {c.responseTime}
                      </span>
                    </div>
                    <p className="text-breadcrumb mb-1" style={{ fontSize: 12 }}>
                      Bid Amount
                    </p>
                    <p className="font-mono font-semibold text-heading" style={{ fontSize: 24 }}>
                      {c.bid}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </div>

          {/* Funding Gap Card */}
          <AnimatePresence>
            {showFundingGap && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="mx-auto rounded-xl border border-border bg-card p-6"
                style={{ maxWidth: 450, boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
              >
                <p
                  className="text-breadcrumb font-medium mb-2"
                  style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase" }}
                >
                  Current Reserve Balance
                </p>
                <div className="flex items-center gap-3 mb-4">
                  <p className="font-mono text-heading" style={{ fontSize: 28, fontWeight: 500 }}>
                    $370,000
                  </p>
                  <span
                    className="text-[12px] font-medium"
                    style={{
                      color: "#EF4444",
                      background: "#FEF2F2",
                      borderRadius: 100,
                      padding: "2px 10px",
                    }}
                  >
                    Insufficient
                  </span>
                </div>

                {/* Progress bar */}
                <div
                  className="relative rounded-full mb-1"
                  style={{ height: 8, background: "hsl(var(--border))" }}
                >
                  <div
                    className="absolute left-0 top-0 h-full rounded-l-full"
                    style={{ width: "84%", background: "#9CA3B8" }}
                  />
                  <div
                    className="absolute top-0 h-full rounded-r-full"
                    style={{ left: "84%", right: 0, background: "#EF4444" }}
                  />
                </div>
                <div className="flex justify-end mb-5">
                  <span style={{ fontSize: 12, color: "#EF4444" }}>Gap: $68k</span>
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
