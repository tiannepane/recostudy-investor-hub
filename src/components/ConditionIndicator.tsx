export type Condition = "Poor" | "Fair" | "Good" | "Excellent";

const config: Record<Condition, { filled: number; color: string }> = {
  Poor:      { filled: 1, color: "#EF4444" },
  Fair:      { filled: 2, color: "#F59E0B" },
  Good:      { filled: 3, color: "#3B82F6" },
  Excellent: { filled: 4, color: "#10B981" },
};

interface Props {
  condition: Condition;
}

const ConditionIndicator = ({ condition }: Props) => {
  const { filled, color } = config[condition];
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      {/* 4-segment bar: 4×10px + 3×2px gap = 46px wide, 6px tall */}
      <div style={{ display: "flex", gap: 2, flexShrink: 0 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 6,
              borderRadius: 2,
              background: i < filled ? color : "#E8EBF0",
            }}
          />
        ))}
      </div>
      <span style={{ fontSize: 12, color: "#5A6178", whiteSpace: "nowrap" }}>
        {condition}
      </span>
    </div>
  );
};

export default ConditionIndicator;
