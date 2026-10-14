import { getAllPostSlugs, getPostData } from "@/lib/posts";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TagBadge from "@/components/TagBadge";
import CategoryBadge from "@/components/CategoryBadge";

// ビルド時に「どのslugのページを事前に作っておくか」をNext.jsに教える関数。
// ここに載っていないslugでも、アクセスされた時にその場でページを作りにいく
// (dynamicParamsをfalseにしていないため)。
export async function generateStaticParams() {
  const slugs = getAllPostSlugs(); // [{ slug: "first-post" }, { slug: "second-post" }]
  return slugs;
}

// ページごとのタイトルなどを動的に設定(SEO対策の基本)
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const postData = await getPostData(slug);

  if (!postData) {
    return { title: "記事が見つかりません | My Blog" };
  }

  return {
    title: `${postData.title} | My Blog`,
    description: postData.excerpt,
  };
}

export default async function Post({ params }) {
  const { slug } = await params;
  const postData = await getPostData(slug);

  // 該当するファイルが本当に存在しない場合だけ404にする
  if (!postData) {
    notFound();
  }

  // 書いた人の情報をデータベースから取得(authorが無い古い記事は "you")
  const author = await prisma.user.findUnique({
    where: { username: postData.author || "you" },
  });

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">
        ← 記事一覧に戻る
      </Link>

      <div className="flex items-center gap-3 mt-4 mb-2">
        <p className="text-sm text-gray-400">{postData.date}</p>
        {postData.category && <CategoryBadge category={postData.category} />}
      </div>

      <h1 className="text-2xl font-bold mb-3">{postData.title}</h1>

      {author && (
        <p className="text-sm text-gray-500 mb-3">
          by{" "}
          <Link href={`/users/${author.username}`} className="hover:underline">
            {author.displayName}
          </Link>
        </p>
      )}

      {postData.tags && postData.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {postData.tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}

      {/* Markdownから変換したHTMLをそのまま表示 */}
      <div
        className="prose prose-gray max-w-none"
        dangerouslySetInnerHTML={{ __html: postData.contentHtml }}
      />
    </article>
  );
}
