"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Droplets, Wind, Eye, Gauge, Sunrise, Sunset, CloudRain, Thermometer, Sun } from "lucide-react";
import type { CurrentWeather } from "@/lib/weather";
import { WeatherIllustration, getWeatherGradient } from "@/components/weather-illustration";
import { Badge } from "@/components/ui/badge";

/** "Updated X min ago", ticking every 30s so it never goes stale on screen
 *  even if the user leaves the tab open. Falls back to the exact time once
 *  it's been more than an hour. */
function useRelativeUpdatedLabel(observedAt: string) {
  const [, tick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  const observed = new Date(observedAt).getTime();
  const diffMin = Math.max(0, Math.round((Date.now() - observed) / 60000));

  if (diffMin < 1) return "Updated just now";
  if (diffMin === 1) return "Updated 1 min ago";
  if (diffMin < 60) return `Updated ${diffMin} min ago`;
  return `Updated at ${new Date(observedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export function WeatherCard({ data, compact = false }: { data: CurrentWeather; compact?: boolean }) {
  const locationLabel = [data.location.name, data.location.state, data.location.country]
    .filter(Boolean).join(", ");

  const gradient = getWeatherGradient(data.condition, data.icon);
  const tempRound = Math.round(data.tempC);
  const feelsRound = Math.round(data.feelsLikeC);
  const isHot = data.tempC >= 38;
  const isCold = data.tempC <= 10;
  const updatedLabel = useRelativeUpdatedLabel(data.observedAt);

  return (
    <div className={cn(
      "relative overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-card-hover",
      `bg-gradient-to-br ${gradient}`
    )}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-card/85 backdrop-blur-[1px]" />

      <div className="relative p-5 md:p-6">
        {/* Header row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          {/* Location + condition */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground mb-0.5">
              <span className="truncate font-medium text-foreground">{locationLabel}</span>
              {(isHot || isCold) && (
                <Badge tone={isHot ? "danger" : "info"} className="shrink-0">
                  {isHot ? "🌡️ Heat" : "❄️ Cold"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground capitalize">{data.condition}</p>
            <p className="text-xs text-muted-foreground mt-0.5" title={new Date(data.observedAt).toLocaleString()}>
              {updatedLabel} · observed {new Date(data.observedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>

          {/* Illustration + temperature */}
          <div className="flex items-center gap-4">
            <WeatherIllustration condition={data.condition} icon={data.icon} size={compact ? "md" : "lg"} />
            <div className="text-right">
              <p className={cn("font-bold leading-none", compact ? "text-4xl" : "text-5xl md:text-6xl")}>
                {tempRound}°C
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Feels {feelsRound}°C
              </p>
            </div>
          </div>
        </div>

        {/* Stats grid */}
        {!compact && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            <StatItem icon={Droplets}  label="Humidity"      value={`${data.humidity}%`}        tone={data.humidity > 80 ? "caution" : undefined} />
            <StatItem icon={Wind}      label="Wind"          value={`${data.windKph} km/h`}     tone={data.windKph > 40 ? "warning" : undefined} />
            <StatItem icon={Eye}       label="Visibility"    value={`${data.visibilityKm} km`}  tone={data.visibilityKm < 2 ? "warning" : undefined} />
            <StatItem icon={Gauge}     label="Pressure"      value={`${data.pressure} hPa`} />
            <StatItem icon={CloudRain} label="Precip"        value={`${data.precipitationMm.toFixed(1)} mm`} />
            <StatItem icon={Sunrise}   label="Sunrise"       value={formatTime(data.sunrise)} />
            <StatItem icon={Sunset}    label="Sunset"        value={formatTime(data.sunset)} />
            <StatItem icon={Thermometer} label="Condition"   value={data.condition.slice(0, 14)} />
          </div>
        )}

        {/* Compact stats */}
        {compact && (
          <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
            <span className="flex items-center gap-1"><Droplets className="h-3.5 w-3.5" />{data.humidity}%</span>
            <span className="flex items-center gap-1"><Wind className="h-3.5 w-3.5" />{data.windKph} km/h</span>
            <span className="flex items-center gap-1"><Eye className="h-3.5 w-3.5" />{data.visibilityKm} km</span>
          </div>
        )}
      </div>
    </div>
  );
}

function StatItem({
  icon: Icon, label, value, tone,
}: {
  icon: any; label: string; value: string; tone?: "caution" | "warning" | "danger";
}) {
  const toneColor = tone === "danger" ? "text-red-500" : tone === "warning" ? "text-orange-500" : tone === "caution" ? "text-yellow-500" : "text-primary";
  return (
    <div className="flex items-center gap-2.5 rounded-lg bg-muted/50 px-3 py-2">
      <Icon className={cn("h-4 w-4 shrink-0", tone ? toneColor : "text-muted-foreground")} />
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground leading-tight">{label}</p>
        <p className={cn("text-sm font-semibold leading-tight", tone && toneColor)}>{value}</p>
      </div>
    </div>
  );
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}
