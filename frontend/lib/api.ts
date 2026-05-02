const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"
).replace(/\/$/, "");

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

export async function startTrip(
  payload: StartTripPayload,
): Promise<StartTripResponse> {
  const response = await fetch(`${API_BASE_URL}/process/start-trip`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with status ${response.status}`);
  }

  return response.json();
}
