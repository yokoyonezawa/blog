// Prismaを使ってデータベースにアクセスするための入り口(PrismaClient)を、
// アプリ全体で1つだけ作って使い回すためのファイル。
//
// (開発中は npm run dev のホットリロードのたびに新しい接続が
//  どんどん増えてしまうのを防ぐため、globalに保存して使い回す)

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
