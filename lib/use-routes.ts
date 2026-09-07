"use client";

import { useState } from "react";
import type { SelectedLocation } from "@/lib/use-location";

export interface RouteGeometry {
  type: "LineString";
  coordinates: [number, number][]; // [lon, lat] pairs, per GeoJSON
}

export interface RouteOption {
  id: string;
  distanceMeters: number;
  durationSeconds: number;
  geometry: RouteGeometry;
}

interface RoutePlanState {
  routes: RouteOption[];
  loading: boolean;
  error: string | null;
}

/** Requests real driving routes between two points from /api/routes (which
 *  proxies OSRM). Nothing here is hardcoded — no route is returned until the
 *  routing provider responds. */
export function useRoutePlan() {
  const [state, setState] = useState<RoutePlanState>({ routes: [], loading: false, error: null });

  async function planRoute(start: SelectedLocation, destination: SelectedLocation) {
    setState({ routes: [], loading: true, error: null });
    try {
      const res = await fetch("/api/routes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: { lat: start.lat, lon: start.lon },
          destination: { lat: destination.lat, lon: destination.lon },
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setState({ routes: [], loading: false, error: data.error ?? "Couldn't plan a route between these locations." });
        return;
      }
      setState({ routes: data.routes ?? [], loading: false, error: null });
    } catch {
      setState({ routes: [], loading: false, error: "The routing service is currently unavailable. Please try again." });
    }
  }

  function reset() {
    setState({ routes: [], loading: false, error: null });
  }

  return { ...state, planRoute, reset };
}
