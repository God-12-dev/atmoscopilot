"use client";

import { useState } from "react";
import { LineChart, TrendingUp, TrendingDown, Thermometer, CloudRain, Wind, AlertTriangle, Info } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LocationSearch } from "@/components/location-search";
import { WeatherChart } from "@/components/weather-chart";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingState, ConfigErrorState, ErrorState, PrototypeBanner } from "@/components/state";
import { useSelectedLocation } from "@/lib/use-location";
import { useWeatherData } from "@/lib/use-weather";
import { cn } from "@/lib/utils";

const PERIODS = [
  { id: "7d",  label: "7 Days" },
  { id: "30d", label: "30 Days" },
  { id: "3m",  label: "3 Months" },
  { id: "1y",  label: "1 Year" },
];

// Generate plausible demo climate trend data seeded from real current temp
function generateTrend(baseTemp: number, baseRain: number, period: string) {
  const points = period === "7d" ? 7 : period === "30d" ? 30 : period === "3m" ? 12 : 12;
  const labels = period === "7d"
    ? ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
    : period === "30d"
    ? Array.from({ length: 30 }, (_, i) => `D${i + 1}`)
    : period === "3m"
    ? ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"].slice(0, 12)
    : ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const tempData = labels.map((label, i) => ({
    label,
    value: Math.round(baseTemp + (Math.sin(i * 0.7) * 3) + (Math.random() * 2 - 1)),
  }));
  const rainData = labels.map((label, i) => ({
    label,
    value: Math.max(0, Math.round(baseRain * 0.6 + (Math.cos(i * 0.8) * 20) + (Math.random() * 15))),
  }));
  const anomalyData = labels.map((label, i) => ({
    label,
    value: parseFloat((Math.sin(i * 0.5) * 1.8 + Math.random() * 0.8 - 0.4).toFixed(1)),
  }));

  return { tempData, rainData, anomalyData };
}

export default function ClimatePage() {
  const { location, setLocation, ready } = useSelectedLocation();
  const { current, daily, loading, error, isConfigError } = useWeatherData(location);
  const [period, setPeriod] = useState("7d");

  const trend = current ? generateTrend(current.tempC, current.humidity, period) : null;

  const avgTemp = current ? Math.round(current.tempC) : null;
  const maxTemp = daily.length > 0 ? Math.round(Math.max(...daily.map((d) => d.highC))) : null;
  const minTemp = daily.length > 0 ? Math.round(Math.min(...daily.map((d) => d.lowC))) : null;
  const avgRain = daily.length > 0 ? Math.round(daily.reduce((s, d) => s + d.rainChance, 0) / daily.length) : null;

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl flex items-center gap-2">
            <LineChart className="h-5 w-5 text-primary" />
            Climate Intelligence
          </h1>
          <p className="text-sm text-muted-foreground">Temperature trends, rainfall anomalies & extreme event analysis</p>
        </div>
        <LocationSearch onSelect={setLocation} />
      </div>

      <PrototypeBanner feature="Historical climate trend data" />

      {!ready && <LoadingState />}
      {ready && !location && (
        <Card>
          <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
            <div className="gradient-accent flex h-16 w-16 items-center justify-center rounded-full">
              <LineChart className="h-8 w-8 text-white" />
            </div>
            <p className="font-semibold text-lg">Select a location for climate intelligence</p>
            <p className="text-sm text-muted-foreground max-w-sm">
              View temperature trends, rainfall patterns, climate anomalies and extreme event frequency.
            </p>
          </CardContent>
        </Card>
      )}

      {location && isConfigError && error && <ConfigErrorState message={error} />}
      {location && !isConfigError && error && <ErrorState message={error} />}
      {location && loading && <LoadingState label="Loading climate data..." />}

      {current && trend && !loading && (
        <div className="space-y-5 animate-fade-in">
          {/* Period selector */}
          <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 w-fit">
            {PERIODS.map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={cn(
                  "rounded-lg px-4 py-1.5 text-sm font-medium transition-all",
                  period === p.id ? "gradient-accent text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Current Temp",    value: `${avgTemp}°C`, icon: Thermometer,  trend: "+1.2°C vs norm", up: true },
              { label: "7-Day High",      value: `${maxTemp}°C`, icon: TrendingUp,   trend: "Above average",  up: true },
              { label: "7-Day Low",       value: `${minTemp}°C`, icon: TrendingDown, trend: "Near normal",    up: false },
              { label: "Avg Rain Chance", value: `${avgRain}%`,  icon: CloudRain,    trend: "Demo data",      up: false },
            ].map(({ label, value, icon: Icon, trend: t, up }) => (
              <Card key={label}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-muted-foreground">{label}</p>
                    <Icon className="h-4 w-4 text-primary opacity-70" />
                  </div>
                  <p className="text-2xl font-bold">{value}</p>
                  <p className={cn("text-xs mt-1 flex items-center gap-1", up ? "text-orange-500" : "text-muted-foreground")}>
                    {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {t}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Charts */}
          <div className="grid gap-4 md:grid-cols-2">
            <WeatherChart label="Temperature Trend (°C)" data={trend.tempData} color="#0693D6" type="line" unit="°C" />
            <WeatherChart label="Rainfall Probability (%)" data={trend.rainData} color="#0ea5e9" type="bar" unit="%" />
          </div>

          {/* Anomaly chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Temperature Anomaly (°C vs baseline)</CardTitle>
              <CardDescription>Deviation from 30-year average — Prototype/Demo data</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <WeatherChart
                label=""
                data={trend.anomalyData}
                color="#f59e0b"
                type="bar"
                unit="°C"
              />
              <p className="text-xs text-muted-foreground mt-2 flex items-start gap-1">
                <Info className="h-3 w-3 shrink-0 mt-0.5" />
                Anomaly = current period temperature minus 30-year climatological baseline. Positive = warmer than average. Real data integration: IMD API or ERA5 reanalysis.
              </p>
            </CardContent>
          </Card>

          {/* Extreme events */}
          <Card>
            <CardHeader>
              <CardTitle>Extreme Event Analysis</CardTitle>
              <CardDescription>Based on current season forecast — Prototype</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { event: "Heatwave Days",       count: current.tempC > 35 ? "3–5 days" : "0–1 days", risk: current.tempC > 35, icon: "🌡️" },
                  { event: "Heavy Rain Events",   count: current.humidity > 75 ? "4–6 events" : "1–2 events", risk: current.humidity > 75, icon: "🌧️" },
                  { event: "High Wind Events",    count: current.windKph > 30 ? "2–3 events" : "0–1 events", risk: current.windKph > 30, icon: "💨" },
                  { event: "Fog Days",            count: current.visibilityKm < 5 ? "3–5 days" : "0–2 days", risk: current.visibilityKm < 5, icon: "🌫️" },
                  { event: "Thunderstorm Days",   count: current.humidity > 70 ? "2–4 days" : "0–1 days", risk: current.humidity > 70, icon: "⛈️" },
                  { event: "Cold Wave Events",    count: current.tempC < 15 ? "2–4 days" : "0 days", risk: current.tempC < 15, icon: "❄️" },
                ].map(({ event, count, risk, icon }) => (
                  <div key={event} className={cn(
                    "flex items-center gap-3 rounded-xl border p-3",
                    risk ? "border-orange-500/30 bg-orange-500/5" : "border-border bg-card"
                  )}>
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <p className="text-sm font-medium">{event}</p>
                      <p className={cn("text-xs", risk ? "text-orange-500 font-semibold" : "text-muted-foreground")}>{count}</p>
                    </div>
                    {risk && <AlertTriangle className="h-4 w-4 text-orange-500 ml-auto shrink-0" />}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Data sources note */}
          <Card className="border-blue-500/30 bg-blue-500/5">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Info className="h-4 w-4 shrink-0 text-blue-500 mt-0.5" />
                <div className="text-xs text-muted-foreground space-y-1">
                  <p><span className="font-semibold text-blue-700 dark:text-blue-400">Live Data:</span> Current weather, 5-day forecast from OpenWeather API.</p>
                  <p><span className="font-semibold text-foreground">Prototype Data:</span> Historical trends, anomalies, and extreme event forecasts use generated demonstration data.</p>
                  <p><span className="font-semibold text-foreground">Real Integration:</span> IMD (India Meteorological Department) API, ERA5 reanalysis, NASA POWER for actual historical data.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
