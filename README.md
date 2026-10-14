# My Blog

Next.js (App Router) で作った、学習用のブログアプリです。
Markdownで記事を管理するシンプルな構成から始めて、タグ・カテゴリ・投稿フォーム・ログイン・プロフィールまで段階的に機能を追加しています。

> ⚠️ 学習用に作成したものです。実際に運用するサービスではありません。

## 主な機能

- 記事の一覧・詳細表示（Markdownファイルを読み込んで表示）
- タグ・カテゴリでの絞り込み（タグは1記事5個まで）
- 投稿フォーム（Server Actionsでファイルを自動生成、URLも自動発行）
- ログイン / ログアウト（パスワードはハッシュ化して保存）
- プロフィールページ・プロフィール編集
- ログインしている人だけが投稿可能

### 今後追加予定

コメント / いいね / あしあと / 公開範囲の設定（親しい人のみ）/ フォロー機能

## 使用技術

| 分類 | 技術 |
|---|---|
| フレームワーク | Next.js 16 (App Router) / React 19 |
| スタイリング | Tailwind CSS v4 |
| データベース | SQLite + Prisma 6 |
| 認証 | iron-session + bcryptjs |
| 記事の管理 | Markdown (gray-matter / remark) |

## 工夫した点・学んだこと

- 動的ルーティング（`[slug]` / `[tag]` / `[category]` / `[username]`）の使い分け
- 日本語のタグやカテゴリがURLエンコードされる問題への対応（`decodeURIComponent`）
- 他人のプロフィールを書き換えられないよう、更新対象はフォームの値ではなくログイン中のユーザーIDで決定
- タグ上限などの入力チェックをサーバー側で実装

## 起動方法

```bash
# 1. パッケージのインストール
npm install

# 2. 環境変数ファイルを作成
cp .env.example .env
#   → .env の SESSION_SECRET を32文字以上のランダムな文字列に書き換える
#     (例: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

# 3. データベースの作成とテストユーザーの登録
npx prisma migrate dev --name init

# 4. 開発サーバーの起動
npm run dev
```

http://localhost:3000 を開いてください。

### テスト用アカウント（ダミー）

| ユーザー名 | パスワード |
|---|---|
| you | password123 |
| friend1 | friend123 |
| friend2 | friend123 |

※ 学習用のダミーアカウントです。
