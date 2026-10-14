import { getSortedPostsData } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export default function Home() {
  // サーバー側でMarkdownファイルを読み込んで、記事一覧データを取得
  const allPostsData = getSortedPostsData();

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">記事一覧</h1>

      <div className="flex flex-col gap-4">
        {allPostsData.map(({ slug, title, date, excerpt, tags, category }) => (
          <PostCard
            key={slug}
            slug={slug}
            title={title}
            date={date}
            excerpt={excerpt}
            tags={tags}
            category={category}
          />
        ))}
      </div>
    </div>
  );
}
