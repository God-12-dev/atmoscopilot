"use client";

import { AppShell } from "@/components/app-shell";
import { LocationSearch } from "@/components/location-search";
import { WeatherCard } from "@/components/weather-card";
import { HourlyForecast } from "@/components/hourly-forecast";
import { WeatherChart } from "@/components/weather-chart";
import { WeatherMap } from "@/components/weather-map";
import { LoadingState, SkeletonCard, ConfigErrorState, ErrorState, EmptyState } from "@/components/state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/risk-badge";
import { AlertTriangle, MapPin, Zap, Wind, Droplets, Thermometer, Eye, ArrowRight, ShieldCheck } from "lucide-react";
import { useSelectedLocation } from "@/lib/use-location";
import { useWeatherData } from "@/lib/use-weather";
import Link from "next/link";

export default function DashboardPage() {
  const { location, setLocation, ready } = useSelectedLocation();
  const { current, hourly, daily, alerts, loading, error, isConfigError } = useWeatherData(location);

  // Risk calculation (transparent rule-based)
  function getRisk() {
    if (!current) return null;
    const maxRain = Math.max(0, ...hourly.map((h) => h.rainChance));
    const hasExtremeAlert = alerts.some((a) => a.severity === "Extreme" || a.severity === "Severe");
    if (hasExtremeAlert || maxRain >= 70 || current.windKph >= 50) return "HIGH";
    if (maxRain >= 45 || current.windKph >= 30) return "MODERATE";
    return "LOW";
  }
  const risk = getRisk();

  return (
    <AppShell>
      {/* ── Page header ─────────────────────────────────────────── */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Real-time weather intelligence</p>
        </div>
        <LocationSearch onSelect={setLocation} />
      </div>

      {/* ── Loading / empty states ──────────────────────────────── */}
      {!ready && <LoadingState label="Initialising..." />}

      {ready && !location && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="gradient-accent flex h-14 w-14 items-center justify-center rounded-full">
              <MapPin className="h-7 w-7 text-white" />
            </div>
            <div>
              <p className="font-semibold text-lg">Select a location</p>
              <p className="text-sm text-muted-foreground max-w-xs mt-1">
                Search for any city above to see real-time weather data, forecasts, and intelligence.
              </p>
            </div>
            {/* Quick picks */}
            <div className="flex flex-wrap justify-center gap-2 mt-2">
              {[
                { name: "Bengaluru", state: "Karnataka", country: "IN", lat: 12.9716, lon: 77.5946 },
                { name: "Mumbai",    state: "Maharashtra", country: "IN", lat: 19.0760, lon: 72.8777 },
                { name: "Delhi",     state: "Delhi",      country: "IN", lat: 28.6139, lon: 77.2090 },
                { name: "Chennai",   state: "Tamil Nadu", country: "IN", lat: 13.0827, lon: 80.2707 },
              ].map((loc) => (
                <button
                  key={loc.name}
                  onClick={() => setLocation(loc)}
                  className="rounded-full border border-border bg-muted px-3 py-1.5 text-xs font-medium hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all"
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {location && isConfigError && error && <ConfigErrorState message={error} />}
      {location && !isConfigError && error && <ErrorState message={error} />}
      {location && loading && (
        <div className="space-y-4">
          <SkeletonCard />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="skeleton h-40 rounded-xl" />
            <div className="skeleton h-40 rounded-xl" />
          </div>
        </div>
      )}

      {current && !loading && (
        <div className="space-y-5 animate-fade-in">
          {/* ── Active alert banner ──────────────────────────────── */}
          {alerts.length > 0 && (
            <Link
              href="/alerts"
              className="flex items-center gap-3 rounded-xl border border-orange-500/40 bg-orange-500/10 px-4 py-3 text-sm hover:bg-orange-500/15 transition-colors group"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/20 shrink-0">
                <AlertTriangle className="h-4 w-4 text-orange-500 alert-anim" />
              </div>
              <div className="flex-1">
                <span className="font-semibold text-orange-700 dark:text-orange-400">
                  {alerts.length} active alert{alerts.length > 1 ? "s" : ""}
                </span>
                <span className="text-muted-foreground ml-2">{alerts[0]?.title}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-orange-500 transition-colors shrink-0" />
            </Link>
          )}

          {/* ── Main layout ──────────────────────────────────────── */}
          <div className="grid gap-5 lg:grid-cols-3">
            {/* Weather card — spans 2 cols on lg */}
            <div className="lg:col-span-2">
              <WeatherCard data={current} />
            </div>

            {/* Risk + quick stats sidebar */}
            <div className="flex flex-col gap-4">
              {/* Current risk */}
              {risk && (
                <Card className="border-l-4" style={{ borderLeftColor: risk === "HIGH" ? "hsl(25 95% 53%)" : risk === "MODERATE" ? "hsl(45 93% 47%)" : "hsl(142 71% 45%)" }}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Weather Risk</p>
                      <RiskBadge level={risk as any} size="sm" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {risk === "HIGH" ? "Elevated hazard — check alerts and avoid outdoor activities." :
                       risk === "MODERATE" ? "Moderate conditions — proceed with caution." :
                       "Conditions look safe for outdoor activities."}
                    </p>
                    <Link href="/disaster" className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline">
                      <Zap className="h-3 w-3" /> Disaster Intelligence
                    </Link>
                  </CardContent>
                </Card>
              )}

              {/* AQI / quick links */}
              <Card>
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick Links</p>
                  {[
                    { href: "/forecast",    label: "5-Day Forecast",    icon: Thermometer },
                    { href: "/assistant",   label: "Ask AI Copilot",    icon: Zap },
                    { href: "/agriculture", label: "Agri Advisory",     icon: Droplets },
                    { href: "/alerts",      label: `${alerts.length > 0 ? alerts.length + " " : ""}Alerts`, icon: AlertTriangle },
                  ].map(({ href, label, icon: Icon }) => (
                    <Link key={href} href={href} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg px-2 py-1.5 transition-colors -mx-2">
                      <Icon className="h-4 w-4 text-primary shrink-0" />
                      {label}
                      <ArrowRight className="ml-auto h-3.5 w-3.5 opacity-40" />
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* ── Map ─────────────────────────────────────────────── */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Live Map</h2>
              <Link href="/maps" className="text-xs text-primary hover:underline flex items-center gap-1">
                Full map <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <WeatherMap current={current} hourly={hourly} alerts={alerts} />
          </div>

          {/* ── Hourly forecast ──────────────────────────────────── */}
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Hourly Forecast</h2>
              <Link href="/forecast" className="text-xs text-primary hover:underline flex items-center gap-1">
                Full forecast <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            {hourly.length > 0 ? (
              <HourlyForecast hours={hourly} />
            ) : (
              <EmptyState message="Hourly forecast unavailable." />
            )}
          </div>

          {/* ── Charts ──────────────────────────────────────────── */}
          {hourly.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              <WeatherChart
                label="Temperature (°C)"
                data={hourly.map((h) => ({
                  label: new Date(h.time).toLocaleTimeString([], { hour: "numeric" }),
                  value: Math.round(h.tempC),
                }))}
                color="#0693D6"
              />
              <WeatherChart
                label="Rain probability (%)"
                data={hourly.map((h) => ({
                  label: new Date(h.time).toLocaleTimeString([], { hour: "numeric" }),
                  value: h.rainChance,
                }))}
                color="#0ea5e9"
              />
            </div>
          )}

          {/* ── 5-day summary ────────────────────────────────────── */}
          {daily.length > 0 && (
            <div>
              <h2 className="mb-3 text-base font-semibold">5-Day Outlook</h2>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {daily.map((d) => (
                  <Card key={d.date} className="text-center">
                    <CardContent className="p-3">
                      <p className="text-xs font-medium text-muted-foreground">
                        {new Date(d.date).toLocaleDateString([], { weekday: "short" })}
                      </p>
                      <p className="text-xs capitalize text-muted-foreground mt-0.5 truncate">{d.condition}</p>
                      <p className="mt-2 text-lg font-bold">{Math.round(d.highC)}°</p>
                      <p className="text-xs text-muted-foreground">{Math.round(d.lowC)}°</p>
                      {d.rainChance > 20 && (
                        <p className="mt-1 flex items-center justify-center gap-0.5 text-xs text-blue-500">
                          <Droplets className="h-3 w-3" />{d.rainChance}%
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </AppShell>
  );
}
