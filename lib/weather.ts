// lib/weather.ts
// All calls to the weather provider happen here, server-side only.
// Never import this file into a "use client" component — it reads WEATHER_API_KEY.
//
// Uses OpenWeather's free-tier endpoints (Current Weather, 5 day / 3 hour Forecast,
// Geocoding) so it works with any standard OpenWeather API key. Alerts use the
// One Call 3.0 endpoint on a best-effort basis, since that requires a separate
// subscription — if it's not available, alerts are simply omitted (never faked).

const BASE_URL = "https://api.openweathermap.org";

function apiKey(): string {
  const key = process.env.WEATHER_API_KEY;
  if (!key) {
    throw new WeatherConfigError(
      "Weather service is not configured. Add WEATHER_API_KEY to your .env.local file."
    );
  }
  return key;
}

/** Thrown when a required API key is missing. API routes map this to a distinct
 *  "not configured" response so the UI can show a real configuration error
 *  instead of silently falling back to fake data. */
export class WeatherConfigError extends Error {
  code = "WEATHER_NOT_CONFIGURED" as const;
}

export interface WeatherLocation {
  name: string;
  state?: string;
  country?: string;
  lat: number;
  lon: number;
}

export interface CurrentWeather {
  location: WeatherLocation;
  tempC: number;
  feelsLikeC: number;
  condition: string;
  icon: string;
  humidity: number;
  windKph: number;
  pressure: number;
  visibilityKm: number;
  precipitationMm: number;
  sunrise: string;
  sunset: string;
  timezoneOffsetSeconds: number;
  observedAt: string;
}

export interface HourForecast {
  time: string;
  tempC: number;
  icon: string;
  condition: string;
  rainChance: number;
  windKph: number;
  precipitationMm: number;
}

export interface DayForecast {
  date: string;
  icon: string;
  condition: string;
  highC: number;
  lowC: number;
  rainChance: number;
}

export interface WeatherAlertItem {
  title: string;
  severity: "Informational" | "Moderate" | "Severe" | "Extreme";
  description: string;
  start: number;
  end: number;
  sender?: string;
}

function mapSeverity(event: string): WeatherAlertItem["severity"] {
  const e = event.toLowerCase();
  if (e.includes("extreme") || e.includes("hurricane") || e.includes("tornado")) return "Extreme";
  if (e.includes("severe") || e.includes("storm") || e.includes("flood")) return "Severe";
  if (e.includes("watch") || e.includes("advisory")) return "Moderate";
  return "Informational";
}

async function fetchJson(url: string, revalidateSeconds: number) {
  const res = await fetch(url, { next: { revalidate: revalidateSeconds } });
  return parseWeatherResponse(res);
}

/** Same as fetchJson but never serves a cached response — used for current
 *  weather, where the whole point is that the numbers are fresh right now. */
async function fetchJsonFresh(url: string) {
  const res = await fetch(url, { cache: "no-store" });
  return parseWeatherResponse(res);
}

async function parseWeatherResponse(res: Response) {
  console.log(`[OpenWeather] ${res.status} ${res.url.replace(/appid=[^&]+/, "appid=***")}`);
  if (!res.ok) {
    let message = `OpenWeather request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.message) message = body.message;
    } catch {
      // response wasn't JSON; keep the generic message
    }
    throw new Error(message);
  }
  return res.json();
}

/** Search for locations by free-text query using OpenWeather's Geocoding API. */
export interface AirQuality {
  aqi: 1 | 2 | 3 | 4 | 5; // OpenWeather's 1 (Good) – 5 (Very Poor) scale
  label: "Good" | "Fair" | "Moderate" | "Poor" | "Very Poor";
  pm2_5: number;
  pm10: number;
  co: number;
  no2: number;
  o3: number;
}

const AQI_LABELS: AirQuality["label"][] = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];

/** Real current air quality via OpenWeather's free Air Pollution API. */
export async function getAirQuality(lat: number, lon: number): Promise<AirQuality> {
  const key = apiKey();
  const url = `${BASE_URL}/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${key}`;
  const d = await fetchJson(url, 1800);
  const item = d.list?.[0];
  if (!item) throw new Error("Air quality data unavailable for this location.");
  const aqi = item.main.aqi as 1 | 2 | 3 | 4 | 5;
  return {
    aqi,
    label: AQI_LABELS[aqi - 1] ?? "Moderate",
    pm2_5: item.components.pm2_5,
    pm10: item.components.pm10,
    co: item.components.co,
    no2: item.components.no2,
    o3: item.components.o3,
  };
}

export async function searchLocations(query: string): Promise<WeatherLocation[]> {
  const key = apiKey();
  const url = `${BASE_URL}/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=6&appid=${key}`;
  console.log(`[Geocoding] GET /geo/1.0/direct?q=${encodeURIComponent(query)}&limit=6 (key hidden)`);
  const data = await fetchJson(url, 3600);
  const results = (data as any[]).map((d) => ({
    name: d.name,
    state: d.state,
    country: d.country,
    lat: d.lat,
    lon: d.lon,
  }));
  console.log(
    `[Geocoding] "${query}" resolved to ${results.length} result(s): ` +
      results.map((r) => `${r.name}${r.state ? `, ${r.state}` : ""}, ${r.country} (${r.lat}, ${r.lon})`).join(" | ")
  );
  return results;
}

/** Reverse-geocode coordinates (e.g. from browser Geolocation) into a display name. */
export async function reverseGeocode(lat: number, lon: number): Promise<WeatherLocation> {
  const key = apiKey();
  const url = `${BASE_URL}/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${key}`;
  const data = await fetchJson(url, 3600);
  const d = (data as any[])[0];
  if (!d) {
    // Coordinates are still valid even if no place name resolves (e.g. open ocean).
    return { name: `${lat.toFixed(2)}, ${lon.toFixed(2)}`, lat, lon };
  }
  return { name: d.name, state: d.state, country: d.country, lat, lon };
}

/** Get current weather for a lat/lon using the free Current Weather endpoint.
 *  Always requests fresh data (no-store) — current conditions must never be
 *  served from a stale cache, unlike forecasts which change more slowly. */
export async function getCurrentWeather(lat: number, lon: number, name?: string, state?: string): Promise<CurrentWeather> {
  const key = apiKey();
  const url = `${BASE_URL}/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;
  console.log(`[Weather] GET /data/2.5/weather?lat=${lat}&lon=${lon}&units=metric (key hidden), requestedName="${name ?? "(none)"}"`);
  const d = await fetchJsonFresh(url);

  const result: CurrentWeather = {
    location: { name: name ?? d.name, state, country: d.sys?.country, lat, lon },
    tempC: d.main.temp,
    feelsLikeC: d.main.feels_like,
    condition: d.weather?.[0]?.description ?? "Unknown",
    icon: d.weather?.[0]?.icon ?? "01d",
    humidity: d.main.humidity,
    windKph: Math.round((d.wind?.speed ?? 0) * 3.6),
    pressure: d.main.pressure,
    visibilityKm: Math.round((d.visibility ?? 10000) / 1000),
    precipitationMm: (d.rain?.["1h"] ?? 0) + (d.snow?.["1h"] ?? 0),
    sunrise: new Date(d.sys.sunrise * 1000).toISOString(),
    sunset: new Date(d.sys.sunset * 1000).toISOString(),
    timezoneOffsetSeconds: d.timezone ?? 0,
    observedAt: new Date(d.dt * 1000).toISOString(),
  };

  console.log(
    `[Weather] resolved "${result.location.name}, ${result.location.state ?? ""} ${result.location.country ?? ""}" ` +
      `(${lat}, ${lon}) → ${result.tempC}°C, "${result.condition}", humidity ${result.humidity}%, wind ${result.windKph} km/h, ` +
      `precip ${result.precipitationMm}mm, observed ${result.observedAt} (OpenWeather dt=${d.dt}, raw temp=${d.main.temp})`
  );

  return result;
}

/**
 * Get hourly + daily forecast using the free 5 day / 3 hour Forecast endpoint.
 * Buckets the 3-hourly data into an "hourly" list (next ~24h) and aggregates
 * per-day highs/lows/rain chance for a "daily" list (up to 5 days — OpenWeather's
 * free forecast tier doesn't extend to 7).
 */
export async function getForecast(lat: number, lon: number): Promise<{ hourly: HourForecast[]; daily: DayForecast[] }> {
  const key = apiKey();
  const url = `${BASE_URL}/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${key}`;
  const d = await fetchJson(url, 900);
  const list: any[] = d.list ?? [];

  const hourly: HourForecast[] = list.slice(0, 8).map((h) => ({
    time: new Date(h.dt * 1000).toISOString(),
    tempC: h.main.temp,
    icon: h.weather?.[0]?.icon ?? "01d",
    condition: h.weather?.[0]?.description ?? "Unknown",
    rainChance: Math.round((h.pop ?? 0) * 100),
    windKph: Math.round((h.wind?.speed ?? 0) * 3.6),
    precipitationMm: (h.rain?.["3h"] ?? 0) + (h.snow?.["3h"] ?? 0),
  }));

  const byDay = new Map<string, any[]>();
  for (const entry of list) {
    const dayKey = new Date(entry.dt * 1000).toISOString().slice(0, 10);
    if (!byDay.has(dayKey)) byDay.set(dayKey, []);
    byDay.get(dayKey)!.push(entry);
  }

  const daily: DayForecast[] = Array.from(byDay.entries())
    .slice(0, 5)
    .map(([dayKey, entries]) => {
      const temps = entries.map((e) => e.main.temp);
      const pops = entries.map((e) => e.pop ?? 0);
      // Prefer the midday entry for a representative icon/condition.
      const midday =
        entries.find((e) => new Date(e.dt * 1000).getUTCHours() === 12) ?? entries[Math.floor(entries.length / 2)];
      return {
        date: new Date(`${dayKey}T00:00:00Z`).toISOString(),
        icon: midday.weather?.[0]?.icon ?? "01d",
        condition: midday.weather?.[0]?.description ?? "Unknown",
        highC: Math.max(...temps),
        lowC: Math.min(...temps),
        rainChance: Math.round(Math.max(...pops) * 100),
      };
    });

  return { hourly, daily };
}

/**
 * Get active weather alerts for a location via the One Call 3.0 endpoint.
 * That endpoint requires a separate OpenWeather subscription; if it's not
 * enabled on the configured key, this returns an empty list rather than
 * erroring the whole page — alerts are simply "unavailable", never faked.
 */
export async function getAlerts(lat: number, lon: number): Promise<WeatherAlertItem[]> {
  const key = process.env.WEATHER_API_KEY;
  if (!key) return [];
  try {
    const url = `${BASE_URL}/data/3.0/onecall?lat=${lat}&lon=${lon}&units=metric&exclude=current,minutely,hourly,daily&appid=${key}`;
    const d = await fetchJson(url, 600);
    const alerts = d.alerts ?? [];
    return alerts.map((a: any) => ({
      title: a.event,
      severity: mapSeverity(a.event),
      description: a.description,
      start: new Date(a.start * 1000).toISOString(),
      end: new Date(a.end * 1000).toISOString(),
    }));
  } catch {
    // One Call 3.0 not enabled on this key, or a transient failure — treat as
    // "no alert data available" rather than surfacing an error for a feature
    // that's genuinely optional.
    return [];
  }
}
