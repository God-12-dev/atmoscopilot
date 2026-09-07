import { Card, CardContent } from "@/components/ui/card";

/**
 * Lightweight map using OpenStreetMap's public embed (no API key required).
 * Always reflects the actual selected coordinates — not decorative.
 */
export function LocationMap({ lat, lon, label }: { lat: number; lon: number; label: string }) {
  const delta = 0.08;
  const bbox = `${lon - delta}%2C${lat - delta}%2C${lon + delta}%2C${lat + delta}`;
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat}%2C${lon}`;

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        <iframe
          title={`Map of ${label}`}
          src={src}
          className="h-56 w-full border-0"
          loading="lazy"
        />
        <div className="flex items-center justify-between px-4 py-2 text-xs text-muted-foreground">
          <span>{label}</span>
          <span>
            {lat.toFixed(4)}, {lon.toFixed(4)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
