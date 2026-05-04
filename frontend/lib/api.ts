import { API_CONFIG, ENDPOINTS, ERROR_MESSAGES, SUCCESS_MESSAGES } from "./constants";

const API_BASE_URL = API_CONFIG.BASE_URL.replace(/\/$/, "");

/**
 * Parses error response and returns appropriate message
 */
function parseErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === "string") {
    return error;
  }
  return ERROR_MESSAGES.SERVER_ERROR;
}

/**
 * Fetches with automatic retry logic for failed requests
 * @param url - API endpoint URL
 * @param options - Fetch options
 * @param attempts - Number of retry attempts remaining
 * @throws Error with descriptive message
 */
async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  attempts: number = API_CONFIG.RETRY_ATTEMPTS,
): Promise<Response> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (!response.ok) {
      let message: string;
      try {
        const data = await response.json();
        message = data.detail || `Request failed with status ${response.status}`;
      } catch {
        message = `Request failed with status ${response.status}`;
      }
      throw new Error(message);
    }

    return response;
  } catch (error) {
    if (attempts > 1) {
      await new Promise((resolve) => setTimeout(resolve, API_CONFIG.RETRY_DELAY));
      return fetchWithRetry(url, options, attempts - 1);
    }
    throw error;
  }
}

// ===== Health Check =====

export type HealthCheckResponse = {
  status: "ok" | "degraded" | "error";
  backend: string;
  services: {
    api: boolean;
    memory_store: boolean;
  };
  errors: string[];
};

/**
 * Checks backend health status with retry logic
 * @returns Health status or degraded if unreachable
 */
export async function healthCheck(): Promise<HealthCheckResponse> {
  try {
    const response = await fetchWithRetry(`${API_BASE_URL}${ENDPOINTS.HEALTH}`, {
      method: "GET",
    });
    return response.json();
  } catch {
    return {
      status: "error",
      backend: "unreachable",
      services: { api: false, memory_store: false },
      errors: [ERROR_MESSAGES.NETWORK_ERROR],
    };
  }
}

// ===== Child Management =====

export type Child = {
  id: string;
  name: string;
  active_trip_id: string | null;
  created_at: string;
};

export type CreateChildRequest = {
  name: string;
};

/**
 * Creates a new child
 * @param name - Child's name
 * @throws Error if name is empty or request fails
 * @returns Created child object
 */
export async function createChild(name: string): Promise<Child> {
  if (!name || !name.trim()) {
    throw new Error(ERROR_MESSAGES.CHILD_NAME_REQUIRED);
  }

  if (name.length > 50) {
    throw new Error(ERROR_MESSAGES.CHILD_NAME_TOO_LONG);
  }

  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}${ENDPOINTS.CREATE_CHILD}`,
      {
        method: "POST",
        body: JSON.stringify({ name: name.trim() }),
      },
    );
    return response.json();
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
}

/**
 * Fetches all children
 * @throws Error if request fails
 * @returns Array of children
 */
export async function getChildren(): Promise<Child[]> {
  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}${ENDPOINTS.CHILDREN}`,
      { method: "GET" },
    );
    return response.json();
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
}

/**
 * Fetches specific child details
 * @param childId - Child ID
 * @throws Error if not found or request fails
 * @returns Child object
 */
export async function getChildDetails(childId: string): Promise<Child> {
  if (!childId) {
    throw new Error("Child ID is required");
  }

  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}${ENDPOINTS.GET_CHILD}/${childId}`,
      { method: "GET" },
    );
    return response.json();
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
}

// ===== Event Management =====

export type Event = {
  id?: string;
  type: string;
  from: string;
  to: string;
  time?: string;
  ticket_url?: string;
  status: "upcoming" | "current" | "completed";
};

export type EventRequest = {
  type: string;
  from: string;
  to: string;
  time?: string;
  ticket_url?: string;
};

/**
 * Validates event data
 * @throws Error if validation fails
 */
function validateEvent(event: EventRequest): void {
  if (!event.from?.trim() || !event.to?.trim()) {
    throw new Error(ERROR_MESSAGES.EVENT_DETAILS_INCOMPLETE);
  }
}

// ===== Trip Management =====

export type Trip = {
  id: string;
  child_id: string;
  status: "active" | "ended";
  current_event_index: number;
  events: Event[];
  created_at: string;
  updated_at: string;
};

export type StartTripRequest = {
  events?: EventRequest[];
};

/**
 * Starts a new trip for a child
 * @param childId - Child ID
 * @param request - Optional trip with initial events
 * @throws Error if child not found or already on trip
 * @returns Created trip object
 */
export async function startTrip(
  childId: string,
  request?: StartTripRequest,
): Promise<Trip> {
  if (!childId) {
    throw new Error("Child ID is required");
  }

  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/child/${childId}/trip/start`,
      {
        method: "POST",
        body: JSON.stringify(request || {}),
      },
    );
    const data = await response.json();
    return data.trip;
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
}

/**
 * Ends active trip for a child
 * @param childId - Child ID
 * @throws Error if no active trip or request fails
 * @returns Ended trip object
 */
export async function endTrip(childId: string): Promise<Trip> {
  if (!childId) {
    throw new Error("Child ID is required");
  }

  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/child/${childId}/trip/end`,
      { method: "POST" },
    );
    const data = await response.json();
    return data.trip;
  } catch (error) {
    throw new Error(parseErrorMessage(error));
  }
}

/**
 * Adds an event to a trip
 * @param tripId - Trip ID
 * @param event - Event details
 * @throws Error if validation fails or request fails
 * @returns Created event object
 */
export async function addEvent(tripId: string, event: EventRequest): Promise<Event> {
  if (!tripId) {
    throw new Error("Trip ID is required");
  }

  validateEvent(event);

  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/trip/${tripId}/event/add`,
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
      `${API_BASE_URL}/trip/${tripId}/event/next`,
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
      `${API_BASE_URL}/child/${childId}/location/update`,
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
    `${API_BASE_URL}/process/start-trip`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
  );

  return response.json();
}

export const startTrip_Legacy = startTripLegacy;
