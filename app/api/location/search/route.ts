import { NextResponse } from "next/server";
import { searchLocations, WeatherConfigError } from "@/lib/weather";

// GET /api/location/search?q=Manvi
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim();

  if (!q || q.length < 2) {
    return NextResponse.json({ results: [] });
  }

  try {
    const results = await searchLocations(q);
    return NextResponse.json({ results });
  } catch (err) {
    if (err instanceof WeatherConfigError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 503 });
    }
    console.error("Location search error:", err);
    return NextResponse.json({ error: "Location search is currently unavailable." }, { status: 502 });
  }
}
