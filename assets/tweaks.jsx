/* global React, ReactDOM, useTweaks, TweaksPanel, TweakSection, TweakRadio, TweakRow */

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "palette": "sage",
  "typeface": "newsreader"
}/*EDITMODE-END*/;

const PALETTES = [
  { key: "sage",      label: "Sage & Cream",  paper: "#F4ECDD", ink: "#232017", accent: "#5F6E37" },
  { key: "chalk",     label: "Chalk & Red",   paper: "#F4F2EB", ink: "#1E1C18", accent: "#D24A2C" },
  { key: "bone",      label: "Bone & Signal", paper: "#EFEADD", ink: "#201E18", accent: "#C0402A" },
  { key: "mist",      label: "Mist & Teal",   paper: "#EBEEEC", ink: "#18201D", accent: "#0F7D6F" },
  { key: "porcelain", label: "Porcelain & Cobalt", paper: "#EDEFF3", ink: "#181B22", accent: "#2C57CC" },
  { key: "ink",       label: "Ink (dark)",    paper: "#16140F", ink: "#ECE6D7", accent: "#E0613B" }
];

function PaletteSwatches({ value, onChange }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 6 }}>
      {PALETTES.map((p) => {
        const active = value === p.key;
        return (
          <button
            key={p.key}
            onClick={() => onChange(p.key)}
            style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 9px", cursor: "pointer", textAlign: "left",
              borderRadius: 7, fontFamily: "inherit", fontSize: 11.5,
              color: active ? "#fff" : "rgba(255,255,255,0.72)",
              background: active ? "rgba(255,255,255,0.12)" : "transparent",
              border: active ? "1px solid rgba(255,255,255,0.45)" : "1px solid rgba(255,255,255,0.14)"
            }}
          >
            <span style={{ display: "flex", flexShrink: 0, borderRadius: 4, overflow: "hidden", border: "1px solid rgba(0,0,0,0.25)" }}>
              <span style={{ width: 11, height: 18, background: p.paper }} />
              <span style={{ width: 11, height: 18, background: p.ink }} />
              <span style={{ width: 11, height: 18, background: p.accent }} />
            </span>
            <span style={{ lineHeight: 1.15 }}>{p.label}</span>
          </button>
        );
      })}
    </div>
  );
}

function TweaksApp() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-palette", t.palette);
    if (window.__waveRefresh) window.__waveRefresh();
  }, [t.palette]);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-type", t.typeface);
  }, [t.typeface]);

  return (
    <TweaksPanel title="Tweaks">
      <TweakSection label="Palette" />
      <PaletteSwatches value={t.palette} onChange={(v) => setTweak("palette", v)} />

      <TweakSection label="Headline typeface" />
      <TweakRadio
        label="Family"
        value={t.typeface}
        options={[
          { value: "newsreader", label: "Serif" },
          { value: "grotesk", label: "Grotesk" },
          { value: "instrument", label: "Display" }
        ]}
        onChange={(v) => setTweak("typeface", v)}
      />
    </TweaksPanel>
  );
}

(function mount() {
  const root = document.createElement("div");
  root.id = "tweaks-root";
  document.body.appendChild(root);
  ReactDOM.createRoot(root).render(<TweaksApp />);
})();
