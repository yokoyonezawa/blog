"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

// ログイン処理:
// 入力されたusername/passwordが正しいか確認し、正しければセッションに保存する
export async function login(formData) {
  const username = formData.get("username")?.toString().trim();
  const password = formData.get("password")?.toString() || "";

  if (!username || !password) {
    throw new Error("ユーザー名とパスワードを入力してください。");
  }

  // データベースから該当ユーザーを探す
  const user = await prisma.user.findUnique({ where: { username } });

  // ユーザーが存在しない場合と、パスワードが間違っている場合は
  // どちらも同じエラーメッセージにする(「どっちが間違ってるか」を教えると
  // 悪意のある人にヒントを与えてしまうため)
  if (!user) {
    throw new Error("ユーザー名またはパスワードが違います。");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new Error("ユーザー名またはパスワードが違います。");
  }

  // セッション(暗号化クッキー)にログイン情報を保存する
  const session = await getSession();
  session.user = {
    id: user.id,
    username: user.username,
    displayName: user.displayName,
  };
  await session.save();

  redirect("/");
}

// ログアウト処理:セッションを破棄する
export async function logout() {
  const session = await getSession();
  session.destroy();
  redirect("/");
}
