"use client";

import { useTranslations } from "next-intl";
import Reveal from "@/components/motion/Reveal";
import SpotlightCard from "@/components/reactbits/SpotlightCard";

const games = [
  {
    key: "ow2",
    label: "OW2",
    color: "#F99E1A",
    stats: [
      { value: "5v5",  label: "Format" },
      { value: "T1",   label: "Rank" },
      { value: "PR #1",label: "Region" },
    ],
  },
  {
    key: "mr",
    label: "RIVALS",
    color: "#C8E400",
    stats: [
      { value: "6v6",   label: "Format" },
      { value: "Top 5", label: "Rank" },
      { value: "PR #1", label: "Region" },
    ],
  },
];

export default function GamesSection() {
  const t = useTranslations("games");

  return (
    <section className="section">
      <div className="container-x">
        <Reveal style={{ marginBottom: "clamp(40px, 5vw, 56px)" }}>
          <span className="eyebrow">{t("eyebrow")}</span>
          <h2 className="section-title">
            {t("title")}
          </h2>
          <p className="lead" style={{ marginTop: "16px" }}>
            {t("subtitle")}
          </p>
        </Reveal>

        <Reveal stagger={0.12} className="grid md:grid-cols-2 gap-4 md:gap-6">
          {games.map((game) => (
            <div key={game.key} data-reveal className="lift" style={{ borderRadius: "10px" }}>
            <SpotlightCard
              spotlightColor={game.color}
              intensity={0.12}
              borderGlow={0.7}
              spotlightSize={320}
              style={{ "--spotlight-card-surface": "#202020", "--spotlight-card-border": "rgba(255,255,255,0.07)", borderRadius: "10px", padding: "clamp(24px, 3vw, 36px)", height: "100%" } as React.CSSProperties}
            >
              {/* Top accent */}
              <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "3px", background: game.color }} />

              {/* Game badge row */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "28px" }}>
                <span
                  className="font-heading font-bold uppercase"
                  style={{
                    fontSize: "11px", letterSpacing: "0.18em", color: game.color,
                    background: `${game.color}14`, border: `1px solid ${game.color}40`,
                    padding: "4px 10px", borderRadius: "4px",
                  }}
                >
                  {game.label}
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: game.color }} />
                  <span className="font-heading font-bold uppercase" style={{ fontSize: "11px", color: "var(--color-dim)", letterSpacing: "0.15em" }}>{t("active")}</span>
                </span>
              </div>

              {/* Title */}
              <h3 className="font-heading font-black uppercase" style={{ fontSize: "clamp(28px, 3.2vw, 40px)", color: "#FFFFFF", marginBottom: "12px", lineHeight: 1 }}>
                {t(`${game.key}.name`)}
              </h3>

              {/* Description */}
              <p style={{ fontSize: "15px", color: "var(--color-muted)", lineHeight: 1.6, marginBottom: "28px", maxWidth: "26rem" }}>
                {t(`${game.key}.desc`)}
              </p>

              {/* Stat row */}
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingTop: "20px", borderTop: "1px solid #2E2E2E" }}>
                {game.stats.map((s, si) => (
                  <span
                    key={s.label}
                    className="font-heading font-bold uppercase"
                    style={{
                      fontSize: "11px", letterSpacing: "0.10em",
                      padding: "4px 10px", borderRadius: "4px",
                      ...(si === 0
                        ? { background: "#1A1A1A", border: "1px solid #2E2E2E", color: "var(--color-dim)" }
                        : { background: `${game.color}14`, border: `1px solid ${game.color}40`, color: game.color }
                      ),
                    }}
                  >
                    {s.value} · {s.label}
                  </span>
                ))}
              </div>
            </SpotlightCard>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
