---
title: "PrismaとSQLiteでデータベースを導入した"
date: "2026-10-05"
author: "you"
excerpt: "ユーザー管理のために、PrismaとSQLiteを使ってデータベースを導入した手順をまとめます。"
tags: ["Prisma", "SQLite", "データベース"]
category: "設計メモ"
---

ログイン機能のために、記事はMarkdownのまま、ユーザー情報だけデータベースで管理する構成にしました。

## 構成

- 記事: Markdownファイル
- ユーザー: SQLite（Prisma経由で操作）
- ログイン状態: 暗号化したクッキー（iron-session）

## 学んだこと

- パスワードは平文で保存せず、bcryptでハッシュ化する
- ライブラリのバージョンを揃えないとコマンドが動かないことがある
