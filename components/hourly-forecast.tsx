"use client";

import { Droplets, Wind } from "lucide-react";
import type { HourForecast } from "@/lib/weather";
import { WeatherIllustration } from "@/components/weather-illustration";
import { cn } from "@/lib/utils";

export function HourlyForecast({ hours }: { hours: HourForecast[] }) {
  return (
    <div className="overflow-x-auto pb-1">
      <div className="flex gap-2.5 min-w-max">
        {hours.slice(0, 12).map((h, i) => (
          <HourCard key={h.time} h={h} isNow={i === 0} />
        ))}
      </div>
    </div>
  );
}

function HourCard({ h, isNow }: { h: HourForecast; isNow: boolean }) {
  const time = new Date(h.time).toLocaleTimeString([], { hour: "numeric", hour12: true });
  const rainHigh = h.rainChance >= 60;

  return (
    <div className={cn(
      "flex flex-col items-center gap-2 rounded-xl border p-3 text-center transition-all min-w-[76px]",
      isNow
        ? "border-primary/40 bg-primary/8 shadow-sm"
        : "border-border bg-card hover:border-primary/25 hover:shadow-sm"
    )}>
      <p className={cn("text-xs font-semibold", isNow ? "text-primary" : "text-muted-foreground")}>
        {isNow ? "Now" : time}
      </p>
      <WeatherIllustration condition={h.condition} icon={h.icon} size="sm" />
      <p className="text-sm font-bold">{Math.round(h.tempC)}°</p>
      {h.rainChance > 10 && (
        <p className={cn("flex items-center gap-0.5 text-xs font-medium", rainHigh ? "text-blue-500" : "text-muted-foreground")}>
          <Droplets className="h-3 w-3" />{h.rainChance}%
        </p>
      )}
      {h.windKph > 20 && (
        <p className="flex items-center gap-0.5 text-xs text-muted-foreground">
          <Wind className="h-3 w-3" />{h.windKph}
        </p>
      )}
    </div>
  );
}
