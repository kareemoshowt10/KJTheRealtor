"use client";

import { Player } from "@remotion/player";
import type { NextPage } from "next";
import {
  defaultSeniorTechPromoProps,
  SENIOR_TECH_DURATION_IN_FRAMES,
  SENIOR_TECH_FPS,
  SENIOR_TECH_HEIGHT,
  SENIOR_TECH_WIDTH,
} from "../../types/constants";
import { SeniorTechPromo } from "../remotion/SeniorTechPromo";

const Home: NextPage = () => {
  return (
    <div>
      <div className="max-w-screen-sm m-auto mb-5 px-4">
        <div className="overflow-hidden rounded-geist shadow-[0_0_200px_rgba(0,0,0,0.15)] mb-10 mt-16">
          <Player
            component={SeniorTechPromo}
            inputProps={defaultSeniorTechPromoProps}
            durationInFrames={SENIOR_TECH_DURATION_IN_FRAMES}
            fps={SENIOR_TECH_FPS}
            compositionHeight={SENIOR_TECH_HEIGHT}
            compositionWidth={SENIOR_TECH_WIDTH}
            style={{
              width: "100%",
            }}
            controls
            autoPlay
            loop
            initiallyMuted
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
