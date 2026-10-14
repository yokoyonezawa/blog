import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { logout } from "@/app/login/actions";

// ログイン状態を確認する必要があるので async component にする
export default async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto max-w-3xl px-4 py-5 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-gray-900">
          My Blog
        </Link>
        <nav className="flex items-center gap-4">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">
            記事一覧
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/write"
                className="text-sm bg-gray-900 text-white px-3 py-1.5 rounded-md hover:bg-gray-700"
              >
                投稿する
              </Link>
              <Link href="/footprints" className="text-sm text-gray-600 hover:text-gray-900">
                あしあと
              </Link>
              <Link
                href={`/users/${user.username}`}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                {user.displayName}さん
              </Link>
              <form action={logout}>
                <button
                  type="submit"
                  className="text-sm text-gray-500 hover:text-gray-800"
                >
                  ログアウト
                </button>
              </form>
            </div>
          ) : (
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
