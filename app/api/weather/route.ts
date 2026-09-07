import { NextResponse } from "next/server";
import { getCurrentWeather, getForecast, getAlerts, WeatherConfigError } from "@/lib/weather";

// Force this route to always run per-request — current weather must never be
// served from Next's Full Route Cache or a static optimization pass.
export const dynamic = "force-dynamic";
export const revalidate = 0;

// GET /api/weather?lat=..&lon=..&name=..&state=..&include=forecast,alerts
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lon = parseFloat(searchParams.get("lon") ?? "");
  const name = searchParams.get("name") ?? undefined;
  const state = searchParams.get("state") ?? undefined;
  const include = (searchParams.get("include") ?? "").split(",").filter(Boolean);

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: "Invalid location provided" }, { status: 400 });
  }

  try {
    const current = await getCurrentWeather(lat, lon, name, state);
    const response: Record<string, unknown> = { current, fetchedAt: new Date().toISOString() };

    if (include.includes("forecast")) {
      response.forecast = await getForecast(lat, lon);
    }
    if (include.includes("alerts")) {
      response.alerts = await getAlerts(lat, lon);
    }

    return NextResponse.json(response);
  } catch (err) {
    if (err instanceof WeatherConfigError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 503 });
    }
    console.error("Weather API error:", err);
    return NextResponse.json(
      { error: "Live weather data is currently unavailable. Please try again." },
      { status: 502 }
    );
  }
}
