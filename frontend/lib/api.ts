/* Family tracking API client */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export interface Child {
  id: string;
  child_code: string;
  parent_id: string | null;
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
  started_at: string;
  ended_at: string | null;
}

export interface TripEvent {
  id: string;
  type: string; // flight, train, bus, hostel, custom
  from_location: string;
  to_location: string;
  time?: string;
  description: string;
  created_at: string;
}

// Child Endpoints
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

export async function startTrip(childId: string): Promise<{ success: boolean; trip: Trip }> {
  const res = await fetch(`${API_BASE}/family/child/trip/start?child_id=${childId}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to start trip");
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

export async function endTrip(childId: string): Promise<{ success: boolean }> {
  const res = await fetch(`${API_BASE}/family/child/trip/end?child_id=${childId}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to end trip");
  return res.json();
}

// Parent Endpoints
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

// Health Check
export async function healthCheck(): Promise<{ status: string; backend: string; services: Record<string, string> }> {
  try {
    const res = await fetch(`${API_BASE}/family/health`);
    if (!res.ok) throw new Error("Health check failed");
    return res.json();
  } catch (error) {
    return { status: "error", backend: "offline", services: { api: "down" } };
  }
}

 */
export async function addEvent(tripId: string, event: EventRequest): Promise<Event> {
  if (!tripId) {
    throw new Error("Trip ID is required");
  }

  validateEvent(event);

  try {
    const response = await fetchWithRetry(
      buildApiUrl(`/trip/${tripId}/event/add`),
      {
        method: "POST",
        body: JSON.stringify(event),
      },
    );
    const data = await response.json();
    return data.event;
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
}

/**
 * Advances to next event in a trip
 * @param tripId - Trip ID
 * @throws Error if trip not found or request fails
 * @returns Updated trip state
 */
export async function nextEvent(tripId: string): Promise<{
  current_event_index: number;
  current_event: Event | null;
  trip_status: "active" | "ended";
}> {
  if (!tripId) {
    throw new Error("Trip ID is required");
  }

  try {
    const response = await fetchWithRetry(
      buildApiUrl(`/trip/${tripId}/event/next`),
      { method: "POST" },
    );
    return response.json();
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
}

// ===== Location Management =====

export type LocationUpdate = {
  lat: number;
  lng: number;
};

export type LocationData = {
  child_id: string;
  lat: number;
  lng: number;
  updated_at: string;
};

/**
 * Validates location coordinates
 * @throws Error if validation fails
 */
function validateLocation(lat: number, lng: number): void {
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    throw new Error(ERROR_MESSAGES.INVALID_COORDINATES);
  }
}

/**
 * Updates child's location
 * @param childId - Child ID
 * @param lat - Latitude (-90 to 90)
 * @param lng - Longitude (-180 to 180)
 * @throws Error if validation fails or request fails
 * @returns Updated location
 */
export async function updateLocation(
  childId: string,
  lat: number,
  lng: number,
): Promise<LocationData> {
  if (!childId) {
    throw new Error("Child ID is required");
  }

  validateLocation(lat, lng);

  try {
    const response = await fetchWithRetry(
      buildApiUrl(`/child/${childId}/location/update`),
      {
        method: "POST",
        body: JSON.stringify({ lat, lng }),
      },
    );
    const data = await response.json();
    return data.location;
  } catch (error) {
    throw new Error(parseErrorMessage(error));
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

export async function startTripLegacy(
  payload: StartTripPayload,
): Promise<StartTripResponse> {
  const response = await fetchWithRetry(
    buildApiUrl(`/process/start-trip`),
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response.json();
}

export const startTrip_Legacy = startTripLegacy;
