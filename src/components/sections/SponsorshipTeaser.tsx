"use client";

import { useLocale, useTranslations } from "next-intl";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

const TIERS = [
  { name: "Associate",    color: "#7F8C8D" },
  { name: "Partner",      color: "#C8E400" },
  { name: "Title Sponsor",color: "#E74C3C" },
];

const PLATFORMS = ["Twitch", "TikTok", "Instagram", "YouTube", "Discord", "Twitter/X"];

export default function SponsorshipTeaser() {
  const locale = useLocale();
  const t = useTranslations("sponsorship_teaser");

  return (
    <section className="section">
      <div className="container-x">
        <div className="grid md:grid-cols-2 gap-12 md:gap-16 items-center">
          <Reveal>
            <span className="eyebrow">{t("eyebrow")}</span>
            <h2 className="section-title" style={{ marginBottom: "24px" }}>
              {t("title")}
            </h2>
            <p className="lead" style={{ marginBottom: "28px" }}>
              {t("description")}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginBottom: "36px" }}>
              {PLATFORMS.map((p) => (
                <span
                  key={p}
                  className="font-heading font-bold uppercase"
                  style={{ fontSize: "11px", letterSpacing: "0.12em", padding: "5px 10px", borderRadius: "4px", background: "#202020", border: "1px solid #2E2E2E", color: "var(--color-dim)" }}
                >
                  {p}
                </span>
              ))}
            </div>
            <Link href={`/${locale}/sponsorship`} className="btn-primary">
              {t("cta")}
            </Link>
          </Reveal>

          <Reveal stagger={0.08} delay={0.1} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {TIERS.map((tier) => (
              <div
                key={tier.name}
                data-reveal
                className="lift"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "14px",
                  padding: "22px 24px",
                  borderRadius: "10px",
                  background: `linear-gradient(90deg, ${tier.color}12, transparent 60%), #202020`,
                  border: `1px solid ${tier.color}25`,
                  borderLeft: `3px solid ${tier.color}`,
                }}
              >
                <span className="font-heading font-black uppercase" style={{ fontSize: "20px", letterSpacing: "0.02em", color: tier.color }}>
                  {tier.name}
                </span>
              </div>
            ))}
            <div data-reveal style={{ marginTop: "8px", paddingTop: "8px", borderTop: "1px solid #262626" }}>
              <a
                href="mailto:Imperfectgamingpr@gmail.com"
                className="hover:text-lime"
                style={{ fontSize: "14px", color: "var(--color-dim)", textDecoration: "none", transition: "color 0.2s ease-out", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: "44px" }}
              >
                <span>Imperfectgamingpr@gmail.com</span>
                <span className="arrow" aria-hidden="true">→</span>
              </a>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
