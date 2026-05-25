import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { validateTelemetryPayload } from "@/lib/telemetry";

export async function POST(request: NextRequest) {
  try {
    let body: unknown;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, error: "Malformed telemetry payload." },
        { status: 400 }
      );
    }

    const result = validateTelemetryPayload(body);

    if (!result.ok) {
      return NextResponse.json({ ok: false, error: result.message }, { status: 400 });
    }

    await prisma.telemetryEvent.create({
      data: {
        eventType: result.data.eventType,
        url: result.data.url,
        path: result.data.path,
        title: result.data.title,
        referrer: result.data.referrer,
        visitorId: result.data.visitorId,
        sessionId: result.data.sessionId,
        userAgent: result.data.userAgent,
        deviceType: result.data.deviceType,
        browser: result.data.browser,
        os: result.data.os,
        occurredAt: new Date(result.data.timestamp)
      }
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Telemetry ingestion failed.", error);
    return NextResponse.json(
      { ok: false, error: "Unable to process telemetry event." },
      { status: 500 }
    );
  }
}
