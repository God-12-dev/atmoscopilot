"use client";

import { useState } from "react";
import { Zap, CloudRain, AlertTriangle, Shield, Clock, MapPin, ArrowRight, Info, Users, Phone } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LocationSearch } from "@/components/location-search";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/risk-badge";
import { Button } from "@/components/ui/button";
import { LoadingState, ConfigErrorState, ErrorState, EmptyState, PrototypeBanner } from "@/components/state";
import { useSelectedLocation } from "@/lib/use-location";
import { useWeatherData } from "@/lib/use-weather";
import { cn } from "@/lib/utils";

// ── Prototype risk model ─────────────────────────────────────────────────────
// Architecture-ready: replace computeFloodRisk() with XGBoost/LSTM API call.
function computeFloodRisk(windKph: number, humidity: number, rainChance: number, precipMm: number, alertsSevere: boolean) {
  if (alertsSevere || rainChance >= 80 || precipMm > 20) {
    return {
      level: "CRITICAL" as const,
      probability: Math.min(95, 70 + Math.round(rainChance * 0.25)),
      expectedRainfall: `${Math.round(precipMm * 4 + rainChance * 0.6)} mm/hr`,
      onset: "< 1 hour",
      confidence: 78,
      action: "Evacuate low-lying areas immediately. Avoid underpasses and flooded roads. Contact NDRF: 011-24363260.",
    };
  }
  if (rainChance >= 60 || precipMm > 8) {
    return {
      level: "HIGH" as const,
      probability: Math.min(80, 45 + Math.round(rainChance * 0.3)),
      expectedRainfall: `${Math.round(precipMm * 3 + rainChance * 0.4)} mm/hr`,
      onset: "1–3 hours",
      confidence: 72,
      action: "Avoid low-lying roads and underpasses. Keep emergency kit ready. Monitor official alerts.",
    };
  }
  if (rainChance >= 35 || humidity > 85) {
    return {
      level: "MODERATE" as const,
      probability: Math.min(50, 20 + Math.round(rainChance * 0.25)),
      expectedRainfall: `${Math.round(precipMm * 2 + rainChance * 0.2)} mm/hr`,
      onset: "3–6 hours",
      confidence: 65,
      action: "Monitor weather updates. Plan alternate routes for low-lying areas. Keep drains clear.",
    };
  }
  return {
    level: "LOW" as const,
    probability: Math.max(5, Math.round(rainChance * 0.1)),
    expectedRainfall: `< 5 mm/hr`,
    onset: "> 6 hours",
    confidence: 60,
    action: "Normal precautions. Stay informed via official weather channels.",
  };
}

const RISK_TIMELINE = ["Now", "+1 hr", "+3 hrs", "+6 hrs"];
const TIMELINE_MULTIPLIERS = [1, 1.15, 0.9, 0.7];

const EMERGENCY_CONTACTS = [
  { name: "NDRF Helpline", number: "011-24363260", icon: Shield },
  { name: "National Disaster", number: "1078",       icon: Phone },
  { name: "Fire & Emergency", number: "101",          icon: Zap },
  { name: "Police",           number: "100",          icon: Users },
];

export default function DisasterPage() {
  const { location, setLocation, ready } = useSelectedLocation();
  const { current, hourly, alerts, loading, error, isConfigError } = useWeatherData(location);
  const [activeTab, setActiveTab] = useState<"flood" | "storm" | "heat">("flood");

  const risk = current
    ? computeFloodRisk(
        current.windKph,
        current.humidity,
        Math.max(0, ...hourly.map((h) => h.rainChance)),
        current.precipitationMm,
        alerts.some((a) => a.severity === "Severe" || a.severity === "Extreme")
      )
    : null;

  const maxRain = current ? Math.max(0, ...hourly.map((h) => h.rainChance)) : 0;

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Disaster Early Warning
          </h1>
          <p className="text-sm text-muted-foreground">Flood intelligence, storm tracking & emergency response</p>
        </div>
        <LocationSearch onSelect={setLocation} />
      </div>

      <PrototypeBanner feature="Flood risk prediction" />

      {!ready && <LoadingState />}
      {ready && !location && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/15">
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
            <p className="font-semibold text-lg">Select a location for disaster intelligence</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              Monitor flood risk, storm severity, and emergency response information for any location.
            </p>
          </CardContent>
        </Card>
      )}

      {location && isConfigError && error && <ConfigErrorState message={error} />}
      {location && !isConfigError && error && <ErrorState message={error} />}
      {location && loading && <LoadingState label="Loading disaster intelligence..." />}

      {current && risk && !loading && (
        <div className="space-y-5 animate-fade-in">
          {/* ── Active alerts banner ──────────────────────────────── */}
          {alerts.length > 0 && (
            <div className="space-y-2">
              {alerts.slice(0, 3).map((a, i) => (
                <div key={i} className={cn(
                  "flex items-start gap-3 rounded-xl border px-4 py-3",
                  a.severity === "Extreme" ? "alert-critical border" :
                  a.severity === "Severe"  ? "alert-warning border" :
                  a.severity === "Moderate"? "alert-watch border" : "alert-info border"
                )}>
                  <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{a.title}</span>
                      <Badge tone={a.severity === "Extreme" ? "danger" : a.severity === "Severe" ? "warning" : "caution"}>
                        {a.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{a.description}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── Main risk card ───────────────────────────────────── */}
          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-4">
              {/* Flash flood risk */}
              <Card className={cn(
                "border-l-4 overflow-hidden",
                risk.level === "CRITICAL" ? "border-l-red-500" :
                risk.level === "HIGH"     ? "border-l-orange-500" :
                risk.level === "MODERATE" ? "border-l-yellow-500" : "border-l-green-500"
              )}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <CloudRain className={cn("h-5 w-5",
                          risk.level === "CRITICAL" ? "text-red-500" :
                          risk.level === "HIGH"     ? "text-orange-500" :
                          risk.level === "MODERATE" ? "text-yellow-500" : "text-green-500"
                        )} />
                        <p className="font-semibold">Flash Flood Risk</p>
                        <Badge tone="default" className="text-2xs">Prototype Risk Model</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{location?.name}</p>
                    </div>
                    <RiskBadge level={risk.level} />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {[
                      { label: "Probability",       value: `${risk.probability}%`,       color: "text-primary" },
                      { label: "Expected Rainfall",  value: risk.expectedRainfall,         color: "text-blue-500" },
                      { label: "Estimated Onset",   value: risk.onset,                   color: "text-orange-500" },
                      { label: "Model Confidence",  value: `${risk.confidence}%`,         color: "text-muted-foreground" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="rounded-lg bg-muted/50 px-3 py-2">
                        <p className="text-xs text-muted-foreground">{label}</p>
                        <p className={cn("text-sm font-bold mt-0.5", color)}>{value}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-lg bg-muted/40 border border-border px-4 py-3">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">⚡ Recommended Action</p>
                    <p className="text-sm">{risk.action}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Risk timeline */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    Risk Timeline
                  </CardTitle>
                  <CardDescription>Projected flood risk progression — Prototype Model</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex gap-3">
                    {RISK_TIMELINE.map((t, i) => {
                      const prob = Math.min(99, Math.max(1, Math.round(risk.probability * TIMELINE_MULTIPLIERS[i])));
                      const lvl =
                        prob >= 70 ? "CRITICAL" :
                        prob >= 50 ? "HIGH" :
                        prob >= 25 ? "MODERATE" : "LOW";
                      return (
                        <div key={t} className="flex-1 text-center">
                          <p className="text-xs font-medium text-muted-foreground mb-2">{t}</p>
                          <div className={cn(
                            "h-2 rounded-full mb-2",
                            lvl === "CRITICAL" ? "bg-red-500" :
                            lvl === "HIGH"     ? "bg-orange-500" :
                            lvl === "MODERATE" ? "bg-yellow-500" : "bg-green-500"
                          )} style={{ width: `${prob}%`, minWidth: "12px", margin: "0 auto" }} />
                          <p className="text-xs font-semibold">{prob}%</p>
                          <RiskBadge level={lvl as any} size="sm" showIcon={false} className="mt-1" />
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Conditions table */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Contributing Conditions</CardTitle>
                  <CardDescription>Real-time data from OpenWeather</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {[
                      { label: "Rainfall this hour",  value: `${current.precipitationMm.toFixed(1)} mm`, threshold: 5,  unit: "mm", warn: current.precipitationMm > 5 },
                      { label: "Rain probability",    value: `${maxRain}%`,              threshold: 60, unit: "%", warn: maxRain > 60 },
                      { label: "Humidity",            value: `${current.humidity}%`,     threshold: 85, unit: "%", warn: current.humidity > 85 },
                      { label: "Wind speed",          value: `${current.windKph} km/h`,  threshold: 40, unit: "km/h", warn: current.windKph > 40 },
                      { label: "Visibility",          value: `${current.visibilityKm} km`, threshold: 2, unit: "km", warn: current.visibilityKm < 2 },
                    ].map(({ label, value, warn }) => (
                      <div key={label} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
                        <span className="text-sm text-muted-foreground">{label}</span>
                        <span className={cn("text-sm font-semibold", warn ? "text-orange-500" : "text-foreground")}>
                          {warn && <AlertTriangle className="inline h-3 w-3 mr-1" />}{value}
                        </span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-3 flex items-start gap-1">
                    <Info className="h-3 w-3 shrink-0 mt-0.5" />
                    All values are from live OpenWeather API. Risk computation is rule-based (prototype). Real ML model integration is architecture-ready.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* ── Sidebar: Emergency + Shelters ─────────────────── */}
            <div className="space-y-4">
              {/* Emergency contacts */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Phone className="h-4 w-4 text-red-500" />
                    Emergency Contacts
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {EMERGENCY_CONTACTS.map(({ name, number, icon: Icon }) => (
                    <a
                      key={name}
                      href={`tel:${number}`}
                      className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm">{name}</span>
                      </div>
                      <span className="text-sm font-bold text-primary">{number}</span>
                    </a>
                  ))}
                </CardContent>
              </Card>

              {/* Shelter card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    Nearest Shelters
                  </CardTitle>
                  <CardDescription>Demo data — integrate with local authority DB</CardDescription>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {[
                    { name: "Government School",  dist: "0.8 km", eta: "3 min",  risk: "LOW" as const },
                    { name: "Community Hall",     dist: "1.4 km", eta: "5 min",  risk: "LOW" as const },
                    { name: "Relief Camp A-7",    dist: "2.1 km", eta: "8 min",  risk: "LOW" as const },
                  ].map(({ name, dist, eta, risk: r }) => (
                    <div key={name} className="rounded-lg border border-border bg-card/50 px-3 py-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">{name}</p>
                          <p className="text-xs text-muted-foreground">{dist} · ETA {eta}</p>
                        </div>
                        <RiskBadge level={r} size="sm" showIcon={false} />
                      </div>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" className="w-full mt-1">
                    <MapPin className="h-3.5 w-3.5" /> View on Map
                  </Button>
                </CardContent>
              </Card>

              {/* SOS */}
              <Card className="border-red-500/30 bg-red-500/5">
                <CardContent className="p-4 text-center">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400 mb-2">Emergency SOS</p>
                  <p className="text-xs text-muted-foreground mb-3">For life-threatening emergencies only</p>
                  <a href="tel:112">
                    <Button variant="danger" className="w-full">
                      <Phone className="h-4 w-4" /> Call 112 — Emergency
                    </Button>
                  </a>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
