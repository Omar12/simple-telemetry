import Link from "next/link";
import { headers } from "next/headers";

function getTelemetryEndpoint(headerList: Headers) {
  const forwardedHost = headerList.get("x-forwarded-host");
  const host = forwardedHost ?? headerList.get("host");

  if (!host) {
    return "https://your-domain.com/api/telemetry";
  }

  const forwardedProto = headerList.get("x-forwarded-proto");
  const protocol = forwardedProto ?? (host.includes("localhost") ? "http" : "https");

  return `${protocol}://${host}/api/telemetry`;
}

function getInstallSnippet(endpoint: string) {
  return `<script>
(function () {
  var VISITOR_ID_KEY = "telemetry_visitor_id";
  var SESSION_ID_KEY = "telemetry_session_id";
  var ENDPOINT = ${JSON.stringify(endpoint)};

  function createId(prefix) {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return prefix + "_" + window.crypto.randomUUID();
    }

    return prefix + "_" + Math.random().toString(36).slice(2, 12);
  }

  function getOrCreate(storage, key, prefix) {
    var existing = storage.getItem(key);
    if (existing) {
      return existing;
    }

    var created = createId(prefix);
    storage.setItem(key, created);
    return created;
  }

  function send(payload) {
    var body = JSON.stringify(payload);

    try {
      if (navigator.sendBeacon) {
        var queued = navigator.sendBeacon(
          ENDPOINT,
          new Blob([body], { type: "application/json" })
        );

        if (queued) {
          return;
        }
      }

      fetch(ENDPOINT, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: body,
        keepalive: true
      }).catch(function () {});
    } catch (error) {
      // Telemetry must never block page rendering.
    }
  }

  try {
    var visitorId = getOrCreate(window.localStorage, VISITOR_ID_KEY, "anon");
    var sessionId = getOrCreate(window.sessionStorage, SESSION_ID_KEY, "sess");

    send({
      eventType: "page_view",
      url: window.location.href,
      path: window.location.pathname,
      title: document.title,
      referrer: document.referrer,
      visitorId: visitorId,
      sessionId: sessionId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent
    });
  } catch (error) {
    // Telemetry failures stay silent by design.
  }
})();
</script>`;
}

export default async function SnippetPage() {
  const headerList = await headers();
  const telemetryEndpoint = getTelemetryEndpoint(headerList);
  const installSnippet = getInstallSnippet(telemetryEndpoint);

  return (
    <main className="admin-dashboard">
      <section className="admin-topbar">
        <div className="admin-title-block">
          <p className="admin-kicker">Tracking install</p>
          <h1>Paste this snippet into the site you want to measure</h1>
          <p className="admin-intro">
            This sends anonymous page view events to your telemetry API using the same
            payload shape as the built-in Next.js tracker.
          </p>
        </div>

        <div className="admin-toolbar">
          <nav className="admin-nav" aria-label="Admin navigation">
            <Link className="admin-nav-link" href="/admin/analytics">
              Analytics dashboard
            </Link>
            <Link className="admin-nav-link active" href="/admin/snippet">
              Install snippet
            </Link>
          </nav>

          <div className="admin-toolbar-meta">
            <p className="toolbar-note">
              Paste this right before the closing <code>{`</body>`}</code> tag.
            </p>
            <Link className="admin-backlink" href="/">
              View sample blog
            </Link>
          </div>
        </div>
      </section>

      <section className="analytics-composition">
        <div className="primary-column">
          <section className="dashboard-surface data-surface">
            <header className="surface-header">
              <p className="surface-eyebrow">Snippet</p>
              <div className="surface-title-row">
                <h2>Inline JavaScript</h2>
                <p>
                  The endpoint is already set to this deployment. If you embed this on a
                  different domain, keep the endpoint pointed at this admin app.
                </p>
              </div>
            </header>

            <div className="endpoint-banner">
              <span className="endpoint-label">Telemetry endpoint</span>
              <code>{telemetryEndpoint}</code>
            </div>

            <pre className="code-block">
              <code>{installSnippet}</code>
            </pre>
          </section>
        </div>

        <aside className="secondary-column">
          <section className="dashboard-surface secondary-surface">
            <header className="surface-header">
              <p className="surface-eyebrow">How to use it</p>
              <div className="surface-title-row">
                <h2>Installation steps</h2>
                <p>Keep it simple and match the current API validation rules.</p>
              </div>
            </header>

            <ol className="install-steps">
              <li>Paste the snippet before the closing <code>{`</body>`}</code> tag.</li>
              <li>Load a public page on the target site.</li>
              <li>Open the analytics dashboard and confirm the first page view lands.</li>
            </ol>
          </section>

          <section className="dashboard-surface secondary-surface">
            <header className="surface-header">
              <p className="surface-eyebrow">What it sends</p>
              <div className="surface-title-row">
                <h2>Payload overview</h2>
                <p>
                  Anonymous identifiers plus page metadata. No names, emails, or account
                  identifiers are included.
                </p>
              </div>
            </header>

            <ul className="payload-list">
              <li><code>eventType</code>: always <code>page_view</code></li>
              <li><code>url</code>, <code>path</code>, <code>title</code>, <code>referrer</code></li>
              <li><code>visitorId</code> from <code>localStorage</code></li>
              <li><code>sessionId</code> from <code>sessionStorage</code></li>
              <li><code>timestamp</code> and <code>userAgent</code></li>
            </ul>
          </section>
        </aside>
      </section>
    </main>
  );
}
