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


