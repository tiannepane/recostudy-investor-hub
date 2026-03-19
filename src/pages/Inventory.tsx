import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Mic, Image as ImageIcon, Check } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AgentStatus from "@/components/AgentStatus";

interface InventoryRow {
  component: string;
  category: string;
  condition: "Excellent" | "Good" | "Fair" | "Poor";
  location: string;
  rul: number;
  cost: string;
}

const inventoryData: InventoryRow[] = [
  { component: "Rooftop HVAC Unit", category: "Mechanical", condition: "Fair", location: "Rooftop Mechanical Room", rul: 12, cost: "$45,000" },
  { component: "Elevator Motor System", category: "Mechanical", condition: "Good", location: "Mechanical Room - 1st Floor", rul: 15, cost: "$78,000" },
  { component: "Parking Structure - Level 2", category: "Structural", condition: "Poor", location: "North Parking Deck", rul: 3, cost: "$185,000" },
  { component: "Fire Alarm Panel", category: "Safety", condition: "Good", location: "Building B - Lobby", rul: 8, cost: "$32,000" },
  { component: "Pool Pump & Filter", category: "Recreational", condition: "Fair", location: "Pool Equipment Room", rul: 5, cost: "$18,500" },
  { component: "Exterior Paint - South Wall", category: "Building Envelope", condition: "Fair", location: "Building C - South Facade", rul: 4, cost: "$25,000" },
  { component: "Exterior Facade & Balconies", category: "Structural", condition: "Poor", location: "Main Building Exterior", rul: 1, cost: "$425,000" },
  { component: "Fire Suppression Riser", category: "Safety", condition: "Good", location: "Basement Mechanical", rul: 20, cost: "$32,000" },
  { component: "Lobby Tile Flooring", category: "Interior", condition: "Excellent", location: "Main Lobby", rul: 22, cost: "$18,500" },
];

const conditionStyles: Record<string, { color: string; bg: string }> = {
  Excellent: { color: "#10B981", bg: "#ECFDF5" },
  Good: { color: "#3B82F6", bg: "#EFF6FF" },
  Fair: { color: "#F59E0B", bg: "#FFFBEB" },
  Poor: { color: "#EF4444", bg: "#FEF2F2" },
};

const uploadedFiles = [
  { name: "6 building inspection photos", detail: "Images · 24.5 MB total", type: "image" as const },
  { name: "existing-reserve-study.pdf", detail: "PDF document · 8.7 MB", type: "pdf" as const },
  { name: "site-walkthrough-notes.m4a", detail: "Voice recording · 3.2 MB", type: "voice" as const },
];

const fileTypeStyles = {
  image: { bg: "#EFF6FF", icon: ImageIcon, iconColor: "#3B82F6" },
  pdf: { bg: "#FEF2F2", icon: FileText, iconColor: "#EF4444" },
  voice: { bg: "#F3E8FF", icon: Mic, iconColor: "#8B5CF6" },
};

const agentMessages = [
  { text: "Vision Agent — analyzing building photos...", color: "gray" as const, startTime: 0 },
  { text: "Vision Agent — detecting HVAC, elevator, parking structure...", color: "gray" as const, startTime: 2500 },
  { text: "Document Ingestion Agent — inventory populated, running estimation...", color: "gray" as const, startTime: 4500 },
  { text: "Document Ingestion Agent — complete ✓", color: "green" as const, startTime: 7000 },
];

const SKELETON_COUNT = 6;
const ROW_STAGGER_MS = 120;

const Inventory = () => {
  const [elapsed, setElapsed] = useState(0);
  const [visibleRows, setVisibleRows] = useState(0);

  const reset = useCallback(() => {
    setElapsed(0);
    setVisibleRows(0);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 30);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // At 4.5s, start revealing rows staggered
  useEffect(() => {
    if (elapsed >= 4500 && visibleRows < inventoryData.length) {
      const rowIndex = Math.floor((elapsed - 4500) / ROW_STAGGER_MS);
      setVisibleRows(Math.min(rowIndex + 1, inventoryData.length));
    }
  }, [elapsed, visibleRows]);

  const showSkeletons = elapsed < 4500;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeItem="inventory" visitedItems={["overview"]} />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: 60 }}>
          <TopBar onReplay={reset} breadcrumb="Buildings › ABC Condominium Association, Inc. › Inventory" />

          <div className="mb-8">
            <AgentStatus messages={agentMessages} elapsed={elapsed} />
          </div>

          <div className="flex gap-8">
            {/* Left column: Uploaded Files */}
            <div style={{ width: "40%", flexShrink: 0 }}>
              <div
                className="rounded-xl border border-border bg-card/50 p-6"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <p className="text-[11px] font-medium text-breadcrumb mb-4" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Uploaded Files
                </p>
                <div className="flex flex-col gap-2">
                  {uploadedFiles.map((file) => {
                    const style = fileTypeStyles[file.type];
                    const FIcon = style.icon;
                    return (
                      <div key={file.name} className="flex items-center gap-3" style={{ height: 52 }}>
                        <div
                          className="flex items-center justify-center rounded-lg flex-shrink-0"
                          style={{ width: 40, height: 40, background: style.bg }}
                        >
                          <FIcon size={20} style={{ color: style.iconColor }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-medium text-heading truncate">{file.name}</p>
                          <p className="text-[12px] font-mono text-breadcrumb">{file.detail}</p>
                        </div>
                        <div
                          className="flex items-center justify-center rounded-full flex-shrink-0"
                          style={{ width: 20, height: 20, background: "#10B981" }}
                        >
                          <Check size={12} className="text-primary-foreground" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right column: Component Inventory Table */}
            <div className="flex-1 min-w-0">
              <div
                className="rounded-xl border border-border bg-card/50 p-6"
                style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <p className="text-[11px] font-medium text-breadcrumb mb-4" style={{ letterSpacing: "0.06em", textTransform: "uppercase" }}>
                  Component Inventory
                </p>

                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                      {["COMPONENT", "CATEGORY", "CONDITION", "LOCATION", "RUL", "EST. COST"].map((col) => (
                        <th
                          key={col}
                          className="text-breadcrumb font-semibold pb-3"
                          style={{
                            fontSize: 11,
                            letterSpacing: "0.06em",
                            textAlign: col === "RUL" || col === "EST. COST" ? "right" : "left",
                            paddingRight: col === "EST. COST" ? 0 : 12,
                          }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {showSkeletons ? (
                      Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                        <tr key={`skel-${i}`} style={{ borderBottom: "1px solid hsl(var(--border))" }}>
                          {[140, 80, 70, 130, 50, 70].map((w, ci) => (
                            <td key={ci} className="py-3" style={{ paddingRight: 12 }}>
                              <div
                                className="rounded"
                                style={{
                                  width: w,
                                  height: 14,
                                  background: "linear-gradient(90deg, hsl(var(--border)) 25%, #F3F4F8 50%, hsl(var(--border)) 75%)",
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
                        {inventoryData.slice(0, visibleRows).map((row) => {
                          const cond = conditionStyles[row.condition];
                          return (
                            <motion.tr
                              key={row.component}
                              initial={{ opacity: 0, y: 8 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3, ease: "easeOut" }}
                              className="hover:bg-background"
                              style={{ borderBottom: "1px solid hsl(var(--border))" }}
                            >
                              <td className="py-3 pr-3 text-[14px] text-heading font-medium" style={{ height: 52 }}>
                                {row.component}
                              </td>
                              <td className="py-3 pr-3 text-[14px] text-body-text">{row.category}</td>
                              <td className="py-3 pr-3">
                                <span
                                  className="text-[12px] font-medium"
                                  style={{
                                    color: cond.color,
                                    background: cond.bg,
                                    borderRadius: 100,
                                    padding: "2px 10px",
                                    whiteSpace: "nowrap",
                                  }}
                                >
                                  {row.condition}
                                </span>
                              </td>
                              <td className="py-3 pr-3 text-[14px] text-body-text">{row.location}</td>
                              <td className="py-3 pr-3 text-[14px] font-mono text-heading text-right">
                                {row.rul} <span className="text-breadcrumb">years</span>
                              </td>
                              <td className="py-3 text-[14px] font-mono font-medium text-heading text-right">
                                {row.cost}
                              </td>
                            </motion.tr>
                          );
                        })}
                      </AnimatePresence>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Inventory;
