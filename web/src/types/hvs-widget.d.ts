import type { DetailedHTMLProps, HTMLAttributes } from "react";

type HvsWidgetProps = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> & {
  apikey?: string;
  placeholder?: string;
  "no-result-message"?: string;
  username?: string;
  "new-window"?: string;
};

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "hvs-widget": HvsWidgetProps;
    }
  }
}

export {};
