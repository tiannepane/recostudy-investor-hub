import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Upload, Image as ImageIcon, FileText, Mic, Camera, Check } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

/* ─── Constants ─────────────────────────────────────────── */

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

// Photo fan offsets for the 6-photo stack
const FAN_ROTATIONS = [-8, -4, -1, 2, 5, 9];
const FAN_X_OFFSETS = [-28, -14, -4, 6, 16, 26];

/* ─── Agent message strip ───────────────────────────────── */

type AgentMsg = { text: string; color: "gray" | "green" };

function getAgentMsg(elapsed: number): AgentMsg | null {
  if (elapsed >= 13500) return { text: "● Ingestion Agent — all sources connected ✓", color: "green" };
  if (elapsed >= 9000)  return { text: "● Ingestion Agent — all files processed ✓", color: "green" };
  if (elapsed >= 8000)  return { text: "● Audio Agent — transcribing site walkthrough notes...", color: "gray" };
  if (elapsed >= 7000)  return { text: "● Document Agent — extracting reserve fund data...", color: "gray" };
  if (elapsed >= 5500)  return { text: "● Vision Agent — analyzing building components...", color: "gray" };
  return null;
}

/* ─── Drop ghost: photo stack ────────────────────────────── */

const PhotoStack = ({ animating }: { animating: boolean }) => (
  <AnimatePresence>
    {animating && (
      <motion.div
        key="photostack"
        style={{
          position: "absolute",
          top: -80,
          left: "50%",
          zIndex: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {FAN_ROTATIONS.map((rot, i) => (
          <motion.div
            key={i}
            initial={{
              x: FAN_X_OFFSETS[i] - 30,
              y: -20,
              rotate: rot * 1.5,
              opacity: 1,
              scale: 1,
            }}
            animate={[
              // Fall phase
              {
                x: FAN_X_OFFSETS[i],
                y: 60,
                rotate: rot * 0.4,
                opacity: 1,
                scale: 1,
                transition: { duration: 0.45, ease: [0.4, 0, 1, 1], delay: i * 0.02 },
              },
              // Fan out briefly
              {
                x: FAN_X_OFFSETS[i] * 1.5,
                y: 65,
                rotate: rot,
                scale: 1.05,
                opacity: 1,
                transition: { duration: 0.15, ease: "easeOut" },
              },
              // Collapse + vanish
              {
                x: 0,
                y: 65,
                rotate: 0,
                scale: 0,
                opacity: 0,
                transition: { duration: 0.2, ease: "easeIn" },
              },
            ]}
            style={{
              position: "absolute",
              width: 60,
              height: 45,
              borderRadius: 4,
              background: "#E2E8F0",
              border: "2px solid white",
              boxShadow: "0 2px 8px rgba(0,0,0,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transformOrigin: "center bottom",
            }}
          >
            <Camera size={14} style={{ color: "#94A3B8" }} />
          </motion.div>
        ))}
      </motion.div>
    )}
  </AnimatePresence>
);

/* ─── Drop ghost: single card ───────────────────────────── */

const SingleDrop = ({
  animating,
  icon,
}: {
  animating: boolean;
  icon: React.ReactNode;
}) => (
  <AnimatePresence>
    {animating && (
      <motion.div
        key="singledrop"
        initial={{ y: -80, x: "-50%", opacity: 1, scale: 1, rotate: -3 }}
        animate={[
          {
            y: 30,
            x: "-50%",
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: { duration: 0.4, ease: [0.4, 0, 1, 1] },
          },
          {
            y: 30,
            x: "-50%",
            scale: 1.05,
            opacity: 1,
            rotate: 0,
            transition: { duration: 0.15, ease: "easeOut" },
          },
          {
            y: 30,
            x: "-50%",
            scale: 0,
            opacity: 0,
            rotate: 0,
            transition: { duration: 0.18, ease: "easeIn" },
          },
        ]}
        style={{
          position: "absolute",
          top: -80,
          left: "50%",
          zIndex: 20,
          width: 70,
          height: 90,
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
    )}
  </AnimatePresence>
);

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
            padding: "9px 0",
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
            <p style={{ fontSize: 13, fontWeight: 500, color: "hsl(var(--heading))", marginBottom: 1 }}>
              {file.name}
            </p>
            <p style={{ fontSize: 11, color: "#9CA3B8" }}>{file.detail}</p>
          </div>
          {/* Spinner or checkmark */}
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
    connectState === "idle"
      ? {
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
          background: "#ECFDF5",
          border: "1px solid #A7F3D0",
          color: "#10B981",
          borderRadius: 6,
          fontSize: 12,
          fontWeight: 500,
          cursor: "default",
          transition: "all 0.3s ease",
        };

  return (
    <motion.div
      animate={{
        scale: connectState === "connected" ? [1, 1.015, 1] : 1,
      }}
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
        style={{
          width: 40,
          height: 40,
          borderRadius: 8,
          objectFit: "contain",
        }}
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

/* ─── Page ───────────────────────────────────────────────── */

type Scene = "welcome" | "buildings" | "upload";

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

const Index = () => {
  const [elapsed, setElapsed] = useState(0);
  const [scene, setScene] = useState<Scene>("welcome");
  const [abcHighlighted, setAbcHighlighted] = useState(false);
  const [dzActive, setDzActive] = useState(false);
  const [photoDropping, setPhotoDropping] = useState(false);
  const [pdfDropping, setPdfDropping] = useState(false);
  const [voiceDropping, setVoiceDropping] = useState(false);
  const [files, setFiles] = useState<FileEntry[]>(INITIAL_FILES);
  const [yardiState, setYardiState] = useState<ConnectState>("idle");
  const [appfolioState, setAppfolioState] = useState<ConnectState>("idle");
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [visitedItems, setVisitedItems] = useState<string[]>([]);

  const agentMsg = getAgentMsg(elapsed);

  const reset = useCallback(() => {
    setElapsed(0);
    setScene("welcome");
    setAbcHighlighted(false);
    setDzActive(false);
    setPhotoDropping(false);
    setPdfDropping(false);
    setVoiceDropping(false);
    setFiles(INITIAL_FILES.map((f) => ({ ...f })));
    setYardiState("idle");
    setAppfolioState("idle");
    setShowIntegrations(false);
    setVisitedItems([]);
  }, []);

  // Timer
  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  // Sequence
  useEffect(() => {
    const e = elapsed;

    // Scene transitions
    if (e >= 1200 && scene === "welcome") setScene("buildings");
    if (e >= 3800 && scene === "buildings") setScene("upload");

    // Building highlight
    if (e >= 3000) setAbcHighlighted(true);

    // Drop zone activation
    if (e >= 4500) setDzActive(true);

    // Photo drop
    if (e >= 4500 && e < 4530) setPhotoDropping(true);
    if (e >= 5300) setPhotoDropping(false);

    // File 1: photos
    if (e >= 5500)
      setFiles((f) => f.map((r, i) => (i === 0 ? { ...r, visible: true } : r)));
    if (e >= 6000)
      setFiles((f) => f.map((r, i) => (i === 0 ? { ...r, done: true } : r)));

    // PDF drop
    if (e >= 6500 && e < 6530) setPdfDropping(true);
    if (e >= 7200) setPdfDropping(false);

    // File 2: pdf
    if (e >= 6500)
      setFiles((f) => f.map((r, i) => (i === 1 ? { ...r, visible: true } : r)));
    if (e >= 7000)
      setFiles((f) => f.map((r, i) => (i === 1 ? { ...r, done: true } : r)));

    // Voice drop
    if (e >= 7500 && e < 7530) setVoiceDropping(true);
    if (e >= 8200) setVoiceDropping(false);

    // File 3: voice
    if (e >= 7500)
      setFiles((f) => f.map((r, i) => (i === 2 ? { ...r, visible: true } : r)));
    if (e >= 8000)
      setFiles((f) => f.map((r, i) => (i === 2 ? { ...r, done: true } : r)));

    // Drop zone deactivate
    if (e >= 9000) setDzActive(false);

    // Phase 2: integrations
    if (e >= 10000) setShowIntegrations(true);

    // Yardi
    if (e >= 11000) setYardiState((p) => (p === "idle" ? "connecting" : p));
    if (e >= 11800) setYardiState((p) => (p === "connecting" ? "connected" : p));

    // AppFolio
    if (e >= 12500) setAppfolioState((p) => (p === "idle" ? "connecting" : p));
    if (e >= 13300) setAppfolioState((p) => (p === "connecting" ? "connected" : p));

    // Mark visited
    if (e >= 14000 && !visitedItems.includes("overview")) {
      setVisitedItems(["overview"]);
    }
  }, [elapsed, scene, visitedItems]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeItem="overview" visitedItems={visitedItems} />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: 60 }}>
          <TopBar onReplay={reset} />

          {/* Agent status strip */}
          <div style={{ height: 32, marginBottom: 16, display: "flex", alignItems: "center" }}>
            <AnimatePresence mode="wait">
              {agentMsg && (
                <motion.p
                  key={agentMsg.text}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    fontFamily: "monospace",
                    fontSize: 13,
                    color: agentMsg.color === "green" ? "#10B981" : "#8B92A8",
                  }}
                >
                  {agentMsg.text}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {/* ── SCENE: WELCOME ── */}
          <AnimatePresence>
            {scene === "welcome" && (
              <motion.div
                key="welcome"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: 420,
                  textAlign: "center",
                }}
              >
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── SCENE: BUILDINGS ── */}
          <AnimatePresence>
            {scene === "buildings" && (
              <motion.div
                key="buildings"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
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
                    const isABC = b.id === "abc";
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
          </AnimatePresence>

          {/* ── SCENE: UPLOAD + INTEGRATIONS ── */}
          <AnimatePresence>
            {scene === "upload" && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
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

                {/* Drop zone */}
                <div style={{ position: "relative", marginBottom: 0 }}>
                  {/* Photo stack ghost */}
                  <PhotoStack animating={photoDropping} />

                  {/* PDF ghost */}
                  <AnimatePresence>
                    {pdfDropping && (
                      <SingleDrop
                        animating={pdfDropping}
                        icon={<FileText size={28} style={{ color: "#EF4444" }} />}
                      />
                    )}
                  </AnimatePresence>

                  {/* Voice ghost */}
                  <AnimatePresence>
                    {voiceDropping && (
                      <SingleDrop
                        animating={voiceDropping}
                        icon={<Mic size={28} style={{ color: "#8B5CF6" }} />}
                      />
                    )}
                  </AnimatePresence>

                  <div
                    style={{
                      width: "100%",
                      height: 220,
                      borderRadius: 16,
                      border: dzActive ? "2px solid #4F6BFF" : "2px dashed #D1D5DB",
                      background: dzActive
                        ? "rgba(79,107,255,0.04)"
                        : "#FAFBFD",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 8,
                      transition: "border-color 0.3s ease, background 0.3s ease",
                    }}
                  >
                    <Upload size={40} style={{ color: "#9CA3B8" }} />
                    <p style={{ fontSize: 14, color: "#9CA3B8" }}>Drop files here</p>
                  </div>
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

                {/* ── Integrations (Phase 2) ── */}
                <AnimatePresence>
                  {showIntegrations && (
                    <motion.div
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                      style={{ marginTop: 24 }}
                    >
                      <p
                        style={{
                          fontSize: 11,
                          fontWeight: 500,
                          color: "#9CA3B8",
                          letterSpacing: "0.08em",
                          textTransform: "uppercase",
                          marginBottom: 12,
                        }}
                      >
                        Integrations
                      </p>
                      <div style={{ display: "flex", gap: 16 }}>
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
