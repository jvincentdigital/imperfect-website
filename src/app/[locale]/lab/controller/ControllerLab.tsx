"use client";

import { useState } from "react";
import BurstQR from "@/lib/burst-qr/BurstQR";
import type { BurstQR as BurstQRApi, BurstStyle } from "@/lib/burst-qr/burst-qr";
import { controller, controllerPalette } from "@/lib/burst-qr/objects/controller.js";

// Same community Discord link the Navbar, Footer and Community page use.
const DISCORD = "https://discord.gg/QgDansRt2p";

const COPY = {
  en: {
    eyebrow: "Lab · Test page",
    title: "Tap the controller",
    body: "It breaks apart into a QR code for our Discord. Tap again and it puts itself back together.",
    styles: { neon: "Neon", realistic: "Realistic", watercolor: "Watercolor" },
    styleLabel: "Style",
    label: "Game controller. Press Enter to turn it into a QR code for the IMPerfect Discord.",
    toQr: "Show QR code",
    toObj: "Back to the controller",
    scan: "Scan it with your phone camera, or",
    open: "open the Discord",
    failed: "3D is not available on this device.",
    note: "Test only. Not linked from the site and hidden from search.",
  },
  es: {
    eyebrow: "Lab · Página de prueba",
    title: "Toca el control",
    body: "Se desarma en un código QR para entrar a nuestro Discord. Tócalo otra vez y se arma de nuevo.",
    styles: { neon: "Neón", realistic: "Realista", watercolor: "Acuarela" },
    styleLabel: "Estilo",
    label: "Control de videojuegos. Presiona Enter para convertirlo en un código QR para el Discord de IMPerfect.",
    toQr: "Ver código QR",
    toObj: "Volver al control",
    scan: "Escanéalo con la cámara del celular, o",
    open: "abre el Discord",
    failed: "El 3D no está disponible en este dispositivo.",
    note: "Solo para pruebas. No aparece en el sitio ni en los buscadores.",
  },
} as const;

const STYLES: BurstStyle[] = ["neon", "realistic", "watercolor"];

export default function ControllerLab({ locale }: { locale: "en" | "es" }) {
  const t = COPY[locale];
  const [style, setStyle] = useState<BurstStyle>("neon");
  const [open, setOpen] = useState(false);
  const [api, setApi] = useState<BurstQRApi | null>(null);
  const [failed, setFailed] = useState(false);

  return (
    <section style={{ paddingTop: "112px", paddingBottom: "72px", paddingLeft: "16px", paddingRight: "16px", background: "#111111" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>
        <span className="eyebrow">{t.eyebrow}</span>
        <h1 className="font-heading font-black uppercase text-white" style={{ fontSize: "clamp(40px, 8vw, 72px)", lineHeight: 0.92, marginBottom: "14px" }}>
          {t.title}
        </h1>
        <p style={{ fontSize: "15px", color: "#888888", maxWidth: "520px", lineHeight: 1.6, marginBottom: "28px" }}>{t.body}</p>

        <div className="flex flex-wrap items-center justify-between" style={{ gap: "12px", marginBottom: "12px" }}>
          <div role="group" aria-label={t.styleLabel} className="flex" style={{ border: "1px solid #2A2A2A", borderRadius: "3px", padding: "3px", gap: "3px" }}>
            {STYLES.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={style === s}
                onClick={() => setStyle(s)}
                className="font-heading font-bold uppercase"
                style={{
                  fontSize: "13px", letterSpacing: "0.08em", padding: "8px 14px", minHeight: "40px", borderRadius: "2px", border: "none", cursor: "pointer",
                  background: style === s ? "#C8E400" : "transparent", color: style === s ? "#1A1A1A" : "#888888",
                }}
              >
                {t.styles[s]}
              </button>
            ))}
          </div>
          <button type="button" className="btn-secondary" disabled={!api} onClick={() => api?.toggle()} style={{ minHeight: "44px", opacity: api ? 1 : 0.4 }}>
            {open ? t.toObj : t.toQr}
          </button>
        </div>

        <div style={{ position: "relative", height: "min(68vh, 620px)", minHeight: "360px", borderRadius: "6px", overflow: "hidden", border: "1px solid #1F1F1F", background: style === "neon" ? controllerPalette.night : controllerPalette.bg }}>
          {failed ? (
            <div className="flex h-full flex-col items-center justify-center" style={{ gap: "16px", padding: "24px", textAlign: "center" }}>
              <p style={{ color: style === "neon" ? "#888888" : "#555555" }}>{t.failed}</p>
              <a href={DISCORD} target="_blank" rel="noopener noreferrer" className="btn-primary">Discord</a>
            </div>
          ) : (
            <BurstQR
              className="h-full w-full"
              link={DISCORD}
              object={controller}
              palette={controllerPalette}
              style={style}
              label={t.label}
              onReady={setApi}
              onToggle={setOpen}
              onError={() => setFailed(true)}
            />
          )}
        </div>

        <p style={{ fontSize: "13px", color: "#888888", marginTop: "14px", minHeight: "20px" }} aria-live="polite">
          {open && (
            <>
              {t.scan}{" "}
              <a href={DISCORD} target="_blank" rel="noopener noreferrer" style={{ color: "#C8E400", textDecoration: "none" }}>{t.open}</a>.
            </>
          )}
        </p>
        <p style={{ fontSize: "11px", color: "#555555", letterSpacing: "0.12em", textTransform: "uppercase", marginTop: "28px" }}>{t.note}</p>
      </div>
    </section>
  );
}
