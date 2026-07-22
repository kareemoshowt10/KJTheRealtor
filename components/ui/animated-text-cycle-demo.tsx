"use client";

import AnimatedTextCycle from "@/components/ui/animated-text-cycle";

/** Demo for a React/shadcn app. Live site uses the hero vanilla port. */
export function AnimatedTextCycleDemo() {
  return (
    <div className="p-4 max-w-[560px]">
      <h1 className="text-4xl font-light text-left text-muted-foreground">
        Homeownership,{" "}
        <AnimatedTextCycle
          words={["explained.", "protected.", "planned.", "handed down."]}
          interval={3200}
          className="text-foreground font-semibold italic"
        />
      </h1>
    </div>
  );
}

export default AnimatedTextCycleDemo;
