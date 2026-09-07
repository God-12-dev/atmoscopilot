"use client";

import { useMemo, useState } from "react";
import { Route, AlertTriangle, CheckCircle, Clock, Navigation, Info, Shield, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LocationSearch } from "@/components/location-search";
import { RouteMap } from "@/components/route-map";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RiskBadge } from "@/components/risk-badge";
import { LoadingState, ConfigErrorState, ErrorState } from "@/components/state";
import type { SelectedLocation } from "@/lib/use-location";
import { useWeatherData } from "@/lib/use-weather";
import { useRoutePlan, type RouteOption } from "@/lib/use-routes";
import { cn } from "@/lib/utils";

type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
const RISK_ORDER: RiskLevel[] = ["LOW", "MODERATE", "HIGH", "CRITICAL"];

function worseRisk(a: RiskLevel, b: RiskLevel): RiskLevel {
  return RISK_ORDER.indexOf(a) >= RISK_ORDER.indexOf(b) ? a : b;
}

/** Weather-only risk score. This reflects general atmospheric conditions
 *  near a point — it is NOT road/flood-incident data, and the UI never
 *  claims otherwise. */
function computeWeatherRisk(windKph: number, visibilityKm: number, rainChance: number, precipMm: number): RiskLevel {
  if (rainChance >= 70 || precipMm > 10 || visibilityKm < 1) return "CRITICAL";
  if (rainChance >= 50 || windKph >= 50 || visibilityKm < 3) return "HIGH";
  if (rainChance >= 30 || windKph >= 30 || visibilityKm < 7) return "MODERATE";
  return "LOW";
}

function formatDistance(meters: number) {
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number) {
  const totalMin = Math.round(seconds / 60);
  if (totalMin < 60) return `${totalMin} min`;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

const VEHICLE_TYPES = [
  { id: "car", label: "Car", icon: "🚗" },
  { id: "ambulance", label: "Ambulance", icon: "🚑" },
  { id: "truck", label: "Heavy Vehicle", icon: "🚛" },
  { id: "emergency", label: "Emergency Vehicle", icon: "🚒" },
];

export default function RoutePlannerPage() {
  const [start, setStart] = useState<SelectedLocation | null>(null);
  const [destination, setDestination] = useState<SelectedLocation | null>(null);
  const [vehicle, setVehicle] = useState("car");
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [hasPlanned, setHasPlanned] = useState(false);

  const startWeather = useWeatherData(start, ["forecast"]);
  const destWeather = useWeatherData(destination, ["forecast"]);
  const { routes, loading: routing, error: routingError, planRoute } = useRoutePlan();

  const canPlan = !!start && !!destination;

  async function handlePlan() {
    if (!start || !destination) return;
    setHasPlanned(true);
    setSelectedRouteId(null);
    await planRoute(start, destination);
  }

  const weatherLoading = (!!start && startWeather.loading) || (!!destination && destWeather.loading);
  const weatherConfigError = startWeather.isConfigError ? startWeather.error : destWeather.isConfigError ? destWeather.error : null;
  const weatherError = !weatherConfigError && (startWeather.error || destWeather.error);

  const risk = useMemo(() => {
    const parts: { label: string; risk: RiskLevel; windKph: number; visibilityKm: number; rainChance: number; precipMm: number }[] = [];
    if (startWeather.current) {
      const maxRain = Math.max(0, ...startWeather.hourly.map((h) => h.rainChance));
      parts.push({
        label: start?.name ?? "Start",
        risk: computeWeatherRisk(startWeather.current.windKph, startWeather.current.visibilityKm, maxRain, startWeather.current.precipitationMm),
        windKph: startWeather.current.windKph,
        visibilityKm: startWeather.current.visibilityKm,
        rainChance: maxRain,
        precipMm: startWeather.current.precipitationMm,
      });
    }
    if (destWeather.current) {
      const maxRain = Math.max(0, ...destWeather.hourly.map((h) => h.rainChance));
      parts.push({
        label: destination?.name ?? "Destination",
        risk: computeWeatherRisk(destWeather.current.windKph, destWeather.current.visibilityKm, maxRain, destWeather.current.precipitationMm),
        windKph: destWeather.current.windKph,
        visibilityKm: destWeather.current.visibilityKm,
        rainChance: maxRain,
        precipMm: destWeather.current.precipitationMm,
      });
    }
    if (parts.length === 0) return null;
    const overall = parts.reduce<RiskLevel>((acc, p) => worseRisk(acc, p.risk), "LOW");
    return { overall, parts };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startWeather.current, startWeather.hourly, destWeather.current, destWeather.hourly, start?.name, destination?.name]);

  const sortedRoutes = useMemo(() => [...routes].sort((a, b) => a.durationSeconds - b.durationSeconds), [routes]);
  const recommended: RouteOption | undefined = sortedRoutes[0];
  const activeRouteId = selectedRouteId ?? recommended?.id ?? null;

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl flex items-center gap-2">
            <Route className="h-5 w-5 text-primary" />
            Weather-Safe Route Planner
          </h1>
          <p className="text-sm text-muted-foreground">Real driving routes (OSRM) combined with live weather conditions</p>
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-blue-500/30 bg-blue-500/8 px-4 py-3 text-sm mb-5">
        <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
        <div className="text-muted-foreground">
          <span className="font-semibold text-blue-700 dark:text-blue-400">How this works: </span>
          Routes come from OSRM&apos;s public routing service (real road network, not simulated). Weather Risk reflects live wind,
          visibility and rain-chance readings near your start and destination — it does <strong>not</strong> mean a road is
          confirmed flooded or closed. Always verify with local traffic authorities during emergencies.
        </div>
      </div>

      <Card className="mb-5">
        <CardContent className="p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Start Location</p>
              <LocationSearch onSelect={setStart} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">Destination</p>
              <LocationSearch onSelect={setDestination} />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              {VEHICLE_TYPES.map((v) => (
                <button
                  key={v.id}
                  onClick={() => setVehicle(v.id)}
                  className={cn(
                    "flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                    vehicle === v.id ? "gradient-accent text-white border-transparent" : "border-border bg-card hover:border-primary/30"
                  )}
                >
                  {v.icon} {v.label}
                </button>
              ))}
            </div>
            <Button onClick={handlePlan} disabled={!canPlan || routing}>
              {routing ? "Planning..." : "Plan Safe Route"}
              {!routing && <ArrowRight className="h-4 w-4" />}
            </Button>
          </div>
          {!canPlan && (
            <p className="mt-2 text-xs text-muted-foreground">Select both a start location and a destination to plan a route.</p>
          )}
        </CardContent>
      </Card>

      {!hasPlanned && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/15">
              <Navigation className="h-8 w-8 text-primary" />
            </div>
            <p className="font-semibold text-lg">Plan a route to see live conditions</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              WeatherGPT will fetch a real driving route and combine it with current weather at both ends of the trip.
            </p>
          </CardContent>
        </Card>
      )}

      {hasPlanned && routing && <LoadingState label="Fetching route and weather data..." />}
      {hasPlanned && !routing && routingError && <ErrorState message={routingError} />}

      {hasPlanned && !routing && !routingError && sortedRoutes.length > 0 && (
        <div className="space-y-5 animate-fade-in">
          {weatherConfigError && <ConfigErrorState message={weatherConfigError} />}
          {weatherError && <ErrorState message={weatherError} />}

          {!weatherConfigError && risk && (
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p className="text-sm font-semibold">Live Weather Conditions</p>
                  <RiskBadge level={risk.overall} label={`Overall Weather Risk: ${risk.overall}`} />
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {risk.parts.map((p) => (
                    <div key={p.label} className="rounded-lg bg-muted/40 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-semibold">{p.label}</p>
                        <RiskBadge level={p.risk} size="sm" />
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
                        <div>
                          <p className="text-muted-foreground">Wind</p>
                          <p className="font-semibold">{p.windKph} km/h</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Visibility</p>
                          <p className="font-semibold">{p.visibilityKm} km</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Rain Chance</p>
                          <p className="font-semibold">{p.rainChance}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          {weatherLoading && <div className="text-xs text-muted-foreground px-1">Loading weather for this route...</div>}

          <Card className="overflow-hidden">
            {start && destination && (
              <RouteMap start={start} destination={destination} routes={sortedRoutes} selectedRouteId={activeRouteId} />
            )}
          </Card>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-3">
              {recommended && (
                <div className="flex items-start gap-3 rounded-xl border border-green-500/40 bg-green-500/8 px-4 py-3">
                  <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-green-700 dark:text-green-400 text-sm">
                      Recommended: fastest route — {formatDistance(recommended.distanceMeters)}, {formatDuration(recommended.durationSeconds)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Based on current road network travel time from OSRM. Weather risk above applies to the whole trip corridor.
                    </p>
                  </div>
                </div>
              )}

              {sortedRoutes.map((route, i) => {
                const isSelected = route.id === activeRouteId;
                return (
                  <button
                    key={route.id}
                    onClick={() => setSelectedRouteId(route.id)}
                    className={cn(
                      "w-full text-left rounded-xl border p-4 transition-all",
                      i === 0 ? "border-green-500/40" : "border-border",
                      isSelected ? "bg-primary/5 border-primary/40 shadow-sm" : "bg-card hover:border-primary/25"
                    )}
                  >
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold shrink-0",
                            i === 0 ? "bg-green-500/20 text-green-600 dark:text-green-400" : "bg-muted text-muted-foreground"
                          )}
                        >
                          {i + 1}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm">{i === 0 ? "Fastest route" : `Alternative route ${i}`}</p>
                            {i === 0 && <span className="text-2xs rounded-full bg-green-500/15 text-green-600 dark:text-green-400 px-2 py-0.5">⭐ Recommended</span>}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{formatDistance(route.distanceMeters)}</p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="flex items-center gap-1.5 justify-end mb-1">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <p className="font-bold">{formatDuration(route.durationSeconds)}</p>
                        </div>
                        {risk && <RiskBadge level={risk.overall} size="sm" />}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Hazard Legend</CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2 text-xs">
                  {[
                    { level: "LOW" as const, desc: "Weather conditions look clear" },
                    { level: "MODERATE" as const, desc: "Proceed with caution" },
                    { level: "HIGH" as const, desc: "Consider delaying if possible" },
                    { level: "CRITICAL" as const, desc: "Severe weather — verify road status before travel" },
                  ].map(({ level, desc }) => (
                    <div key={level} className="flex items-center gap-2">
                      <RiskBadge level={level} size="sm" showIcon={false} />
                      <span className="text-muted-foreground">{desc}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="border-blue-500/30 bg-blue-500/5">
                <CardContent className="p-4">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Prototype Notice</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Route geometry and ETA are real (OSRM&apos;s public demo server, which is rate-limited and best-effort).
                        Weather Risk is based on live weather only — no live road-closure or flood-incident feed is
                        integrated yet.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Emergency Dispatch
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0 space-y-2">
                  {[
                    { label: "NDRF Control", number: "011-24363260" },
                    { label: "Traffic Police", number: "103" },
                    { label: "Highway Helpline", number: "1033" },
                    { label: "National Emergency", number: "112" },
                  ].map(({ label, number }) => (
                    <a key={label} href={`tel:${number}`} className="flex justify-between text-xs rounded-lg bg-muted/40 px-3 py-2 hover:bg-muted transition-colors">
                      <span className="text-muted-foreground">{label}</span>
                      <span className="font-bold text-primary">{number}</span>
                    </a>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
