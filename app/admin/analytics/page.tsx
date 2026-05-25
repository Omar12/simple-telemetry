import Link from "next/link";
import { getAnalyticsSummary } from "@/lib/analytics";
import {
  DATE_RANGE_OPTIONS,
  formatDayLabel,
  normalizeDateRange
} from "@/lib/date-range";

function MetricStat({
  label,
  value,
  detail
}: {
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <article className="summary-stat">
      <p className="summary-stat-label">{label}</p>
      <strong className="summary-stat-value">{value}</strong>
      <p className="summary-stat-detail">{detail}</p>
    </article>
  );
}

function EmptyPanel({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="empty-panel">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function SurfaceHeader({
  eyebrow,
  title,
  description
}: {
  eyebrow?: string;
  title: string;
  description: string;
}) {
  return (
    <header className="surface-header">
      {eyebrow ? <p className="surface-eyebrow">{eyebrow}</p> : null}
      <div className="surface-title-row">
        <h2>{title}</h2>
        <p>{description}</p>
      </div>
    </header>
  );
}

function TableWrap({ children }: { children: React.ReactNode }) {
  return <div className="table-wrap">{children}</div>;
}

function BreakdownList({
  rows,
  emptyTitle,
  emptyDescription
}: {
  rows: Array<{ label: string; count: number }>;
  emptyTitle: string;
  emptyDescription: string;
}) {
  const maxCount = Math.max(...rows.map((row) => row.count), 0);

  if (rows.length === 0) {
    return <EmptyPanel title={emptyTitle} description={emptyDescription} />;
  }

  return (
    <ul className="breakdown-rows">
      {rows.map((row) => {
        const width = maxCount > 0 ? `${(row.count / maxCount) * 100}%` : "0%";
        return (
          <li key={row.label} className="breakdown-row">
            <div className="breakdown-copy">
              <span>{row.label}</span>
              <strong>{row.count}</strong>
            </div>
            <div className="breakdown-bar-track" aria-hidden="true">
              <div className="breakdown-bar-fill" style={{ width }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

export default async function AnalyticsPage({
  searchParams
}: {
  searchParams: Promise<{ range?: string }>;
}) {
  const { range } = await searchParams;
  const selectedRange = normalizeDateRange(range);
  const analytics = await getAnalyticsSummary(selectedRange);
  const trendPeak = Math.max(...analytics.dailyViews.map((row) => row.views), 0);

  return (
    <main className="admin-dashboard">
      <section className="admin-topbar">
        <div className="admin-title-block">
          <p className="admin-kicker">Private analytics</p>
          <h1>Publishing performance</h1>
          <p className="admin-intro">
            Anonymous first-party telemetry for a quick read on what is being read,
            where traffic starts, and which posts are carrying attention.
          </p>
        </div>

        <div className="admin-toolbar">
          <nav className="admin-nav" aria-label="Admin navigation">
            <Link className="admin-nav-link active" href="/admin/analytics">
              Analytics dashboard
            </Link>
            <Link className="admin-nav-link" href="/admin/snippet">
              Install snippet
            </Link>
          </nav>

          <nav className="range-switcher" aria-label="Date range">
            {DATE_RANGE_OPTIONS.map((option) => {
              const isActive = option.key === selectedRange;
              return (
                <Link
                  key={option.key}
                  className={`range-option${isActive ? " active" : ""}`}
                  href={`/admin/analytics?range=${option.key}`}
                >
                  {option.label}
                </Link>
              );
            })}
          </nav>

          <div className="admin-toolbar-meta">
            <p className="toolbar-note">
              Privacy-first reporting. No raw IP addresses, no third-party analytics.
            </p>
            <Link className="admin-backlink" href="/">
              View sample blog
            </Link>
          </div>
        </div>
      </section>

      <section className="summary-strip" aria-label="Summary metrics">
        <MetricStat
          label="Total Views"
          value={analytics.totalViews}
          detail="All recorded page_view events in the selected range."
        />
        <MetricStat
          label="Unique Visitors"
          value={analytics.uniqueVisitors}
          detail="Anonymous visitor IDs counted once per range."
        />
        <MetricStat
          label="Top Referrer"
          value={analytics.topReferrer}
          detail="Empty sources stay grouped as Direct / Unknown."
        />
        <MetricStat
          label="Most Viewed Page"
          value={analytics.mostViewedPage}
          detail="The page currently carrying the most attention."
        />
      </section>

      <section className="analytics-composition">
        <div className="primary-column">
          <section className="dashboard-surface trend-surface">
            <SurfaceHeader
              eyebrow="Trend"
              title="Views over time"
              description="Daily movement first, so the page answers momentum before detail."
            />

            {analytics.dailyViews.length === 0 ? (
              <EmptyPanel
                title="No traffic yet"
                description="Open a sample post to create the first telemetry event and establish the baseline."
              />
            ) : (
              <div className="trend-list" role="list" aria-label="Daily view counts">
                {analytics.dailyViews.map((row) => {
                  const width = trendPeak > 0 ? `${(row.views / trendPeak) * 100}%` : "0%";

                  return (
                    <div key={row.day} className="trend-row" role="listitem">
                      <div className="trend-meta">
                        <span>{formatDayLabel(row.day)}</span>
                        <strong>{row.views}</strong>
                      </div>
                      <div className="trend-bar-track" aria-hidden="true">
                        <div className="trend-bar-fill" style={{ width }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section className="dashboard-surface data-surface">
            <SurfaceHeader
              eyebrow="Evidence"
              title="Top pages"
              description="The posts that are carrying traffic, with anonymous unique visitor counts."
            />

            {analytics.topPages.length === 0 ? (
              <EmptyPanel
                title="No pages tracked"
                description="Tracked posts will appear here once readers start generating page views."
              />
            ) : (
              <TableWrap>
                <table>
                  <thead>
                    <tr>
                      <th>Page</th>
                      <th>Path</th>
                      <th>Views</th>
                      <th>Unique Visitors</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topPages.map((page) => (
                      <tr key={page.path}>
                        <td className="table-title-cell">{page.title}</td>
                        <td className="table-mono">{page.path}</td>
                        <td>{page.views}</td>
                        <td>{page.uniqueVisitors}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </section>
        </div>

        <aside className="secondary-column">
          <section className="dashboard-surface secondary-surface">
            <SurfaceHeader
              eyebrow="Sources"
              title="Top referrers"
              description="Where incoming visits begin, with missing referrers kept readable."
            />

            {analytics.topReferrers.length === 0 ? (
              <EmptyPanel
                title="No referrer data"
                description="Referrer sources will show up after incoming visits start landing."
              />
            ) : (
              <TableWrap>
                <table>
                  <thead>
                    <tr>
                      <th>Referrer</th>
                      <th>Views</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.topReferrers.map((row) => (
                      <tr key={row.referrer}>
                        <td className="table-title-cell">{row.referrer}</td>
                        <td>{row.views}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableWrap>
            )}
          </section>

          <section className="dashboard-surface secondary-surface">
            <SurfaceHeader
              eyebrow="Audience"
              title="Device breakdown"
              description="Coarse classification derived from the reported user agent."
            />
            <BreakdownList
              rows={analytics.deviceBreakdown}
              emptyTitle="No device data"
              emptyDescription="Device distribution appears after telemetry events are stored."
            />
          </section>

          <section className="dashboard-surface secondary-surface">
            <SurfaceHeader
              eyebrow="Environment"
              title="Browser breakdown"
              description="A lightweight browser read, useful for broad compatibility signals."
            />
            <BreakdownList
              rows={analytics.browserBreakdown}
              emptyTitle="No browser data"
              emptyDescription="Browser counts will appear after page views have been recorded."
            />
          </section>
        </aside>
      </section>
    </main>
  );
}
