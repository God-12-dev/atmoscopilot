"use client";

import { CloudRain, Wind, Droplets, Thermometer, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LocationSearch } from "@/components/location-search";
import { WeatherChart } from "@/components/weather-chart";
import { WeatherIllustration } from "@/components/weather-illustration";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoadingState, SkeletonCard, ConfigErrorState, ErrorState, EmptyState } from "@/components/state";
import { useSelectedLocation } from "@/lib/use-location";
import { useWeatherData } from "@/lib/use-weather";
import { cn } from "@/lib/utils";

export default function ForecastPage() {
  const { location, setLocation, ready } = useSelectedLocation();
  const { daily, hourly, loading, error, isConfigError } = useWeatherData(location);

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">
            Forecast{location ? ` — ${location.name}` : ""}
          </h1>
          <p className="text-sm text-muted-foreground">5-day outlook + hourly breakdown</p>
        </div>
        <LocationSearch onSelect={setLocation} />
      </div>

      {ready && !location && <EmptyState message="Select a location to see its forecast." icon={Thermometer} />}
      {location && isConfigError && error && <ConfigErrorState message={error} />}
      {location && !isConfigError && error && <ErrorState message={error} />}
      {location && loading && <SkeletonCard />}

      {!loading && daily.length > 0 && (
        <div className="space-y-6 animate-fade-in">
          {/* ── 5-Day cards ──────────────────────────────────────── */}
          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">5-Day Forecast</h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
              {daily.map((d, i) => (
                <Card key={d.date} className={cn("text-center hover:shadow-card-hover", i === 0 && "border-primary/30 bg-primary/5")}>
                  <CardContent className="p-4">
                    <p className="text-xs font-semibold text-muted-foreground">
                      {i === 0 ? "Today" : new Date(d.date).toLocaleDateString([], { weekday: "short" })}
                    </p>
                    <div className="flex justify-center my-2">
                      <WeatherIllustration condition={d.condition} size="sm" />
                    </div>
                    <p className="text-xs capitalize text-muted-foreground truncate">{d.condition}</p>
                    <div className="mt-2 flex items-center justify-center gap-2">
                      <p className="text-lg font-bold">{Math.round(d.highC)}°</p>
                      <p className="text-sm text-muted-foreground">{Math.round(d.lowC)}°</p>
                    </div>
                    {d.rainChance > 10 && (
                      <p className="mt-1 flex items-center justify-center gap-0.5 text-xs text-blue-500">
                        <CloudRain className="h-3 w-3" />{d.rainChance}%
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* ── Hourly strip ─────────────────────────────────────── */}
          {hourly.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Next 24 Hours</h2>
              <div className="overflow-x-auto pb-1">
                <div className="flex gap-2 min-w-max">
                  {hourly.slice(0, 12).map((h, i) => (
                    <div
                      key={h.time}
                      className={cn(
                        "flex min-w-[72px] flex-col items-center gap-1.5 rounded-xl border p-3 text-center",
                        i === 0 ? "border-primary/40 bg-primary/8" : "border-border bg-card"
                      )}
                    >
                      <p className={cn("text-xs font-semibold", i === 0 ? "text-primary" : "text-muted-foreground")}>
                        {i === 0 ? "Now" : new Date(h.time).toLocaleTimeString([], { hour: "numeric", hour12: true })}
                      </p>
                      <WeatherIllustration condition={h.condition} icon={h.icon} size="sm" />
                      <p className="text-sm font-bold">{Math.round(h.tempC)}°</p>
                      <p className="flex items-center gap-0.5 text-xs text-blue-500">
                        <CloudRain className="h-3 w-3" />{h.rainChance}%
                      </p>
                      <p className="flex items-center gap-0.5 text-xs text-muted-foreground">
                        <Wind className="h-3 w-3" />{h.windKph}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Charts ──────────────────────────────────────────── */}
          {hourly.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Trend Charts</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <WeatherChart
                  label="Temperature (°C)"
                  data={hourly.map((h) => ({
                    label: new Date(h.time).toLocaleTimeString([], { hour: "numeric" }),
                    value: Math.round(h.tempC),
                  }))}
                  color="#0693D6"
                  unit="°C"
                />
                <WeatherChart
                  label="Rain Probability (%)"
                  data={hourly.map((h) => ({
                    label: new Date(h.time).toLocaleTimeString([], { hour: "numeric" }),
                    value: h.rainChance,
                  }))}
                  color="#0ea5e9"
                  unit="%"
                />
                <WeatherChart
                  label="Wind Speed (km/h)"
                  data={hourly.map((h) => ({
                    label: new Date(h.time).toLocaleTimeString([], { hour: "numeric" }),
                    value: h.windKph,
                  }))}
                  color="#10b981"
                  type="bar"
                  unit=" km/h"
                />
                <WeatherChart
                  label="Daily High (°C)"
                  data={daily.map((d) => ({
                    label: new Date(d.date).toLocaleDateString([], { weekday: "short" }),
                    value: Math.round(d.highC),
                  }))}
                  color="#f59e0b"
                  type="line"
                  unit="°C"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
