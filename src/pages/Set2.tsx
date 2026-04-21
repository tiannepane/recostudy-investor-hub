import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─── Types ──────────────────────────────────────────────────── */

interface StepDef {
  label: string;
  title: string;
  visual: React.ReactNode;
  duration: number;
}

/* ─── Cursor ─────────────────────────────────────────────────── */

const CursorIcon = ({ clicking }: { clicking: boolean }) => (
  <svg
    width="22" height="26" viewBox="0 0 22 26" fill="none"
    style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.35))", transform: clicking ? "scale(0.88)" : "scale(1)", transition: "transform 0.1s" }}
  >
    <path d="M2 2L2 18L6.5 13.5L9.5 20L12 19L9 12.5H15L2 2Z" fill="white" stroke="#1E293B" strokeWidth="1.5" />
  </svg>
);

/* ─── Story Viewer ───────────────────────────────────────────── */

const StoryViewer = ({
  setLabel, steps, onFinish,
}: {
  setLabel: string; steps: StepDef[]; onFinish: () => void;
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => { setCurrent(0); }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        setCurrent((c) => (c < steps.length - 1 ? c + 1 : c));
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setCurrent((c) => (c > 0 ? c - 1 : c));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [steps.length]);

  const goNext = () => {
    if (current < steps.length - 1) setCurrent((c) => c + 1);
    else onFinish();
  };
  const goPrev = () => { if (current > 0) setCurrent((c) => c - 1); };

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", display: "flex", flexDirection: "column", userSelect: "none" }}>
      {/* Progress bar */}
      <div style={{ height: 3, background: "#F1F3F7", position: "relative" }}>
        <motion.div
          animate={{ width: `${((current + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ position: "absolute", top: 0, left: 0, height: "100%", background: "#2E1A47" }}
        />
      </div>

      {/* Title */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`title-${current}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.3 }}
          style={{ padding: "32px 48px 0", maxWidth: 768, margin: "0 auto", width: "100%", boxSizing: "border-box" }}
        >
          <h2 style={{ fontSize: 42, fontWeight: 800, color: "#1E293B", lineHeight: 1.15, letterSpacing: "-0.02em", margin: 0 }}>
            {steps[current].title}
          </h2>
        </motion.div>
      </AnimatePresence>

      {/* Visual */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 48px 0" }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{ width: "100%", maxWidth: 720 }}
          >
            {steps[current].visual}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls — Back and Next only */}
      <div style={{ padding: "20px 48px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: 768, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <button
          onClick={goPrev}
          disabled={current === 0}
          style={{ padding: "11px 28px", borderRadius: 8, border: "1px solid #E2E8F0", background: "white", fontSize: 16, fontWeight: 500, color: current === 0 ? "#CBD5E1" : "#475569", cursor: current === 0 ? "default" : "pointer" }}
        >
          ← Back
        </button>
        <button
          onClick={goNext}
          style={{ padding: "11px 28px", borderRadius: 8, border: "none", background: "#2E1A47", fontSize: 16, fontWeight: 600, color: "white", cursor: "pointer" }}
        >
          {current === steps.length - 1 ? "Finish" : "Next →"}
        </button>
      </div>
    </div>
  );
};

/* ─── Step visuals ───────────────────────────────────────────── */

// Step 1 — Financials: risk banner + 3 key metric cards
const FinancialsStep = () => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 200); return () => clearTimeout(t); }, []);

  const METRICS = [
    { label: "Reserve Balance",  value: "$2,064,255", sub: null,                    accent: false },
    { label: "Percent Funded",   value: "13.5%",      sub: "Below Fannie Mae min.", accent: true  },
    { label: "Assessment Risk",  value: "2028",       sub: "2 years away",          accent: true  },
  ];

  return (
    <div style={{ width: "100%" }}>
      <p style={{ fontSize: 13, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Financials</p>

      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, x: 0 }}
            animate={{ opacity: 1, x: [0, -3, 3, -3, 3, 0] }}
            transition={{ opacity: { duration: 0.3 }, x: { duration: 0.4, ease: "easeInOut" } }}
            style={{ background: "rgba(255,255,255,0.9)", backdropFilter: "blur(8px)", border: "1px solid rgba(249,115,22,0.2)", boxShadow: "0 0 0 1px rgba(249,115,22,0.06), 0 8px 32px rgba(249,115,22,0.10)", borderRadius: 10, padding: "12px 18px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}
          >
            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F97316", flexShrink: 0 }} />
            <p style={{ fontSize: 17, color: "#92400E", fontWeight: 600 }}>
              Funding Risk Detected — 13.5% funded against 70% Fannie Mae minimum
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ display: "flex", gap: 12 }}>
        {METRICS.map((m, i) => (
          <AnimatePresence key={m.label}>
            {show && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, delay: i * 0.12 }}
                style={{ flex: 1, background: m.accent ? "rgba(255,255,255,0.85)" : "#FFFFFF", backdropFilter: m.accent ? "blur(8px)" : undefined, borderRadius: 10, border: m.accent ? "1px solid rgba(249,115,22,0.15)" : "1px solid rgba(15,23,41,0.06)", boxShadow: m.accent ? "0 0 0 1px rgba(249,115,22,0.06), 0 8px 32px rgba(249,115,22,0.10)" : "0 2px 8px rgba(15,23,41,0.05)", padding: "18px 20px" }}>
                <p style={{ fontSize: 13, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 500, marginBottom: 6 }}>{m.label}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  {m.accent && <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#EF4444", flexShrink: 0 }} />}
                  <p style={{ fontSize: 32, fontWeight: 700, color: "#2E1A47", lineHeight: 1 }}>{m.value}</p>
                </div>
                {m.sub && <p style={{ fontSize: 14, color: "#64748B", fontStyle: "italic", marginTop: 4 }}>{m.sub}</p>}
              </motion.div>
            )}
          </AnimatePresence>
        ))}
      </div>
    </div>
  );
};

// Step 2 — Generate documents (cursor clicks the button)
const GenerateStep = () => {
  const [phase, setPhase] = useState<"idle" | "generating" | "done">("idle");
  useEffect(() => {
    const t0 = setTimeout(() => setPhase("generating"), 300);
    const t1 = setTimeout(() => setPhase("done"), 1800);
    return () => { clearTimeout(t0); clearTimeout(t1); };
  }, []);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}>
      <p style={{ fontSize: 13, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", alignSelf: "flex-start" }}>Document Generation</p>

      <motion.button
        animate={{ background: phase === "done" ? "#16A34A" : phase === "generating" ? "#4D6BA9" : "#0A0A0A" }}
        transition={{ duration: 0.3 }}
        style={{ width: "100%", padding: "16px 0", color: "#FFFFFF", border: "none", borderRadius: 10, fontSize: 20, fontWeight: 600, cursor: "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}
      >
        {phase === "idle" && (<><FileText size={20} />Generate Documents</>)}
        {phase === "generating" && (<><span style={{ width: 16, height: 16, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />Generating...</>)}
        {phase === "done" && (<><Check size={20} />Documents Ready</>)}
      </motion.button>

      <AnimatePresence>
        {(phase === "generating" || phase === "done") && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 8 }}>
            {["Compliance Report", "Refinancing Package", "Board Quarterly Meeting"].map((doc, i) => (
              <motion.div key={doc} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.35 + 0.3 }}
                style={{ background: "#FFFFFF", borderRadius: 8, border: "1px solid #E5E7EB", padding: "10px 16px", display: "flex", alignItems: "center", gap: 12 }}>
                <FileText size={16} style={{ color: "#94A3B8", flexShrink: 0 }} />
                <span style={{ fontSize: 17, color: "#64748B", flex: 1 }}>{doc}</span>
                {phase === "done" ? (
                  <span style={{ fontSize: 13, color: "#16A34A", fontWeight: 600 }}>✓ Ready</span>
                ) : (
                  <span style={{ width: 14, height: 14, border: "2px solid #E5E7EB", borderTopColor: "#94A3B8", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Step 3 — Compliance report
const ComplianceStep = () => (
  <div style={{ width: "100%" }}>
    <p style={{ fontSize: 13, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Compliance Report</p>
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden" }}>
      <div style={{ background: "#F8F9FC", borderBottom: "1px solid #E5E7EB", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 44, borderRadius: 5, background: "white", border: "1px solid #E5E7EB", position: "relative", overflow: "hidden", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 9, height: 9, background: "#F1F5F9", borderLeft: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 12, background: "#2E1A47", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 6, fontWeight: 800, color: "white", letterSpacing: "0.06em" }}>PDF</span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#2E1A47" }}>Fannie Mae Compliance Report</p>
            <p style={{ fontSize: 14, color: "#94A3B8" }}>Generated April 2026 · Meridian Condominium</p>
          </div>
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#16A34A", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 6, padding: "4px 10px" }}>✓ Ready</span>
      </div>
      <div style={{ padding: "8px 0" }}>
        {[
          { name: "Reserve Fund % Funded",     current: "13.5%",   pass: true  },
          { name: "Delinquency Rate",           current: "3.1%",    pass: true  },
          { name: "Owner Occupancy",            current: "62%",     pass: true  },
          { name: "Reserve Contribution Rate",  current: "8.2%",    pass: false },
          { name: "Current Reserve Study",      current: "Expired", pass: false },
        ].map((r, i) => (
          <div key={r.name} style={{ display: "flex", alignItems: "center", padding: "10px 24px", borderTop: i > 0 ? "1px solid #F3F4F6" : "none" }}>
            <span style={{ flex: 1, fontSize: 17, color: "#334155" }}>{r.name}</span>
            <span style={{ fontSize: 17, fontWeight: 500, color: "#2E1A47", width: 80, textAlign: "right" }}>{r.current}</span>
            <div style={{ width: 70, display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 5 }}>
              <div style={{ width: 5, height: 5, borderRadius: "50%", background: r.pass ? "#16A34A" : "#DC2626" }} />
              <span style={{ fontSize: 15, color: r.pass ? "#16A34A" : "#DC2626", fontWeight: 500 }}>{r.pass ? "Met" : "At risk"}</span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
);

// Step 4 — Refinancing package
const RefinancingStep = () => (
  <div style={{ width: "100%" }}>
    <p style={{ fontSize: 13, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Refinancing Package</p>
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden" }}>
      <div style={{ background: "#F8F9FC", borderBottom: "1px solid #E5E7EB", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ width: 36, height: 44, borderRadius: 5, background: "white", border: "1px solid #E5E7EB", position: "relative", overflow: "hidden", flexShrink: 0 }}>
            <div style={{ position: "absolute", top: 0, right: 0, width: 9, height: 9, background: "#F1F5F9", borderLeft: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" }} />
            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 12, background: "#2E1A47", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ fontSize: 6, fontWeight: 800, color: "white", letterSpacing: "0.06em" }}>PDF</span>
            </div>
          </div>
          <div>
            <p style={{ fontSize: 20, fontWeight: 700, color: "#2E1A47" }}>Refinancing Package</p>
            <p style={{ fontSize: 14, color: "#94A3B8" }}>Generated April 2026 · Meridian Condominium</p>
          </div>
        </div>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#16A34A", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 6, padding: "4px 10px" }}>✓ Ready</span>
      </div>
      <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 12 }}>
        {[
          { label: "Reserve Fund Analysis", detail: "30-year projection · Current vs recommended path" },
          { label: "Component Inventory",   detail: "24 components · Replacement schedule 2026–2056" },
          { label: "Lender Summary",        detail: "Pre-approved · 5.2% APR reserve loan" },
          { label: "Benchmark Comparison",  detail: "vs. 847 comparable NYC properties" },
        ].map((item, i) => (
          <div key={item.label} style={{ display: "flex", alignItems: "flex-start", gap: 12, paddingTop: i > 0 ? 12 : 0, borderTop: i > 0 ? "1px solid #F3F4F6" : "none" }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#F0FDF4", border: "1px solid #BBF7D0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
              <Check size={13} style={{ color: "#16A34A" }} />
            </div>
            <div>
              <p style={{ fontSize: 17, fontWeight: 600, color: "#2E1A47", marginBottom: 2 }}>{item.label}</p>
              <p style={{ fontSize: 15, color: "#64748B" }}>{item.detail}</p>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
);

/* ─── Steps ──────────────────────────────────────────────────── */

const STEPS: StepDef[] = [
  {
    label: "Financials",
    title: "Your reserve fund is critically underfunded.",
    visual: <FinancialsStep />,
    duration: 4500,
  },
  {
    label: "Generate",
    title: "RECollab automatically generated your reports.",
    visual: <GenerateStep />,
    duration: 5500,
  },
  {
    label: "Compliance",
    title: "Fannie Mae report — ready to share with lenders.",
    visual: <ComplianceStep />,
    duration: 5000,
  },
  {
    label: "Refinancing",
    title: "Full refinancing package, assembled automatically.",
    visual: <RefinancingStep />,
    duration: 5000,
  },
];

/* ─── Page ───────────────────────────────────────────────────── */

const Set2 = () => {
  const navigate = useNavigate();
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <StoryViewer setLabel="RECollab · Financial Due Diligence" steps={STEPS} onFinish={() => navigate("/")} />
    </>
  );
};

export default Set2;
