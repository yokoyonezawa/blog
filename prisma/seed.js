// このスクリプトは「テスト用のユーザーを最初から何人か作っておく」ためのもの。
// `npx prisma db seed` で実行する。
//
// パスワードはコードに直接書いているが、これは学習用の割り切り。
// 実際に一般公開するサービスでは、ユーザー自身が決めたパスワードを
// 新規登録フォームで受け取り、その場でハッシュ化して保存する形にする。

const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const users = [
    { username: "you", password: "password123", displayName: "自分" },
    { username: "friend1", password: "friend123", displayName: "友達A" },
    { username: "friend2", password: "friend123", displayName: "友達B" },
  ];

  for (const u of users) {
    // パスワードを平文のまま保存せず、bcryptで不可逆な形式に変換してから保存する
    const passwordHash = await bcrypt.hash(u.password, 10);

    // 同じusernameがすでにあれば何もしない(何度実行しても増えないようにする)
    await prisma.user.upsert({
      where: { username: u.username },
      update: {},
      create: {
        username: u.username,
        passwordHash,
        displayName: u.displayName,
      },
    });
  }

  console.log("テストユーザーの作成が完了しました。");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
