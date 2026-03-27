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
  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
    <div
      style={{
        width: 6,
        height: 6,
        borderRadius: "50%",
        background: dotColor[condition],
        flexShrink: 0,
      }}
    />
    <span style={{ fontSize: 13, color: "#5A6178", whiteSpace: "nowrap" }}>
      {condition}
    </span>
  </div>
);

export default ConditionIndicator;
