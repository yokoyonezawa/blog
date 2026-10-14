// このファイルは「posts フォルダの中のMarkdownファイルを読み込む」専門の処理をまとめる場所。
// ブラウザではなく、サーバー側(Node.js)で動く前提のコード。

import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

// postsフォルダの場所を指定
const postsDirectory = path.join(process.cwd(), "posts");

// タグの上限個数(これを超えたら気づけるようにエラーにする)
export const MAX_TAGS = 5;

// タグの個数をチェックする関数。
// 超えていたら、どの記事が原因か分かるようにエラーメッセージを出して処理を止める。
// (静かに無視すると「公開してから気づく」事故につながるので、あえて止める)
function validateTagCount(tags, slug) {
  if (tags && tags.length > MAX_TAGS) {
    throw new Error(
      `記事「${slug}」のタグが${tags.length}個あります。タグは${MAX_TAGS}個までにしてください。`
    );
  }
}

// ① 記事一覧を取得する関数(トップページ用)
//   - フロントマター(title, date, excerptなど)だけを取得する
//   - 本文全体は使わないので軽い処理で済む
export function getSortedPostsData() {
  // postsフォルダの中にあるファイル名を全部取得 → ["first-post.md", "second-post.md"]
  const fileNames = fs.readdirSync(postsDirectory);

  const allPostsData = fileNames.map((fileName) => {
    // ファイル名から ".md" を除いたものをslug(記事のID)として使う
    const slug = fileName.replace(/\.md$/, "");

    // ファイルの中身を文字列として読み込む
    const fullPath = path.join(postsDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, "utf8");

    // gray-matterで「---」で囲まれたフロントマター部分を解析
    const matterResult = matter(fileContents);

    validateTagCount(matterResult.data.tags, slug);

    // slug + フロントマターの中身(title, date, excerpt, tags, category)をまとめて返す
    return {
      slug,
      ...matterResult.data,
    };
  });

  // dateが新しい順に並び替え
  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

// ② 全記事のslug一覧を取得する関数(動的ルーティング用)
//   例: [{ slug: "first-post" }, { slug: "second-post" }]
export function getAllPostSlugs() {
  const fileNames = fs.readdirSync(postsDirectory);
  return fileNames.map((fileName) => ({
    slug: fileName.replace(/\.md$/, ""),
  }));
}

// ③ 特定の記事の詳細データを取得する関数(詳細ページ用)
//   - 本文もMarkdown → HTMLに変換して返す
export async function getPostData(slug) {
  const fullPath = path.join(postsDirectory, `${slug}.md`);

  // ファイルが存在しない場合は null を返す(呼び出し側で404を出す判断に使う)
  if (!fs.existsSync(fullPath)) {
    return null;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");

  const matterResult = matter(fileContents);

  validateTagCount(matterResult.data.tags, slug);

  // Markdown本文をHTML文字列に変換(remarkを使用)
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    contentHtml,
    ...matterResult.data,
  };
}

// ④ 全記事から使われているタグを重複なしで集める関数(タグ一覧ページ用)
//   例: ["Next.js", "個人開発", "Markdown", "設計"]
export function getAllTags() {
  const allPosts = getSortedPostsData();

  // 各記事のtags配列をひとつの配列にまとめる(flatMap)
  // 記事にtagsが無い場合はエラーにならないよう [] を使う
  const allTags = allPosts.flatMap((post) => post.tags || []);

  // Setを使うと重複を自動で取り除ける
  return [...new Set(allTags)];
}

// ⑤ 特定のタグを持つ記事だけを絞り込む関数(タグ別一覧ページ用)
export function getPostsByTag(tag) {
  const allPosts = getSortedPostsData();
  return allPosts.filter((post) => post.tags && post.tags.includes(tag));
}

// ⑥ 全記事から使われているカテゴリを重複なしで集める関数(カテゴリ一覧ページ用)
//   タグと違い、1記事につきカテゴリは1つだけの前提
//   例: ["開発ログ", "設計メモ", "学習記録"]
export function getAllCategories() {
  const allPosts = getSortedPostsData();
  const allCategories = allPosts
    .map((post) => post.category)
    .filter(Boolean); // categoryが無い記事は除外

  return [...new Set(allCategories)];
}

// ⑦ 特定のカテゴリの記事だけを絞り込む関数(カテゴリ別一覧ページ用)
export function getPostsByCategory(category) {
  const allPosts = getSortedPostsData();
  return allPosts.filter((post) => post.category === category);
}

// ⑧ 特定のユーザー(author)が書いた記事だけを絞り込む関数(プロフィールページ用)
//   authorが書かれていない古い記事は "you" の記事として扱う
export function getPostsByAuthor(username) {
  const allPosts = getSortedPostsData();
  return allPosts.filter((post) => (post.author || "you") === username);
}
