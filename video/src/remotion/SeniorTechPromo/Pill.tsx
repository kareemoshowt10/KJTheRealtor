import React from "react";
import { GOLD, NAVY_SOFT } from "./palette";
import { FadeIn } from "./FadeIn";

export const Pill: React.FC<{ label: string; delay: number }> = ({
  label,
  delay,
}) => {
  return (
    <FadeIn delay={delay} y={16}>
      <div
        style={{
          padding: "18px 32px",
          borderRadius: 999,
          border: `1.5px solid ${GOLD}`,
          backgroundColor: NAVY_SOFT,
          color: GOLD,
          fontSize: 32,
          fontWeight: 600,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
    </FadeIn>
  );
};
