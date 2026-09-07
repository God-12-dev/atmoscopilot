import { NextResponse } from "next/server";

// Public OSRM demo routing server — no API key required, but it's a shared,
// rate-limited demo instance (project-osrm.org). Fine for a prototype; a
// production deployment should point OSRM_BASE_URL at a self-hosted or paid
// OSRM instance instead. Override via env if needed.
const OSRM_BASE_URL = process.env.OSRM_BASE_URL || "https://router.project-osrm.org";

interface LatLon {
  lat: number;
  lon: number;
}

function isLatLon(v: unknown): v is LatLon {
  return (
    !!v &&
    typeof v === "object" &&
    typeof (v as any).lat === "number" &&
    typeof (v as any).lon === "number" &&
    Number.isFinite((v as any).lat) &&
    Number.isFinite((v as any).lon)
  );
}

// POST /api/routes  { start: {lat,lon}, destination: {lat,lon} }
// Proxied server-side so the routing provider is never called directly from
// the browser, and so the base URL can be swapped without a client rebuild.
export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const start = body?.start;
  const destination = body?.destination;

  if (!isLatLon(start) || !isLatLon(destination)) {
    return NextResponse.json(
      { error: "Both start and destination coordinates ({ lat, lon }) are required." },
      { status: 400 }
    );
  }

  const coords = `${start.lon},${start.lat};${destination.lon},${destination.lat}`;
  const url = `${OSRM_BASE_URL}/route/v1/driving/${coords}?alternatives=true&overview=full&geometries=geojson`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    const data = await res.json();

    if (!res.ok || data.code !== "Ok" || !Array.isArray(data.routes) || data.routes.length === 0) {
      return NextResponse.json(
        { error: data?.message || "No route could be found between these locations." },
        { status: 502 }
      );
    }

    const routes = data.routes.map((r: any, i: number) => ({
      id: `route-${i}`,
      distanceMeters: r.distance,
      durationSeconds: r.duration,
      // GeoJSON LineString: coordinates are [lon, lat] pairs, per the OSRM/GeoJSON spec.
      geometry: r.geometry,
    }));

    return NextResponse.json({ routes, provider: "OSRM (router.project-osrm.org)" });
  } catch (err) {
    console.error("Route planning error:", err);
    return NextResponse.json(
      { error: "The routing service is currently unavailable. Please try again." },
      { status: 502 }
    );
  }
}
