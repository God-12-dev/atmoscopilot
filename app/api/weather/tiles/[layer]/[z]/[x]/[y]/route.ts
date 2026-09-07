import { NextResponse } from "next/server";

// Proxies OpenWeather's map tile layers (precipitation, temperature, wind,
// clouds, pressure) server-side so WEATHER_API_KEY is never embedded in a
// client-fetched URL. The Leaflet map on the client requests tiles from
// this route; this route is the only place that talks to OpenWeather with
// the real key.

const ALLOWED_LAYERS = new Set([
  "precipitation_new",
  "temp_new",
  "wind_new",
  "clouds_new",
  "pressure_new",
]);

export async function GET(
  _req: Request,
  { params }: { params: { layer: string; z: string; x: string; y: string } }
) {
  const { layer, z, x, y } = params;

  if (!ALLOWED_LAYERS.has(layer)) {
    return NextResponse.json({ error: "Unknown map layer." }, { status: 400 });
  }

  const key = process.env.WEATHER_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Weather service is not configured. Add WEATHER_API_KEY to your .env.local file." },
      { status: 503 }
    );
  }

  const upstream = `https://tile.openweathermap.org/map/${layer}/${z}/${x}/${y}.png?appid=${key}`;

  try {
    const res = await fetch(upstream, { next: { revalidate: 600 } });
    if (!res.ok) {
      return NextResponse.json({ error: `Tile fetch failed (${res.status})` }, { status: 502 });
    }
    const buffer = await res.arrayBuffer();
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": res.headers.get("Content-Type") ?? "image/png",
        "Cache-Control": "public, max-age=600",
      },
    });
  } catch (err) {
    console.error("[api/weather/tiles] error:", err);
    return NextResponse.json({ error: "Map layer temporarily unavailable." }, { status: 502 });
  }
}
