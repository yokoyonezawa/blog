import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { addComment, deleteComment } from "@/app/posts/[slug]/comment-actions";

function formatDate(date) {
  return date.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// 記事の下に表示するコメント欄(サーバーコンポーネント)
export default async function Comments({ slug, postAuthor }) {
  const user = await getCurrentUser();

  const comments = await prisma.comment.findMany({
    where: { postSlug: slug },
    include: { author: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <section className="mt-12 border-t border-gray-200 pt-8">
      <h2 className="text-lg font-semibold mb-4">コメント ({comments.length})</h2>

      <div className="flex flex-col gap-4 mb-8">
        {comments.length === 0 && (
          <p className="text-sm text-gray-500">まだコメントはありません。</p>
        )}

        {comments.map((comment) => {
          const canDelete =
            user && (user.id === comment.authorId || user.username === postAuthor);

          return (
            <div key={comment.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-sm">
                  <Link
                    href={`/users/${comment.author.username}`}
                    className="font-medium text-gray-900 hover:underline"
                  >
                    {comment.author.displayName}
                  </Link>
                  <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                </div>

                {canDelete && (
                  <form action={deleteComment}>
                    <input type="hidden" name="commentId" value={comment.id} />
                    <button type="submit" className="text-xs text-gray-400 hover:text-red-600">
                      削除
                    </button>
                  </form>
                )}
              </div>
              {/* Reactが自動でエスケープするので、HTMLを書かれても安全に表示される */}
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{comment.body}</p>
            </div>
          );
        })}
      </div>

      {user ? (
        <form action={addComment} className="flex flex-col gap-3">
          <input type="hidden" name="postSlug" value={slug} />
          <textarea
            name="body"
            required
            rows={4}
            maxLength={500}
            placeholder="コメントを書く(500文字まで)"
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <button
            type="submit"
            className="self-start bg-gray-900 text-white text-sm font-medium px-5 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            コメントする
          </button>
        </form>
      ) : (
        <p className="text-sm text-gray-500">
          <Link href="/login" className="underline hover:text-gray-800">
            ログイン
          </Link>
          してコメントする
        </p>
      )}
    </section>
  );
}
