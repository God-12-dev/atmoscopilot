"use client";

import { useEffect, useState } from "react";
import { Star, Trash2, MapPin, CheckCircle2, Plus, Navigation, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/app-shell";
import { LocationSearch } from "@/components/location-search";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingState, EmptyState, ErrorState } from "@/components/state";
import { useSelectedLocation } from "@/lib/use-location";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface SavedLocation {
  id: string;
  isDefault: boolean;
  location: { id: string; name: string; state: string | null; country: string | null; lat: number; lon: number };
}

const QUICK_CITIES = [
  { name: "Bengaluru", state: "Karnataka",    country: "IN", lat: 12.9716, lon: 77.5946 },
  { name: "Mumbai",    state: "Maharashtra",  country: "IN", lat: 19.0760, lon: 72.8777 },
  { name: "Delhi",     state: "Delhi",        country: "IN", lat: 28.6139, lon: 77.2090 },
  { name: "Chennai",   state: "Tamil Nadu",   country: "IN", lat: 13.0827, lon: 80.2707 },
  { name: "Hyderabad", state: "Telangana",    country: "IN", lat: 17.3850, lon: 78.4867 },
  { name: "Kolkata",   state: "West Bengal",  country: "IN", lat: 22.5726, lon: 88.3639 },
];

export default function LocationsPage() {
  const { setLocation, location: activeLocation } = useSelectedLocation();
  const [saved, setSaved] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  async function loadSaved() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/locations");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Couldn't load saved locations.");
      setSaved(data.locations ?? []);
    } catch (e: any) {
      setError(e.message ?? "Couldn't load saved locations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadSaved(); }, []);

  async function addLocation(loc: { name: string; state?: string; country?: string; lat: number; lon: number }) {
    await fetch("/api/locations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(loc),
    });
    loadSaved();
  }

  async function removeLocation(locationId: string) {
    await fetch("/api/locations", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationId }),
    });
    setSaved((prev) => prev.filter((s) => s.location.id !== locationId));
  }

  async function setDefault(locationId: string) {
    await fetch("/api/locations", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ locationId, isDefault: true }),
    });
    loadSaved();
  }

  function useGPS() {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const res = await fetch(`/api/location/current?lat=${lat}&lon=${lon}`);
          const data = await res.json();
          if (data.location) {
            setLocation(data.location);
          }
        } catch { /* silent */ }
        setGpsLoading(false);
      },
      () => setGpsLoading(false)
    );
  }

  return (
    <AppShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold md:text-2xl">Saved Locations</h1>
          <p className="text-sm text-muted-foreground">Manage your favourite weather locations</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={useGPS} disabled={gpsLoading}>
            <Navigation className="h-4 w-4" />
            {gpsLoading ? "Locating…" : "Use GPS"}
          </Button>
          <LocationSearch onSelect={addLocation} />
        </div>
      </div>

      {loading && <LoadingState label="Loading saved locations..." />}
      {error && <ErrorState message={error} />}

      {!loading && !error && (
        <div className="space-y-6 animate-fade-in">
          {/* Saved locations */}
          {saved.length > 0 ? (
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Your Locations ({saved.length})
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {saved.map((f) => {
                  const isActive = activeLocation?.lat === f.location.lat && activeLocation?.lon === f.location.lon;
                  return (
                    <Card key={f.id} className={cn("transition-all", isActive && "border-primary/50 bg-primary/5 shadow-sm")}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-2">
                          <button
                            className="flex flex-1 items-start gap-3 text-left"
                            onClick={() => setLocation({
                              name: f.location.name,
                              state: f.location.state ?? undefined,
                              country: f.location.country ?? undefined,
                              lat: f.location.lat,
                              lon: f.location.lon,
                            })}
                          >
                            <div className={cn(
                              "flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
                              isActive ? "bg-primary/15" : "bg-muted"
                            )}>
                              <MapPin className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <p className="font-semibold text-sm">{f.location.name}</p>
                                {f.isDefault && <Badge tone="primary">Default</Badge>}
                                {isActive && <CheckCircle2 className="h-3.5 w-3.5 text-primary" />}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {[f.location.state, f.location.country].filter(Boolean).join(", ")}
                              </p>
                              <p className="text-xs text-muted-foreground/60 mt-0.5">
                                {f.location.lat.toFixed(2)}°N, {f.location.lon.toFixed(2)}°E
                              </p>
                            </div>
                          </button>
                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              title={f.isDefault ? "Default location" : "Set as default"}
                              onClick={() => setDefault(f.location.id)}
                              className="rounded-lg p-1.5 hover:bg-muted transition-colors"
                            >
                              <Star className={cn("h-4 w-4", f.isDefault ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
                            </button>
                            <button
                              onClick={() => removeLocation(f.location.id)}
                              className="rounded-lg p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors"
                              title="Remove location"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>

                        {isActive && (
                          <Link
                            href="/dashboard"
                            className="mt-3 flex items-center justify-between rounded-lg bg-primary/10 px-3 py-2 text-xs text-primary font-medium hover:bg-primary/15 transition-colors"
                          >
                            View dashboard for {f.location.name}
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Link>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ) : (
            <EmptyState
              icon={MapPin}
              message="No saved locations yet. Search above or pick a quick city below to add your first location."
            />
          )}

          {/* Quick city picks */}
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Quick Add — Indian Cities</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
              {QUICK_CITIES.map((city) => {
                const alreadySaved = saved.some((s) => s.location.name === city.name);
                return (
                  <button
                    key={city.name}
                    onClick={() => !alreadySaved && addLocation(city)}
                    disabled={alreadySaved}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-xl border p-3 text-xs font-medium transition-all",
                      alreadySaved
                        ? "border-border bg-muted text-muted-foreground cursor-default"
                        : "border-border bg-card hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                    )}
                  >
                    <MapPin className="h-4 w-4" />
                    <span>{city.name}</span>
                    {alreadySaved ? (
                      <span className="text-[10px] text-green-500 font-semibold">Saved</span>
                    ) : (
                      <Plus className="h-3 w-3 opacity-50" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
