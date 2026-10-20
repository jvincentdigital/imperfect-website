"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";
import Reveal from "@/components/motion/Reveal";

export default function CommunitySection() {
  const t = useTranslations("community");
  const locale = useLocale();

  return (
    <section className="section" style={{ borderBottom: "none" }}>
      <div className="container-x">
        <Reveal
          y={32}
          style={{
            background: "radial-gradient(80% 60% at 50% 0%, rgba(200,228,0,0.10), transparent 70%), #111111",
            border: "1px solid #262626",
            borderTop: "3px solid #C8E400",
            borderRadius: "12px",
            padding: "clamp(48px, 7vw, 96px) clamp(20px, 5vw, 64px)",
            textAlign: "center",
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
          <div style={{ position: "relative", zIndex: 1 }}>
            <span className="eyebrow eyebrow-center">{t("eyebrow")}</span>
            <h2 className="font-heading font-black uppercase text-white leading-[0.92]" style={{ fontSize: "clamp(40px, 7vw, 80px)", marginBottom: "20px" }}>
              {t("title")}
            </h2>
            <p className="lead" style={{ margin: "0 auto 40px" }}>
              {t("subtitle")}
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="https://discord.gg/QgDansRt2p"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                <svg width="16" height="13" viewBox="0 0 71 55" fill="currentColor" aria-hidden="true" style={{ flexShrink: 0 }}>
                  <path d="M60.1 4.9A58.6 58.6 0 0 0 45.6.7a.2.2 0 0 0-.2.1 40.8 40.8 0 0 0-1.8 3.7 54.1 54.1 0 0 0-16.3 0A37.5 37.5 0 0 0 25.4.8a.2.2 0 0 0-.2-.1 58.4 58.4 0 0 0-14.5 4.2.2.2 0 0 0-.1.1C1.6 18.7-.9 32.2.3 45.4a.2.2 0 0 0 .1.2 58.9 58.9 0 0 0 17.7 8.9.2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.8 38.8 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.8a.2.2 0 0 1 .2 0c11.6 5.3 24.1 5.3 35.5 0a.2.2 0 0 1 .2 0l1.1.8a.2.2 0 0 1 0 .4 36.1 36.1 0 0 1-5.5 2.6.2.2 0 0 0-.1.3 47.1 47.1 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.7 58.7 0 0 0 17.8-8.9.2.2 0 0 0 .1-.2c1.4-15.2-2.4-28.5-10.1-40.3a.2.2 0 0 0-.1-.1ZM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Z"/>
                </svg>
                {t("discord_cta")}
              </Link>
              <Link href={`/${locale}/community`} className="btn-secondary">
                {t("events_cta")}
              </Link>
            </div>

            {/* Register Your Team CTA */}
            <div style={{ marginTop: "48px", paddingTop: "32px", borderTop: "1px solid #262626", maxWidth: "36rem", marginLeft: "auto", marginRight: "auto" }}>
              <p style={{ fontSize: "14px", color: "var(--color-muted)", marginBottom: "16px" }}>
                Have a team? Bring your squad to the community.
              </p>
              <Link
                href={`/${locale}/community/join`}
                className="font-heading transition-colors duration-200 ease-out hover:bg-lime/15 hover:border-lime/60"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  minHeight: "44px",
                  background: "rgba(200,228,0,0.08)",
                  border: "1px solid rgba(200,228,0,0.3)",
                  color: "#C8E400",
                  padding: "0 24px",
                  borderRadius: "4px",
                  fontSize: "14px",
                  fontWeight: 700,
                  textDecoration: "none",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                }}
              >
                Register Your Team <span className="arrow" aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
