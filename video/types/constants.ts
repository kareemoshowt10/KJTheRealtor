import { z } from "zod";
export const COMP_NAME = "MyComp";

export const CompositionProps = z.object({
  title: z.string(),
});

export const defaultMyCompProps: z.infer<typeof CompositionProps> = {
  title: "Next.js and Remotion",
};

export const DURATION_IN_FRAMES = 200;
export const VIDEO_WIDTH = 1280;
export const VIDEO_HEIGHT = 720;
export const VIDEO_FPS = 30;

export const SENIOR_TECH_COMP_NAME = "SeniorTechPromo";

export const SeniorTechPromoProps = z.object({
  name: z.string(),
  phone: z.string(),
  rate: z.string(),
});

export const defaultSeniorTechPromoProps: z.infer<
  typeof SeniorTechPromoProps
> = {
  name: "Kareem Jamal",
  phone: "(818) 402-7326",
  rate: "$55",
};

export const SENIOR_TECH_DURATION_IN_FRAMES = 900;
export const SENIOR_TECH_FPS = 30;
export const SENIOR_TECH_WIDTH = 1080;
export const SENIOR_TECH_HEIGHT = 1920;
