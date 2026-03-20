import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image as ImageIcon, FileText, Mic, LayoutGrid } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AgentStatus from "@/components/AgentStatus";
import ConditionIndicator from "@/components/ConditionIndicator";
import type { Condition } from "@/components/ConditionIndicator";

/* ─── Data ─────────────────────────────────────────────────── */

interface InventoryRow {
  component: string;
  category: string;
  condition: Condition;
  location: string;
  rul: number;
  cost: string;
}

const inventoryData: InventoryRow[] = [
  { component: "Rooftop HVAC Unit",            category: "Mechanical",       condition: "Fair",      location: "Rooftop Mechanical Room",      rul: 12, cost: "$45,000"  },
  { component: "Elevator Motor System",         category: "Mechanical",       condition: "Good",      location: "Mechanical Room - 1st Floor",  rul: 15, cost: "$78,000"  },
  { component: "Parking Structure - Level 2",  category: "Structural",       condition: "Poor",      location: "North Parking Deck",           rul: 3,  cost: "$185,000" },
  { component: "Fire Alarm Panel",             category: "Safety",           condition: "Good",      location: "Building B - Lobby",           rul: 8,  cost: "$32,000"  },
  { component: "Pool Pump & Filter",           category: "Recreational",     condition: "Fair",      location: "Pool Equipment Room",          rul: 5,  cost: "$18,500"  },
  { component: "Exterior Paint - South Wall",  category: "Building Envelope",condition: "Fair",      location: "Building C - South Facade",    rul: 4,  cost: "$25,000"  },
  { component: "Exterior Facade & Balconies",  category: "Structural",       condition: "Poor",      location: "Main Building Exterior",       rul: 1,  cost: "$425,000" },
  { component: "Fire Suppression Riser",       category: "Safety",           condition: "Good",      location: "Basement Mechanical",          rul: 20, cost: "$32,000"  },
  { component: "Lobby Tile Flooring",          category: "Interior",         condition: "Excellent", location: "Main Lobby",                   rul: 22, cost: "$18,500"  },
];

const agentMessages = [
  { text: "Vision Agent — analyzing building photos...",                     color: "gray"  as const, startTime: 0    },
  { text: "Vision Agent — detecting HVAC, elevator, parking structure...",   color: "gray"  as const, startTime: 2000 },
  { text: "Document Ingestion Agent — inventory populated ✓",               color: "green" as const, startTime: 4000 },
];

const SKELETON_WIDTHS = [140, 90, 80, 130, 50, 70];
const ROW_STAGGER_MS  = 100;

/* ─── Pipeline sub-components ───────────────────────────────── */

const Line = ({ complete }: { complete: boolean }) => (
  <div
    style={{
      flex: 1,
      position: "relative",
      height: 6,
      overflow: "hidden",
      display: "flex",
      alignItems: "center",
      margin: "0 16px",
    }}
  >
    <div
      style={{
        position: "absolute",
        height: 1,
        width: "100%",
        top: "50%",
        background: complete ? "#10B981" : "#1E2440",
        transition: "background 0.6s ease",
      }}
    />
    {!complete && (
      <div
        style={{
          position: "absolute",
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "#4F6BFF",
          top: "50%",
          marginTop: -2,
          animation: "dot-travel 1.5s linear infinite",
        }}
      />
    )}
    {complete && (
      <div
        style={{
          position: "absolute",
          width: 4,
          height: 4,
          borderRadius: "50%",
          background: "#10B981",
          top: "50%",
          left: "50%",
          marginTop: -2,
          marginLeft: -2,
        }}
      />
    )}
  </div>
);

const Stage = ({
  label,
  subLabel,
  children,
}: {
  label: string;
  subLabel: string;
  children: React.ReactNode;
}) => (
  <div
    style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 2,
      flexShrink: 0,
    }}
  >
    <span
      style={{
        fontSize: 9,
        fontWeight: 500,
        color: "#6B7394",
        letterSpacing: "0.09em",
        textTransform: "uppercase",
        lineHeight: 1,
      }}
    >
      {label}
    </span>
    {children}
    <span style={{ fontSize: 10, color: "#8B92A8", lineHeight: 1 }}>{subLabel}</span>
  </div>
);

const PipelineCard = ({ complete }: { complete: boolean }) => (
  <div
    style={{
      borderRadius: 12,
      background: "rgba(15,23,41,0.97)",
      backdropFilter: "blur(8px)",
      border: "1px solid #1E2440",
      padding: "10px 36px",
      display: "flex",
      alignItems: "center",
    }}
  >
    <Stage label="Sources" subLabel="3 files">
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <ImageIcon size={14} style={{ color: "#3B82F6" }} />
        <FileText  size={14} style={{ color: "#EF4444" }} />
        <Mic       size={14} style={{ color: "#8B5CF6" }} />
      </div>
    </Stage>

    <Line complete={complete} />

    <Stage label="Processing" subLabel="RECOstudy AI">
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: complete ? "#10B981" : "#4F6BFF",
          transition: "background 0.6s ease",
          animation: !complete ? "dot-pulse-blue 1.5s ease-in-out infinite" : "none",
        }}
      />
    </Stage>

    <Line complete={complete} />

    <Stage label="Inventory" subLabel="9 components">
      <LayoutGrid
        size={14}
        style={{
          color: complete ? "#10B981" : "#374466",
          transition: "color 0.6s ease",
        }}
      />
    </Stage>
  </div>
);

/* ─── Page ───────────────────────────────────────────────────── */

const Inventory = () => {
  const [elapsed,     setElapsed]     = useState(0);
  const [visibleRows, setVisibleRows] = useState(0);

  const reset = useCallback(() => {
    setElapsed(0);
    setVisibleRows(0);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (elapsed >= 4000 && visibleRows < inventoryData.length) {
      const idx = Math.floor((elapsed - 4000) / ROW_STAGGER_MS);
      setVisibleRows(Math.min(idx + 1, inventoryData.length));
    }
  }, [elapsed, visibleRows]);

  const processingComplete = elapsed >= 4000;
  const showSkeletons      = elapsed < 4000;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeItem="inventory" visitedItems={["overview"]} />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: 60 }}>
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings › ABC Condominium Association, Inc. › Inventory"
            activeItem="inventory"
          />

          <div className="mb-8">
            <AgentStatus messages={agentMessages} elapsed={elapsed} />
          </div>

          {/* Pipeline */}
          <PipelineCard complete={processingComplete} />

          {/* Table section */}
          <div style={{ marginTop: 24 }}>
            <p className="text-heading font-semibold mb-4" style={{ fontSize: 20 }}>
              Component Inventory
            </p>

            <div
              className="rounded-xl border border-border bg-card/50 p-6"
              style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
            >
              <table className="w-full" style={{ tableLayout: "fixed" }}>
                <colgroup>
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "14%" }} />
                  <col style={{ width: "16%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "10%" }} />
                  <col style={{ width: "16%" }} />
                </colgroup>

                <thead>
                  <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                    {[
                      { label: "COMPONENT",      },
                      { label: "CATEGORY",       },
                      { label: "CONDITION",      },
                      { label: "LOCATION",       },
                      { label: "REMAINING LIFE", },
                      { label: "EST. COST",      },
                    ].map(({ label }) => (
                      <th
                        key={label}
                        className="text-breadcrumb font-semibold pb-3"
                        style={{
                          fontSize: 11,
                          letterSpacing: "0.06em",
                          textAlign: "left",
                          paddingRight: 12,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {label}
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody>
                  {showSkeletons ? (
                    Array.from({ length: 7 }).map((_, i) => (
                      <tr
                        key={`skel-${i}`}
                        style={{ borderBottom: "1px solid hsl(var(--border))" }}
                      >
                        {SKELETON_WIDTHS.map((w, ci) => (
                          <td key={ci} className="py-3" style={{ paddingRight: 12, height: 48 }}>
                            <div
                              className="rounded"
                              style={{
                                width: "70%",
                                maxWidth: w,
                                height: 13,
                                background:
                                  "linear-gradient(90deg, hsl(var(--border)) 25%, #F3F4F8 50%, hsl(var(--border)) 75%)",
                                backgroundSize: "200% 100%",
                                animation: "shimmer 1.5s infinite linear",
                                marginLeft: ci >= 4 ? "auto" : undefined,
                              }}
                            />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <AnimatePresence>
                      {inventoryData.slice(0, visibleRows).map((row) => (
                        <motion.tr
                          key={row.component}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="hover:bg-background"
                          style={{ borderBottom: "1px solid hsl(var(--border))" }}
                        >
                          <td
                            className="py-3 pr-3 text-[14px] text-heading font-medium"
                            style={{ height: 48, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          >
                            {row.component}
                          </td>
                          <td
                            className="py-3 pr-3 text-[14px] text-body-text"
                            style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          >
                            {row.category}
                          </td>
                          <td className="py-3 pr-3">
                            <ConditionIndicator condition={row.condition} />
                          </td>
                          <td
                            className="py-3 pr-3 text-[14px] text-body-text"
                            style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                          >
                            {row.location}
                          </td>
                          <td className="py-3 pr-3 text-[14px] font-mono text-heading" style={{ whiteSpace: "nowrap" }}>
                            {row.rul} <span className="text-breadcrumb">yr</span>
                          </td>
                          <td className="py-3 pr-3 text-[14px] font-mono font-medium text-heading" style={{ whiteSpace: "nowrap" }}>
                            {row.cost}
                          </td>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Inventory;
