import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Star, Mail, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* ─── Shared story viewer ───────────────────────────────────── */

interface StepDef {
  label: string;
  visual: React.ReactNode;
  caption: string;
  duration: number;
}

const StoryViewer = ({
  setLabel,
  steps,
  onFinish,
}: {
  setLabel: string;
  steps: StepDef[];
  onFinish: () => void;
}) => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    setCurrent(0);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (current < steps.length - 1) setCurrent((c) => c + 1);
      else onFinish();
    }, steps[current].duration);
    return () => clearTimeout(timer);
  }, [current, steps, onFinish]);

  const advance = () => {
    if (current < steps.length - 1) setCurrent((c) => c + 1);
    else onFinish();
  };

  return (
    <div
      onClick={advance}
      style={{
        minHeight: "100vh",
        background: "#FAFAFA",
        display: "flex",
        flexDirection: "column",
        cursor: "default",
        userSelect: "none",
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: "24px 36px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            fontSize: 13,
            color: "#94A3B8",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            fontWeight: 500,
          }}
        >
          {setLabel}
        </span>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span
            style={{
              fontSize: 13,
              color: "#94A3B8",
              fontFamily: "monospace",
            }}
          >
            {current + 1} / {steps.length}
          </span>
          <span
            style={{
              fontSize: 13,
              color: "#CBD5E1",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {steps[current].label}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 2, background: "#F1F3F7", position: "relative" }}>
        <motion.div
          animate={{ width: `${((current + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          style={{ position: "absolute", top: 0, left: 0, height: "100%", background: "#2E1A47" }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px 48px 0",
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            style={{
              width: "100%",
              maxWidth: 720,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 36,
            }}
          >
            {steps[current].visual}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Caption + dots */}
      <div
        style={{
          padding: "32px 48px 40px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
        }}
      >
        <AnimatePresence mode="wait">
          <motion.p
            key={`caption-${current}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              fontSize: 20,
              color: "#64748B",
              textAlign: "center",
              maxWidth: 560,
            }}
          >
            {steps[current].caption}
          </motion.p>
        </AnimatePresence>

        {/* Step dots */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {steps.map((_, i) => (
            <motion.div
              key={i}
              animate={{
                width: i === current ? 24 : 6,
                background: i < current ? "#2E1A47" : i === current ? "#2E1A47" : "#E2E8F0",
                opacity: i < current ? 0.35 : 1,
              }}
              transition={{ duration: 0.3 }}
              style={{ height: 6, borderRadius: 3 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

/* ─── Step visuals ──────────────────────────────────────────── */

// Step 1 — Inventory: single component row highlighted
const InventoryStep = () => (
  <div style={{ width: "100%" }}>
    <p style={{ fontSize: 13, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
      Inventory
    </p>
    <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden" }}>
      {/* Column headers */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 18px",
          background: "#F8F9FC",
          borderBottom: "1px solid #E5E7EB",
        }}
      >
        <span style={{ flex: 1, fontSize: 13, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Component</span>
        <span style={{ width: 130, fontSize: 13, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Remaining Life</span>
        <span style={{ width: 110, fontSize: 13, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "right" }}>Est. Cost</span>
      </div>

      {/* Highlighted row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "16px 18px",
          background: "#FFF5F5",
          borderLeft: "3px solid #EF4444",
          borderBottom: "1px solid #F3F4F6",
        }}
      >
        <img
          src="/elevator-cab-townhouse.png"
          alt=""
          style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", marginRight: 14, flexShrink: 0 }}
        />
        <div style={{ flex: 1 }}>
          <p style={{ fontSize: 20, fontWeight: 600, color: "#2E1A47", marginBottom: 2 }}>Elevator Cab — Townhouse</p>
          <p style={{ fontSize: 14, color: "#94A3B8" }}>Services · Installed 1992</p>
        </div>
        <span style={{ width: 130, fontSize: 18, fontWeight: 700, color: "#EF4444" }}>End of life</span>
        <span style={{ width: 110, fontSize: 18, fontWeight: 600, color: "#2E1A47", fontFamily: "monospace", textAlign: "right" }}>$36,000</span>
      </div>

      {/* Dimmed rows */}
      {[1, 2].map((i) => (
        <div
          key={i}
          style={{
            display: "flex",
            alignItems: "center",
            padding: "14px 18px",
            opacity: 0.22,
            borderBottom: i < 2 ? "1px solid #F3F4F6" : "none",
          }}
        >
          <div style={{ width: 56, height: 56, borderRadius: 8, background: "#E5E7EB", marginRight: 14, flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
            <div style={{ height: 13, width: 200, background: "#E5E7EB", borderRadius: 3 }} />
            <div style={{ height: 10, width: 120, background: "#F1F3F7", borderRadius: 3 }} />
          </div>
          <div style={{ width: 130, height: 13, background: "#E5E7EB", borderRadius: 3 }} />
          <div style={{ width: 110, height: 13, background: "#E5E7EB", borderRadius: 3 }} />
        </div>
      ))}
    </div>
  </div>
);

// Step 2 — Add to Projects: button click → project card
const AddToProjectsStep = () => {
  const [phase, setPhase] = useState<"button" | "creating" | "created">("button");

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("creating"), 700);
    const t2 = setTimeout(() => setPhase("created"), 1600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
      {/* Detail panel excerpt */}
      <div
        style={{
          width: "100%",
          background: "#FFFFFF",
          borderRadius: 12,
          border: "1px solid #E5E7EB",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}
      >
        <img
          src="/elevator-cab-townhouse.png"
          alt=""
          style={{ width: 56, height: 56, borderRadius: 8, objectFit: "cover", flexShrink: 0 }}
        />
        <div>
          <p style={{ fontSize: 20, fontWeight: 600, color: "#2E1A47" }}>Elevator Cab — Townhouse</p>
          <p style={{ fontSize: 15, color: "#94A3B8" }}>End of life · $36,000</p>
        </div>
      </div>

      {/* Button */}
      <motion.button
        animate={{
          background: phase === "creating" ? "#4D6BA9" : phase === "created" ? "#16A34A" : "#0A0A0A",
        }}
        transition={{ duration: 0.3 }}
        style={{
          width: "100%",
          padding: "14px 0",
          color: "#FFFFFF",
          border: "none",
          borderRadius: 10,
          fontSize: 20,
          fontWeight: 600,
          cursor: "default",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
        }}
      >
        {phase === "button" && "Add to Projects →"}
        {phase === "creating" && (
          <>
            <span
              style={{
                width: 16,
                height: 16,
                border: "2px solid rgba(255,255,255,0.35)",
                borderTopColor: "white",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.8s linear infinite",
              }}
            />
            Creating project...
          </>
        )}
        {phase === "created" && (
          <>
            <Check size={18} />
            Project Created
          </>
        )}
      </motion.button>

      {/* Project card appears */}
      <AnimatePresence>
        {phase === "created" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              width: "100%",
              background: "#FFFFFF",
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              padding: "18px 24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div>
              <p style={{ fontSize: 19, fontWeight: 600, color: "#2E1A47", marginBottom: 3 }}>
                Elevator Cab Replacement
              </p>
              <p style={{ fontSize: 15, color: "#94A3B8" }}>Active · Q2 2026 · $36,000</p>
            </div>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "#16A34A",
                background: "#F0FDF4",
                border: "1px solid #BBF7D0",
                borderRadius: 6,
                padding: "4px 10px",
              }}
            >
              Active
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Step 3 — RFP Generated
const RFPStep = () => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 400); return () => clearTimeout(t); }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ width: "100%" }}
        >
          <p style={{ fontSize: 13, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
            RFP Generated
          </p>
          <div
            style={{
              borderRadius: 12,
              overflow: "hidden",
              position: "relative",
            }}
          >
            <img
              src="/elevator-cab-townhouse.png"
              alt=""
              style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }}
            />
            <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,10,0.55)" }} />
            <div style={{ position: "absolute", inset: 0, padding: "20px 24px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "white",
                    background: "#2E1A47",
                    borderRadius: 4,
                    padding: "2px 8px",
                  }}
                >
                  Live RFP
                </span>
                <p style={{ fontSize: 22, fontWeight: 700, color: "white" }}>
                  Elevator Cab Replacement — Townhouse
                </p>
              </div>
              {[
                { label: "Budget", value: "$36,000 – $44,000" },
                { label: "Timeline", value: "Q2 2026 – Q3 2026" },
                { label: "Priority", value: "● Critical" },
              ].map((r) => (
                <div key={r.label} style={{ display: "flex", gap: 10, fontSize: 16 }}>
                  <span style={{ color: "#64748B", width: 64, flexShrink: 0 }}>{r.label}</span>
                  <span style={{ color: "white" }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Step 4 — Marketplace bids appear one by one
const BIDS = [
  { name: "Summit Elevator Works",   stars: 4.8, amount: "$38,000", recommended: true  },
  { name: "Elite Elevator Interiors", stars: 4.6, amount: "$41,000", recommended: false },
  { name: "BuildRight Elevator Co.", stars: 4.9, amount: "$44,000", recommended: false },
];

const MarketplaceStep = () => {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisible(1), 200),
      setTimeout(() => setVisible(2), 700),
      setTimeout(() => setVisible(3), 1200),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ fontSize: 13, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
        Contractor Bids
      </p>
      {BIDS.map((bid, i) => (
        <AnimatePresence key={bid.name}>
          {visible > i && (
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                background: "#FFFFFF",
                borderRadius: 10,
                border: bid.recommended ? "1.5px solid #0A0A0A" : "1px solid #E5E7EB",
                padding: "14px 18px",
                display: "flex",
                alignItems: "center",
                gap: 14,
                position: "relative",
              }}
            >
              {bid.recommended && (
                <span
                  style={{
                    position: "absolute",
                    top: -11,
                    left: 14,
                    background: "#0A0A0A",
                    color: "white",
                    fontSize: 13,
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    borderRadius: 4,
                    padding: "2px 8px",
                  }}
                >
                  ⭐ Recommended
                </span>
              )}
              <p
                style={{
                  fontFamily: "monospace",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "#C0C0C0",
                  width: 24,
                  flexShrink: 0,
                  textAlign: "center",
                }}
              >
                {i + 1}
              </p>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 18, fontWeight: 600, color: "#2E1A47", marginBottom: 2 }}>{bid.name}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Star size={14} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
                  <span style={{ fontSize: 14, color: "#4B5563" }}>{bid.stars}</span>
                </div>
              </div>
              <p style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 600, color: "#2E1A47" }}>
                {bid.amount}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      ))}
    </div>
  );
};

// Step 5 — Project Complete
const CompleteStep = () => (
  <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
      style={{
        width: 72,
        height: 72,
        borderRadius: "50%",
        background: "#16A34A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Check size={36} color="white" strokeWidth={2.5} />
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      style={{
        width: "100%",
        background: "#FFFFFF",
        borderRadius: 12,
        border: "1px solid #E5E7EB",
        padding: "20px 24px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: 22, fontWeight: 700, color: "#2E1A47" }}>Elevator Cab Replacement</p>
        <span
          style={{
            fontSize: 14,
            fontWeight: 600,
            color: "#16A34A",
            background: "#F0FDF4",
            border: "1px solid #BBF7D0",
            borderRadius: 6,
            padding: "4px 10px",
          }}
        >
          Complete
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 0" }}>
        {[
          { label: "Contractor", value: "Summit Elevator Works" },
          { label: "Final Cost",  value: "$38,000" },
          { label: "Completed",   value: "June 2026" },
          { label: "Warranty",    value: "5 years" },
        ].map(({ label, value }) => (
          <div key={label}>
            <p style={{ fontSize: 13, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>{label}</p>
            <p style={{ fontSize: 18, fontWeight: 500, color: "#2E1A47" }}>{value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  </div>
);

// Step 6 — Insurance Notified
const InsuranceStep = () => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 300); return () => clearTimeout(t); }, []);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 13, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
        Insurance Update
      </p>

      {/* Notification card */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              background: "#FFFFFF",
              borderRadius: 12,
              border: "1px solid #E5E7EB",
              padding: "20px 24px",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <Mail size={22} style={{ color: "#16A34A" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 19, fontWeight: 700, color: "#2E1A47", marginBottom: 4 }}>
                  Notification Sent
                </p>
                <p style={{ fontSize: 17, color: "#64748B", marginBottom: 12 }}>
                  Wawanesa Insurance · Asset update
                </p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {[
                    "Elevator Cab replaced — June 2026",
                    "Replacement cost: $38,000",
                    "Warranty: 5 years",
                  ].map((line) => (
                    <div key={line} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#16A34A", flexShrink: 0 }} />
                      <span style={{ fontSize: 16, color: "#334155" }}>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
              <span
                style={{
                  fontSize: 13,
                  color: "#16A34A",
                  fontWeight: 600,
                  background: "#F0FDF4",
                  border: "1px solid #BBF7D0",
                  borderRadius: 6,
                  padding: "4px 10px",
                  flexShrink: 0,
                }}
              >
                ✓ Sent
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Building record updated note */}
      <AnimatePresence>
        {show && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, delay: 0.6 }}
            style={{
              background: "#F8F9FC",
              borderRadius: 10,
              border: "1px solid #E5E7EB",
              padding: "12px 18px",
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <FileText size={16} style={{ color: "#64748B", flexShrink: 0 }} />
            <span style={{ fontSize: 16, color: "#64748B" }}>
              Building record updated · Inventory synced · Component life reset
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Steps definition ──────────────────────────────────────── */

const STEPS: StepDef[] = [
  {
    label: "Inventory",
    visual: <InventoryStep />,
    caption: "2 components flagged for immediate replacement",
    duration: 3500,
  },
  {
    label: "Add to Projects",
    visual: <AddToProjectsStep />,
    caption: "One click creates the project",
    duration: 4000,
  },
  {
    label: "RFP",
    visual: <RFPStep />,
    caption: "RFP auto-generated and sent to vetted contractors",
    duration: 3500,
  },
  {
    label: "Marketplace",
    visual: <MarketplaceStep />,
    caption: "3 bids received — best price-to-quality ratio recommended",
    duration: 4500,
  },
  {
    label: "Complete",
    visual: <CompleteStep />,
    caption: "Project complete — records updated automatically",
    duration: 3500,
  },
  {
    label: "Insurance",
    visual: <InsuranceStep />,
    caption: "Insurance notified automatically — no manual follow-up needed",
    duration: 4000,
  },
];

/* ─── Page ───────────────────────────────────────────────────── */

const Set1 = () => {
  const navigate = useNavigate();

  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <StoryViewer
        setLabel="Set 1 — Project Workflow"
        steps={STEPS}
        onFinish={() => navigate("/set2")}
      />
    </>
  );
};

export default Set1;
