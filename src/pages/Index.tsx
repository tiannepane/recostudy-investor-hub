import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, FileText, Mic, Check, Eye, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

/* ─── Constants ──────────────────────────────────────────── */

const UPLOAD_START = 1500;

// Photo timings — 1200ms apart, 800ms fade each
const PHOTO_SLIDE_STARTS = [1000, 2200, 3400, 4600];
const PHOTO_URLS = [
  "/suspended-slab-waterproofing.png",
  "/parkade-roof-deck.png",
  "/exterior-windows-aluminum.png",
  "/elevator-machinery-townhouse.png",
];

const PHOTO_POSITIONS = [
  { top: 4, left: "calc(50% - 114px)" },
  { top: 4, left: "calc(50% + 4px)" },
  { top: 94, left: "calc(50% - 114px)" },
  { top: 94, left: "calc(50% + 4px)" },
];

// File item timings (relative to upload start)
const FILE_TIMES = {
  photos: { appear: 5800, done: 6400 },
  pdf:    { appear: 7500, done: 8100 },
  voice:  { appear: 10800, done: 11400 },
};

// Agent timings — 2.5s each, 1s pause between
const AGENTS = {
  vision:   { start: 1000, duration: 2500 },
  document: { start: 4500, duration: 2500 },
  audio:    { start: 8000, duration: 2500 },
};

const COMPLETION_REL = 10500;
const BUTTON_APPEAR_REL = 12000;
const FADE_DELAY = 14000;
const AUTO_INTEGRATE_DELAY = 4000;

const VISION_OBS = [
  "\u2192 Detected: exterior facade, balcony structures",
  "\u2192 Identified: HVAC unit, elevator shaft, parking level",
  "\u2192 Flagged: visible concrete spalling on east elevation",
];
const DOC_OBS = [
  "\u2192 Extracted: reserve fund balance $2,064,255",
  "\u2192 Identified: 10 components approaching end of life",
  "\u2192 Parsed: engineer depreciation report, 2024 baseline",
];
const AUDIO_OBS = [
  "\u2192 Transcribed: 4m 32s site walkthrough audio",
  "\u2192 Extracted: rooftop membrane showing wear, last serviced 2019",
  "\u2192 Noted: parkade slab cracking, elevator cab flagged",
];

/* ─── Agent Processing Card (right column) ──────────────── */

const AgentProcessingCard = ({
  name,
  IconComp,
  progress,
  active,
  complete,
  observations,
}: {
  name: string;
  IconComp: React.ElementType;
  progress: number;
  active: boolean;
  complete: boolean;
  observations: string[];
}) => {
  const isActive = active || complete;
  const cardBg = complete ? "#F7F7F7" : active ? "#FAFAFA" : "#FAFAFA";
  return (
    <div
      style={{
        background: cardBg,
        borderRadius: 12,
        border: `1px solid ${isActive ? "#0A0A0A" : "#E5E7EB"}`,
        padding: 16,
        opacity: isActive ? 1 : 0.35,
        boxShadow: isActive ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
        transition: "opacity 0.5s, box-shadow 0.5s, border-color 0.5s, background 0.5s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 8,
            background: "#F0F0F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <IconComp size={14} style={{ color: "#0A0A0A" }} />
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0A", flex: 1 }}>
          {name}
        </span>
        {isActive && (
          complete ? (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.08, 1.0], opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: "2px 8px",
                borderRadius: 4,
                background: "#F0F0F0",
                color: "#0A0A0A",
                whiteSpace: "nowrap",
              }}
            >
              Complete &#10003;
            </motion.span>
          ) : (
            <span
              style={{
                fontSize: 11,
                fontWeight: 500,
                padding: "2px 8px",
                borderRadius: 4,
                background: "#F0F0F0",
                color: "#0A0A0A",
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
          height: 4,
          background: "#E5E7EB",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${Math.min(progress * 100, 100)}%`,
            background: "#0A0A0A",
            borderRadius: 2,
            transition: "width 0.15s linear",
          }}
        />
      </div>

      <div
        style={{
          marginTop: 10,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          color: "#6B7280",
          lineHeight: 1.7,
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
                transition: "opacity 0.5s ease",
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
  IconComp,
}: {
  visible: boolean;
  done: boolean;
  name: string;
  detail: string;
  IconComp: React.ElementType;
}) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 16px",
          background: "white",
          borderRadius: 10,
          border: "1px solid #E5E7EB",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 8,
            background: "#F5F5F5",
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IconComp size={18} style={{ color: "#0A0A0A" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 13, fontWeight: 500, color: "#0A0A0A", marginBottom: 2 }}>
            {name}
          </p>
          <p style={{ fontSize: 11, color: "#999" }}>{detail}</p>
        </div>
        {!done ? (
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              border: "2px solid #E5E7EB",
              borderTopColor: "#0A0A0A",
              flexShrink: 0,
              animation: "spin 0.8s linear infinite",
            }}
          />
        ) : (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "#0A0A0A",
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
          background: "#F0F0F0",
          border: "1px solid #D0D0D0",
          color: "#0A0A0A",
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
          background: "#0A0A0A",
          border: "1px solid #0A0A0A",
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
          border: "1px solid #E5E7EB",
          color: "#6B7280",
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
        border: "1px solid #E5E7EB",
        background: "#FFFFFF",
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
      <p style={{ fontSize: 15, fontWeight: 500, color: "#0A0A0A" }}>{name}</p>
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

  const [elapsed,     setElapsed]     = useState(0);
  const [started,     setStarted]     = useState(false);
  const [scene, setScene]             = useState<Scene>("welcome");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPhase, setModalPhase]   = useState<"prompt" | "integrating">("prompt");
  const [yardiState, setYardiState]   = useState<ConnectState>("idle");
  const [appfolioState, setAppfolioState] = useState<ConnectState>("idle");
  const [setupComplete, setSetupComplete] = useState(false);
  const [visitedItems, setVisitedItems] = useState<string[]>([]);

  const t = scene === "upload" ? Math.max(0, elapsed - UPLOAD_START) : 0;

  // Photo visibility
  const photoVisible = PHOTO_SLIDE_STARTS.map((start) => t >= start);
  const photosInDzFading = t >= 6000;

  // Document and voice ghosts
  const showDocGhost   = t >= 5000 && t < 7500;
  const showVoiceGhost = t >= 8000 && t < COMPLETION_REL;

  // Agent progress
  const progress = (start: number, dur: number) =>
    t < start ? 0 : Math.min((t - start) / dur, 1);
  const visionProgress  = progress(AGENTS.vision.start, AGENTS.vision.duration);
  const docProgress     = progress(AGENTS.document.start, AGENTS.document.duration);
  const audioProgress   = progress(AGENTS.audio.start, AGENTS.audio.duration);

  // File visibility
  const photosFileVisible = t >= FILE_TIMES.photos.appear;
  const photosFileDone    = t >= FILE_TIMES.photos.done;
  const pdfFileVisible    = t >= FILE_TIMES.pdf.appear;
  const pdfFileDone       = t >= FILE_TIMES.pdf.done;
  const voiceFileVisible  = t >= FILE_TIMES.voice.appear;
  const voiceFileDone     = t >= FILE_TIMES.voice.done;

  // Completion & button
  const showCompletion = t >= COMPLETION_REL;
  const showButton     = t >= BUTTON_APPEAR_REL;
  const dzFading       = t >= COMPLETION_REL + FADE_DELAY;
  const showModal      = elapsed >= UPLOAD_START + COMPLETION_REL + FADE_DELAY;

  // Integration sequence
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

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, [started]);

  useEffect(() => {
    if (showModal && !modalVisible) setModalVisible(true);
    const autoTime = UPLOAD_START + COMPLETION_REL + FADE_DELAY + AUTO_INTEGRATE_DELAY;
    if (elapsed >= autoTime) startIntegration();
  }, [elapsed, scene, showModal, modalVisible, startIntegration]);

  return (
    <div className="flex min-h-screen" style={{ background: "#FFFFFF" }}>
      <Sidebar activeItem="overview" visitedItems={visitedItems} />

      <main className="flex-1" style={{ marginLeft: 260, position: "relative", overflow: "hidden" }}>

        {/* ── Welcome overlay ── */}
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
                background: "#0A0A0A",
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
              <p style={{ fontSize: 16, color: "#999", marginBottom: 32 }}>
                Automated reserve fund studies, powered by AI.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
                onClick={() => { setScene("upload"); setElapsed(UPLOAD_START); setStarted(true); }}
                style={{
                  background: "white",
                  color: "#0A0A0A",
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

        {/* ── Integration modal ── */}
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
                background: "rgba(0,0,0,0.35)",
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
                            background: "#F0F0F0",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Check size={16} style={{ color: "#0A0A0A" }} />
                        </div>
                      </div>
                      <p style={{ fontSize: 20, fontWeight: 700, color: "#0A0A0A", textAlign: "center", marginBottom: 8 }}>
                        Building data ready.
                      </p>
                      <p style={{ fontSize: 13, color: "#6B7280", textAlign: "center", marginBottom: 20 }}>
                        Connect your property management tools to sync live data automatically.
                      </p>
                      <div style={{ height: 1, background: "#E5E7EB", marginBottom: 16 }} />
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
                            <p style={{ fontSize: 11, color: "#6B7280" }}>{label}</p>
                          </div>
                        ))}
                      </div>
                      <button
                        onClick={startIntegration}
                        style={{
                          width: "100%",
                          height: 44,
                          background: "#0A0A0A",
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
                          color: "#999",
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
                      <p style={{ fontSize: 16, fontWeight: 600, color: "#0A0A0A", textAlign: "center", marginBottom: 16 }}>
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
                            style={{ fontSize: 13, color: "#0A0A0A", textAlign: "center", margin: 0 }}
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
                {/* Completion status line */}
                <AnimatePresence>
                  {showCompletion && (
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        fontFamily: "monospace",
                        fontSize: 13,
                        color: "#0A0A0A",
                        marginBottom: 12,
                      }}
                    >
                      &#9679; Ingestion Agent &mdash; all data extracted successfully &#10003;
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Two-column layout */}
                <div style={{ display: "flex", gap: "4%" }}>

                  {/* LEFT COLUMN */}
                  <div style={{ width: "48%", display: "flex", flexDirection: "column" }}>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        fontSize: 13,
                        textTransform: "uppercase" as const,
                        color: "#999",
                        letterSpacing: "0.06em",
                        marginBottom: 16,
                      }}
                    >
                      Building Data
                    </motion.p>

                    <p style={{ fontSize: 16, fontWeight: 700, color: "#0A0A0A", marginBottom: 4 }}>
                      City Gate 1, LMS 195
                    </p>
                    <p style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}>
                      Upload building data to begin your reserve fund study.
                    </p>

                    {/* Drop zone */}
                    <AnimatePresence>
                      {!dzFading && (
                        <motion.div
                          exit={{ opacity: 0, transition: { duration: 0.5 } }}
                          style={{
                            position: "relative",
                            width: "100%",
                            height: 180,
                            borderRadius: 12,
                            border: "1px dashed #C0C0C0",
                            background: "#FAFAFA",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 8,
                          }}
                        >
                          <Upload size={32} style={{ color: "#C0C0C0" }} />
                          <p style={{ fontSize: 14, color: "#999" }}>Drop files here</p>

                          {/* Photos slide in */}
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
                                    : { x: 0, opacity: 1, scale: [1, 1, 1.03, 1] }
                                }
                                transition={
                                  photosInDzFading
                                    ? { opacity: { duration: 0.6 } }
                                    : {
                                        x: { duration: 0.8, ease: "easeOut" },
                                        opacity: { duration: 0.8 },
                                        scale: { duration: 0.3, delay: 0.8, ease: "easeInOut" },
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
                                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
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

                          {/* Document ghost */}
                          <AnimatePresence>
                            {showDocGhost && (
                              <motion.div
                                key="doc-ghost"
                                initial={{ x: -1500, opacity: 0 }}
                                animate={{ x: 0, opacity: 1, scale: [1, 1, 1.03, 1] }}
                                exit={{ opacity: 0, transition: { duration: 0.4 } }}
                                transition={{
                                  x: { duration: 0.8, ease: "easeOut" },
                                  opacity: { duration: 0.8 },
                                  scale: { duration: 0.3, delay: 0.8, ease: "easeInOut" },
                                }}
                                style={{
                                  position: "absolute",
                                  top: 49,
                                  left: "calc(50% - 55px)",
                                  width: 110,
                                  height: 82,
                                  borderRadius: 8,
                                  border: "2px solid white",
                                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                                  background: "#F5F5F5",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  zIndex: 5,
                                }}
                              >
                                <FileText size={32} style={{ color: "#0A0A0A" }} />
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Voice ghost */}
                          <AnimatePresence>
                            {showVoiceGhost && (
                              <motion.div
                                key="voice-ghost"
                                initial={{ x: -1500, opacity: 0 }}
                                animate={{ x: 0, opacity: 1, scale: [1, 1, 1.03, 1] }}
                                exit={{ opacity: 0, transition: { duration: 0.4 } }}
                                transition={{
                                  x: { duration: 0.8, ease: "easeOut" },
                                  opacity: { duration: 0.8 },
                                  scale: { duration: 0.3, delay: 0.8, ease: "easeInOut" },
                                }}
                                style={{
                                  position: "absolute",
                                  top: 49,
                                  left: "calc(50% - 55px)",
                                  width: 110,
                                  height: 82,
                                  borderRadius: 8,
                                  border: "2px solid white",
                                  boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
                                  background: "#F5F5F5",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                  zIndex: 5,
                                }}
                              >
                                <Mic size={32} style={{ color: "#0A0A0A" }} />
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
                        IconComp={ImageIcon}
                      />
                      <FileSlideRow
                        visible={pdfFileVisible}
                        done={pdfFileDone}
                        name="existing-reserve-study.pdf"
                        detail="PDF Document · 8.7 MB · Document AI processed"
                        IconComp={FileText}
                      />
                      <FileSlideRow
                        visible={voiceFileVisible}
                        done={voiceFileDone}
                        name="site-walkthrough-notes.m4a"
                        detail="Voice Recording · 3.2 MB · Audio AI processed"
                        IconComp={Mic}
                      />
                    </div>

                    {/* Connect button — appears after completion */}
                    <AnimatePresence>
                      {showButton && (
                        <motion.div
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, ease: "easeOut" }}
                          style={{ marginTop: 24 }}
                        >
                          <button
                            onClick={() => navigate("/inventory")}
                            style={{
                              width: "100%",
                              padding: "14px 0",
                              background: "#0A0A0A",
                              color: "#FFFFFF",
                              border: "none",
                              borderRadius: 999,
                              fontSize: 14,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Connect to property management tools &rarr;
                          </button>
                          <p style={{ fontSize: 12, color: "#999", textAlign: "center", marginTop: 8 }}>
                            Sync with AppFolio, Yardi, or Buildium to auto-populate your data
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* RIGHT COLUMN — AI Processing */}
                  <div style={{ width: "48%", display: "flex", flexDirection: "column" }}>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        fontSize: 13,
                        textTransform: "uppercase" as const,
                        color: "#999",
                        letterSpacing: "0.06em",
                        marginBottom: 16,
                      }}
                    >
                      AI Processing
                    </motion.p>

                    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                      <AgentProcessingCard
                        name="Vision Agent"
                        IconComp={Eye}
                        progress={visionProgress}
                        active={t >= AGENTS.vision.start && visionProgress < 1}
                        complete={visionProgress >= 1}
                        observations={VISION_OBS}
                      />
                      <AgentProcessingCard
                        name="Document Agent"
                        IconComp={FileText}
                        progress={docProgress}
                        active={t >= AGENTS.document.start && docProgress < 1}
                        complete={docProgress >= 1}
                        observations={DOC_OBS}
                      />
                      <AgentProcessingCard
                        name="Audio Agent"
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
                          transition={{ duration: 0.5 }}
                          style={{
                            marginTop: 12,
                            background: "#F5F5F5",
                            borderRadius: 8,
                            padding: "10px 16px",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <CheckCircle size={16} style={{ color: "#0A0A0A", flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#0A0A0A" }}>
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
