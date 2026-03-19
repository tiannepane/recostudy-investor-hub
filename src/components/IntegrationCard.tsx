import { motion } from "framer-motion";

type ButtonState = "connect" | "connecting" | "connected";

interface IntegrationCardProps {
  name: string;
  logoSrc: string;
  buttonState: ButtonState;
  animateScale?: boolean;
}

const IntegrationCard = ({ name, logoSrc, buttonState }: IntegrationCardProps) => {
  const buttonStyles: Record<ButtonState, React.CSSProperties> = {
    connect: {
      border: "1px solid hsl(var(--card-border))",
      color: "#5A6178",
      background: "transparent",
    },
    connecting: {
      border: "1px solid #4F6BFF",
      color: "white",
      background: "#4F6BFF",
    },
    connected: {
      border: "1px solid #D1FAE5",
      color: "#10B981",
      background: "#ECFDF5",
    },
  };

  const buttonText: Record<ButtonState, string> = {
    connect: "Connect",
    connecting: "Connecting...",
    connected: "✓ Connected",
  };

  return (
    <div
      className="rounded-xl border border-border bg-card/50 flex flex-col items-center justify-center"
      style={{ height: 160, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <img
        src={logoSrc}
        alt={name}
        className="rounded-lg mb-3 pointer-events-none select-none"
        style={{ width: 40, height: 40 }}
        draggable={false}
      />
      <p className="text-[15px] font-medium text-heading mb-3">{name}</p>
      <button
        className="text-[12px] rounded-md cursor-default"
        style={{
          padding: "6px 16px",
          transition: "background 300ms, color 300ms, border-color 300ms",
          ...buttonStyles[buttonState],
        }}
      >
        {buttonText[buttonState]}
      </button>
    </div>
  );
};

export default IntegrationCard;
export type { ButtonState };
