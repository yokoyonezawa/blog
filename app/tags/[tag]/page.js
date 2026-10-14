import { getAllTags, getPostsByTag } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import { notFound } from "next/navigation";
import { filterVisiblePosts } from "@/lib/visibility";

// posts/[slug]/page.js と同じ考え方:
// 「どのタグのページを事前に作っておくか」をNext.jsに教える
export async function generateStaticParams() {
  const tags = getAllTags(); // ["Next.js", "個人開発", "Markdown", "設計"]
  return tags.map((tag) => ({ tag }));
}

export async function generateMetadata({ params }) {
  const { tag } = await params;
  // URLの日本語タグは自動でエンコードされているので、元の文字に戻す
  const decodedTag = decodeURIComponent(tag);
  return {
    title: `#${decodedTag} の記事一覧 | My Blog`,
  };
}

export default async function TagPage({ params }) {
  const { tag } = await params;
  // URLの日本語タグは自動でエンコードされているので、元の文字に戻す
  const decodedTag = decodeURIComponent(tag);
  const posts = await filterVisiblePosts(getPostsByTag(decodedTag));

  // そのタグを持つ記事が1つも無ければ404にする
  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">
        ← 記事一覧に戻る
      </Link>

      <h1 className="text-2xl font-bold mt-4 mb-6">#{decodedTag} の記事一覧</h1>

      <div className="flex flex-col gap-4">
        {posts.map(({ slug, title, date, excerpt, tags, category, visibility }) => (
          <PostCard
            key={slug}
            slug={slug}
            title={title}
            date={date}
            excerpt={excerpt}
            tags={tags}
            category={category}
            visibility={visibility}
          />
        ))}
      </div>
    </div>
  );
}
