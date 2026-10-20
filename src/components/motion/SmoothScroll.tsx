"use client";

import { useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scrolling for the public site, driven by the GSAP ticker so
 * ScrollTrigger reveals stay in sync. Wheel only: touch devices keep native
 * scrolling (and never downloads Lenis). Skipped entirely when the visitor
 * prefers reduced motion.
 */
export default function SmoothScroll() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    let cancelled = false;
    let cleanup = () => {};

    import("lenis").then(({ default: Lenis }) => {
      if (cancelled) return;
      const lenis = new Lenis({ lerp: 0.12, wheelMultiplier: 1, anchors: true });
      lenis.on("scroll", ScrollTrigger.update);
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      const onChange = () => {
        if (reduce.matches) lenis.destroy();
      };
      reduce.addEventListener("change", onChange);
      cleanup = () => {
        reduce.removeEventListener("change", onChange);
        gsap.ticker.remove(raf);
        lenis.destroy();
      };
    });

    return () => {
      cancelled = true;
      cleanup();
    };
  }, []);

  return null;
}
