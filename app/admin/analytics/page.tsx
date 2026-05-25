import Link from "next/link";
import { getAnalyticsSummary } from "@/lib/analytics";
import {
  DATE_RANGE_OPTIONS,
  formatDayLabel,
  normalizeDateRange
} from "@/lib/date-range";

function MetricCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="metric-card">
      <p>{label}</p>
      <strong>{value}</strong>
    </div>
  );
}

function EmptyTable({
  title,
  description
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
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

  return (
    <main className="shell admin-shell">
      <section className="admin-header">
        <div>
          <p className="eyebrow">Private Admin</p>
          <h1>Analytics dashboard</h1>
          <p className="lede">
            Lightweight blog telemetry with anonymous visitor identifiers and no third-party
            analytics provider.
          </p>
        </div>
        <Link className="text-link" href="/">
          Back to blog
        </Link>
      </section>

      <section className="filters">
        {DATE_RANGE_OPTIONS.map((option) => {
          const isActive = option.key === selectedRange;
          return (
            <Link
              key={option.key}
              className={`filter-pill${isActive ? " active" : ""}`}
              href={`/admin/analytics?range=${option.key}`}
            >
              {option.label}
            </Link>
          );
        })}
      </section>

      <section className="metrics-grid">
        <MetricCard label="Total Views" value={analytics.totalViews} />
        <MetricCard label="Unique Visitors" value={analytics.uniqueVisitors} />
        <MetricCard label="Top Referrer" value={analytics.topReferrer} />
        <MetricCard label="Most Viewed Page" value={analytics.mostViewedPage} />
      </section>

      <section className="dashboard-grid">
        <div className="panel">
          <div className="panel-heading">
            <h2>Views over time</h2>
            <p>Daily page-view counts for the selected range.</p>
          </div>
          {analytics.dailyViews.length === 0 ? (
            <EmptyTable
              title="No views yet"
              description="Visit a post to create the first telemetry event."
            />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Day</th>
                  <th>Views</th>
                </tr>
              </thead>
              <tbody>
                {analytics.dailyViews.map((row) => (
                  <tr key={row.day}>
                    <td>{formatDayLabel(row.day)}</td>
                    <td>{row.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>Device breakdown</h2>
            <p>Basic device classification from the user agent string.</p>
          </div>
          {analytics.deviceBreakdown.length === 0 ? (
            <EmptyTable
              title="No device data"
              description="Device counts appear after telemetry events are stored."
            />
          ) : (
            <ul className="breakdown-list">
              {analytics.deviceBreakdown.map((row) => (
                <li key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.count}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>Top pages</h2>
            <p>Most-viewed posts with anonymous unique visitor counts.</p>
          </div>
          {analytics.topPages.length === 0 ? (
            <EmptyTable
              title="No pages tracked"
              description="Tracked posts will appear here once page views are recorded."
            />
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Page Title</th>
                  <th>Path</th>
                  <th>Views</th>
                  <th>Unique Visitors</th>
                </tr>
              </thead>
              <tbody>
                {analytics.topPages.map((page) => (
                  <tr key={page.path}>
                    <td>{page.title}</td>
                    <td>{page.path}</td>
                    <td>{page.views}</td>
                    <td>{page.uniqueVisitors}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>Top referrers</h2>
            <p>Empty or missing referrers are grouped as Direct / Unknown.</p>
          </div>
          {analytics.topReferrers.length === 0 ? (
            <EmptyTable
              title="No referrer data"
              description="Referrer traffic sources will appear after incoming visits."
            />
          ) : (
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
                    <td>{row.referrer}</td>
                    <td>{row.views}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>Browser breakdown</h2>
            <p>Coarse browser detection for lightweight reporting.</p>
          </div>
          {analytics.browserBreakdown.length === 0 ? (
            <EmptyTable
              title="No browser data"
              description="Browser counts appear after telemetry events are stored."
            />
          ) : (
            <ul className="breakdown-list">
              {analytics.browserBreakdown.map((row) => (
                <li key={row.label}>
                  <span>{row.label}</span>
                  <strong>{row.count}</strong>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </main>
  );
}
