"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

const SOCIALS = [
  {
    label: "Twitter / X",
    href: "https://x.com/Imperfectow",
    primary: false,
    svg: (
      <svg width="16" height="16" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
      </svg>
    ),
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/Imperfectgamingpr",
    primary: false,
    svg: (
      <svg width="16" height="16" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
      </svg>
    ),
  },
  {
    label: "TikTok",
    href: "#", /* TODO: add TikTok handle when available */
    primary: false,
    svg: (
      <svg width="16" height="16" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.28 8.28 0 0 0 4.84 1.54V6.78a4.85 4.85 0 0 1-1.07-.09z"/>
      </svg>
    ),
  },
  {
    label: "YouTube",
    href: "#", /* TODO: add YouTube channel when available */
    primary: false,
    svg: (
      <svg width="16" height="16" aria-hidden="true" viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
      </svg>
    ),
  },
  {
    label: "Discord",
    href: "https://discord.gg/QgDansRt2p",
    primary: true,
    svg: (
      <svg width="16" height="16" aria-hidden="true" viewBox="0 0 71 55" fill="currentColor">
        <path d="M60.1 4.9A58.6 58.6 0 0 0 45.6.7a.2.2 0 0 0-.2.1 40.8 40.8 0 0 0-1.8 3.7 54.1 54.1 0 0 0-16.3 0A37.5 37.5 0 0 0 25.4.8a.2.2 0 0 0-.2-.1 58.4 58.4 0 0 0-14.5 4.2.2.2 0 0 0-.1.1C1.6 18.7-.9 32.2.3 45.4a.2.2 0 0 0 .1.2 58.9 58.9 0 0 0 17.7 8.9.2.2 0 0 0 .2-.1 42 42 0 0 0 3.6-5.9.2.2 0 0 0-.1-.3 38.8 38.8 0 0 1-5.5-2.6.2.2 0 0 1 0-.4l1.1-.8a.2.2 0 0 1 .2 0c11.6 5.3 24.1 5.3 35.5 0a.2.2 0 0 1 .2 0l1.1.8a.2.2 0 0 1 0 .4 36.1 36.1 0 0 1-5.5 2.6.2.2 0 0 0-.1.3 47.1 47.1 0 0 0 3.6 5.9.2.2 0 0 0 .2.1 58.7 58.7 0 0 0 17.8-8.9.2.2 0 0 0 .1-.2c1.4-15.2-2.4-28.5-10.1-40.3a.2.2 0 0 0-.1-.1ZM23.7 37.3c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Zm23.6 0c-3.5 0-6.4-3.2-6.4-7.1s2.8-7.1 6.4-7.1c3.6 0 6.5 3.2 6.4 7.1 0 3.9-2.8 7.1-6.4 7.1Z"/>
      </svg>
    ),
  },
];

export default function Footer() {
  const t = useTranslations("footer");
  const locale = useLocale();

  const NAV_LINKS = [
    { href: `/${locale}/team`,        label: t("links_team") },
    { href: `/${locale}/games`,       label: t("links_games") },
    { href: `/${locale}/results`,     label: t("links_results") },
    { href: `/${locale}/community`,   label: t("links_community") },
    { href: `/${locale}/news`,        label: t("links_news") },
    { href: `/${locale}/sponsorship`, label: t("links_sponsorship") },
    { href: `/${locale}/about`,       label: t("links_about") },
  ];

  return (
    <footer style={{ background: "#111111", borderTop: "1px solid #1F1F1F" }}>
      <div className="container-x" style={{ paddingTop: "clamp(56px, 7vw, 80px)", paddingBottom: "32px" }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">

          {/* Col 1 — Brand */}
          <div>
            <span className="font-heading font-black uppercase" style={{ fontSize: "22px" }}>
              <span style={{ color: "#C8E400" }}>IM</span>
              <span style={{ color: "#FFFFFF" }}>PERFECT</span>
            </span>
            <p style={{ fontSize: "14px", color: "var(--color-dim)", marginTop: "12px", lineHeight: 1.6 }}>
              {t("tagline_sub")}
            </p>
            <a
              href="mailto:Imperfectgamingpr@gmail.com"
              className="link-draw"
              style={{ fontSize: "14px", color: "#C8E400", marginTop: "12px", display: "inline-block" }}
            >
              Imperfectgamingpr@gmail.com
            </a>
          </div>

          {/* Col 2 — Nav */}
          <div>
            <p className="font-heading font-bold uppercase" style={{ fontSize: "12px", letterSpacing: "0.18em", color: "#C8E400", marginBottom: "12px" }}>
              {t("nav_title")}
            </p>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-white"
                  style={{ fontSize: "14px", color: "var(--color-dim)", lineHeight: 1.4, padding: "6px 0", width: "fit-content", textDecoration: "none", transition: "color 0.2s ease-out" }}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Col 3 — Socials */}
          <div>
            <p className="font-heading font-bold uppercase" style={{ fontSize: "12px", letterSpacing: "0.18em", color: "#C8E400", marginBottom: "12px" }}>
              {t("social_title")}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {SOCIALS.map((s) => (
                <Link
                  key={s.label}
                  href={s.href}
                  target={s.href !== "#" ? "_blank" : undefined}
                  rel={s.href !== "#" ? "noopener noreferrer" : undefined}
                  aria-label={s.label}
                  style={{
                    width: "44px",
                    height: "44px",
                    background: "#1A1A1A",
                    border: `1px solid ${s.primary ? "#C8E400" : "#2A2A2A"}`,
                    borderRadius: "6px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: s.primary ? "#C8E400" : "#A1A1A1",
                    transition: "border-color 0.2s ease-out, color 0.2s ease-out, transform 0.2s ease-out",
                    textDecoration: "none",
                  }}
                  className="hover:!border-lime hover:!text-lime hover:-translate-y-0.5 motion-reduce:hover:translate-y-0"
                >
                  {s.svg}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: "1px solid #1F1F1F", marginTop: "56px", paddingTop: "24px", textAlign: "center" }}>
          <p style={{ fontSize: "12px", color: "var(--color-faint)" }}>
            © {new Date().getFullYear()} {t("copyright")}
          </p>
        </div>
      </div>
    </footer>
  );
}
