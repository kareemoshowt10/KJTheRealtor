import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile } from "remotion";
import { z } from "zod";
import { SeniorTechPromoProps } from "../../../types/constants";
import { Backdrop } from "./Backdrop";
import { FadeIn } from "./FadeIn";
import { CREAM, GOLD, GOLD_LIGHT } from "./palette";
import { Pill } from "./Pill";

// System font stacks (matching the main site's display/sans fallbacks) so
// rendering never depends on fetching webfonts from Google Fonts.
const displayFont = "Georgia, 'Times New Roman', serif";
const bodyFont =
  "-apple-system, 'Segoe UI', system-ui, Roboto, Helvetica, Arial, sans-serif";

const Eyebrow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div
    style={{
      fontFamily: bodyFont,
      color: GOLD,
      fontSize: 30,
      fontWeight: 600,
      letterSpacing: 6,
      textTransform: "uppercase",
    }}
  >
    {children}
  </div>
);

const Headline: React.FC<{ children: React.ReactNode; size?: number }> = ({
  children,
  size = 76,
}) => (
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

const Body: React.FC<{ children: React.ReactNode }> = ({ children }) => (
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

const Rule: React.FC = () => (
  <div style={{ width: 84, height: 3, backgroundColor: GOLD }} />
);

const ProblemLine: React.FC<{ children: React.ReactNode; delay: number }> = ({
  children,
  delay,
}) => (
  <FadeIn delay={delay} y={20}>
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 24,
        fontFamily: bodyFont,
        color: "white",
        fontSize: 42,
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

export const SeniorTechPromo: React.FC<z.infer<typeof SeniorTechPromoProps>> = ({
  name,
  phone,
  rate,
}) => {
  return (
    <AbsoluteFill>
      {/* Scene 1 — Hook / brand intro (0-150 | 0-5s) */}
      <Sequence durationInFrames={150}>
        <Backdrop photo="kareem-with-seniors-kitchen.jpg" dim={0.72} />
        <AbsoluteFill
          style={{
            justifyContent: "flex-end",
            alignItems: "center",
            padding: "0 80px 180px",
            gap: 28,
          }}
        >
          <FadeIn delay={6}>
            <Eyebrow>{name}</Eyebrow>
          </FadeIn>
          <FadeIn delay={16}>
            <Headline>
              Patient Tech Help
              <br />
              for Seniors
            </Headline>
          </FadeIn>
          <FadeIn delay={32}>
            <Rule />
          </FadeIn>
          <FadeIn delay={42}>
            <Body>Real help. Real patience. No judgment.</Body>
          </FadeIn>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 2 — Problem hook (150-330 | 5-11s) */}
      <Sequence from={150} durationInFrames={180}>
        <Backdrop />
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 90px",
            gap: 48,
          }}
        >
          <ProblemLine delay={8}>
            Confused by your phone or computer?
          </ProblemLine>
          <ProblemLine delay={38}>
            Worried about scams and spam calls?
          </ProblemLine>
          <ProblemLine delay={68}>
            Want easy video calls with the grandkids?
          </ProblemLine>
          <FadeIn delay={110} y={16} style={{ marginTop: 24 }}>
            <Body>
              You&rsquo;re not alone &mdash; and it&rsquo;s not too late to
              feel confident again.
            </Body>
          </FadeIn>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 3 — Solution / meet Kareem (330-480 | 11-16s) */}
      <Sequence from={330} durationInFrames={150}>
        <Backdrop />
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 90px",
            gap: 34,
          }}
        >
          <FadeIn delay={4}>
            <div
              style={{
                width: 200,
                height: 200,
                borderRadius: "50%",
                overflow: "hidden",
                border: `4px solid ${GOLD}`,
                boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              }}
            >
              <Img
                src={staticFile("kareem-jamal-headshot.jpg")}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "top center",
                }}
              />
            </div>
          </FadeIn>
          <FadeIn delay={22}>
            <Headline size={64}>
              One-on-One Help,
              <br />
              at Your Pace
            </Headline>
          </FadeIn>
          <FadeIn delay={40}>
            <Body>
              In plain English. At your kitchen table or over the phone.
            </Body>
          </FadeIn>
          <FadeIn delay={56}>
            <Eyebrow>No jargon &middot; no rushing &middot; ever</Eyebrow>
          </FadeIn>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4 — AI introductions (480-630 | 16-21s) */}
      <Sequence from={480} durationInFrames={150}>
        <Backdrop />
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 80px",
            gap: 40,
          }}
        >
          <FadeIn delay={4}>
            <Headline size={62}>
              Now Introducing:
              <br />
              Friendly AI Help
            </Headline>
          </FadeIn>
          <FadeIn delay={24}>
            <Body>
              Simple introductions to tools that make everyday life easier.
            </Body>
          </FadeIn>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              gap: 20,
              maxWidth: 900,
              marginTop: 12,
            }}
          >
            <Pill label="Email & Scam Filters" delay={42} />
            <Pill label="Voice Assistants" delay={56} />
            <Pill label="Video Calls" delay={70} />
            <Pill label="Smart Reminders" delay={84} />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5 — Price reveal (630-750 | 21-25s) */}
      <Sequence from={630} durationInFrames={120}>
        <Backdrop />
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: 26,
          }}
        >
          <FadeIn delay={4}>
            <Eyebrow>Simple, honest pricing</Eyebrow>
          </FadeIn>
          <FadeIn delay={16} y={40}>
            <div
              style={{
                display: "flex",
                alignItems: "baseline",
                gap: 16,
                fontFamily: displayFont,
                color: GOLD_LIGHT,
              }}
            >
              <span style={{ fontSize: 190, fontWeight: 700 }}>{rate}</span>
              <span
                style={{
                  fontFamily: bodyFont,
                  fontSize: 40,
                  fontWeight: 600,
                  color: "white",
                }}
              >
                / hour
              </span>
            </div>
          </FadeIn>
          <FadeIn delay={40}>
            <Body>
              No contracts. No packages. Just help when you need it.
            </Body>
          </FadeIn>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 6 — Call to action (750-900 | 25-30s) */}
      <Sequence from={750} durationInFrames={150}>
        <Backdrop />
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            padding: "0 80px",
            gap: 30,
          }}
        >
          <FadeIn delay={6}>
            <Headline size={64}>Call or Text {name.split(" ")[0]}</Headline>
          </FadeIn>
          <FadeIn delay={24}>
            <div
              style={{
                fontFamily: displayFont,
                color: GOLD,
                fontSize: 78,
                fontWeight: 700,
              }}
            >
              {phone}
            </div>
          </FadeIn>
          <FadeIn delay={42}>
            <Rule />
          </FadeIn>
          <FadeIn delay={52}>
            <div
              style={{
                fontFamily: displayFont,
                color: CREAM,
                fontSize: 34,
                fontStyle: "italic",
                textAlign: "center",
                maxWidth: 780,
                opacity: 0.9,
              }}
            >
              The patience of family. The skill of a guide.
            </div>
          </FadeIn>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
