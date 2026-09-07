"use client";

import { useEffect, useState } from "react";
import type { SelectedLocation } from "@/lib/use-location";
import type { CurrentWeather, HourForecast, DayForecast, WeatherAlertItem } from "@/lib/weather";

interface WeatherState {
  current: CurrentWeather | null;
  hourly: HourForecast[];
  daily: DayForecast[];
  alerts: WeatherAlertItem[];
  loading: boolean;
  error: string | null;
  isConfigError: boolean;
  fetchedAt: string | null;
}

/** Fetches current + forecast + alerts for the given location. Re-fetches
 *  whenever the location changes, and clears stale data immediately so old
 *  weather never lingers on screen after switching locations. */
export function useWeatherData(location: SelectedLocation | null, include: string[] = ["forecast", "alerts"]) {
  const [state, setState] = useState<WeatherState>({
    current: null,
    hourly: [],
    daily: [],
    alerts: [],
    loading: false,
    error: null,
    isConfigError: false,
    fetchedAt: null,
  });

  useEffect(() => {
    if (!location) {
      setState((s) => ({ ...s, current: null, hourly: [], daily: [], alerts: [], loading: false, error: null }));
      return;
    }

    let cancelled = false;
    // Clear old data immediately so a stale location's weather never stays
    // on screen while the new one loads.
    setState({
      current: null,
      hourly: [],
      daily: [],
      alerts: [],
      loading: true,
      error: null,
      isConfigError: false,
      fetchedAt: null,
    });

    async function load() {
      try {
        const params = new URLSearchParams({
          lat: String(location!.lat),
          lon: String(location!.lon),
          name: location!.name,
          include: include.join(","),
        });
        if (location!.state) params.set("state", location!.state);

        const res = await fetch(`/api/weather?${params}`, { cache: "no-store" });
        const data = await res.json();

        if (!res.ok) {
          if (!cancelled) {
            setState({
              current: null,
              hourly: [],
              daily: [],
              alerts: [],
              loading: false,
              error: data.error ?? "Live weather data is currently unavailable.",
              isConfigError: data.code === "WEATHER_NOT_CONFIGURED",
              fetchedAt: null,
            });
          }
          return;
        }

        if (!cancelled) {
          setState({
            current: data.current,
            hourly: data.forecast?.hourly ?? [],
            daily: data.forecast?.daily ?? [],
            alerts: data.alerts ?? [],
            loading: false,
            error: null,
            isConfigError: false,
            fetchedAt: data.fetchedAt ?? new Date().toISOString(),
          });
        }
      } catch {
        if (!cancelled) {
          setState({
            current: null,
            hourly: [],
            daily: [],
            alerts: [],
            loading: false,
            error: "Live weather data is currently unavailable. Please try again.",
            isConfigError: false,
            fetchedAt: null,
          });
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.lat, location?.lon]);

  return state;
}
