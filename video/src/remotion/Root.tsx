import { Composition } from "remotion";
import {
  COMP_NAME,
  defaultFirstTimeBuyerPromoProps,
  defaultMyCompProps,
  defaultSeniorTechPromoProps,
  DURATION_IN_FRAMES,
  FIRST_TIME_BUYER_COMP_NAME,
  FIRST_TIME_BUYER_DURATION_IN_FRAMES,
  FIRST_TIME_BUYER_FPS,
  FIRST_TIME_BUYER_HEIGHT,
  FIRST_TIME_BUYER_WIDTH,
  FirstTimeBuyerPromoProps,
  SENIOR_TECH_COMP_NAME,
  SENIOR_TECH_DURATION_IN_FRAMES,
  SENIOR_TECH_FPS,
  SENIOR_TECH_HEIGHT,
  SENIOR_TECH_WIDTH,
  SeniorTechPromoProps,
  VIDEO_FPS,
  VIDEO_HEIGHT,
  VIDEO_WIDTH,
} from "../../types/constants";
import { FirstTimeBuyerPromo } from "./FirstTimeBuyerPromo";
import { Main } from "./MyComp/Main";
import { NextLogo } from "./MyComp/NextLogo";
import { SeniorTechPromo } from "./SeniorTechPromo";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id={COMP_NAME}
        component={Main}
        durationInFrames={DURATION_IN_FRAMES}
        fps={VIDEO_FPS}
        width={VIDEO_WIDTH}
        height={VIDEO_HEIGHT}
        defaultProps={defaultMyCompProps}
      />
      <Composition
        id="NextLogo"
        component={NextLogo}
        durationInFrames={300}
        fps={30}
        width={140}
        height={140}
        defaultProps={{
          outProgress: 0,
        }}
      />
      <Composition
        id={SENIOR_TECH_COMP_NAME}
        component={SeniorTechPromo}
        durationInFrames={SENIOR_TECH_DURATION_IN_FRAMES}
        fps={SENIOR_TECH_FPS}
        width={SENIOR_TECH_WIDTH}
        height={SENIOR_TECH_HEIGHT}
        schema={SeniorTechPromoProps}
        defaultProps={defaultSeniorTechPromoProps}
      />
      <Composition
        id={FIRST_TIME_BUYER_COMP_NAME}
        component={FirstTimeBuyerPromo}
        durationInFrames={FIRST_TIME_BUYER_DURATION_IN_FRAMES}
        fps={FIRST_TIME_BUYER_FPS}
        width={FIRST_TIME_BUYER_WIDTH}
        height={FIRST_TIME_BUYER_HEIGHT}
        schema={FirstTimeBuyerPromoProps}
        defaultProps={defaultFirstTimeBuyerPromoProps}
      />
    </>
  );
};
