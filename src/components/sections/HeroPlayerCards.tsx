"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useReducedMotion } from "framer-motion";

// The "Welcome to IMPerfect" cards, one per player (same files as RosterTeaser).
const CARDS = [
  { tag: "spooit", img: "/players/KEVO.webp" },
  { tag: "tides100ping", img: "/players/TIDES.webp" },
  { tag: "zoivanni", img: "/players/VANNI.webp" },
  { tag: "georgierican", img: "/players/GEORGIE.webp" },
  { tag: "the_mofn_ninja", img: "/players/MOFN_2.webp" },
  { tag: "crazyturnx", img: "/players/FILTHYPRYDE.webp" },
  { tag: "iaguacate", img: "/players/AGUACATE_3.webp" },
  { tag: "lblazerowl", img: "/players/BLAZER_3.webp" },
];

const INTERVAL_MS = 3500;
const LIME = "#C8E400";

/** Desktop: one framed card that crossfades through the roster. */
export function HeroCardRotator() {
  const locale = useLocale();
  const t = useTranslations("hero");
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reduce || paused) return;
    const id = window.setInterval(() => setIndex((i) => (i + 1) % CARDS.length), INTERVAL_MS);
    return () => window.clearInterval(id);
  }, [reduce, paused]);

  const current = CARDS[index];

  return (
    <div style={{ position: "relative", width: "min(400px, 34vw)", aspectRatio: "1 / 1" }}>
      {/* Two cards behind, for depth */}
      <div aria-hidden style={{ position: "absolute", inset: 0, transform: "rotate(-7deg) translate(-14px, 10px)", background: "#151515", border: "1px solid #2A2A2A", borderRadius: "14px" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, transform: "rotate(9deg) translate(16px, 6px)", background: "#181818", border: "1px solid #2A2A2A", borderRadius: "14px" }} />

      <Link
        href={`/${locale}/team`}
        aria-label={t("card_alt", { name: current.tag })}
        className="hero-card-link"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        style={{
          position: "absolute",
          inset: 0,
          display: "block",
          transform: "rotate(2.5deg)",
          borderRadius: "14px",
          overflow: "hidden",
          border: `2px solid ${LIME}`,
          boxShadow: "0 0 48px rgba(200, 228, 0, 0.22), 0 24px 60px rgba(0, 0, 0, 0.6)",
        }}
      >
        {CARDS.map((c, i) => (
          <Image
            key={c.img}
            src={c.img}
            alt={i === index ? t("card_alt", { name: c.tag }) : ""}
            aria-hidden={i !== index}
            fill
            sizes="(min-width: 900px) 400px, 0px"
            priority={i === 0}
            loading={i === 0 ? undefined : "lazy"}
            style={{ objectFit: "cover", opacity: i === index ? 1 : 0, transition: reduce ? "none" : "opacity 700ms ease" }}
          />
        ))}
      </Link>
    </div>
  );
}

/** Phone: a short, swipeable row of the same cards. */
export function HeroCardRow() {
  const locale = useLocale();
  const t = useTranslations("hero");
  return (
    <div
      aria-label={t("cards_label")}
      style={{
        display: "flex",
        gap: "10px",
        overflowX: "auto",
        scrollSnapType: "x mandatory",
        marginTop: "28px",
        paddingBottom: "6px",
        maxWidth: "100%",
        WebkitOverflowScrolling: "touch",
      }}
    >
      {CARDS.map((c) => (
        <Link
          key={c.img}
          href={`/${locale}/team`}
          className="hero-card-link"
          style={{ flex: "0 0 128px", aspectRatio: "1 / 1", position: "relative", scrollSnapAlign: "start", borderRadius: "10px", overflow: "hidden", border: "1px solid #2A2A2A" }}
        >
          <Image src={c.img} alt={t("card_alt", { name: c.tag })} fill sizes="128px" loading="lazy" style={{ objectFit: "cover" }} />
        </Link>
      ))}
    </div>
  );
}
