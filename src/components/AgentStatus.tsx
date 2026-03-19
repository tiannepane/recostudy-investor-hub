import { useEffect, useState } from "react";

interface AgentStatusProps {
  messages: { text: string; color: "gray" | "green"; startTime: number }[];
  elapsed: number;
}

const AgentStatus = ({ messages, elapsed }: AgentStatusProps) => {
  const [displayText, setDisplayText] = useState("");
  const [activeMsg, setActiveMsg] = useState<{ text: string; color: "gray" | "green" } | null>(null);

  useEffect(() => {
    // Find the current active message
    let current: { text: string; color: "gray" | "green"; startTime: number } | null = null;
    for (let i = messages.length - 1; i >= 0; i--) {
      if (elapsed >= messages[i].startTime) {
        current = messages[i];
        break;
      }
    }

    if (!current) {
      setDisplayText("");
      setActiveMsg(null);
      return;
    }

    setActiveMsg({ text: current.text, color: current.color });
    const timeSinceStart = elapsed - current.startTime;
    const charsToShow = Math.min(Math.floor(timeSinceStart / 30), current.text.length);
    setDisplayText(current.text.substring(0, charsToShow));
  }, [elapsed, messages]);

  if (!activeMsg) return <div className="h-6" />;

  const dotColor = activeMsg.color === "green" ? "#10B981" : "#9CA3B8";
  const textColor = activeMsg.color === "green" ? "#10B981" : "#9CA3B8";

  return (
    <div className="flex items-center gap-2 h-6">
      <span
        className="inline-block rounded-full flex-shrink-0"
        style={{ width: 6, height: 6, background: dotColor }}
      />
      <span className="font-mono text-[13px]" style={{ color: textColor }}>
        {displayText}
      </span>
    </div>
  );
};

export default AgentStatus;
