export type DateRangeKey = "today" | "7d" | "30d" | "all";

export const DATE_RANGE_OPTIONS: Array<{ key: DateRangeKey; label: string }> = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "all", label: "All Time" }
];

export function normalizeDateRange(value?: string): DateRangeKey {
  if (value === "today" || value === "7d" || value === "30d" || value === "all") {
    return value;
  }

  return "7d";
}

export function getDateRangeStart(range: DateRangeKey): Date | null {
  const now = new Date();

  if (range === "all") {
    return null;
  }

  if (range === "today") {
    return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  }

  const days = range === "7d" ? 6 : 29;
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  start.setDate(start.getDate() - days);
  return start;
}

export function formatDayLabel(value: string) {
  return new Date(`${value}T00:00:00.000Z`).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric"
  });
}
