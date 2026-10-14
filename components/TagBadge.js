import Link from "next/link";

// タグを1つ表示する小さいバッジ。クリックするとそのタグの一覧ページに飛ぶ。
export default function TagBadge({ tag }) {
    return (
        <Link
            href={`/tags/${tag}`}
            className="inline-block bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full hover:bg-gray-200 transition-colors"
        >
            #{tag}
        </Link>
    );
}
