import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Landmark,
  ChevronDown,
  ChevronUp,
  Building2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
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
}: {
  label: string;
  value: string;
  index: number;
  start: boolean;
}) => (
  <AnimatePresence>
    {start && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut", delay: index * 0.08 }}
        style={{
          padding: "20px 24px",
          background: "#F7F7F7",
          borderRadius: 16,
          flex: "1 1 0",
          minWidth: 0,
        }}
      >
        <p
          style={{
            fontSize: 11,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            marginBottom: 8,
            color: "#999",
            fontWeight: 500,
          }}
        >
          {label}
        </p>
        <p style={{ fontSize: 28, fontWeight: 600, lineHeight: 1, color: "#0A0A0A" }}>
          {value}
        </p>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─── Animated metric cards for Financial Overview ──────── */

const AnimatedFundCard = ({ index, start }: { index: number; start: boolean }) => {
  const v = useCountUp(2064255, start, 1500, index * 150);
  return <MetricCard label="RESERVE FUND BALANCE" value={`$${v.toLocaleString()}`} index={index} start={start} />;
};

const AnimatedPercentCard = ({ index, start }: { index: number; start: boolean }) => {
  const raw = useCountUp(135, start, 1500, index * 150);
  return <MetricCard label="PERCENT FUNDED" value={`${(raw / 10).toFixed(1)}%`} index={index} start={start} />;
};

const AnimatedYearCard = ({ index, start }: { index: number; start: boolean }) => {
  const v = useCountUp(2028, start, 1500, index * 150);
  return <MetricCard label="SPECIAL ASSESSMENT YEAR" value={String(Math.max(2024, v))} index={index} start={start} />;
};

const AnimatedRecoCard = ({ index, start }: { index: number; start: boolean }) => {
  const v = useCountUp(47, start, 1500, index * 150);
  return <MetricCard label="RECOSCORE" value={String(v)} index={index} start={start} />;
};

/* ─── Data ──────────────────────────────────────────────── */

const projectionData = Array.from({ length: 31 }, (_, i) => {
  const year = 2026 + i;
  const t = i / 30;
  let value: number;
  if (t < 0.3) value = 2064000 + (t / 0.3) * 300000;
  else if (t < 0.5) value = 2364000 + ((t - 0.3) / 0.2) * 200000;
  else if (t < 0.7) value = 2564000 + ((t - 0.5) / 0.2) * 400000;
  else value = 2964000 + ((t - 0.7) / 0.3) * 500000;
  return { year, value: Math.round(value) };
});

const benchmarkRows = [
  { label: "HOA Fee / sq ft", cityGate: "$4.82", avg: "$3.95", above: true, goodWhenAbove: false },
  { label: "Reserve Fund Balance", cityGate: "$2,064,255", avg: "$1,420,000", above: true, goodWhenAbove: true },
  { label: "Annual CRF Contribution", cityGate: "$511,500", avg: "$380,000", above: true, goodWhenAbove: true },
  { label: "Reserve Fund / Unit", cityGate: "$11,932", avg: "$8,208", above: true, goodWhenAbove: true },
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

/* ─── Expandable stakeholder card ─────────────────────── */

const StakeholderCard = ({ s }: { s: StakeholderDef }) => {
  const [open, setOpen] = useState(false);
  const Icon = s.icon;
  return (
    <div
      style={{
        borderRadius: 16,
        border: "1px solid #E5E7EB",
        background: "#FFFFFF",
        overflow: "hidden",
      }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "18px 24px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <Icon size={18} style={{ color: "#999", flexShrink: 0 }} />
        <span style={{ fontSize: 15, fontWeight: 600, color: "#0A0A0A", flex: 1 }}>
          {s.name}
        </span>
        <span style={{ fontSize: 13, color: "#999" }}>
          {s.metCount} of {s.metTotal} met
        </span>
        {open ? (
          <ChevronUp size={16} style={{ color: "#999", flexShrink: 0, marginLeft: 8 }} />
        ) : (
          <ChevronDown size={16} style={{ color: "#999", flexShrink: 0, marginLeft: 8 }} />
        )}
      </button>

      {open && (
        <div style={{ padding: "0 24px 24px" }}>
          <div style={{ height: 1, background: "#E5E7EB", marginBottom: 16 }} />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Requirement", "Threshold", "Current", "Status"].map((h) => (
                  <th
                    key={h}
                    style={{
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#999",
                      fontWeight: 500,
                      textAlign: "left",
                      padding: "0 12px 12px 0",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {s.requirements.map((r) => (
                <tr key={r.name}>
                  <td style={{ fontSize: 14, color: "#0A0A0A", padding: "10px 12px 10px 0", borderTop: "1px solid #F0F0F0" }}>
                    {r.name}
                  </td>
                  <td style={{ fontSize: 14, color: "#0A0A0A", padding: "10px 12px 10px 0", borderTop: "1px solid #F0F0F0" }}>
                    {r.threshold}
                  </td>
                  <td style={{ fontSize: 14, fontWeight: 500, color: "#0A0A0A", padding: "10px 12px 10px 0", borderTop: "1px solid #F0F0F0" }}>
                    {r.current}
                  </td>
                  <td style={{ fontSize: 14, color: "#0A0A0A", padding: "10px 0", borderTop: "1px solid #F0F0F0", textAlign: "center", width: 48 }}>
                    {r.pass ? "●" : "○"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

/* ─── Page ──────────────────────────────────────────────── */

const Financials = () => {
  const [elapsed, setElapsed] = useState(0);

  const reset = useCallback(() => setElapsed(0), []);

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  const metricsVisible = elapsed >= 1500;
  const chartVisible = elapsed >= 3500;
  const benchVisible = elapsed >= 5000;
  const riskCardVisible = elapsed >= 5000;

  return (
    <div className="flex min-h-screen" style={{ background: "#FFFFFF" }}>
      <Sidebar activeItem="financials" visitedItems={["overview", "inventory"]} />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: "48px 60px 60px" }}>
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings › City Gate 1, LMS 195 › Financials"
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
                className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-[#0A0A0A] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2 pt-0 text-[13px]"
                style={{ color: "#9CA3AF", fontWeight: 500 }}
              >
                Financial Overview
              </TabsTrigger>
              <TabsTrigger
                value="stakeholder"
                className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-[#0A0A0A] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2 pt-0 text-[13px]"
                style={{ color: "#9CA3AF", fontWeight: 500 }}
              >
                Stakeholder Standing
              </TabsTrigger>
            </TabsList>

            {/* ════════════════════════════════════════════
                TAB 1: Financial Overview
            ════════════════════════════════════════════ */}
            <TabsContent value="overview" className="mt-0">

              {/* Key Financial Metrics */}
              <p style={{ fontSize: 18, fontWeight: 600, color: "#0A0A0A", marginBottom: 12 }}>
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
                  border: "1px solid #E5E7EB",
                  borderRadius: 12,
                  background: "#FFFFFF",
                  marginBottom: 48,
                }}
              >
                <p
                  style={{
                    fontSize: 10,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    marginBottom: 12,
                    color: "#9CA3AF",
                    fontWeight: 500,
                  }}
                >
                  30-Year Reserve Fund Projection
                </p>
                {chartVisible && (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={projectionData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#0A0A0A" stopOpacity={0.08} />
                          <stop offset="100%" stopColor="#0A0A0A" stopOpacity={0.01} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 10, fill: "#9CA3AF" }}
                        tickLine={false}
                        axisLine={false}
                        interval={4}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#9CA3AF" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip
                        formatter={(v: number) => [`$${v.toLocaleString()}`, "Reserve Fund"]}
                        contentStyle={{
                          fontSize: 12,
                          borderRadius: 8,
                          border: "1px solid #E5E7EB",
                          background: "#FFFFFF",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#0A0A0A"
                        strokeWidth={2}
                        fill="url(#areaFill)"
                        animationDuration={2000}
                        animationBegin={0}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>

              {/* Benchmarking Section */}
              <AnimatePresence>
                {benchVisible && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, ease: "easeOut" }}
                  >
                    <p style={{ fontSize: 16, fontWeight: 600, color: "#0A0A0A", marginBottom: 16 }}>
                      Benchmarking vs. Similar Buildings
                    </p>

                    {/* Two-column comparison table */}
                    <div
                      style={{
                        border: "1px solid #E5E7EB",
                        borderRadius: 12,
                        background: "#FFFFFF",
                        overflow: "hidden",
                        marginBottom: 48,
                      }}
                    >
                      <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid #E5E7EB" }}>
                            <th
                              style={{
                                fontSize: 10,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                color: "#9CA3AF",
                                fontWeight: 500,
                                textAlign: "left",
                                padding: "12px 20px",
                              }}
                            >
                              Metric
                            </th>
                            <th
                              style={{
                                fontSize: 10,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                color: "#9CA3AF",
                                fontWeight: 500,
                                textAlign: "right",
                                padding: "12px 20px",
                              }}
                            >
                              City Gate 1
                            </th>
                            <th
                              style={{
                                fontSize: 10,
                                letterSpacing: "0.06em",
                                textTransform: "uppercase",
                                color: "#9CA3AF",
                                fontWeight: 500,
                                textAlign: "right",
                                padding: "12px 20px",
                              }}
                            >
                              Similar Buildings Avg
                            </th>
                            <th style={{ width: 80, padding: "12px 20px" }} />
                          </tr>
                        </thead>
                        <tbody>
                          {benchmarkRows.map((b, i) => (
                            <tr
                              key={b.label}
                              style={{
                                borderBottom: i < benchmarkRows.length - 1 ? "1px solid #F3F4F6" : "none",
                              }}
                            >
                              <td style={{ fontSize: 13, color: "#6B7280", padding: "12px 20px" }}>
                                {b.label}
                              </td>
                              <td
                                style={{
                                  fontSize: 14,
                                  fontWeight: 600,
                                  color: "#0A0A0A",
                                  fontFamily: "monospace",
                                  textAlign: "right",
                                  padding: "12px 20px",
                                }}
                              >
                                {b.cityGate}
                              </td>
                              <td
                                style={{
                                  fontSize: 13,
                                  color: "#9CA3AF",
                                  fontFamily: "monospace",
                                  textAlign: "right",
                                  padding: "12px 20px",
                                }}
                              >
                                {b.avg}
                              </td>
                              <td
                                style={{
                                  fontSize: 11,
                                  color: (b.above === b.goodWhenAbove) ? "#16803C" : "#B45309",
                                  fontWeight: 500,
                                  textAlign: "right",
                                  padding: "12px 20px",
                                }}
                              >
                                {b.above ? "above avg \u2191" : "below avg \u2193"}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* How we found comparable buildings */}
                    <p
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        color: "#9CA3AF",
                        fontWeight: 500,
                        marginBottom: 12,
                      }}
                    >
                      How we found comparable buildings
                    </p>
                    <div
                      style={{
                        border: "1px solid #E5E7EB",
                        borderRadius: 12,
                        background: "#FFFFFF",
                        padding: 20,
                        marginBottom: 48,
                      }}
                    >
                      {[
                        { label: "Location", value: "Vancouver, BC \u2014 Concrete frame mid/high-rise" },
                        { label: "Building Type", value: "Townhouse and apartment complex" },
                        { label: "Age Range", value: "Built 1990\u20131995" },
                        { label: "Size Class", value: "150\u2013200 units" },
                      ].map((row, i) => (
                        <div
                          key={row.label}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "10px 0",
                            borderTop: i > 0 ? "1px solid #F3F4F6" : "none",
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 500, color: "#0A0A0A", width: 140, flexShrink: 0 }}>
                            {row.label}
                          </span>
                          <span style={{ fontSize: 13, color: "#6B7280" }}>
                            {row.value}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Recommendation */}
                    <div
                      style={{
                        border: "1px solid #E0E0E0",
                        borderRadius: 16,
                        background: "#FFFFFF",
                        padding: "28px 28px",
                        marginBottom: 48,
                      }}
                    >
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#0A0A0A", marginBottom: 10 }}>
                        Our recommendation
                      </p>
                      <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
                        Based on the current CRF balance of $2,064,255 and projected replacement costs of $7,335,097
                        over the next 10 years, we recommend increasing monthly CRF allocations by $87.43 per
                        unit — bringing the annual contribution to $511,500. This positions the fund at 100%
                        financial strength over the 30-year horizon.
                      </p>
                    </div>

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
                        background: "#FFFFFF",
                        border: "1px solid #E0E0E0",
                        borderRadius: 16,
                        padding: "24px 28px",
                        marginBottom: 48,
                      }}
                    >
                      <p
                        style={{
                          fontSize: 10,
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          color: "#999",
                          fontWeight: 500,
                          marginBottom: 8,
                        }}
                      >
                        Regulatory Update
                      </p>
                      <p style={{ fontSize: 14, color: "#0A0A0A", lineHeight: 1.7 }}>
                        January 2027 — Reserve contribution requirement increasing from 10% to 15% of annual budget.
                      </p>
                    </div>

                    {/* Key Metrics Row */}
                    <div style={{ display: "flex", gap: 12, marginBottom: 48 }}>
                      {KEY_METRICS_ROW.map((m, i) => (
                        <MetricCard key={m.label} label={m.label} value={m.value} index={i} start={riskCardVisible} />
                      ))}
                    </div>

                    {/* Requirement Tables */}
                    <p style={{ fontSize: 16, fontWeight: 600, color: "#0A0A0A", marginBottom: 16 }}>
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
                        border: "1px solid #E0E0E0",
                        borderRadius: 16,
                        background: "#FFFFFF",
                        padding: "28px 28px",
                      }}
                    >
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#0A0A0A", marginBottom: 10 }}>
                        Our recommendation
                      </p>
                      <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7 }}>
                        Based on the current CRF balance of $2,064,255 and projected replacement costs of $7,335,097
                        over the next 10 years, we recommend increasing monthly CRF allocations by $87.43 per
                        unit — bringing the annual contribution to $511,500. This positions the fund at 100%
                        financial strength over the 30-year horizon.
                      </p>
                    </div>
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
