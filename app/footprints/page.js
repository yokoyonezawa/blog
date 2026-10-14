import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export const metadata = { title: "あしあと | My Blog" };

function formatDate(date) {
  return date.toLocaleString("ja-JP", {
    timeZone: "Asia/Tokyo",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function FootprintsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // 自分宛てのあしあとだけを、新しい順に取得する
  const footprints = await prisma.footprint.findMany({
    where: { ownerId: user.id },
    include: { visitor: true },
    orderBy: { visitedAt: "desc" },
    take: 50,
  });

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">あしあと</h1>
      <p className="text-sm text-gray-500 mb-6">
        ログイン中のユーザーがあなたのプロフィールや記事を見ると、ここに記録されます。
        （ゲストの閲覧は記録されません）
      </p>

      {footprints.length === 0 && (
        <p className="text-sm text-gray-500">まだあしあとはありません。</p>
      )}

      <ul className="flex flex-col gap-3">
        {footprints.map((fp) => (
          <li
            key={fp.id}
            className="rounded-lg border border-gray-200 bg-white p-4 flex items-center justify-between gap-4"
          >
            <div className="text-sm">
              <Link href={`/users/${fp.visitor.username}`} className="font-medium text-gray-900 hover:underline">
                {fp.visitor.displayName}
              </Link>
              <span className="text-gray-500"> さんが </span>
              <Link href={fp.targetPath} className="text-gray-900 hover:underline">
                {fp.targetLabel}
              </Link>
              <span className="text-gray-500"> を見ました</span>
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">{formatDate(fp.visitedAt)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
