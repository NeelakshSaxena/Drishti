/* Family tracking API client */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// ===== Shared Types =====

export interface Child {
  id: string;
  name: string;
  child_code: string;
  parent_id: string | null;
  active_trip_id: string | null;
  current_trip: Trip | null;
  trip_history: Trip[];
  created_at: string;
}

export interface Parent {
  id: string;
  linked_children: string[];
  created_at: string;
}

export interface Trip {
  id: string;
  events: TripEvent[];
  status: "active" | "ended";
  current_event_index: number;
  started_at: string;
  ended_at: string | null;
}

export interface TripEvent {
  id: string;
  type: string;
  from: string;
  to: string;
  from_location?: string;
  to_location?: string;
  time?: string;
  ticket_url?: string;
  status: "pending" | "current" | "completed";
  description?: string;
  created_at: string;
}

export type EventRequest = {
  type: string;
  from: string;
  to: string;
  time?: string;
  ticket_url?: string;
};

export type LocationData = {
  child_id: string;
  lat: number;
  lng: number;
  updated_at: string;
};

export type HealthCheckResponse = {
  status: string;
  backend: string;
  services: Record<string, boolean | string>;
  errors?: string[];
};

// ===== Family Tracking API (new) =====

export async function initChild(): Promise<{ success: boolean; child_id: string; child_code: string }> {
  const res = await fetch(`${API_BASE}/family/child/init`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to init child");
  return res.json();
}

export async function getChildDashboard(childId: string): Promise<{ child: Child; current_trip: Trip | null; trip_history: Trip[] }> {
  const res = await fetch(`${API_BASE}/family/child/dashboard?child_id=${childId}`);
  if (!res.ok) throw new Error("Failed to get child dashboard");
  return res.json();
}

export async function getChildDetails(childId: string): Promise<Child> {
  const res = await fetch(`${API_BASE}/child/${childId}`);
  if (!res.ok) throw new Error("Failed to get child details");
  return res.json();
}

export async function getChildren(): Promise<Child[]> {
  const res = await fetch(`${API_BASE}/children`);
  if (!res.ok) throw new Error("Failed to get children");
  return res.json();
}

export async function createChild(name: string): Promise<Child> {
  const res = await fetch(`${API_BASE}/children`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error("Failed to create child");
  return res.json();
}

export async function startTrip(childId: string): Promise<Trip> {
  const res = await fetch(`${API_BASE}/child/${childId}/trip/start`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to start trip");
  return res.json();
}

export async function endTrip(childId: string): Promise<Trip> {
  const res = await fetch(`${API_BASE}/child/${childId}/trip/end`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to end trip");
  return res.json();
}

export async function addEvent(tripId: string, event: EventRequest): Promise<TripEvent> {
  const res = await fetch(`${API_BASE}/trip/${tripId}/event`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  if (!res.ok) throw new Error("Failed to add event");
  return res.json();
}

export async function nextEvent(tripId: string): Promise<{
  current_event_index: number;
  current_event: TripEvent | null;
  trip_status: "active" | "ended";
}> {
  const res = await fetch(`${API_BASE}/trip/${tripId}/event/next`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to advance event");
  return res.json();
}

export async function updateLocation(childId: string, lat: number, lng: number): Promise<LocationData> {
  const res = await fetch(`${API_BASE}/child/${childId}/location`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ lat, lng }),
  });
  if (!res.ok) throw new Error("Failed to update location");
  return res.json();
}

export async function addEventToTrip(
  childId: string,
  event: {
    type: string;
    from_location: string;
    to_location: string;
    time?: string;
    description?: string;
  }
): Promise<{ success: boolean; event: TripEvent }> {
  const res = await fetch(`${API_BASE}/family/child/trip/event?child_id=${childId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  if (!res.ok) throw new Error("Failed to add event");
  return res.json();
}

// ===== Parent Endpoints =====

export async function initParent(): Promise<{ success: boolean; parent_id: string }> {
  const res = await fetch(`${API_BASE}/family/parent/init`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to init parent");
  return res.json();
}

export async function linkChild(parentId: string, childCode: string): Promise<{ success: boolean; message: string }> {
  const res = await fetch(`${API_BASE}/family/parent/link-child?parent_id=${parentId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ child_code: childCode }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || "Failed to link child");
  }
  return res.json();
}

export async function getParentDashboard(parentId: string): Promise<{ parent: Parent; linked_children: Child[] }> {
  const res = await fetch(`${API_BASE}/family/parent/dashboard?parent_id=${parentId}`);
  if (!res.ok) throw new Error("Failed to get parent dashboard");
  return res.json();
}

// ===== Health Check =====

export async function healthCheck(): Promise<HealthCheckResponse> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error("Health check failed");
    return res.json();
  } catch {
    return { status: "error", backend: "offline", services: { api: false, memory_store: false }, errors: ["Connection failed"] };
  }
}

// ===== Legacy API (Process routes - backward compatibility) =====

export type StartTripPayload = {
  user_name: string;
  trip_mode: string;
  segments: TripSegment[];
};

export type TripSegment = {
  type: string;
  status: string;
  details: Record<string, unknown>;
  verifiedData?: {
    coords?: {
      departure?: [number, number] | null;
      arrival?: [number, number] | null;
    };
  };
};

export type StartTripResponse = {
  trip_id: string;
  user_name: string;
  trip_mode: string;
  trip_start_time: string;
  trip_status: string;
  segments: TripSegment[];
  flight_info: Record<string, unknown>;
};

export async function startTripLegacy(payload: StartTripPayload): Promise<StartTripResponse> {
  const res = await fetch(`${API_BASE}/process/start-trip`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Failed to start legacy trip");
  return res.json();
}
