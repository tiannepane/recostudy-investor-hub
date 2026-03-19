import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AgentStatus from "@/components/AgentStatus";
import { FileList } from "@/components/FileList";
import type { FileItem } from "@/components/FileList";
import IntegrationCard from "@/components/IntegrationCard";
import type { ButtonState } from "@/components/IntegrationCard";

const agentMessages = [
  { text: "Ingestion Agent — all files processed ✓", color: "green" as const, startTime: 9500 },
];

const Index = () => {
  const [elapsed, setElapsed] = useState(0);
  const [visitedItems, setVisitedItems] = useState<string[]>([]);
  const [phase, setPhase] = useState<1 | 2>(1);

  const [files, setFiles] = useState<FileItem[]>([
    { name: "6 building inspection photos", detail: "Images · 24.5 MB total", type: "image", visible: false, done: false },
    { name: "existing-reserve-study.pdf", detail: "PDF document · 8.7 MB", type: "pdf", visible: false, done: false },
    { name: "site-walkthrough-notes.m4a", detail: "Voice recording · 3.2 MB", type: "voice", visible: false, done: false },
  ]);

  const [yardiState, setYardiState] = useState<ButtonState>("connect");

  const reset = useCallback(() => {
    setElapsed(0);
    setVisitedItems([]);
    setPhase(1);
    setFiles((f) => f.map((file) => ({ ...file, visible: false, done: false })));
    setYardiState("connect");
  }, []);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 30);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Animation sequence
  useEffect(() => {
    const e = elapsed;

    // File 1: appear 1.5s, done 2.5s
    if (e >= 1500) setFiles((f) => f.map((file, i) => (i === 0 ? { ...file, visible: true } : file)));
    if (e >= 2500) setFiles((f) => f.map((file, i) => (i === 0 ? { ...file, done: true } : file)));

    // File 2: appear 3.2s, done 4.2s
    if (e >= 3200) setFiles((f) => f.map((file, i) => (i === 1 ? { ...file, visible: true } : file)));
    if (e >= 4200) setFiles((f) => f.map((file, i) => (i === 1 ? { ...file, done: true } : file)));

    // File 3: appear 4.9s, done 5.9s
    if (e >= 4900) setFiles((f) => f.map((file, i) => (i === 2 ? { ...file, visible: true } : file)));
    if (e >= 5900) setFiles((f) => f.map((file, i) => (i === 2 ? { ...file, done: true } : file)));

    // Phase 2 at 7s (1s after last checkmark at 5.9s)
    if (e >= 7000) setPhase(2);

    // Yardi connecting at 7.5s, connected at 8.3s
    if (e >= 7500 && e < 8300) setYardiState("connecting");
    if (e >= 8300) setYardiState("connected");

    // Mark overview visited at 11s
    if (e >= 11000 && !visitedItems.includes("overview")) {
      setVisitedItems(["overview"]);
    }
  }, [elapsed, visitedItems]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeItem="overview" visitedItems={visitedItems} />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div className="mx-auto" style={{ maxWidth: 1200, padding: 60 }}>
          <TopBar onReplay={reset} />

          {/* Agent Status */}
          <div className="mb-8">
            <AgentStatus messages={agentMessages} elapsed={elapsed} />
          </div>

          {/* Content area */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 200, damping: 30 }}
            className={phase === 1
              ? "flex flex-col items-center justify-center"
              : "flex gap-[3%]"
            }
            style={{ minHeight: phase === 1 ? 420 : "auto" }}
          >
            {/* Left / Center column */}
            <motion.div
              layout
              transition={{ type: "spring", stiffness: 200, damping: 30 }}
              style={{ width: phase === 1 ? "100%" : "62%" }}
              className={phase === 1 ? "flex flex-col items-center" : ""}
            >
              <motion.h1
                layout="position"
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
                className={`text-[28px] font-bold text-heading mb-2 ${phase === 1 ? "text-center" : "text-left w-full"}`}
              >
                Connect your building data
              </motion.h1>
              <motion.p
                layout="position"
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
                className={`text-[15px] text-body-text mb-6 ${phase === 1 ? "text-center" : "text-left w-full"}`}
                style={{ maxWidth: phase === 1 ? 480 : 500 }}
              >
                Upload documents, photos, and voice notes or connect directly to your property management software.
              </motion.p>

              <motion.div
                layout
                transition={{ type: "spring", stiffness: 200, damping: 30 }}
                className="card-base p-6"
                style={{ maxWidth: phase === 1 ? 540 : "none", width: "100%" }}
              >
                <FileList files={files} />
              </motion.div>
            </motion.div>

            {/* Right column - integrations */}
            <AnimatePresence>
              {phase === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 30, delay: 0.1 }}
                  style={{ width: "35%" }}
                >
                  <p
                    className="text-[11px] font-medium text-breadcrumb mb-3"
                    style={{ letterSpacing: "0.08em", textTransform: "uppercase" }}
                  >
                    Integrations
                  </p>
                  <div className="flex flex-col gap-3">
                    <IntegrationCard
                      name="Yardi"
                      logoSrc="https://cdn.brandfetch.io/idH0TkFcNd/w/400/h/400/theme/dark/icon.jpeg"
                      buttonState={yardiState}
                    />
                    <IntegrationCard
                      name="AppFolio"
                      logoSrc="https://cdn.brandfetch.io/idpLibLBbM/w/400/h/400/theme/dark/icon.jpeg"
                      buttonState="connect"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Index;
