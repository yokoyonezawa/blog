"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getPostData } from "@/lib/posts";

// あしあとを残す。
// 「誰のページか」「何というタイトルか」は、ブラウザから送られた値を信用せず、
// サーバー側で種類(kind)とキー(key)から調べ直して決める。
export async function recordFootprint(kind, key) {
  const visitor = await getCurrentUser();
  if (!visitor) return; // ログインしていない人は誰か分からないので記録しない

  let ownerUsername;
  let targetLabel;
  let targetPath;

  if (kind === "profile") {
    ownerUsername = String(key);
    targetLabel = "プロフィール";
    targetPath = `/users/${ownerUsername}`;
  } else if (kind === "post") {
    const post = await getPostData(String(key));
    if (!post) return;
    ownerUsername = post.author || "you";
    targetLabel = post.title;
    targetPath = `/posts/${post.slug}`;
  } else {
    return;
  }

  const owner = await prisma.user.findUnique({ where: { username: ownerUsername } });
  if (!owner || owner.id === visitor.id) return; // 持ち主がいない、または自分自身なら記録しない

  // 1人につき1行。すでにあれば「何を」「いつ」だけ最新に更新する
  await prisma.footprint.upsert({
    where: { ownerId_visitorId: { ownerId: owner.id, visitorId: visitor.id } },
    update: { targetLabel, targetPath, visitedAt: new Date() },
    create: { ownerId: owner.id, visitorId: visitor.id, targetLabel, targetPath },
  });
}
