"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";
import Image from "next/image";
import Reveal from "@/components/motion/Reveal";

const ROLE_COLORS: Record<string, string> = {
  Duelist:    "#E74C3C",
  Vanguard:   "#3A7BD5",
  Strategist: "#C8E400",
};

const players = [
  { tag: "iaguacate",      role: "Strategist", label: "Coach",  game: "MR", img: "/players/AGUACATE_3.webp" },
  { tag: "lblazerowl",     role: "Strategist", label: "Coach",  game: "MR", img: "/players/BLAZER_3.webp" },
  { tag: "crazyturnx",     role: "Duelist",    label: "Player", game: "MR", img: "/players/FILTHYPRYDE.webp" },
  { tag: "georgierican",   role: "Strategist", label: "Player", game: "MR", img: "/players/GEORGIE.webp" },
  { tag: "spooit",         role: "Vanguard",   label: "Player", game: "MR", img: "/players/KEVO.webp" },
  { tag: "the_mofn_ninja", role: "Duelist",    label: "Player", game: "MR", img: "/players/MOFN_2.webp" },
  { tag: "tides100ping",   role: "Duelist",    label: "Player", game: "MR", img: "/players/TIDES.webp" },
  { tag: "zoivanni",       role: "Vanguard",   label: "Player", game: "MR", img: "/players/VANNI.webp" },
].map((p) => ({ ...p, color: ROLE_COLORS[p.role] }));

export default function RosterTeaser() {
  const t = useTranslations("roster");
  const locale = useLocale();

  return (
    <section className="section">
      <div className="container-x">
        <Reveal className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between" style={{ marginBottom: "clamp(32px, 4vw, 48px)" }}>
          <div>
            <span className="eyebrow">{t("eyebrow")}</span>
            <h2 className="section-title">
              {t("title")}
            </h2>
            <p className="lead" style={{ marginTop: "12px" }}>{t("subtitle")}</p>
          </div>
          <Link
            href={`/${locale}/team`}
            className="font-heading font-bold uppercase inline-flex items-center"
            style={{ fontSize: "14px", letterSpacing: "0.08em", color: "#C8E400", textDecoration: "none", gap: "8px", flexShrink: 0, minHeight: "44px" }}
          >
            <span className="link-draw">{t("cta")}</span> <span className="arrow" aria-hidden="true">→</span>
          </Link>
        </Reveal>

        <Reveal stagger={0.06} y={20} className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4">
          {players.map((player) => (
            <div
              key={player.tag}
              data-reveal
              className="group relative overflow-hidden lift"
              style={{ aspectRatio: "1/1", borderRadius: "10px", border: `1px solid ${player.color}26`, background: "#141414" }}
            >
              <Image
                src={player.img}
                alt={player.tag}
                fill
                className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                sizes="(max-width: 640px) 50vw, 25vw"
                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
              />
              <div
                className="absolute inset-0 flex flex-col justify-end"
                style={{ padding: "14px", background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.35) 45%, transparent 75%)" }}
              >
                <div
                  className="absolute top-0 left-0 right-0 origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"
                  style={{ height: "3px", background: player.color }}
                />
                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "4px" }}>
                  <div>
                    <p className="font-heading font-black uppercase" style={{ fontSize: "clamp(13px, 1.3vw, 16px)", color: "#FFFFFF", lineHeight: 1.15, letterSpacing: "0.02em" }}>{player.tag}</p>
                    <p style={{ fontSize: "11px", marginTop: "3px", color: player.color, fontWeight: 500 }}>{player.role}</p>
                  </div>
                  <span
                    className="font-heading font-bold uppercase"
                    style={{ fontSize: "10px", letterSpacing: "0.10em", padding: "2px 6px", borderRadius: "3px", color: player.color, background: `${player.color}20`, border: `1px solid ${player.color}40`, flexShrink: 0 }}
                  >
                    {player.label === "Coach" ? "Coach" : player.game}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
