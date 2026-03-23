import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, FileText, Mic, Check, Eye, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

/* ─── Constants ──────────────────────────────────────────── */

const UPLOAD_START = 1500; // absolute ms when upload scene begins

// All times below are RELATIVE to upload start (ms)
const PHOTO_SLIDE_STARTS = [1000, 1600, 2200, 2800];
const PHOTO_URLS = [
  "https://images.unsplash.com/photo-1486718448742-163732cd1544?w=220&h=164&fit=crop",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=220&h=164&fit=crop",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=220&h=164&fit=crop",
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=220&h=164&fit=crop",
];

// 2x2 grid positions inside drop zone (110x82 photos, 8px gap, centered)
// Grid: 228px wide x 172px tall, centered in 180px-high drop zone
const PHOTO_POSITIONS = [
  { top: 4, left: "calc(50% - 114px)" },
  { top: 4, left: "calc(50% + 4px)" },
  { top: 94, left: "calc(50% - 114px)" },
  { top: 94, left: "calc(50% + 4px)" },
];

// File item timings (relative to upload start, ms)
const FILE_TIMES = {
  photos: { appear: 3400, done: 4000 },
  pdf:    { appear: 5500, done: 6100 },
  voice:  { appear: 7500, done: 8100 },
};

// Agent timings (relative to upload start, ms)
const AGENTS = {
  vision:   { start: 1000, duration: 3500 },
  document: { start: 5500, duration: 2500 },
  audio:    { start: 7500, duration: 2500 },
};

const COMPLETION_REL = 10500;
const FADE_DELAY = 6500;
const AUTO_INTEGRATE_DELAY = 3000;

const VISION_OBS = [
  "\u2192 Detected: exterior facade, balcony structures",
  "\u2192 Identified: HVAC unit, elevator shaft, parking level",
  "\u2192 Flagged: visible concrete spalling on east elevation",
];
const DOC_OBS = [
  "\u2192 Extracted: reserve fund balance $567,420",
  "\u2192 Identified: 8 components approaching end of life",
  "\u2192 Parsed: engineer PNA study, 2022 baseline",
];
const AUDIO_OBS = [
  "\u2192 Transcribed: 4m 32s site walkthrough audio",
  "\u2192 Extracted: rooftop HVAC showing wear, last serviced 2019",
  "\u2192 Noted: parking structure visible cracking, elevator flagged",
];

/* ─── Agent Processing Card (right column) ──────────────── */

const AgentProcessingCard = ({
  name,
  iconBg,
  iconColor,
  borderColor,
  fillColor,
  IconComp,
  progress,
  active,
  complete,
  observations,
}: {
  name: string;
  iconBg: string;
  iconColor: string;
  borderColor: string;
  fillColor: string;
  IconComp: React.ElementType;
  progress: number;
  active: boolean;
  complete: boolean;
  observations: string[];
}) => {
  const isActive = active || complete;
  const cardBg = complete ? "#F0FDF4" : active ? "#F4F5F8" : "#F7F8FA";
  return (
    <div
      style={{
        background: cardBg,
        borderRadius: 12,
        border: `1px solid ${isActive ? borderColor : "#E8EBF0"}`,
        padding: 16,
        opacity: isActive ? 1 : 0.4,
        boxShadow: isActive ? "0 4px 20px rgba(0,0,0,0.08)" : "none",
        transition: "opacity 0.3s, box-shadow 0.3s, border-color 0.3s, background 0.4s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: iconBg,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <IconComp size={14} style={{ color: iconColor }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#0F1729", flex: 1 }}>
          {name}
        </span>
        {isActive && (
          complete ? (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.08, 1.0], opacity: 1 }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: "2px 8px",
                borderRadius: 4,
                background: "#ECFDF5",
                color: "#10B981",
                whiteSpace: "nowrap",
                position: "relative",
              }}
            >
              Complete &#10003;
              {/* Ripple ring */}
              <motion.span
                initial={{ boxShadow: "0 0 0 0px rgba(16,185,129,0.5)" }}
                animate={{ boxShadow: "0 0 0 10px rgba(16,185,129,0)" }}
                transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
                style={{
                  position: "absolute",
                  inset: 0,
                  borderRadius: 4,
                  pointerEvents: "none",
                }}
              />
            </motion.span>
          ) : (
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: "2px 8px",
                borderRadius: 4,
                background: iconBg,
                color: iconColor,
                whiteSpace: "nowrap",
              }}
            >
              Processing...
            </span>
          )
        )}
      </div>

      <div
        style={{
          marginTop: 10,
          width: "100%",
          height: 6,
          background: "#F1F3F6",
          borderRadius: 3,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(progress * 100, 100)}%`,
            background: fillColor,
            borderRadius: 3,
            transition: complete ? "width 0.1s linear, box-shadow 0.3s ease" : "width 0.1s linear",
            boxShadow: complete ? `0 0 8px 1px ${fillColor}59` : "none",
          }}
        />
      </div>

      <div
        style={{
          marginTop: 10,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          color: "#5A6178",
          lineHeight: 1.6,
          minHeight: 58,
        }}
      >
        {observations.map((obs, i) => {
          const threshold = [0.33, 0.66, 0.95][i];
          return (
            <div
              key={i}
              style={{
                opacity: progress >= threshold ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
            >
              {obs}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── File Slide Row (left column) ──────────────────────── */

const FileSlideRow = ({
  visible,
  done,
  name,
  detail,
  iconBg,
  iconColor,
  IconComp,
}: {
  visible: boolean;
  done: boolean;
  name: string;
  detail: string;
  iconBg: string;
  iconColor: string;
  IconComp: React.ElementType;
}) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          background: "white",
          borderRadius: 10,
          border: "1px solid #E8EBF0",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: iconBg,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconComp size={18} style={{ color: iconColor }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#0F1729", marginBottom: 2 }}>
            {name}
          </p>
          <p style={{ fontSize: 11, color: "#9CA3B8" }}>{detail}</p>
        </div>
        {!done ? (
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              border: "2px solid #E8EBF0",
              borderTopColor: "#4F6BFF",
              flexShrink: 0,
              animation: "spin 0.8s linear infinite",
            }}
          />
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#10B981",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check size={10} color="white" />
          </motion.div>
        )}
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─── Integration card ───────────────────────────────────── */

type ConnectState = "idle" | "connecting" | "connected";

const IntegrationCard = ({
  name,
  logoSrc,
  connectState,
}: {
  name: string;
  logoSrc: string;
  connectState: ConnectState;
}) => {
  const btnStyle: React.CSSProperties =
    connectState === "connected"
      ? {
          height: 30,
          padding: "0 14px",
          background: "#ECFDF5",
          border: "1px solid #A7F3D0",
          color: "#10B981",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          cursor: "default",
          transition: "all 0.3s ease",
        }
      : connectState === "connecting"
      ? {
          height: 30,
          padding: "0 14px",
          background: "#4F6BFF",
          border: "1px solid #4F6BFF",
          color: "white",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          cursor: "default",
          transition: "all 0.3s ease",
        }
      : {
          height: 30,
          padding: "0 14px",
          background: "transparent",
          border: "1px solid #E8EBF0",
          color: "#5A6178",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          cursor: "default",
          transition: "all 0.3s ease",
        };

  return (
    <motion.div
      animate={{ scale: connectState === "connected" ? [1, 1.015, 1] : 1 }}
      transition={{ duration: 0.3 }}
      style={{
        flex: 1,
        height: 140,
        borderRadius: 12,
        border: "1px solid hsl(var(--border))",
        background: "hsl(var(--card))",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      }}
    >
      <img
        src={logoSrc}
        alt={name}
        style={{ width: 40, height: 40, borderRadius: 8, objectFit: "contain" }}
      />
      <p style={{ fontSize: 15, fontWeight: 500, color: "#0F1729" }}>{name}</p>
      <button style={btnStyle}>
        {connectState === "idle"
          ? "Connect"
          : connectState === "connecting"
          ? "Connecting..."
          : "\u2713 Connected"}
      </button>
    </motion.div>
  );
};

/* ─── Page ───────────────────────────────────────────────── */

type Scene = "welcome" | "upload";

const Index = () => {
  const navigate = useNavigate();
  const integrationStarted = useRef(false);

  const [elapsed, setElapsed]             = useState(0);
  const [started, setStarted]             = useState(false);
  const [scene, setScene]                 = useState<Scene>("welcome");
  const [modalVisible, setModalVisible]   = useState(false);
  const [modalPhase, setModalPhase]       = useState<"prompt" | "integrating">("prompt");
  const [yardiState, setYardiState]       = useState<ConnectState>("idle");
  const [appfolioState, setAppfolioState] = useState<ConnectState>("idle");
  const [setupComplete, setSetupComplete] = useState(false);
  const [visitedItems, setVisitedItems]   = useState<string[]>([]);

  // Upload-relative time (ms since upload scene appeared)
  const t = scene === "upload" ? Math.max(0, elapsed - UPLOAD_START) : 0;

  // Photo visibility (each becomes true when its slide starts)
  const photoVisible = PHOTO_SLIDE_STARTS.map((start) => t >= start);
  // Photos fade out after all 4 land (last lands at ~3300+700=4000)
  const photosInDzFading = t >= 4200;
  // Document and voice ghosts in drop zone
  const showDocGhost   = t >= 5500 && t < 7300;
  const showVoiceGhost = t >= 7500 && t < COMPLETION_REL;

  // Agent progress (0 to 1)
  const progress = (start: number, dur: number) =>
    t < start ? 0 : Math.min((t - start) / dur, 1);
  const visionProgress  = progress(AGENTS.vision.start, AGENTS.vision.duration);
  const docProgress     = progress(AGENTS.document.start, AGENTS.document.duration);
  const audioProgress   = progress(AGENTS.audio.start, AGENTS.audio.duration);

  // File item visibility & done state
  const photosFileVisible = t >= FILE_TIMES.photos.appear;
  const photosFileDone    = t >= FILE_TIMES.photos.done;
  const pdfFileVisible    = t >= FILE_TIMES.pdf.appear;
  const pdfFileDone       = t >= FILE_TIMES.pdf.done;
  const voiceFileVisible  = t >= FILE_TIMES.voice.appear;
  const voiceFileDone     = t >= FILE_TIMES.voice.done;

  // Completion
  const showCompletion = t >= COMPLETION_REL;
  const dzFading       = t >= COMPLETION_REL + FADE_DELAY;
  const showModal      = elapsed >= UPLOAD_START + COMPLETION_REL + FADE_DELAY;

  // Integration sequence (unchanged)
  const startIntegration = useCallback(() => {
    if (integrationStarted.current) return;
    integrationStarted.current = true;
    setModalPhase("integrating");
    setTimeout(() => setYardiState("connecting"),  300);
    setTimeout(() => setYardiState("connected"),  1100);
    setTimeout(() => setAppfolioState("connecting"), 1500);
    setTimeout(() => setAppfolioState("connected"),  2300);
    setTimeout(() => setSetupComplete(true),          3100);
    setTimeout(() => {
      setModalVisible(false);
      setVisitedItems(["overview"]);
      navigate("/inventory");
    }, 4600);
  }, [navigate]);

  const reset = useCallback(() => {
    integrationStarted.current = false;
    setElapsed(0);
    setStarted(false);
    setScene("welcome");
    setModalVisible(false);
    setModalPhase("prompt");
    setYardiState("idle");
    setAppfolioState("idle");
    setSetupComplete(false);
    setVisitedItems([]);
  }, []);

  // Timer — only runs after user clicks "Add a Building"
  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, [started]);

  // Scene transitions & modal timing
  useEffect(() => {
    if (showModal && !modalVisible) setModalVisible(true);
    const autoTime = UPLOAD_START + COMPLETION_REL + FADE_DELAY + AUTO_INTEGRATE_DELAY;
    if (elapsed >= autoTime) startIntegration();
  }, [elapsed, scene, showModal, modalVisible, startIntegration]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeItem="overview" visitedItems={visitedItems} />

      <main className="flex-1" style={{ marginLeft: 260, position: "relative", overflow: "hidden" }}>

        {/* ── Welcome overlay — dark full-content screen (unchanged) ── */}
        <AnimatePresence>
          {scene === "welcome" && (
            <motion.div
              key="welcome-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { duration: 0.3 } }}
              exit={{ opacity: 0, transition: { duration: 0.5 } }}
              style={{
                position: "absolute",
                inset: 0,
                background: "#0A0F1E",
                zIndex: 45,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              <h1 style={{ fontSize: 36, fontWeight: 700, color: "#FFFFFF", marginBottom: 8 }}>
                Welcome to RECOstudy
              </h1>
              <p style={{ fontSize: 16, color: "#94A3B8", marginBottom: 32 }}>
                Automated reserve fund studies, powered by AI.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                onClick={() => { setScene("upload"); setElapsed(UPLOAD_START); setStarted(true); }}
                style={{
                  background: "white",
                  color: "#0F1729",
                  fontSize: 16,
                  fontWeight: 600,
                  padding: "14px 32px",
                  borderRadius: 10,
                  border: "none",
                  cursor: "pointer",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                }}
              >
                Add a Building &rarr;
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Integration modal + backdrop (unchanged) ── */}
        <AnimatePresence>
          {modalVisible && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(15,23,41,0.45)",
                backdropFilter: "blur(3px)",
                zIndex: 50,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                style={{
                  maxWidth: 420,
                  width: "calc(100% - 48px)",
                  background: "white",
                  borderRadius: 16,
                  padding: 32,
                  boxShadow: "0 8px 40px rgba(0,0,0,0.18)",
                  position: "relative",
                }}
              >
                <AnimatePresence mode="wait">

                  {modalPhase === "prompt" && (
                    <motion.div
                      key="prompt"
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    >
                      <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
                        <div
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: "50%",
                            background: "#ECFDF5",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Check size={16} style={{ color: "#10B981" }} />
                        </div>
                      </div>
                      <p style={{ fontSize: 20, fontWeight: 700, color: "#0F1729", textAlign: "center", marginBottom: 8 }}>
                        Building data ready.
                      </p>
                      <p style={{ fontSize: 13, color: "#5A6178", textAlign: "center", marginBottom: 20 }}>
                        Connect your property management tools to sync live data automatically.
                      </p>
                      <div style={{ height: 1, background: "#E8EBF0", marginBottom: 16 }} />
                      <div style={{ display: "flex", justifyContent: "center", gap: 12, marginBottom: 20 }}>
                        {[
                          { src: "/yardi-logo.png", label: "Yardi" },
                          { src: "/appfolio-logo.png", label: "AppFolio" },
                        ].map(({ src, label }) => (
                          <div key={label} style={{ textAlign: "center" }}>
                            <img
                              src={src}
                              alt={label}
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 6,
                                objectFit: "contain",
                                display: "block",
                                margin: "0 auto 4px",
                              }}
                            />
                            <p style={{ fontSize: 11, color: "#5A6178" }}>{label}</p>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={startIntegration}
                        style={{
                          width: "100%",
                          height: 44,
                          background: "#4F6BFF",
                          color: "white",
                          border: "none",
                          borderRadius: 8,
                          fontSize: 14,
                          fontWeight: 500,
                          cursor: "pointer",
                          marginBottom: 8,
                        }}
                      >
                        Connect Yardi &amp; AppFolio
                      </button>
                      <p
                        onClick={startIntegration}
                        style={{
                          fontSize: 12,
                          color: "#9CA3B8",
                          textAlign: "center",
                          cursor: "pointer",
                          margin: 0,
                        }}
                      >
                        Skip for now
                      </p>
                    </motion.div>
                  )}

                  {modalPhase === "integrating" && (
                    <motion.div
                      key="integrating"
                      initial={{ opacity: 0, transition: { duration: 0.2 } }}
                      animate={{ opacity: 1, transition: { duration: 0.2 } }}
                    >
                      <p style={{ fontSize: 16, fontWeight: 600, color: "#0F1729", textAlign: "center", marginBottom: 16 }}>
                        Connecting your tools...
                      </p>
                      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                        <IntegrationCard name="Yardi" logoSrc="/yardi-logo.png" connectState={yardiState} />
                        <IntegrationCard name="AppFolio" logoSrc="/appfolio-logo.png" connectState={appfolioState} />
                      </div>
                      <AnimatePresence>
                        {setupComplete && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            style={{ fontSize: 13, color: "#10B981", textAlign: "center", margin: 0 }}
                          >
                            Setup complete. Taking you to your dashboard...
                          </motion.p>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )}

                </AnimatePresence>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Page content ── */}
        <div className="mx-auto" style={{ maxWidth: 1200, padding: "32px 48px" }}>
          <TopBar onReplay={reset} activeItem="overview" />

          <AnimatePresence>
            {scene === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.35 } }}
              >
                {/* Agent status line at top (appears at completion) */}
                <AnimatePresence>
                  {showCompletion && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                      style={{
                        fontFamily: "monospace",
                        fontSize: 13,
                        color: "#10B981",
                        marginBottom: 12,
                      }}
                    >
                      &#9679; Ingestion Agent &mdash; all data extracted successfully &#10003;
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* ── Two-column layout ── */}
                <div
                  style={{
                    display: "flex",
                    gap: "4%",
                  }}
                >
                  {/* ─── LEFT COLUMN — Building Data ─── */}
                  <div style={{ width: "48%", display: "flex", flexDirection: "column" }}>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        fontSize: 13,
                        textTransform: "uppercase" as const,
                        color: "#9CA3B8",
                        letterSpacing: "0.06em",
                        marginBottom: 16,
                      }}
                    >
                      Building Data
                    </motion.p>

                    <p style={{ fontSize: 16, fontWeight: 700, color: "#0F1729", marginBottom: 4 }}>
                      ABC Condominium Association, Inc.
                    </p>
                    <p style={{ fontSize: 13, color: "#5A6178", marginBottom: 16 }}>
                      Upload building data to begin your reserve fund study.
                    </p>

                    {/* Drop zone with photos */}
                    <AnimatePresence>
                      {!dzFading && (
                        <motion.div
                          exit={{ opacity: 0, transition: { duration: 0.35 } }}
                          style={{
                            position: "relative",
                            width: "100%",
                            height: 180,
                            borderRadius: 12,
                            border: "2px dashed #4F6BFF",
                            background: "rgba(79,107,255,0.04)",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                          }}
                        >
                          {/* Upload placeholder */}
                          <Upload size={32} style={{ color: "#4F6BFF", opacity: 0.5 }} />
                          <p style={{ fontSize: 14, color: "#5A6178" }}>Drop files here</p>

                          {/* Photos slide in from left into 2x2 grid, then fade */}
                          {PHOTO_URLS.map((url, i) => {
                            if (!photoVisible[i]) return null;
                            const pos = PHOTO_POSITIONS[i];
                            return (
                              <motion.div
                                key={`photo-${i}`}
                                initial={{ x: -1500, opacity: 0 }}
                                animate={
                                  photosInDzFading
                                    ? { x: 0, opacity: 0, scale: 1 }
                                    : { x: 0, opacity: 1, scale: [1, 1, 1.05, 1] }
                                }
                                transition={
                                  photosInDzFading
                                    ? { opacity: { duration: 0.4 } }
                                    : {
                                        x: { duration: 0.5, ease: "easeOut" },
                                        opacity: { duration: 0.4 },
                                        scale: { duration: 0.2, delay: 0.5, ease: "easeInOut" },
                                      }
                                }
                                style={{
                                  position: "absolute",
                                  top: pos.top,
                                  left: pos.left,
                                  width: 110,
                                  height: 82,
                                  borderRadius: 8,
                                  border: "2px solid white",
                                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                                  overflow: "hidden",
                                  zIndex: 5,
                                }}
                              >
                                <img
                                  src={url}
                                  alt=""
                                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                                />
                              </motion.div>
                            );
                          })}

                          {/* Document ghost — slides in after photos fade */}
                          <AnimatePresence>
                            {showDocGhost && (
                              <motion.div
                                key="doc-ghost"
                                initial={{ x: -1500, opacity: 0 }}
                                animate={{ x: 0, opacity: 1, scale: [1, 1, 1.05, 1] }}
                                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                                transition={{
                                  x: { duration: 0.5, ease: "easeOut" },
                                  opacity: { duration: 0.4 },
                                  scale: { duration: 0.2, delay: 0.5, ease: "easeInOut" },
                                }}
                                style={{
                                  position: "absolute",
                                  top: 49,
                                  left: "calc(50% - 55px)",
                                  width: 110,
                                  height: 82,
                                  borderRadius: 8,
                                  border: "2px solid white",
                                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                                  background: "#FEF2F2",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  zIndex: 5,
                                }}
                              >
                                <FileText size={32} style={{ color: "#EF4444" }} />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Voice ghost — slides in after doc ghost */}
                          <AnimatePresence>
                            {showVoiceGhost && (
                              <motion.div
                                key="voice-ghost"
                                initial={{ x: -1500, opacity: 0 }}
                                animate={{ x: 0, opacity: 1, scale: [1, 1, 1.05, 1] }}
                                exit={{ opacity: 0, transition: { duration: 0.3 } }}
                                transition={{
                                  x: { duration: 0.5, ease: "easeOut" },
                                  opacity: { duration: 0.4 },
                                  scale: { duration: 0.2, delay: 0.5, ease: "easeInOut" },
                                }}
                                style={{
                                  position: "absolute",
                                  top: 49,
                                  left: "calc(50% - 55px)",
                                  width: 110,
                                  height: 82,
                                  borderRadius: 8,
                                  border: "2px solid white",
                                  boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
                                  background: "#F3E8FF",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  zIndex: 5,
                                }}
                              >
                                <Mic size={32} style={{ color: "#8B5CF6" }} />
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* File items */}
                    <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
                      <FileSlideRow
                        visible={photosFileVisible}
                        done={photosFileDone}
                        name="6 building inspection photos"
                        detail="Images · 24.5 MB · Vision AI processed"
                        iconBg="#EFF6FF"
                        iconColor="#3B82F6"
                        IconComp={ImageIcon}
                      />
                      <FileSlideRow
                        visible={pdfFileVisible}
                        done={pdfFileDone}
                        name="existing-reserve-study.pdf"
                        detail="PDF Document · 8.7 MB · Document AI processed"
                        iconBg="#FEF2F2"
                        iconColor="#EF4444"
                        IconComp={FileText}
                      />
                      <FileSlideRow
                        visible={voiceFileVisible}
                        done={voiceFileDone}
                        name="site-walkthrough-notes.m4a"
                        detail="Voice Recording · 3.2 MB · Audio AI processed"
                        iconBg="#F3E8FF"
                        iconColor="#8B5CF6"
                        IconComp={Mic}
                      />
                    </div>
                  </div>

                  {/* ─── RIGHT COLUMN — AI Processing ─── */}
                  <div style={{ width: "48%", display: "flex", flexDirection: "column" }}>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                      style={{
                        fontSize: 13,
                        textTransform: "uppercase" as const,
                        color: "#9CA3B8",
                        letterSpacing: "0.06em",
                        marginBottom: 16,
                      }}
                    >
                      AI Processing
                    </motion.p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <AgentProcessingCard
                        name="Vision Agent"
                        iconBg="#F3E8FF"
                        iconColor="#8B5CF6"
                        borderColor="#8B5CF6"
                        fillColor="#8B5CF6"
                        IconComp={Eye}
                        progress={visionProgress}
                        active={t >= AGENTS.vision.start && visionProgress < 1}
                        complete={visionProgress >= 1}
                        observations={VISION_OBS}
                      />
                      <AgentProcessingCard
                        name="Document Agent"
                        iconBg="#FEF2F2"
                        iconColor="#EF4444"
                        borderColor="#EF4444"
                        fillColor="#EF4444"
                        IconComp={FileText}
                        progress={docProgress}
                        active={t >= AGENTS.document.start && docProgress < 1}
                        complete={docProgress >= 1}
                        observations={DOC_OBS}
                      />
                      <AgentProcessingCard
                        name="Audio Agent"
                        iconBg="#F3E8FF"
                        iconColor="#8B5CF6"
                        borderColor="#8B5CF6"
                        fillColor="#8B5CF6"
                        IconComp={Mic}
                        progress={audioProgress}
                        active={t >= AGENTS.audio.start && audioProgress < 1}
                        complete={audioProgress >= 1}
                        observations={AUDIO_OBS}
                      />
                    </div>

                    {/* Completion bar */}
                    <AnimatePresence>
                      {showCompletion && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                          style={{
                            marginTop: 12,
                            background: "#ECFDF5",
                            borderRadius: 8,
                            padding: "10px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <CheckCircle size={16} style={{ color: "#10B981", flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#10B981" }}>
                            Ingestion complete &mdash; 3 sources processed by 3 AI agents
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Index;
