import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Upload, Image as ImageIcon, FileText, Mic, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

/* ─── Constants ──────────────────────────────────────────── */

const BUILDINGS = [
  {
    id: "abc",
    name: "ABC Condominium Association, Inc.",
    img: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop",
    address: "1234 Street, City",
    units: "113 units · 20 floors",
  },
  {
    id: "mariner",
    name: "The Grand Mariner",
    img: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=600&h=400&fit=crop",
    address: "123 Main Street, Toronto, ON",
    units: "85 units · 28 floors",
  },
  {
    id: "fairmont",
    name: "Fairmont Residences",
    img: "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=600&h=400&fit=crop",
    address: "456 Bay Street, Toronto, ON",
    units: "64 units · 15 floors",
  },
];

// Individual photo drop timing + horizontal offsets + real images
const PHOTO_TIMES   = [4200, 4550, 4900, 5250, 5600, 5950];
const PHOTO_OFFSETS = [-30, -15, 0, 15, -10, 20];
const PHOTO_URLS = [
  "https://images.unsplash.com/photo-1486718448742-163732cd1544?w=120&h=90&fit=crop",
  "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=120&h=90&fit=crop",
  "https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=120&h=90&fit=crop",
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=120&h=90&fit=crop",
  "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=120&h=90&fit=crop",
  "https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=120&h=90&fit=crop",
];

/* ─── Agent text (typewriter) ────────────────────────────── */

const AGENT_VISION    = "● Vision Agent — analyzing building components and extracting data...";
const AGENT_DOC       = "● Document Agent — extracting reserve fund data and specifications...";
const AGENT_AUDIO     = "● Audio Agent — transcribing site walkthrough notes and extracting insights...";
const AGENT_INGESTION = "● Ingestion Agent — all data extracted successfully ✓";

function computeAgent(e: number): { text: string; color: "gray" | "green"; phase: number } | null {
  if (e >= 10500) return { text: AGENT_INGESTION, color: "green", phase: 4 };
  if (e >= 9000) {
    const chars = Math.min(AGENT_AUDIO.length, Math.floor(((e - 9000) / 1500) * AGENT_AUDIO.length));
    return { text: AGENT_AUDIO.slice(0, chars), color: "gray", phase: 3 };
  }
  if (e >= 7200) {
    const chars = Math.min(AGENT_DOC.length, Math.floor(((e - 7200) / 1500) * AGENT_DOC.length));
    return { text: AGENT_DOC.slice(0, chars), color: "gray", phase: 2 };
  }
  if (e >= 4200) {
    const chars = Math.min(AGENT_VISION.length, Math.floor(((e - 4200) / 2000) * AGENT_VISION.length));
    return { text: AGENT_VISION.slice(0, chars), color: "gray", phase: 1 };
  }
  return null;
}

/* ─── Individual photo drop ghost ────────────────────────── */

const PhotoDrop = ({ animating, xOffset, src }: { animating: boolean; xOffset: number; src: string }) => {
  if (!animating) return null;
  return (
    <motion.div
      initial={{ y: 0, scale: 1, opacity: 1 }}
      animate={{
        y:       [0, 90, 90, 90, 90],
        scale:   [1, 1, 1.08, 1.0, 1.0],
        opacity: [1, 1, 1,    1,   0],
      }}
      transition={{ duration: 0.6, times: [0, 0.5, 0.625, 0.75, 1] }}
      style={{
        position: "absolute",
        top: -80,
        left: `calc(50% + ${xOffset}px - 32px)`,
        zIndex: 20,
        width: 64,
        height: 48,
        borderRadius: 4,
        border: "2px solid white",
        boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
        overflow: "hidden",
      }}
    >
      <img src={src} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
    </motion.div>
  );
};

/* ─── Single document/audio drop ghost ──────────────────── */

const SingleDrop = ({
  animating,
  icon,
  w,
  h,
}: {
  animating: boolean;
  icon: React.ReactNode;
  w: number;
  h: number;
}) => {
  if (!animating) return null;
  return (
    <div
      style={{
        position: "absolute",
        top: -80,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 20,
      }}
    >
      <motion.div
        initial={{ y: 0, scale: 1, opacity: 1 }}
        animate={{
          y:       [0, 90, 90, 90, 90],
          scale:   [1, 1, 1.08, 1.0, 1.0],
          opacity: [1, 1, 1,    1,   0],
        }}
        transition={{ duration: 0.6, times: [0, 0.5, 0.625, 0.75, 1] }}
        style={{
          width: w,
          height: h,
          borderRadius: 8,
          background: "white",
          border: "1px solid #E8EBF0",
          boxShadow: "0 4px 16px rgba(0,0,0,0.14)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </motion.div>
    </div>
  );
};

/* ─── File row ───────────────────────────────────────────── */

type FileEntry = {
  name: string;
  detail: string;
  iconBg: string;
  iconColor: string;
  IconComp: React.ElementType;
  visible: boolean;
  done: boolean;
};

const FileRow = ({ file }: { file: FileEntry }) => {
  const { IconComp } = file;
  return (
    <AnimatePresence>
      {file.visible && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "10px 0",
            borderBottom: "1px solid hsl(var(--border))",
          }}
        >
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: file.iconBg,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconComp size={16} style={{ color: file.iconColor }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "hsl(var(--heading))",
                marginBottom: 1,
              }}
            >
              {file.name}
            </p>
            <p style={{ fontSize: 11, color: "#9CA3B8" }}>{file.detail}</p>
          </div>
          {!file.done ? (
            <div
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                border: "2px solid hsl(var(--border))",
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
};

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
          : "✓ Connected"}
      </button>
    </motion.div>
  );
};

/* ─── Initial file list ──────────────────────────────────── */

const INITIAL_FILES: FileEntry[] = [
  {
    name: "6 building inspection photos",
    detail: "Images · 24.5 MB total",
    iconBg: "#EFF6FF",
    iconColor: "#3B82F6",
    IconComp: ImageIcon,
    visible: false,
    done: false,
  },
  {
    name: "existing-reserve-study.pdf",
    detail: "PDF document · 8.7 MB",
    iconBg: "#FEF2F2",
    iconColor: "#EF4444",
    IconComp: FileText,
    visible: false,
    done: false,
  },
  {
    name: "site-walkthrough-notes.m4a",
    detail: "Voice recording · 3.2 MB",
    iconBg: "#F3E8FF",
    iconColor: "#8B5CF6",
    IconComp: Mic,
    visible: false,
    done: false,
  },
];

/* ─── Page ───────────────────────────────────────────────── */

type Scene = "welcome" | "buildings" | "upload";

const Index = () => {
  const navigate = useNavigate();
  const integrationStarted = useRef(false);

  const [elapsed, setElapsed]               = useState(0);
  const [scene, setScene]                   = useState<Scene>("welcome");
  const [abcHighlighted, setAbcHighlighted] = useState(false);
  const [dzActive, setDzActive]             = useState(false);
  const [dzVisible, setDzVisible]           = useState(true);
  const [photosDropping, setPhotosDropping] = useState<boolean[]>(Array(6).fill(false));
  const [pdfDropping, setPdfDropping]       = useState(false);
  const [voiceDropping, setVoiceDropping]   = useState(false);
  const [files, setFiles]                   = useState<FileEntry[]>(INITIAL_FILES.map((f) => ({ ...f })));
  const [modalVisible, setModalVisible]     = useState(false);
  const [modalPhase, setModalPhase]         = useState<"prompt" | "integrating">("prompt");
  const [yardiState, setYardiState]         = useState<ConnectState>("idle");
  const [appfolioState, setAppfolioState]   = useState<ConnectState>("idle");
  const [setupComplete, setSetupComplete]   = useState(false);
  const [visitedItems, setVisitedItems]     = useState<string[]>([]);

  // Phase 5: integration sequence (fires on button click or auto at 14.5s)
  const startIntegration = useCallback(() => {
    if (integrationStarted.current) return;
    integrationStarted.current = true;
    setModalPhase("integrating");
    setTimeout(() => setYardiState("connecting"),                  300);
    setTimeout(() => setYardiState("connected"),                  1100);
    setTimeout(() => setAppfolioState("connecting"),              1500);
    setTimeout(() => setAppfolioState("connected"),               2300);
    setTimeout(() => setSetupComplete(true),                      3100);
    setTimeout(() => {
      setModalVisible(false);
      setVisitedItems(["overview"]);
      navigate("/inventory");
    }, 4600);
  }, [navigate]);

  const reset = useCallback(() => {
    integrationStarted.current = false;
    setElapsed(0);
    setScene("welcome");
    setAbcHighlighted(false);
    setDzActive(false);
    setDzVisible(true);
    setPhotosDropping(Array(6).fill(false));
    setPdfDropping(false);
    setVoiceDropping(false);
    setFiles(INITIAL_FILES.map((f) => ({ ...f })));
    setModalVisible(false);
    setModalPhase("prompt");
    setYardiState("idle");
    setAppfolioState("idle");
    setSetupComplete(false);
    setVisitedItems([]);
  }, []);

  // Timer
  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  // Animation sequence
  useEffect(() => {
    const e = elapsed;

    // Phase 1 → Phase 2: welcome exits at 0.9s
    if (e >= 900  && scene === "welcome")   setScene("buildings");
    // Phase 2 → Phase 3: buildings exits at 3.5s
    if (e >= 3500 && scene === "buildings") setScene("upload");

    // Building highlight at 2.8s
    if (e >= 2800) setAbcHighlighted(true);

    // Drop zone activates at 4.2s
    if (e >= 4200) setDzActive(true);

    // Individual photo drops — fire each once in a 30ms window
    PHOTO_TIMES.forEach((t, i) => {
      if (e >= t && e < t + 30) {
        setPhotosDropping((prev) => { const n = [...prev]; n[i] = true; return n; });
        setTimeout(() => setPhotosDropping((prev) => { const n = [...prev]; n[i] = false; return n; }), 650);
      }
    });

    // PDF drop at 7.2s
    if (e >= 7200 && e < 7230) {
      setPdfDropping(true);
      setTimeout(() => setPdfDropping(false), 650);
    }

    // Voice drop at 9s
    if (e >= 9000 && e < 9030) {
      setVoiceDropping(true);
      setTimeout(() => setVoiceDropping(false), 650);
    }

    // File items: appear + checkmark
    if (e >= 6300) setFiles((f) => f.map((r, i) => (i === 0 ? { ...r, visible: true } : r)));
    if (e >= 6900) setFiles((f) => f.map((r, i) => (i === 0 ? { ...r, done: true }    : r)));
    if (e >= 7600) setFiles((f) => f.map((r, i) => (i === 1 ? { ...r, visible: true } : r)));
    if (e >= 8200) setFiles((f) => f.map((r, i) => (i === 1 ? { ...r, done: true }    : r)));
    if (e >= 9400) setFiles((f) => f.map((r, i) => (i === 2 ? { ...r, visible: true } : r)));
    if (e >= 10000) setFiles((f) => f.map((r, i) => (i === 2 ? { ...r, done: true }   : r)));

    // Drop zone shrinks out at 10.8s
    if (e >= 10800) setDzVisible(false);

    // Integration modal appears at 11.5s
    if (e >= 11500) setModalVisible(true);

    // Auto-trigger integration at 14.5s (3s after modal appears)
    if (e >= 14500) startIntegration();

  }, [elapsed, scene, startIntegration]);

  const agent = computeAgent(elapsed);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeItem="overview" visitedItems={visitedItems} />

      {/* Main content — position:relative so modal backdrop is contained here */}
      <main className="flex-1" style={{ marginLeft: 260, position: "relative", overflow: "hidden" }}>

        {/* ── Integration modal + backdrop (covers main only, not sidebar) ── */}
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

                  {/* ── Prompt phase ── */}
                  {modalPhase === "prompt" && (
                    <motion.div
                      key="prompt"
                      exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    >
                      {/* Green checkmark circle */}
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

                      <p
                        style={{
                          fontSize: 20,
                          fontWeight: 700,
                          color: "#0F1729",
                          textAlign: "center",
                          marginBottom: 8,
                        }}
                      >
                        Building data ready.
                      </p>
                      <p
                        style={{
                          fontSize: 13,
                          color: "#5A6178",
                          textAlign: "center",
                          marginBottom: 20,
                        }}
                      >
                        Connect your property management tools to sync live data automatically.
                      </p>

                      <div style={{ height: 1, background: "#E8EBF0", marginBottom: 16 }} />

                      {/* Logo previews */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "center",
                          gap: 12,
                          marginBottom: 20,
                        }}
                      >
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

                  {/* ── Integration phase ── */}
                  {modalPhase === "integrating" && (
                    <motion.div
                      key="integrating"
                      initial={{ opacity: 0, transition: { duration: 0.2 } }}
                      animate={{ opacity: 1, transition: { duration: 0.2 } }}
                    >
                      <p
                        style={{
                          fontSize: 16,
                          fontWeight: 600,
                          color: "#0F1729",
                          textAlign: "center",
                          marginBottom: 16,
                        }}
                      >
                        Connecting your tools...
                      </p>

                      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
                        <IntegrationCard
                          name="Yardi"
                          logoSrc="/yardi-logo.png"
                          connectState={yardiState}
                        />
                        <IntegrationCard
                          name="AppFolio"
                          logoSrc="/appfolio-logo.png"
                          connectState={appfolioState}
                        />
                      </div>

                      <AnimatePresence>
                        {setupComplete && (
                          <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            style={{
                              fontSize: 13,
                              color: "#10B981",
                              textAlign: "center",
                              margin: 0,
                            }}
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
        <div className="mx-auto" style={{ maxWidth: 1200, padding: 60 }}>
          <TopBar onReplay={reset} activeItem="overview" />

          {/* Agent status strip — typewriter */}
          <div style={{ height: 32, marginBottom: 16, display: "flex", alignItems: "center" }}>
            <AnimatePresence mode="wait">
              {agent && (
                <motion.p
                  key={agent.phase}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    color: agent.color === "green" ? "#10B981" : "#8B92A8",
                  }}
                >
                  {agent.text}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* ── Scenes ── */}
          <AnimatePresence mode="wait">

            {/* SCENE 1: Welcome */}
            {scene === "welcome" && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.15 } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "calc(100vh - 220px)",
                  textAlign: "center",
                }}
              >
                <h1
                  style={{
                    fontSize: 32,
                    fontWeight: 700,
                    color: "#0F1729",
                    marginBottom: 12,
                  }}
                >
                  Welcome to RECOstudy
                </h1>
                <p style={{ fontSize: 16, color: "#5A6178" }}>
                  Automated reserve fund studies, powered by AI.
                </p>
              </motion.div>
            )}

            {/* SCENE 2: Building selection */}
            {scene === "buildings" && (
              <motion.div
                key="buildings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, transition: { duration: 0.25 } }}
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
                style={{ maxWidth: 800, margin: "0 auto" }}
              >
                <p
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "hsl(var(--heading))",
                    marginBottom: 6,
                  }}
                >
                  Your Buildings
                </p>
                <p style={{ fontSize: 14, color: "#5A6178", marginBottom: 24 }}>
                  Select a building to view its dashboard.
                </p>

                <div style={{ display: "flex", gap: 20 }}>
                  {BUILDINGS.map((b, i) => {
                    const isABC  = b.id === "abc";
                    const active = isABC && abcHighlighted;
                    return (
                      <motion.div
                        key={b.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut", delay: i * 0.1 }}
                        style={{
                          flex: 1,
                          borderRadius: 12,
                          border: active ? "2px solid #4F6BFF" : "1px solid #E8EBF0",
                          background: "hsl(var(--card))",
                          overflow: "hidden",
                          boxShadow: active
                            ? "0 0 0 4px rgba(79,107,255,0.15), 0 2px 8px rgba(0,0,0,0.06)"
                            : "0 1px 4px rgba(0,0,0,0.06)",
                          transform: active ? "scale(1.02)" : "scale(1)",
                          transition:
                            "border-color 0.3s ease, box-shadow 0.3s ease, transform 0.3s ease",
                        }}
                      >
                        <img
                          src={b.img}
                          alt={b.name}
                          style={{
                            width: "100%",
                            height: 180,
                            objectFit: "cover",
                            display: "block",
                            borderRadius: "12px 12px 0 0",
                          }}
                        />
                        <div style={{ padding: "12px 14px 14px" }}>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: 600,
                              color: "hsl(var(--heading))",
                              marginBottom: 5,
                              lineHeight: 1.3,
                            }}
                          >
                            {b.name}
                          </p>
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              marginBottom: 3,
                            }}
                          >
                            <MapPin size={12} style={{ color: "#9CA3B8", flexShrink: 0 }} />
                            <p style={{ fontSize: 13, color: "#5A6178" }}>{b.address}</p>
                          </div>
                          <p style={{ fontSize: 12, color: "#9CA3B8" }}>{b.units}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* SCENE 3: Upload + file list */}
            {scene === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.25 } }}
                style={{ maxWidth: 800, margin: "0 auto" }}
              >
                {/* Header */}
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "hsl(var(--heading))",
                    marginBottom: 4,
                  }}
                >
                  ABC Condominium Association, Inc.
                </p>
                <p
                  style={{
                    fontSize: 22,
                    fontWeight: 700,
                    color: "hsl(var(--heading))",
                    marginBottom: 20,
                  }}
                >
                  Upload building data
                </p>

                {/* Drop zone area with photo/pdf/voice ghosts */}
                <div style={{ position: "relative" }}>
                  {/* 6 individual photo drops */}
                  {PHOTO_TIMES.map((_, i) => (
                    <PhotoDrop
                      key={i}
                      animating={photosDropping[i]}
                      xOffset={PHOTO_OFFSETS[i]}
                      src={PHOTO_URLS[i]}
                    />
                  ))}

                  {/* PDF drop */}
                  <SingleDrop
                    animating={pdfDropping}
                    icon={<FileText size={28} style={{ color: "#EF4444" }} />}
                    w={70}
                    h={85}
                  />

                  {/* Voice drop */}
                  <SingleDrop
                    animating={voiceDropping}
                    icon={<Mic size={28} style={{ color: "#8B5CF6" }} />}
                    w={70}
                    h={50}
                  />

                  {/* Drop zone — shrinks out at 10.8s */}
                  <AnimatePresence>
                    {dzVisible && (
                      <motion.div
                        exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.35, ease: "easeInOut" } }}
                        style={{
                          width: "100%",
                          height: 200,
                          borderRadius: 16,
                          border: dzActive ? "2px solid #4F6BFF" : "2px dashed #D1D5DB",
                          background: dzActive ? "rgba(79,107,255,0.04)" : "#FAFBFD",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 8,
                          transition: "border-color 0.3s ease, background 0.3s ease",
                        }}
                      >
                        <Upload size={36} style={{ color: "#9CA3B8" }} />
                        <p style={{ fontSize: 14, color: "#9CA3B8" }}>Drop files here</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* File list */}
                <div
                  style={{
                    marginTop: 12,
                    borderRadius: 12,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    padding: "0 16px",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  {files.map((file) => (
                    <FileRow key={file.name} file={file} />
                  ))}
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
