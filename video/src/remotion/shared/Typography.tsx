import React from "react";
import { FadeIn } from "./FadeIn";
import { CREAM, GOLD } from "./palette";

// System font stacks (matching the main site's display/sans fallbacks) so
// rendering never depends on fetching webfonts from Google Fonts.
export const displayFont = "Georgia, 'Times New Roman', serif";
export const bodyFont =
  "-apple-system, 'Segoe UI', system-ui, Roboto, Helvetica, Arial, sans-serif";

export const Eyebrow: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      fontFamily: bodyFont,
      color: GOLD,
      fontSize: 30,
      fontWeight: 600,
      letterSpacing: 6,
      textTransform: "uppercase",
      textAlign: "center",
      maxWidth: 900,
    }}
  >
    {children}
  </div>
);

export const Headline: React.FC<{
  children: React.ReactNode;
  size?: number;
}> = ({ children, size = 76 }) => (
  <div
    style={{
      fontFamily: displayFont,
      color: "white",
      fontSize: size,
      fontWeight: 700,
      lineHeight: 1.08,
      textAlign: "center",
      textWrap: "balance",
    }}
  >
    {children}
  </div>
);

export const Body: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => (
  <div
    style={{
      fontFamily: bodyFont,
      color: CREAM,
      opacity: 0.92,
      fontSize: 38,
      fontWeight: 400,
      lineHeight: 1.4,
      textAlign: "center",
      maxWidth: 820,
    }}
  >
    {children}
  </div>
);

export const Rule: React.FC = () => (
  <div style={{ width: 84, height: 3, backgroundColor: GOLD }} />
);

export const ProblemLine: React.FC<{
  children: React.ReactNode;
  delay: number;
}> = ({ children, delay }) => (
  <FadeIn delay={delay} y={20}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        fontFamily: bodyFont,
        color: "white",
        fontSize: 40,
        fontWeight: 600,
        maxWidth: 860,
      }}
    >
      <span
        style={{
          width: 16,
          height: 16,
          borderRadius: "50%",
          backgroundColor: GOLD,
          flexShrink: 0,
        }}
      />
      {children}
    </div>
  </FadeIn>
);
