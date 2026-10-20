"use client";

import { useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import SplitText from "@/components/reactbits/SplitText";

gsap.registerPlugin(ScrollTrigger, useGSAP);

export default function Hero() {
  const locale = useLocale();
  const t = useTranslations("hero");
  const root = useRef<HTMLElement>(null);

  const STATS = [
    { value: "2017",  label: t("stat_founded") },
    { value: "8+",    label: t("stat_players") },
    { value: "2",     label: t("stat_titles") },
    { value: "20+",   label: t("stat_tournaments") },
    { value: "PR #1", label: t("stat_region") },
  ];

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add("(prefers-reduced-motion: no-preference)", () => {
        // Intro: accent bar draws down, then buttons and stats settle in. The paragraph stays put so it paints first.
        const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
        tl.fromTo("[data-hero-bar]", { scaleY: 0 }, { scaleY: 1, duration: 0.9, ease: "power4.inOut" }, 0)
          .fromTo("[data-hero='eyebrow']", { autoAlpha: 0, x: -12 }, { autoAlpha: 1, x: 0, duration: 0.5 }, 0.15)
          .fromTo("[data-hero='cta'] > *", { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 }, 0.85)
          .fromTo("[data-hero='rule']", { scaleX: 0 }, { scaleX: 1, duration: 0.9, ease: "power3.inOut" }, 0.95)
          .fromTo("[data-hero='stat']", { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.07 }, 1.05)
          .fromTo("[data-hero-word]", { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 1.4, ease: "power2.out" }, 0.3);

        // Depth on scroll: the outline word drifts slower than the page.
        gsap.to("[data-hero-word]", {
          yPercent: -35,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
      });

      // Glow follows the pointer on devices that have one.
      mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
        const section = root.current;
        if (!section) return;
        const xTo = gsap.quickTo("[data-hero-glow]", "x", { duration: 1.2, ease: "power3.out" });
        const yTo = gsap.quickTo("[data-hero-glow]", "y", { duration: 1.2, ease: "power3.out" });
        const onMove = (e: PointerEvent) => {
          const r = section.getBoundingClientRect();
          xTo((e.clientX - r.left - r.width / 2) * 0.25);
          yTo((e.clientY - r.top - r.height / 2) * 0.25);
        };
        section.addEventListener("pointermove", onMove);
        return () => section.removeEventListener("pointermove", onMove);
      });

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="hero-pre relative flex flex-col justify-center overflow-hidden"
      style={{ minHeight: "min(100svh, 960px)", background: "#141414", paddingTop: "72px" }}
    >
      {/* Background: soft lime light, dot grid, outline wordmark */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none" style={{ zIndex: 0 }}>
        <div data-hero-glow className="hero-glow" style={{ left: "62%" }} />
        <div className="absolute inset-0 bg-grid" style={{ opacity: 0.5, maskImage: "radial-gradient(ellipse at 60% 40%, #000 20%, transparent 75%)", WebkitMaskImage: "radial-gradient(ellipse at 60% 40%, #000 20%, transparent 75%)" }} />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent 60%, #141414 100%)" }} />
        <div
          data-hero-word
          className="hero-word absolute"
          style={{ fontSize: "clamp(140px, 26vw, 420px)", right: "-2vw", bottom: "-0.32em" }}
        >
          IMPERFECT
        </div>
      </div>

      {/* Left accent bar */}
      <div
        data-hero-bar
        aria-hidden="true"
        className="absolute left-0 top-0 bottom-0"
        style={{ width: "4px", background: "#C8E400", zIndex: 2, transformOrigin: "top" }}
      />

      <div className="container-x relative" style={{ zIndex: 2, paddingTop: "64px", paddingBottom: "64px" }}>
        <span data-hero="eyebrow" className="eyebrow">{t("eyebrow")}</span>

        <h1
          className="font-heading font-black uppercase"
          style={{ fontSize: "clamp(56px, 11vw, 128px)", lineHeight: 0.88, letterSpacing: "-0.01em", color: "#FFFFFF", marginBottom: "28px" }}
        >
          {/* One SplitText per line so the second line keeps the brand color. Screen readers get the plain copy. */}
          <span className="sr-only">{t("headline_1")} {t("headline_2")}</span>
          <span aria-hidden="true" className="block">
          <SplitText
            tag="span"
            text={t("headline_1")}
            textAlign="left"
            splitType="chars"
            effect="rise"
            mask
            trigger="load"
            delay={28}
            duration={0.9}
            ease="power4.out"
          />
          </span>
          <span aria-hidden="true" className="block">
          <SplitText
            tag="span"
            text={t("headline_2")}
            color="#C8E400"
            textAlign="left"
            splitType="chars"
            effect="rise"
            mask
            trigger="load"
            delay={28}
            duration={0.9}
            ease="power4.out"
          />
          </span>
        </h1>

        <p data-hero="copy" className="lead" style={{ fontSize: "clamp(16px, 1.4vw, 18px)", maxWidth: "30rem", marginBottom: "36px" }}>
          {t("description")}
        </p>

        <div data-hero="cta" className="flex flex-wrap" style={{ gap: "12px" }}>
          <Link href={`/${locale}/team`} className="btn-primary">{t("cta_team")}</Link>
          <Link href={`/${locale}/sponsorship`} className="btn-secondary">{t("cta_partner")}</Link>
        </div>

        <div style={{ marginTop: "clamp(48px, 7vw, 80px)" }}>
          <div data-hero="rule" aria-hidden="true" style={{ height: "1px", background: "linear-gradient(to right, #3A3A3A, #2A2A2A 60%, transparent)", transformOrigin: "left" }} />
          <dl className="flex flex-wrap" style={{ columnGap: "clamp(28px, 4vw, 56px)", rowGap: "24px", paddingTop: "28px" }}>
            {STATS.map((s) => (
              <div key={s.label} data-hero="stat" className="flex flex-col-reverse">
                <dt style={{ whiteSpace: "nowrap", fontSize: "11px", color: "var(--color-dim)", textTransform: "uppercase", letterSpacing: "0.14em", marginTop: "8px", fontWeight: 500 }}>
                  {s.label}
                </dt>
                <dd className="font-heading font-black tabular" style={{ fontSize: "clamp(28px, 3vw, 40px)", color: "#C8E400", lineHeight: 1 }}>
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
