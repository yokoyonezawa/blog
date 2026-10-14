import Link from "next/link";
import TagBadge from "./TagBadge";
import CategoryBadge from "./CategoryBadge";
import { VISIBILITY_LABELS } from "@/lib/visibility";

export default function PostCard({ slug, title, date, excerpt, tags, category, visibility }) {
  return (
    <div className="rounded-lg border border-gray-200 p-5 hover:shadow-md transition-shadow bg-white">
      <div className="flex items-center justify-between mb-1">
        <p className="text-xs text-gray-400">{date}</p>
        <div className="flex items-center gap-2">
          {visibility && visibility !== "public" && (
            <span className="text-xs text-gray-500">{VISIBILITY_LABELS[visibility]}</span>
          )}
          {category && <CategoryBadge category={category} />}
        </div>
      </div>

      <Link href={`/posts/${slug}`} className="block">
        <h2 className="text-lg font-semibold text-gray-900 mb-2 hover:text-gray-600">
          {title}
        </h2>
      </Link>

      <p className="text-sm text-gray-600 mb-3">{excerpt}</p>

      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge key={tag} tag={tag} />
          ))}
        </div>
      )}
    </div>
  );
}
