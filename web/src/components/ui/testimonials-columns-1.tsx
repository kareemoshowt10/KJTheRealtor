"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export type Testimonial = {
  text: string;
  image: string;
  name: string;
  role: string;
};

export function TestimonialsColumn(props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) {
  return (
    <div className={props.className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 bg-transparent pb-6"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(({ text, image, name, role }, i) => (
                <div
                  key={`${index}-${i}`}
                  className={cn(
                    "w-full max-w-xs rounded-3xl border border-[#e3d8c7] bg-white p-8 shadow-gold"
                  )}
                >
                  <p className="text-[0.95rem] leading-relaxed text-navy">
                    &ldquo;{text}&rdquo;
                  </p>
                  <div className="mt-5 flex items-center gap-2">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      width={40}
                      height={40}
                      src={image}
                      alt=""
                      className="h-10 w-10 rounded-full object-cover"
                    />
                    <div className="flex flex-col">
                      <div className="text-sm font-semibold leading-5 tracking-tight text-navy">
                        {name}
                      </div>
                      <div className="text-xs leading-5 tracking-tight text-slateink opacity-80">
                        {role}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
}
