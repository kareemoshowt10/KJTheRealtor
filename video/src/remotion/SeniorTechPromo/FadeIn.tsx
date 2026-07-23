import React from "react";
import { spring, useCurrentFrame, useVideoConfig } from "remotion";

export const FadeIn: React.FC<{
  delay?: number;
  y?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, y = 28, children, style }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    fps,
    frame,
    delay,
    config: { damping: 200, mass: 0.6 },
    durationInFrames: 22,
  });

  return (
    <div
      style={{
        opacity: progress,
        transform: `translateY(${(1 - progress) * y}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
