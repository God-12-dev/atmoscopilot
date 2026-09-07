"use client";

/**
 * WeatherIllustration — SVG/CSS weather visuals for each condition type.
 * Professional, minimal, animation-respecting. Not cartoonish.
 */

interface Props {
  condition: string;
  icon?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

function getConditionType(condition: string, icon?: string): string {
  const c = condition.toLowerCase();
  const i = icon ?? "";
  if (i.includes("11")) return "thunderstorm";
  if (i.includes("13")) return "snow";
  if (i.includes("50")) return "fog";
  if (c.includes("thunder") || c.includes("storm")) return "thunderstorm";
  if (c.includes("heavy rain") || c.includes("torrential") || c.includes("drizzle")) return "heavy-rain";
  if (c.includes("rain") || c.includes("shower") || c.includes("drizzle")) return "rain";
  if (c.includes("snow") || c.includes("sleet") || c.includes("hail")) return "snow";
  if (c.includes("fog") || c.includes("mist") || c.includes("haze") || c.includes("smoke")) return "fog";
  if (c.includes("overcast") || c.includes("broken")) return "cloudy";
  if (c.includes("cloud") || c.includes("partly") || c.includes("scattered")) return "partly-cloudy";
  if (c.includes("clear") || c.includes("sunny") || c.includes("fair")) return "clear";
  // icon-based fallback
  if (i.startsWith("01")) return "clear";
  if (i.startsWith("02") || i.startsWith("03")) return "partly-cloudy";
  if (i.startsWith("04")) return "cloudy";
  if (i.startsWith("09") || i.startsWith("10")) return "rain";
  return "partly-cloudy";
}

const SIZES = { sm: 56, md: 80, lg: 112, xl: 160 };

// ── Individual weather visuals ──────────────────────────────────────────────

function ClearSun({ s }: { s: number }) {
  const c = s / 2;
  const r = s * 0.22;
  const rayLen = s * 0.1;
  const rays = Array.from({ length: 8 }, (_, i) => i * 45);
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden>
      {/* Outer glow */}
      <circle cx={c} cy={c} r={r + s * 0.1} fill="hsl(45 100% 60% / 0.18)" className="sun-anim" />
      {/* Sun disc */}
      <circle cx={c} cy={c} r={r} fill="hsl(45 100% 60%)" className="sun-anim" />
      {/* Rays */}
      {rays.map((deg) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = c + (r + s * 0.04) * Math.cos(rad);
        const y1 = c + (r + s * 0.04) * Math.sin(rad);
        const x2 = c + (r + rayLen) * Math.cos(rad);
        const y2 = c + (r + rayLen) * Math.sin(rad);
        return <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(45 100% 60%)" strokeWidth={s * 0.04} strokeLinecap="round" />;
      })}
    </svg>
  );
}

function PartlyCloudySun({ s }: { s: number }) {
  const sunCx = s * 0.35;
  const sunCy = s * 0.35;
  const sunR = s * 0.18;
  const cloudW = s * 0.64;
  const cloudH = s * 0.35;
  const cloudX = s * 0.18;
  const cloudY = s * 0.44;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden>
      {/* Sun (partially behind cloud) */}
      <circle cx={sunCx} cy={sunCy} r={sunR} fill="hsl(45 100% 60%)" className="sun-anim" />
      {/* Cloud */}
      <g className="cloud-anim">
        <ellipse cx={cloudX + cloudW * 0.5} cy={cloudY + cloudH * 0.5} rx={cloudW * 0.5} ry={cloudH * 0.5} fill="hsl(214 20% 88%)" />
        <ellipse cx={cloudX + cloudW * 0.3} cy={cloudY + cloudH * 0.25} rx={cloudW * 0.2} ry={cloudH * 0.38} fill="hsl(214 18% 92%)" />
        <ellipse cx={cloudX + cloudW * 0.58} cy={cloudY} rx={cloudW * 0.24} ry={cloudH * 0.44} fill="hsl(214 18% 92%)" />
      </g>
    </svg>
  );
}

function CloudyCloud({ s }: { s: number }) {
  const cx = s / 2, cy = s * 0.54;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden>
      <g className="cloud-anim">
        {/* back cloud */}
        <ellipse cx={cx * 1.1} cy={cy * 0.82} rx={s * 0.3} ry={s * 0.2} fill="hsl(220 15% 82%)" />
        <ellipse cx={cx * 0.85} cy={cy * 0.68} rx={s * 0.19} ry={s * 0.17} fill="hsl(220 15% 82%)" />
        {/* main cloud */}
        <ellipse cx={cx} cy={cy} rx={s * 0.38} ry={s * 0.22} fill="hsl(215 18% 75%)" />
        <ellipse cx={cx * 0.72} cy={cy * 0.85} rx={s * 0.2} ry={s * 0.19} fill="hsl(215 18% 78%)" />
        <ellipse cx={cx * 1.1} cy={cy * 0.85} rx={s * 0.22} ry={s * 0.2} fill="hsl(215 18% 78%)" />
      </g>
    </svg>
  );
}

function RainCloud({ s, heavy = false }: { s: number; heavy?: boolean }) {
  const cx = s / 2, cy = s * 0.42;
  const dropCount = heavy ? 8 : 5;
  const drops = Array.from({ length: dropCount }, (_, i) => ({
    x: s * 0.2 + (i / (dropCount - 1)) * s * 0.62,
    delay: `${(i * 0.15) % 0.9}s`,
    dur: heavy ? "0.7s" : "0.95s",
  }));
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden>
      {/* Cloud */}
      <g className="cloud-anim">
        <ellipse cx={cx} cy={cy} rx={s * 0.36} ry={s * 0.2} fill={heavy ? "hsl(220 20% 55%)" : "hsl(215 18% 72%)"} />
        <ellipse cx={cx * 0.75} cy={cy * 0.86} rx={s * 0.19} ry={s * 0.18} fill={heavy ? "hsl(220 20% 58%)" : "hsl(215 18% 76%)"} />
        <ellipse cx={cx * 1.15} cy={cy * 0.86} rx={s * 0.22} ry={s * 0.19} fill={heavy ? "hsl(220 20% 58%)" : "hsl(215 18% 76%)"} />
      </g>
      {/* Rain drops */}
      {drops.map((d, i) => (
        <line
          key={i}
          x1={d.x} y1={s * 0.62}
          x2={d.x - s * 0.03} y2={s * 0.62 + s * 0.12}
          stroke="hsl(213 80% 55%)"
          strokeWidth={heavy ? s * 0.025 : s * 0.022}
          strokeLinecap="round"
          className="rain-drop"
          style={{ "--dur": d.dur, "--delay": d.delay } as React.CSSProperties}
        />
      ))}
    </svg>
  );
}

function ThunderstormCloud({ s }: { s: number }) {
  const cx = s / 2, cy = s * 0.4;
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden>
      {/* Dark cloud */}
      <g className="cloud-anim">
        <ellipse cx={cx} cy={cy} rx={s * 0.38} ry={s * 0.21} fill="hsl(220 22% 42%)" />
        <ellipse cx={cx * 0.72} cy={cy * 0.84} rx={s * 0.2} ry={s * 0.19} fill="hsl(220 22% 45%)" />
        <ellipse cx={cx * 1.15} cy={cy * 0.84} rx={s * 0.22} ry={s * 0.2} fill="hsl(220 22% 45%)" />
      </g>
      {/* Lightning bolt */}
      <polygon
        points={`${cx + s * 0.04},${s * 0.56} ${cx - s * 0.08},${s * 0.74} ${cx + s * 0.02},${s * 0.72} ${cx - s * 0.06},${s * 0.9}`}
        fill="hsl(45 100% 60%)"
        className="lightning"
      />
    </svg>
  );
}

function FogLines({ s }: { s: number }) {
  const lines = [0.35, 0.5, 0.62, 0.74];
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden>
      {lines.map((y, i) => (
        <line
          key={i}
          x1={s * 0.12} y1={s * y}
          x2={s * (i % 2 === 0 ? 0.88 : 0.78)} y2={s * y}
          stroke="hsl(220 15% 68%)"
          strokeWidth={s * 0.045}
          strokeLinecap="round"
          opacity={0.5 + i * 0.1}
          className="cloud-anim"
          style={{ "--dur": `${3 + i * 0.6}s` } as React.CSSProperties}
        />
      ))}
    </svg>
  );
}

function SnowCloud({ s }: { s: number }) {
  const cx = s / 2, cy = s * 0.4;
  const flakes = Array.from({ length: 5 }, (_, i) => ({
    x: s * 0.18 + i * s * 0.16,
    delay: `${i * 0.25}s`,
  }));
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} aria-hidden>
      <g className="cloud-anim">
        <ellipse cx={cx} cy={cy} rx={s * 0.36} ry={s * 0.2} fill="hsl(215 20% 80%)" />
        <ellipse cx={cx * 0.75} cy={cy * 0.86} rx={s * 0.19} ry={s * 0.18} fill="hsl(215 20% 84%)" />
        <ellipse cx={cx * 1.15} cy={cy * 0.86} rx={s * 0.22} ry={s * 0.19} fill="hsl(215 20% 84%)" />
      </g>
      {flakes.map((f, i) => (
        <text key={i} x={f.x} y={s * 0.8} fontSize={s * 0.16} textAnchor="middle" fill="hsl(210 60% 80%)"
          className="rain-drop" style={{ "--delay": f.delay, "--dur": "1.2s" } as React.CSSProperties}>
          *
        </text>
      ))}
    </svg>
  );
}

// ── Main export ─────────────────────────────────────────────────────────────

export function WeatherIllustration({ condition, icon, size = "md", className }: Props) {
  const type = getConditionType(condition, icon);
  const s = SIZES[size];

  const illustration = {
    clear: <ClearSun s={s} />,
    "partly-cloudy": <PartlyCloudySun s={s} />,
    cloudy: <CloudyCloud s={s} />,
    rain: <RainCloud s={s} />,
    "heavy-rain": <RainCloud s={s} heavy />,
    thunderstorm: <ThunderstormCloud s={s} />,
    fog: <FogLines s={s} />,
    snow: <SnowCloud s={s} />,
  }[type] ?? <PartlyCloudySun s={s} />;

  return (
    <div className={className} style={{ width: s, height: s }}>
      {illustration}
    </div>
  );
}

export function getWeatherGradient(condition: string, icon?: string): string {
  const type = getConditionType(condition, icon ?? "");
  const gradients: Record<string, string> = {
    clear: "from-amber-400/20 via-orange-300/10 to-yellow-200/5",
    "partly-cloudy": "from-sky-400/15 via-blue-300/10 to-slate-200/5",
    cloudy: "from-slate-400/20 via-gray-300/10 to-slate-200/5",
    rain: "from-blue-500/20 via-blue-400/10 to-slate-300/5",
    "heavy-rain": "from-blue-700/25 via-blue-500/15 to-slate-400/5",
    thunderstorm: "from-purple-600/20 via-slate-600/15 to-gray-400/5",
    fog: "from-gray-400/20 via-slate-300/10 to-gray-200/5",
    snow: "from-sky-200/20 via-blue-100/10 to-white/5",
  };
  return gradients[type] ?? gradients["partly-cloudy"];
}
