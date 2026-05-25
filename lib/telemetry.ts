export const TELEMETRY_EVENT_TYPE = "page_view";

export type DeviceType = "Desktop" | "Mobile" | "Tablet" | "Unknown";

export type BrowserName = "Chrome" | "Safari" | "Firefox" | "Edge" | "Unknown";

export type OsName = "Windows" | "macOS" | "iOS" | "Android" | "Linux" | "Unknown";

export type TelemetryPayload = {
  eventType: typeof TELEMETRY_EVENT_TYPE;
  url: string;
  path: string;
  timestamp: string;
  visitorId: string;
  sessionId: string;
  title?: string;
  referrer?: string;
  userAgent?: string;
  deviceType?: DeviceType;
  browser?: BrowserName;
  os?: OsName;
};

type ValidationResult =
  | { ok: true; data: TelemetryPayload }
  | { ok: false; message: string };

const MAX_FIELD_LENGTH = 2048;
const DEVICE_TYPES = new Set<DeviceType>(["Desktop", "Mobile", "Tablet", "Unknown"]);
const BROWSERS = new Set<BrowserName>(["Chrome", "Safari", "Firefox", "Edge", "Unknown"]);
const OPERATING_SYSTEMS = new Set<OsName>([
  "Windows",
  "macOS",
  "iOS",
  "Android",
  "Linux",
  "Unknown"
]);

function sanitizeString(value: unknown, maxLength = MAX_FIELD_LENGTH) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, maxLength) : undefined;
}

function isValidTimestamp(value: string) {
  const date = new Date(value);
  return !Number.isNaN(date.getTime());
}

function isValidUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function normalizePath(value: string) {
  return value.startsWith("/") ? value : `/${value}`;
}

function readAllowedValue<T extends string>(value: unknown, allowedValues: Set<T>) {
  const sanitized = sanitizeString(value, 32);
  if (!sanitized || !allowedValues.has(sanitized as T)) {
    return undefined;
  }

  return sanitized as T;
}

function parseDeviceType(userAgent: string): DeviceType {
  const ua = userAgent.toLowerCase();

  if (/ipad|tablet/.test(ua)) {
    return "Tablet";
  }

  if (/mobi|iphone|android/.test(ua)) {
    return "Mobile";
  }

  if (ua) {
    return "Desktop";
  }

  return "Unknown";
}

function parseBrowser(userAgent: string): BrowserName {
  const ua = userAgent.toLowerCase();

  if (ua.includes("edg/")) {
    return "Edge";
  }

  if (ua.includes("firefox/")) {
    return "Firefox";
  }

  if (ua.includes("chrome/") && !ua.includes("edg/")) {
    return "Chrome";
  }

  if (ua.includes("safari/") && !ua.includes("chrome/")) {
    return "Safari";
  }

  return "Unknown";
}

function parseOs(userAgent: string): OsName {
  const ua = userAgent.toLowerCase();

  if (ua.includes("windows")) {
    return "Windows";
  }

  if (ua.includes("iphone") || ua.includes("ipad")) {
    return "iOS";
  }

  if (ua.includes("mac os x") || ua.includes("macintosh")) {
    return "macOS";
  }

  if (ua.includes("android")) {
    return "Android";
  }

  if (ua.includes("linux")) {
    return "Linux";
  }

  return "Unknown";
}

export function enrichUserAgent(userAgent?: string) {
  const safeUserAgent = sanitizeString(userAgent, 512);

  if (!safeUserAgent) {
    return {
      userAgent: undefined,
      deviceType: "Unknown" as const,
      browser: "Unknown" as const,
      os: "Unknown" as const
    };
  }

  return {
    userAgent: safeUserAgent,
    deviceType: parseDeviceType(safeUserAgent),
    browser: parseBrowser(safeUserAgent),
    os: parseOs(safeUserAgent)
  };
}

export function validateTelemetryPayload(input: unknown): ValidationResult {
  if (!input || typeof input !== "object") {
    return { ok: false, message: "Invalid payload." };
  }

  const source = input as Record<string, unknown>;
  const eventType = sanitizeString(source.eventType, 64);
  const url = sanitizeString(source.url);
  const path = sanitizeString(source.path, 512);
  const timestamp = sanitizeString(source.timestamp, 64);
  const visitorId = sanitizeString(source.visitorId, 128);
  const sessionId = sanitizeString(source.sessionId, 128);

  if (eventType !== TELEMETRY_EVENT_TYPE) {
    return { ok: false, message: "Unsupported event type." };
  }

  if (!url || !path || !timestamp || !visitorId || !sessionId) {
    return { ok: false, message: "Missing required telemetry fields." };
  }

  if (!isValidUrl(url)) {
    return { ok: false, message: "Invalid URL." };
  }

  if (!isValidTimestamp(timestamp)) {
    return { ok: false, message: "Invalid timestamp." };
  }

  const userAgentDetails = enrichUserAgent(sanitizeString(source.userAgent, 512));

  return {
    ok: true,
    data: {
      eventType,
      url,
      path: normalizePath(path),
      timestamp,
      visitorId,
      sessionId,
      title: sanitizeString(source.title, 256),
      referrer: sanitizeString(source.referrer, 512),
      userAgent: userAgentDetails.userAgent,
      deviceType: readAllowedValue(source.deviceType, DEVICE_TYPES) ?? userAgentDetails.deviceType,
      browser: readAllowedValue(source.browser, BROWSERS) ?? userAgentDetails.browser,
      os: readAllowedValue(source.os, OPERATING_SYSTEMS) ?? userAgentDetails.os
    }
  };
}
