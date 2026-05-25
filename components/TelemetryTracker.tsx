"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { TELEMETRY_EVENT_TYPE } from "@/lib/telemetry";

const VISITOR_ID_KEY = "telemetry_visitor_id";
const SESSION_ID_KEY = "telemetry_session_id";

function generateId(prefix: string) {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${prefix}_${crypto.randomUUID()}`;
  }

  return `${prefix}_${Math.random().toString(36).slice(2, 12)}`;
}

function getOrCreateStorageValue(storage: Storage, key: string, prefix: string) {
  const existing = storage.getItem(key);
  if (existing) {
    return existing;
  }

  const created = generateId(prefix);
  storage.setItem(key, created);
  return created;
}

function sendTelemetry(payload: Record<string, string>) {
  const body = JSON.stringify(payload);

  try {
    if (navigator.sendBeacon) {
      const blob = new Blob([body], { type: "application/json" });
      const queued = navigator.sendBeacon("/api/telemetry", blob);
      if (queued) {
        return;
      }
    }

    void fetch("/api/telemetry", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body,
      keepalive: true
    }).catch(() => undefined);
  } catch {
    // Telemetry must never affect the page experience.
  }
}

export function TelemetryTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) {
      return;
    }

    try {
      const visitorId = getOrCreateStorageValue(localStorage, VISITOR_ID_KEY, "anon");
      const sessionId = getOrCreateStorageValue(sessionStorage, SESSION_ID_KEY, "sess");
      const payload = {
        eventType: TELEMETRY_EVENT_TYPE,
        url: window.location.href,
        path: window.location.pathname,
        title: document.title,
        referrer: document.referrer,
        visitorId,
        sessionId,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
      };

      sendTelemetry(payload);
    } catch {
      // Telemetry failures stay silent by design.
    }
  }, [pathname]);

  return null;
}
