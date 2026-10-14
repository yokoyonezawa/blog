// 記事の「公開範囲」を判定するための共通ファイル。
//
//   public  : 誰でも見れる(visibilityが書かれていない記事もこれ)
//   members : ログインしている人だけ見れる
//   friends : 書いた人の「親しい人リスト」に入っている人だけ見れる
// どの場合も、書いた本人は自分の記事を見れる。

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const VISIBILITY_VALUES = ["public", "members", "friends"];

export const VISIBILITY_LABELS = {
  public: "🌐 全体公開",
  members: "🔒 ログイン限定",
  friends: "👥 親しい人のみ",
};

// 今アクセスしている人の情報(ログイン中のユーザーと、その人を親しい人に入れている書き手の一覧)
export async function getViewerContext() {
  const viewer = await getCurrentUser();
  const friendOwners = new Set(); // 自分を「親しい人」に入れてくれている人のusername

  if (viewer) {
    const rows = await prisma.closeFriend.findMany({
      where: { friendId: viewer.id },
      include: { owner: { select: { username: true } } },
    });
    rows.forEach((row) => friendOwners.add(row.owner.username));
  }

  return { viewer, friendOwners };
}

// この記事を、今の閲覧者が見てよいか
export function canViewPost(post, { viewer, friendOwners }) {
  const visibility = post.visibility || "public";
  const author = post.author || "you";

  if (visibility === "public") return true;
  if (!viewer) return false; // members / friends はログイン必須
  if (viewer.username === author) return true; // 書いた本人は常にOK
  if (visibility === "members") return true;
  if (visibility === "friends") return friendOwners.has(author);
  return false; // 想定外の値は見せない
}

// 記事の配列から、見てよいものだけを残す(一覧ページ用)
export async function filterVisiblePosts(posts) {
  const ctx = await getViewerContext();
  return posts.filter((post) => canViewPost(post, ctx));
}
