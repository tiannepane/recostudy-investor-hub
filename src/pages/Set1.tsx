import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Star, Mail, FileText, Image as ImageIcon, Eye, Video, ShieldCheck, Pencil } from "lucide-react";
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
    <div style={{ minHeight: "100vh", background: "#FAFAFA", display: "flex", flexDirection: "column", userSelect: "none", fontFamily: "'Inter', sans-serif" }}>
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
          <h2 style={{ fontSize: 42, fontWeight: 800, color: "#0F172A", lineHeight: 1.15, letterSpacing: "-0.02em", margin: 0, fontFamily: "'Inter', sans-serif" }}>
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
          style={{ padding: "11px 28px", borderRadius: 8, border: "1px solid #E2E8F0", background: "white", fontSize: 16, fontWeight: 600, color: current === 0 ? "#CBD5E1" : "#334155", cursor: current === 0 ? "default" : "pointer", fontFamily: "'Inter', sans-serif" }}
        >
          ← Back
        </button>
        <button
          onClick={goNext}
          style={{ padding: "11px 28px", borderRadius: 8, border: "none", background: "#2E1A47", fontSize: 16, fontWeight: 700, color: "white", cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
        >
          {current === steps.length - 1 ? "Finish" : "Next →"}
        </button>
      </div>
    </div>
  );
};

/* ─── Step visuals ───────────────────────────────────────────── */

// Step 1 — Drop zone
const PHOTO_URLS = [
  "/suspended-slab-waterproofing.png",
  "/parkade-roof-deck.png",
  "/exterior-windows-aluminum.png",
  "/elevator-machinery-townhouse.png",
  "/roofing-inverted.png",
  "/building-corridor.png",
];

const DropZoneStep = () => {
  const [photoCount, setPhotoCount] = useState(0);
  const [showPdf, setShowPdf] = useState(false);
  const [showMp4, setShowMp4] = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhotoCount(1), 200),
      setTimeout(() => setPhotoCount(2), 500),
      setTimeout(() => setPhotoCount(3), 800),
      setTimeout(() => setPhotoCount(4), 1100),
      setTimeout(() => setPhotoCount(5), 1400),
      setTimeout(() => setPhotoCount(6), 1700),
      setTimeout(() => setShowPdf(true), 2200),
      setTimeout(() => setShowMp4(true), 2700),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const POSITIONS = [
    { top: 16, left: "calc(50% - 138px)" },
    { top: 16, left: "calc(50% - 46px)" },
    { top: 16, left: "calc(50% + 46px)" },
    { top: 100, left: "calc(50% - 138px)" },
    { top: 100, left: "calc(50% - 46px)" },
    { top: 100, left: "calc(50% + 46px)" },
  ];

  return (
    <div style={{ width: "100%" }}>
      <p style={{ fontSize: 13, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Upload</p>
      <div style={{ position: "relative", width: "100%", height: 220, borderRadius: 12, border: "1.5px dashed #C0C0C0", background: "#FAFAFA", overflow: "hidden" }}>
        <AnimatePresence>
          {photoCount === 0 && (
            <motion.div exit={{ opacity: 0 }} transition={{ duration: 0.3 }}
              style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, pointerEvents: "none" }}>
              <ImageIcon size={32} style={{ color: "#C0C0C0" }} />
              <p style={{ fontSize: 16, color: "#94A3B8" }}>Drop files here</p>
            </motion.div>
          )}
        </AnimatePresence>

        {PHOTO_URLS.map((url, i) => {
          if (photoCount <= i) return null;
          const pos = POSITIONS[i];
          return (
            <motion.div key={url} initial={{ x: -600, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.55, ease: "easeOut" }}
              style={{ position: "absolute", top: pos.top, left: pos.left, width: 88, height: 76, borderRadius: 8, border: "2px solid white", boxShadow: "0 4px 12px rgba(0,0,0,0.12)", overflow: "hidden" }}>
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </motion.div>
          );
        })}

        <AnimatePresence>
          {showPdf && (
            <motion.div initial={{ x: -600, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.55, ease: "easeOut" }}
              style={{ position: "absolute", bottom: 14, left: "calc(50% - 80px)" }}>
              <div style={{ position: "relative", width: 46, height: 58 }}>
                {[2, 1, 0].map((offset) => (
                  <div key={offset} style={{ position: "absolute", top: offset * 3, left: offset * 3, width: 40, height: 50, borderRadius: 5, background: "white", border: "1px solid #E5E7EB", boxShadow: "0 2px 6px rgba(0,0,0,0.10)", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: 0, right: 0, width: 10, height: 10, background: "#F1F5F9", borderLeft: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" }} />
                    <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 14, background: "#E53E3E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 7, fontWeight: 800, color: "white", letterSpacing: "0.06em" }}>PDF</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showMp4 && (
            <motion.div initial={{ x: -600, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.55, ease: "easeOut" }}
              style={{ position: "absolute", bottom: 14, left: "calc(50% + 20px)" }}>
              <div style={{ width: 40, height: 50, borderRadius: 5, background: "white", border: "1px solid #E5E7EB", boxShadow: "0 2px 6px rgba(0,0,0,0.10)", overflow: "hidden", position: "relative" }}>
                <div style={{ position: "absolute", top: 0, right: 0, width: 10, height: 10, background: "#F1F5F9", borderLeft: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB" }} />
                <div style={{ position: "absolute", top: 10, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                  <Video size={14} style={{ color: "#94A3B8" }} />
                </div>
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 14, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ fontSize: 7, fontWeight: 800, color: "white", letterSpacing: "0.06em" }}>MP4</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 12 }}>
        <AnimatePresence>
          {photoCount >= 6 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "white", borderRadius: 8, border: "1px solid #E5E7EB" }}>
              <ImageIcon size={16} style={{ color: "#2E1A47", flexShrink: 0 }} />
              <span style={{ fontSize: 16, color: "#2E1A47", flex: 1 }}>6 building inspection photos</span>
              <span style={{ fontSize: 13, color: "#94A3B8" }}>24.5 MB</span>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showPdf && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "white", borderRadius: 8, border: "1px solid #E5E7EB" }}>
              <FileText size={16} style={{ color: "#2E1A47", flexShrink: 0 }} />
              <span style={{ fontSize: 16, color: "#2E1A47", flex: 1 }}>Financial Statement · Reserve Study · Meeting Minutes · Audit Report</span>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showMp4 && (
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
              style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 14px", background: "white", borderRadius: 8, border: "1px solid #E5E7EB" }}>
              <Video size={16} style={{ color: "#2E1A47", flexShrink: 0 }} />
              <span style={{ fontSize: 16, color: "#2E1A47", flex: 1 }}>site-walkthrough.mp4</span>
              <span style={{ fontSize: 13, color: "#94A3B8" }}>4m 32s</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

// Step 2 — AI agents
const AgentsStep = () => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 40), 40);
    return () => clearInterval(id);
  }, []);

  const prog = (start: number, dur: number) =>
    elapsed < start ? 0 : Math.min((elapsed - start) / dur, 1);

  const visionProg = prog(200, 1800);
  const docProg    = prog(600, 1800);
  const videoProg  = prog(1000, 1800);
  const qaVisible  = elapsed >= 3200;

  const AGENTS = [
    { name: "Vision Agent",   Icon: Eye,      color: "#6366F1", progress: visionProg, obs: ["→ Scanning 6 inspection images...", "→ Elevator cab wear detected", "→ Spalling flagged on east elevation"] },
    { name: "Document Agent", Icon: FileText, color: "#0EA5E9", progress: docProg,    obs: ["→ Parsing 4 documents...", "→ Reserve balance: $2,064,255", "→ 10 components near end of life"] },
    { name: "Video Agent",    Icon: Video,    color: "#8B5CF6", progress: videoProg,  obs: ["→ Transcribing 4m 32s walkthrough...", "→ Rooftop membrane: last serviced 2019", "→ Parkade slab cracking confirmed"] },
  ];

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ fontSize: 13, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Analyzing</p>
      {AGENTS.map((a) => {
        const done = a.progress >= 1;
        return (
          <div key={a.name} style={{ borderRadius: 10, border: `1px solid ${a.color}22`, borderLeft: `3px solid ${a.color}`, background: done ? "#FAFAFA" : "#FFFFFF", padding: "12px 16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: done ? 0 : 8 }}>
              <a.Icon size={15} style={{ color: a.color, flexShrink: 0 }} />
              <span style={{ fontSize: 15, fontWeight: 600, color: "#1E293B", flex: 1 }}>{a.name}</span>
              {done ? (
                <span style={{ fontSize: 13, color: "#22C55E", fontWeight: 600 }}>✓ Done</span>
              ) : (
                <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ duration: 1.2, repeat: Infinity }}
                  style={{ fontSize: 13, color: a.color, fontWeight: 500 }}>Scanning...</motion.span>
              )}
            </div>
            {!done && (
              <>
                <div style={{ width: "100%", height: 2, background: "#E5E7EB", borderRadius: 1, overflow: "hidden", marginBottom: 8 }}>
                  <motion.div style={{ height: "100%", background: a.color, borderRadius: 1 }} animate={{ width: `${a.progress * 100}%` }} transition={{ duration: 0.1 }} />
                </div>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#64748B", lineHeight: 1.7 }}>
                  {a.obs.map((o, i) => (
                    <div key={i} style={{ opacity: a.progress >= [0.25, 0.6, 0.88][i] ? 1 : 0, transition: "opacity 0.4s" }}>{o}</div>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })}
      <AnimatePresence>
        {qaVisible && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ display: "flex", alignItems: "center", gap: 10, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 10, padding: "12px 16px" }}>
            <ShieldCheck size={18} style={{ color: "#16A34A", flexShrink: 0 }} />
            <span style={{ fontSize: 16, fontWeight: 600, color: "#15803D" }}>QA Agent: all data validated — 24 components catalogued</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Step 3 — Inventory builds
const INVENTORY_ROWS = [
  { name: "Elevator Cab — Townhouse",       rul: 0, cost: "$36,000",  eol: true  },
  { name: "Garbage Compactor",              rul: 0, cost: "$42,000",  eol: true  },
  { name: "Boiler",                         rul: 1, cost: "$100,000", eol: false },
  { name: "Suspended Slab Waterproofing",   rul: 2, cost: "$180,000", eol: false },
  { name: "Wall Finishes — Paint",          rul: 2, cost: "$95,000",  eol: false },
  { name: "Elevator Machinery — Townhouse", rul: 4, cost: "$85,000",  eol: false },
];

const InventoryBuildStep = () => {
  const [showReal, setShowReal] = useState(false);
  const [rowCount, setRowCount] = useState(0);

  useEffect(() => {
    const t0 = setTimeout(() => setShowReal(true), 600);
    INVENTORY_ROWS.forEach((_, i) => {
      setTimeout(() => setRowCount(i + 1), 600 + i * 180);
    });
    return () => clearTimeout(t0);
  }, []);

  return (
    <div style={{ width: "100%" }}>
      <p style={{ fontSize: 13, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>Inventory Generated</p>
      <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden" }}>
        <div style={{ display: "flex", padding: "10px 18px", background: "#F8F9FC", borderBottom: "1px solid #E5E7EB" }}>
          <span style={{ flex: 1, fontSize: 13, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Component</span>
          <span style={{ width: 120, fontSize: 13, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Remaining Life</span>
          <span style={{ width: 90, fontSize: 13, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "right" }}>Cost</span>
        </div>
        {!showReal ? (
          Array.from({ length: 5 }, (_, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", padding: "12px 18px", borderTop: i > 0 ? "1px solid #F3F4F6" : "none" }}>
              <div style={{ flex: 1, height: 12, background: "#F1F3F7", borderRadius: 3 }} />
              <div style={{ width: 80, height: 12, background: "#F1F3F7", borderRadius: 3, marginLeft: 12 }} />
              <div style={{ width: 60, height: 12, background: "#F1F3F7", borderRadius: 3, marginLeft: 12 }} />
            </div>
          ))
        ) : (
          INVENTORY_ROWS.map((row, i) => (
            <AnimatePresence key={row.name}>
              {rowCount > i && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}
                  style={{ display: "flex", alignItems: "center", padding: "11px 18px", borderTop: i > 0 ? "1px solid #F3F4F6" : "none", background: row.eol ? "#FFF5F5" : "white", borderLeft: row.eol ? "3px solid #EF4444" : "3px solid transparent" }}>
                  <span style={{ flex: 1, fontSize: 16, fontWeight: row.eol ? 600 : 400, color: "#2E1A47" }}>{row.name}</span>
                  <span style={{ width: 120, fontSize: 15, fontWeight: row.eol ? 700 : 400, color: row.eol ? "#EF4444" : "#4B5563" }}>
                    {row.rul === 0 ? "End of life" : `${row.rul} yr${row.rul !== 1 ? "s" : ""}`}
                  </span>
                  <span style={{ width: 90, fontSize: 15, fontFamily: "monospace", color: "#2E1A47", textAlign: "right" }}>{row.cost}</span>
                </motion.div>
              )}
            </AnimatePresence>
          ))
        )}
      </div>
    </div>
  );
};

// Step 4 — Inventory row click → slide-in detail panel → Add to Projects
const InventoryToProjectStep = () => {
  const [phase, setPhase] = useState<"list" | "panel" | "creating" | "created">("list");
  const [clicking, setClicking] = useState(false);
  const [clickingBtn, setClickingBtn] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: typeof window !== "undefined" ? window.innerWidth - 40 : 800, y: 300 });
  const rowRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const t0 = setTimeout(() => {
      setCursorVisible(true);
      const rect = rowRef.current?.getBoundingClientRect();
      if (rect) setCursorPos({ x: rect.left + rect.width * 0.28, y: rect.top + rect.height * 0.5 });
    }, 700);
    const t1 = setTimeout(() => setClicking(true), 1800);
    const t2 = setTimeout(() => { setClicking(false); setPhase("panel"); }, 2050);
    const t3 = setTimeout(() => {
      const rect = btnRef.current?.getBoundingClientRect();
      if (rect) setCursorPos({ x: rect.left + rect.width * 0.5, y: rect.top + rect.height * 0.5 });
    }, 3000);
    const t4 = setTimeout(() => setClickingBtn(true), 3800);
    const t5 = setTimeout(() => { setClickingBtn(false); setPhase("creating"); }, 4000);
    const t6 = setTimeout(() => setPhase("created"), 5600);
    return () => { [t0,t1,t2,t3,t4,t5,t6].forEach(clearTimeout); };
  }, []);

  const isClicking = clicking || clickingBtn;
  const panelOpen = phase === "panel" || phase === "creating";

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Fixed cursor */}
      <AnimatePresence>
        {cursorVisible && (
          <motion.div
            style={{ position: "fixed", top: 0, left: 0, zIndex: 9999, pointerEvents: "none" }}
            initial={{ x: typeof window !== "undefined" ? window.innerWidth - 40 : 800, y: cursorPos.y }}
            animate={{ x: cursorPos.x, y: cursorPos.y, scale: isClicking ? 0.88 : 1 }}
            transition={{ type: "spring", stiffness: 150, damping: 22 }}
          >
            <CursorIcon clicking={isClicking} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dim overlay */}
      <AnimatePresence>
        {panelOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)", zIndex: 40, pointerEvents: "none" }} />
        )}
      </AnimatePresence>

      {/* Centered modal */}
      <AnimatePresence>
        {panelOpen && (
          <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", damping: 28, stiffness: 300 }}
            style={{ width: 520, maxHeight: "88vh", background: "#FFFFFF", borderRadius: 16, boxShadow: "0 24px 64px rgba(0,0,0,0.22)", overflowY: "auto", display: "flex", flexDirection: "column", pointerEvents: "auto" }}
          >
            {/* Photo */}
            <img src="/elevator-cab-townhouse.png" alt="" style={{ width: "100%", height: 220, objectFit: "cover", display: "block", flexShrink: 0, borderRadius: "16px 16px 0 0" }} />
            <p style={{ fontSize: 14, color: "#64748B", padding: "8px 24px 0", margin: 0 }}>Photo from inspection report</p>

            {/* Name + condition */}
            <div style={{ padding: "16px 24px 0" }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, color: "#2E1A47", lineHeight: 1.3, margin: 0 }}>
                Elevator cab - Townhouse
              </h2>
              <div style={{ marginTop: 8, display: "inline-flex", alignItems: "center", gap: 5, background: "#FEF3C7", border: "1px solid #FDE68A", borderRadius: 6, padding: "3px 10px" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#D97706" }}>● Fair</span>
              </div>
            </div>

            {/* Metadata grid */}
            <div style={{ padding: "16px 24px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px 20px" }}>
              {[
                { label: "Category",         value: "Services",                  red: false },
                { label: "Location",          value: "Townhouse Elevator Shaft",  red: false },
                { label: "Year Installed",    value: "1992",                      red: false },
                { label: "Replacement Year",  value: "2024",                      red: false },
                { label: "Remaining Life",    value: "End of life",               red: true  },
                { label: "Replacement Cost",  value: "$36,000",                   red: false },
              ].map(({ label, value, red }) => (
                <div key={label}>
                  <p style={{ fontSize: 13, color: "#64748B", fontWeight: 500, margin: 0, letterSpacing: "0.03em" }}>{label}</p>
                  <p style={{ fontSize: 17, color: red ? "#EF4444" : "#2E1A47", fontWeight: red ? 600 : 500, margin: "3px 0 0" }}>{value}</p>
                </div>
              ))}
            </div>

            {/* Condition notes */}
            <div style={{ padding: "16px 24px 0" }}>
              <p style={{ fontSize: 13, color: "#64748B", fontWeight: 500, margin: 0, letterSpacing: "0.03em" }}>Condition Notes</p>
              <p style={{ fontSize: 16, color: "#2E1A47", lineHeight: 1.55, margin: "6px 0 0" }}>
                Cab interior showing wear. Panels and flooring due for full replacement.
              </p>
            </div>

            {/* Action buttons */}
            <div style={{ padding: 24, marginTop: "auto", display: "flex", flexDirection: "column", gap: 10 }}>
              <button style={{ width: "100%", padding: "12px 0", background: "transparent", color: "#2E1A47", border: "1px solid #2E1A47", borderRadius: 8, fontSize: 17, fontWeight: 600, cursor: "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                <Pencil size={16} />
                Edit Component
              </button>
              <motion.button
                ref={btnRef}
                animate={{ background: phase === "creating" ? "#4D6BA9" : "#0A0A0A" }}
                transition={{ duration: 0.3 }}
                style={{ width: "100%", padding: "12px 0", color: "#FFFFFF", border: "none", borderRadius: 8, fontSize: 17, fontWeight: 600, cursor: "default", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
                {phase === "panel"    && "Add to Projects →"}
                {phase === "creating" && (<><span style={{ width: 14, height: 14, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />Creating project...</>)}
              </motion.button>
            </div>
          </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Inventory table */}
      <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden" }}>
        <div style={{ display: "flex", padding: "10px 18px", background: "#F8F9FC", borderBottom: "1px solid #E5E7EB", alignItems: "center", gap: 12 }}>
          <span style={{ flex: 1, fontSize: 13, color: "#94A3B8", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Component</span>
          <span style={{ width: 130, fontSize: 13, color: "#94A3B8", textTransform: "uppercase" as const, letterSpacing: "0.06em" }}>Remaining Life</span>
          <span style={{ width: 110, fontSize: 13, color: "#94A3B8", textTransform: "uppercase" as const, letterSpacing: "0.06em", textAlign: "right" as const }}>Est. Cost</span>
        </div>

        {/* Elevator Cab row */}
        <motion.div
          ref={rowRef}
          animate={clicking ? { backgroundColor: "#FFE0E0" } : { backgroundColor: "#FFF5F5" }}
          transition={{ duration: 0.12 }}
          style={{ display: "flex", alignItems: "center", padding: "12px 18px", borderBottom: "1px solid #F3F4F6", borderLeft: "3px solid #EF4444", cursor: "pointer", gap: 12 }}
        >
          <img src="/elevator-cab-townhouse.png" alt="" style={{ width: 46, height: 46, borderRadius: 7, objectFit: "cover", flexShrink: 0 }} />
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#2E1A47", margin: 0 }}>Elevator cab - Townhouse</p>
            <p style={{ fontSize: 13, color: "#94A3B8", margin: "2px 0 0" }}>Services · Townhouse Elevator Shaft</p>
          </div>
          <span style={{ width: 130, fontSize: 15, fontWeight: 700, color: "#EF4444" }}>End of life</span>
          <span style={{ width: 110, fontSize: 15, fontFamily: "monospace", color: "#2E1A47", textAlign: "right" }}>$36,000</span>
        </motion.div>

        {/* Dimmed placeholder rows */}
        {[1, 2, 3].map((i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", padding: "12px 18px", opacity: 0.14, borderBottom: i < 3 ? "1px solid #F3F4F6" : "none", gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: 7, background: "#E5E7EB", flexShrink: 0 }} />
            <div style={{ flex: 1, height: 12, background: "#E5E7EB", borderRadius: 3 }} />
            <div style={{ width: 130, height: 12, background: "#E5E7EB", borderRadius: 3 }} />
            <div style={{ width: 110, height: 12, background: "#E5E7EB", borderRadius: 3 }} />
          </div>
        ))}
      </div>

      {/* Project created confirmation */}
      <AnimatePresence>
        {phase === "created" && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div>
              <p style={{ fontSize: 18, fontWeight: 600, color: "#2E1A47", marginBottom: 2 }}>Elevator Cab Replacement</p>
              <p style={{ fontSize: 14, color: "#94A3B8" }}>Active · Q2 2026 · $36,000</p>
            </div>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#16A34A", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 6, padding: "4px 10px" }}>
              <Check size={12} style={{ display: "inline", marginRight: 4 }} />Active
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Step 6 — RFP
const RFPStep = () => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 400); return () => clearTimeout(t); }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} style={{ width: "100%" }}>
          <p style={{ fontSize: 13, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>RFP Generated</p>
          <div style={{ borderRadius: 12, overflow: "hidden", position: "relative" }}>
            <img src="/elevator-cab-townhouse.png" alt="" style={{ width: "100%", height: 180, objectFit: "cover", display: "block" }} />
            <div style={{ position: "absolute", inset: 0, background: "rgba(10,10,10,0.55)" }} />
            <div style={{ position: "absolute", inset: 0, padding: "20px 24px", display: "flex", flexDirection: "column", justifyContent: "flex-end" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "white", background: "#2E1A47", borderRadius: 4, padding: "2px 8px" }}>Live RFP</span>
                <p style={{ fontSize: 22, fontWeight: 700, color: "white" }}>Elevator Cab Replacement — Townhouse</p>
              </div>
              {[
                { label: "Budget",   value: "$36,000 – $44,000" },
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

// Step 7 — Marketplace bids
const BIDS = [
  { name: "Summit Elevator Works",    stars: 4.8, amount: "$38,000", recommended: true  },
  { name: "Elite Elevator Interiors", stars: 4.6, amount: "$41,000", recommended: false },
  { name: "BuildRight Elevator Co.",  stars: 4.9, amount: "$44,000", recommended: false },
];

const MarketplaceStep = () => {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const timers = [
      setTimeout(() => setVisible(1), 200),
      setTimeout(() => setVisible(2), 800),
      setTimeout(() => setVisible(3), 1400),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ fontSize: 13, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Contractor Bids</p>
      {BIDS.map((bid, i) => (
        <AnimatePresence key={bid.name}>
          {visible > i && (
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}
              style={{ background: "#FFFFFF", borderRadius: 10, border: bid.recommended ? "1.5px solid #0A0A0A" : "1px solid #E5E7EB", padding: "14px 18px", display: "flex", alignItems: "center", gap: 14, position: "relative" }}>
              {bid.recommended && (
                <span style={{ position: "absolute", top: -11, left: 14, background: "#0A0A0A", color: "white", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", borderRadius: 4, padding: "2px 8px" }}>
                  ⭐ Recommended
                </span>
              )}
              <p style={{ fontFamily: "monospace", fontSize: 20, fontWeight: 700, color: "#C0C0C0", width: 24, flexShrink: 0, textAlign: "center" }}>{i + 1}</p>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 18, fontWeight: 600, color: "#2E1A47", marginBottom: 2 }}>{bid.name}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  <Star size={14} style={{ color: "#F59E0B", fill: "#F59E0B" }} />
                  <span style={{ fontSize: 14, color: "#4B5563" }}>{bid.stars}</span>
                </div>
              </div>
              <p style={{ fontFamily: "monospace", fontSize: 22, fontWeight: 600, color: "#2E1A47" }}>{bid.amount}</p>
            </motion.div>
          )}
        </AnimatePresence>
      ))}
    </div>
  );
};

// Step 8 — Complete
const CompleteStep = () => (
  <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: 24 }}>
    <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.2 }}
      style={{ width: 72, height: 72, borderRadius: "50%", background: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Check size={36} color="white" strokeWidth={2.5} />
    </motion.div>
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.4 }}
      style={{ width: "100%", background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", padding: "20px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <p style={{ fontSize: 22, fontWeight: 700, color: "#2E1A47" }}>Elevator Cab Replacement</p>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#16A34A", background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 6, padding: "4px 10px" }}>Complete</span>
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

// Step 9 — Insurance
const InsuranceStep = () => {
  const [show, setShow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShow(true), 300); return () => clearTimeout(t); }, []);

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
      <p style={{ fontSize: 13, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>Insurance Update</p>
      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
            style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: "#F0FDF4", border: "1px solid #BBF7D0", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <Mail size={22} style={{ color: "#16A34A" }} />
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 19, fontWeight: 700, color: "#2E1A47", marginBottom: 4 }}>Notification Sent</p>
                <p style={{ fontSize: 17, color: "#64748B", marginBottom: 12 }}>Wawanesa Insurance · Asset update</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {["Elevator Cab replaced — June 2026", "Replacement cost: $38,000", "Warranty: 5 years"].map((line) => (
                    <div key={line} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#16A34A", flexShrink: 0 }} />
                      <span style={{ fontSize: 16, color: "#334155" }}>{line}</span>
                    </div>
                  ))}
                </div>
              </div>
              <span style={{ fontSize: 13, color: "#16A34A", fontWeight: 600, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 6, padding: "4px 10px", flexShrink: 0 }}>✓ Sent</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {show && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.35, delay: 0.6 }}
            style={{ background: "#F8F9FC", borderRadius: 10, border: "1px solid #E5E7EB", padding: "12px 18px", display: "flex", alignItems: "center", gap: 10 }}>
            <FileText size={16} style={{ color: "#64748B", flexShrink: 0 }} />
            <span style={{ fontSize: 16, color: "#64748B" }}>Building record updated · Inventory synced · Component life reset</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Steps ──────────────────────────────────────────────────── */

const STEPS: StepDef[] = [
  {
    label: "Upload",
    title: "Drop your building files — all of them.",
    visual: <DropZoneStep />,
    duration: 5500,
  },
  {
    label: "AI Analysis",
    title: "Three AI agents scan everything in parallel.",
    visual: <AgentsStep />,
    duration: 5500,
  },
  {
    label: "Inventory Built",
    title: "24 components catalogued automatically.",
    visual: <InventoryBuildStep />,
    duration: 4500,
  },
  {
    label: "Act on It",
    title: "Click any risk — fix it in seconds.",
    visual: <InventoryToProjectStep />,
    duration: 7500,
  },
  {
    label: "RFP",
    title: "The RFP writes itself.",
    visual: <RFPStep />,
    duration: 3500,
  },
  {
    label: "Bids",
    title: "Contractors compete. You pick the best fit.",
    visual: <MarketplaceStep />,
    duration: 4500,
  },
  {
    label: "Complete",
    title: "Project closed. Records updated automatically.",
    visual: <CompleteStep />,
    duration: 4000,
  },
  {
    label: "Insurance",
    title: "Insurance notified — without a single email.",
    visual: <InsuranceStep />,
    duration: 4500,
  },
];

/* ─── Page ───────────────────────────────────────────────────── */

const Set1 = () => {
  const navigate = useNavigate();
  return (
    <>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <StoryViewer setLabel="RECollab · Project Workflow" steps={STEPS} onFinish={() => navigate("/set2")} />
    </>
  );
};

export default Set1;
