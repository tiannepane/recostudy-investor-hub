import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

/* ── Layout constants ─────────────────────────────── */
const DW = 760, DH = 390;

const B  = { cx: 58,  cy: 195 };
const E  = { cx: 215, cy: 195 };
const PM = { cx: 400, cy: 195 };
const PX = 630;

const PARTIES = [
  { cy: 48,  label: "Board",      emoji: "👥", method: "📠" },
  { cy: 122, label: "Contractor", emoji: "🔧", method: "☎️" },
  { cy: 196, label: "Lender",     emoji: "🏛️", method: "📟" },
  { cy: 270, label: "Insurer",    emoji: "🛡️", method: "📠" },
  { cy: 344, label: "Investor",   emoji: "💼", method: "✉️" },
];

// Edge x positions
const B_R   = B.cx  + 36;   // 94
const E_L   = E.cx  - 36;   // 179
const E_R   = E.cx  + 36;   // 251
const PM_L  = PM.cx - 60;   // 340
const PM_R  = PM.cx + 60;   // 460
const P_L   = PX    - 36;   // 594

/* ── Component ────────────────────────────────────── */

const Problem = () => {
  const [phase, setPhase] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 400),   // building
      setTimeout(() => setPhase(2), 1000),  // engineer + B→E line
      setTimeout(() => setPhase(3), 1700),  // E→PM line + colored PDF travels
      setTimeout(() => setPhase(4), 2500),  // PM appears + PDF settled
      setTimeout(() => setPhase(5), 3200),  // party lines draw + parties appear
      setTimeout(() => setPhase(6), 4000),  // grayscale PDFs + method icons
      setTimeout(() => setPhase(7), 7200),  // caption + button
    ];
    return () => t.forEach(clearTimeout);
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#FAFAFA", display: "flex", flexDirection: "column", userSelect: "none" }}>

      {/* Top bar */}
      <div style={{ padding: "20px 36px" }}>
        <span style={{ fontSize: 13, color: "#94A3B8", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 500 }}>
          RECollab · The Problem
        </span>
      </div>
      <div style={{ height: 2, background: "#EF4444" }} />

      {/* Title */}
      <div style={{ padding: "22px 48px 0", maxWidth: 830, margin: "0 auto", width: "100%", boxSizing: "border-box" }}>
        <p style={{ fontSize: 11, color: "#94A3B8", letterSpacing: "0.13em", textTransform: "uppercase", fontWeight: 600, marginBottom: 7 }}>
          The As-Is
        </p>
        <h2 style={{ fontSize: 34, fontWeight: 800, color: "#1E293B", lineHeight: 1.2, letterSpacing: "-0.01em", margin: 0 }}>
          One PDF. Five manual handoffs. No system.
        </h2>
      </div>

      {/* Diagram */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "12px 20px 0" }}>
        <div style={{ position: "relative", width: DW, height: DH }}>

          {/* ── SVG lines ── */}
          <svg width={DW} height={DH} style={{ position: "absolute", inset: 0, overflow: "visible", pointerEvents: "none" }}>
            <defs>
              <marker id="arr-gray" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
                <polygon points="0 0, 7 2.5, 0 5" fill="#CBD5E1" />
              </marker>
              <marker id="arr-indigo" markerWidth="7" markerHeight="5" refX="7" refY="2.5" orient="auto">
                <polygon points="0 0, 7 2.5, 0 5" fill="#818CF8" />
              </marker>
            </defs>

            {/* B → E */}
            {phase >= 2 && (
              <motion.path
                d={`M ${B_R},${B.cy} L ${E_L},${E.cy}`}
                stroke="#CBD5E1" strokeWidth={1.5} fill="none" markerEnd="url(#arr-gray)"
                initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.35 }}
              />
            )}
            {phase >= 2 && (
              <motion.text x={(B_R + E_L) / 2} y={B.cy - 9}
                textAnchor="middle" fill="#94A3B8" fontSize={9} fontFamily="system-ui" fontWeight="600" letterSpacing="0.04em"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
                every 2 yrs
              </motion.text>
            )}

            {/* E → PM  (indigo dashed — live document) */}
            {phase >= 3 && (
              <motion.path
                d={`M ${E_R},${E.cy} L ${PM_L},${PM.cy}`}
                stroke="#818CF8" strokeWidth={2} strokeDasharray="6 4" fill="none" markerEnd="url(#arr-indigo)"
                initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.45 }}
              />
            )}
            {phase >= 3 && (
              <motion.text x={(E_R + PM_L) / 2} y={E.cy - 9}
                textAnchor="middle" fill="#818CF8" fontSize={9} fontFamily="system-ui" fontWeight="700"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>
                Reserve Study
              </motion.text>
            )}

            {/* PM → parties */}
            {phase >= 5 && PARTIES.map((p, i) => (
              <motion.path key={p.label}
                d={`M ${PM_R},${PM.cy} L ${P_L},${p.cy}`}
                stroke="#E2E8F0" strokeWidth={1.5} fill="none" markerEnd="url(#arr-gray)"
                initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
                transition={{ duration: 0.3, delay: i * 0.09 }}
              />
            ))}
          </svg>

          {/* ── Building ── */}
          <AnimatePresence>
            {phase >= 1 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                style={{ position: "absolute", left: B.cx - 36, top: B.cy - 52, width: 72, textAlign: "center" }}>
                <div style={{ fontSize: 38 }}>🏢</div>
                <p style={{ fontSize: 10, color: "#64748B", fontWeight: 600, lineHeight: 1.4, margin: "4px 0 0" }}>
                  Building<br/>ages
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Engineering Consultant ── */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
                style={{ position: "absolute", left: E.cx - 38, top: E.cy - 56, width: 76, textAlign: "center" }}>
                <div style={{ fontSize: 34 }}>📋</div>
                <p style={{ fontSize: 10, color: "#64748B", fontWeight: 600, lineHeight: 1.4, margin: "4px 0 0" }}>
                  Engineering<br/>Consultant
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Property Manager (dashed box — bottleneck) ── */}
          <AnimatePresence>
            {phase >= 4 && (
              <motion.div initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4 }}
                style={{ position: "absolute", left: PM.cx - 60, top: PM.cy - 52, width: 120, textAlign: "center" }}>
                <div style={{
                  border: "2px dashed #94A3B8", borderRadius: 12, padding: "10px 12px",
                  background: "white", boxShadow: "0 2px 12px rgba(0,0,0,0.07)"
                }}>
                  <div style={{ fontSize: 30 }}>👤</div>
                  <p style={{ fontSize: 10.5, color: "#1E293B", fontWeight: 700, lineHeight: 1.4, margin: "4px 0 0" }}>
                    Property<br/>Manager
                  </p>
                  <p style={{ fontSize: 9, color: "#94A3B8", margin: "3px 0 0", fontWeight: 500 }}>coordinates all</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Party cards ── */}
          {phase >= 5 && PARTIES.map((p, i) => (
            <motion.div key={p.label}
              initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, delay: i * 0.09 }}
              style={{ position: "absolute", left: PX - 36, top: p.cy - 34, width: 72, textAlign: "center" }}>
              <div style={{ background: "white", border: "1px solid #E5E7EB", borderRadius: 8, padding: "6px 0 5px" }}>
                <div style={{ fontSize: 22 }}>{p.emoji}</div>
                <p style={{ fontSize: 9.5, color: "#475569", fontWeight: 600, margin: "3px 0 0" }}>{p.label}</p>
              </div>
            </motion.div>
          ))}

          {/* ── Colored PDF travels Engineer → PM ── */}
          {phase >= 3 && (
            <motion.div
              style={{ position: "absolute", left: E_R + 4, top: E.cy - 11, fontSize: 18, zIndex: 20, lineHeight: 1 }}
              initial={{ x: 0 }}
              animate={{ x: PM_L - E_R - 18 }}
              transition={{ duration: 0.7, ease: "easeInOut" }}
            >
              📄
            </motion.div>
          )}

          {/* ── Colored PDF settled on PM corner ── */}
          {phase >= 4 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.4 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3 }}
              style={{ position: "absolute", left: PM.cx + 20, top: PM.cy - 56, fontSize: 15, zIndex: 20 }}
            >
              📄
            </motion.div>
          )}

          {/* ── Grayscale PDFs travel PM → each party ── */}
          {phase >= 6 && PARTIES.map((p, i) => (
            <motion.div key={`pdf-${p.label}`}
              style={{ position: "absolute", left: PM_R + 4, top: PM.cy - 10, fontSize: 14, filter: "grayscale(1) opacity(0.55)", zIndex: 20, lineHeight: 1 }}
              initial={{ x: 0, y: 0 }}
              animate={{ x: P_L - PM_R - 10, y: p.cy - PM.cy }}
              transition={{ duration: 0.65, delay: i * 0.44, ease: "easeInOut" }}
            >
              📄
            </motion.div>
          ))}

          {/* ── Retro method icons on line midpoints ── */}
          {phase >= 6 && PARTIES.map((p, i) => {
            const midX = (PM_R + P_L) / 2;
            const midY = (PM.cy + p.cy) / 2;
            return (
              <motion.div key={`method-${p.label}`}
                initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.44 + 0.5, duration: 0.3 }}
                style={{ position: "absolute", left: midX - 10, top: midY - 12, fontSize: 14, filter: "grayscale(1)", zIndex: 10 }}
              >
                {p.method}
              </motion.div>
            );
          })}

        </div>
      </div>

      {/* Caption + button */}
      <div style={{ padding: "14px 48px 26px", maxWidth: 830, margin: "0 auto", width: "100%", boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <AnimatePresence>
          {phase >= 7 && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
              style={{ fontSize: 15, color: "#64748B", fontWeight: 500, margin: 0 }}>
              Every handoff is a phone call, a fax, and a prayer.
            </motion.p>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {phase >= 7 && (
            <motion.button
              initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4, delay: 0.15 }}
              onClick={() => navigate("/set1")}
              style={{ marginLeft: "auto", padding: "11px 24px", borderRadius: 8, border: "none", background: "#2E1A47", fontSize: 15, fontWeight: 600, color: "white", cursor: "pointer", flexShrink: 0 }}
            >
              See the Solution →
            </motion.button>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default Problem;
