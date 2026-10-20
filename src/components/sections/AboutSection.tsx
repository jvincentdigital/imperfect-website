"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

export default function AboutSection() {
  const t = useTranslations("about");
  const locale = useLocale();

  return (
    <section className="section">
      <div className="container-x">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <Reveal>
            <span className="eyebrow">{t("eyebrow")}</span>
            <h2 className="section-title" style={{ marginBottom: "24px" }}>
              {t("title")}
            </h2>
            <p className="lead" style={{ marginBottom: "36px" }}>
              {t("body")}
            </p>
            <Link href={`/${locale}/about`} className="btn-primary">
              {t("cta")}
            </Link>
          </Reveal>

          <Reveal delay={0.1}>
            <div
              style={{
                background: "radial-gradient(120% 90% at 100% 100%, rgba(200,228,0,0.08), transparent 55%), #111111",
                border: "1px solid #262626",
                borderTop: "3px solid #C8E400",
                borderRadius: "10px",
                boxShadow: "0 30px 60px -30px rgba(0,0,0,0.8)",
                aspectRatio: "4/3",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "clamp(24px, 3vw, 36px)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Large watermark text */}
              <span
                className="font-heading font-black uppercase"
                style={{
                  position: "absolute",
                  bottom: "-16px",
                  right: "-8px",
                  fontSize: "clamp(80px, 14vw, 130px)",
                  color: "#C8E400",
                  opacity: 0.06,
                  lineHeight: 1,
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              >
                IMP
              </span>

              {/* Top: logo */}
              <div>
                <span className="font-heading font-black" style={{ fontSize: "26px", letterSpacing: "-0.01em" }}>
                  <span style={{ color: "#C8E400" }}>IM</span>
                  <span style={{ color: "#FFFFFF" }}>PERFECT</span>
                </span>
                <p style={{ fontSize: "11px", color: "var(--color-dim)", textTransform: "uppercase", letterSpacing: "0.15em", marginTop: "6px" }}>{t("org_label")}</p>
              </div>

              {/* Stats */}
              <div style={{ display: "flex", gap: "clamp(24px, 4vw, 48px)" }}>
                {[
                  { value: "2017", label: t("stat_founded") },
                  { value: "3",    label: t("stat_teams") },
                  { value: "PR",   label: t("stat_based") },
                ].map((s) => (
                  <div key={s.label}>
                    <p className="font-heading font-black tabular" style={{ fontSize: "clamp(32px, 3.4vw, 44px)", color: "#C8E400", lineHeight: 1 }}>{s.value}</p>
                    <p style={{ fontSize: "11px", color: "var(--color-dim)", textTransform: "uppercase", letterSpacing: "0.14em", marginTop: "8px", fontWeight: 500 }}>{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
