"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { Layers, AlertTriangle, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RiskBadge } from "@/components/risk-badge";
import type { CurrentWeather, HourForecast, WeatherAlertItem } from "@/lib/weather";
import { cn } from "@/lib/utils";

const LAYERS = [
  { key: "none",               label: "None",        color: "default" },
  { key: "precipitation_new",  label: "Rain",        color: "info" },
  { key: "temp_new",           label: "Temperature", color: "warning" },
  { key: "wind_new",           label: "Wind",        color: "caution" },
  { key: "clouds_new",         label: "Clouds",      color: "default" },
] as const;

interface AirQuality {
  aqi: number;
  label: string;
  pm2_5: number;
  pm10: number;
}

function computeRisk(current: CurrentWeather, hourly: HourForecast[], alerts: WeatherAlertItem[]) {
  if (alerts.some((a) => a.severity === "Extreme" || a.severity === "Severe")) {
    return { level: "CRITICAL" as const, reason: "Severe/extreme weather alert active." };
  }
  const maxRain = Math.max(0, ...hourly.map((h) => h.rainChance));
  if (maxRain >= 70 || current.windKph >= 50)
    return { level: "HIGH" as const, reason: `Rain ${maxRain}%, wind ${current.windKph} km/h.` };
  if (maxRain >= 45 || current.windKph >= 30)
    return { level: "MODERATE" as const, reason: `Rain ${maxRain}%, wind ${current.windKph} km/h.` };
  if (maxRain >= 20)
    return { level: "LOW" as const, reason: `Minor rain chance (${maxRain}%).` };
  return null;
}

const RISK_CIRCLE_COLORS = {
  CRITICAL: "#ef4444",
  HIGH: "#f97316",
  MODERATE: "#eab308",
  LOW: "#22c55e",
};

// Leaflet components (SSR-safe via dynamic import)
const MapContainer  = dynamic(() => import("react-leaflet").then((m) => m.MapContainer),  { ssr: false });
const TileLayer     = dynamic(() => import("react-leaflet").then((m) => m.TileLayer),     { ssr: false });
const Marker        = dynamic(() => import("react-leaflet").then((m) => m.Marker),        { ssr: false });
const Popup         = dynamic(() => import("react-leaflet").then((m) => m.Popup),         { ssr: false });
const Circle        = dynamic(() => import("react-leaflet").then((m) => m.Circle),        { ssr: false });

function LeafletMap({
  lat, lon, name, layer, risk, current, aqi,
}: {
  lat: number; lon: number; name: string;
  layer: string; risk: ReturnType<typeof computeRisk>;
  current: CurrentWeather; aqi: AirQuality | null;
}) {
  const [L, setL] = useState<any>(null);
  useEffect(() => {
    import("leaflet").then((l) => {
      require("leaflet/dist/leaflet.css");
      setL(l.default);
    });
  }, []);
  if (!L) return <div className="h-72 bg-muted animate-pulse rounded-b-xl" />;

  const icon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  });

  return (
    <MapContainer center={[lat, lon]} zoom={10} scrollWheelZoom={false} className="h-72 w-full rounded-b-xl" key={`${lat}-${lon}`}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {layer !== "none" && (
        <TileLayer url={`/api/weather/tiles/${layer}/{z}/{x}/{y}`} opacity={0.65} key={layer} />
      )}
      <Marker position={[lat, lon]} icon={icon}>
        <Popup>
          <strong>{name}</strong><br />
          {Math.round(current.tempC)}°C · {current.condition}<br />
          Humidity: {current.humidity}% · Wind: {current.windKph} km/h
          {aqi && <><br />AQI: {aqi.label} (PM2.5: {aqi.pm2_5.toFixed(1)} µg/m³)</>}
        </Popup>
      </Marker>
      {risk && (
        <Circle
          center={[lat, lon]}
          radius={9000}
          pathOptions={{
            color: RISK_CIRCLE_COLORS[risk.level],
            fillColor: RISK_CIRCLE_COLORS[risk.level],
            fillOpacity: 0.12,
            weight: 2,
            dashArray: "6 4",
          }}
        />
      )}
    </MapContainer>
  );
}

export function WeatherMap({
  current, hourly, alerts, height = "h-72",
}: {
  current: CurrentWeather;
  hourly: HourForecast[];
  alerts: WeatherAlertItem[];
  height?: string;
}) {
  const [layer, setLayer] = useState<string>("precipitation_new");
  const [aqi, setAqi] = useState<AirQuality | null>(null);
  const [aqiError, setAqiError] = useState<string | null>(null);

  const { lat, lon, name } = current.location;
  const risk = computeRisk(current, hourly, alerts);

  useEffect(() => {
    let cancelled = false;
    setAqi(null); setAqiError(null);
    fetch(`/api/weather/aqi?lat=${lat}&lon=${lon}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return;
        if (d.aqi) setAqi(d.aqi); else setAqiError(d.error ?? "AQI unavailable");
      })
      .catch(() => !cancelled && setAqiError("AQI unavailable"));
    return () => { cancelled = true; };
  }, [lat, lon]);

  const aqiTone = aqi
    ? aqi.aqi >= 4 ? "danger" : aqi.aqi === 3 ? "warning" : aqi.aqi === 2 ? "caution" : "success"
    : "default";

  return (
    <Card className="overflow-hidden">
      {/* Layer toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card/50 px-3 py-2">
        <div className="flex items-center gap-1 flex-wrap">
          <Layers className="h-3.5 w-3.5 text-muted-foreground mr-1 shrink-0" />
          {LAYERS.map((l) => (
            <button
              key={l.key}
              onClick={() => setLayer(l.key)}
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium transition-all",
                layer === l.key
                  ? "gradient-accent text-white shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {l.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-xs flex-wrap">
          {aqi && <Badge tone={aqiTone as any}>AQI: {aqi.label}</Badge>}
          {risk && <RiskBadge level={risk.level as any} size="sm" />}
        </div>
      </div>

      {/* Map */}
      <LeafletMap lat={lat} lon={lon} name={name} layer={layer} risk={risk} current={current} aqi={aqi} />

      {/* Legend / status bar */}
      <div className="flex items-start gap-2 px-3 py-2 text-xs text-muted-foreground bg-card/50 border-t border-border">
        <Info className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary" />
        <span>
          {risk ? risk.reason : "No elevated hazard detected from current data."}
          {aqiError && <span className="ml-2 opacity-70">· AQI: {aqiError}</span>}
        </span>
      </div>
    </Card>
  );
}
