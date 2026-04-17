import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark,
  ChevronDown,
  ChevronUp,
  Building2,
  AlertTriangle,
} from "lucide-react";
import {
  ComposedChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

/* ─── Animated counter hook ────────────────────────────── */

function useCountUp(target: number, start: boolean, duration = 1500, delay = 0) {
  const [value, setValue] = useState(0);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;
    let startTime: number | null = null;
    const delayTimer = setTimeout(() => {
      const tick = (now: number) => {
        if (startTime === null) startTime = now;
        const elapsed = now - startTime;
        const t = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        setValue(Math.round(eased * target));
        if (t < 1) {
          rafRef.current = requestAnimationFrame(tick);
        } else {
          setValue(target);
        }
      };
      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(delayTimer);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [start, target, duration, delay]);

  return value;
}

/* ─── Unified metric card ──────────────────────────────── */

const MetricCard = ({
  label,
  value,
  index,
  start,
  variant = "neutral",
  tag,
}: {
  label: string;
  value: string;
  index: number;
  start: boolean;
  variant?: "warning" | "danger" | "neutral";
  tag?: string;
}) => {
  const isWarning = variant === "warning";
  const isDanger  = variant === "danger";
  const isAccent  = isWarning || isDanger;
  // warning variant = Percent Funded (red dot per spec), danger = Special Assessment (amber dot)
  const dotColor  = isWarning ? "#EF4444" : isDanger ? "#F59E0B" : null;

  return (
    <AnimatePresence>
      {start && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut", delay: index * 0.08 }}
          style={{
            padding: "20px 24px",
            background: isAccent ? "rgba(255, 255, 255, 0.85)" : "#FFFFFF",
            backdropFilter: isAccent ? "blur(8px)" : undefined,
            borderRadius: 10,
            border: isAccent ? "1px solid rgba(249, 115, 22, 0.15)" : "1px solid rgba(15,23,41,0.06)",
            flex: "1 1 0",
            minWidth: 0,
            boxShadow: isAccent
              ? "0 0 0 1px rgba(249,115,22,0.06), 0 8px 32px rgba(249,115,22,0.10)"
              : "0 2px 8px rgba(15,23,41,0.05)",
          }}
        >
          <p
            style={{
              fontSize: 16,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginBottom: 8,
              color: "#64748B",
              fontWeight: 500,
            }}
          >
            {label}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {dotColor && (
              <span
                style={{
                  display: "inline-block",
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: dotColor,
                  flexShrink: 0,
                }}
              />
            )}
            <p style={{ fontSize: 36, fontWeight: isAccent ? 700 : 600, lineHeight: 1, color: "#2E1A47" }}>
              {value}
            </p>
          </div>
          {tag && (
            <p
              style={{
                marginTop: 6,
                fontSize: 16,
                fontStyle: "italic",
                color: "#64748B",
              }}
            >
              {tag}
            </p>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ─── Animated metric cards for Financial Overview ──────── */

const AnimatedFundCard = ({ index, start }: { index: number; start: boolean }) => {
  const v = useCountUp(2064255, start, 1500, index * 150);
  return <MetricCard label="RESERVE FUND BALANCE" value={`$${v.toLocaleString()}`} index={index} start={start} />;
};

const AnimatedPercentCard = ({ index, start }: { index: number; start: boolean }) => {
  const raw = useCountUp(135, start, 1500, index * 150);
  return (
    <MetricCard
      label="PERCENT FUNDED"
      value={`${(raw / 10).toFixed(1)}%`}
      index={index}
      start={start}
      variant="warning"
      tag="Below Fannie Mae minimum"
    />
  );
};

const AnimatedYearCard = ({ index, start }: { index: number; start: boolean }) => {
  const v = useCountUp(2028, start, 1500, index * 150);
  return (
    <MetricCard
      label="SPECIAL ASSESSMENT YEAR"
      value={String(Math.max(2024, v))}
      index={index}
      start={start}
      variant="danger"
      tag="2 years away"
    />
  );
};

const AnimatedRecoCard = ({ index, start }: { index: number; start: boolean }) => {
  const v = useCountUp(47, start, 1500, index * 150);
  return <MetricCard label="RECOSCORE" value={String(v)} index={index} start={start} />;
};

/* ─── Data ──────────────────────────────────────────────── */

// Two-line trajectory: current (declining) vs recommended (growing)
// Interpolates between the specified anchor points for each series.
function lerp(anchors: [number, number][], year: number): number {
  for (let i = 0; i < anchors.length - 1; i++) {
    const [y0, v0] = anchors[i];
    const [y1, v1] = anchors[i + 1];
    if (year <= y1) {
      const t = (year - y0) / (y1 - y0);
      return Math.round(v0 + t * (v1 - v0));
    }
  }
  return anchors[anchors.length - 1][1];
}

const CURRENT_ANCHORS: [number, number][] = [
  [2026, 2064255], [2028, 1820000], [2031, 1340000],
  [2036, 890000],  [2041, 420000],  [2046, 0],       [2056, 0],
];
const RECOMMENDED_ANCHORS: [number, number][] = [
  [2026, 2064255], [2031, 2480000], [2036, 2890000],
  [2041, 3210000], [2046, 3680000], [2051, 4100000],  [2056, 4520000],
];

const projectionData = Array.from({ length: 31 }, (_, i) => {
  const year = 2026 + i;
  return {
    year,
    current:     Math.max(0, lerp(CURRENT_ANCHORS, year)),
    recommended: lerp(RECOMMENDED_ANCHORS, year),
  };
});

const benchmarkRows = [
  { label: "Percent Funded",          meridian: "13.5%",      avg: "62%",        meridianNum: 13.5,    avgNum: 62,      above: false, goodWhenAbove: true },
  { label: "HOA Fee / sq ft",         meridian: "$4.82",      avg: "$3.95",      meridianNum: 4.82,    avgNum: 3.95,    above: true,  goodWhenAbove: false },
  { label: "Reserve Fund Balance",    meridian: "$2,064,255", avg: "$1,420,000", meridianNum: 2064255, avgNum: 1420000, above: true,  goodWhenAbove: true },
  { label: "Annual CRF Contribution", meridian: "$511,500",   avg: "$380,000",   meridianNum: 511500,  avgNum: 380000,  above: true,  goodWhenAbove: true },
  { label: "Reserve Fund / Unit",     meridian: "$11,932",    avg: "$8,208",     meridianNum: 11932,   avgNum: 8208,    above: true,  goodWhenAbove: true },
];

/* ─── Stakeholder data ──────────────────────────────────── */

interface StakeholderDef {
  name: string;
  icon: React.ElementType;
  metCount: number;
  metTotal: number;
  requirements: { name: string; threshold: string; current: string; pass: boolean }[];
}

const STAKEHOLDERS: StakeholderDef[] = [
  {
    name: "Fannie Mae",
    icon: Landmark,
    metCount: 3,
    metTotal: 6,
    requirements: [
      { name: "Reserve Fund % Funded", threshold: "\u226510%", current: "13.5%", pass: true },
      { name: "Reserve Contribution Rate", threshold: "\u226510% of budget", current: "8.2%", pass: false },
      { name: "Delinquency Rate", threshold: "\u22645%", current: "3.1%", pass: true },
      { name: "Owner Occupancy", threshold: "\u226550%", current: "62%", pass: true },
      { name: "Special Assessment History", threshold: "None in 3 years", current: "1 in 2024", pass: false },
      { name: "Current Reserve Study", threshold: "Within 3 years", current: "Expired 2023", pass: false },
    ],
  },
  {
    name: "FHA",
    icon: Building2,
    metCount: 4,
    metTotal: 5,
    requirements: [
      { name: "Reserve Fund % Funded", threshold: "\u226510%", current: "13.5%", pass: true },
      { name: "Owner Occupancy", threshold: "\u226550%", current: "62%", pass: true },
      { name: "Delinquency Rate", threshold: "\u226415%", current: "3.1%", pass: true },
      { name: "Litigation Status", threshold: "No active litigation", current: "Clear", pass: true },
      { name: "Insurance Coverage", threshold: "Adequate", current: "Under review", pass: false },
    ],
  },
];

const KEY_METRICS_ROW = [
  { label: "Contribution Rate", value: "8.2%" },
  { label: "Delinquency Rate", value: "3.1%" },
  { label: "Owner Occupancy", value: "62%" },
  { label: "Unfunded / Unit", value: "$12,400" },
];

/* ─── Status helpers ───────────────────────────────────── */

function getReqStatus(name: string, pass: boolean): "green" | "amber" | "red" {
  if (pass) return "green";
  if (name === "Reserve Contribution Rate" || name === "Insurance Coverage") return "amber";
  return "red";
}

const STATUS_CONFIG = {
  green: { dot: "#16A34A", label: "Met"     },
  amber: { dot: "#D97706", label: "Review"  },
  red:   { dot: "#DC2626", label: "At risk" },
};

const StatusPill = ({ status }: { status: "green" | "amber" | "red" }) => {
  const c = STATUS_CONFIG[status];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      <span style={{ fontSize: 16, color: "#334155" }}>{c.label}</span>
    </div>
  );
};

const MetCountPill = ({ met, total }: { met: number; total: number }) => {
  const ratio = met / total;
  const status = ratio >= 0.8 ? "green" : ratio >= 0.5 ? "amber" : "red";
  const c = STATUS_CONFIG[status];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
      <div style={{ width: 5, height: 5, borderRadius: "50%", background: c.dot, flexShrink: 0 }} />
      <span style={{ fontSize: 16, color: "#334155", whiteSpace: "nowrap" }}>{met} of {total} met</span>
    </div>
  );
};

/* ─── Expandable stakeholder card ─────────────────────── */

const StakeholderCard = ({ s }: { s: StakeholderDef }) => {
  const [open, setOpen] = useState(false);
  const Icon = s.icon;
  return (
    <div
      style={{
        borderRadius: 10,
        border: "1px solid rgba(249, 115, 22, 0.15)",
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(8px)",
        overflow: "hidden",
        boxShadow: "0 0 0 1px rgba(249,115,22,0.06), 0 8px 32px rgba(249,115,22,0.10)",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 20px",
          paddingBottom: open ? 12 : 16,
          background: "transparent",
          border: "none",
          borderBottom: open ? "1px solid rgba(15,23,41,0.06)" : "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <Icon size={22} style={{ color: "#64748B", flexShrink: 0 }} />
        <span style={{ fontSize: 19, fontWeight: 600, color: "#2E1A47", flex: 1 }}>
          {s.name}
        </span>
        <MetCountPill met={s.metCount} total={s.metTotal} />
        {open ? (
          <ChevronUp size={20} style={{ color: "#64748B", flexShrink: 0, marginLeft: 8 }} />
        ) : (
          <ChevronDown size={20} style={{ color: "#64748B", flexShrink: 0, marginLeft: 8 }} />
        )}
      </button>

      {open && (
        <div style={{ padding: "0 20px 20px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 12 }}>
            <thead>
              <tr>
                {["Requirement", "Threshold", "Current", "Status"].map((h) => (
                  <th
                    key={h}
                    style={{
                      fontSize: 16,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#64748B",
                      fontWeight: 500,
                      textAlign: "left",
                      padding: "0 12px 10px 0",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.requirements.map((r) => {
                const status = getReqStatus(r.name, r.pass);
                return (
                  <tr key={r.name}>
                    <td style={{ fontSize: 18, color: "#334155", padding: "10px 12px 10px 0", borderTop: "1px solid #F3F4F6" }}>
                      {r.name}
                    </td>
                    <td style={{ fontSize: 18, color: "#334155", padding: "10px 12px 10px 0", borderTop: "1px solid #F3F4F6" }}>
                      {r.threshold}
                    </td>
                    <td style={{ fontSize: 18, fontWeight: 500, color: "#2E1A47", padding: "10px 12px 10px 0", borderTop: "1px solid #F3F4F6" }}>
                      {r.current}
                    </td>
                    <td style={{ padding: "10px 0", borderTop: "1px solid #F3F4F6", width: 80 }}>
                      <StatusPill status={status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ─── Ghost CTA button ──────────────────────────────────── */

const GhostFundingBtn = ({ onClick }: { onClick: () => void }) => {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: "100%",
        height: 44,
        border: "1px solid #2E1A47",
        background: hov ? "#2E1A47" : "transparent",
        color: hov ? "#FFFFFF" : "#2E1A47",
        borderRadius: 7,
        fontSize: 19,
        fontWeight: 500,
        cursor: "pointer",
        transition: "background 200ms, color 200ms",
      }}
    >
      View Funding Options →
    </button>
  );
};

/* ─── Page ──────────────────────────────────────────────── */

const Financials = () => {
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);

  const reset = useCallback(() => setElapsed(0), []);

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  const bannerVisible   = elapsed >= 300;
  const metricsVisible  = elapsed >= 1500;
  const chartVisible    = elapsed >= 3500;
  const benchVisible    = elapsed >= 5000;
  const riskCardVisible = elapsed >= 5000;

  return (
    <div className="flex min-h-screen" style={{ background: "#FFFFFF" }}>
      <Sidebar activeItem="financials" visitedItems={["overview", "inventory"]} />

      <main className="flex-1" style={{ marginLeft: 320 }}>
        <div className="mx-auto" style={{ maxWidth: 1560, padding: "40px 40px 60px" }}>
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings › Meridian Condominium Association, Inc. › Financials"
            activeItem="financials"
          />

          {/* ── Tabs ── */}
          <Tabs defaultValue="overview">
            <TabsList
              className="bg-transparent rounded-none h-auto p-0 gap-0"
              style={{ borderBottom: "1px solid #E5E7EB", marginBottom: 24 }}
            >
              <TabsTrigger
                value="overview"
                className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-[#0A0A0A] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2 pt-0 text-[18px]"
                style={{ color: "#64748B", fontWeight: 500 }}
              >
                Financial Overview
              </TabsTrigger>
              <TabsTrigger
                value="stakeholder"
                className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-[#0A0A0A] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2 pt-0 text-[18px]"
                style={{ color: "#64748B", fontWeight: 500 }}
              >
                Stakeholder Standing
              </TabsTrigger>
            </TabsList>

            {/* ════════════════════════════════════════════
                TAB 1: Financial Overview
            ════════════════════════════════════════════ */}
            <TabsContent value="overview" className="mt-0">

              {/* ── Risk Banner ── */}
              <AnimatePresence>
                {bannerVisible && (
                  <motion.div
                    initial={{ opacity: 0, x: 0 }}
                    animate={{
                      opacity: 1,
                      x: [0, -2, 2, -2, 2, 0],
                    }}
                    transition={{
                      opacity: { duration: 0.3 },
                      x: { duration: 0.35, ease: "easeInOut", times: [0, 0.2, 0.4, 0.6, 0.8, 1] },
                    }}
                    style={{
                      background: "rgba(255, 255, 255, 0.85)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(249, 115, 22, 0.15)",
                      boxShadow: "0 0 0 1px rgba(249,115,22,0.06), 0 8px 32px rgba(249,115,22,0.10)",
                      borderRadius: 10,
                      padding: "14px 20px",
                      marginBottom: 20,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 24,
                    }}
                  >
                    {/* Left: icon + text */}
                    <div style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                      <AlertTriangle
                        size={18}
                        style={{ color: "#F97316", flexShrink: 0, marginTop: 1 }}
                      />
                      <div>
                        <p style={{ fontSize: 19, fontWeight: 700, color: "#92400E", marginBottom: 3 }}>
                          Funding Risk Detected
                        </p>
                        <p style={{ fontSize: 18, color: "#B45309", lineHeight: 1.5 }}>
                          This building is 13.5% funded against a Fannie Mae minimum reserve requirement
                          of 70%. A special assessment is projected for 2028.
                        </p>
                      </div>
                    </div>

                    {/* Right: funding gap bar */}
                    <div style={{ flexShrink: 0, textAlign: "right" }}>
                      <p
                        style={{
                          fontSize: 20,
                          textTransform: "uppercase",
                          letterSpacing: "0.06em",
                          color: "#64748B",
                          marginBottom: 6,
                        }}
                      >
                        Funded
                      </p>
                      <div
                        style={{
                          width: 200,
                          height: 10,
                          borderRadius: 5,
                          background: "#EEEFF2",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: "13.5%",
                            height: "100%",
                            background: "#F97316",
                            borderRadius: 5,
                          }}
                        />
                      </div>
                      <p style={{ fontSize: 17, color: "#64748B", marginTop: 5 }}>
                        13.5% of 70% minimum
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Key Financial Metrics */}
              <p style={{ fontSize: 24, fontWeight: 600, color: "#2E1A47", marginBottom: 12 }}>
                Key Financial Metrics
              </p>

              <div style={{ display: "flex", gap: 12, marginBottom: 48 }}>
                <AnimatedFundCard index={0} start={metricsVisible} />
                <AnimatedPercentCard index={1} start={metricsVisible} />
                <AnimatedYearCard index={2} start={metricsVisible} />
                <AnimatedRecoCard index={3} start={metricsVisible} />
              </div>

              {/* Chart */}
              <div
                style={{
                  padding: 20,
                  border: "1px solid rgba(15,23,41,0.06)",
                  borderRadius: 10,
                  background: "#FFFFFF",
                  marginBottom: 48,
                  boxShadow: "0 2px 8px rgba(15,23,41,0.05)",
                }}
              >
                {/* Title + legend */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                  <p
                    style={{
                      fontSize: 20,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      color: "#64748B",
                      fontWeight: 500,
                    }}
                  >
                    Reserve Fund Trajectory: Action Required
                  </p>
                  <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    {/* Dashed gray swatch */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <svg width="24" height="10">
                        <line
                          x1="0" y1="5" x2="24" y2="5"
                          stroke="#9CA3B8" strokeWidth="2"
                          strokeDasharray="4 3"
                        />
                      </svg>
                      <span style={{ fontSize: 17, color: "#9CA3B8" }}>Current Trajectory</span>
                    </div>
                    {/* Solid dark swatch */}
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <svg width="24" height="10">
                        <line x1="0" y1="5" x2="24" y2="5" stroke="#0F1729" strokeWidth="2" />
                      </svg>
                      <span style={{ fontSize: 17, color: "#0F1729" }}>Recommended Path</span>
                    </div>
                  </div>
                </div>

                {chartVisible && (
                  <ResponsiveContainer width="100%" height={280}>
                    <ComposedChart data={projectionData} margin={{ top: 24, right: 16, left: 16, bottom: 0 }}>
                      <defs>
                        <linearGradient id="fillCurrent" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#9CA3B8" stopOpacity={0} />
                          <stop offset="100%" stopColor="#9CA3B8" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="fillRecommended" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0F1729" stopOpacity={0.04} />
                          <stop offset="100%" stopColor="#0F1729" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>

                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />

                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 20, fill: "#64748B" }}
                        tickLine={false}
                        axisLine={false}
                        interval={4}
                        domain={[2026, 2056]}
                      />
                      <YAxis
                        tick={{ fontSize: 20, fill: "#64748B" }}
                        tickLine={false}
                        axisLine={false}
                        domain={[0, 4500000]}
                        tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                      />

                      <Tooltip
                        formatter={(v: number, name: string) => [
                          `$${v.toLocaleString()}`,
                          name === "current" ? "Current Trajectory" : "Recommended Path",
                        ]}
                        contentStyle={{
                          fontSize: 17,
                          borderRadius: 8,
                          border: "1px solid #E5E7EB",
                          background: "#FFFFFF",
                        }}
                      />

                      {/* Special Assessment Risk vertical line */}
                      <ReferenceLine
                        x={2028}
                        stroke="#EEEFF2"
                        strokeDasharray="4 3"
                        strokeWidth={1}
                        label={{
                          value: "Special Assessment Risk",
                          position: "top",
                          fontSize: 14,
                          fill: "#9CA3B8",
                          fontWeight: 400,
                        }}
                      />

                      {/* Current Trajectory — dashed neutral gray */}
                      <Area
                        type="monotone"
                        dataKey="current"
                        stroke="#9CA3B8"
                        strokeWidth={1.5}
                        strokeDasharray="5 4"
                        fill="url(#fillCurrent)"
                        dot={false}
                        animationDuration={2000}
                        animationBegin={0}
                      />

                      {/* Recommended Path — solid dark */}
                      <Area
                        type="monotone"
                        dataKey="recommended"
                        stroke="#0F1729"
                        strokeWidth={2}
                        fill="url(#fillRecommended)"
                        dot={false}
                        animationDuration={2000}
                        animationBegin={200}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* ── Benchmarking + Comparable Buildings (two-column) ── */}
              <AnimatePresence>
                {benchVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <div style={{ display: "flex", gap: 24, marginBottom: 24, alignItems: "flex-start" }}>

                      {/* ── LEFT 65% — comparison rows ── */}
                      <div style={{ flex: "0 0 calc(65% - 12px)" }}>
                        <p style={{ fontSize: 24, fontWeight: 600, color: "#2E1A47", marginBottom: 16 }}>
                          Benchmarking vs. Similar Buildings
                        </p>

                        {/* Column headers */}
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "0 0 8px",
                            borderBottom: "1px solid #F3F4F6",
                            marginBottom: 2,
                          }}
                        >
                          <span style={{ flex: 1, fontSize: 17, textTransform: "uppercase", letterSpacing: "0.07em", color: "#9CA3B8", fontWeight: 500 }}>
                            Metric
                          </span>
                          <span style={{ width: 130, textAlign: "right", fontSize: 17, textTransform: "uppercase", letterSpacing: "0.07em", color: "#9CA3B8", fontWeight: 500 }}>
                            This Building
                          </span>
                          <span style={{ width: 90 }} />
                        </div>

                        {benchmarkRows.map((b, i) => (
                          <div
                            key={b.label}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              minHeight: 48,
                              borderBottom: i < benchmarkRows.length - 1 ? "1px solid #F3F4F6" : "none",
                            }}
                          >
                            <span style={{ flex: 1, fontSize: 18, color: "#5A6178" }}>
                              {b.label}
                            </span>
                            <span
                              style={{
                                width: 130,
                                textAlign: "right",
                                fontSize: 19,
                                fontWeight: 600,
                                color: "#0F1729",
                                fontFamily: "'JetBrains Mono', monospace",
                              }}
                            >
                              {b.meridian}
                            </span>
                            <span style={{ width: 90, display: "flex", justifyContent: "flex-end" }}>
                              {b.above ? (
                                <span style={{ fontSize: 16, color: "#9CA3B8" }}>above avg ↑</span>
                              ) : (
                                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                  <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#DC2626", flexShrink: 0 }} />
                                  <span style={{ fontSize: 16, color: "#9CA3B8" }}>below avg ↓</span>
                                </div>
                              )}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* ── RIGHT 35% — How we found comparable buildings ── */}
                      <div style={{ flex: "0 0 calc(35% - 12px)" }}>
                        <div
                          style={{
                            background: "#F8F9FC",
                            border: "1px solid rgba(15,23,41,0.06)",
                            borderRadius: 10,
                            padding: 16,
                            boxShadow: "0 2px 8px rgba(15,23,41,0.05)",
                          }}
                        >
                          <p
                            style={{
                              fontSize: 20,
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              color: "#64748B",
                              fontWeight: 500,
                              marginBottom: 12,
                            }}
                          >
                            How We Found Comparable Buildings
                          </p>

                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {[
                              { label: "Location",      value: "New York, NY \u00b7 Concrete frame mid/high-rise" },
                              { label: "Building Type", value: "Condominium, mid/high-rise" },
                              { label: "Age Range",     value: "Built 1990\u20131995" },
                              { label: "Size Class",    value: "100\u2013150 units" },
                            ].map((row) => (
                              <div
                                key={row.label}
                                style={{
                                  display: "flex",
                                  alignItems: "flex-start",
                                  gap: 8,
                                  minHeight: 32,
                                }}
                              >
                                <span
                                  style={{
                                    fontSize: 17,
                                    color: "#64748B",
                                    width: 88,
                                    flexShrink: 0,
                                    paddingTop: 1,
                                  }}
                                >
                                  {row.label}
                                </span>
                                <span style={{ fontSize: 17, color: "#2E1A47", fontWeight: 500, lineHeight: 1.4 }}>
                                  {row.value}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div style={{ height: 1, background: "#E8EBF0", margin: "12px 0" }} />
                          <p style={{ fontSize: 16, fontStyle: "italic", color: "#64748B" }}>
                            Matched from 847 comparable NYC properties
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ── Recommendation Card ── */}
                    <div
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid rgba(15,23,41,0.06)",
                        borderRadius: 10,
                        padding: 24,
                        marginBottom: 12,
                        boxShadow: "0 8px 40px rgba(15,23,41,0.18), 0 0 0 1px rgba(15,23,41,0.12)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 20,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "#64748B",
                          fontWeight: 500,
                          marginBottom: 8,
                        }}
                      >
                        Our Recommendation
                      </p>
                      <p
                        style={{
                          fontSize: 24,
                          fontWeight: 600,
                          color: "#2E1A47",
                          lineHeight: 1.4,
                          marginBottom: 12,
                        }}
                      >
                        Increase reserve contributions to avoid a $340,000 special assessment in 2028.
                      </p>
                      <div style={{ display: "flex", gap: 8 }}>
                        {[
                          "Suggested increase: +$2,400/unit/yr",
                          "Avoids special assessment: 2028",
                        ].map((text) => (
                          <div
                            key={text}
                            style={{
                              background: "#F8F9FC",
                              border: "1px solid rgba(15,23,41,0.06)",
                              borderRadius: 6,
                              padding: "8px 14px",
                            }}
                          >
                            <span style={{ fontSize: 17, color: "#334155" }}>{text}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* ── Standalone CTA ── */}
                    <button
                      onClick={() => navigate("/funding")}
                      style={{
                        display: "block",
                        width: "100%",
                        height: 44,
                        background: "transparent",
                        color: "#2E1A47",
                        border: "1px solid #2E1A47",
                        borderRadius: 7,
                        fontSize: 19,
                        fontWeight: 500,
                        cursor: "pointer",
                        transition: "background 200ms, color 200ms",
                        marginBottom: 48,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#2E1A47";
                        e.currentTarget.style.color = "#FFFFFF";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.color = "#2E1A47";
                      }}
                    >
                      View Funding Options &rarr;
                    </button>

                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>

            {/* ════════════════════════════════════════════
                TAB 2: Stakeholder Standing
            ════════════════════════════════════════════ */}
            <TabsContent value="stakeholder" className="mt-0">
              <AnimatePresence>
                {riskCardVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    {/* Regulatory Update */}
                    <div
                      style={{
                        background: "#FFF7ED",
                        border: "1px solid #FED7AA",
                        borderRadius: 8,
                        padding: "14px 20px",
                        marginBottom: 24,
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 10,
                      }}
                    >
                      <AlertTriangle size={19} style={{ color: "#F97316", flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <p
                          style={{
                            fontSize: 20,
                            letterSpacing: "0.08em",
                            textTransform: "uppercase",
                            color: "#92400E",
                            fontWeight: 600,
                            marginBottom: 4,
                          }}
                        >
                          Regulatory Update
                        </p>
                        <p style={{ fontSize: 18, color: "#B45309", lineHeight: 1.6 }}>
                          January 2027: Reserve contribution requirement increasing from 10% to 15% of annual budget.
                        </p>
                      </div>
                    </div>

                    {/* Key Metrics Row */}
                    <div style={{ display: "flex", gap: 12, marginBottom: 48 }}>
                      {KEY_METRICS_ROW.map((m, i) => {
                        const variant =
                          m.label === "Delinquency Rate" || m.label === "Unfunded / Unit"
                            ? "danger"
                            : "neutral";
                        return (
                          <MetricCard
                            key={m.label}
                            label={m.label}
                            value={m.value}
                            index={i}
                            start={riskCardVisible}
                            variant={variant}
                          />
                        );
                      })}
                    </div>

                    {/* Requirement Tables */}
                    <p style={{ fontSize: 22, fontWeight: 600, color: "#2E1A47", marginBottom: 16 }}>
                      Stakeholder Requirements
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 48 }}>
                      {STAKEHOLDERS.map((s) => (
                        <StakeholderCard key={s.name} s={s} />
                      ))}
                    </div>

                    {/* Recommendation */}
                    <div
                      style={{
                        border: "1px solid rgba(15,23,41,0.06)",
                        borderRadius: 10,
                        background: "#FFFFFF",
                        padding: "20px 24px",
                        marginBottom: 12,
                        boxShadow: "0 8px 40px rgba(15,23,41,0.18), 0 0 0 1px rgba(15,23,41,0.12)",
                      }}
                    >
                      <p
                        style={{
                          fontSize: 20,
                          textTransform: "uppercase",
                          letterSpacing: "0.08em",
                          color: "#64748B",
                          fontWeight: 500,
                          marginBottom: 10,
                        }}
                      >
                        Our Recommendation
                      </p>
                      <p style={{ fontSize: 19, fontWeight: 500, color: "#2E1A47", lineHeight: 1.6 }}>
                        Based on the current CRF balance of $2,064,255 and projected replacement costs of $7,335,097
                        over the next 10 years, we recommend increasing monthly CRF allocations by $87.43 per
                        unit, bringing the annual contribution to $511,500. This positions the fund at 100%
                        financial strength over the 30-year horizon.
                      </p>
                    </div>
                    <GhostFundingBtn onClick={() => navigate("/funding")} />
                  </motion.div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
};

export default Financials;
