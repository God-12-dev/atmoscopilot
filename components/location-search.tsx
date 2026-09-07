"use client";

import { useEffect, useRef, useState } from "react";
import { Search, MapPin, LocateFixed, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import type { SelectedLocation } from "@/lib/use-location";

export function LocationSearch({ onSelect }: { onSelect: (loc: SelectedLocation) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SelectedLocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [locating, setLocating] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const searchedAtLeastOnce = useRef(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSearchError(null);
      searchedAtLeastOnce.current = false;
      return;
    }
    const timeout = setTimeout(async () => {
      setLoading(true);
      setSearchError(null);
      try {
        const res = await fetch(`/api/location/search?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error ?? "Location search failed.");
        setResults(data.results ?? []);
        searchedAtLeastOnce.current = true;
        setOpen(true);
      } catch (e: any) {
        setResults([]);
        setSearchError(e.message ?? "Location search is currently unavailable.");
        setOpen(true);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(timeout);
  }, [query]);

  function useCurrentLocation() {
    setLocateError(null);
    if (!("geolocation" in navigator)) {
      setLocateError("Geolocation isn't supported on this device.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`/api/location/current?lat=${latitude}&lon=${longitude}`);
          const data = await res.json();
          if (!res.ok) throw new Error(data.error ?? "Couldn't resolve your current location.");
          onSelect(data.location);
          setQuery(data.location.name);
          setOpen(false);
        } catch (e: any) {
          setLocateError(e.message ?? "Couldn't resolve your current location.");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        setLocating(false);
        setLocateError(
          err.code === err.PERMISSION_DENIED
            ? "Location access was denied. Enable it in your browser settings to use this."
            : "Your current location is unavailable right now."
        );
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div className="relative w-full max-w-xs">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search a city (e.g. Manvi)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => (results.length > 0 || searchError) && setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 150)}
          />
        </div>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={useCurrentLocation}
          disabled={locating}
          title="Use my current location"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border hover:bg-muted disabled:opacity-50"
        >
          {locating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LocateFixed className="h-4 w-4" />}
        </button>
      </div>

      {locateError && <p className="mt-1 text-xs text-red-500">{locateError}</p>}

      {open && (
        <div className="absolute z-30 mt-1 w-full rounded-md border border-border bg-card shadow-lg">
          {loading && (
            <div className="flex items-center gap-2 p-3 text-sm text-muted-foreground">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Searching locations...
            </div>
          )}
          {!loading && searchError && <div className="p-3 text-sm text-red-500">{searchError}</div>}
          {!loading && !searchError && searchedAtLeastOnce.current && results.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground">No locations found for &quot;{query}&quot;.</div>
          )}
          {!loading &&
            results.map((r) => (
              <button
                key={`${r.lat}-${r.lon}`}
                className="flex w-full items-start gap-2 px-3 py-2 text-left text-sm hover:bg-muted"
                onMouseDown={() => {
                  onSelect(r);
                  setQuery(r.name);
                  setOpen(false);
                }}
              >
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                <span>
                  {r.name}
                  <span className="text-muted-foreground">
                    {[r.state, r.country].filter(Boolean).length > 0
                      ? `, ${[r.state, r.country].filter(Boolean).join(", ")}`
                      : ""}
                  </span>
                </span>
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
