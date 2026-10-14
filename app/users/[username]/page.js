import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getPostsByAuthor } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export async function generateMetadata({ params }) {
  const { username } = await params;
  const user = await prisma.user.findUnique({ where: { username } });
  return { title: user ? `${user.displayName}さんのプロフィール | My Blog` : "ユーザーが見つかりません" };
}

export default async function ProfilePage({ params }) {
  const { username } = await params;

  // データベースからユーザー情報を取得(いなければ404)
  const profileUser = await prisma.user.findUnique({ where: { username } });
  if (!profileUser) {
    notFound();
  }

  const currentUser = await getCurrentUser();
  const isMe = currentUser?.username === profileUser.username;
  const posts = getPostsByAuthor(profileUser.username);

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <section className="rounded-lg border border-gray-200 bg-white p-6 mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{profileUser.displayName}</h1>
            <p className="text-sm text-gray-400">@{profileUser.username}</p>
          </div>
          {isMe && (
            <Link
              href="/settings/profile"
              className="text-sm border border-gray-300 px-3 py-1.5 rounded-md hover:bg-gray-50"
            >
              プロフィールを編集
            </Link>
          )}
        </div>

        <p className="mt-4 text-sm text-gray-700 whitespace-pre-wrap">
          {profileUser.bio || "自己紹介はまだありません。"}
        </p>

        <p className="mt-4 text-xs text-gray-400">記事 {posts.length}件</p>
      </section>

      <h2 className="text-lg font-semibold mb-4">{profileUser.displayName}さんの記事</h2>
      <div className="flex flex-col gap-4">
        {posts.length === 0 && (
          <p className="text-sm text-gray-500">まだ記事がありません。</p>
        )}
        {posts.map(({ slug, title, date, excerpt, tags, category }) => (
          <PostCard
            key={slug}
            slug={slug}
            title={title}
            date={date}
            excerpt={excerpt}
            tags={tags}
            category={category}
          />
        ))}
      </div>
    </div>
  );
}
