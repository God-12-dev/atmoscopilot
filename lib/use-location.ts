"use client";

import { useEffect, useState } from "react";

export interface SelectedLocation {
  name: string;
  state?: string;
  country?: string;
  lat: number;
  lon: number;
}

const STORAGE_KEY = "weathergpt:selected-location";

/**
 * Tracks the user's selected location. Intentionally has NO hardcoded
 * default city (e.g. Bengaluru) — until the user searches for a place or
 * uses "current location", `location` is null and calling pages should
 * render a clear "choose a location" state instead of guessing.
 */
export function useSelectedLocation() {
  const [location, setLocationState] = useState<SelectedLocation | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setLocationState(JSON.parse(stored));
    } catch {
      // ignore malformed storage
    } finally {
      setReady(true);
    }
  }, []);

  function setLocation(loc: SelectedLocation) {
    setLocationState(loc);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(loc));
    } catch {
      // storage may be unavailable; state still updates in-memory
    }
  }

  function clearLocation() {
    setLocationState(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  return { location, setLocation, clearLocation, ready };
}
