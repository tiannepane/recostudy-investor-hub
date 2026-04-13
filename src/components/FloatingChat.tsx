import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, ArrowUp } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const SYSTEM_PROMPT =
  "You are a reserve fund advisor for Meridian Condominium Association, Inc., a 173-unit concrete-frame building at 425 East 58th Street, New York, NY 10022, built in 1992. CRF balance: $2,064,255. Annual contribution: $511,500. Operating budget: $1,395,289. 10-year replacement costs: $7,335,097. Answer questions about the building finances clearly and concisely. Keep responses under 100 words.";

const PRESET_PROMPTS: { label: string; response: string }[] = [
  {
    label: "Are we at risk of a special assessment?",
    response:
      "You're in decent shape right now. Reserves are at $2,064,255 and about 78% funded against your 10-year schedule, which is healthy. The elevator cab project ($36K) is already out to market with a small $10K gap to cover. The one to watch is the boiler: 1 year of useful life left and $100K to replace. If that goes unplanned it gets expensive fast. Head to the Funding page to see the full gap analysis.",
  },
  {
    label: "What's our biggest deferred maintenance risk?",
    response:
      "The boiler, by a clear margin. It has 1 year left and a $100K replacement cost. It's still running but heat exchanger scale buildup means efficiency is slipping, and an emergency winter replacement runs 20 to 30% higher. After that, the elevator machinery is next in line at $85K with about 4 years left. Check the Inventory page for the full condition breakdown, or jump to Projects to see the active RFPs.",
  },
  {
    label: "Where can I find the reserve fund details?",
    response:
      "The Financials page is the best place to start. It shows your 30-year projection, the $511,500 annual contribution, and how reserves track against your replacement schedule. For a component-by-component view, the Inventory page has condition, remaining life, and replacement cost for all 10 items. And if you need something formatted for the board or a lender, the Reports page has packages ready to download or send.",
  },
];

const FloatingChat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const handleChipClick = (prompt: { label: string; response: string }) => {
    if (loading) return;
    setMessages((prev) => [...prev, { role: "user", content: prompt.label }]);
    setLoading(true);
    setTimeout(() => {
      setMessages((prev) => [...prev, { role: "assistant", content: prompt.response }]);
      setLoading(false);
    }, 2000);
  };

  const handleSend = async () => {
    const trimmed = query.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setQuery("");
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": import.meta.env.VITE_ANTHROPIC_API_KEY || "",
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 256,
          system: SYSTEM_PROMPT,
          messages: updated.map((m) => ({ role: m.role, content: m.content })),
        }),
      });

      if (!res.ok) {
        console.error("Anthropic API error:", await res.text());
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "Unable to get a response. Please check your API key." },
        ]);
      } else {
        const data = await res.json();
        const text = data.content?.[0]?.text || "No response received.";
        setMessages((prev) => [...prev, { role: "assistant", content: text }]);
      }
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Unable to connect. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!open && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={() => setOpen(true)}
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 50,
              width: 52,
              height: 52,
              borderRadius: "50%",
              background: "#0A0A0A",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              transition: "transform 0.15s",
            }}
            whileHover={{ scale: 1.05 }}
          >
            <MessageCircle size={22} style={{ color: "#FFFFFF" }} />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 350 }}
            style={{
              position: "fixed",
              bottom: 24,
              right: 24,
              zIndex: 50,
              width: 360,
              height: 480,
              background: "#FFFFFF",
              borderRadius: 20,
              border: "1px solid #E0E0E0",
              boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "16px 20px",
                borderBottom: "1px solid #F0F0F0",
                flexShrink: 0,
              }}
            >
              <p style={{ fontSize: 14, fontWeight: 600, color: "#0A0A0A", margin: 0 }}>
                Ask Reco!
              </p>
              <button
                onClick={() => setOpen(false)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: 4,
                  color: "#999",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "16px 20px",
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              {messages.length === 0 && !loading && (
                <p style={{ fontSize: 13, color: "#999", textAlign: "center", marginTop: 32 }}>
                  Ask anything about Meridian's finances.
                </p>
              )}

              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.role === "user" ? "flex-end" : "flex-start",
                    maxWidth: "85%",
                  }}
                >
                  <div
                    style={{
                      padding: "10px 14px",
                      borderRadius: m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: m.role === "user" ? "#0A0A0A" : "#F5F5F5",
                      color: m.role === "user" ? "#FFFFFF" : "#0A0A0A",
                      fontSize: 13,
                      lineHeight: 1.55,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div style={{ alignSelf: "flex-start" }}>
                  <div
                    style={{
                      padding: "12px 16px",
                      borderRadius: "16px 16px 16px 4px",
                      background: "#F5F5F5",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                    }}
                  >
                    {[0, 0.18, 0.36].map((delay, i) => (
                      <span
                        key={i}
                        style={{
                          width: 6,
                          height: 6,
                          borderRadius: "50%",
                          background: "#BBBDC4",
                          display: "inline-block",
                          animation: `dotBounce 1.1s ${delay}s ease-in-out infinite`,
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Prompt chips — always visible when not loading */}
              {!loading && (
                <div style={{ display: "flex", flexDirection: "column", gap: 7, marginTop: messages.length === 0 ? 4 : 8 }}>
                  {PRESET_PROMPTS.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => handleChipClick(p)}
                      style={{
                        background: "#F7F8FA",
                        border: "1px solid #E5E7EB",
                        borderRadius: 999,
                        padding: "7px 14px",
                        fontSize: 12,
                        color: "#374151",
                        cursor: "pointer",
                        textAlign: "left",
                        lineHeight: 1.4,
                        transition: "background 120ms, border-color 120ms",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "#EEEEF1";
                        e.currentTarget.style.borderColor = "#D1D5DB";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "#F7F8FA";
                        e.currentTarget.style.borderColor = "#E5E7EB";
                      }}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ padding: "12px 16px", borderTop: "1px solid #F0F0F0", flexShrink: 0 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  border: "1px solid #E5E7EB",
                  borderRadius: 999,
                  padding: "4px 4px 4px 14px",
                  background: "#FAFAFA",
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask a question..."
                  style={{
                    flex: 1,
                    border: "none",
                    background: "transparent",
                    outline: "none",
                    fontSize: 13,
                    color: "#0A0A0A",
                  }}
                  disabled={loading}
                />
                <button
                  onClick={handleSend}
                  disabled={loading || !query.trim()}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    background: loading || !query.trim() ? "#D1D5DB" : "#0A0A0A",
                    border: "none",
                    cursor: loading || !query.trim() ? "default" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    transition: "background 0.15s",
                  }}
                >
                  <ArrowUp size={14} style={{ color: "#FFFFFF" }} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dot animation keyframes */}
      <style>{`
        @keyframes dotBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-5px); }
        }
      `}</style>
    </>
  );
};

export default FloatingChat;
