import { NextResponse } from "next/server";
import { reverseGeocode, WeatherConfigError } from "@/lib/weather";

// GET /api/location/current?lat=..&lon=..
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat") ?? "");
  const lon = parseFloat(searchParams.get("lon") ?? "");

  if (isNaN(lat) || isNaN(lon)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  try {
    const location = await reverseGeocode(lat, lon);
    return NextResponse.json({ location });
  } catch (err) {
    if (err instanceof WeatherConfigError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 503 });
    }
    console.error("Reverse geocode error:", err);
    return NextResponse.json({ error: "Couldn't resolve your current location." }, { status: 502 });
  }
}
