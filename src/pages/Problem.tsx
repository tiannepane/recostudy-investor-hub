import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

/* ── Layout ──────────────────────────────────── */
const DW = 860, DH = 460;
const B  = { cx: 68,  cy: 210 };
const E  = { cx: 224, cy: 210 };
const PM = { cx: 416, cy: 210, hw: 65, hh: 48 };
const PM_R     = PM.cx + PM.hw;   // 481
const BRANCH_X = 510;
const L_CX = 638, R_CX = 772, P_HW = 50;

const PARTIES = [
  { cx: L_CX, cy: 66,  label: "Board",      emoji: "👥", method: "📠" },
  { cx: R_CX, cy: 148, label: "Investor",   emoji: "💰", method: "📧" },
  { cx: L_CX, cy: 228, label: "Contractor", emoji: "🔧", method: "☎️" },
  { cx: R_CX, cy: 308, label: "Lender",     emoji: "🏛️", method: "📟" },
  { cx: L_CX, cy: 388, label: "Insurer",    emoji: "🛡️", method: "📠" },
];

/* ── Timing (ms) ─────────────────────────────── */
const CYCLE      = 13500;
const PDF_IN_END = 1800;   // colored PDF arrives at PM
const DIST_START = 5800;   // PM starts sending (4 s of aging before distribution)
const DIST_LAG   = 800;    // stagger between parties
const DIST_DUR   = 2600;   // travel time per PDF along full path
const GRAY_END   = 6500;   // building fully aged at 6.5 s

/* ── Building age stages ─────────────────────── */
const AGE_FILTERS = [
  "brightness(1) sepia(0) saturate(1)",
  "brightness(0.97) sepia(0.38) saturate(0.8)",
  "brightness(0.90) sepia(0.68) saturate(0.55) hue-rotate(5deg)",
  "brightness(0.80) sepia(0.88) saturate(0.38) hue-rotate(8deg)",
];

/* ── Helpers ─────────────────────────────────── */
const lerp  = (a: number, b: number, t: number) => a + (b - a) * t;
const eio   = (t: number) => t < 0.5 ? 2*t*t : -1 + (4 - 2*t)*t;
const clamp = (v: number, lo = 0, hi = 1) => Math.max(lo, Math.min(hi, v));

// PDF travels 3-segment path: PM_R → BRANCH_X (horiz) → party.cy (vert) → party left (horiz)
function pdfPos(progress: number, party: typeof PARTIES[0]) {
  const s1 = 0.18;  // end of horizontal stub PM → branch
  const s2 = 0.50;  // end of vertical segment on branch bar
  if (progress < s1) {
    const t = progress / s1;
    return { x: lerp(PM_R + 2, BRANCH_X - 10, eio(t)), y: PM.cy - 11 };
  } else if (progress < s2) {
    const t = (progress - s1) / (s2 - s1);
    return { x: BRANCH_X - 10, y: lerp(PM.cy - 11, party.cy - 11, eio(t)) };
  } else {
    const t = (progress - s2) / (1 - s2);
    return { x: lerp(BRANCH_X - 10, party.cx - P_HW - 14, eio(t)), y: party.cy - 11 };
  }
}

/* ── Page ────────────────────────────────────── */
const Problem = () => {
  const [phase,        setPhase]        = useState(0);
  const [elapsed,      setElapsed]      = useState(0);
  const [showControls, setShowControls] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 500),
      setTimeout(() => setPhase(2), 1500),
      setTimeout(() => setPhase(3), 2500),
      setTimeout(() => setPhase(4), 3500),
      setTimeout(() => setPhase(5), 4600),
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  useEffect(() => {
    if (phase < 5) return;
    const id = setInterval(() => setElapsed(p => p + 40), 40);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") navigate("/set1");
    };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, [navigate]);

  const restart = () => setElapsed(0);

  /* ── Loop state ── */
  const ct = elapsed % CYCLE;

  const ageNorm   = phase >= 5 ? clamp(ct / GRAY_END) : 0;
  const ageStage  = ageNorm < 0.28 ? 0 : ageNorm < 0.54 ? 1 : ageNorm < 0.78 ? 2 : 3;
  const pdfInProg  = clamp(ct / PDF_IN_END);
  const pdfInX     = lerp(E.cx + 44, PM.cx + 22, eio(pdfInProg));
  const pdfInY     = lerp(E.cy - 14, PM.cy - 70, eio(pdfInProg));
  const showPdfFly  = phase >= 5 && ct < PDF_IN_END;
  const showPdfPM   = phase >= 5 && ct >= PDF_IN_END;
  const arrowDotX   = lerp(E.cx + 42, PM.cx - PM.hw, eio(pdfInProg));
  const pmAgeNorm  = phase >= 5 ? clamp((ct - PDF_IN_END) / (DIST_START - PDF_IN_END)) : 0;

  const CLOCK_FACES = ["🕐","🕑","🕒","🕓","🕔","🕕","🕖","🕗","🕘","🕙","🕚","🕛"];
  const clockEmoji  = phase >= 5 ? CLOCK_FACES[Math.floor(elapsed / 400) % 12] : "🕐";

  return (
    <div style={{ position: "fixed", inset: 0, background: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center" }}>
      {phase >= 5 && (
        <button onClick={restart} style={{ position:"fixed", top:12, left:12, padding:"3px 9px", borderRadius:20, border:"1px solid #E2E8F0", background:"white", fontSize:11, fontWeight:600, color:"#64748B", cursor:"pointer", opacity:0.55, zIndex:100 }}>
          ↺
        </button>
      )}
      <div style={{ position: "relative", width: DW, height: DH }}>

        {/* ── SVG LINES ── */}
        <svg width={DW} height={DH} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
          <defs>
            <marker id="p-ag" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
              <polygon points="0 0, 7 2.5, 0 5" fill="#94A3B8" />
            </marker>
            <marker id="p-ai" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
              <polygon points="0 0, 7 2.5, 0 5" fill="#818CF8" />
            </marker>
            <marker id="p-dg" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
              <polygon points="0 0, 7 2.5, 0 5" fill="#374151" />
            </marker>
          </defs>


          {phase >= 3 && (
            <>
              {/* glow layer — pulses when PDF is in flight */}
              {showPdfFly && (
                <motion.path d={`M ${E.cx+42},${E.cy} L ${PM.cx-PM.hw},${PM.cy}`}
                  stroke="#374151" fill="none" strokeLinecap="round"
                  animate={{ strokeWidth: [4, 9, 4], opacity: [0.18, 0.06, 0.18] }}
                  transition={{ repeat: Infinity, duration: 0.9, ease: "easeInOut" }} />
              )}
              {/* base line — dashes always flow */}
              <motion.path d={`M ${E.cx+42},${E.cy} L ${PM.cx-PM.hw},${PM.cy}`}
                stroke="#374151" strokeDasharray="6 4" fill="none" markerEnd="url(#p-dg)"
                initial={{ pathLength:0, opacity:0 }}
                animate={{ pathLength:1, opacity:1, strokeWidth: showPdfFly ? 2.5 : 1.8, strokeDashoffset: [0, -10] }}
                transition={{
                  pathLength: { duration:0.5 },
                  opacity: { duration:0.5 },
                  strokeWidth: { duration:0.2 },
                  strokeDashoffset: { repeat: Infinity, duration: 0.5, ease: "linear" },
                }} />
              {/* traveling dot + halo */}
              {showPdfFly && (
                <>
                  <motion.circle cx={arrowDotX} cy={E.cy} r={7}
                    fill="none" stroke="#374151" strokeWidth={1.5}
                    animate={{ r: [5, 11], opacity: [0.6, 0] }}
                    transition={{ repeat: Infinity, duration: 0.55, ease: "easeOut" }} />
                  <circle cx={arrowDotX} cy={E.cy} r={4} fill="#374151" />
                </>
              )}
            </>
          )}

          {phase >= 5 && (
            <motion.path d={`M ${PM_R},${PM.cy} L ${BRANCH_X},${PM.cy}`}
              stroke="#94A3B8" strokeWidth={1.5} fill="none"
              initial={{ pathLength:0, opacity:0 }} animate={{ pathLength:1, opacity:1 }} transition={{ duration:0.2 }} />
          )}
          {phase >= 5 && (
            <>
              <motion.path d={`M ${BRANCH_X},${PM.cy} L ${BRANCH_X},${PARTIES[0].cy}`}
                stroke="#94A3B8" strokeWidth={1.5} fill="none"
                initial={{ pathLength:0, opacity:0 }} animate={{ pathLength:1, opacity:1 }} transition={{ duration:0.35 }} />
              <motion.path d={`M ${BRANCH_X},${PM.cy} L ${BRANCH_X},${PARTIES[4].cy}`}
                stroke="#94A3B8" strokeWidth={1.5} fill="none"
                initial={{ pathLength:0, opacity:0 }} animate={{ pathLength:1, opacity:1 }} transition={{ duration:0.35 }} />
            </>
          )}
          {phase >= 5 && PARTIES.map((p, i) => (
            <motion.path key={p.label}
              d={`M ${BRANCH_X},${p.cy} L ${p.cx-P_HW},${p.cy}`}
              stroke="#94A3B8" strokeWidth={1.5} fill="none" markerEnd="url(#p-ag)"
              initial={{ pathLength:0, opacity:0 }} animate={{ pathLength:1, opacity:1 }}
              transition={{ duration:0.25, delay:i*0.09 }} />
          ))}
        </svg>

        {/* ── BUILDING ── */}
        {phase >= 1 && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
            style={{ position:"absolute", left:-30, top:B.cy-100, width:140, display:"flex", flexDirection:"column", alignItems:"center" }}>
            <motion.div animate={{ filter: AGE_FILTERS[ageStage] }} transition={{ duration:0.9, ease:"easeInOut" }} style={{ fontSize:128 }}>🏢</motion.div>
            <div style={{ fontSize:30, margin:"6px 0 0", background:"#F1F5F9", borderRadius:20, padding:"3px 10px" }}>{clockEmoji}</div>
          </motion.div>
        )}

        {/* ── ENGINEER ── */}
        {phase >= 2 && (
          <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.5 }}
            style={{ position:"absolute", left:E.cx-55, top:E.cy-40, width:110, textAlign:"center" }}>
            <div style={{ background:"white", border:"1px solid #E5E7EB", borderRadius:10, padding:"7px 0 6px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
              <div style={{ fontSize:32 }}>📋</div>
              <p style={{ fontSize:16, color:"#1E293B", fontWeight:700, margin:"3px 0 0", fontFamily:"'Inter', sans-serif" }}>Engineering<br/>Consultant</p>
            </div>
          </motion.div>
        )}

        {/* ── PROPERTY MANAGER ── */}
        {phase >= 4 && (
          <motion.div initial={{ opacity:0, scale:0.88 }} animate={{ opacity:1, scale:1 }} transition={{ duration:0.45 }}
            style={{ position:"absolute", left:PM.cx-PM.hw, top:PM.cy-PM.hh-16, width:PM.hw*2, textAlign:"center" }}>
            <div style={{ border:"2px dashed #340075", borderRadius:14, padding:"12px 14px", background:"white", boxShadow:"0 2px 16px rgba(0,0,0,0.07)" }}>
              <div style={{ fontSize:52 }}>👤</div>
              <p style={{ fontSize:16, color:"#0F172A", fontWeight:800, lineHeight:1.4, margin:"4px 0 0", fontFamily:"'Inter', sans-serif" }}>Property<br/>Manager</p>
            </div>
          </motion.div>
        )}

        {/* ── PARTY CARDS ── */}
        {phase >= 5 && PARTIES.map((p, i) => (
          <motion.div key={p.label}
            initial={{ opacity:0, x:8 }} animate={{ opacity:1, x:0 }}
            transition={{ duration:0.35, delay:i*0.09 }}
            style={{ position:"absolute", left:p.cx-P_HW, top:p.cy-34, width:P_HW*2, textAlign:"center", zIndex:2 }}>
            <div style={{ background:"white", border:"1px solid #E5E7EB", borderRadius:10, padding:"7px 0 6px", boxShadow:"0 1px 4px rgba(0,0,0,0.05)" }}>
              {p.label === "Investor"
                ? <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:38 }}><img src="/investor .png" alt="Investor" style={{ width:34, height:34, objectFit:"contain", display:"block" }} /></div>
                : p.label === "Lender"
                ? <div style={{ display:"flex", justifyContent:"center", alignItems:"center", height:38 }}><img src="/bank.png" alt="Lender" style={{ width:34, height:34, objectFit:"contain", display:"block" }} /></div>
: <div style={{ fontSize:32, filter:
                    p.label === "Board"   ? "sepia(1) hue-rotate(145deg) saturate(6) brightness(0.52)" :
                    p.label === "Insurer" ? "sepia(1) hue-rotate(185deg) saturate(4) brightness(0.65)" :
                    "none" }}>{p.emoji}</div>
              }
              <p style={{ fontSize:16, color:"#1E293B", fontWeight:700, margin:"3px 0 0", fontFamily:"'Inter', sans-serif" }}>{p.label}</p>
            </div>
          </motion.div>
        ))}

        {/* ── METHOD EMOJIS ── */}
        {phase >= 5 && PARTIES.map((p, i) => {
          const midX = (BRANCH_X + p.cx - P_HW) / 2;
          return (
            <motion.div key={`method-${p.label}`}
              initial={{ opacity:0, scale:0.4 }} animate={{ opacity:1, scale:1 }}
              transition={{ delay: i * 0.18, duration:0.4 }}
              style={{ position:"absolute", left:midX-16, top:p.cy-18, fontSize:28, filter:"grayscale(1) saturate(0) brightness(0.55) opacity(0.9)", zIndex:3, pointerEvents:"none" }}>
              {p.method}
            </motion.div>
          );
        })}

        {/* ── RED PDF flying E → PM ── */}
        {showPdfFly && (
          <div style={{ position:"absolute", left:pdfInX, top:pdfInY, fontSize:42, zIndex:10, pointerEvents:"none", lineHeight:1, filter:"sepia(1) saturate(8) hue-rotate(-20deg)" }}>
            📄
          </div>
        )}

        {/* ── PDF settled on PM — ages red → gray before distribution ── */}
        {showPdfPM && (
          <div style={{ position:"absolute", left:PM.cx+26, top:PM.cy-82, fontSize:36, zIndex:10, lineHeight:1,
            filter: pmAgeNorm < 0.02
              ? `sepia(1) saturate(8) hue-rotate(-20deg)`
              : `grayscale(${pmAgeNorm * 0.82}) saturate(${Math.max(0, 1 - pmAgeNorm * 1.2)}) brightness(${1 - pmAgeNorm * 0.14})` }}>
            📄
          </div>
        )}

        {/* ── GRAY PDFs following the 3-segment path per party ── */}
        {phase >= 5 && PARTIES.map((p, i) => {
          const startAt  = DIST_START + i * DIST_LAG;
          const progress = clamp((ct - startAt) / DIST_DUR);
          if (progress <= 0) return null;
          const pos    = pdfPos(progress, p);
          const filter = `grayscale(0.82) brightness(0.86)`;
          return (
            <div key={`pdf-${i}`}
              style={{ position:"absolute", left:pos.x, top:pos.y, fontSize:36, zIndex:10, pointerEvents:"none", lineHeight:1, filter }}>
              📄
            </div>
          );
        })}


      </div>

      {/* ── Controls ── */}
      {phase >= 5 && (
        <div style={{ position:"fixed", bottom:20, right:20, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:6 }}>
          <AnimatePresence>
            {showControls && (
              <motion.div initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:6 }}
                transition={{ duration:0.2 }}
                style={{ display:"flex", gap:6 }}>
                <button onClick={restart}
                  style={{ padding:"5px 10px", borderRadius:6, border:"1px solid #E2E8F0", background:"white", fontSize:11, fontWeight:600, color:"#64748B", cursor:"pointer" }}>
                  ↺ Restart
                </button>
                <button onClick={() => navigate("/set1")}
                  style={{ padding:"5px 10px", borderRadius:6, border:"none", background:"#2E1A47", fontSize:11, fontWeight:600, color:"white", cursor:"pointer" }}>
                  Solution →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
          <button onClick={() => setShowControls(v => !v)}
            style={{ padding:"3px 8px", borderRadius:20, border:"1px solid #E2E8F0", background:"white", fontSize:10, color:"#94A3B8", cursor:"pointer", opacity:0.5 }}>
            {showControls ? "✕" : "⋯"}
          </button>
        </div>
      )}
    </div>
  );
};

export default Problem;
