import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Timing constants (ms) ───────────────────────────────── */
// Scene durations scaled to word count / visual complexity

const S1_IN   = 400;
const S1_OUT  = 6400;   // ~10 words + animated counter + timeline

const S2_IN   = 6800;
const S2_OUT  = 11300;  // ~10 words

const S3_IN   = 11700;
const S3_OUT  = 17200;  // ~12 words + emoji stagger

// Problems — one at a time, duration scaled by word count (2 words → 1600ms, 3 words → 2000ms)
const PROBLEMS = [
  "Deferred Maintenance",        // 2 words
  "Surprise Levies",             // 2 words
  "Board Friction",              // 2 words
  "Missed Mortgages",            // 2 words
  "Property Value Loss",         // 3 words
  "Increased Insurance Premiums",// 3 words
  "Stalled Sales",               // 2 words
] as const;

const PROB_DURATIONS = [1600, 1600, 1600, 1600, 2000, 2000, 1600];
const PROB_OFFSETS: number[] = [];
let _cum = 0;
for (const d of PROB_DURATIONS) { PROB_OFFSETS.push(_cum); _cum += d; }
const PROB_TOTAL = _cum; // 12000ms

const PROB_COLORS = ["#EF4444", "#F97316", "#FB923C", "#FB923C", "#94A3B8", "#64748B", "#475569"];

const PROB_START = 17600;

const S5_IN  = PROB_START + PROB_TOTAL + 400;
const S5_OUT = S5_IN + 3200;  // "Until now." — 2 words, punchy

const LOGO_IN    = S5_OUT + 500;
const TAGLINE_IN = LOGO_IN + 1200;
const NAV_AT     = TAGLINE_IN + 7000; // ~20-word tagline

/* ─── Animated counter ────────────────────────────────────── */

function useCountTo(target: number, start: boolean, duration = 1800) {
  const [val, setVal] = useState(0);
  const raf = useRef<number | null>(null);
  const t0  = useRef<number | null>(null);

  useEffect(() => {
    if (!start) return;
    const tick = (now: number) => {
      if (!t0.current) t0.current = now;
      const p = Math.min((now - t0.current) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(eased * target));
      if (p < 1) raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [start, target, duration]);

  return val;
}

/* ─── Floating particle field ─────────────────────────────── */

const PARTICLES = Array.from({ length: 22 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: 1.5 + Math.random() * 2.5,
  dur: 8 + Math.random() * 14,
  delay: Math.random() * 6,
  opacity: 0.06 + Math.random() * 0.12,
}));

const ParticleField = () => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none" }}>
    {PARTICLES.map((p) => (
      <motion.div
        key={p.id}
        style={{
          position: "absolute",
          left: `${p.x}%`,
          top: `${p.y}%`,
          width: p.size,
          height: p.size,
          borderRadius: "50%",
          background: "#4D6BA9",
          opacity: p.opacity,
        }}
        animate={{ y: [0, -28, 0], opacity: [p.opacity, p.opacity * 2.5, p.opacity] }}
        transition={{ duration: p.dur, delay: p.delay, repeat: Infinity, ease: "easeInOut" }}
      />
    ))}
  </div>
);

/* ─── Horizontal scan line ────────────────────────────────── */

const ScanLine = ({ visible }: { visible: boolean }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ scaleX: 0, opacity: 0.6 }}
        animate={{ scaleX: 1, opacity: 0 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        style={{
          position: "absolute",
          left: 0, right: 0,
          top: "50%",
          height: 1,
          background: "linear-gradient(90deg, transparent, #4D6BA9, transparent)",
          transformOrigin: "left center",
          pointerEvents: "none",
        }}
      />
    )}
  </AnimatePresence>
);

/* ─── Scene wrapper ───────────────────────────────────────── */

const Scene = ({ visible, children }: { visible: boolean; children: React.ReactNode }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -12 }}
        transition={{ duration: 0.75, ease: "easeOut" }}
        style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          padding: "0 10vw", textAlign: "center",
        }}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─── Page ────────────────────────────────────────────────── */

const Intro = () => {
  const navigate = useNavigate();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (elapsed >= NAV_AT) navigate("/onboarding");
  }, [elapsed, navigate]);

  const s1 = elapsed >= S1_IN && elapsed < S1_OUT;
  const s2 = elapsed >= S2_IN && elapsed < S2_OUT;
  const s3 = elapsed >= S3_IN && elapsed < S3_OUT;
  const showProblems = elapsed >= PROB_START && elapsed < S5_IN;
  const s5 = elapsed >= S5_IN && elapsed < S5_OUT;
  const showLogo    = elapsed >= LOGO_IN;
  const showTagline = elapsed >= TAGLINE_IN;

  // Animated counter for 75%
  const pct = useCountTo(75, s1, 1600);

  // Current problem index (one at a time)
  const probOffset = elapsed - PROB_START;
  const probIndex = probOffset >= 0
    ? PROB_OFFSETS.reduce((found, offset, i) => (probOffset >= offset ? i : found), -1)
    : -1;

  // Scan line fires on each scene transition
  const scanVisible = [S2_IN, S3_IN, PROB_START, S5_IN, LOGO_IN].some(
    (t) => elapsed >= t && elapsed < t + 600
  );

  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "#07090F",
        overflow: "hidden",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Grid texture */}
      <div
        style={{
          position: "absolute", inset: 0,
          backgroundImage:
            "linear-gradient(rgba(77,107,169,0.04) 1px, transparent 1px)," +
            "linear-gradient(90deg, rgba(77,107,169,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          pointerEvents: "none",
        }}
      />

      {/* Ambient glow — shifts colour per scene */}
      <motion.div
        animate={{
          background: s5 || showLogo
            ? "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(77,107,169,0.13) 0%, transparent 70%)"
            : showProblems
            ? "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(239,68,68,0.07) 0%, transparent 70%)"
            : "radial-gradient(ellipse 60% 50% at 50% 50%, rgba(77,107,169,0.06) 0%, transparent 70%)",
        }}
        transition={{ duration: 1.2 }}
        style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
      />

      <ParticleField />
      <ScanLine visible={scanVisible} />

      {/* ── Scene 1: 75% stat with animated counter ── */}
      <Scene visible={s1}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 8, marginBottom: 16, justifyContent: "center" }}>
          <motion.span
            style={{
              fontSize: "clamp(72px, 12vw, 160px)",
              fontWeight: 800,
              color: "#FFFFFF",
              lineHeight: 1,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {pct}
          </motion.span>
          <span style={{ fontSize: "clamp(40px, 6vw, 80px)", fontWeight: 700, color: "#4D6BA9", lineHeight: 1, paddingBottom: "0.1em" }}>
            %
          </span>
        </div>

        <h2 style={{ fontSize: "clamp(20px, 3vw, 38px)", fontWeight: 500, color: "#94A3B8", maxWidth: 700, lineHeight: 1.4, marginBottom: 36 }}>
          of US buildings were built before 2000 or earlier
        </h2>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.4, duration: 0.6 }}
          style={{ display: "flex", alignItems: "center", gap: 16 }}
        >
          <span style={{ fontSize: "clamp(24px, 3.5vw, 44px)" }}>🏚️</span>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {["1940", "1960", "1980", "2000", "2010", "2020", "2026"].map((yr, i, arr) => (
              <motion.div
                key={yr}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.6 + i * 0.12 }}
                style={{ display: "flex", alignItems: "center", gap: 10 }}
              >
                <span style={{ fontSize: "clamp(16px, 2.2vw, 26px)", color: i === arr.length - 1 ? "#FFFFFF" : "#94A3B8", fontWeight: i === arr.length - 1 ? 700 : 400 }}>
                  {yr}
                </span>
                {i < arr.length - 1 && <span style={{ color: "#475569", fontSize: "clamp(12px, 1.4vw, 18px)" }}>──</span>}
              </motion.div>
            ))}
          </div>
          <span style={{ fontSize: "clamp(24px, 3.5vw, 44px)" }}>🏙️</span>
        </motion.div>
      </Scene>

      {/* ── Scene 2: So is their model ── */}
      <Scene visible={s2}>
        <h1 style={{ fontSize: "clamp(28px, 4.5vw, 60px)", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.2, maxWidth: 860 }}>
          So is their operating, compliance{" "}
          <span style={{ color: "#4D6BA9" }}>and capital planning model.</span>
        </h1>
      </Scene>

      {/* ── Scene 3: Manually ── */}
      <Scene visible={s3}>
        <h1 style={{ fontSize: "clamp(26px, 4vw, 54px)", fontWeight: 700, color: "#FFFFFF", lineHeight: 1.25, marginBottom: 36, maxWidth: 860 }}>
          Today, property managers are forced to handle repair planning{" "}
          <span style={{ color: "#F97316" }}>manually.</span>
        </h1>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
          style={{ display: "flex", gap: 20, fontSize: "clamp(28px, 4vw, 52px)" }}
        >
          {["🗂️", "📋", "🗃️", "📠", "🗄️"].map((emoji, i) => (
            <motion.span
              key={emoji}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.0 + i * 0.12, duration: 0.4 }}
            >
              {emoji}
            </motion.span>
          ))}
        </motion.div>
      </Scene>

      {/* ── Problems — one at a time ── */}
      <Scene visible={showProblems}>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            fontSize: "clamp(14px, 1.8vw, 20px)",
            color: "#475569",
            letterSpacing: "0.06em",
            marginBottom: 28,
            fontWeight: 500,
          }}
        >
          This leads to…
        </motion.p>
        <AnimatePresence mode="wait">
          {probIndex >= 0 && probIndex < PROBLEMS.length && (
            <motion.div
              key={probIndex}
              initial={{ opacity: 0, y: 28, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(4px)" }}
              transition={{ duration: 0.42, ease: "easeOut" }}
              style={{ display: "flex", alignItems: "center" }}
            >
              <p style={{
                fontSize: "clamp(30px, 5.5vw, 68px)",
                fontWeight: 700,
                color: PROB_COLORS[probIndex],
                margin: 0,
                lineHeight: 1.15,
              }}>
                {PROBLEMS[probIndex]}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </Scene>

      {/* ── Until now ── */}
      <Scene visible={s5}>
        <motion.h1
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          style={{
            fontSize: "clamp(52px, 10vw, 120px)",
            fontWeight: 800,
            color: "#FFFFFF",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          Until now.
        </motion.h1>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: "min(200px, 30vw)" }}
          transition={{ delay: 0.5, duration: 0.8, ease: "easeOut" }}
          style={{ height: 3, background: "#4D6BA9", borderRadius: 2, marginTop: 24 }}
        />
      </Scene>

      {/* ── Logo + tagline ── */}
      <Scene visible={showLogo && !s5}>
        <motion.div
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 20 }}
        >
          {/* Logo glow ring */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 0.4, 0.15] }}
            transition={{ duration: 2, times: [0, 0.4, 1] }}
            style={{
              position: "absolute",
              width: "clamp(300px, 40vw, 520px)",
              height: "clamp(100px, 14vw, 180px)",
              borderRadius: "50%",
              background: "radial-gradient(ellipse, rgba(77,107,169,0.35) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Logo text */}
          <div style={{ display: "flex", alignItems: "baseline", position: "relative" }}>
            {"RECO".split("").map((ch, i) => (
              <motion.span
                key={`r${i}`}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.07, duration: 0.5, ease: "easeOut" }}
                style={{ fontSize: "clamp(48px, 8vw, 100px)", fontWeight: 800, color: "#FFFFFF", letterSpacing: "-0.02em", lineHeight: 1 }}
              >
                {ch}
              </motion.span>
            ))}
            {"study".split("").map((ch, i) => (
              <motion.span
                key={`s${i}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.28 + i * 0.07, duration: 0.5, ease: "easeOut" }}
                style={{ fontSize: "clamp(48px, 8vw, 100px)", fontWeight: 800, color: "#4D6BA9", letterSpacing: "-0.02em", lineHeight: 1 }}
              >
                {ch}
              </motion.span>
            ))}
            <motion.sup
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
              style={{ fontSize: "clamp(14px, 2vw, 22px)", color: "#4D6BA9", marginLeft: 4 }}
            >
              ™
            </motion.sup>
          </div>

          {/* Animated underline */}
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: "clamp(80px, 12vw, 140px)" }}
            transition={{ delay: 0.8, duration: 0.7, ease: "easeOut" }}
            style={{ height: 2, background: "#4D6BA9", borderRadius: 1 }}
          />

          {/* Tagline */}
          <AnimatePresence>
            {showTagline && (
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                style={{
                  fontSize: "clamp(16px, 2.2vw, 28px)",
                  fontWeight: 400,
                  color: "#94A3B8",
                  textAlign: "center",
                  maxWidth: 700,
                  lineHeight: 1.5,
                }}
              >
                We automate reserve fund studies — and connect buildings with the{" "}
                <span style={{ color: "#FFFFFF", fontWeight: 500 }}>markets that fund, insure, and retrofit them.</span>
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </Scene>

      {/* ── Skip button ── */}
      <button
        onClick={() => navigate("/onboarding")}
        style={{
          position: "absolute", bottom: 32, right: 40,
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.35)",
          borderRadius: 6, padding: "8px 20px",
          fontSize: 14, cursor: "pointer",
          letterSpacing: "0.06em",
          transition: "all 0.2s",
          fontFamily: "'DM Sans', sans-serif",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
          e.currentTarget.style.color = "rgba(255,255,255,0.7)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)";
          e.currentTarget.style.color = "rgba(255,255,255,0.35)";
        }}
      >
        Skip →
      </button>
    </div>
  );
};

export default Intro;
