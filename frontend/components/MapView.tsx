"use client";

import type { StyleSpecification } from "maplibre-gl";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";
import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap } from "maplibre-gl";

const DEFAULT_CENTER: [number, number] = [77.209, 28.6139]; // New Delhi fallback
const DEFAULT_ZOOM = 10;

const OSM_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: "raster",
      tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors",
      maxzoom: 19,
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

type MapPoint = { lat: number; lon: number; label?: string };

type MapViewProps = {
  /** Live center point – when it changes the map will fly there */
  centerPoint?: MapPoint | null;
  /** Whether the map is user-interactive (pan/zoom) */
  interactive?: boolean;
};

export function MapView({ centerPoint, interactive = false }: MapViewProps) {
  const mapRef = useRef<MapLibreMap | null>(null);
  const [ready, setReady] = useState(false);

  // Fly to new location whenever centerPoint changes
  useEffect(() => {
    if (!mapRef.current || !centerPoint) return;
    mapRef.current.flyTo({
      center: [centerPoint.lon, centerPoint.lat],
      zoom: 15,
      speed: 1.5,
      curve: 1,
    });
  }, [centerPoint?.lat, centerPoint?.lon]);

  const center = centerPoint
    ? ([centerPoint.lon, centerPoint.lat] as [number, number])
    : DEFAULT_CENTER;

  return (
    <div className="relative h-full w-full min-h-[400px] overflow-hidden">
      <Map
        ref={(m) => {
          if (m) {
            mapRef.current = m;
            setReady(true);
          }
        }}
        className="h-full w-full"
        center={center}
        zoom={centerPoint ? 15 : DEFAULT_ZOOM}
        interactive={interactive}
        styles={{ light: OSM_STYLE, dark: OSM_STYLE }}
        theme="light"
      >
        {centerPoint && (
          <MapMarker longitude={centerPoint.lon} latitude={centerPoint.lat}>
            <MarkerContent>
              <div className="relative">
                {/* Pulsing ring */}
                <span className="absolute inset-0 -m-2 rounded-full bg-emerald-500/30 animate-ping" />
                {/* Dot */}
                <div
                  className="h-4 w-4 rounded-full border-2 border-white bg-emerald-500 shadow-lg"
                  title={centerPoint.label ?? "Location"}
                />
              </div>
            </MarkerContent>
          </MapMarker>
        )}
      </Map>

      {/* Status overlay */}
      <div className="pointer-events-none absolute left-3 top-3 rounded-lg border border-zinc-700/60 bg-zinc-950/80 backdrop-blur-sm px-3 py-1.5 text-xs font-semibold text-zinc-300 shadow flex items-center gap-2">
        {centerPoint ? (
          <>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse inline-block" />
            Live • {centerPoint.lat.toFixed(4)}, {centerPoint.lon.toFixed(4)}
          </>
        ) : (
          <>
            <span className="h-2 w-2 rounded-full bg-zinc-600 inline-block" />
            Awaiting location…
          </>
        )}
      </div>
    </div>
  );
}
