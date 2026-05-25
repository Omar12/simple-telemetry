import { prisma } from "@/lib/prisma";
import { DateRangeKey, getDateRangeStart } from "@/lib/date-range";

type AnalyticsEvent = {
  path: string;
  title: string | null;
  referrer: string | null;
  visitorId: string;
  deviceType: string | null;
  browser: string | null;
  occurredAt: Date;
};

type TopPage = {
  title: string;
  path: string;
  views: number;
  uniqueVisitors: number;
};

type ReferrerRow = {
  referrer: string;
  views: number;
};

type BreakdownRow = {
  label: string;
  count: number;
};

type DailyViewsRow = {
  day: string;
  views: number;
};

export type AnalyticsSummary = {
  totalViews: number;
  uniqueVisitors: number;
  topReferrer: string;
  mostViewedPage: string;
  topPages: TopPage[];
  topReferrers: ReferrerRow[];
  dailyViews: DailyViewsRow[];
  deviceBreakdown: BreakdownRow[];
  browserBreakdown: BreakdownRow[];
};

function normalizeReferrer(referrer: string | null) {
  return referrer?.trim() || "Direct / Unknown";
}

function normalizeLabel(value: string | null, fallback = "Unknown") {
  return value?.trim() || fallback;
}

function sortByCount<T extends { count?: number; views?: number }>(rows: T[]) {
  return rows.sort((a, b) => (b.count ?? b.views ?? 0) - (a.count ?? a.views ?? 0));
}

export async function getAnalyticsSummary(range: DateRangeKey): Promise<AnalyticsSummary> {
  const startDate = getDateRangeStart(range);

  const events: AnalyticsEvent[] = await prisma.telemetryEvent.findMany({
    where: startDate ? { occurredAt: { gte: startDate } } : undefined,
    select: {
      path: true,
      title: true,
      referrer: true,
      visitorId: true,
      deviceType: true,
      browser: true,
      occurredAt: true
    },
    orderBy: { occurredAt: "asc" }
  });

  const topPagesMap = new Map<string, TopPage & { visitors: Set<string> }>();
  const topReferrersMap = new Map<string, number>();
  const dailyViewsMap = new Map<string, number>();
  const deviceMap = new Map<string, number>();
  const browserMap = new Map<string, number>();
  const uniqueVisitors = new Set<string>();

  for (const event of events) {
    uniqueVisitors.add(event.visitorId);

    const pageKey = event.path;
    const existingPage = topPagesMap.get(pageKey) ?? {
      title: event.title?.trim() || event.path,
      path: event.path,
      views: 0,
      uniqueVisitors: 0,
      visitors: new Set<string>()
    };
    existingPage.views += 1;
    existingPage.visitors.add(event.visitorId);
    existingPage.uniqueVisitors = existingPage.visitors.size;
    if (!existingPage.title && event.title?.trim()) {
      existingPage.title = event.title.trim();
    }
    topPagesMap.set(pageKey, existingPage);

    const referrer = normalizeReferrer(event.referrer);
    topReferrersMap.set(referrer, (topReferrersMap.get(referrer) ?? 0) + 1);

    const day = event.occurredAt.toISOString().slice(0, 10);
    dailyViewsMap.set(day, (dailyViewsMap.get(day) ?? 0) + 1);

    const device = normalizeLabel(event.deviceType);
    deviceMap.set(device, (deviceMap.get(device) ?? 0) + 1);

    const browser = normalizeLabel(event.browser);
    browserMap.set(browser, (browserMap.get(browser) ?? 0) + 1);
  }

  const topPages = sortByCount(
    Array.from(topPagesMap.values()).map(({ visitors, ...page }) => page)
  ).slice(0, 10);

  const topReferrers = sortByCount(
    Array.from(topReferrersMap.entries()).map(([referrer, views]) => ({ referrer, views }))
  ).slice(0, 10);

  const dailyViews = Array.from(dailyViewsMap.entries()).map(([day, views]) => ({ day, views }));

  const deviceBreakdown = sortByCount(
    Array.from(deviceMap.entries()).map(([label, count]) => ({ label, count }))
  );

  const browserBreakdown = sortByCount(
    Array.from(browserMap.entries()).map(([label, count]) => ({ label, count }))
  );

  return {
    totalViews: events.length,
    uniqueVisitors: uniqueVisitors.size,
    topReferrer: topReferrers[0]?.referrer ?? "Direct / Unknown",
    mostViewedPage: topPages[0]?.title ?? "No data yet",
    topPages,
    topReferrers,
    dailyViews,
    deviceBreakdown,
    browserBreakdown
  };
}
