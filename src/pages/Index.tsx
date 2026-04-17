import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, FileText, Mic, Check, Eye, ShieldCheck } from "lucide-react";
import Sidebar from "@/components/Sidebar";

/* ─── Timing (ms) ──────────────────────────────────────────── */

const UPLOAD_START = 1500;

const PHOTO_SLIDE_STARTS = [400, 850, 1300, 1750];
const PHOTO_URLS = [
  "/suspended-slab-waterproofing.png",
  "/parkade-roof-deck.png",
  "/exterior-windows-aluminum.png",
  "/elevator-machinery-townhouse.png",
];
const PHOTO_POSITIONS = [
  { top: 4,  left: "calc(50% - 114px)" },
  { top: 4,  left: "calc(50% + 4px)"   },
  { top: 94, left: "calc(50% - 114px)" },
  { top: 94, left: "calc(50% + 4px)"   },
];

const FILE_TIMES = {
  photos: { appear: 2500, done: 3100 },
  pdf:    { appear: 3600, done: 4200 },
  voice:  { appear: 4700, done: 5300 },
};

const DZ_FADE = 5800;

const VISION_START = 5800;
const VISION_DUR   = 2500;
const VISION_END   = VISION_START + VISION_DUR;   // 8300

const DOC_START = VISION_END + 300;                // 8600
const DOC_DUR   = 2500;
const DOC_END   = DOC_START + DOC_DUR;             // 11100

const AUDIO_START = DOC_END + 300;                 // 11400
const AUDIO_DUR   = 2500;
const AUDIO_END   = AUDIO_START + AUDIO_DUR;       // 13900

const QA_START = AUDIO_END + 400;                  // 14300
const QA_DUR   = 2400;
const QA_END   = QA_START + QA_DUR;               // 16700

const COMPLETION_AT    = QA_END + 400;             // 17100
const BUTTON_APPEAR_AT = COMPLETION_AT + 1800;     // 18900

/* ─── Agent config ─────────────────────────────────────────── */

const AGENTS = [
  {
    key:       "vision",
    name:      "Vision Agent",
    Icon:      Eye,
    color:     "#6366F1",
    startTime: VISION_START,
    dur:       VISION_DUR,
    endTime:   VISION_END,
    observations: [
      "→ Detected: exterior facade, balcony structures",
      "→ Identified: HVAC unit, elevator shaft, parking level",
      "→ Flagged: visible concrete spalling on east elevation",
    ],
    summary: "facade, elevator shaft, concrete spalling flagged",
  },
  {
    key:       "doc",
    name:      "Document Agent",
    Icon:      FileText,
    color:     "#0EA5E9",
    startTime: DOC_START,
    dur:       DOC_DUR,
    endTime:   DOC_END,
    observations: [
      "→ Extracted: reserve fund balance $2,064,255",
      "→ Identified: 10 components approaching end of life",
      "→ Parsed: engineer depreciation report, 2024 baseline",
    ],
    summary: "reserve fund $2.06M · 10 components near end of life",
  },
  {
    key:       "audio",
    name:      "Audio Agent",
    Icon:      Mic,
    color:     "#8B5CF6",
    startTime: AUDIO_START,
    dur:       AUDIO_DUR,
    endTime:   AUDIO_END,
    observations: [
      "→ Transcribed: 4m 32s site walkthrough audio",
      "→ Extracted: rooftop membrane showing wear, last serviced 2019",
      "→ Noted: parkade slab cracking, elevator cab flagged",
    ],
    summary: "rooftop membrane wear · parkade slab · elevator cab",
  },
  {
    key:       "qa",
    name:      "QA Agent",
    Icon:      ShieldCheck,
    color:     "#10B981",
    startTime: QA_START,
    dur:       QA_DUR,
    endTime:   QA_END,
    observations: [
      "→ Cross-referencing vision, document, and audio findings...",
      "→ 24 components catalogued — 3 flagged for priority review",
      "→ All data validated, no conflicting entries detected",
    ],
    summary: "24 components catalogued · 3 flagged · no conflicts",
  },
] as const;

/* ─── File Row ─────────────────────────────────────────────── */

const FileRow = ({
  visible, done, name, detail, IconComp,
}: {
  visible: boolean; done: boolean; name: string; detail: string; IconComp: React.ElementType;
}) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "12px 16px", background: "white",
          borderRadius: 10, border: "1px solid #E5E7EB",
        }}
      >
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "#F5F5F5", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconComp size={20} style={{ color: "#2E1A47" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 17, fontWeight: 500, color: "#2E1A47", marginBottom: 1 }}>{name}</p>
          <p style={{ fontSize: 15, color: "#94A3B8" }}>{detail}</p>
        </div>
        {!done ? (
          <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #E5E7EB", borderTopColor: "#2E1A47", flexShrink: 0, animation: "spin 0.8s linear infinite" }} />
        ) : (
          <motion.div
            initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}
            style={{ width: 22, height: 22, borderRadius: "50%", background: "#2E1A47", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <Check size={13} color="white" />
          </motion.div>
        )}
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─── Active Agent Card ────────────────────────────────────── */

const ActiveAgentCard = ({
  name, Icon, color, progress, observations,
}: {
  name: string; Icon: React.ElementType; color: string; progress: number; observations: readonly string[];
}) => (
  <motion.div
    key="active"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -6 }}
    transition={{ duration: 0.35, ease: "easeOut" }}
    style={{
      borderRadius: 12,
      border: `1px solid ${color}30`,
      borderLeft: `3px solid ${color}`,
      background: "#FAFAFA",
      padding: "16px 18px",
    }}
  >
    {/* Header */}
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
      <Icon size={18} style={{ color, flexShrink: 0 }} />
      <span style={{ fontSize: 18, fontWeight: 600, color: "#1E293B", flex: 1 }}>{name}</span>
      <span style={{ fontSize: 14, color, fontWeight: 500, letterSpacing: "0.04em" }}>
        Processing...
      </span>
    </div>

    {/* Progress bar */}
    <div style={{ width: "100%", height: 3, background: "#E5E7EB", borderRadius: 2, overflow: "hidden", marginBottom: 14 }}>
      <motion.div
        style={{ height: "100%", background: color, borderRadius: 2 }}
        animate={{ width: `${Math.min(progress * 100, 100)}%` }}
        transition={{ duration: 0.15, ease: "linear" }}
      />
    </div>

    {/* Observations */}
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 15, color: "#64748B", lineHeight: 1.8 }}>
      {observations.map((obs, i) => (
        <div
          key={i}
          style={{
            opacity: progress >= [0.33, 0.66, 0.95][i] ? 1 : 0,
            transition: "opacity 0.5s ease",
          }}
        >
          {obs}
        </div>
      ))}
    </div>
  </motion.div>
);

/* ─── Completed Agent Line ─────────────────────────────────── */

const CompletedAgentLine = ({
  name, color, summary,
}: {
  name: string; color: string; summary: string;
}) => (
  <motion.div
    key="line"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
    style={{
      display: "flex", alignItems: "center", gap: 10,
      padding: "8px 0",
      borderBottom: "1px solid #F1F5F9",
    }}
  >
    <div style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
    <span style={{ fontSize: 16, fontWeight: 600, color: "#334155", flexShrink: 0 }}>{name}</span>
    <span style={{ fontSize: 15, color: "#CBD5E1", flexShrink: 0 }}>—</span>
    <span style={{ fontSize: 15, color: "#94A3B8", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
      {summary}
    </span>
    <Check size={14} style={{ color: "#22C55E", flexShrink: 0 }} />
  </motion.div>
);

/* ─── Integration Card ─────────────────────────────────────── */

type ConnectState = "idle" | "connecting" | "connected";

const IntegrationCard = ({
  name, logoSrc, connectState, onConnect,
}: {
  name: string; logoSrc: string; connectState: ConnectState; onConnect?: () => void;
}) => {
  const btnStyle: React.CSSProperties =
    connectState === "connected"
      ? { height: 36, padding: "0 18px", background: "#ECFDF5", border: "1px solid #BBF7D0", color: "#15803D", borderRadius: 6, fontSize: 16, fontWeight: 500, cursor: "default" }
      : connectState === "connecting"
      ? { height: 36, padding: "0 18px", background: "#4D6BA9", border: "1px solid #4D6BA9", color: "white", borderRadius: 6, fontSize: 16, fontWeight: 500, cursor: "default", display: "flex", alignItems: "center", gap: 6 }
      : { height: 36, padding: "0 18px", background: "white", border: "1px solid #E5E7EB", color: "#334155", borderRadius: 6, fontSize: 16, fontWeight: 500, cursor: "pointer" };

  return (
    <motion.div
      animate={{ scale: connectState === "connected" ? [1, 1.015, 1] : 1 }}
      transition={{ duration: 0.3 }}
      style={{ flex: 1, borderRadius: 10, border: "1px solid #E5E7EB", background: "#FFFFFF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16, gap: 8 }}
    >
      <img src={logoSrc} alt={name} style={{ width: 44, height: 44, borderRadius: 6, objectFit: "contain" }} />
      <p style={{ fontSize: 17, fontWeight: 500, color: "#2E1A47", margin: 0 }}>{name}</p>
      <button style={btnStyle} onClick={connectState === "idle" ? onConnect : undefined}>
        {connectState === "connecting" ? (
          <><span style={{ width: 10, height: 10, border: "2px solid rgba(255,255,255,0.35)", borderTopColor: "white", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />Connecting...</>
        ) : connectState === "connected" ? "✓ Connected" : "Connect"}
      </button>
    </motion.div>
  );
};

/* ─── Constants ─────────────────────────────────────────────── */

const BG_VIDEO    = "https://videos.pexels.com/video-files/3843168/3843168-uhd_2560_1440_25fps.mp4";
const BG_FALLBACK = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80";

/* ─── Page ───────────────────────────────────────────────────── */

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

  const t = scene === "upload" ? Math.max(0, elapsed - UPLOAD_START) : 0;

  const photoVisible      = PHOTO_SLIDE_STARTS.map((s) => t >= s);
  const photosInDzFading  = t >= DZ_FADE;
  const photosFileVisible = t >= FILE_TIMES.photos.appear;
  const photosFileDone    = t >= FILE_TIMES.photos.done;
  const pdfFileVisible    = t >= FILE_TIMES.pdf.appear;
  const pdfFileDone       = t >= FILE_TIMES.pdf.done;
  const voiceFileVisible  = t >= FILE_TIMES.voice.appear;
  const voiceFileDone     = t >= FILE_TIMES.voice.done;

  const prog = (start: number, dur: number) =>
    t < start ? 0 : Math.min((t - start) / dur, 1);

  const showAgentSection = t >= VISION_START;
  const showCompletion   = t >= COMPLETION_AT;
  const showButton       = t >= BUTTON_APPEAR_AT;

  const startConnect = useCallback(() => {
    if (connectStarted.current) return;
    connectStarted.current = true;
    setYardiState("connecting");
    setTimeout(() => {
      setYardiState("connected");
      setTimeout(() => {
        setAppfolioState("connecting");
        setTimeout(() => { setAppfolioState("connected"); setVisitedItems(["overview"]); }, 900);
      }, 1200);
    }, 900);
  }, []);

  const handleConnectButtonClick = useCallback(() => {
    setShowIntegrations(true);
    setTimeout(startConnect, 1500);
  }, [startConnect]);

  const reset = useCallback(() => {
    connectStarted.current = false;
    setElapsed(0); setStarted(false); setScene("welcome");
    setVisitedItems([]); setShowIntegrations(false);
    setYardiState("idle"); setAppfolioState("idle");
  }, []);

  useEffect(() => {
    if (!started) return;
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, [started]);

  return (
    <div className="flex min-h-screen" style={{ background: "#FFFFFF" }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

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
              style={{ position: "absolute", inset: 0, zIndex: 45, overflow: "hidden", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}
            >
              <div style={{ position: "absolute", inset: 0, backgroundImage: `url(${BG_FALLBACK})`, backgroundSize: "cover", backgroundPosition: "center" }} />
              <video autoPlay muted loop playsInline style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} src={BG_VIDEO} />
              <div style={{ position: "absolute", inset: 0, background: "rgba(10,14,26,0.6)" }} />
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
                  style={{ background: "white", color: "#0A0A0A", fontSize: 20, fontWeight: 700, padding: "18px 40px", borderRadius: 10, border: "none", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.25)" }}
                >
                  Add a Building &rarr;
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Upload scene — single column ── */}
        <div style={{ maxWidth: 680, margin: "0 auto", padding: "48px 36px" }}>

          {/* Replay button */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
            <button
              onClick={reset}
              style={{ background: "transparent", border: "1px solid #E5E7EB", borderRadius: 6, padding: "6px 14px", fontSize: 14, color: "#94A3B8", cursor: "pointer" }}
            >
              ↺ Replay
            </button>
          </div>

          <AnimatePresence>
            {scene === "upload" && (
              <motion.div key="upload" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0, transition: { duration: 0.35 } }}>

                {/* Drop zone */}
                <AnimatePresence>
                  {!photosInDzFading && (
                    <motion.div
                      exit={{ opacity: 0, transition: { duration: 0.6 } }}
                      style={{ position: "relative", width: "100%", height: 180, borderRadius: 12, border: "1px dashed #C0C0C0", background: "#FAFAFA", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 12 }}
                    >
                      <Upload size={36} style={{ color: "#C0C0C0" }} />
                      <p style={{ fontSize: 18, color: "#94A3B8" }}>Drop files here</p>
                      {PHOTO_URLS.map((url, i) => {
                        if (!photoVisible[i]) return null;
                        const pos = PHOTO_POSITIONS[i];
                        return (
                          <motion.div
                            key={`photo-${i}`}
                            initial={{ x: -1500, opacity: 0 }}
                            animate={{ x: 0, opacity: 1, scale: [1, 1, 1.03, 1] }}
                            transition={{ x: { duration: 0.8, ease: "easeOut" }, opacity: { duration: 0.8 }, scale: { duration: 0.3, delay: 0.8 } }}
                            style={{ position: "absolute", top: pos.top, left: pos.left, width: 110, height: 82, borderRadius: 8, border: "2px solid white", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", overflow: "hidden", zIndex: 5 }}
                          >
                            <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* File rows */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
                  <FileRow visible={photosFileVisible} done={photosFileDone} name="6 building inspection photos"  detail="Images · 24.5 MB"      IconComp={ImageIcon} />
                  <FileRow visible={pdfFileVisible}    done={pdfFileDone}    name="existing-reserve-study.pdf"    detail="PDF Document · 8.7 MB" IconComp={FileText}  />
                  <FileRow visible={voiceFileVisible}  done={voiceFileDone}  name="site-walkthrough-notes.m4a"    detail="Voice Recording · 3.2 MB" IconComp={Mic}    />
                </div>

                {/* Agent section */}
                <AnimatePresence>
                  {showAgentSection && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>

                      {/* Section label */}
                      <p style={{ fontSize: 13, textTransform: "uppercase", letterSpacing: "0.1em", color: "#CBD5E1", marginBottom: 16 }}>
                        3 Specialist Agents + QA
                      </p>

                      {/* Agents: completed lines + active card */}
                      <div style={{ marginBottom: 24 }}>
                        {AGENTS.map((agent) => {
                          const progress = prog(agent.startTime, agent.dur);
                          const isVisible  = t >= agent.startTime;
                          const isComplete = progress >= 1;

                          if (!isVisible) return null;

                          return (
                            <AnimatePresence key={agent.key} mode="wait">
                              {isComplete ? (
                                <CompletedAgentLine
                                  key="line"
                                  name={agent.name}
                                  color={agent.color}
                                  summary={agent.summary}
                                />
                              ) : (
                                <ActiveAgentCard
                                  key="card"
                                  name={agent.name}
                                  Icon={agent.Icon}
                                  color={agent.color}
                                  progress={progress}
                                  observations={agent.observations}
                                />
                              )}
                            </AnimatePresence>
                          );
                        })}
                      </div>

                      {/* Completion summary */}
                      <AnimatePresence>
                        {showCompletion && (
                          <motion.div
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.45 }}
                            style={{
                              display: "flex", alignItems: "center", gap: 10,
                              background: "#F0FDF4", border: "1px solid #BBF7D0",
                              borderRadius: 8, padding: "10px 16px", marginBottom: 20,
                            }}
                          >
                            <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", flexShrink: 0 }} />
                            <span style={{ fontSize: 17, fontWeight: 600, color: "#15803D" }}>
                              QA Agent: all data validated — 24 components catalogued
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Connect button / integrations */}
                      <AnimatePresence mode="wait">
                        {showButton && !showIntegrations && (
                          <motion.div key="connect-btn" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                            <button
                              onClick={handleConnectButtonClick}
                              style={{ width: "100%", padding: "16px 0", background: "#0A0A0A", color: "#FFFFFF", border: "none", borderRadius: 999, fontSize: 18, fontWeight: 600, cursor: "pointer" }}
                            >
                              Connect to property management tools &rarr;
                            </button>
                            <p style={{ fontSize: 15, color: "#94A3B8", textAlign: "center", marginTop: 8 }}>
                              Sync with AppFolio, Yardi, or Buildium
                            </p>
                          </motion.div>
                        )}

                        {showIntegrations && (
                          <motion.div key="integrations" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                            <p style={{ fontSize: 14, textTransform: "uppercase", color: "#94A3B8", letterSpacing: "0.08em", marginBottom: 10 }}>
                              Connect Your Tools
                            </p>
                            <div style={{ display: "flex", gap: 12 }}>
                              <IntegrationCard name="Yardi"    logoSrc="/yardi-logo.png"    connectState={yardiState}    onConnect={startConnect} />
                              <IntegrationCard name="AppFolio" logoSrc="/appfolio-logo.png" connectState={appfolioState} onConnect={startConnect} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>

                    </motion.div>
                  )}
                </AnimatePresence>

              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

export default Index;
