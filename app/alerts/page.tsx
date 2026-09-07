"use client";

import { useState } from "react";
import { AlertTriangle, Bell, BellOff, ChevronDown, ChevronUp, Clock, MapPin, ShieldAlert, Info, Wind, Thermometer, Droplets, Eye } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LocationSearch } from "@/components/location-search";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/risk-badge";
import { LoadingState, ConfigErrorState, ErrorState, EmptyState } from "@/components/state";
import { useSelectedLocation } from "@/lib/use-location";
import { useWeatherData } from "@/lib/use-weather";
import type { WeatherAlertItem } from "@/lib/weather";
import { cn } from "@/lib/utils";

type AlertTab = "active" | "all";
type AlertCategory = "ALL" | "WEATHER" | "FLOOD" | "HEAT" | "WIND" | "AQI" | "AGRICULTURE";

const CATEGORY_ICONS: Record<AlertCategory, any> = {
  ALL:         AlertTriangle,
  WEATHER:     ShieldAlert,
  FLOOD:       Droplets,
  HEAT:        Thermometer,
  WIND:        Wind,
  AQI:         Eye,
  AGRICULTURE: MapPin,
};

// Demo supplementary alerts (shown when no API alerts present)
const DEMO_ALERTS = [
  {
    id: "d1",
    title: "Orange Alert — Heavy Rainfall",
    severity: "Severe",
    category: "WEATHER",
    description: "Heavy to very heavy rainfall expected over Bengaluru urban district in the next 6 hours. Accumulation of 60–100 mm anticipated. Low-lying areas and underpasses may experience waterlogging.",
    start: new Date(Date.now() - 3600000).toISOString(),
    end: new Date(Date.now() + 18000000).toISOString(),
    source: "IMD Karnataka",
    action: "Avoid low-lying areas. Keep emergency supplies ready. Monitor BBMP drain status.",
  },
  {
    id: "d2",
    title: "Yellow Alert — Strong Surface Winds",
    severity: "Moderate",
    category: "WIND",
    description: "Gusty winds of 40–50 km/h expected with associated thunderstorms. Loose structures and hoardings may be at risk.",
    start: new Date(Date.now() - 1800000).toISOString(),
    end: new Date(Date.now() + 10800000).toISOString(),
    source: "IMD Karnataka",
    action: "Secure outdoor furniture. Avoid parking under trees.",
  },
  {
    id: "d3",
    title: "AQI Advisory — Moderate Pollution",
    severity: "Minor",
    category: "AQI",
    description: "PM2.5 levels elevated. Sensitive groups including children, elderly, and those with respiratory conditions should limit prolonged outdoor exposure.",
    start: new Date().toISOString(),
    end: new Date(Date.now() + 86400000).toISOString(),
    source: "CPCB",
    action: "Wear N95 mask outdoors. Avoid strenuous outdoor exercise.",
  },
];

function severityTone(s: string) {
  if (s === "Extreme" || s === "Severe") return "danger" as const;
  if (s === "Moderate")                  return "warning" as const;
  return "info" as const;
}

function severityBorderColor(s: string) {
  if (s === "Extreme") return "border-l-red-600";
  if (s === "Severe")  return "border-l-orange-500";
  if (s === "Moderate")return "border-l-yellow-500";
  return "border-l-blue-400";
}

function formatAlertTime(iso: string) {
  return new Date(iso).toLocaleString([], { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function AlertCard({ alert }: { alert: any }) {
  const [expanded, setExpanded] = useState(false);
  const Icon = CATEGORY_ICONS[(alert.category as AlertCategory) ?? "WEATHER"] ?? AlertTriangle;

  return (
    <Card className={cn("border-l-4 transition-all", severityBorderColor(alert.severity))}>
      <CardContent className="p-0">
        <button
          className="w-full text-left p-4"
          onClick={() => setExpanded((e) => !e)}
        >
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-start gap-3">
              <div className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                alert.severity === "Extreme" ? "bg-red-500/15" :
                alert.severity === "Severe"  ? "bg-orange-500/15" :
                alert.severity === "Moderate"? "bg-yellow-500/15" : "bg-blue-500/15"
              )}>
                <Icon className={cn("h-4.5 w-4.5 h-[18px] w-[18px]",
                  alert.severity === "Extreme" ? "text-red-500" :
                  alert.severity === "Severe"  ? "text-orange-500" :
                  alert.severity === "Moderate"? "text-yellow-500" : "text-blue-500"
                )} />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="font-semibold text-sm">{alert.title}</p>
                  <Badge tone={severityTone(alert.severity)}>{alert.severity}</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{alert.description}</p>
              </div>
            </div>
            <div className="shrink-0 flex items-center gap-2">
              {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>
          <div className="mt-2 ml-12 flex flex-wrap gap-3 text-xs text-muted-foreground">
            {alert.start && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />From: {formatAlertTime(alert.start)}</span>}
            {alert.end   && <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Until: {formatAlertTime(alert.end)}</span>}
            {alert.source && <span className="flex items-center gap-1"><Info className="h-3 w-3" />{alert.source}</span>}
          </div>
        </button>

        {expanded && (
          <div className="border-t border-border px-4 pb-4 pt-3 ml-12 space-y-3">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Full Description</p>
              <p className="text-sm">{alert.description}</p>
            </div>
            {alert.action && (
              <div className="rounded-lg bg-muted/50 border border-border px-3 py-2">
                <p className="text-xs font-semibold text-muted-foreground mb-1">⚡ Recommended Action</p>
                <p className="text-sm">{alert.action}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function AlertsPage() {
  const { location, setLocation, ready } = useSelectedLocation();
  const { current, alerts, loading, error, isConfigError } = useWeatherData(location);
  const [category, setCategory] = useState<AlertCategory>("ALL");

  // Combine real alerts with demo if fewer than 2
  const apiAlerts = alerts.map((a) => ({ ...a, category: "WEATHER", action: "Follow official guidance from local authorities." }));
  const displayAlerts = apiAlerts.length >= 2 ? apiAlerts : [...apiAlerts, ...DEMO_ALERTS];

  const filtered = category === "ALL" ? displayAlerts : displayAlerts.filter((a) => a.category === category);

  const criticalCount = displayAlerts.filter((a) => a.severity === "Extreme" || a.severity === "Severe").length;
  const moderateCount = displayAlerts.filter((a) => a.severity === "Moderate").length;

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl flex items-center gap-2">
            <Bell className="h-5 w-5 text-orange-500" />
            Weather Alerts
          </h1>
          <p className="text-sm text-muted-foreground">Active warnings, watches and advisories</p>
        </div>
        <LocationSearch onSelect={setLocation} />
      </div>

      {/* Summary badges */}
      {(criticalCount > 0 || moderateCount > 0) && (
        <div className="mb-4 flex flex-wrap gap-2">
          {criticalCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/8 px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-red-500 alert-anim" />
              <span className="text-sm font-semibold text-red-700 dark:text-red-400">{criticalCount} Severe/Extreme alert{criticalCount > 1 ? "s" : ""}</span>
            </div>
          )}
          {moderateCount > 0 && (
            <div className="flex items-center gap-2 rounded-xl border border-yellow-500/40 bg-yellow-500/8 px-4 py-2">
              <div className="h-2 w-2 rounded-full bg-yellow-500" />
              <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400">{moderateCount} Moderate alert{moderateCount > 1 ? "s" : ""}</span>
            </div>
          )}
        </div>
      )}

      {/* Category filter */}
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(Object.keys(CATEGORY_ICONS) as AlertCategory[]).map((cat) => {
          const Icon = CATEGORY_ICONS[cat];
          return (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all",
                category === cat ? "gradient-accent text-white border-transparent" : "border-border bg-card hover:border-primary/30"
              )}
            >
              <Icon className="h-3 w-3" />{cat}
            </button>
          );
        })}
      </div>

      {isConfigError && error && <ConfigErrorState message={error} />}
      {!isConfigError && error && <ErrorState message={error} />}
      {loading && <LoadingState label="Loading alerts..." />}

      {!loading && (
        <div className="space-y-3 animate-fade-in">
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-500/15">
                  <BellOff className="h-7 w-7 text-green-500" />
                </div>
                <p className="font-semibold">No alerts in this category</p>
                <p className="text-sm text-muted-foreground max-w-xs">
                  {location ? `No ${category === "ALL" ? "" : category + " "}alerts active for ${location.name}.` : "Select a location to see weather alerts."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filtered.map((alert, i) => <AlertCard key={String(i)} alert={alert} />)
          )}

          <p className="text-xs text-muted-foreground text-center pt-2 flex items-center justify-center gap-1">
            <Info className="h-3 w-3" />
            {apiAlerts.length > 0 ? "Live alerts from OpenWeather API." : "Demo alerts shown — no live API alerts returned."} Always follow official IMD and local authority guidance.
          </p>
        </div>
      )}
    </AppShell>
  );
}
