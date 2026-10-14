import Link from "next/link";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { toggleLike } from "@/app/posts/[slug]/like-actions";

// 記事の下に表示する「いいね」ボタンと、いいねした人の一覧
// ログインしていなくてもいいねできる
export default async function Likes({ slug }) {
  const user = await getCurrentUser();
  const cookieStore = await cookies();
  const anonId = cookieStore.get("anon-id")?.value;

  const likes = await prisma.like.findMany({
    where: { postSlug: slug },
    include: { user: true },
    orderBy: { createdAt: "asc" },
  });

  // 自分がいいね済みかどうか(ログイン中はuserId、未ログインはブラウザIDで判定)
  const likedByMe = user
    ? likes.some((like) => like.userId === user.id)
    : anonId
      ? likes.some((like) => like.anonId === anonId)
      : false;

  const memberLikes = likes.filter((like) => like.user); // 名前が分かる人
  const guestCount = likes.length - memberLikes.length; // ゲスト(未ログイン)の人数

  return (
    <section className="mt-10">
      <div className="flex items-center gap-3">
        <form action={toggleLike}>
          <input type="hidden" name="postSlug" value={slug} />
          <button
            type="submit"
            className={
              "text-sm px-4 py-2 rounded-full border transition-colors " +
              (likedByMe
                ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-700"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50")
            }
          >
            👍 {likedByMe ? "いいね済み" : "いいね"}
          </button>
        </form>
        <span className="text-sm text-gray-500">{likes.length}件</span>
      </div>

      {likes.length > 0 && (
        <p className="mt-3 text-sm text-gray-500">
          いいねした人：
          {memberLikes.map((like, i) => (
            <span key={like.id}>
              {i > 0 && "、"}
              <Link href={`/users/${like.user.username}`} className="text-gray-700 hover:underline">
                {like.user.displayName}
              </Link>
            </span>
          ))}
          {guestCount > 0 && (
            <span>
              {memberLikes.length > 0 && "、"}
              ゲスト {guestCount}人
            </span>
          )}
        </p>
      )}
    </section>
  );
}
