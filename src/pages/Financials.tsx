import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Landmark,
  Shield,
  CheckCircle,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  Building2,
} from "lucide-react";
import ConditionIndicator from "@/components/ConditionIndicator";
import type { Condition } from "@/components/ConditionIndicator";
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
import AgentStatus from "@/components/AgentStatus";
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

/* ─── Metric card with counting ────────────────────────── */

type MetricCardProps = {
  label: string;
  index: number;
  start: boolean;
};

const FundCard = ({ label, index, start }: MetricCardProps) => {
  const v = useCountUp(370000, start, 1500, index * 150);
  return (
    <CardShell label={label} index={index} start={start}>
      <p className="font-mono text-heading" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1 }}>
        ${v.toLocaleString()}
      </p>
    </CardShell>
  );
};

const PercentCard = ({ label, index, start }: MetricCardProps) => {
  const raw = useCountUp(135, start, 1500, index * 150);
  const display = (raw / 10).toFixed(1);
  return (
    <CardShell label={label} index={index} start={start}>
      <p className="font-mono text-heading" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1 }}>
        {display}%
      </p>
      <div style={{ marginTop: 6 }}>
        <ConditionIndicator condition="Poor" />
      </div>
    </CardShell>
  );
};

const YearCard = ({ label, index, start }: MetricCardProps) => {
  const v = useCountUp(2028, start, 1500, index * 150);
  const display = Math.max(2024, v);
  return (
    <CardShell label={label} index={index} start={start}>
      <p className="font-mono text-heading" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1 }}>
        {display}
      </p>
    </CardShell>
  );
};

const RecoCard = ({ label, index, start }: MetricCardProps) => {
  const v = useCountUp(47, start, 1500, index * 150);
  return (
    <CardShell label={label} index={index} start={start}>
      <p className="font-mono text-heading" style={{ fontSize: 28, fontWeight: 500, lineHeight: 1 }}>
        {v}
      </p>
      <div style={{ marginTop: 6 }}>
        <ConditionIndicator condition="Poor" />
      </div>
    </CardShell>
  );
};

/* ─── Card shell ────────────────────────────────────────── */

const CardShell = ({
  label,
  index,
  start,
  children,
}: MetricCardProps & { children: React.ReactNode }) => (
  <AnimatePresence>
    {start && (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: "easeOut", delay: index * 0.08 }}
        className="rounded-xl border border-border bg-card/50"
        style={{ padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", flex: "1 1 0", minWidth: 0 }}
      >
        <p
          className="text-breadcrumb font-medium"
          style={{ fontSize: 10, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 6 }}
        >
          {label}
        </p>
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─── Data ──────────────────────────────────────────────── */

const agentMessages = [
  { text: "Solver Engine \u2014 running financial analysis...", color: "gray" as const, startTime: 0 },
  { text: "Solver Engine \u2014 financial analysis complete, 3 risks flagged \u2713", color: "green" as const, startTime: 3000 },
];

const projectionData = Array.from({ length: 31 }, (_, i) => {
  const year = 2026 + i;
  const t = i / 30;
  let value: number;
  if (t < 0.3)      value = 200000 + (t / 0.3) * 30000;
  else if (t < 0.5) value = 230000 + ((t - 0.3) / 0.2) * 10000;
  else if (t < 0.7) value = 240000 + ((t - 0.5) / 0.2) * 30000;
  else               value = 270000 + ((t - 0.7) / 0.3) * 30000;
  return { year, value: Math.round(value) };
});

const benchmarkData = [
  { label: "HOA Fee / sq ft", value: "$4.82", avg: "$3.95", percentile: 72, status: "above" as const },
  { label: "Operating Cost / unit", value: "$8,420", avg: "$7,100", percentile: 68, status: "above" as const },
];

const comparisonRows = [
  { metric: "Location Match", detail: "Manhattan, Upper East Side", score: "92%" },
  { metric: "Building Type", detail: "High-rise Condominium", score: "88%" },
  { metric: "Age Range", detail: "Built 1985-1995", score: "85%" },
  { metric: "Size Class", detail: "150-250 units", score: "90%" },
];

/* ─── Stakeholder data ──────────────────────────────────── */

const riskRows: { dot: string; name: string; condition: Condition }[] = [
  { dot: "#EF4444", name: "Financial Health",  condition: "Poor"      },
  { dot: "#F59E0B", name: "Physical Condition", condition: "Fair"     },
  { dot: "#10B981", name: "Compliance",         condition: "Excellent" },
];

interface StakeholderDef {
  name: string;
  icon: React.ElementType;
  status: "Compliant" | "At Risk" | "Restricted";
  statusColor: string;
  statusBg: string;
  metCount: number;
  metTotal: number;
  requirements: { name: string; threshold: string; current: string; pass: boolean; recommendation?: string }[];
}

const STAKEHOLDERS: StakeholderDef[] = [
  {
    name: "Fannie Mae",
    icon: Landmark,
    status: "Restricted",
    statusColor: "#EF4444",
    statusBg: "#FEF2F2",
    metCount: 3,
    metTotal: 6,
    requirements: [
      { name: "Reserve Fund % Funded", threshold: "\u226510%", current: "13.5%", pass: true },
      { name: "Reserve Contribution Rate", threshold: "\u226510% of budget", current: "8.2%", pass: false, recommendation: "Increase annual contribution to meet 10% threshold" },
      { name: "Delinquency Rate", threshold: "\u22645%", current: "3.1%", pass: true },
      { name: "Owner Occupancy", threshold: "\u226550%", current: "62%", pass: true },
      { name: "Special Assessment History", threshold: "None in 3 years", current: "1 in 2024", pass: false, recommendation: "Resolve outstanding assessment before next review" },
      { name: "Current Reserve Study", threshold: "Within 3 years", current: "Expired 2023", pass: false, recommendation: "Commission updated reserve study immediately" },
    ],
  },
  {
    name: "FHA",
    icon: Building2,
    status: "At Risk",
    statusColor: "#F59E0B",
    statusBg: "#FFFBEB",
    metCount: 4,
    metTotal: 5,
    requirements: [
      { name: "Reserve Fund % Funded", threshold: "\u226510%", current: "13.5%", pass: true },
      { name: "Owner Occupancy", threshold: "\u226550%", current: "62%", pass: true },
      { name: "Delinquency Rate", threshold: "\u226415%", current: "3.1%", pass: true },
      { name: "Litigation Status", threshold: "No active litigation", current: "Clear", pass: true },
      { name: "Insurance Coverage", threshold: "Adequate", current: "Under review", pass: false, recommendation: "Complete insurance review to confirm adequate coverage" },
    ],
  },
  {
    name: "Private Lenders",
    icon: Shield,
    status: "At Risk",
    statusColor: "#F59E0B",
    statusBg: "#FFFBEB",
    metCount: 3,
    metTotal: 4,
    requirements: [
      { name: "Reserve Fund Balance", threshold: "\u2265$500K", current: "$370,000", pass: false, recommendation: "Fund reserves to meet minimum balance requirement" },
      { name: "Delinquency Rate", threshold: "\u22648%", current: "3.1%", pass: true },
      { name: "Physical Condition", threshold: "Fair or better", current: "Fair", pass: true },
      { name: "Current Reserve Study", threshold: "Within 5 years", current: "2023", pass: true },
    ],
  },
];

const KEY_METRICS_ROW = [
  { label: "Reserve % Funded", value: "13.5%", color: "#0F1729" },
  { label: "Contribution Rate", value: "8.2%", color: "#0F1729" },
  { label: "Delinquency Rate", value: "3.1%", color: "#0F1729" },
  { label: "Owner Occupancy", value: "62%", color: "#0F1729" },
  { label: "Unfunded / Unit", value: "$12,400", color: "#EF4444" },
];

const PRIORITY_ACTIONS = [
  { text: "Commission updated reserve study (expired 2023)", urgency: "High" },
  { text: "Increase reserve contribution rate to 10%+ of budget", urgency: "High" },
  { text: "Complete insurance coverage review", urgency: "Medium" },
  { text: "Resolve 2024 special assessment before next lender review", urgency: "Medium" },
];

/* ─── Expandable stakeholder card ─────────────────────── */

const StakeholderCard = ({ s }: { s: StakeholderDef }) => {
  const [open, setOpen] = useState(false);
  const Icon = s.icon;
  return (
    <div
      className="rounded-xl border border-border bg-card/50"
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.04)", overflow: "hidden" }}
    >
      <button
        onClick={() => setOpen(!open)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "16px 18px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <Icon size={20} style={{ color: "#9CA3B8", flexShrink: 0 }} />
        <span style={{ fontSize: 15, fontWeight: 600, color: "#0F1729", flex: 1 }}>
          {s.name}
        </span>
        <span style={{ fontSize: 12, color: "#9CA3B8", marginRight: 8 }}>
          {s.metCount}/{s.metTotal} requirements met
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 5, flexShrink: 0 }}>
          <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.statusColor }} />
          <span style={{ fontSize: 13, fontWeight: 500, color: s.statusColor }}>{s.status}</span>
        </span>
        {open ? (
          <ChevronUp size={16} style={{ color: "#9CA3B8", flexShrink: 0 }} />
        ) : (
          <ChevronDown size={16} style={{ color: "#9CA3B8", flexShrink: 0 }} />
        )}
      </button>

      {open && (
        <div style={{ padding: "0 18px 16px" }}>
          <div style={{ height: 1, background: "#E8EBF0", marginBottom: 12 }} />
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Requirement", "Threshold", "Current", "Status"].map((h) => (
                  <th
                    key={h}
                    style={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      color: "#9CA3B8",
                      fontWeight: 500,
                      textAlign: "left",
                      padding: "0 8px 8px 0",
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
                  <td style={{ fontSize: 13, color: "#0F1729", padding: "6px 8px 6px 0", borderTop: "1px solid #F1F3F6" }}>
                    {r.name}
                  </td>
                  <td style={{ fontSize: 12, color: "#5A6178", fontFamily: "monospace", padding: "6px 8px 6px 0", borderTop: "1px solid #F1F3F6" }}>
                    {r.threshold}
                  </td>
                  <td style={{ fontSize: 12, fontWeight: 500, color: "#0F1729", fontFamily: "monospace", padding: "6px 8px 6px 0", borderTop: "1px solid #F1F3F6" }}>
                    {r.current}
                  </td>
                  <td style={{ padding: "6px 0", borderTop: "1px solid #F1F3F6" }}>
                    {r.pass ? (
                      <CheckCircle size={16} style={{ color: "#10B981" }} />
                    ) : (
                      <XCircle size={16} style={{ color: "#EF4444" }} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Recommendations */}
          {s.requirements.filter((r) => r.recommendation).length > 0 && (
            <div style={{ marginTop: 12, background: "#FFFBEB", borderRadius: 8, padding: "10px 14px" }}>
              <p style={{ fontSize: 11, fontWeight: 600, color: "#92400E", marginBottom: 6 }}>Recommendations</p>
              {s.requirements.filter((r) => r.recommendation).map((r) => (
                <p key={r.name} style={{ fontSize: 12, color: "#92400E", lineHeight: 1.5, marginBottom: 2 }}>
                  &bull; {r.recommendation}
                </p>
              ))}
            </div>
          )}
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

  const metricsVisible  = elapsed >= 1500;
  const chartVisible    = elapsed >= 3500;
  const benchVisible    = elapsed >= 5000;
  const riskCardVisible = elapsed >= 5000;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeItem="financials" visitedItems={["overview", "inventory"]} />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: "48px 60px 40px" }}>
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings > ABC Condominium Association, Inc. > Financials"
            activeItem="financials"
          />

          <div style={{ marginBottom: 20 }}>
            <AgentStatus messages={agentMessages} elapsed={elapsed} />
          </div>

          {/* ── Tabs ── */}
          <Tabs defaultValue="overview">
            <TabsList
              className="bg-transparent rounded-none h-auto p-0 gap-0"
              style={{ borderBottom: "1px solid #E8EBF0", marginBottom: 20 }}
            >
              <TabsTrigger
                value="overview"
                className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-[#4F6BFF] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2 pt-0 text-[14px]"
                style={{ color: "#9CA3B8", fontWeight: 500 }}
              >
                Financial Overview
              </TabsTrigger>
              <TabsTrigger
                value="stakeholder"
                className="bg-transparent rounded-none border-b-2 border-transparent data-[state=active]:border-[#4F6BFF] data-[state=active]:bg-transparent data-[state=active]:shadow-none px-4 pb-2 pt-0 text-[14px]"
                style={{ color: "#9CA3B8", fontWeight: 500 }}
              >
                Stakeholder Standing
              </TabsTrigger>
            </TabsList>

            {/* ════════════════════════════════════════════
                TAB 1: Financial Overview
            ════════════════════════════════════════════ */}
            <TabsContent value="overview" className="mt-0">

              {/* Key Financial Metrics */}
              <p className="text-heading font-semibold" style={{ fontSize: 20, marginBottom: 12 }}>
                Key Financial Metrics
              </p>

              <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                <FundCard    label="CURRENT FUND AMOUNT"     index={0} start={metricsVisible} />
                <PercentCard label="PERCENT FUNDED"          index={1} start={metricsVisible} />
                <YearCard    label="SPECIAL ASSESSMENT YEAR" index={2} start={metricsVisible} />
                <RecoCard    label="RECOSCORE"               index={3} start={metricsVisible} />
              </div>

              {/* Chart — full width */}
              <div
                className="rounded-xl border border-border bg-card/50"
                style={{ padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: 16 }}
              >
                <p
                  className="text-breadcrumb font-medium"
                  style={{ fontSize: 11, letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: 10 }}
                >
                  30-Year Reserve Fund Projection
                </p>
                {chartVisible && (
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={projectionData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%"   stopColor="#4F6BFF" stopOpacity={0.15} />
                          <stop offset="100%" stopColor="#4F6BFF" stopOpacity={0.02} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 10, fill: "#9AA2BD" }}
                        tickLine={false}
                        axisLine={false}
                        interval={4}
                      />
                      <YAxis
                        tick={{ fontSize: 10, fill: "#9AA2BD" }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                      />
                      <Tooltip
                        formatter={(v: number) => [`$${v.toLocaleString()}`, "Reserve Fund"]}
                        contentStyle={{
                          fontSize: 12,
                          borderRadius: 8,
                          border: "1px solid hsl(var(--border))",
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#4F6BFF"
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
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12 }}>
                      <TrendingUp size={16} style={{ color: "#4F6BFF" }} />
                      <p className="text-heading font-semibold" style={{ fontSize: 16 }}>
                        Benchmarking vs. Area Average
                      </p>
                    </div>

                    <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                      {benchmarkData.map((b) => (
                        <div
                          key={b.label}
                          className="rounded-xl border border-border bg-card/50"
                          style={{ flex: 1, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                        >
                          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 6 }}>
                            {b.label}
                          </p>
                          <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 6 }}>
                            <span className="font-mono" style={{ fontSize: 24, fontWeight: 600, color: "#0F1729" }}>
                              {b.value}
                            </span>
                            <span style={{ fontSize: 12, color: "#9CA3B8" }}>
                              avg {b.avg}
                            </span>
                          </div>
                          {/* Percentile bar */}
                          <div style={{ width: "100%", height: 6, borderRadius: 3, background: "#F1F3F6", overflow: "hidden", marginBottom: 4 }}>
                            <div style={{ width: `${b.percentile}%`, height: "100%", background: b.status === "above" ? "#F59E0B" : "#10B981", borderRadius: 3 }} />
                          </div>
                          <p style={{ fontSize: 11, color: "#5A6178" }}>
                            {b.percentile}th percentile {b.status === "above" ? "(above average)" : "(below average)"}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Comparison table */}
                    <div
                      className="rounded-xl border border-border bg-card/50"
                      style={{ padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                    >
                      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 10 }}>
                        Comparable Building Match
                      </p>
                      {comparisonRows.map((row, i) => (
                        <div
                          key={row.metric}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            padding: "8px 0",
                            borderTop: i > 0 ? "1px solid #F1F3F6" : "none",
                          }}
                        >
                          <span style={{ fontSize: 13, fontWeight: 500, color: "#0F1729", flex: 1 }}>
                            {row.metric}
                          </span>
                          <span style={{ fontSize: 12, color: "#5A6178", marginRight: 16 }}>
                            {row.detail}
                          </span>
                          <span className="font-mono" style={{ fontSize: 13, fontWeight: 600, color: "#4F6BFF" }}>
                            {row.score}
                          </span>
                        </div>
                      ))}
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
                    {/* Regulatory Alert */}
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 10,
                        background: "#FAFBFD",
                        border: "1px solid #E8EBF0",
                        borderLeft: "3px solid #F59E0B",
                        borderRadius: 10,
                        padding: "12px 16px",
                        marginBottom: 16,
                      }}
                    >
                      <Info size={16} style={{ color: "#F59E0B", flexShrink: 0 }} />
                      <div>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "#0F1729" }}>
                          Regulatory Update: January 2027
                        </p>
                        <p style={{ fontSize: 13, color: "#5A6178", lineHeight: 1.5 }}>
                          Reserve contribution requirement increasing from 10% to 15% of annual budget.
                        </p>
                      </div>
                    </div>

                    {/* Key Metrics Row */}
                    <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                      {KEY_METRICS_ROW.map((m) => (
                        <div
                          key={m.label}
                          className="rounded-xl border border-border bg-card/50"
                          style={{ flex: 1, padding: "12px 14px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                        >
                          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.04em", color: "#9CA3B8", marginBottom: 4 }}>
                            {m.label}
                          </p>
                          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 600, color: m.color }}>
                            {m.value}
                          </p>
                        </div>
                      ))}
                    </div>

                    {/* Overall Risk Summary */}
                    <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
                      {/* Risk bars */}
                      <div
                        className="rounded-xl border border-border bg-card/50"
                        style={{ flex: "0 0 35%", padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                          <AlertTriangle size={14} style={{ color: "#F59E0B", flexShrink: 0 }} />
                          <p className="text-heading font-semibold" style={{ fontSize: 14 }}>
                            Risk Summary
                          </p>
                        </div>
                        <div style={{ height: 1, background: "#E8EBF0", marginBottom: 10 }} />
                        {riskRows.map((r, i) => (
                          <div
                            key={r.name}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              height: 36,
                              borderBottom: i < riskRows.length - 1 ? "1px solid #F0F2F7" : "none",
                            }}
                          >
                            <div style={{ width: 8, height: 8, borderRadius: "50%", background: r.dot, opacity: 0.7, flexShrink: 0, marginRight: 8 }} />
                            <p style={{ fontSize: 13, color: "#5A6178", fontWeight: 500, flex: 1 }}>
                              {r.name}
                            </p>
                            <ConditionIndicator condition={r.condition} />
                          </div>
                        ))}
                      </div>

                      {/* Stakeholder summary cards */}
                      <div style={{ flex: 1, display: "flex", gap: 10 }}>
                        {STAKEHOLDERS.map((s) => {
                          const Icon = s.icon;
                          return (
                            <div
                              key={s.name}
                              className="rounded-xl border border-border bg-card/50"
                              style={{ flex: 1, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                            >
                              <Icon size={20} style={{ color: "#9CA3B8", marginBottom: 6 }} />
                              <p style={{ fontSize: 13, fontWeight: 600, color: "#0F1729", marginBottom: 4 }}>
                                {s.name}
                              </p>
                              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 6 }}>
                                <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.statusColor, flexShrink: 0 }} />
                                <span style={{ fontSize: 13, fontWeight: 500, color: s.statusColor }}>{s.status}</span>
                              </div>
                              <p style={{ fontSize: 12, color: "#9CA3B8" }}>
                                {s.metCount}/{s.metTotal} met
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Expandable Stakeholder Detail Cards */}
                    <p className="text-heading font-semibold" style={{ fontSize: 16, marginBottom: 10 }}>
                      Detailed Requirements
                    </p>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                      {STAKEHOLDERS.map((s) => (
                        <StakeholderCard key={s.name} s={s} />
                      ))}
                    </div>

                    {/* Priority Actions */}
                    <div
                      className="rounded-xl border border-border bg-card/50"
                      style={{ padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                    >
                      <p className="text-heading font-semibold" style={{ fontSize: 14, marginBottom: 10 }}>
                        Priority Action Items
                      </p>
                      <div style={{ height: 1, background: "#E8EBF0", marginBottom: 10 }} />
                      {PRIORITY_ACTIONS.map((a, i) => (
                        <div
                          key={i}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 10,
                            padding: "8px 0",
                            borderTop: i > 0 ? "1px solid #F1F3F6" : "none",
                          }}
                        >
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: "50%",
                              background: a.urgency === "High" ? "#EF4444" : "#F59E0B",
                              flexShrink: 0,
                            }}
                          />
                          <span style={{ fontSize: 13, color: "#5A6178" }}>
                            {a.text}
                          </span>
                        </div>
                      ))}
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
