import Link from "next/link";

// カテゴリを表示するバッジ。タグ(TagBadge)とは色を変えて区別する。
// クリックするとそのカテゴリの一覧ページに飛ぶ。
export default function CategoryBadge({ category }) {
  return (
    <Link
      href={`/categories/${category}`}
      className="inline-block bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full hover:bg-blue-100 transition-colors"
    >
      {category}
    </Link>
  );
}
