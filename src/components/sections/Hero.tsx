"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import { m } from "framer-motion";
import { HeroCardRotator, HeroCardRow } from "./HeroPlayerCards";

// Background video: set NEXT_PUBLIC_HERO_VIDEO_URL (e.g. "/hero.mp4") once a clip
// exists. Empty by default, so the page never requests a missing file.
const HERO_VIDEO_URL = process.env.NEXT_PUBLIC_HERO_VIDEO_URL ?? "";

export default function Hero() {
  const locale = useLocale();
  const t = useTranslations("hero");

  const STATS = [
    { value: "2017",  label: t("stat_founded") },
    { value: "8+",    label: t("stat_players") },
    { value: "2",     label: t("stat_titles") },
    { value: "20+",   label: t("stat_tournaments") },
    { value: "PR #1", label: t("stat_region") },
  ];

  return (
    <section
      style={{
        position: "relative",
        minHeight: "100vh",
        background: "#1A1A1A",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        overflow: "hidden",
        paddingTop: "72px",
      }}
    >
      {/* Background video, only when a clip is configured */}
      {HERO_VIDEO_URL && (
      <video
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          zIndex: 0,
        }}
      >
        <source src={HERO_VIDEO_URL} type="video/mp4" />
      </video>
      )}

      {/* Dark overlay so text stays readable */}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.55) 60%, rgba(0,0,0,0.3) 100%)", zIndex: 1 }} />

      {/* Left accent bar */}
      <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", background: "#C8E400", zIndex: 2 }} />
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" style={{ zIndex: 1 }} />

      <div className="w-full hero-grid" style={{ maxWidth: "1280px", margin: "0 auto", padding: "80px 48px 80px 64px", position: "relative", zIndex: 2 }}>
        <div style={{ minWidth: 0 }}>
        <m.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}
        >
          <div style={{ width: "28px", height: "2px", background: "#C8E400", flexShrink: 0 }} />
          <span className="font-heading font-bold uppercase" style={{ fontSize: "11px", letterSpacing: "0.20em", color: "#C8E400" }}>
            {t("eyebrow")}
          </span>
        </m.div>

        <m.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-heading font-black uppercase"
          style={{ fontSize: "clamp(48px, 10vw, 96px)", lineHeight: 0.92, color: "#FFFFFF", marginBottom: "20px" }}
        >
          {t("headline_1")}
          <span style={{ display: "block", color: "#C8E400" }}>{t("headline_2")}</span>
        </m.h1>

        <m.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.25 }}
          style={{ fontSize: "15px", color: "#888888", maxWidth: "460px", lineHeight: 1.65, marginBottom: "32px" }}
        >
          {t("description")}
        </m.p>

        <m.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}
        >
          <Link href={`/${locale}/team`} className="btn-primary">{t("cta_team")}</Link>
          <Link href={`/${locale}/sponsorship`} className="btn-secondary">{t("cta_partner")}</Link>
        </m.div>

        <m.div
          className="hero-cards-row"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.45 }}
        >
          <HeroCardRow />
        </m.div>

        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          style={{ borderTop: "1px solid #2A2A2A", paddingTop: "32px", marginTop: "40px", display: "flex", gap: "40px", flexWrap: "wrap" }}
        >
          {STATS.map((s) => (
            <div key={s.label}>
              <p className="font-heading font-black" style={{ fontSize: "32px", color: "#C8E400", lineHeight: 1 }}>{s.value}</p>
              <p style={{ fontSize: "10px", color: "#666666", textTransform: "uppercase", letterSpacing: "0.12em", marginTop: "4px" }}>{s.label}</p>
            </div>
          ))}
        </m.div>
        </div>

        <m.div
          className="hero-cards-rotator"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <HeroCardRotator />
        </m.div>
      </div>
    </section>
  );
}
