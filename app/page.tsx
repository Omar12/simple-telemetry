import Link from "next/link";
import { PrivacyNote } from "@/components/PrivacyNote";
import { samplePosts } from "@/lib/sample-posts";

export default function HomePage() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Simple Blog Telemetry Tracker</p>
        <h1>Privacy-conscious analytics for a small blog.</h1>
        <p className="lede">
          This demo app tracks anonymous page views and exposes a private admin dashboard
          with practical publishing metrics.
        </p>
        <div className="hero-actions">
          <Link className="button primary" href="/admin/analytics">
            Open analytics dashboard
          </Link>
        </div>
        <PrivacyNote />
      </section>

      <section className="section">
        <div className="section-heading">
          <h2>Sample posts</h2>
          <p>Visit these pages to generate telemetry events.</p>
        </div>
        <div className="post-grid">
          {samplePosts.map((post) => (
            <article key={post.slug} className="card">
              <p className="eyebrow">Blog Post</p>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <Link className="text-link" href={`/blog/${post.slug}`}>
                Read post
              </Link>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
