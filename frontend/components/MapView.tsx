"use client";

import type { StyleSpecification } from "maplibre-gl";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";
import type { StartTripResponse, TripSegment } from "@/lib/api";

const DEFAULT_CENTER: [number, number] = [77.209, 28.6139];
const DEFAULT_ZOOM = 10;
const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "OpenStreetMap",
    },
  },
  layers: [
    {
      id: "osm",
      type: "raster",
      source: "osm",
    },
  ],
};

type MapPoint = {
  id: string;
  label: string;
  lat: number;
  lon: number;
};

type MapViewProps = {
  data: StartTripResponse | null;
};

export function MapView({ data }: MapViewProps) {
  const points = getMapPoints(data);
  const center = getMapCenter(points);

  return (
    <div className="relative h-full min-h-[500px] overflow-hidden rounded-md bg-slate-100 dark:bg-slate-800">
      <Map
        key={`${center[0]}-${center[1]}-${points.length}`}
        className="h-full min-h-[500px]"
        center={center}
        zoom={points.length > 0 ? 11 : DEFAULT_ZOOM}
        interactive={false}
        styles={{ light: OSM_STYLE, dark: OSM_STYLE }}
        theme="light"
      >
        {points.map((point) => (
          <MapMarker key={point.id} longitude={point.lon} latitude={point.lat}>
            <MarkerContent>
              <div
                data-testid={`map-marker-${point.id}`}
                data-lat={point.lat}
                data-lon={point.lon}
                className="h-4 w-4 rounded-full border-2 border-white bg-emerald-600 shadow-md ring-4 ring-emerald-600/20"
                title={point.label}
              />
            </MarkerContent>
          </MapMarker>
        ))}
      </Map>
      <div className="pointer-events-none absolute left-3 top-3 rounded-md border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 px-3 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 shadow-sm">
        {points.length > 0 ? `${points.length} route points` : "Awaiting route"}
      </div>
    </div>
  );
}

function getMapPoints(data: StartTripResponse | null): MapPoint[] {
  if (!data) {
    return [];
  }

  return data.segments.flatMap((segment, index) =>
    getSegmentPoints(segment, index),
  );
}

function getSegmentPoints(segment: TripSegment, index: number): MapPoint[] {
  const coords = segment.verifiedData?.coords;
  const points: MapPoint[] = [];

  if (isCoordinate(coords?.departure)) {
    points.push({
      id: `${index}-departure`,
      label: "Departure",
      lat: coords.departure[0],
      lon: coords.departure[1],
    });
  }

  if (isCoordinate(coords?.arrival)) {
    points.push({
      id: `${index}-arrival`,
      label: "Arrival",
      lat: coords.arrival[0],
      lon: coords.arrival[1],
    });
  }

  return points;
}

function isCoordinate(value: unknown): value is [number, number] {
  return (
    Array.isArray(value) &&
    value.length === 2 &&
    typeof value[0] === "number" &&
    typeof value[1] === "number"
  );
}

function getMapCenter(points: MapPoint[]): [number, number] {
  if (points.length === 0) {
    return DEFAULT_CENTER;
  }

  const totals = points.reduce(
    (acc, point) => ({
      lat: acc.lat + point.lat,
      lon: acc.lon + point.lon,
    }),
    { lat: 0, lon: 0 },
  );

  return [totals.lon / points.length, totals.lat / points.length];
}
