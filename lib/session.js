// 「誰がログインしているか」を扱うためのファイル。
//
// ログイン中は、ユーザー情報を暗号化してクッキーに保存しておく(iron-session)。
// パスワードそのものではなく { id, username, displayName } だけを入れる。

import { cookies } from "next/headers";
import { getIronSession } from "iron-session";

export const sessionOptions = {
  // クッキーを暗号化するための秘密鍵(.envの値を使う。32文字以上必須)
  password: process.env.SESSION_SECRET,
  cookieName: "my-blog-session",
  cookieOptions: {
    // 本番環境(https)だけでクッキーを送るようにする設定。
    // ローカル開発(http)では自動でfalseになる。
    secure: process.env.NODE_ENV === "production",
  },
};

// 現在のセッション(クッキーの中身)を取得する
export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession(cookieStore, sessionOptions);
}

// ログイン中のユーザー情報を取得する(ログインしていなければ null)
export async function getCurrentUser() {
  const session = await getSession();
  return session.user || null;
}
