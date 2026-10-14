"use server";

import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getPostData } from "@/lib/posts";
import { getViewerContext, canViewPost } from "@/lib/visibility";

const ANON_COOKIE = "anon-id";
const UUID_PATTERN = /^[0-9a-f-]{36}$/;

// いいねのオン/オフを切り替える(押すたびに、いいね ⇄ 取り消し)
// ログインしていなくても使える
export async function toggleLike(formData) {
  const postSlug = formData.get("postSlug")?.toString() || "";

  // 存在しない記事にはいいねできないようにする
  const post = await getPostData(postSlug);
  if (!post) {
    throw new Error("記事が見つかりません。");
  }

  // 公開範囲の外にいる人は、コメント・いいねもできない
  if (!canViewPost(post, await getViewerContext())) {
    throw new Error("この記事にはアクセスできません。");
  }

  // 「誰がいいねしたか」の識別方法を決める
  const user = await getCurrentUser();
  let who;

  if (user) {
    who = { userId: user.id };
  } else {
    // 未ログインの場合は、ブラウザに持たせたランダムIDで識別する
    const cookieStore = await cookies();
    let anonId = cookieStore.get(ANON_COOKIE)?.value;

    // まだIDが無い、または形式がおかしい場合は新しく発行する
    if (!anonId || !UUID_PATTERN.test(anonId)) {
      anonId = randomUUID();
      cookieStore.set(ANON_COOKIE, anonId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365, // 1年間
        path: "/",
      });
    }
    who = { anonId };
  }

  // すでにいいねしていれば取り消す
  const deleted = await prisma.like.deleteMany({ where: { postSlug, ...who } });

  // 取り消すものが無かった = まだいいねしてなかったので、新しく追加する
  if (deleted.count === 0) {
    try {
      await prisma.like.create({ data: { postSlug, ...who } });
    } catch (e) {
      // 連打などで同時に2件登録されそうになった場合(unique制約エラー: P2002)は無視する
      if (e.code !== "P2002") throw e;
    }
  }

  revalidatePath(`/posts/${postSlug}`);
}
