import {
  getBodyParts,
  getExercisesWithBodyParts,
  getMenusWithExercises,
} from "@/lib/db/queries";
import { SettingsClient } from "./_components/settings-client";

/**
 * ============================================================================
 * Server Component: データ取得（サーバー側で実行）
 * ============================================================================
 *
 * DBアクセス層から必要なデータを取得してクライアントへ渡す。
 */

/**
 * 全種目を取得
 */
async function getExercises(userId: number) {
  return getExercisesWithBodyParts(userId);
}

/**
 * 全メニューを取得
 */
async function getMenus(userId: number) {
  return getMenusWithExercises(userId);
}

export default async function SettingsPage() {
  const userId = 1;
  const [exercises, menus, bodyParts] = await Promise.all([
    getExercises(userId),
    getMenus(userId),
    getBodyParts(),
  ]);

  return (
    <SettingsClient
      initialExercises={exercises}
      initialMenus={menus}
      initialBodyParts={bodyParts}
    />
  );
}
