"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface Props {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Animate direct children marked with data-reveal one after another instead of the wrapper. */
  stagger?: number;
  /** Vertical travel in px. */
  y?: number;
  delay?: number;
  as?: "div" | "section" | "ul";
}

/**
 * Scroll reveal: fades and lifts content once as it enters the viewport.
 * Content is fully visible in the server HTML; the hidden start state is only
 * applied in the browser, and never when reduced motion is requested.
 */
export default function Reveal({ children, className, style, stagger, y = 24, delay = 0, as = "div" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el) return;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const targets = stagger ? el.querySelectorAll("[data-reveal]") : [el];
        if (!targets.length) return;
        gsap.from(targets, {
          autoAlpha: 0,
          y,
          duration: 0.7,
          delay,
          ease: "power3.out",
          stagger: stagger ?? 0,
          clearProps: "transform,opacity,visibility",
          scrollTrigger: { trigger: el, start: "top 85%", once: true },
        });
      });
      return () => mm.revert();
    },
    { scope: ref },
  );

  const Tag = as;
  return (
    <Tag ref={ref as never} className={className} style={style}>
      {children}
    </Tag>
  );
}
