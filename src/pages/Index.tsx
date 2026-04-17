import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, Image as ImageIcon, FileText, Check, Eye, ShieldCheck, Video } from "lucide-react";
import Sidebar from "@/components/Sidebar";

/* ─── Timing (ms) ──────────────────────────────────────────── */

const UPLOAD_START = 1500;

const PHOTO_SLIDE_STARTS = [400, 700, 1000, 1300, 1600, 1900];
const PHOTO_URLS = [
  "/suspended-slab-waterproofing.png",
  "/parkade-roof-deck.png",
  "/exterior-windows-aluminum.png",
  "/elevator-machinery-townhouse.png",
  "/roofing-inverted.png",
  "/building-corridor.png",
];
const PHOTO_POSITIONS = [
  { top: 4,  left: "calc(50% - 136px)" },
  { top: 4,  left: "calc(50% - 44px)"  },
  { top: 4,  left: "calc(50% + 48px)"  },
  { top: 88, left: "calc(50% - 136px)" },
  { top: 88, left: "calc(50% - 44px)"  },
  { top: 88, left: "calc(50% + 48px)"  },
];

const PDF_DOC_APPEARS = [4600, 5100, 5600, 6100];
const PDF_DOCS = [
  "Financial Statement.pdf",
  "Reserve Study.pdf",
  "Meeting Minutes.pdf",
  "Audit Report.pdf",
];

const FILE_TIMES = {
  photos: { appear: 2500, done: 4100 },
  pdfs:   { appear: 4600, done: 7000 },
  voice:  { appear: 7500, done: 9100 },
};

const DZ_FADE = 9800;

// Agents activate alongside their matching file
const VISION_START = FILE_TIMES.photos.done + 200;   // 4300
const VISION_DUR   = 3200;
const VISION_END   = VISION_START + VISION_DUR;       // 7500

const DOC_START = FILE_TIMES.pdfs.done + 200;         // 7200
const DOC_DUR   = 3200;
const DOC_END   = DOC_START + DOC_DUR;                // 10400

const AUDIO_START = FILE_TIMES.voice.done + 200;      // 9300
const AUDIO_DUR   = 3200;
const AUDIO_END   = AUDIO_START + AUDIO_DUR;          // 12500

const QA_START = Math.max(VISION_END, DOC_END, AUDIO_END) + 500; // 12900 (after all 3 done)
const QA_DUR   = 3800;
const QA_END   = QA_START + QA_DUR;                   // 16700

const COMPLETION_AT    = QA_END + 400;                // 17100
const BUTTON_APPEAR_AT = COMPLETION_AT + 1800;        // 18900

/* ─── File Row ─────────────────────────────────────────────── */

const FileRow = ({
  visible, done, name, detail, IconComp,
}: {
  visible: boolean; done: boolean; name: string; detail: string; IconComp: React.ElementType;
}) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ x: -16, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: "white", borderRadius: 10, border: "1px solid #E5E7EB" }}
      >
        <div style={{ width: 36, height: 36, borderRadius: 8, background: "#F5F5F5", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <IconComp size={20} style={{ color: "#2E1A47" }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: 18, fontWeight: 500, color: "#2E1A47", marginBottom: 1 }}>{name}</p>
          <p style={{ fontSize: 15, color: "#94A3B8" }}>{detail}</p>
        </div>
        {!done ? (
          <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #E5E7EB", borderTopColor: "#2E1A47", flexShrink: 0, animation: "spin 0.8s linear infinite" }} />
        ) : (
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}
            style={{ width: 22, height: 22, borderRadius: "50%", background: "#2E1A47", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Check size={13} color="white" />
          </motion.div>
        )}
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─── PDF Group Row — icon stack only ─────────────────────── */

const PdfGroupRow = ({ visible, done, docAppears }: { visible: boolean; done: boolean; docAppears: boolean[] }) => (
  <AnimatePresence>
    {visible && (
      <motion.div
        initial={{ x: -16, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: "white", borderRadius: 10, border: "1px solid #E5E7EB" }}
      >
        {/* Stacked PDF icon */}
        <div style={{ position: "relative", width: 46, height: 52, flexShrink: 0 }}>
          {[2, 1, 0].map((offset) => (
            <div key={offset} style={{ position: "absolute", top: offset * 3, left: offset * 3, width: 36, height: 46, borderRadius: 5, background: "white", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden" }}>
              <div style={{ position: "absolute", top: 0, right: 0, width: 9, height: 9, background: "#F1F5F9", borderLeft: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB", borderBottomLeftRadius: 3 }} />
              <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 13, background: "#E53E3E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontSize: 7, fontWeight: 800, color: "white", letterSpacing: "0.06em" }}>PDF</span>
              </div>
            </div>
          ))}
        </div>
        {/* Doc names appear one by one */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {PDF_DOCS.map((doc, i) => (
            <AnimatePresence key={doc}>
              {docAppears[i] && (
                <motion.p initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}
                  style={{ fontSize: 15, color: "#64748B", margin: "0 0 2px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {doc}
                </motion.p>
              )}
            </AnimatePresence>
          ))}
        </div>
        {/* Spinner / check */}
        <div style={{ flexShrink: 0 }}>
          {!done ? (
            <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #E5E7EB", borderTopColor: "#2E1A47", animation: "spin 0.8s linear infinite" }} />
          ) : (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}
              style={{ width: 22, height: 22, borderRadius: "50%", background: "#2E1A47", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Check size={13} color="white" />
            </motion.div>
          )}
        </div>
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─── Side Agent Panel ─────────────────────────────────────── */

const SideAgentPanel = ({
  name, Icon, color, progress, observations, visible, filename,
}: {
  name: string; Icon: React.ElementType; color: string;
  progress: number; observations: readonly string[]; visible: boolean; filename?: string;
}) => {
  const complete = progress >= 1;
  if (!visible) return <div style={{ flex: 1 }} />;
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 14 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          borderRadius: 10,
          border: `1px solid ${color}22`,
          borderLeft: `3px solid ${color}`,
          background: complete ? "#FAFAFA" : "#FFFFFF",
          padding: "12px 14px",
          height: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: complete ? 0 : 10 }}>
          <Icon size={16} style={{ color, flexShrink: 0 }} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: "#1E293B" }}>{name}</span>
            {filename && <p style={{ fontSize: 12, color: "#94A3B8", margin: 0, marginTop: 1 }}>{filename}</p>}
          </div>
          {complete ? (
            <span style={{ fontSize: 13, color: "#22C55E", fontWeight: 600 }}>✓ Done</span>
          ) : (
            <motion.span
              animate={{ opacity: [1, 0.4, 1] }}
              transition={{ duration: 1.2, repeat: Infinity }}
              style={{ fontSize: 13, color, fontWeight: 500 }}
            >
              Scanning...
            </motion.span>
          )}
        </div>

        {!complete && (
          <>
            {/* Progress bar */}
            <div style={{ width: "100%", height: 2, background: "#E5E7EB", borderRadius: 1, overflow: "hidden", marginBottom: 10 }}>
              <motion.div
                style={{ height: "100%", background: color, borderRadius: 1 }}
                animate={{ width: `${Math.min(progress * 100, 100)}%` }}
                transition={{ duration: 0.15, ease: "linear" }}
              />
            </div>
            {/* Observations */}
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#64748B", lineHeight: 1.75 }}>
              {observations.map((obs, i) => (
                <div key={i} style={{ opacity: progress >= [0.3, 0.62, 0.9][i] ? 1 : 0, transition: "opacity 0.5s ease" }}>
                  {obs}
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

/* ─── QA Panel (full-width, sweep animation) ───────────────── */

const QA_OBS = [
  "→ Cross-referencing photos vs. document findings...",
  "→ Vision + Document aligned: elevator cab flagged in both",
  "→ Audio confirms rooftop wear — matching reserve study entry",
  "→ 24 components catalogued — 3 flagged — no conflicts detected",
] as const;

const QaPanel = ({ progress, visible }: { progress: number; visible: boolean }) => {
  if (!visible) return null;
  const complete = progress >= 1;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      style={{
        borderRadius: 12,
        border: "1px solid #10B98128",
        borderLeft: "3px solid #10B981",
        background: complete ? "#F0FDF4" : "#FAFFFE",
        padding: "16px 18px",
        position: "relative",
        overflow: "hidden",
        marginTop: 12,
      }}
    >
      {/* Sweep glow */}
      {!complete && (
        <motion.div
          animate={{ x: ["-120%", "120%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          style={{
            position: "absolute", top: 0, bottom: 0, width: "45%",
            background: "linear-gradient(90deg, transparent, rgba(16,185,129,0.07), rgba(16,185,129,0.13), rgba(16,185,129,0.07), transparent)",
            pointerEvents: "none",
          }}
        />
      )}

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <ShieldCheck size={19} style={{ color: "#10B981", flexShrink: 0 }} />
        <span style={{ fontSize: 17, fontWeight: 700, color: "#1E293B", flex: 1 }}>QA Agent</span>
        {/* Source indicators */}
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          {[
            { label: "Photos",    color: "#6366F1", at: 0.15 },
            { label: "Documents", color: "#0EA5E9", at: 0.35 },
            { label: "Video",     color: "#8B5CF6", at: 0.55 },
          ].map((src) => (
            <div key={src.label} style={{ display: "flex", alignItems: "center", gap: 5 }}>
              <motion.div
                animate={{ opacity: progress >= src.at ? 1 : 0.25, scale: progress >= src.at ? [1, 1.4, 1] : 1 }}
                transition={{ duration: 0.4 }}
                style={{ width: 7, height: 7, borderRadius: "50%", background: src.color }}
              />
              <span style={{ fontSize: 13, color: progress >= src.at ? "#334155" : "#CBD5E1", transition: "color 0.3s" }}>
                {src.label}
              </span>
            </div>
          ))}
        </div>
        {complete ? (
          <span style={{ fontSize: 14, color: "#22C55E", fontWeight: 700, marginLeft: 8 }}>✓ Validated</span>
        ) : (
          <motion.span
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            style={{ fontSize: 13, color: "#10B981", fontWeight: 500, marginLeft: 8, whiteSpace: "nowrap" }}
          >
            Scanning for conflicts...
          </motion.span>
        )}
      </div>

      {/* Progress bar */}
      <div style={{ width: "100%", height: 3, background: "#D1FAE5", borderRadius: 2, overflow: "hidden", marginBottom: 12 }}>
        <motion.div
          style={{ height: "100%", background: "#10B981", borderRadius: 2 }}
          animate={{ width: `${Math.min(progress * 100, 100)}%` }}
          transition={{ duration: 0.15, ease: "linear" }}
        />
      </div>

      {/* Observations */}
      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, color: "#334155", lineHeight: 1.9 }}>
        {QA_OBS.map((obs, i) => (
          <div key={i} style={{ opacity: progress >= [0.2, 0.45, 0.68, 0.88][i] ? 1 : 0, transition: "opacity 0.5s ease" }}>
            {obs}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

/* ─── Integration Card ─────────────────────────────────────── */

type ConnectState = "idle" | "connecting" | "connected";

const IntegrationCard = ({
  name, logoSrc, connectState, onConnect,
}: {
  name: string; logoSrc: string; connectState: ConnectState; onConnect?: () => void;
}) => {
  const btnStyle: React.CSSProperties =
    connectState === "connected"
      ? { height: 40, padding: "0 20px", background: "#ECFDF5", border: "1px solid #BBF7D0", color: "#15803D", borderRadius: 6, fontSize: 18, fontWeight: 500, cursor: "default" }
      : connectState === "connecting"
      ? { height: 40, padding: "0 20px", background: "#4D6BA9", border: "1px solid #4D6BA9", color: "white", borderRadius: 6, fontSize: 18, fontWeight: 500, cursor: "default", display: "flex", alignItems: "center", gap: 6 }
      : { height: 40, padding: "0 20px", background: "white", border: "1px solid #E5E7EB", color: "#334155", borderRadius: 6, fontSize: 18, fontWeight: 500, cursor: "pointer" };

  return (
    <motion.div
      animate={{ scale: connectState === "connected" ? [1, 1.015, 1] : 1 }}
      transition={{ duration: 0.3 }}
      style={{ flex: 1, borderRadius: 10, border: "1px solid #E5E7EB", background: "#FFFFFF", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 16, gap: 8 }}
    >
      <img src={logoSrc} alt={name} style={{ width: 52, height: 52, borderRadius: 6, objectFit: "contain" }} />
      <p style={{ fontSize: 20, fontWeight: 500, color: "#2E1A47", margin: 0 }}>{name}</p>
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
  const pdfsVisible       = t >= FILE_TIMES.pdfs.appear;
  const pdfsDone          = t >= FILE_TIMES.pdfs.done;
  const pdfDocAppears     = PDF_DOC_APPEARS.map((ts) => t >= ts);
  const voiceFileVisible  = t >= FILE_TIMES.voice.appear;
  const voiceFileDone     = t >= FILE_TIMES.voice.done;

  const prog = (start: number, dur: number) =>
    t < start ? 0 : Math.min((t - start) / dur, 1);

  const visionProgress = prog(VISION_START, VISION_DUR);
  const docProgress    = prog(DOC_START,    DOC_DUR);
  const audioProgress  = prog(AUDIO_START,  AUDIO_DUR);
  const qaProgress     = prog(QA_START,     QA_DUR);

  const showCompletion = t >= COMPLETION_AT;
  const showButton     = t >= BUTTON_APPEAR_AT;

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

        {/* ── Upload scene ── */}
        <div style={{ maxWidth: 920, margin: "0 auto", padding: "48px 36px" }}>

          {/* Replay button */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 24 }}>
            <button onClick={reset} style={{ background: "transparent", border: "1px solid #E5E7EB", borderRadius: 6, padding: "6px 14px", fontSize: 14, color: "#94A3B8", cursor: "pointer" }}>
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
                      style={{ position: "relative", width: "100%", height: 228, borderRadius: 12, border: "1px dashed #C0C0C0", background: "#FAFAFA", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 16 }}
                    >
                      <Upload size={36} style={{ color: "#C0C0C0" }} />
                      <p style={{ fontSize: 18, color: "#94A3B8" }}>Drop files here</p>

                      {PHOTO_URLS.map((url, i) => {
                        if (!photoVisible[i]) return null;
                        const pos = PHOTO_POSITIONS[i];
                        return (
                          <motion.div key={`photo-${i}`}
                            initial={{ x: -1500, opacity: 0 }}
                            animate={{ x: 0, opacity: 1, scale: [1, 1, 1.03, 1] }}
                            transition={{ x: { duration: 0.8, ease: "easeOut" }, opacity: { duration: 0.8 }, scale: { duration: 0.3, delay: 0.8 } }}
                            style={{ position: "absolute", top: pos.top, left: pos.left, width: 88, height: 76, borderRadius: 8, border: "2px solid white", boxShadow: "0 4px 16px rgba(0,0,0,0.12)", overflow: "hidden", zIndex: 5 }}
                          >
                            <img src={url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          </motion.div>
                        );
                      })}

                      {/* PDF stack */}
                      {pdfsVisible && (
                        <motion.div initial={{ x: -1500, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}
                          style={{ position: "absolute", bottom: 10, left: "calc(50% - 160px)", zIndex: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}
                        >
                          <div style={{ position: "relative", width: 46, height: 58 }}>
                            {[2, 1, 0].map((offset) => (
                              <div key={offset} style={{ position: "absolute", top: offset * 3, left: offset * 3, width: 40, height: 50, borderRadius: 5, background: "white", border: "1px solid #E5E7EB", boxShadow: "0 2px 6px rgba(0,0,0,0.10)", overflow: "hidden" }}>
                                <div style={{ position: "absolute", top: 0, right: 0, width: 10, height: 10, background: "#F1F5F9", borderLeft: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB", borderBottomLeftRadius: 3 }} />
                                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 14, background: "#E53E3E", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                  <span style={{ fontSize: 8, fontWeight: 800, color: "white", letterSpacing: "0.06em" }}>PDF</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}

                      {/* MP4 icon */}
                      {voiceFileVisible && (
                        <motion.div initial={{ x: -1500, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.8, ease: "easeOut" }}
                          style={{ position: "absolute", bottom: 10, left: "calc(50% + 50px)", zIndex: 6, display: "flex", flexDirection: "column", alignItems: "center", gap: 5 }}
                        >
                          <div style={{ width: 40, height: 50, borderRadius: 5, background: "white", border: "1px solid #E5E7EB", boxShadow: "0 2px 6px rgba(0,0,0,0.10)", overflow: "hidden", position: "relative" }}>
                            <div style={{ position: "absolute", top: 0, right: 0, width: 10, height: 10, background: "#F1F5F9", borderLeft: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB", borderBottomLeftRadius: 3 }} />
                            <div style={{ position: "absolute", top: 10, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                              <Video size={14} style={{ color: "#94A3B8" }} />
                            </div>
                            <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 14, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <span style={{ fontSize: 8, fontWeight: 800, color: "white", letterSpacing: "0.06em" }}>MP4</span>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* ── Two-column: files left · agents right ── */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>

                  {/* Photos row */}
                  <FileRow visible={photosFileVisible} done={photosFileDone} name="6 building inspection photos" detail="Images · 24.5 MB" IconComp={ImageIcon} />
                  <SideAgentPanel
                    name="Vision Agent" Icon={Eye} color="#6366F1"
                    progress={visionProgress} visible={t >= VISION_START}
                    observations={[
                      "→ Scanning 6 inspection images...",
                      "→ Facade, HVAC, elevator shaft detected",
                      "→ Spalling flagged on east elevation",
                    ]}
                  />

                  {/* PDFs row */}
                  <PdfGroupRow visible={pdfsVisible} done={pdfsDone} docAppears={pdfDocAppears} />
                  <SideAgentPanel
                    name="Document Agent" Icon={FileText} color="#0EA5E9"
                    progress={docProgress} visible={t >= DOC_START}
                    observations={[
                      "→ Parsing 4 documents...",
                      "→ Reserve balance: $2,064,255",
                      "→ 10 components near end of life",
                    ]}
                  />

                  {/* Video row — icon only */}
                  <AnimatePresence>
                    {voiceFileVisible && (
                      <motion.div initial={{ x: -16, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.5, ease: "easeOut" }}
                        style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 14px", background: "white", borderRadius: 10, border: "1px solid #E5E7EB" }}>
                        {/* MP4 file icon */}
                        <div style={{ width: 36, height: 46, borderRadius: 5, background: "white", border: "1px solid #E5E7EB", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", overflow: "hidden", position: "relative", flexShrink: 0 }}>
                          <div style={{ position: "absolute", top: 0, right: 0, width: 9, height: 9, background: "#F1F5F9", borderLeft: "1px solid #E5E7EB", borderBottom: "1px solid #E5E7EB", borderBottomLeftRadius: 3 }} />
                          <div style={{ position: "absolute", top: 8, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
                            <Video size={14} style={{ color: "#94A3B8" }} />
                          </div>
                          <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 13, background: "#2563EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ fontSize: 7, fontWeight: 800, color: "white", letterSpacing: "0.06em" }}>MP4</span>
                          </div>
                        </div>
                        <p style={{ fontSize: 15, color: "#64748B", margin: 0, flex: 1 }}>site-walkthrough.mp4</p>
                        <div style={{ flexShrink: 0 }}>
                          {!voiceFileDone ? (
                            <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid #E5E7EB", borderTopColor: "#2E1A47", animation: "spin 0.8s linear infinite" }} />
                          ) : (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ duration: 0.3 }}
                              style={{ width: 22, height: 22, borderRadius: "50%", background: "#2E1A47", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Check size={13} color="white" />
                            </motion.div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <SideAgentPanel
                    name="Video Agent" Icon={Video} color="#8B5CF6"
                    progress={audioProgress} visible={t >= AUDIO_START}

                    observations={[
                      "→ Transcribing 4m 32s walkthrough...",
                      "→ Rooftop membrane: last serviced 2019",
                      "→ Parkade slab cracking confirmed",
                    ]}
                  />
                </div>

                {/* ── QA Agent — full width, sweep ── */}
                <QaPanel progress={qaProgress} visible={t >= QA_START} />

                {/* Completion + connect */}
                <AnimatePresence>
                  {showCompletion && (
                    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
                      style={{ display: "flex", alignItems: "center", gap: 10, background: "#F0FDF4", border: "1px solid #BBF7D0", borderRadius: 8, padding: "10px 16px", marginTop: 16, marginBottom: 20 }}
                    >
                      <div style={{ width: 7, height: 7, borderRadius: "50%", background: "#22C55E", flexShrink: 0 }} />
                      <span style={{ fontSize: 17, fontWeight: 600, color: "#15803D" }}>
                        QA Agent: all data validated — 24 components catalogued
                      </span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {showButton && !showIntegrations && (
                    <motion.div key="connect-btn" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}>
                      <button onClick={handleConnectButtonClick}
                        style={{ width: "100%", padding: "18px 0", background: "#0A0A0A", color: "#FFFFFF", border: "none", borderRadius: 999, fontSize: 20, fontWeight: 600, cursor: "pointer" }}>
                        Connect to property management tools &rarr;
                      </button>
                      <p style={{ fontSize: 17, color: "#94A3B8", textAlign: "center", marginTop: 10 }}>
                        Sync with AppFolio, Yardi, or Buildium
                      </p>
                    </motion.div>
                  )}

                  {showIntegrations && (
                    <motion.div key="integrations" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
                      <p style={{ fontSize: 15, textTransform: "uppercase", color: "#94A3B8", letterSpacing: "0.08em", marginBottom: 10 }}>
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
        </div>
      </main>
    </div>
  );
};

export default Index;
