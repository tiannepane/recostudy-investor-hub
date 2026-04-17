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
      color: "#334155",
      background: "transparent",
    },
    connecting: {
      border: "1px solid #4D6BA9",
      color: "white",
      background: "#4D6BA9",
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
      style={{ height: 200, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
    >
      <img
        src={logoSrc}
        alt={name}
        className="rounded-lg mb-3 pointer-events-none select-none"
        style={{ width: 52, height: 52 }}
        draggable={false}
      />
      <p className="text-[21px] font-medium text-heading mb-3">{name}</p>
      <button
        className="text-[17px] rounded-md cursor-default"
        style={{
          padding: "8px 20px",
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
