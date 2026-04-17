export type Condition = "Poor" | "Fair" | "Good" | "Excellent";

const dotColor: Record<Condition, string> = {
  Poor:      "#EF4444",
  Fair:      "#F59E0B",
  Good:      "#10B981",
  Excellent: "#10B981",
};

interface Props {
  condition: Condition;
}

const ConditionIndicator = ({ condition }: Props) => (
  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
    <div
      style={{
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: dotColor[condition],
        flexShrink: 0,
      }}
    />
    <span style={{ fontSize: 18, color: "#334155", whiteSpace: "nowrap" }}>
      {condition}
    </span>
  </div>
);

export default ConditionIndicator;
