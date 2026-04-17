import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AgentBar from "@/components/AgentBar";
import ConditionIndicator from "@/components/ConditionIndicator";
import type { Condition } from "@/components/ConditionIndicator";

/* ─── Data ─────────────────────────────────────────────────── */

interface InventoryRow {
  component: string;
  category: string;
  condition: Condition;
  location: string;
  yearInstalled: number;
  rul: number;
  cost: string;
  replacementYear: number;
  image?: string;
  notes: string;
}

const inventoryData: InventoryRow[] = [
  {
    component: "Elevator cab - Townhouse",
    category: "Services",
    condition: "Fair",
    location: "Townhouse Elevator Shaft",
    yearInstalled: 1992,
    rul: 0,
    cost: "$36,000",
    replacementYear: 2024,
    image: "/elevator-cab-townhouse.png",
    notes: "Cab interior showing wear. Panels and flooring due for full replacement.",
  },
  {
    component: "Site utilities - Garbage compactor",
    category: "Site Improvements",
    condition: "Poor",
    location: "Garbage Room",
    yearInstalled: 1992,
    rul: 0,
    cost: "$42,000",
    replacementYear: 2024,
    image: "/garbage-compactor.png",
    notes: "Compactor motor failing intermittently. Hydraulic seals leaking.",
  },
  {
    component: "Boiler",
    category: "Services",
    condition: "Fair",
    location: "Mechanical Room",
    yearInstalled: 1992,
    rul: 1,
    cost: "$100,000",
    replacementYear: 2025,
    image: "/boiler.png",
    notes: "Operational but efficiency declining. Heat exchanger showing scale buildup.",
  },
  {
    component: "Suspended slab waterproofing",
    category: "Structural",
    condition: "Fair",
    location: "Underground Parkade",
    yearInstalled: 2004,
    rul: 2,
    cost: "$180,000",
    replacementYear: 2026,
    image: "/suspended-slab-waterproofing.png",
    notes: "Membrane showing minor cracking at expansion joints. No active leaks observed.",
  },
  {
    component: "Wall finishes - Paint",
    category: "Interiors",
    condition: "Fair",
    location: "Common Corridors",
    yearInstalled: 2006,
    rul: 2,
    cost: "$95,000",
    replacementYear: 2026,
    image: "/wall-finishes-paint.png",
    notes: "Scuffing and wear visible at high-traffic areas. Touch-ups no longer effective.",
  },
  {
    component: "Carpeting",
    category: "Interiors",
    condition: "Fair",
    location: "Common Corridors",
    yearInstalled: 2006,
    rul: 2,
    cost: "$64,000",
    replacementYear: 2026,
    image: "/carpeting.png",
    notes: "Carpet showing wear patterns and staining in main corridors.",
  },
  {
    component: "Elevator machinery - Townhouse",
    category: "Services",
    condition: "Fair",
    location: "Elevator Machine Room",
    yearInstalled: 1998,
    rul: 4,
    cost: "$85,000",
    replacementYear: 2028,
    image: "/elevator-machinery-townhouse.png",
    notes: "Motor and controller functioning. Increasing maintenance frequency noted.",
  },
  {
    component: "Parkade roof deck",
    category: "Shell",
    condition: "Fair",
    location: "Roof Level Parkade",
    yearInstalled: 1992,
    rul: 8,
    cost: "$420,000",
    replacementYear: 2032,
    image: "/parkade-roof-deck.png",
    notes: "Surface coating intact. Minor surface cracking consistent with age.",
  },
  {
    component: "Roofing - Inverted",
    category: "Shell",
    condition: "Good",
    location: "Main Roof",
    yearInstalled: 2010,
    rul: 14,
    cost: "$310,000",
    replacementYear: 2038,
    image: "/roofing-inverted.png",
    notes: "Membrane in good condition. Ballast evenly distributed, no ponding observed.",
  },
  {
    component: "Exterior windows - Aluminum",
    category: "Shell",
    condition: "Good",
    location: "Building Exterior",
    yearInstalled: 1992,
    rul: 23,
    cost: "$890,000",
    replacementYear: 2047,
    image: "/exterior-windows-aluminum.png",
    notes: "Seals and frames in serviceable condition. No fogging or seal failures noted.",
  },
];

/* ─── Shimmer keyframes ────────────────────────────────────── */

const SHIMMER_KEYFRAMES = `
@keyframes shimmer {
  0%   { background-position: -300px 0; }
  100% { background-position:  300px 0; }
}
`;

/* ─── Skeleton row ─────────────────────────────────────────── */

const SkeletonCell = ({ w, h = 10 }: { w: number; h?: number }) => (
  <div
    style={{
      width: w,
      height: h,
      borderRadius: 4,
      background: "linear-gradient(90deg, #F1F3F7 25%, rgba(255,255,255,0.7) 50%, #F1F3F7 75%)",
      backgroundSize: "300px 100%",
      animation: "shimmer 1.5s infinite linear",
    }}
  />
);

const SkeletonRow = ({ delay }: { delay: number }) => (
  <tr style={{ borderBottom: "1px solid #F1F3F7" }}>
    <td style={{ height: 56, padding: "8px 16px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 48, height: 48, borderRadius: 8, background: "#F1F3F7", flexShrink: 0, animation: `shimmer 1.5s ${delay}s infinite linear`, backgroundSize: "300px 100%", backgroundImage: "linear-gradient(90deg, #F1F3F7 25%, rgba(255,255,255,0.7) 50%, #F1F3F7 75%)" }} />
        <SkeletonCell w={120} h={14} />
      </div>
    </td>
    <td style={{ padding: "8px 16px" }}><SkeletonCell w={56} /></td>
    <td style={{ padding: "8px 16px" }}><SkeletonCell w={44} /></td>
    <td style={{ padding: "8px 16px" }}><SkeletonCell w={80} /></td>
    <td style={{ padding: "8px 16px" }}><SkeletonCell w={36} /></td>
    <td style={{ padding: "8px 16px" }}><SkeletonCell w={52} /></td>
  </tr>
);

/* ─── Helpers ──────────────────────────────────────────────── */

function rulDisplay(rul: number) {
  if (rul === 0)
    return <span style={{ color: "#EF4444", fontWeight: 500 }}>End of life</span>;
  if (rul <= 2)
    return (
      <span style={{ color: "#D97706" }}>
        {rul} <span style={{ color: "#D97706", opacity: 0.7 }}>yr{rul !== 1 ? "s" : ""}</span>
      </span>
    );
  return (
    <span style={{ color: "#4B5563" }}>
      {rul} <span style={{ opacity: 0.6 }}>yrs</span>
    </span>
  );
}

/* ─── Detail Panel ─────────────────────────────────────────── */

const DetailPanel = ({
  row,
  onClose,
  onAddToProjects,
}: {
  row: InventoryRow;
  onClose: () => void;
  onAddToProjects: () => void;
}) => (
  <motion.div
    initial={{ x: 420 }}
    animate={{ x: 0 }}
    exit={{ x: 420 }}
    transition={{ type: "spring", damping: 28, stiffness: 300 }}
    style={{
      position: "fixed",
      top: 0,
      right: 0,
      bottom: 0,
      width: 420,
      background: "#FFFFFF",
      borderLeft: "1px solid #E5E7EB",
      zIndex: 50,
      overflowY: "auto",
      display: "flex",
      flexDirection: "column",
    }}
  >
    {/* Close button floating over photo */}
    <button
      onClick={onClose}
      style={{
        position: "absolute",
        top: 12,
        right: 12,
        zIndex: 2,
        background: "rgba(255,255,255,0.85)",
        backdropFilter: "blur(4px)",
        border: "none",
        cursor: "pointer",
        padding: 6,
        borderRadius: 8,
        color: "#4B5563",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <X size={22} />
    </button>

    {/* Image — first thing, edge to edge */}
    {row.image && (
      <div>
        <img
          src={row.image}
          alt={row.component}
          style={{
            width: "100%",
            height: 280,
            objectFit: "cover",
            borderRadius: 0,
            background: "#F3F4F6",
            display: "block",
          }}
        />
        <p style={{ fontSize: 16, color: "#64748B", padding: "8px 24px 0" }}>
          Photo from inspection report
        </p>
      </div>
    )}

    {/* Header */}
    <div style={{ padding: "20px 24px 0" }}>
      <h2 style={{ fontSize: 27, fontWeight: 700, color: "#2E1A47", lineHeight: 1.3, margin: 0 }}>
        {row.component}
      </h2>
      <div style={{ marginTop: 8 }}>
        <ConditionIndicator condition={row.condition} />
      </div>
    </div>

    {/* Metadata grid */}
    <div
      style={{
        padding: "20px 24px 0",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "16px 24px",
      }}
    >
      {[
        { label: "Category", value: row.category },
        { label: "Location", value: row.location },
        { label: "Year Installed", value: String(row.yearInstalled) },
        { label: "Replacement Year", value: String(row.replacementYear) },
        { label: "Remaining Life", value: row.rul === 0 ? "End of life" : `${row.rul} yr${row.rul !== 1 ? "s" : ""}` },
        { label: "Replacement Cost", value: row.cost },
      ].map(({ label, value }) => (
        <div key={label}>
          <p style={{ fontSize: 16, color: "#64748B", fontWeight: 500, letterSpacing: "0.04em", margin: 0 }}>
            {label}
          </p>
          <p style={{ fontSize: 19, color: "#2E1A47", fontWeight: 500, margin: "4px 0 0" }}>{value}</p>
        </div>
      ))}
    </div>

    {/* Condition Notes */}
    <div style={{ padding: "24px 24px 0" }}>
      <p style={{ fontSize: 16, color: "#64748B", fontWeight: 500, letterSpacing: "0.04em", margin: 0 }}>
        Condition Notes
      </p>
      <p style={{ fontSize: 19, color: "#2E1A47", lineHeight: 1.5, margin: "6px 0 0" }}>
        {row.notes}
      </p>
    </div>

    {/* Action button */}
    <div style={{ padding: 24, marginTop: "auto" }}>
      <button
        onClick={onAddToProjects}
        style={{
          width: "100%",
          padding: "12px 0",
          background: "#0A0A0A",
          color: "#FFFFFF",
          border: "none",
          borderRadius: 8,
          fontSize: 19,
          fontWeight: 600,
          cursor: "pointer",
        }}
      >
        Add to Projects →
      </button>
    </div>
  </motion.div>
);

/* ─── Page ───────────────────────────────────────────────────── */

const Inventory = () => {
  const [selectedRow, setSelectedRow] = useState<InventoryRow | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  const tableVisible  = elapsed >= 3200;
  const agentComplete = elapsed >= 3800;

  const thinkingMessage =
    elapsed < 1200 ? "scanning uploaded documents..." :
    elapsed < 2200 ? "identifying 24 components..."   :
                     "flagging end-of-life components...";

  return (
    <div className="flex min-h-screen" style={{ background: "#FFFFFF" }}>
      <style>{SHIMMER_KEYFRAMES}</style>
      <Sidebar activeItem="inventory" visitedItems={["overview"]} />

      {/* Overlay when panel is open */}
      <AnimatePresence>
        {selectedRow && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedRow(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.08)",
              zIndex: 40,
            }}
          />
        )}
      </AnimatePresence>

      {/* Detail panel */}
      <AnimatePresence>
        {selectedRow && (
          <DetailPanel row={selectedRow} onClose={() => setSelectedRow(null)} onAddToProjects={() => navigate("/projects")} />
        )}
      </AnimatePresence>

      <main className="flex-1" style={{ marginLeft: 320 }}>
        <div className="mx-auto" style={{ maxWidth: 1560, padding: "40px 40px" }}>
          <TopBar
            breadcrumb="Buildings › Meridian Condominium Association, Inc. › Inventory"
            activeItem="inventory"
          />

          {/* Agent Bar */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
            <AgentBar
              agentName="Inventory Agent"
              thinkingMessage={thinkingMessage}
              completeMessage="24 components catalogued, 3 flagged for immediate attention"
              accentColor="#10B981"
              isThinking={!agentComplete}
              isComplete={agentComplete}
              isHidden={false}
            />
          </motion.div>

          {/* Table section */}
          <div style={{ marginTop: 32 }}>
            <p style={{ fontSize: 27, fontWeight: 600, color: "#2E1A47", marginBottom: 16 }}>
              Component Inventory
            </p>

            <div
              style={{
                borderRadius: 12,
                border: "1px solid #E5E7EB",
                background: "#FFFFFF",
                overflow: "hidden",
              }}
            >
              <table style={{ width: "100%", tableLayout: "fixed", borderCollapse: "collapse" }}>
                <colgroup>
                  <col style={{ width: "28%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "11%" }} />
                  <col style={{ width: "19%" }} />
                  <col style={{ width: "13%" }} />
                  <col style={{ width: "16%" }} />
                </colgroup>

                <thead>
                  <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                    {["COMPONENT", "CATEGORY", "CONDITION", "LOCATION", "REMAINING LIFE", "EST. COST"].map(
                      (label) => (
                        <th
                          key={label}
                          style={{
                            fontSize: 16,
                            fontWeight: 600,
                            letterSpacing: "0.06em",
                            color: "#64748B",
                            textAlign: "left",
                            padding: "12px 16px",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {label}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>

                <AnimatePresence mode="wait">
                  {!tableVisible ? (
                    <motion.tbody
                      key="skeleton"
                      initial={{ opacity: 1 }}
                      exit={{ opacity: 0, transition: { duration: 0.3 } }}
                    >
                      {Array.from({ length: 8 }, (_, i) => (
                        <SkeletonRow key={i} delay={i * 0.1} />
                      ))}
                    </motion.tbody>
                  ) : (
                    <motion.tbody key="real">
                      {inventoryData.map((row, i) => (
                        <motion.tr
                          key={row.component}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, delay: i * 0.12 }}
                          onClick={() => setSelectedRow(row)}
                          style={{
                            borderBottom: i < inventoryData.length - 1 ? "1px solid #F3F4F6" : "none",
                            cursor: "pointer",
                            transition: "background 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#FAFAFA")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                        >
                          {/* Component name + thumbnail */}
                          <td style={{ padding: "8px 16px", height: 56 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              {row.image && (
                                <img
                                  src={row.image}
                                  alt=""
                                  style={{
                                    width: 48,
                                    height: 48,
                                    borderRadius: 8,
                                    objectFit: "cover",
                                    flexShrink: 0,
                                    background: "#F3F4F6",
                                  }}
                                />
                              )}
                              <span
                                style={{
                                  fontSize: 19,
                                  fontWeight: 500,
                                  color: "#2E1A47",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {row.component}
                              </span>
                            </div>
                          </td>

                          <td style={{ padding: "10px 16px", fontSize: 18, color: "#4B5563", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {row.category}
                          </td>

                          <td style={{ padding: "10px 16px" }}>
                            <ConditionIndicator condition={row.condition} />
                          </td>

                          <td style={{ padding: "10px 16px", fontSize: 18, color: "#4B5563", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {row.location}
                          </td>

                          <td style={{ padding: "10px 16px", fontSize: 18, fontFamily: "monospace", whiteSpace: "nowrap" }}>
                            {rulDisplay(row.rul)}
                          </td>

                          <td style={{ padding: "10px 16px", fontSize: 18, fontFamily: "monospace", fontWeight: 500, color: "#2E1A47", whiteSpace: "nowrap" }}>
                            {row.cost}
                          </td>
                        </motion.tr>
                      ))}
                    </motion.tbody>
                  )}
                </AnimatePresence>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Inventory;
