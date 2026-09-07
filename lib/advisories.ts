// lib/advisories.ts
// Deterministic, rule-based advisories generated directly from real weather
// data — no AI call involved, so these are exact and reproducible given the
// same inputs. Clearly labeled in the UI as AI/rule-based guidance, never as
// an official government warning. Has no server-only imports, so it's safe
// to use directly in client components.

import type { CurrentWeather, HourForecast, WeatherAlertItem } from "./weather";

export interface Advisory {
  audience: "farmer" | "citizen" | "disaster";
  title: string;
  detail: string;
  level: "info" | "caution" | "warning";
}

interface AdvisoryInput {
  current: CurrentWeather;
  hourly?: HourForecast[];
  alerts?: WeatherAlertItem[];
}

export function buildAdvisories(ctx: AdvisoryInput): Advisory[] {
  const advisories: Advisory[] = [];
  const c = ctx.current;
  const maxRainChance = Math.max(0, ...(ctx.hourly ?? []).map((h) => h.rainChance));

  // Citizen advisories
  if (maxRainChance >= 50) {
    advisories.push({
      audience: "citizen",
      title: "Carry an umbrella",
      detail: `Rain chance reaches ${maxRainChance}% in the next few hours in ${c.location.name}.`,
      level: "caution",
    });
  }
  if (c.tempC >= 38) {
    advisories.push({
      audience: "citizen",
      title: "Heat precaution",
      detail: `Current temperature is ${Math.round(c.tempC)}°C. Stay hydrated and avoid prolonged sun exposure.`,
      level: "warning",
    });
  }
  if (c.windKph >= 40) {
    advisories.push({
      audience: "citizen",
      title: "Strong wind advisory",
      detail: `Wind speed is ${c.windKph} km/h. Secure loose outdoor items.`,
      level: "warning",
    });
  }

  // Farmer advisories
  if (maxRainChance < 20 && c.humidity < 40) {
    advisories.push({
      audience: "farmer",
      title: "Irrigation likely needed",
      detail: `Low rain chance (${maxRainChance}%) and humidity (${c.humidity}%) — consider irrigating.`,
      level: "info",
    });
  }
  if (maxRainChance >= 60) {
    advisories.push({
      audience: "farmer",
      title: "Delay irrigation and spraying",
      detail: `High rain chance (${maxRainChance}%) — irrigation or pesticide spraying may be washed out.`,
      level: "caution",
    });
  }
  if (c.windKph >= 35) {
    advisories.push({
      audience: "farmer",
      title: "Avoid spraying in high wind",
      detail: `Wind at ${c.windKph} km/h risks spray drift — postpone if possible.`,
      level: "caution",
    });
  }

  // Disaster-management advisories
  if (ctx.alerts && ctx.alerts.length > 0) {
    for (const a of ctx.alerts) {
      advisories.push({
        audience: "disaster",
        title: `${a.severity} alert: ${a.title}`,
        detail: a.description,
        level: a.severity === "Extreme" || a.severity === "Severe" ? "warning" : "caution",
      });
    }
  }

  if (advisories.length === 0) {
    advisories.push({
      audience: "citizen",
      title: "No notable advisories",
      detail: `Conditions in ${c.location.name} do not currently trigger any advisory based on the available data.`,
      level: "info",
    });
  }

  return advisories;
}
