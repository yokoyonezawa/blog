"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { getPostData } from "@/lib/posts";
import { getViewerContext, canViewPost } from "@/lib/visibility";

const MAX_COMMENT_LENGTH = 500;

// コメントを投稿する
export async function addComment(formData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const postSlug = formData.get("postSlug")?.toString() || "";
  const body = formData.get("body")?.toString().trim() || "";

  if (!body) {
    throw new Error("コメントを入力してください。");
  }
  if (body.length > MAX_COMMENT_LENGTH) {
    throw new Error(`コメントは${MAX_COMMENT_LENGTH}文字以内にしてください。`);
  }

  // 存在しない記事にはコメントできないようにする
  const post = await getPostData(postSlug);
  if (!post) {
    throw new Error("記事が見つかりません。");
  }

  // 公開範囲の外にいる人は、コメント・いいねもできない
  if (!canViewPost(post, await getViewerContext())) {
    throw new Error("この記事にはアクセスできません。");
  }

  await prisma.comment.create({
    // 書いた人はフォームの値ではなく、ログイン中のユーザーから決める
    data: { postSlug, body, authorId: user.id },
  });

  revalidatePath(`/posts/${postSlug}`);
}

// コメントを削除する(コメントを書いた本人 or 記事を書いた人だけ)
export async function deleteComment(formData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const commentId = Number(formData.get("commentId"));
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { author: true },
  });
  if (!comment) {
    return;
  }

  const post = await getPostData(comment.postSlug);
  const postAuthor = post?.author || "you";

  const isCommentOwner = comment.authorId === user.id;
  const isPostOwner = postAuthor === user.username;
  if (!isCommentOwner && !isPostOwner) {
    throw new Error("このコメントを削除する権限がありません。");
  }

  await prisma.comment.delete({ where: { id: commentId } });
  revalidatePath(`/posts/${comment.postSlug}`);
}
