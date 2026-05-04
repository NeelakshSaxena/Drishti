import { API_CONFIG } from "./constants";

export const BACKEND_URL_STORAGE_KEY = "drishti.backendUrl";

function normalizeBackendUrl(value: string): string {
  return value.trim().replace(/\/+$/, "");
}

export function isValidBackendUrl(value: string): boolean {
  const trimmed = value.trim();

  if (!trimmed) {
    return false;
  }

  try {
    const parsedUrl = new URL(trimmed);
    return parsedUrl.protocol === "http:" || parsedUrl.protocol === "https:";
  } catch {
    return false;
  }
}

export function getDefaultBackendUrl(): string {
  return API_CONFIG.BASE_URL.replace(/\/+$/, "");
}

export function getStoredBackendUrl(): string {
  if (typeof window === "undefined") {
    return getDefaultBackendUrl();
  }

  try {
    const storedValue = window.localStorage.getItem(BACKEND_URL_STORAGE_KEY);
    if (storedValue && storedValue.trim()) {
      return normalizeBackendUrl(storedValue);
    }
  } catch {
    // Ignore storage failures and fall back to the default URL.
  }

  return getDefaultBackendUrl();
}

export function saveBackendUrl(value: string): string {
  const normalizedUrl = normalizeBackendUrl(value);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(BACKEND_URL_STORAGE_KEY, normalizedUrl);
  }

  return normalizedUrl;
}

export function resetBackendUrl(): string {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(BACKEND_URL_STORAGE_KEY);
  }

  return getDefaultBackendUrl();
}