import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">404</p>
        <h1>Post not found.</h1>
        <p className="lede">
          The page you requested does not exist in this demo blog.
        </p>
        <div className="hero-actions">
          <Link className="button primary" href="/">
            Return home
          </Link>
        </div>
      </section>
    </main>
  );
}
