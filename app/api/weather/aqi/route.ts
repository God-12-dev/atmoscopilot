import { NextResponse } from "next/server";
import { getAirQuality, WeatherConfigError } from "@/lib/weather";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lon = parseFloat(searchParams.get("lon") ?? "");
  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: "Invalid location provided" }, { status: 400 });
  }

  try {
    const aqi = await getAirQuality(lat, lon);
    return NextResponse.json({ aqi });
  } catch (err) {
    if (err instanceof WeatherConfigError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 503 });
    }
    console.error("[api/weather/aqi] error:", err);
    return NextResponse.json({ error: "Air quality data is currently unavailable." }, { status: 502 });
  }
}
