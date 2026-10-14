"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export async function updateProfile(formData) {
  const session = await getSession();
  // ログインしていなければ編集できない
  if (!session.user) {
    redirect("/login");
  }

  const displayName = formData.get("displayName")?.toString().trim() || "";
  const bio = formData.get("bio")?.toString().trim() || "";

  if (!displayName) {
    throw new Error("表示名は必須です。");
  }
  if (displayName.length > 30) {
    throw new Error("表示名は30文字以内にしてください。");
  }
  if (bio.length > 300) {
    throw new Error("自己紹介は300文字以内にしてください。");
  }

  // 自分自身(セッションのid)のデータだけを更新する。
  // フォームから送られたidは使わない(他人のプロフィールを書き換えられないように)
  await prisma.user.update({
    where: { id: session.user.id },
    data: { displayName, bio: bio || null },
  });

  // ヘッダーに表示される名前も更新
  session.user = { ...session.user, displayName };
  await session.save();

  revalidatePath("/", "layout");
  redirect(`/users/${session.user.username}`);
}
