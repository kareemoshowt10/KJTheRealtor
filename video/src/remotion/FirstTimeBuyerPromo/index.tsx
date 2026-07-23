import React from "react";
import { AbsoluteFill, Img, Sequence, staticFile } from "remotion";
import { z } from "zod";
import { FirstTimeBuyerPromoProps } from "../../../types/constants";
import { Backdrop } from "../shared/Backdrop";
import { FadeIn } from "../shared/FadeIn";
import { CREAM, GOLD, GOLD_LIGHT } from "../shared/palette";
import { Pill } from "../shared/Pill";
import {
  Body,
  bodyFont,
  displayFont,
  Eyebrow,
  Headline,
  ProblemLine,
  Rule,
} from "../shared/Typography";

export const FirstTimeBuyerPromo: React.FC<
  z.infer<typeof FirstTimeBuyerPromoProps>
> = ({ name, phone, dre }) => {
  return (
    <AbsoluteFill>
      {/* Scene 1 — Hook / brand intro (0-150 | 0-5s) */}
      <Sequence durationInFrames={150}>
        <Backdrop photo="hero-buyers.jpg" dim={0.72} />
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
              Your First Home
              <br />
              Starts Here
            </Headline>
          </FadeIn>
          <FadeIn delay={32}>
            <Rule />
          </FadeIn>
          <FadeIn delay={42}>
            <Body>Buyer representation for first-time buyers in the Valley.</Body>
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
            gap: 44,
          }}
        >
          <ProblemLine delay={8}>
            Not sure how much home you can actually afford?
          </ProblemLine>
          <ProblemLine delay={38}>
            Worried about losing out in a multiple-offer situation?
          </ProblemLine>
          <ProblemLine delay={68}>
            Don&rsquo;t know FHA from conventional from VA?
          </ProblemLine>
          <FadeIn delay={110} y={16} style={{ marginTop: 24 }}>
            <Body>You don&rsquo;t have to figure this out alone.</Body>
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
            <Headline size={62}>
              Step-by-Step Guidance,
              <br />
              Start to Finish
            </Headline>
          </FadeIn>
          <FadeIn delay={40}>
            <Body>
              From pre-approval to closing day &mdash; explained in plain
              English.
            </Body>
          </FadeIn>
          <FadeIn delay={56}>
            <Eyebrow>No pressure &middot; no jargon &middot; just a plan</Eyebrow>
          </FadeIn>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 4 — What we help with (480-630 | 16-21s) */}
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
            <Headline size={60}>
              Everything Your
              <br />
              First Home Needs
            </Headline>
          </FadeIn>
          <FadeIn delay={24}>
            <Body>One trusted guide through the entire process.</Body>
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
            <Pill label="Pre-Approval Guidance" delay={42} />
            <Pill label="Offer Strategy" delay={56} />
            <Pill label="FHA · VA · Conventional" delay={70} />
            <Pill label="Closing Cost Planning" delay={84} />
          </div>
        </AbsoluteFill>
      </Sequence>

      {/* Scene 5 — Free strategy session (630-750 | 21-25s) */}
      <Sequence from={630} durationInFrames={120}>
        <Backdrop />
        <AbsoluteFill
          style={{
            justifyContent: "center",
            alignItems: "center",
            gap: 26,
            padding: "0 80px",
          }}
        >
          <FadeIn delay={4}>
            <Eyebrow>Free &middot; no obligation</Eyebrow>
          </FadeIn>
          <FadeIn delay={16} y={40}>
            <div
              style={{
                fontFamily: displayFont,
                color: GOLD_LIGHT,
                fontSize: 88,
                fontWeight: 700,
                textAlign: "center",
                lineHeight: 1.1,
              }}
            >
              Buyer Strategy
              <br />
              Session
            </div>
          </FadeIn>
          <FadeIn delay={46}>
            <Body>
              Let&rsquo;s map your path to pre-approval, an offer, and your
              first set of keys.
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
              The patience of family. The skill of a strategist.
            </div>
          </FadeIn>
          <FadeIn delay={64} style={{ marginTop: 10 }}>
            <div
              style={{
                fontFamily: bodyFont,
                color: CREAM,
                opacity: 0.6,
                fontSize: 24,
                textAlign: "center",
              }}
            >
              {name} &middot; {dre} &middot; Rodeo Realty Fine Estates
            </div>
          </FadeIn>
        </AbsoluteFill>
      </Sequence>
    </AbsoluteFill>
  );
};
