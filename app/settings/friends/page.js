import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { toggleCloseFriend } from "./actions";

export const metadata = { title: "親しい人リスト | My Blog" };

export default async function FriendsSettingsPage() {
  const me = await getCurrentUser();
  if (!me) {
    redirect("/login");
  }

  const users = await prisma.user.findMany({
    where: { id: { not: me.id } },
    orderBy: { createdAt: "asc" },
  });
  const myFriends = await prisma.closeFriend.findMany({ where: { ownerId: me.id } });
  const friendIds = new Set(myFriends.map((f) => f.friendId));

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">親しい人リスト</h1>
      <p className="text-sm text-gray-500 mb-6">
        ここに入れた人だけが、公開範囲を「👥 親しい人のみ」にした記事を読めます。
        相手には通知されません。
      </p>

      <ul className="flex flex-col gap-3">
        {users.length === 0 && <p className="text-sm text-gray-500">ほかのユーザーがいません。</p>}
        {users.map((u) => {
          const isFriend = friendIds.has(u.id);
          return (
            <li
              key={u.id}
              className="rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between"
            >
              <Link href={`/users/${u.username}`} className="text-sm hover:underline">
                <span className="font-medium">{u.displayName}</span>
                <span className="ml-2 text-xs text-gray-400">@{u.username}</span>
              </Link>
              <form action={toggleCloseFriend}>
                <input type="hidden" name="friendId" value={u.id} />
                <button
                  type="submit"
                  className={
                    "text-sm px-3 py-1.5 rounded-md border transition-colors " +
                    (isFriend
                      ? "bg-gray-900 text-white border-gray-900 hover:bg-gray-700"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50")
                  }
                >
                  {isFriend ? "親しい人 ✓（解除する）" : "親しい人に追加"}
                </button>
              </form>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
