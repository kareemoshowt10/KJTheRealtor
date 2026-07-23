import React from "react";
import {
  AbsoluteFill,
  Img,
  interpolate,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { GOLD, NAVY } from "./palette";

export const Backdrop: React.FC<{ photo?: string; dim?: number }> = ({
  photo,
  dim = 0.8,
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const drift = interpolate(frame, [0, durationInFrames], [0, -24]);

  return (
    <AbsoluteFill style={{ backgroundColor: NAVY }}>
      {photo ? (
        <AbsoluteFill style={{ transform: `scale(1.1) translateY(${drift}px)` }}>
          <Img
            src={staticFile(photo)}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </AbsoluteFill>
      ) : null}
      <AbsoluteFill
        style={{
          background: `linear-gradient(180deg, rgba(11,30,62,${dim}) 0%, rgba(11,30,62,${Math.min(
            dim + 0.13,
            0.97,
          )}) 50%, rgba(11,30,62,0.97) 100%)`,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 900,
          height: 900,
          borderRadius: "50%",
          border: `1px solid rgba(201,168,76,0.18)`,
          top: -280,
          right: -320,
        }}
      />
      <div
        style={{
          position: "absolute",
          width: 620,
          height: 620,
          borderRadius: "50%",
          border: `1px solid rgba(201,168,76,0.14)`,
          bottom: -220,
          left: -260,
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)`,
          opacity: 0.6,
        }}
      />
    </AbsoluteFill>
  );
};
