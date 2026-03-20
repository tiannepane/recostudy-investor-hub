import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Landmark, Shield } from "lucide-react";
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
        // ease-out cubic
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
  const raw = useCountUp(135, start, 1500, index * 150); // ×10 for one decimal
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
  // clamp to valid year range
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

/* ─── Risk rows config ──────────────────────────────────── */

const riskRows: { dot: string; name: string; condition: Condition }[] = [
  { dot: "#EF4444", name: "Financial Health",  condition: "Poor"      },
  { dot: "#F59E0B", name: "Physical Condition", condition: "Fair"     },
  { dot: "#10B981", name: "Compliance",         condition: "Excellent" },
];

/* ─── Data ──────────────────────────────────────────────── */

const agentMessages = [
  { text: "Solver Engine — running financial analysis...", color: "gray" as const, startTime: 0 },
  { text: "Solver Engine — financial analysis complete, 3 risks flagged ✓", color: "green" as const, startTime: 3000 },
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
  const riskCardVisible = elapsed >= 5000;

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeItem="financials" visitedItems={["overview", "inventory"]} />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: "48px 60px 40px" }}>
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings › ABC Condominium Association, Inc. › Financials"
          />

          <div style={{ marginBottom: 20 }}>
            <AgentStatus messages={agentMessages} elapsed={elapsed} />
          </div>

          {/* ── Key Financial Metrics ── */}
          <p className="text-heading font-semibold" style={{ fontSize: 20, marginBottom: 12 }}>
            Key Financial Metrics
          </p>

          <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
            <FundCard   label="CURRENT FUND AMOUNT"     index={0} start={metricsVisible} />
            <PercentCard label="PERCENT FUNDED"         index={1} start={metricsVisible} />
            <YearCard   label="SPECIAL ASSESSMENT YEAR" index={2} start={metricsVisible} />
            <RecoCard   label="RECOSCORE"               index={3} start={metricsVisible} />
          </div>

          {/* ── Chart + Risk Assessment ── */}
          <div style={{ display: "flex", gap: 16 }}>

            {/* Left: chart card — 65% */}
            <div
              className="rounded-xl border border-border bg-card/50"
              style={{ flex: "0 0 65%", padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
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

            {/* Right: Risk Assessment card — flex 1 */}
            <AnimatePresence>
              {riskCardVisible && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="flex-1 rounded-xl border border-border bg-card/50"
                  style={{ padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                >
                  {/* Header */}
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                    <AlertTriangle size={14} style={{ color: "#F59E0B", flexShrink: 0 }} />
                    <p className="text-heading font-semibold" style={{ fontSize: 15 }}>
                      Risk Assessment
                    </p>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: "#E8EBF0", marginBottom: 12 }} />

                  {/* Lenders / Insurers */}
                  <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
                    <div style={{ flex: 1 }}>
                      <Landmark size={20} style={{ color: "#9CA3B8", marginBottom: 4 }} />
                      <p className="text-body-text" style={{ fontSize: 12, marginBottom: 2 }}>Lenders</p>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#EF4444", marginBottom: 2 }}>Restricted</p>
                      <p className="text-breadcrumb" style={{ fontSize: 11, lineHeight: 1.3 }}>
                        Fund reserves to unlock financing
                      </p>
                    </div>
                    <div style={{ flex: 1 }}>
                      <Shield size={20} style={{ color: "#9CA3B8", marginBottom: 4 }} />
                      <p className="text-body-text" style={{ fontSize: 12, marginBottom: 2 }}>Insurers</p>
                      <p style={{ fontSize: 15, fontWeight: 600, color: "#F59E0B", marginBottom: 2 }}>At Risk</p>
                      <p className="text-breadcrumb" style={{ fontSize: 11, lineHeight: 1.3 }}>
                        Complete deferred repairs
                      </p>
                    </div>
                  </div>

                  {/* Divider */}
                  <div style={{ height: 1, background: "#E8EBF0", marginBottom: 8 }} />

                  {/* Risk rows */}
                  <div style={{ display: "flex", flexDirection: "column" }}>
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
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: r.dot,
                            flexShrink: 0,
                            marginRight: 8,
                          }}
                        />
                        <p className="text-heading flex-1" style={{ fontSize: 13, fontWeight: 500 }}>
                          {r.name}
                        </p>
                        <ConditionIndicator condition={r.condition} />
                      </div>
                    ))}
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

export default Financials;
