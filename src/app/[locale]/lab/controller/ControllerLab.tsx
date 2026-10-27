"use client";

import { useState } from "react";
import BurstQR from "@/lib/burst-qr/BurstQR";
import type { BurstQR as BurstQRApi } from "@/lib/burst-qr/burst-qr";
import { controller, controllerPalette } from "@/lib/burst-qr/objects/controller.js";
import { padTwoTone, padOffset, pcSetup } from "@/lib/burst-qr/objects/gear.js";

// Same community Discord link the Navbar, Footer and Community page use.
const DISCORD = "https://discord.gg/QgDansRt2p";

const COPY = {
  en: {
    eyebrow: "Lab · Test page",
    title: "Tap the controller",
    body: "It breaks apart into a QR code for our Discord. Tap again and it puts itself back together.",
    models: { classic: "IMPerfect pad", twoTone: "Two-tone pad", offset: "Offset sticks", pc: "Keyboard + mouse" },
    modelLabel: "Controller",
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
    models: { classic: "Control IMPerfect", twoTone: "Control bicolor", offset: "Sticks desfasados", pc: "Teclado y mouse" },
    modelLabel: "Control",
    label: "Control de videojuegos. Presiona Enter para convertirlo en un código QR para el Discord de IMPerfect.",
    toQr: "Ver código QR",
    toObj: "Volver al control",
    scan: "Escanéalo con la cámara del celular, o",
    open: "abre el Discord",
    failed: "El 3D no está disponible en este dispositivo.",
    note: "Solo para pruebas. No aparece en el sitio ni en los buscadores.",
  },
} as const;


// Our own designs in the shapes players know (no console maker's logos, symbols or names).
const MODELS = { classic: controller, twoTone: padTwoTone, offset: padOffset, pc: pcSetup } as const;
type Model = keyof typeof MODELS;
const MODEL_KEYS = Object.keys(MODELS) as Model[];

export default function ControllerLab({ locale }: { locale: "en" | "es" }) {
  const t = COPY[locale];
  const [model, setModel] = useState<Model>("classic");
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

        <div role="group" aria-label={t.modelLabel} className="flex flex-wrap" style={{ gap: "8px", marginBottom: "12px" }}>
          {MODEL_KEYS.map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={model === m}
              onClick={() => { setModel(m); setOpen(false); setApi(null); }}
              className="font-heading font-bold uppercase"
              style={{
                fontSize: "13px", letterSpacing: "0.08em", padding: "8px 14px", minHeight: "40px", borderRadius: "3px", cursor: "pointer",
                border: model === m ? "1px solid #C8E400" : "1px solid #2A2A2A", background: model === m ? "rgba(200,228,0,0.12)" : "transparent", color: model === m ? "#C8E400" : "#888888",
              }}
            >
              {t.models[m]}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-end" style={{ gap: "12px", marginBottom: "12px" }}>
          <button type="button" className="btn-secondary" disabled={!api} onClick={() => api?.toggle()} style={{ minHeight: "44px", opacity: api ? 1 : 0.4 }}>
            {open ? t.toObj : t.toQr}
          </button>
        </div>

        <div style={{ position: "relative", height: "min(68vh, 620px)", minHeight: "360px", borderRadius: "6px", overflow: "hidden", border: "1px solid #1F1F1F", background: controllerPalette.night }}>
          {failed ? (
            <div className="flex h-full flex-col items-center justify-center" style={{ gap: "16px", padding: "24px", textAlign: "center" }}>
              <p style={{ color: "#888888" }}>{t.failed}</p>
              <a href={DISCORD} target="_blank" rel="noopener noreferrer" className="btn-primary">Discord</a>
            </div>
          ) : (
            <BurstQR
              key={model}
              className="h-full w-full"
              link={DISCORD}
              object={MODELS[model]}
              palette={controllerPalette}
              style="neon"
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
