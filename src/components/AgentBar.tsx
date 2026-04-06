import { motion, AnimatePresence } from "framer-motion";

export interface AgentBarProps {
  agentName: string;
  thinkingMessage: string;
  completeMessage: string;
  accentColor: string;
  isThinking: boolean;
  isComplete: boolean;
  isHidden: boolean;
}

const AgentBar = ({
  agentName,
  thinkingMessage,
  completeMessage,
  accentColor,
  isThinking,
  isComplete,
  isHidden,
}: AgentBarProps) => {
  if (isHidden) return null;

  const isComplete_ = isComplete && !isThinking;

  return (
    <div
      style={{
        height: 40,
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: isComplete_ ? "#F0FDF4" : "#F8F9FC",
        borderBottom: `1px solid ${isComplete_ ? "#BBF7D0" : "rgba(15,23,41,0.06)"}`,
        transition: "background 0.4s ease, border-color 0.4s ease",
        marginBottom: 20,
      }}
    >
      {/* Accent dot — pulses while thinking, static when complete */}
      {isThinking ? (
        <motion.span
          animate={{ opacity: [1, 0.25, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: accentColor,
            flexShrink: 0,
            display: "inline-block",
          }}
        />
      ) : (
        <span
          style={{
            width: 6,
            height: 6,
            borderRadius: "50%",
            background: "#22C55E",
            flexShrink: 0,
            display: "inline-block",
          }}
        />
      )}

      {/* Message — swaps between thinking and complete with a crossfade */}
      <AnimatePresence mode="wait" initial={false}>
        {isThinking ? (
          <motion.span
            key="thinking"
            initial={{ opacity: 0 }}
            animate={{ opacity: [1, 0.5, 1] }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            // The opacity keyframe loop for the shimmer effect
            transition={{
              opacity: {
                duration: 1.2,
                repeat: Infinity,
                ease: "easeInOut",
                // Override for the enter/exit transitions above
                times: [0, 0.5, 1],
              },
            }}
            style={{
              flex: 1,
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              color: "#5A6178",
            }}
          >
            {agentName} &mdash; {thinkingMessage}
          </motion.span>
        ) : (
          <motion.span
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            style={{
              flex: 1,
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              color: "#15803D",
              fontWeight: 500,
            }}
          >
            &#10003; {agentName} &mdash; {completeMessage}
          </motion.span>
        )}
      </AnimatePresence>

      {/* Timestamp — only visible in complete state */}
      <AnimatePresence>
        {isComplete_ && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            style={{ fontSize: 11, color: "#9CA3B8", flexShrink: 0 }}
          >
            just now
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AgentBar;
