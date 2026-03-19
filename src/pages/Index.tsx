import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Camera, FileText, Mic } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AgentStatus from "@/components/AgentStatus";
import { UploadCard } from "@/components/UploadCard";
import type { UploadZone, FileItem } from "@/components/UploadCard";
import IntegrationCard from "@/components/IntegrationCard";
import type { ButtonState } from "@/components/IntegrationCard";

const agentMessages = [
  { text: "Ingestion Agent — processing 3 files...", color: "gray" as const, startTime: 9000 },
  { text: "Ingestion Agent — all files processed ✓", color: "green" as const, startTime: 11000 },
];

const Index = () => {
  const [elapsed, setElapsed] = useState(0);
  const [visitedItems, setVisitedItems] = useState<string[]>([]);

  const [zones, setZones] = useState<UploadZone[]>([
    { label: "Photos", icon: Camera, highlighted: false },
    { label: "Documents", icon: FileText, highlighted: false },
    { label: "Voice Notes", icon: Mic, highlighted: false },
  ]);

  const [files, setFiles] = useState<FileItem[]>([
    { name: "6 building inspection photos", detail: "Images · 24.5 MB total", type: "image", visible: false, done: false },
    { name: "existing-reserve-study.pdf", detail: "PDF document · 8.7 MB", type: "pdf", visible: false, done: false },
    { name: "site-walkthrough-notes.m4a", detail: "Voice recording · 3.2 MB", type: "voice", visible: false, done: false },
  ]);

  const [yardiState, setYardiState] = useState<ButtonState>("connect");
  const [yardiScale, setYardiScale] = useState(false);

  const reset = useCallback(() => {
    setElapsed(0);
    setVisitedItems([]);
    setZones((z) => z.map((zone) => ({ ...zone, highlighted: false })));
    setFiles((f) => f.map((file) => ({ ...file, visible: false, done: false })));
    setYardiState("connect");
    setYardiScale(false);
  }, []);

  // Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed((prev) => prev + 30);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  // Animation sequence driven by elapsed time
  useEffect(() => {
    const e = elapsed;

    // Photos zone highlight at 1500ms
    if (e >= 1500 && e < 2100) {
      setZones((z) => z.map((zone, i) => ({ ...zone, highlighted: i === 0 })));
    } else if (e >= 2100 && e < 3200) {
      setZones((z) => z.map((zone) => ({ ...zone, highlighted: false })));
    }

    // File 1 appears at 2000ms, done at 2600ms
    if (e >= 2000) setFiles((f) => f.map((file, i) => (i === 0 ? { ...file, visible: true } : file)));
    if (e >= 2600) setFiles((f) => f.map((file, i) => (i === 0 ? { ...file, done: true } : file)));

    // Documents zone highlight at 3200ms
    if (e >= 3200 && e < 3800) {
      setZones((z) => z.map((zone, i) => ({ ...zone, highlighted: i === 1 })));
    } else if (e >= 3800 && e < 4900) {
      setZones((z) => z.map((zone) => ({ ...zone, highlighted: false })));
    }

    // File 2 at 3700ms, done at 4300ms
    if (e >= 3700) setFiles((f) => f.map((file, i) => (i === 1 ? { ...file, visible: true } : file)));
    if (e >= 4300) setFiles((f) => f.map((file, i) => (i === 1 ? { ...file, done: true } : file)));

    // Voice zone highlight at 4900ms
    if (e >= 4900 && e < 5500) {
      setZones((z) => z.map((zone, i) => ({ ...zone, highlighted: i === 2 })));
    } else if (e >= 5500) {
      setZones((z) => z.map((zone) => ({ ...zone, highlighted: false })));
    }

    // File 3 at 5400ms, done at 6000ms
    if (e >= 5400) setFiles((f) => f.map((file, i) => (i === 2 ? { ...file, visible: true } : file)));
    if (e >= 6000) setFiles((f) => f.map((file, i) => (i === 2 ? { ...file, done: true } : file)));

    // Yardi at 7000ms
    if (e >= 7000 && e < 7800) setYardiState("connecting");
    if (e >= 7800) {
      setYardiState("connected");
      setYardiScale(true);
      setTimeout(() => setYardiScale(false), 300);
    }

    // Mark overview visited at 12000ms
    if (e >= 12000 && !visitedItems.includes("overview")) {
      setVisitedItems(["overview"]);
    }
  }, [elapsed, visitedItems]);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeItem="overview" visitedItems={visitedItems} />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div className="p-10 mx-auto" style={{ maxWidth: 1100 }}>
          <TopBar onReplay={reset} />

          {/* Agent Status */}
          <div className="mb-8">
            <AgentStatus messages={agentMessages} elapsed={elapsed} />
          </div>

          {/* Two columns */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="flex gap-[3%]"
          >
            {/* Left column - 62% */}
            <div style={{ width: "62%" }}>
              <h1 className="text-[28px] font-bold text-heading mb-2">
                Connect your building data
              </h1>
              <p className="text-[15px] text-body-text mb-6" style={{ maxWidth: 500 }}>
                Upload documents, photos, and voice notes or connect directly to your property management software.
              </p>
              <UploadCard zones={zones} files={files} />
            </div>

            {/* Right column - 35% */}
            <div style={{ width: "35%" }}>
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
                  animateScale={yardiScale}
                />
                <IntegrationCard
                  name="AppFolio"
                  logoSrc="https://cdn.brandfetch.io/idpLibLBbM/w/400/h/400/theme/dark/icon.jpeg"
                  buttonState="connect"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Index;
