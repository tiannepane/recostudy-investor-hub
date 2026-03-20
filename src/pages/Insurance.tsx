import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Paperclip,
  Mail,
  TrendingDown,
  CheckCircle,
  Image as ImageIcon,
  FileText,
  Clipboard,
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

/* ─── Agent text ─────────────────────────────────────────── */

const AGENT_PROCESSING = "● Compliance Agent — processing insurance notification...";
const AGENT_DONE       = "● Compliance Agent — insurer notified, premium review flagged ✓";

function computeAgent(e: number): { text: string; color: "gray" | "green"; phase: number } {
  if (e >= 5500) return { text: AGENT_DONE, color: "green", phase: 2 };
  const chars = Math.min(
    AGENT_PROCESSING.length,
    Math.floor((e / 1500) * AGENT_PROCESSING.length),
  );
  return { text: AGENT_PROCESSING.slice(0, chars), color: "gray", phase: 1 };
}

/* ─── Email body lines ───────────────────────────────────── */

const EMAIL_LINES = [
  "Dear Insurer, This is an automated notification to confirm completion of the",
  "Exterior Facade & Balconies Restoration project at ABC Condominium Association, Inc.",
  "The project was completed on March 20, 2026 at a total value of $438,000. Updated documentation is attached for your records.",
];

/* ─── Step data ──────────────────────────────────────────── */

const NODE_STYLE = {
  position: "absolute" as const,
  left: 0,
  top: 0,
  width: 24,
  height: 24,
  borderRadius: "50%",
  background: "#10B981",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

/* ─── Page ───────────────────────────────────────────────── */

const Insurance = () => {
  const [elapsed, setElapsed]         = useState(0);
  const [emailGlowing, setEmailGlowing] = useState(false);

  const reset = useCallback(() => {
    setElapsed(0);
    setEmailGlowing(false);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  const handleViewNotification = () => {
    setEmailGlowing(true);
    setTimeout(() => setEmailGlowing(false), 600);
  };

  /* ── Derived timing ── */
  const headerVisible   = elapsed >= 500;
  const timelineVisible = elapsed >= 1000;
  const step1Visible    = elapsed >= 1500;
  const step2Visible    = elapsed >= 2300;
  const file1Visible    = elapsed >= 2300;
  const file2Visible    = elapsed >= 2420;
  const file3Visible    = elapsed >= 2540;
  const step3Visible    = elapsed >= 3200;
  const card1Visible    = elapsed >= 3200;
  const emailLine1      = elapsed >= 3200;
  const emailLine2      = elapsed >= 3350;
  const emailLine3      = elapsed >= 3500;
  const step4Visible    = elapsed >= 4500;
  const card2Visible    = elapsed >= 4500;

  const emailLineVisible = [emailLine1, emailLine2, emailLine3];

  /* ── $4,200 counter ── */
  const counterValue = card2Visible
    ? Math.min(4200, Math.floor(((elapsed - 4500) / 800) * 4200))
    : 0;

  const agent = computeAgent(elapsed);

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar
        activeItem="insurance"
        visitedItems={["overview", "inventory", "financials", "projects", "marketplace", "funding"]}
      />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div className="mx-auto" style={{ maxWidth: 1100, padding: "44px 50px 36px" }}>
          <TopBar
            onReplay={reset}
            breadcrumb="Buildings › ABC Condominium Association, Inc. › Insurance"
            activeItem="insurance"
          />

          {/* Agent status */}
          <div style={{ height: 26, marginBottom: 20, display: "flex", alignItems: "center" }}>
            <AnimatePresence mode="wait">
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
            </AnimatePresence>
          </div>

          {/* Page header */}
          <AnimatePresence>
            {headerVisible && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
                style={{ marginBottom: 24 }}
              >
                <p style={{ fontSize: 24, fontWeight: 700, color: "#0F1729", marginBottom: 4 }}>
                  Insurance
                </p>
                <p style={{ fontSize: 14, color: "#5A6178" }}>
                  Automated compliance notifications and premium optimization.
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── Two-column layout ── */}
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>

            {/* ══ LEFT: Timeline ══ */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <AnimatePresence>
                {timelineVisible && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    style={{ position: "relative", paddingLeft: 44 }}
                  >
                    {/* Vertical connecting line */}
                    <motion.div
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      style={{
                        position: "absolute",
                        left: 11,
                        top: 12,
                        bottom: 12,
                        width: 2,
                        background: "#E8EBF0",
                        transformOrigin: "top",
                      }}
                    />

                    {/* ── Step 1: Trigger Detected ── */}
                    {step1Visible && (
                      <div style={{ position: "relative", paddingBottom: 24 }}>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          style={NODE_STYLE}
                        >
                          <Search size={12} style={{ color: "white" }} />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut", delay: 0.15 }}
                        >
                          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 3 }}>
                            Trigger Detected
                          </p>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "#0F1729", marginBottom: 4 }}>
                            Exterior Facade &amp; Balconies marked complete
                          </p>
                          <p style={{ fontSize: 13, color: "#5A6178", lineHeight: 1.5, marginBottom: 8 }}>
                            Compliance Agent scanned inventory and detected a status change on a critical component.
                          </p>
                          <div style={{ display: "flex", gap: 8 }}>
                            <span style={{ fontSize: 11, background: "#F0FDF4", color: "#10B981", borderRadius: 4, padding: "3px 8px" }}>
                              Completed March 20, 2026
                            </span>
                            <span style={{ fontSize: 11, background: "#EFF6FF", color: "#3B82F6", borderRadius: 4, padding: "3px 8px" }}>
                              $438,000 project value
                            </span>
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {/* ── Step 2: Documentation Compiled ── */}
                    {step2Visible && (
                      <div style={{ position: "relative", paddingBottom: 24 }}>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          style={NODE_STYLE}
                        >
                          <Paperclip size={12} style={{ color: "white" }} />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut", delay: 0.15 }}
                        >
                          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 3 }}>
                            Documentation Compiled
                          </p>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "#0F1729", marginBottom: 4 }}>
                            Supporting documents gathered automatically
                          </p>
                          <p style={{ fontSize: 13, color: "#5A6178", lineHeight: 1.5, marginBottom: 8 }}>
                            Agent pulled updated reserve study, component inventory, and project completion certificate.
                          </p>

                          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {([
                              { bg: "#EFF6FF", color: "#3B82F6", Icon: ImageIcon, label: "Updated Reserve Study Report",         vis: file1Visible },
                              { bg: "#FEF2F2", color: "#EF4444", Icon: FileText,  label: "Project Completion Certificate.pdf",   vis: file2Visible },
                              { bg: "#F3E8FF", color: "#8B5CF6", Icon: Clipboard, label: "Updated Component Inventory",          vis: file3Visible },
                            ] as const).map(({ bg, color, Icon, label, vis }) =>
                              vis ? (
                                <motion.div
                                  key={label}
                                  initial={{ opacity: 0, x: -4 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ duration: 0.22 }}
                                  style={{ display: "flex", alignItems: "center", gap: 10, height: 28 }}
                                >
                                  <div style={{ width: 24, height: 24, borderRadius: 6, background: bg, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Icon size={12} style={{ color }} />
                                  </div>
                                  <span style={{ fontSize: 12, color: "#5A6178" }}>{label}</span>
                                </motion.div>
                              ) : null,
                            )}
                          </div>
                        </motion.div>
                      </div>
                    )}

                    {/* ── Step 3: Insurer Notified ── */}
                    {step3Visible && (
                      <div style={{ position: "relative", paddingBottom: 24 }}>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          style={NODE_STYLE}
                        >
                          <Mail size={12} style={{ color: "white" }} />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut", delay: 0.15 }}
                        >
                          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 3 }}>
                            Insurer Notified
                          </p>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "#0F1729", marginBottom: 4 }}>
                            Notification sent to insurer@example.com
                          </p>
                          <p style={{ fontSize: 13, color: "#5A6178", lineHeight: 1.5, marginBottom: 8 }}>
                            Professional notification compiled and delivered automatically.
                          </p>
                          <p
                            onClick={handleViewNotification}
                            style={{ fontSize: 13, color: "#4F6BFF", cursor: "pointer" }}
                          >
                            View Notification →
                          </p>
                        </motion.div>
                      </div>
                    )}

                    {/* ── Step 4: Premium Opportunity Flagged ── */}
                    {step4Visible && (
                      <div style={{ position: "relative" }}>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ duration: 0.3, ease: "easeOut" }}
                          style={NODE_STYLE}
                        >
                          <TrendingDown size={12} style={{ color: "white" }} />
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, ease: "easeOut", delay: 0.15 }}
                        >
                          <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.06em", color: "#9CA3B8", marginBottom: 3 }}>
                            Premium Opportunity Flagged
                          </p>
                          <p style={{ fontSize: 14, fontWeight: 600, color: "#0F1729", marginBottom: 4 }}>
                            Risk profile improved — potential savings identified
                          </p>
                          <p style={{ fontSize: 13, color: "#5A6178", lineHeight: 1.5, marginBottom: 8 }}>
                            Completing a critical repair changes the building's risk classification. Agent flagged a premium review opportunity.
                          </p>
                          <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut", delay: 0.2 }}
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 8,
                              background: "#FFF7ED",
                              border: "1px solid #FED7AA",
                              borderRadius: 8,
                              padding: "8px 12px",
                            }}
                          >
                            <TrendingDown size={14} style={{ color: "#F59E0B", flexShrink: 0 }} />
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#92400E" }}>
                              Est. $4,200/yr premium reduction opportunity
                            </span>
                          </motion.div>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ══ RIGHT: Email card + Premium card ══ */}
            <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>

              {/* ── Card 1: Email Notification ── */}
              <AnimatePresence>
                {card1Visible && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{
                      borderRadius: 4,
                      background: "white",
                      padding: 24,
                      boxShadow: emailGlowing
                        ? "0 2px 8px rgba(0,0,0,0.08), 0 0 0 3px rgba(79,107,255,0.3)"
                        : "0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)",
                      transition: "box-shadow 300ms ease",
                    }}
                  >
                    {/* Logo row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                      <p style={{ fontSize: 14, lineHeight: 1 }}>
                        <span style={{ fontWeight: 700, color: "#0F1729" }}>RECO</span>
                        <span style={{ fontWeight: 700, color: "#4F6BFF" }}>study</span>
                        <sup style={{ fontSize: 9, color: "#9CA3B8", fontWeight: 400 }}>™</sup>
                      </p>
                      <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9CA3B8" }}>
                        Automated Notification
                      </p>
                    </div>
                    <div style={{ height: 1, background: "#E8EBF0", marginBottom: 12 }} />

                    {/* To / From / Subject */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                      {([
                        { label: "TO:",      value: "insurer@example.com",      fw: 500 },
                        { label: "FROM:",    value: "compliance@recostudy.ai",  fw: 500 },
                        { label: "SUBJECT:", value: "Building Update — Exterior Facade & Balconies Restoration Completed — ABC Condominium Association", fw: 600 },
                      ] as const).map(({ label, value, fw }) => (
                        <div key={label} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                          <span style={{ fontSize: 11, color: "#9CA3B8", flexShrink: 0, minWidth: 58 }}>{label}</span>
                          <span style={{ fontSize: 13, color: "#0F1729", fontWeight: fw, lineHeight: 1.4 }}>{value}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ height: 1, background: "#E8EBF0", marginBottom: 12 }} />

                    {/* Body lines — fade in staggered */}
                    <div style={{ marginBottom: 12 }}>
                      {EMAIL_LINES.map((line, i) =>
                        emailLineVisible[i] ? (
                          <motion.p
                            key={i}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.25 }}
                            style={{ fontSize: 13, color: "#5A6178", lineHeight: 1.6 }}
                          >
                            {line}
                          </motion.p>
                        ) : null,
                      )}
                    </div>

                    {/* Attachments */}
                    <p style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.08em", color: "#9CA3B8", marginBottom: 6 }}>
                      Attachments
                    </p>
                    <div style={{ display: "flex", gap: 7, flexWrap: "wrap", marginBottom: 14 }}>
                      {["Updated Reserve Study Report", "Project Completion Certificate"].map((att) => (
                        <div
                          key={att}
                          style={{ display: "flex", alignItems: "center", gap: 5, background: "#F8F9FC", border: "1px solid #E8EBF0", borderRadius: 4, padding: "4px 9px" }}
                        >
                          <Paperclip size={11} style={{ color: "#9CA3B8" }} />
                          <span style={{ fontSize: 11, color: "#5A6178" }}>{att}</span>
                        </div>
                      ))}
                    </div>

                    {/* Sent badge */}
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#ECFDF5", borderRadius: 6, padding: "4px 12px", marginBottom: 4 }}>
                      <CheckCircle size={14} style={{ color: "#10B981" }} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "#10B981" }}>✓ Sent</span>
                    </div>
                    <p style={{ fontSize: 11, color: "#9CA3B8", fontStyle: "italic" }}>
                      Sent March 20, 2026 at 11:42 AM
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Card 2: Premium Reduction Opportunity ── */}
              <AnimatePresence>
                {card2Visible && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                    style={{
                      borderRadius: 12,
                      background: "white",
                      border: "1px solid #FED7AA",
                      padding: 20,
                    }}
                  >
                    {/* Top: two columns */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                      {/* Left */}
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                          <TrendingDown size={16} style={{ color: "#F59E0B", flexShrink: 0 }} />
                          <p style={{ fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#F59E0B" }}>
                            Premium Reduction Opportunity
                          </p>
                        </div>
                        <p style={{ fontSize: 12, color: "#5A6178", lineHeight: 1.5 }}>
                          Completing critical repairs improves your building's risk classification with your insurer.
                        </p>
                      </div>

                      {/* Right: animated counter */}
                      <div style={{ textAlign: "right", flexShrink: 0 }}>
                        <p style={{ fontSize: 10, color: "#9CA3B8", marginBottom: 2 }}>Est. Annual Saving</p>
                        <p
                          style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: 24,
                            fontWeight: 700,
                            color: "#92400E",
                            margin: 0,
                          }}
                        >
                          ${counterValue.toLocaleString()} / yr
                        </p>
                      </div>
                    </div>

                    <div style={{ height: 1, background: "#FED7AA", marginBottom: 12 }} />

                    {/* Before / after comparison */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginBottom: 14 }}>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: 11, color: "#9CA3B8", marginBottom: 3 }}>Previous Risk Class</p>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#EF4444" }}>High Risk</p>
                      </div>
                      <p style={{ fontSize: 18, color: "#9CA3B8", flexShrink: 0, margin: 0 }}>→</p>
                      <div style={{ textAlign: "center" }}>
                        <p style={{ fontSize: 11, color: "#9CA3B8", marginBottom: 3 }}>Updated Risk Class</p>
                        <p style={{ fontSize: 14, fontWeight: 600, color: "#F59E0B" }}>Moderate Risk</p>
                      </div>
                    </div>

                    <button
                      style={{
                        width: "100%",
                        height: 40,
                        background: "#F59E0B",
                        color: "white",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 13,
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      Request Premium Review →
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Insurance;
