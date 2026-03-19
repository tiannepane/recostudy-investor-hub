import { motion } from "framer-motion";

type ButtonState = "connect" | "connecting" | "connected";

interface IntegrationCardProps {
  name: string;
  logoSrc: string;
  buttonState: ButtonState;
  animateScale?: boolean;
}

const IntegrationCard = ({ name, logoSrc, buttonState, animateScale }: IntegrationCardProps) => {
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
    <motion.div
      className="card-base flex flex-col items-center justify-center"
      style={{ height: 160 }}
      animate={animateScale ? { scale: [1, 1.015, 1] } : {}}
      transition={{ duration: 0.3 }}
    >
      <img
        src={logoSrc}
        alt={name}
        className="rounded-lg mb-3"
        style={{ width: 40, height: 40 }}
      />
      <p className="text-[15px] font-medium text-heading mb-3">{name}</p>
      <button
        className="text-[12px] rounded-md transition-all duration-400 cursor-default"
        style={{
          padding: "6px 16px",
          ...buttonStyles[buttonState],
        }}
      >
        {buttonText[buttonState]}
      </button>
    </motion.div>
  );
};

export default IntegrationCard;
export type { ButtonState };
