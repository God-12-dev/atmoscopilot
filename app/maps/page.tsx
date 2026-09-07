"use client";

import { AppShell } from "@/components/app-shell";
import { WeatherMap } from "@/components/weather-map";
import { LocationSearch } from "@/components/location-search";
import { LoadingState, ConfigErrorState, ErrorState, EmptyState } from "@/components/state";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";
import { useSelectedLocation } from "@/lib/use-location";
import { useWeatherData } from "@/lib/use-weather";

export default function MapsPage() {
  const { location, setLocation, ready } = useSelectedLocation();
  const { current, hourly, alerts, loading, error, isConfigError } = useWeatherData(location);

  return (
    <AppShell>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Weather Maps</h1>
          <p className="text-sm text-muted-foreground">Interactive radar, temperature, wind & AQI layers</p>
        </div>
        <LocationSearch onSelect={setLocation} />
      </div>

      {!ready && <LoadingState label="Loading..." />}
      {ready && !location && (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <MapPin className="h-10 w-10 text-primary opacity-60" />
            <p className="font-semibold">Select a location to view the weather map</p>
            <p className="text-sm text-muted-foreground max-w-xs">
              Search for any city above. The map will show live radar, temperature, wind, and AQI layers.
            </p>
          </CardContent>
        </Card>
      )}

      {location && isConfigError && error && <ConfigErrorState message={error} />}
      {location && !isConfigError && error && <ErrorState message={error} />}
      {location && loading && <LoadingState label="Loading map data..." />}

      {current && !loading && (
        <div className="space-y-4">
          <WeatherMap current={current} hourly={hourly} alerts={alerts} height="h-[60vh]" />

          {/* Layer legend */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-semibold mb-3">Map Layers Guide</p>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs text-muted-foreground">
                {[
                  { color: "bg-blue-500", label: "Rain Radar", desc: "Precipitation intensity" },
                  { color: "bg-orange-400", label: "Temperature", desc: "Surface temperature" },
                  { color: "bg-green-500", label: "Wind", desc: "Wind speed/direction" },
                  { color: "bg-gray-400", label: "Clouds", desc: "Cloud coverage %" },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-2">
                    <div className={`h-3 w-3 rounded-full shrink-0 mt-0.5 ${item.color}`} />
                    <div>
                      <p className="font-medium text-foreground">{item.label}</p>
                      <p>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 border-t border-border pt-3">
                <p className="text-xs font-semibold mb-2 text-foreground">Risk Zone Legend</p>
                <div className="flex flex-wrap gap-3 text-xs">
                  {[
                    { color: "bg-green-500", label: "LOW — Safe conditions" },
                    { color: "bg-yellow-400", label: "MODERATE — Minor risk" },
                    { color: "bg-orange-500", label: "HIGH — Elevated risk" },
                    { color: "bg-red-500",    label: "CRITICAL — Danger" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-1.5 text-muted-foreground">
                      <div className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      {item.label}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2 opacity-70">
                  Risk zones are computed from real weather data using transparent rule-based thresholds, not ML predictions.
                  The dashed circle on the map shows the risk radius around the selected location.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
