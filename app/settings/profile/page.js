import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { updateProfile } from "./actions";

export const metadata = { title: "プロフィール編集 | My Blog" };

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300";

export default async function EditProfilePage() {
  const sessionUser = await getCurrentUser();
  if (!sessionUser) {
    redirect("/login");
  }

  // 最新の情報はデータベースから取る
  const user = await prisma.user.findUnique({ where: { id: sessionUser.id } });

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">プロフィール編集</h1>

      <form action={updateProfile} className="flex flex-col gap-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            表示名 <span className="ml-2 text-xs font-normal text-gray-400">30文字まで</span>
          </label>
          <input
            type="text"
            name="displayName"
            required
            maxLength={30}
            defaultValue={user.displayName}
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            自己紹介 <span className="ml-2 text-xs font-normal text-gray-400">300文字まで</span>
          </label>
          <textarea
            name="bio"
            rows={6}
            maxLength={300}
            defaultValue={user.bio || ""}
            className={inputClass}
          />
        </div>

        <button
          type="submit"
          className="self-start bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-gray-700 transition-colors"
        >
          保存する
        </button>
      </form>
    </div>
  );
}
