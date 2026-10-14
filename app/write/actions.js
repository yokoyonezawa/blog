"use server";
// このファイルの中身は「サーバー側だけ」で実行される(ブラウザには一切送られない)。
// フォームが送信されると、ここに書いた関数がそのまま呼び出される(Server Actions)。

import fs from "fs";
import path from "path";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { MAX_TAGS } from "@/lib/posts";
import { getCurrentUser } from "@/lib/session";

const postsDirectory = path.join(process.cwd(), "posts");

// 投稿日時をもとに、他と被らないslug(URLの一部)を自動生成する。
// 例: post-20260930-132200-x7k2
function generateSlug() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 6); // ランダムな英数字4文字
  return `post-${y}${m}${d}-${hh}${mm}${ss}-${random}`;
}

export async function createPost(formData) {
  // ログインしていない人は投稿できない
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // フォームの各入力欄の値を取り出す
  const title = formData.get("title")?.toString().trim();
  const excerpt = formData.get("excerpt")?.toString().trim() || "";
  const category = formData.get("category")?.toString().trim() || "";
  const tagsRaw = formData.get("tags")?.toString().trim() || "";
  const content = formData.get("content")?.toString() || "";

  // --- バリデーション(入力チェック) ---

  if (!title || !content) {
    throw new Error("タイトルと本文は必須です。");
  }

  // カンマ区切りのタグ文字列を配列に変換(空白除去・空要素は除外)
  const tags = tagsRaw
    ? tagsRaw.split(",").map((t) => t.trim()).filter(Boolean)
    : [];

  if (tags.length > MAX_TAGS) {
    throw new Error(
      `タグは${MAX_TAGS}個までです(今は${tags.length}個入力されています)。`
    );
  }

  // slugを自動生成(念のため、万が一同じslugが存在したら作り直す)
  let slug = generateSlug();
  let fullPath = path.join(postsDirectory, `${slug}.md`);
  while (fs.existsSync(fullPath)) {
    slug = generateSlug();
    fullPath = path.join(postsDirectory, `${slug}.md`);
  }

  // --- Markdownファイルの中身を組み立てる ---

  const date = new Date().toISOString().split("T")[0]; // "2026-09-30" のような形式

  const escape = (str) => str.replace(/"/g, '\\"'); // フロントマターの " が壊れないようエスケープ

  const frontmatterLines = [
    "---",
    `title: "${escape(title)}"`,
    `date: "${date}"`,
    `author: "${user.username}"`, // 誰が書いたかを記録する
    `excerpt: "${escape(excerpt)}"`,
  ];

  if (tags.length > 0) {
    frontmatterLines.push(`tags: [${tags.map((t) => `"${escape(t)}"`).join(", ")}]`);
  }
  if (category) {
    frontmatterLines.push(`category: "${escape(category)}"`);
  }

  frontmatterLines.push("---", "", content, "");

  const fileContent = frontmatterLines.join("\n");

  // --- ファイルとして書き込む ---
  fs.writeFileSync(fullPath, fileContent, "utf8");

  // トップページのキャッシュを更新して、新しい記事がすぐ一覧に出るようにする
  revalidatePath("/");

  // 投稿後、その記事の詳細ページに移動する
  redirect(`/posts/${slug}`);
}
