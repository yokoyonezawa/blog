import { getAllPostSlugs, getPostData } from "@/lib/posts";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import TagBadge from "@/components/TagBadge";
import CategoryBadge from "@/components/CategoryBadge";
import Comments from "@/components/Comments";
import Likes from "@/components/Likes";
import FootprintRecorder from "@/components/FootprintRecorder";
import { getViewerContext, canViewPost, VISIBILITY_LABELS } from "@/lib/visibility";
import { getCurrentUser } from "@/lib/session";

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

  // 見れない人には、記事のタイトルをブラウザのタブ名にも出さない
  const ctx = await getViewerContext();
  if (!canViewPost(postData, ctx)) {
    return { title: "閲覧が制限されている記事 | My Blog" };
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

  // 公開範囲のチェック:見てはいけない人には中身を一切出さない
  const ctx = await getViewerContext();
  if (!canViewPost(postData, ctx)) {
    // ログイン限定の記事を未ログインの人が開いた場合だけ、ログインを案内する
    if (postData.visibility === "members" && !ctx.viewer) {
      return (
        <div className="mx-auto max-w-xl px-4 py-20 text-center">
          <p className="text-lg font-semibold mb-2">🔒 ログインすると読めます</p>
          <p className="text-sm text-gray-500 mb-6">この記事はログインしている人だけに公開されています。</p>
          <Link
            href="/login"
            className="inline-block bg-gray-900 text-white text-sm px-5 py-2.5 rounded-md hover:bg-gray-700"
          >
            ログインする
          </Link>
        </div>
      );
    }
    // 「親しい人のみ」の記事は、存在していること自体を隠すため404にする
    notFound();
  }

  // 書いた人の情報をデータベースから取得(authorが無い古い記事は "you")
  const author = await prisma.user.findUnique({
    where: { username: postData.author || "you" },
  });

  const viewer = await getCurrentUser();

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      {/* ログイン中の人が見たら、書いた人にあしあとを残す */}
      {viewer && <FootprintRecorder kind="post" keyValue={slug} />}

      <Link href="/" className="text-sm text-gray-500 hover:text-gray-800">
        ← 記事一覧に戻る
      </Link>

      <div className="flex items-center gap-3 mt-4 mb-2">
        <p className="text-sm text-gray-400">{postData.date}</p>
        {postData.category && <CategoryBadge category={postData.category} />}
        {postData.visibility && postData.visibility !== "public" && (
          <span className="text-xs text-gray-500">{VISIBILITY_LABELS[postData.visibility]}</span>
        )}
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

      <Likes slug={slug} />

      <Comments slug={slug} postAuthor={postData.author || "you"} />
    </article>
  );
}
