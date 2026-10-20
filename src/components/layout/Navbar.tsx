"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useLocale } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import LanguageToggle from "@/components/ui/LanguageToggle";

export default function Navbar() {
  const t = useTranslations("nav");
  const locale = useLocale();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setDrawerOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [drawerOpen]);

  const mainLinks = [
    { href: `/${locale}/team`,      label: t("team") },
    { href: `/${locale}/games`,     label: t("games") },
    { href: `/${locale}/results`,   label: t("results") },
    { href: `/${locale}/community`, label: t("community") },
    { href: `/${locale}/about`,     label: t("about") },
  ];

  return (
    <>
      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          height: "72px",
          background: scrolled ? "rgba(17,17,17,0.82)" : "rgba(17,17,17,0.35)",
          backdropFilter: "saturate(140%) blur(14px)",
          WebkitBackdropFilter: "saturate(140%) blur(14px)",
          borderBottom: `1px solid ${scrolled ? "#242424" : "transparent"}`,
          transition: "background-color 0.3s ease-out, border-color 0.3s ease-out",
        }}
      >
        <nav
          style={{ height: "100%" }}
          className="container-x flex items-center justify-between"
        >
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center" style={{ minHeight: "44px" }} aria-label="IMPerfect home">
            <span
              className="font-heading font-black uppercase"
              style={{ fontSize: "22px", letterSpacing: "-0.01em", lineHeight: 1 }}
            >
              <span style={{ color: "#C8E400" }}>IM</span>
              <span style={{ color: "#FFFFFF" }}>PERFECT</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center" style={{ gap: "24px" }}>
            {mainLinks.map((link) => {
              const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={isActive ? "page" : undefined}
                  className={`nav-link${isActive ? " is-active" : ""}`}
                >
                  {link.label}
                </Link>
              );
            })}
            {(() => {
              const sponsorHref = `/${locale}/sponsorship`;
              const isActiveSponsor = pathname === sponsorHref || pathname.startsWith(sponsorHref + "/");
              return (
                <Link
                  href={sponsorHref}
                  aria-current={isActiveSponsor ? "page" : undefined}
                  className={`nav-link nav-link-accent${isActiveSponsor ? " is-active" : ""}`}
                >
                  {t("sponsorship")}
                </Link>
              );
            })()}
            <Link href="/team-hub" className="nav-link nav-link-quiet">
              🔒 {t("team_hub")}
            </Link>
          </div>

          {/* Right */}
          <div className="hidden md:flex items-center" style={{ gap: "8px" }}>
            <LanguageToggle />
            <Link
              href="https://discord.gg/QgDansRt2p"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ minHeight: "40px", padding: "0 18px", fontSize: "12px", marginLeft: "8px" }}
            >
              {t("join_discord")}
            </Link>
          </div>

          {/* Hamburger */}
          <button
            className="md:hidden flex flex-col justify-center items-center"
            style={{ gap: "5px", width: "44px", height: "44px", marginRight: "-10px", background: "none", border: "none", cursor: "pointer" }}
            onClick={() => setDrawerOpen(true)}
            aria-label="Open menu"
            aria-expanded={drawerOpen}
            aria-controls="mobile-drawer"
          >
            <span style={{ display: "block", width: "22px", height: "2px", background: "#D0D0D0" }} />
            <span style={{ display: "block", width: "22px", height: "2px", background: "#D0D0D0" }} />
            <span style={{ display: "block", width: "14px", height: "2px", background: "#C8E400", alignSelf: "flex-end", marginRight: "11px" }} />
          </button>
        </nav>
      </header>

      {/* Mobile drawer overlay */}
      {drawerOpen && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            zIndex: 99,
          }}
          onClick={() => setDrawerOpen(false)}
        />
      )}

      {/* Mobile drawer */}
      <div
        id="mobile-drawer"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!drawerOpen}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(300px, 85vw)",
          background: "#111111",
          borderLeft: "4px solid #C8E400",
          zIndex: 100,
          display: "flex",
          flexDirection: "column",
          padding: "24px",
          transform: drawerOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(.2,.8,.2,1)",
        }}
      >
        <button
          onClick={() => setDrawerOpen(false)}
          style={{
            alignSelf: "flex-end",
            background: "none",
            border: "none",
            color: "#A1A1A1",
            fontSize: "28px",
            lineHeight: 1,
            width: "44px",
            height: "44px",
            marginRight: "-10px",
            cursor: "pointer",
            marginBottom: "24px",
          }}
          aria-label="Close menu"
        >
          ×
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: "4px", flex: 1 }}>
          {mainLinks.map((link) => {
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setDrawerOpen(false)}
                className="font-heading font-bold uppercase"
                style={{
                  fontSize: "18px",
                  color: isActive ? "#C8E400" : "#C4C4C4",
                  textDecoration: "none",
                  padding: "12px 0",
                  borderBottom: "1px solid #1F1F1F",
                  borderLeft: isActive ? "3px solid #C8E400" : "3px solid transparent",
                  paddingLeft: isActive ? "12px" : "0",
                  transition: "color 0.15s",
                }}
              >
                {link.label}
              </Link>
            );
          })}
          {(() => {
            const sponsorHref = `/${locale}/sponsorship`;
            const isActiveSponsor = pathname === sponsorHref || pathname.startsWith(sponsorHref + "/");
            return (
              <Link
                href={sponsorHref}
                onClick={() => setDrawerOpen(false)}
                className="font-heading font-bold uppercase"
                style={{
                  fontSize: "18px",
                  color: "#C8E400",
                  textDecoration: "none",
                  padding: "12px 0",
                  borderBottom: "1px solid #1F1F1F",
                  borderLeft: isActiveSponsor ? "3px solid #C8E400" : "3px solid transparent",
                  paddingLeft: isActiveSponsor ? "12px" : "0",
                  opacity: isActiveSponsor ? 1 : 0.7,
                }}
              >
                {t("sponsorship")}
              </Link>
            );
          })()}
          <Link
            href="/team-hub"
            onClick={() => setDrawerOpen(false)}
            className="font-heading font-bold uppercase"
            style={{
              fontSize: "14px",
              color: "#8A8A8A",
              textDecoration: "none",
              padding: "12px 0",
            }}
          >
            🔒 {t("team_hub")}
          </Link>
        </div>

        <Link
          href="https://discord.gg/QgDansRt2p"
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => setDrawerOpen(false)}
          className="btn-primary"
          style={{ width: "100%", marginTop: "24px" }}
        >
          {t("join_discord")}
        </Link>
      </div>
    </>
  );
}
