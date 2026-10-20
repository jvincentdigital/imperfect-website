const items = [
  "OVERWATCH 2", "MARVEL RIVALS", "PUERTO RICO", "IMPERFECT",
  "HERO SHOOTERS", "COMPETITIVE", "TEAM PR", "COMUNIDAD",
  "OVERWATCH 2", "MARVEL RIVALS", "PUERTO RICO", "IMPERFECT",
  "HERO SHOOTERS", "COMPETITIVE", "TEAM PR", "COMUNIDAD",
];

export default function MarqueeTicker() {
  return (
    <div
      aria-hidden="true"
      className="relative overflow-hidden select-none"
      style={{ background: "#111111", borderTop: "1px solid #1F1F1F", borderBottom: "1px solid #1F1F1F", padding: "18px 0" }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to right, #111111, transparent)" }} />
      <div className="absolute right-0 top-0 bottom-0 w-24 z-10 pointer-events-none" style={{ background: "linear-gradient(to left, #111111, transparent)" }} />
      <div className="marquee-track">
        {items.map((item, i) => (
          <span key={i} style={{ display: "flex", alignItems: "center", gap: "16px", padding: "0 16px" }}>
            <span className="font-heading font-black uppercase" style={{ fontSize: "12px", letterSpacing: "0.25em", color: "#808080" }}>
              {item}
            </span>
            <span style={{ width: "4px", height: "4px", borderRadius: "50%", background: "#C8E400", opacity: 0.5, flexShrink: 0 }} />
          </span>
        ))}
      </div>
    </div>
  );
}
