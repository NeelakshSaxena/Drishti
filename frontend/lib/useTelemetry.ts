import { useState, useEffect, useCallback, useRef } from "react";
import { useDebounce } from "./hooks";

const WS_BASE = (process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || "https://drishti-walb.onrender.com").replace(/^http/, "ws");

export type TelemetryState = {
  status: "online" | "offline" | "connecting";
  lastHeartbeat: string | null;
  location: { lat: number; lon: number } | null;
  battery: { level: number; is_charging: boolean } | null;
  network: { type: string; is_connected: boolean } | null;
  media: { is_playing: boolean; volume: number } | null;
  permissions: Record<string, boolean> | null;
};

export function useTelemetry(childId: string | null) {
  const [state, setState] = useState<TelemetryState>({
    status: "connecting",
    lastHeartbeat: null,
    location: null,
    battery: null,
    network: null,
    media: null,
    permissions: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  
  // To avoid rapid re-renders we can keep a ref to pending state updates
  // and flush them periodically or use debounce
  const pendingUpdates = useRef<Partial<TelemetryState>>({});

  const flushUpdates = useCallback(() => {
    if (Object.keys(pendingUpdates.current).length > 0) {
      setState(prev => ({ ...prev, ...pendingUpdates.current }));
      pendingUpdates.current = {};
    }
  }, []);

  // Debounce the flush to max 2 times per second
  const debouncedFlush = useDebounce(flushUpdates, 500);

  useEffect(() => {
    if (!childId) return;

    let isMounted = true;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      const ws = new WebSocket(`${WS_BASE}/ws/frontend?child_id=${childId}`);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMounted) return;
        setState(prev => ({ ...prev, status: "online" }));
      };

      ws.onmessage = (event) => {
        if (!isMounted) return;
        try {
          const payload = JSON.parse(event.data);
          
          if (payload.type === "device_status" && payload.status === "offline") {
            pendingUpdates.current.status = "offline";
            debouncedFlush();
          } else if (payload.type === "heartbeat") {
            pendingUpdates.current.status = "online";
            pendingUpdates.current.lastHeartbeat = payload.timestamp;
            debouncedFlush();
          } else if (payload.type === "telemetry") {
            pendingUpdates.current.status = "online";
            pendingUpdates.current.lastHeartbeat = payload.timestamp;
            
            const eventType = payload.event_type;
            const data = payload.data;
            
            if (eventType === "location") {
              pendingUpdates.current.location = { lat: data.lat, lon: data.lon };
            } else if (eventType === "battery") {
              pendingUpdates.current.battery = { level: data.level, is_charging: data.is_charging };
            } else if (eventType === "network") {
              pendingUpdates.current.network = { type: data.type, is_connected: data.is_connected };
            } else if (eventType === "media") {
              pendingUpdates.current.media = { is_playing: data.is_playing, volume: data.volume };
            } else if (eventType === "permissions") {
              pendingUpdates.current.permissions = data.permissions || data;
            }
            debouncedFlush();
          }
        } catch (err) {
          console.error("Failed to parse telemetry message", err);
        }
      };

      ws.onclose = () => {
        if (!isMounted) return;
        setState(prev => ({ ...prev, status: "offline" }));
        // Try reconnecting after 3 seconds
        reconnectTimeout = setTimeout(connect, 3000);
      };

      ws.onerror = (err) => {
        console.error("Telemetry WS Error", err);
        ws.close();
      };
    };

    connect();

    // Setup ping to keep connection alive
    const pingInterval = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: "ping" }));
      }
    }, 30000);

    return () => {
      isMounted = false;
      clearTimeout(reconnectTimeout);
      clearInterval(pingInterval);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [childId, debouncedFlush]);

  return state;
}
