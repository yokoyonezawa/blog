import { redirect } from "next/navigation";
import { createPost } from "./actions";
import { getCurrentUser } from "@/lib/session";

export const metadata = {
  title: "新規投稿 | My Blog",
};

// フォーム部品を共通化するための小さいコンポーネント
function Field({ label, hint, children }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
        {hint && (
          <span className="ml-2 text-xs font-normal text-gray-400">{hint}</span>
        )}
      </label>
      {children}
    </div>
  );
}

const inputClass =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300";

export default async function WritePage() {
  // ログインしていなければログインページへ
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-2">新しい記事を書く</h1>
      <p className="text-sm text-gray-500 mb-6">
        送信すると <code>posts/</code> フォルダに新しいMarkdownファイルが作られます。URLは自動で発行されます。
      </p>

      {/* action={createPost} とするだけで、送信時にサーバー側の関数が呼ばれる */}
      <form action={createPost} className="flex flex-col gap-5">
        <Field label="タイトル">
          <input type="text" name="title" required className={inputClass} />
        </Field>

        <Field label="要約(excerpt)">
          <input type="text" name="excerpt" className={inputClass} />
        </Field>

        <Field label="カテゴリ" hint="1つだけ入力(任意)">
          <input type="text" name="category" className={inputClass} />
        </Field>

        <Field label="タグ" hint="カンマ区切りで最大5個(任意) 例: Next.js, 学習記録">
          <input type="text" name="tags" className={inputClass} />
        </Field>

        <Field label="公開範囲">
          <select name="visibility" defaultValue="public" className={inputClass}>
            <option value="public">🌐 全体公開（誰でも見れる）</option>
            <option value="members">🔒 ログイン限定（ログインしている人だけ）</option>
            <option value="friends">👥 親しい人のみ（親しい人リストの人だけ）</option>
          </select>
        </Field>

        <Field label="本文" hint="Markdown形式で書けます">
          <textarea
            name="content"
            required
            rows={12}
            className={`${inputClass} font-mono`}
          />
        </Field>

        <button
          type="submit"
          className="self-start bg-gray-900 text-white text-sm font-medium px-5 py-2.5 rounded-md hover:bg-gray-700 transition-colors"
        >
          投稿する
        </button>
      </form>
    </div>
  );
}
