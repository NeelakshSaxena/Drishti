/**
 * Application-wide constants and configuration
 */

// API Configuration
const LOCAL_API_BASE_URL = "http://127.0.0.1:8000";
const PRODUCTION_API_BASE_URL = "https://drishti-walb.onrender.com";

export const API_CONFIG = {
  BASE_URL:
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    (process.env.NODE_ENV === "production"
      ? PRODUCTION_API_BASE_URL
      : LOCAL_API_BASE_URL),
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY: 1000, // ms
} as const;

// UI Configuration
export const UI_CONFIG = {
  AUTO_REFRESH_INTERVAL: 15000, // ms (15 seconds)
  TOAST_DURATION: 3000, // ms
  LOADING_TIMEOUT: 30000, // ms
} as const;

// Form Constraints
export const FORM_CONSTRAINTS = {
  CHILD_NAME_MIN_LENGTH: 1,
  CHILD_NAME_MAX_LENGTH: 50,
  EVENT_TYPE_OPTIONS: ["flight", "train", "bus", "car", "hostel", "hotel"],
  LOCATION_LAT_MIN: -90,
  LOCATION_LAT_MAX: 90,
  LOCATION_LNG_MIN: -180,
  LOCATION_LNG_MAX: 180,
} as const;

// API Endpoints
export const ENDPOINTS = {
  HEALTH: "/health",
  CHILDREN: "/parent/children",
  CREATE_CHILD: "/parent/create-child",
  GET_CHILD: "/parent/child",
  START_TRIP: "/child/:childId/trip/start",
  END_TRIP: "/child/:childId/trip/end",
  ADD_EVENT: "/trip/:tripId/event/add",
  NEXT_EVENT: "/trip/:tripId/event/next",
  UPDATE_LOCATION: "/child/:childId/location/update",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: "Network error. Please check your connection.",
  SERVER_ERROR: "Server error. Please try again later.",
  INVALID_INPUT: "Invalid input. Please check your entries.",
  NOT_FOUND: "Not found. Please try again.",
  TIMEOUT: "Request timeout. Please try again.",
  CHILD_NAME_REQUIRED: "Child name is required",
  CHILD_NAME_TOO_LONG: `Child name must be ${FORM_CONSTRAINTS.CHILD_NAME_MAX_LENGTH} characters or less`,
  INVALID_COORDINATES: "Invalid coordinates. Latitude must be -90 to 90, Longitude must be -180 to 180",
  NO_ACTIVE_TRIP: "No active trip for this child",
  CHILD_ALREADY_ON_TRIP: "Child is already on a trip",
  TRIP_NOT_FOUND: "Trip not found",
  EVENT_DETAILS_INCOMPLETE: "Please fill in all required event fields (from, to, type)",
} as const;

// Success Messages
export const SUCCESS_MESSAGES = {
  CHILD_CREATED: "Child created successfully",
  TRIP_STARTED: "Trip started successfully",
  TRIP_ENDED: "Trip ended successfully",
  EVENT_ADDED: "Event added successfully",
  EVENT_ADVANCED: "Event advanced successfully",
  LOCATION_UPDATED: "Location updated successfully",
} as const;

// Default Values
export const DEFAULTS = {
  DEFAULT_LATITUDE: 28.6139, // New Delhi
  DEFAULT_LONGITUDE: 77.209,
  DEFAULT_EVENT_TYPE: "flight",
  DEFAULT_EVENT_TICKET_URL: "N/A",
} as const;

// Status Values
export const STATUS = {
  TRIP_ACTIVE: "active",
  TRIP_ENDED: "ended",
  EVENT_UPCOMING: "upcoming",
  EVENT_CURRENT: "current",
  EVENT_COMPLETED: "completed",
  HEALTH_OK: "ok",
  HEALTH_DEGRADED: "degraded",
  HEALTH_ERROR: "error",
} as const;

// CSS Classes
export const CSS_CLASSES = {
  // Buttons
  BUTTON_PRIMARY: "inline-flex items-center gap-2 px-4 h-10 rounded-md bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-medium transition",
  BUTTON_SECONDARY: "inline-flex items-center gap-2 px-4 h-10 rounded-md bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-slate-50 text-sm font-medium transition",
  BUTTON_DANGER: "inline-flex items-center gap-2 px-4 h-10 rounded-md bg-red-600 hover:bg-red-700 disabled:bg-slate-300 dark:disabled:bg-slate-700 text-white text-sm font-medium transition",
  
  // Input
  INPUT_FIELD: "h-10 rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 px-3 text-sm placeholder-slate-500 dark:placeholder-slate-400 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 dark:focus:ring-emerald-900",
  
  // Container
  CARD: "rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm",
} as const;
