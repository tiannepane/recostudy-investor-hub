import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Star, Mail, FileText, Image as ImageIcon, Eye, Video, ShieldCheck } from "lucide-react";
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

// Step 1 — Drop zone: files fly in one by one
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
  const [showPdf, setShowPdf]       = useState(false);
  const [showMp4, setShowMp4]       = useState(false);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhotoCount(1), 200),
      setTimeout(() => setPhotoCount(2), 500),
      setTimeout(() => setPhotoCount(3), 800),
      setTimeout(() => setPhotoCount(4), 1100),
      setTimeout(() => setPhotoCount(5), 1400),
      setTimeout(() => setPhotoCount(6), 1700),
      setTimeout(() => setShowPdf(true),  2200),
      setTimeout(() => setShowMp4(true),  2700),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const POSITIONS = [
    { top: 16, left: "calc(50% - 138px)" },
    { top: 16, left: "calc(50% - 46px)"  },
    { top: 16, left: "calc(50% + 46px)"  },
    { top: 100, left: "calc(50% - 138px)" },
    { top: 100, left: "calc(50% - 46px)"  },
    { top: 100, left: "calc(50% + 46px)"  },
  ];

  return (
    <div style={{ width: "100%" }}>
      <p style={{ fontSize: 13, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
        Upload
      </p>

      {/* Drop zone */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: 220,
          borderRadius: 12,
          border: "1.5px dashed #C0C0C0",
          background: "#FAFAFA",
          overflow: "hidden",
        }}
      >
        {/* Placeholder text — fades out once photos appear */}
        <AnimatePresence>
          {photoCount === 0 && (
            <motion.div
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                pointerEvents: "none",
              }}
            >
              <ImageIcon size={32} style={{ color: "#C0C0C0" }} />
              <p style={{ fontSize: 16, color: "#94A3B8" }}>Drop files here</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Photos */}
        {PHOTO_URLS.map((url, i) => {
          if (photoCount <= i) return null;
          const pos = POSITIONS[i];
          return (
            <motion.div
              key={url}
              initial={{ x: -600, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              style={{
                position: "absolute",
                top: pos.top,
                left: pos.left,
                width: 88,
                height: 76,
                borderRadius: 8,
                border: "2px solid white",
                boxShadow: "0 4px 12px rgba(0,0,0,0.12)",
                overflow: "hidden",
              }}
            >
              <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </motion.div>
          );
        })}

        {/* PDF stack */}
        <AnimatePresence>
          {showPdf && (
            <motion.div
              initial={{ x: -600, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              style={{ position: "absolute", bottom: 14, left: "calc(50% - 80px)" }}
            >
              <div style={{ position: "relative", width: 46, height: 58 }}>
                {[2, 1, 0].map((offset) => (
                  <div
                    key={offset}
                    style={{
                      position: "absolute",
                      top: offset * 3,
                      left: offset * 3,
                      width: 40,
                      height: 50,
                      borderRadius: 5,
                      background: "white",
                      border: "1px solid #E5E7EB",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.10)",
                      overflow: "hidden",
                    }}
                  >
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

        {/* MP4 icon */}
        <AnimatePresence>
          {showMp4 && (
            <motion.div
              initial={{ x: -600, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              style={{ position: "absolute", bottom: 14, left: "calc(50% + 20px)" }}
            >
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

      {/* File summary rows */}
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

// Step 2 — Agents analyzing with live progress bars
const AgentsStep = () => {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 40), 40);
    return () => clearInterval(id);
  }, []);

  const prog = (start: number, dur: number) =>
    elapsed < start ? 0 : Math.min((elapsed - start) / dur, 1);

  const visionProg = prog(200,  1800);
  const docProg    = prog(600,  1800);
  const videoProg  = prog(1000, 1800);
  const qaVisible  = elapsed >= 3200;

  const AGENTS = [
    {
      name: "Vision Agent", Icon: Eye, color: "#6366F1",
      progress: visionProg,
      obs: ["→ Scanning 6 inspection images...", "→ Elevator cab wear detected", "→ Spalling flagged on east elevation"],
    },
    {
      name: "Document Agent", Icon: FileText, color: "#0EA5E9",
      progress: docProg,
      obs: ["→ Parsing 4 documents...", "→ Reserve balance: $2,064,255", "→ 10 components near end of life"],
    },
    {
      name: "Video Agent", Icon: Video, color: "#8B5CF6",
      progress: videoProg,
      obs: ["→ Transcribing 4m 32s walkthrough...", "→ Rooftop membrane: last serviced 2019", "→ Parkade slab cracking confirmed"],
    },
  ];

  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 10 }}>
      <p style={{ fontSize: 13, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 4 }}>
        Analyzing
      </p>

      {AGENTS.map((a) => {
        const done = a.progress >= 1;
        return (
          <div
            key={a.name}
            style={{
              borderRadius: 10,
              border: `1px solid ${a.color}22`,
              borderLeft: `3px solid ${a.color}`,
              background: done ? "#FAFAFA" : "#FFFFFF",
              padding: "12px 16px",
            }}
          >
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
                  <motion.div
                    style={{ height: "100%", background: a.color, borderRadius: 1 }}
                    animate={{ width: `${a.progress * 100}%` }}
                    transition={{ duration: 0.1 }}
                  />
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
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              background: "#F0FDF4", border: "1px solid #BBF7D0",
              borderRadius: 10, padding: "12px 16px",
            }}
          >
            <ShieldCheck size={18} style={{ color: "#16A34A", flexShrink: 0 }} />
            <span style={{ fontSize: 16, fontWeight: 600, color: "#15803D" }}>
              QA Agent: all data validated — 24 components catalogued
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Step 3 — Inventory builds: skeleton → real rows, end-of-life highlighted
const INVENTORY_ROWS = [
  { name: "Elevator Cab — Townhouse",       rul: 0,  cost: "$36,000",  eol: true  },
  { name: "Garbage Compactor",              rul: 0,  cost: "$42,000",  eol: true  },
  { name: "Boiler",                         rul: 1,  cost: "$100,000", eol: false },
  { name: "Suspended Slab Waterproofing",   rul: 2,  cost: "$180,000", eol: false },
  { name: "Wall Finishes — Paint",          rul: 2,  cost: "$95,000",  eol: false },
  { name: "Elevator Machinery — Townhouse", rul: 4,  cost: "$85,000",  eol: false },
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
      <p style={{ fontSize: 13, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 12 }}>
        Inventory Generated
      </p>
      <div style={{ background: "#FFFFFF", borderRadius: 12, border: "1px solid #E5E7EB", overflow: "hidden" }}>
        {/* Header */}
        <div style={{ display: "flex", padding: "10px 18px", background: "#F8F9FC", borderBottom: "1px solid #E5E7EB" }}>
          <span style={{ flex: 1, fontSize: 13, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Component</span>
          <span style={{ width: 120, fontSize: 13, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em" }}>Remaining Life</span>
          <span style={{ width: 90, fontSize: 13, color: "#94A3B8", textTransform: "uppercase", letterSpacing: "0.06em", textAlign: "right" }}>Cost</span>
        </div>

        {!showReal ? (
          /* Skeleton */
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
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    padding: "11px 18px",
                    borderTop: i > 0 ? "1px solid #F3F4F6" : "none",
                    background: row.eol ? "#FFF5F5" : "white",
                    borderLeft: row.eol ? "3px solid #EF4444" : "3px solid transparent",
                  }}
                >
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

// Step 4 — Inventory: single component row highlighted
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
    label: "Upload",
    visual: <DropZoneStep />,
    caption: "Building photos, documents, and site walkthrough uploaded",
    duration: 5000,
  },
  {
    label: "Analyzing",
    visual: <AgentsStep />,
    caption: "3 AI agents extract and cross-reference all building data",
    duration: 5500,
  },
  {
    label: "Inventory",
    visual: <InventoryBuildStep />,
    caption: "24 components catalogued — 2 already past end of life",
    duration: 4500,
  },
  {
    label: "End of Life",
    visual: <InventoryStep />,
    caption: "Elevator cab flagged — overdue since 2024",
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
