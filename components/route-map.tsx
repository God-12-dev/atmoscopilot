"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import type { SelectedLocation } from "@/lib/use-location";
import type { RouteOption } from "@/lib/use-routes";

const MapContainer = dynamic(() => import("react-leaflet").then((m) => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((m) => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((m) => m.Marker), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then((m) => m.Popup), { ssr: false });
const Polyline = dynamic(() => import("react-leaflet").then((m) => m.Polyline), { ssr: false });

const SELECTED_COLOR = "#6366f1";
const ALT_COLOR = "#94a3b8";

function LeafletRouteMap({
  start,
  destination,
  routes,
  selectedRouteId,
}: {
  start: SelectedLocation;
  destination: SelectedLocation;
  routes: RouteOption[];
  selectedRouteId: string | null;
}) {
  const [L, setL] = useState<any>(null);
  useEffect(() => {
    import("leaflet").then((l) => {
      require("leaflet/dist/leaflet.css");
      setL(l.default);
    });
  }, []);
  if (!L) return <div className="h-80 bg-muted animate-pulse rounded-b-xl" />;

  const startIcon = new L.Icon({
    iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
    iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
    shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  const allPoints: [number, number][] = routes.flatMap((r) =>
    r.geometry.coordinates.map(([lon, lat]) => [lat, lon] as [number, number])
  );
  const bounds: [[number, number], [number, number]] | null =
    allPoints.length > 0
      ? [
          [Math.min(...allPoints.map((p) => p[0]), start.lat, destination.lat), Math.min(...allPoints.map((p) => p[1]), start.lon, destination.lon)],
          [Math.max(...allPoints.map((p) => p[0]), start.lat, destination.lat), Math.max(...allPoints.map((p) => p[1]), start.lon, destination.lon)],
        ]
      : null;

  // Draw non-selected routes first so the selected one renders on top.
  const ordered = [...routes].sort((a, b) => (a.id === selectedRouteId ? 1 : b.id === selectedRouteId ? -1 : 0));

  return (
    <MapContainer
      bounds={bounds ?? undefined}
      center={bounds ? undefined : [start.lat, start.lon]}
      zoom={bounds ? undefined : 11}
      scrollWheelZoom={false}
      className="h-80 w-full rounded-b-xl"
      key={`${start.lat}-${start.lon}-${destination.lat}-${destination.lon}`}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {ordered.map((route) => {
        const isSelected = route.id === selectedRouteId;
        return (
          <Polyline
            key={route.id}
            positions={route.geometry.coordinates.map(([lon, lat]) => [lat, lon] as [number, number])}
            pathOptions={{
              color: isSelected ? SELECTED_COLOR : ALT_COLOR,
              weight: isSelected ? 5 : 3,
              opacity: isSelected ? 0.95 : 0.55,
              dashArray: isSelected ? undefined : "5 6",
            }}
          />
        );
      })}
      <Marker position={[start.lat, start.lon]} icon={startIcon}>
        <Popup>
          <strong>Start</strong>
          <br />
          {start.name}
        </Popup>
      </Marker>
      <Marker position={[destination.lat, destination.lon]} icon={startIcon}>
        <Popup>
          <strong>Destination</strong>
          <br />
          {destination.name}
        </Popup>
      </Marker>
    </MapContainer>
  );
}

/** Renders real route geometry (from OSRM, via /api/routes) on an OpenStreetMap
 *  base layer. Never draws a route that wasn't actually returned by the
 *  routing provider. */
export function RouteMap(props: {
  start: SelectedLocation;
  destination: SelectedLocation;
  routes: RouteOption[];
  selectedRouteId: string | null;
}) {
  return <LeafletRouteMap {...props} />;
}
