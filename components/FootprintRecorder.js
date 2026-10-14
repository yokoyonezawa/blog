"use client";
// このファイルは「クライアントコンポーネント」。ブラウザ側で動く部品。
// ページが表示されたタイミングで、あしあとを残す処理(Server Action)を1回呼ぶ。
// 画面には何も表示しない(return null)。

import { useEffect } from "react";
import { recordFootprint } from "@/app/footprints/actions";

export default function FootprintRecorder({ kind, keyValue }) {
  useEffect(() => {
    recordFootprint(kind, keyValue);
  }, [kind, keyValue]);

  return null;
}
