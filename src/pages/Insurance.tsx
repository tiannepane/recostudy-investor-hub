import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Building, Paperclip } from "lucide-react";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";
import AgentBar from "@/components/AgentBar";

/* ─── AgentBar thinking messages (900ms between each step) ─── */

const THINKING_MESSAGES = [
  "scanning 24 components for insurance implications...",
  "3 components identified as end-of-life or critical...",
  "Exterior Facade flagged as primary insurance risk...",
  "drafting insurer notification...",
  "attaching reserve study and updated inventory...",
];

/* ─── Left column bullet rows ─────────────────────────────── */

const WHY_ROWS = [
  "Building classification may change if structural components are not addressed",
  "Current premium is $6,200 above market average for comparable NYC buildings",
  "Completing the facade project may qualify for premium reduction",
];

/* ─── Email body lines (start at 4200ms, 300ms apart) ─────── */

const BODY_LINES: { text: string; spacerAfter?: boolean }[] = [
  { text: "Dear Apex Property Insurance,", spacerAfter: true },
  {
    text: "This is an automated update from RECOstudy to confirm that a critical component has been identified in the building's reserve fund study.",
    spacerAfter: true,
  },
  { text: "Component: Exterior Facade & Balconies" },
  { text: "Status: End-of-life · Remaining Useful Life: 1 year" },
  { text: "Estimated Replacement Cost: $425,000", spacerAfter: true },
  {
    text: "Updated reserve study and component inventory records are attached for your review. A restoration project has been initiated and submitted to the contractor marketplace.",
    spacerAfter: true,
  },
  { text: "Please update your records accordingly." },
];

/* ─── Page ──────────────────────────────────────────────────── */

const Insurance = () => {
  const [elapsed, setElapsed] = useState(0);

  const reset = useCallback(() => setElapsed(0), []);

  useEffect(() => {
    const id = setInterval(() => setElapsed((p) => p + 30), 30);
    return () => clearInterval(id);
  }, []);

  // AgentBar: cycles through thinking messages every 900ms, completes at 7s
  const stepIndex   = Math.min(THINKING_MESSAGES.length - 1, Math.floor(elapsed / 900));
  const thinkingMsg = THINKING_MESSAGES[stepIndex];
  const agentIsThinking = elapsed < 7000;
  const agentIsComplete = elapsed >= 7000;

  // Column reveal timings
  const showLeft  = elapsed >= 2000;
  const showRight = elapsed >= 3500;

  // Body line reveals: line i shows at 4200 + i * 300ms
  const bodyLineVisible = (i: number) => elapsed >= 4200 + i * 300;

  // Attachments
  const showAttachments = elapsed >= 5500;

  // Send button states
  const showButton  = elapsed >= 6000;
  const buttonState = elapsed >= 7000 ? "sent" : elapsed >= 6300 ? "sending" : "idle";
  const showProgress = elapsed >= 6300 && elapsed < 7000;
  const progressPct  = showProgress
    ? Math.min(100, ((elapsed - 6300) / 1200) * 100)
    : 0;

  return (
    <div className="flex min-h-screen" style={{ background: "#F8F9FC" }}>
      <Sidebar
        activeItem="insurance"
        visitedItems={["overview", "inventory", "financials", "projects", "marketplace", "funding"]}
      />

      <main className="flex-1" style={{ marginLeft: 260 }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", padding: "28px 44px 48px" }}>

          <TopBar
            onReplay={reset}
            breadcrumb="Buildings › Meridian Condominium Association, Inc. › Insurance"
            activeItem="insurance"
          />

          {/* ── Agent Bar ── */}
          <AgentBar
            agentName="Insurance Agent"
            thinkingMessage={thinkingMsg}
            completeMessage="3 components flagged, notification sent to insurer@example.com"
            accentColor="#8B5CF6"
            isThinking={agentIsThinking}
            isComplete={agentIsComplete}
            isHidden={false}
          />

          {/* ── Page title + subtitle ── */}
          <div style={{ marginBottom: 20 }}>
            <h1 style={{ fontSize: 20, fontWeight: 600, color: "#0A0A0A", margin: 0, marginBottom: 3 }}>
              Insurance
            </h1>
            <p style={{ fontSize: 14, color: "#9CA3B8", margin: 0 }}>
              RECOstudy monitors your building's insurance exposure automatically.
            </p>
          </div>

          {/* ── Two-column layout ── */}
          <div style={{ display: "flex", gap: 24 }}>

            {/* ════ LEFT COLUMN — 38% ════ */}
            <div style={{ width: "38%", flexShrink: 0 }}>
              <AnimatePresence>
                {showLeft && (
                  <motion.div
                    key="left"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      background: "rgba(255, 255, 255, 0.85)",
                      backdropFilter: "blur(8px)",
                      border: "1px solid rgba(220, 38, 38, 0.12)",
                      boxShadow: "0 0 0 1px rgba(220,38,38,0.05), 0 8px 32px rgba(220,38,38,0.09)",
                      borderRadius: 10,
                      padding: 20,
                    }}
                  >
                    {/* TRIGGER label */}
                    <p style={{
                      margin: 0,
                      marginBottom: 8,
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#9CA3B8",
                    }}>
                      Trigger
                    </p>

                    {/* Scan summary line */}
                    <p style={{
                      margin: 0,
                      marginBottom: 10,
                      fontSize: 12,
                      fontStyle: "italic",
                      color: "#9CA3B8",
                    }}>
                      Insurance Agent scanned 24 components &mdash; 3 flagged
                    </p>

                    {/* Component rows */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>

                      {/* Row 1 — Exterior Facade (primary, dark left accent) */}
                      <div style={{
                        background: "#FFFFFF",
                        border: "1px solid rgba(15,23,41,0.06)",
                        borderLeft: "2px solid #0F1729",
                        borderRadius: 8,
                        padding: "10px 14px",
                        boxShadow: "0 2px 8px rgba(220,38,38,0.08)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#DC2626", flexShrink: 0 }} />
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F1729" }}>
                            Exterior Facade &amp; Balconies
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: "#9CA3B8" }}>
                          End-of-life &middot; 1 year RUL &middot; $425,000
                        </p>
                      </div>

                      {/* Row 2 — Elevator Cab */}
                      <div style={{
                        background: "#FFFFFF",
                        border: "1px solid rgba(15,23,41,0.06)",
                        borderRadius: 8,
                        padding: "10px 14px",
                        boxShadow: "0 2px 8px rgba(15,23,41,0.05)",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#DC2626", flexShrink: 0 }} />
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F1729" }}>
                            Elevator Cab &mdash; Townhouse
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: "#9CA3B8" }}>
                          End-of-life &middot; Immediate &middot; $36,000
                        </p>
                      </div>

                      {/* Row 3 — Boiler */}
                      <div style={{
                        background: "#FFFFFF",
                        border: "1px solid rgba(15,23,41,0.06)",
                        borderRadius: 8,
                        padding: "10px 14px",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                          <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#F59E0B", flexShrink: 0 }} />
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#0F1729" }}>
                            Boiler
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: 12, color: "#9CA3B8" }}>
                          Critical &middot; 1 year RUL &middot; $100,000
                        </p>
                      </div>

                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: "#EEEFF2", margin: "16px 0" }} />

                    {/* WHY THIS MATTERS label */}
                    <p style={{
                      margin: 0,
                      marginBottom: 10,
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#9CA3B8",
                    }}>
                      Why This Matters
                    </p>

                    {/* Bullet rows */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingLeft: 8 }}>
                      {WHY_ROWS.map((text, i) => (
                        <div
                          key={i}
                          style={{ display: "flex", alignItems: "flex-start", gap: 10 }}
                        >
                          <div style={{
                            width: 4,
                            height: 4,
                            borderRadius: "50%",
                            background: "#EEEFF2",
                            flexShrink: 0,
                            marginTop: 7,
                          }} />
                          <span style={{ fontSize: 13, color: "#5A6178", lineHeight: 1.6 }}>
                            {text}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Divider */}
                    <div style={{ height: 1, background: "#EEEFF2", margin: "16px 0" }} />

                    {/* INSURER ON FILE label */}
                    <p style={{
                      margin: 0,
                      marginBottom: 6,
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "#9CA3B8",
                    }}>
                      Insurer on File
                    </p>

                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                      <Building size={14} style={{ color: "#9CA3B8", flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 500, color: "#0F1729" }}>
                        Apex Property Insurance
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: 12, color: "#9CA3B8" }}>
                      insurer@example.com
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* ════ RIGHT COLUMN — 62% ════ */}
            <div style={{ flex: 1, minWidth: 0 }}>

              {/* ── Email card ── */}
              <AnimatePresence>
                {showRight && (
                  <motion.div
                    key="email-card"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    style={{
                      background: "#FFFFFF",
                      borderRadius: 6,
                      boxShadow: "0 0 0 1px rgba(15,23,41,0.04), 0 8px 24px rgba(15,23,41,0.07)",
                      padding: 28,
                    }}
                  >
                    {/* ── Email header top row ── */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                      {/* RECOstudy™ wordmark */}
                      <span style={{ fontSize: 13 }}>
                        <span style={{ fontWeight: 700, color: "#0F1729" }}>RECO</span>
                        <span style={{ fontWeight: 700, color: "#4F6BFF" }}>study</span>
                        <span style={{ fontSize: 9, color: "#9CA3B8", verticalAlign: "super", marginLeft: 1 }}>™</span>
                      </span>
                      {/* INSURANCE NOTIFICATION label */}
                      <span style={{
                        fontSize: 11,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "#9CA3B8",
                      }}>
                        Insurance Notification
                      </span>
                    </div>

                    {/* Thin divider */}
                    <div style={{ height: 1, background: "#EEEFF2", marginBottom: 0 }} />

                    {/* ── TO / FROM / SUBJECT rows ── */}
                    {[
                      {
                        label: "To:",
                        value: "insurer@example.com",
                        valueWeight: 400,
                      },
                      {
                        label: "From:",
                        value: "RECollab Admin · Meridian Condominium Association, Inc.",
                        valueWeight: 400,
                      },
                      {
                        label: "Subject:",
                        value: "Building Update — Exterior Facade & Balconies · Meridian Condominium Association, Inc.",
                        valueWeight: 500,
                      },
                    ].map(({ label, value, valueWeight }) => (
                      <div
                        key={label}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          height: 32,
                          borderBottom: "1px solid #F8F9FC",
                        }}
                      >
                        <span style={{
                          width: 60,
                          flexShrink: 0,
                          fontSize: 11,
                          color: "#9CA3B8",
                        }}>
                          {label}
                        </span>
                        <span style={{
                          fontSize: 13,
                          fontWeight: valueWeight,
                          color: "#0F1729",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}>
                          {value}
                        </span>
                      </div>
                    ))}

                    {/* Thin divider before body */}
                    <div style={{ height: 1, background: "#EEEFF2", margin: "12px 0" }} />

                    {/* ── Body lines (reveal at 4200ms, 300ms apart) ── */}
                    <div style={{ fontSize: 13, color: "#5A6178", lineHeight: 1.75 }}>
                      {BODY_LINES.map((line, i) => (
                        <AnimatePresence key={i}>
                          {bodyLineVisible(i) && (
                            <motion.p
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: 0.3 }}
                              style={{
                                margin: 0,
                                marginBottom: line.spacerAfter ? 14 : 0,
                              }}
                            >
                              {line.text}
                            </motion.p>
                          )}
                        </AnimatePresence>
                      ))}
                    </div>

                    {/* ── Attachments (5.5s) ── */}
                    <AnimatePresence>
                      {showAttachments && (
                        <motion.div
                          key="attachments"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.35 }}
                          style={{ marginTop: 18 }}
                        >
                          <p style={{
                            margin: 0,
                            marginBottom: 8,
                            fontSize: 10,
                            textTransform: "uppercase",
                            letterSpacing: "0.08em",
                            color: "#9CA3B8",
                          }}>
                            Attachments
                          </p>
                          <div style={{ display: "flex", gap: 8 }}>
                            {[
                              "Reserve Study Report",
                              "Updated Component Inventory",
                            ].map((label) => (
                              <div
                                key={label}
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 6,
                                  background: "#F8F9FC",
                                  border: "1px solid rgba(15,23,41,0.06)",
                                  borderRadius: 5,
                                  padding: "5px 12px",
                                }}
                              >
                                <Paperclip size={12} style={{ color: "#9CA3B8", flexShrink: 0 }} />
                                <span style={{ fontSize: 12, color: "#5A6178" }}>{label}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Send button + progress bar (outside card) ── */}
              <AnimatePresence>
                {showButton && (
                  <motion.div
                    key="send-btn-wrap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.25 }}
                    style={{ marginTop: 10 }}
                  >
                    {/* Button */}
                    <div
                      style={{
                        width: "100%",
                        height: 44,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                        borderRadius: 7,
                        fontSize: 14,
                        fontWeight: 500,
                        cursor: "default",
                        transition: "background 200ms ease, border-color 200ms ease, color 200ms ease",
                        ...(buttonState === "sent"
                          ? {
                              background: "#F0FDF4",
                              border: "1px solid #BBF7D0",
                              color: "#15803D",
                            }
                          : buttonState === "sending"
                          ? {
                              background: "#0F1729",
                              border: "1px solid #0F1729",
                              color: "#FFFFFF",
                            }
                          : {
                              background: "transparent",
                              border: "1px solid #0F1729",
                              color: "#0F1729",
                            }),
                      }}
                    >
                      {buttonState === "sent" && (
                        <span style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#22C55E",
                          flexShrink: 0,
                          display: "inline-block",
                        }} />
                      )}
                      {buttonState === "sent"
                        ? "✓ Notification Sent"
                        : buttonState === "sending"
                        ? "Sending..."
                        : "Send Notification →"}
                    </div>

                    {/* Progress bar */}
                    {showProgress && (
                      <div style={{
                        marginTop: 6,
                        width: "100%",
                        height: 3,
                        borderRadius: 2,
                        background: "#EEEFF2",
                        overflow: "hidden",
                      }}>
                        <div style={{
                          height: "100%",
                          width: `${progressPct}%`,
                          background: "#0F1729",
                          borderRadius: 2,
                          transition: "width 30ms linear",
                        }} />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

            </div>{/* end right column */}

          </div>
        </div>
      </main>
    </div>
  );
};

export default Insurance;
