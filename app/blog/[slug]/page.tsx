import { notFound } from "next/navigation";
import { PrivacyNote } from "@/components/PrivacyNote";
import { getPostBySlug } from "@/lib/sample-posts";

export default async function BlogPostPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <main className="shell">
      <article className="post">
        <p className="eyebrow">Blog</p>
        <h1>{post.title}</h1>
        <p className="lede">{post.excerpt}</p>
        <div className="post-body">
          {post.body.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
        <PrivacyNote />
      </article>
    </main>
  );
}
