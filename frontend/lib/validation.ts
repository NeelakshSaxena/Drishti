import { FORM_CONSTRAINTS, ERROR_MESSAGES } from "./constants";

/**
 * Validates child name
 * @param name - Child name to validate
 * @throws Error with descriptive message if validation fails
 */
export function validateChildName(name: string): void {
  if (!name || !name.trim()) {
    throw new Error(ERROR_MESSAGES.CHILD_NAME_REQUIRED);
  }

  if (name.length > FORM_CONSTRAINTS.CHILD_NAME_MAX_LENGTH) {
    throw new Error(ERROR_MESSAGES.CHILD_NAME_TOO_LONG);
  }
}

/**
 * Validates location coordinates
 * @param lat - Latitude
 * @param lng - Longitude
 * @throws Error with descriptive message if validation fails
 */
export function validateCoordinates(lat: number, lng: number): void {
  if (typeof lat !== "number" || typeof lng !== "number") {
    throw new Error(ERROR_MESSAGES.INVALID_COORDINATES);
  }

  if (lat < FORM_CONSTRAINTS.LOCATION_LAT_MIN || lat > FORM_CONSTRAINTS.LOCATION_LAT_MAX) {
    throw new Error(
      `Latitude must be between ${FORM_CONSTRAINTS.LOCATION_LAT_MIN} and ${FORM_CONSTRAINTS.LOCATION_LAT_MAX}`
    );
  }

  if (lng < FORM_CONSTRAINTS.LOCATION_LNG_MIN || lng > FORM_CONSTRAINTS.LOCATION_LNG_MAX) {
    throw new Error(
      `Longitude must be between ${FORM_CONSTRAINTS.LOCATION_LNG_MIN} and ${FORM_CONSTRAINTS.LOCATION_LNG_MAX}`
    );
  }
}

/**
 * Validates event data
 * @param from - From location
 * @param to - To location
 * @param type - Event type
 * @throws Error with descriptive message if validation fails
 */
export function validateEvent(from: string, to: string, type: string): void {
  if (!from?.trim() || !to?.trim()) {
    throw new Error(ERROR_MESSAGES.EVENT_DETAILS_INCOMPLETE);
  }

  if (!FORM_CONSTRAINTS.EVENT_TYPE_OPTIONS.includes(type)) {
    throw new Error(
      `Event type must be one of: ${FORM_CONSTRAINTS.EVENT_TYPE_OPTIONS.join(", ")}`
    );
  }
}

/**
 * Formats error message for display to user
 * @param error - Error object or message
 * @returns Formatted error message
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return ERROR_MESSAGES.SERVER_ERROR;
}

/**
 * Sanitizes user input to prevent XSS
 * @param input - Input string to sanitize
 * @returns Sanitized string
 */
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, "") // Remove angle brackets
    .slice(0, 255); // Limit length
}

/**
 * Validates email format
 * @param email - Email to validate
 * @returns True if valid email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates URL format
 * @param url - URL to validate
 * @returns True if valid URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
