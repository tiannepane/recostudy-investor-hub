import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

/* ── Layout ──────────────────────────────────────────────── */
const DW = 860, DH = 480;
const B        = { cx: 10,  cy: 220 };
const E        = { cx: 295, cy: 220 };
const PM       = { cx: 435, cy: 220, hw: 65, hh: 48 };
const PM_R     = PM.cx + PM.hw;
const BRANCH_X = 525;
const L_CX = 648, R_CX = 780, P_HW = 56;   // cards slightly larger

const PARTIES = [
  { cx: L_CX, cy: 70,  label: "Board",      emoji: "👥", method: "📠" },
  { cx: R_CX, cy: 152, label: "Investor",   emoji: "📈", method: "📧" },
  { cx: L_CX, cy: 232, label: "Contractor", emoji: "🔧", method: "☎️" },
  { cx: R_CX, cy: 312, label: "Lender",     emoji: "🏛️", method: "📟" },
  { cx: L_CX, cy: 392, label: "Insurer",    emoji: "🛡️", method: "📠" },
];

/* ── Scene beats ─────────────────────────────────────────── */
const BEATS = [
  { at: 0     },   // 0 — building
  { at: 2000  },   // 1 — PM
  { at: 5000  },   // 2 — engineer
  { at: 8000  },   // 3 — clock
  { at: 15000 },   // 4 — aging (report grays)
  { at: 22000 },   // 5 — parties fan out
];

const PARTY_LAG   = 1000;
const ALL_PARTIES = 20000 + (PARTIES.length - 1) * PARTY_LAG;

/* ── Age filter — shared by building AND pdf ─────────────── */
const AGE_FILTER = [
  "grayscale(0) brightness(1)",
  "grayscale(0) brightness(1)",
  "grayscale(0) brightness(1)",
  "grayscale(0) brightness(1)",
  "grayscale(0.65) brightness(0.88)",
  "grayscale(0.85) brightness(0.82)",
];

/* ── Helpers ─────────────────────────────────────────────── */
const lerp  = (a: number, b: number, t: number) => a + (b - a) * t;
const eio   = (t: number) => t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));


/* ── Component ───────────────────────────────────────────── */
const ProblemDenial = () => {
  const navigate = useNavigate();

  const [runId,         setRunId]         = useState(0);
  const [scene,         setScene]         = useState(-1);
const [pdfPhase,      setPdfPhase]      = useState<"hidden" | "flying" | "landed">("hidden");
  const [pdfProg,       setPdfProg]       = useState(0);
  const [partyCount,    setPartyCount]    = useState(0);
  const [clockIndex,    setClockIndex]    = useState(0);
  const rafRef = useRef<number | null>(null);

  /* Scene machine */
  useEffect(() => {
    const sceneTimers = BEATS.map(({ at }, i) =>
      setTimeout(() => setScene(i), at)
    );
    const pdfFly    = setTimeout(() => setPdfPhase("flying"),  10000);
    const pdfLand   = setTimeout(() => setPdfPhase("landed"),  12000);
    return () => {
      sceneTimers.forEach(clearTimeout);
      clearTimeout(pdfFly);
      clearTimeout(pdfLand);
    };
  }, [runId]);

  /* PDF flight rAF */
  useEffect(() => {
    if (pdfPhase !== "flying") return;
    const dur = 2800;   // slower — easier to follow
    let t0: number | null = null;
    const frame = (now: number) => {
      if (!t0) t0 = now;
      setPdfProg(clamp((now - t0) / dur));
      if (now - t0 < dur) rafRef.current = requestAnimationFrame(frame);
    };
    rafRef.current = requestAnimationFrame(frame);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [pdfPhase]);

  /* Party reveal one by one */
  useEffect(() => {
    if (scene < 5) return;
    const timers = PARTIES.map((_, i) =>
      setTimeout(() => setPartyCount(i + 1), i * PARTY_LAG)
    );
    return () => timers.forEach(clearTimeout);
  }, [scene]);


  /* Clock */
  useEffect(() => {
    if (scene < 3) return;
    const ms = scene >= 4 ? 300 : 650;
    const id = setInterval(() => setClockIndex(p => p + 1), ms);
    return () => clearInterval(id);
  }, [scene]);

  /* Keyboard skip */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") navigate("/set1");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate]);

  const replay = () => {
    setScene(-1);
setPdfPhase("hidden");
    setPdfProg(0);
    setPartyCount(0);
    setClockIndex(0);
    setRunId(r => r + 1);
  };

  const CLOCK_FACES = ["🕐","🕑","🕒","🕓","🕔","🕕","🕖","🕗","🕘","🕙","🕚","🕛"];
  const clockEmoji  = CLOCK_FACES[clockIndex % 12];
  const ageFilter   = AGE_FILTER[Math.min(Math.max(scene, 0), AGE_FILTER.length - 1)];
  const pdfX        = lerp(E.cx + 44, PM.cx + 22, eio(pdfProg));
  const pdfY        = lerp(E.cy - 14, PM.cy - 70, eio(pdfProg));

  return (
    <div style={{ position: "fixed", inset: 0, background: "#FFFFFF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "'Inter', sans-serif" }}>

      {/* ── Diagram ── */}
      <div style={{ position: "relative", width: DW, height: DH }}>

        {/* SVG connectors */}
        <svg width={DW} height={DH} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
          <defs>
            <marker id="pd-arr" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
              <polygon points="0 0, 7 2.5, 0 5" fill="#374151" />
            </marker>
          </defs>

          {scene >= 2 && (
            <motion.path
              d={`M ${E.cx + 42},${E.cy} L ${PM.cx - PM.hw},${PM.cy}`}
              stroke="#374151" strokeDasharray="6 4" fill="none" markerEnd="url(#pd-arr)"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1, strokeDashoffset: [0, -10] }}
              transition={{
                pathLength:       { duration: 0.5 },
                opacity:          { duration: 0.4 },
                strokeDashoffset: { repeat: Infinity, duration: 0.5, ease: "linear" },
              }}
            />
          )}

          {scene >= 5 && (
            <motion.path d={`M ${PM_R},${PM.cy} L ${BRANCH_X},${PM.cy}`}
              stroke="#94A3B8" strokeWidth={1.5} fill="none"
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.25 }} />
          )}

          {scene >= 5 && (
            <>
              <motion.path d={`M ${BRANCH_X},${PM.cy} L ${BRANCH_X},${PARTIES[0].cy}`}
                stroke="#94A3B8" strokeWidth={1.5} fill="none"
                initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.35 }} />
              <motion.path d={`M ${BRANCH_X},${PM.cy} L ${BRANCH_X},${PARTIES[4].cy}`}
                stroke="#94A3B8" strokeWidth={1.5} fill="none"
                initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.35 }} />
            </>
          )}

          {scene >= 5 && PARTIES.map((p, i) => {
            if (partyCount <= i) return null;
            return (
              <motion.path key={p.label}
                d={`M ${BRANCH_X},${p.cy} L ${p.cx - P_HW},${p.cy}`}
                stroke="#94A3B8" strokeWidth={1.5} fill="none" markerEnd="url(#pd-arr)"
                initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.28 }} />
            );
          })}
        </svg>

        {/* ── Building + clock ── */}
        {scene >= 0 && (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ position: "absolute", left: B.cx, top: B.cy - 160, width: 210, display: "flex", flexDirection: "column", alignItems: "center" }}
          >
            <motion.div
              animate={{ filter: ageFilter }}
              transition={{ duration: 6, ease: "easeInOut" }}
              style={{ fontSize: 180, lineHeight: 1 }}
            >
              🏢
            </motion.div>
            {scene >= 3 && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: scene >= 4 ? [1, 0.45, 1] : 1 }}
                transition={{ duration: scene >= 4 ? 0.5 : 0.4, repeat: scene >= 4 ? Infinity : 0 }}
                style={{ marginTop: 10, background: "#F1F5F9", border: "1px solid #E2E8F0", borderRadius: 14, padding: "4px 18px" }}
              >
                <span style={{ fontSize: 52, lineHeight: 1.2 }}>{clockEmoji}</span>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Property Manager ── */}
        {scene >= 1 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.88 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            style={{ position: "absolute", left: PM.cx - PM.hw, top: PM.cy - PM.hh - 16, width: PM.hw * 2, textAlign: "center" }}
          >
            <div style={{ border: "2px dashed #340075", borderRadius: 14, padding: "12px 14px", background: "white", boxShadow: "0 2px 16px rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize: 52 }}>👤</div>
              <p style={{ fontSize: 15, color: "#0F172A", fontWeight: 800, lineHeight: 1.4, margin: "4px 0 0" }}>Property<br/>Manager</p>
            </div>
          </motion.div>
        )}

        {/* ── Engineering Consultant ── */}
        {scene >= 2 && (
          <motion.div
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            style={{ position: "absolute", left: E.cx - 55, top: E.cy - 42, width: 110, textAlign: "center" }}
          >
            <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 10, padding: "8px 0 6px", boxShadow: "0 1px 4px rgba(0,0,0,0.06)" }}>
              <div style={{ fontSize: 32 }}>📋</div>
              <p style={{ fontSize: 14, color: "#1E293B", fontWeight: 700, margin: "4px 0 0", lineHeight: 1.3 }}>Engineering<br/>Consultant</p>
            </div>
          </motion.div>
        )}

        {/* ── PDF flying E → PM (slower) ── */}
        {pdfPhase === "flying" && (
          <div style={{ position: "absolute", left: pdfX, top: pdfY, fontSize: 40, zIndex: 10, pointerEvents: "none", lineHeight: 1, filter: "sepia(1) saturate(8) hue-rotate(-20deg)" }}>
            📄
          </div>
        )}

        {/* ── PDF landed — pops in orange, fades to gray only when scene 4 fires ── */}
        {pdfPhase === "landed" && (
          <motion.div
            initial={{ scale: 1.5, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              filter: scene >= 4
                ? "grayscale(0.78) brightness(0.84)"
                : "sepia(1) saturate(8) hue-rotate(-20deg)",
            }}
            transition={{
              scale:   { type: "spring", stiffness: 300, damping: 18 },
              opacity: { duration: 0.25 },
              filter:  { duration: scene >= 4 ? 6 : 0, ease: "easeInOut" },
            }}
            style={{ position: "absolute", left: PM.cx + 28, top: PM.cy - 84, fontSize: 36, zIndex: 10, lineHeight: 1 }}
          >
            📄
          </motion.div>
        )}

        {/* ── Party cards ── */}
        {scene >= 5 && PARTIES.map((p, i) => {
          if (partyCount <= i) return null;
          const midX = (BRANCH_X + p.cx - P_HW) / 2;
          return (
            <motion.div key={p.label}>
              {/* Card */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4 }}
                style={{ position: "absolute", left: p.cx - P_HW, top: p.cy - 38, width: P_HW * 2, textAlign: "center", zIndex: 2 }}
              >
                <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 10, padding: "8px 0 7px", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}>
                  <div style={{ fontSize: 30 }}>{p.emoji}</div>
                  <p style={{ fontSize: 14, color: "#1E293B", fontWeight: 700, margin: "3px 0 0" }}>{p.label}</p>
                </div>
              </motion.div>
              {/* Communication method — big, sepia-toned to feel old */}
              <motion.div
                initial={{ opacity: 0, scale: 0.2, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 320, damping: 14, delay: 0.5 }}
                style={{ position: "absolute", left: midX - 18, top: p.cy - 22, fontSize: 34, zIndex: 3, pointerEvents: "none", filter: "sepia(1) saturate(0.6) brightness(0.7)" }}
              >
                {p.method}
              </motion.div>
            </motion.div>
          );
        })}

      </div>

      {/* ── Replay ── */}
      <button
        onClick={replay}
        style={{ position: "fixed", top: 20, left: 24, background: "transparent", border: "1px solid #E2E8F0", color: "#94A3B8", borderRadius: 6, padding: "7px 16px", fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
      >
        ↺ Replay
      </button>

      {/* ── Skip ── */}
      <button
        onClick={() => navigate("/set1")}
        style={{ position: "fixed", bottom: 28, right: 36, background: "transparent", border: "1px solid #E2E8F0", color: "#94A3B8", borderRadius: 6, padding: "7px 18px", fontSize: 13, cursor: "pointer", fontFamily: "'Inter', sans-serif" }}
      >
        Skip →
      </button>
    </div>
  );
};

export default ProblemDenial;
