import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, FileText, Mic, Check, Eye, CheckCircle } from "lucide-react";
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

const VISION_OBS = [
  "→ Detected: exterior facade, balcony structures",
  "→ Identified: HVAC unit, elevator shaft, parking level",
  "→ Flagged: visible concrete spalling on east elevation",
];
const DOC_OBS = [
  "→ Extracted: reserve fund balance $2,064,255",
  "→ Identified: 10 components approaching end of life",
  "→ Parsed: engineer depreciation report, 2024 baseline",
];
const AUDIO_OBS = [
  "→ Transcribed: 4m 32s site walkthrough audio",
  "→ Extracted: rooftop membrane showing wear, last serviced 2019",
  "→ Noted: parkade slab cracking, elevator cab flagged",
];

/* ─── Agent Processing Card ──────────────────────────────── */

const AgentProcessingCard = ({
  name,
  IconComp,
  progress,
  active,
  complete,
  observations,
  accentColor,
}: {
  name: string;
  IconComp: React.ElementType;
  progress: number;
  active: boolean;
  complete: boolean;
  observations: string[];
  accentColor: string;
}) => {
  const isPending = !active && !complete;

  // Left accent border only while actively running; clean border otherwise
  const borderStyle: React.CSSProperties = active
    ? {
        borderTop: "1px solid #E5E7EB",
        borderRight: "1px solid #E5E7EB",
        borderBottom: "1px solid #E5E7EB",
        borderLeft: `3px solid ${accentColor}`,
      }
    : { border: "1px solid #E5E7EB" };

  const nameColor = isPending ? "#64748B" : "#334155";
  const iconColor = isPending ? "#64748B" : "#2E1A47";
  const barColor  = active ? accentColor : "#2E1A47";

  return (
    <div
      style={{
        background: "#FAFAFA",
        borderRadius: 12,
        ...borderStyle,
        // Compensate 2px extra for 3px left border so content doesn't shift
        padding: 16,
        paddingLeft: active ? 14 : 16,
        opacity: isPending ? 0.45 : 1,
        boxShadow: !isPending ? "0 2px 12px rgba(0,0,0,0.06)" : "none",
        transition: "opacity 0.5s, box-shadow 0.5s, background 0.5s ease",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 8,
            background: "#F0F0F0",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <IconComp size={19} style={{ color: iconColor, transition: "color 0.4s ease" }} />
        </div>
        <span
          style={{
            fontSize: 18,
            color: nameColor,
            flex: 1,
            transition: "color 0.4s ease",
          }}
        >
          {name}
        </span>
        {(active || complete) && (
          complete ? (
            <motion.span
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: [0.8, 1.08, 1.0], opacity: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{
                fontSize: 16,
                fontWeight: 500,
                padding: "3px 10px",
                borderRadius: 4,
                background: "#F0F0F0",
                color: "#2E1A47",
                whiteSpace: "nowrap",
              }}
            >
              Complete &#10003;
            </motion.span>
          ) : (
            <span
              style={{
                fontSize: 16,
                fontWeight: 500,
                padding: "3px 10px",
                borderRadius: 4,
                background: "#F0F0F0",
                color: "#2E1A47",
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
            background: barColor,
            borderRadius: 2,
            transition: "width 0.15s linear, background 0.4s ease",
          }}
        />
      </div>

      <div
        style={{
          marginTop: 10,
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 17,
          color: "#4B5563",
          lineHeight: 1.7,
          minHeight: 72,
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

/* ─── File Slide Row ─────────────────────────────────────── */

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
          <IconComp size={24} style={{ color: "#2E1A47" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 18, fontWeight: 500, color: "#2E1A47", marginBottom: 2 }}>
            {name}
          </p>
          <p style={{ fontSize: 16, color: "#4B5563" }}>{detail}</p>
        </div>
        {!done ? (
          <div
            style={{
              width: 26,
              height: 26,
              borderRadius: "50%",
              border: "2px solid #E5E7EB",
              borderTopColor: "#2E1A47",
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
              width: 26,
              height: 26,
              borderRadius: "50%",
              background: "#2E1A47",
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Check size={16} color="white" />
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
  onConnect,
}: {
  name: string;
  logoSrc: string;
  connectState: ConnectState;
  onConnect?: () => void;
}) => {
  const btnStyle: React.CSSProperties =
    connectState === "connected"
      ? {
          height: 38,
          padding: "0 20px",
          background: "#ECFDF5",
          border: "1px solid #BBF7D0",
          color: "#15803D",
          borderRadius: 6,
          fontSize: 18,
          fontWeight: 500,
          cursor: "default",
          transition: "all 0.3s ease",
        }
      : connectState === "connecting"
      ? {
          height: 38,
          padding: "0 20px",
          background: "#4D6BA9",
          border: "1px solid #4D6BA9",
          color: "white",
          borderRadius: 6,
          fontSize: 18,
          fontWeight: 500,
          cursor: "default",
          transition: "all 0.3s ease",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }
      : {
          height: 38,
          padding: "0 20px",
          background: "white",
          border: "1px solid rgba(15,23,41,0.06)",
          color: "#334155",
          borderRadius: 6,
          fontSize: 18,
          fontWeight: 500,
          cursor: "pointer",
          transition: "all 0.3s ease",
        };

  return (
    <motion.div
      animate={{ scale: connectState === "connected" ? [1, 1.015, 1] : 1 }}
      transition={{ duration: 0.3 }}
      style={{
        flex: 1,
        borderRadius: 10,
        border: "1px solid rgba(15,23,41,0.06)",
        boxShadow: "0 2px 8px rgba(15,23,41,0.05)",
        background: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        gap: 0,
      }}
    >
      <img
        src={logoSrc}
        alt={name}
        style={{ width: 48, height: 48, borderRadius: 6, objectFit: "contain" }}
      />
      <p style={{ fontSize: 19, fontWeight: 500, color: "#2E1A47", marginTop: 8, marginBottom: 8 }}>
        {name}
      </p>
      <button style={btnStyle} onClick={connectState === "idle" ? onConnect : undefined}>
        {connectState === "connecting" ? (
          <>
            <span
              style={{
                width: 10,
                height: 10,
                border: "2px solid rgba(255,255,255,0.35)",
                borderTopColor: "white",
                borderRadius: "50%",
                display: "inline-block",
                animation: "spin 0.8s linear infinite",
              }}
            />
            Connecting...
          </>
        ) : connectState === "connected" ? (
          "✓ Connected"
        ) : (
          "Connect"
        )}
      </button>
    </motion.div>
  );
};

/* ─── Constants ─────────────────────────────────────────── */

const BG_VIDEO = "https://videos.pexels.com/video-files/3843168/3843168-uhd_2560_1440_25fps.mp4";
const BG_FALLBACK = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80";

/* ─── Page ───────────────────────────────────────────────── */

type Scene = "welcome" | "upload";

const Index = () => {
  const connectStarted = useRef(false);

  const [elapsed,          setElapsed]          = useState(0);
  const [started,          setStarted]          = useState(false);
  const [scene,            setScene]            = useState<Scene>("welcome");
  const [visitedItems,     setVisitedItems]     = useState<string[]>([]);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [yardiState,       setYardiState]       = useState<ConnectState>("idle");
  const [appfolioState,    setAppfolioState]    = useState<ConnectState>("idle");
  const [bothConnected,    setBothConnected]    = useState(false);

  const t = scene === "upload" ? Math.max(0, elapsed - UPLOAD_START) : 0;

  // Photo visibility
  const photoVisible    = PHOTO_SLIDE_STARTS.map((start) => t >= start);
  const photosInDzFading = t >= 6000;

  // Document and voice ghosts
  const showDocGhost   = t >= 5000 && t < 7500;
  const showVoiceGhost = t >= 8000 && t < COMPLETION_REL;

  // Agent progress
  const progress = (start: number, dur: number) =>
    t < start ? 0 : Math.min((t - start) / dur, 1);
  const visionProgress = progress(AGENTS.vision.start,   AGENTS.vision.duration);
  const docProgress    = progress(AGENTS.document.start, AGENTS.document.duration);
  const audioProgress  = progress(AGENTS.audio.start,    AGENTS.audio.duration);

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

  // Integration sequence — Yardi first, AppFolio 1.2s later, each 900ms to complete
  const startConnect = useCallback(() => {
    if (connectStarted.current) return;
    connectStarted.current = true;
    setYardiState("connecting");
    setTimeout(() => {
      setYardiState("connected");
      setTimeout(() => {
        setAppfolioState("connecting");
        setTimeout(() => {
          setAppfolioState("connected");
          setBothConnected(true);
          setVisitedItems(["overview"]);
        }, 900);
      }, 1200);
    }, 900);
  }, []);

  // Button click: show inline integrations panel, auto-connect after 1.5s
  const handleConnectButtonClick = useCallback(() => {
    setShowIntegrations(true);
    setTimeout(startConnect, 1500);
  }, [startConnect]);

  const reset = useCallback(() => {
    connectStarted.current = false;
    setElapsed(0);
    setStarted(false);
    setScene("welcome");
    setVisitedItems([]);
    setShowIntegrations(false);
    setYardiState("idle");
    setAppfolioState("idle");
    setBothConnected(false);
  }, []);

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, [started]);

  return (
    <div className="flex min-h-screen" style={{ background: "#FFFFFF" }}>
      {/* Keyframe for pulsing green dot */}
      <style>{`
        @keyframes pulseGreen {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>

      <Sidebar activeItem="overview" visitedItems={visitedItems} />

      <main className="flex-1" style={{ marginLeft: 320, position: "relative", overflow: "hidden" }}>

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
                zIndex: 45,
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
              }}
            >
              {/* Fallback image */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  backgroundImage: `url(${BG_FALLBACK})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              {/* Video */}
              <video
                autoPlay
                muted
                loop
                playsInline
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
                src={BG_VIDEO}
              />
              {/* Dark overlay */}
              <div style={{ position: "absolute", inset: 0, background: "rgba(10,14,26,0.6)" }} />

              {/* Content */}
              <div style={{ position: "relative", zIndex: 1 }}>
                <h1 style={{ fontSize: 48, fontWeight: 700, color: "#FFFFFF", marginBottom: 8 }}>
                  Welcome to RECOstudy™
                </h1>
                <p style={{ fontSize: 22, color: "rgba(255,255,255,0.65)", marginBottom: 32 }}>
                  Automated reserve fund studies, powered by AI.
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                  onClick={() => { setScene("upload"); setElapsed(UPLOAD_START); setStarted(true); }}
                  style={{
                    background: "white",
                    color: "#0A0A0A",
                    fontSize: 20,
                    fontWeight: 700,
                    padding: "18px 40px",
                    borderRadius: 10,
                    border: "none",
                    cursor: "pointer",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
                  }}
                >
                  Add a Building &rarr;
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Page content ── */}
        <div className="mx-auto" style={{ maxWidth: 1560, padding: "32px 36px" }}>
          <TopBar onReplay={reset} activeItem="overview" />

          <AnimatePresence>
            {scene === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.35 } }}
              >
                {/* ── Ingestion complete pill — only after all agents done ── */}
                <AnimatePresence>
                  {showCompletion && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 8,
                        background: "#F0FDF4",
                        border: "1px solid #BBF7D0",
                        borderRadius: 6,
                        padding: "6px 14px",
                        marginBottom: 12,
                      }}
                    >
                      <span
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#22C55E",
                          flexShrink: 0,
                          animation: "pulseGreen 1.5s ease-in-out infinite",
                        }}
                      />
                      <span style={{ fontSize: 18, fontWeight: 600, color: "#15803D" }}>
                        ✓ Ingestion Agent: all data extracted successfully
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Two-column layout */}
                <div style={{ display: "flex", gap: "4%" }}>

                  {/* ── LEFT COLUMN ── */}
                  <div style={{ width: "48%", display: "flex", flexDirection: "column" }}>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        fontSize: 18,
                        textTransform: "uppercase" as const,
                        color: "#4B5563",
                        letterSpacing: "0.06em",
                        marginBottom: 16,
                      }}
                    >
                      Building Data
                    </motion.p>

                    <p style={{ fontSize: 21, fontWeight: 700, color: "#2E1A47", marginBottom: 2 }}>
                      Meridian Condominium Association, Inc.
                    </p>
                    <p style={{ fontSize: 18, color: "#4B5563", marginBottom: 4 }}>
                      425 East 58th Street, New York, NY 10022
                    </p>
                    <p style={{ fontSize: 18, color: "#4B5563", marginBottom: 16 }}>
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
                          <Upload size={40} style={{ color: "#C0C0C0" }} />
                          <p style={{ fontSize: 19, color: "#4B5563" }}>Drop files here</p>

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
                                <FileText size={32} style={{ color: "#2E1A47" }} />
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
                                <Mic size={32} style={{ color: "#2E1A47" }} />
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

                    {/* ── Connect button → inline integrations ── */}
                    <AnimatePresence mode="wait">
                      {showButton && !showIntegrations && (
                        <motion.div
                          key="connect-btn"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 8 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          style={{ marginTop: 24 }}
                        >
                          <button
                            onClick={handleConnectButtonClick}
                            style={{
                              width: "100%",
                              padding: "18px 0",
                              background: "#0A0A0A",
                              color: "#FFFFFF",
                              border: "none",
                              borderRadius: 999,
                              fontSize: 19,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            Connect to property management tools &rarr;
                          </button>
                          <p style={{ fontSize: 17, color: "#4B5563", textAlign: "center", marginTop: 8 }}>
                            Sync with AppFolio, Yardi, or Buildium to auto-populate your data
                          </p>
                        </motion.div>
                      )}

                      {showIntegrations && (
                        <motion.div
                          key="integrations"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.35, ease: "easeOut" }}
                          style={{ marginTop: 24 }}
                        >
                          <p
                            style={{
                              fontSize: 16,
                              textTransform: "uppercase" as const,
                              color: "#64748B",
                              letterSpacing: "0.08em",
                              marginBottom: 10,
                            }}
                          >
                            Connect Your Tools
                          </p>
                          <div style={{ display: "flex", gap: 12 }}>
                            <IntegrationCard
                              name="Yardi"
                              logoSrc="/yardi-logo.png"
                              connectState={yardiState}
                              onConnect={startConnect}
                            />
                            <IntegrationCard
                              name="AppFolio"
                              logoSrc="/appfolio-logo.png"
                              connectState={appfolioState}
                              onConnect={startConnect}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* ── RIGHT COLUMN — AI Processing ── */}
                  <div style={{ width: "48%", display: "flex", flexDirection: "column" }}>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                      style={{
                        fontSize: 18,
                        textTransform: "uppercase" as const,
                        color: "#4B5563",
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
                        accentColor="#6366F1"
                      />
                      <AgentProcessingCard
                        name="Document Agent"
                        IconComp={FileText}
                        progress={docProgress}
                        active={t >= AGENTS.document.start && docProgress < 1}
                        complete={docProgress >= 1}
                        observations={DOC_OBS}
                        accentColor="#0EA5E9"
                      />
                      <AgentProcessingCard
                        name="Audio Agent"
                        IconComp={Mic}
                        progress={audioProgress}
                        active={t >= AGENTS.audio.start && audioProgress < 1}
                        complete={audioProgress >= 1}
                        observations={AUDIO_OBS}
                        accentColor="#8B5CF6"
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
                          <CheckCircle size={22} style={{ color: "#2E1A47", flexShrink: 0 }} />
                          <span style={{ fontSize: 18, fontWeight: 600, color: "#2E1A47" }}>
                            Ingestion complete: 3 sources processed by 3 AI agents
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
