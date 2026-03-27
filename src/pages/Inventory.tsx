import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
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
    <span style={{ color: "#6B7280" }}>
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
        color: "#6B7280",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <X size={16} />
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
        <p style={{ fontSize: 11, color: "#9CA3AF", padding: "8px 24px 0" }}>
          Photo from inspection report
        </p>
      </div>
    )}

    {/* Header */}
    <div style={{ padding: "20px 24px 0" }}>
      <h2 style={{ fontSize: 20, fontWeight: 700, color: "#0A0A0A", lineHeight: 1.3, margin: 0 }}>
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
          <p style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, letterSpacing: "0.04em", margin: 0 }}>
            {label}
          </p>
          <p style={{ fontSize: 14, color: "#0A0A0A", fontWeight: 500, margin: "4px 0 0" }}>{value}</p>
        </div>
      ))}
    </div>

    {/* Condition Notes */}
    <div style={{ padding: "24px 24px 0" }}>
      <p style={{ fontSize: 11, color: "#9CA3AF", fontWeight: 500, letterSpacing: "0.04em", margin: 0 }}>
        Condition Notes
      </p>
      <p style={{ fontSize: 14, color: "#0A0A0A", lineHeight: 1.5, margin: "6px 0 0" }}>
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
          fontSize: 14,
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
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen" style={{ background: "#FFFFFF" }}>
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

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: 60 }}>
          <TopBar
            breadcrumb="Buildings › City Gate 1, LMS 195 › Inventory"
            activeItem="inventory"
          />

          {/* Table section */}
          <div style={{ marginTop: 32 }}>
            <p style={{ fontSize: 20, fontWeight: 600, color: "#0A0A0A", marginBottom: 16 }}>
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
                            fontSize: 11,
                            fontWeight: 600,
                            letterSpacing: "0.06em",
                            color: "#9CA3AF",
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

                <tbody>
                  {inventoryData.map((row, i) => (
                    <tr
                      key={row.component}
                      onClick={() => setSelectedRow(row)}
                      style={{
                        borderBottom:
                          i < inventoryData.length - 1 ? "1px solid #F3F4F6" : "none",
                        cursor: "pointer",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.background = "#FAFAFA")
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.background = "transparent")
                      }
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
                              fontSize: 14,
                              fontWeight: 500,
                              color: "#0A0A0A",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {row.component}
                          </span>
                        </div>
                      </td>

                      <td
                        style={{
                          padding: "10px 16px",
                          fontSize: 13,
                          color: "#6B7280",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.category}
                      </td>

                      <td style={{ padding: "10px 16px" }}>
                        <ConditionIndicator condition={row.condition} />
                      </td>

                      <td
                        style={{
                          padding: "10px 16px",
                          fontSize: 13,
                          color: "#6B7280",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.location}
                      </td>

                      <td
                        style={{
                          padding: "10px 16px",
                          fontSize: 13,
                          fontFamily: "monospace",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {rulDisplay(row.rul)}
                      </td>

                      <td
                        style={{
                          padding: "10px 16px",
                          fontSize: 13,
                          fontFamily: "monospace",
                          fontWeight: 500,
                          color: "#0A0A0A",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {row.cost}
                      </td>
                    </tr>
                  ))}
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
