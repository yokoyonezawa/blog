"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

// 「親しい人リスト」への追加/解除を切り替える
export async function toggleCloseFriend(formData) {
  const me = await getCurrentUser();
  if (!me) {
    redirect("/login");
  }

  const friendId = Number(formData.get("friendId"));
  if (!Number.isInteger(friendId) || friendId === me.id) {
    throw new Error("追加できないユーザーです。");
  }

  const target = await prisma.user.findUnique({ where: { id: friendId } });
  if (!target) {
    throw new Error("ユーザーが見つかりません。");
  }

  // 追加するのは必ず「ログイン中の自分」のリスト(ownerIdはセッションから決める)
  const deleted = await prisma.closeFriend.deleteMany({
    where: { ownerId: me.id, friendId },
  });
  if (deleted.count === 0) {
    await prisma.closeFriend.create({ data: { ownerId: me.id, friendId } });
  }

  revalidatePath("/settings/friends");
  revalidatePath("/", "layout");
}
