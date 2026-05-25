export const samplePosts = [
  {
    slug: "privacy-friendly-analytics",
    title: "Building Privacy-Friendly Blog Analytics",
    excerpt: "What a lightweight telemetry layer should and should not collect.",
    body: [
      "A useful analytics MVP should answer basic publishing questions without drifting into surveillance.",
      "This demo tracks anonymous page views, referrers, and coarse device details only.",
      "No names, emails, account identities, or raw IP addresses are stored."
    ]
  },
  {
    slug: "writing-better-posts",
    title: "Writing Better Posts With Reader Signals",
    excerpt: "Use simple traffic patterns to learn which essays resonate over time.",
    body: [
      "Daily view trends can tell you when a post starts compounding or when distribution falls flat.",
      "Top pages and referrers are usually enough for an MVP dashboard.",
      "Anything more advanced can wait until the raw event model proves useful."
    ]
  },
  {
    slug: "simple-over-clever",
    title: "Simple Over Clever in V1 Products",
    excerpt: "MVP analytics should optimize for clarity, not infrastructure theater.",
    body: [
      "Raw event storage plus a few aggregation helpers is enough for several thousand rows.",
      "A dashboard should degrade gracefully when there is no data.",
      "Start with the smallest useful reporting surface and extend from there."
    ]
  }
] as const;

export function getPostBySlug(slug: string) {
  return samplePosts.find((post) => post.slug === slug) ?? null;
}
