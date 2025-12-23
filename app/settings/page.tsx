import {
  getBodyParts,
  getExercisesWithBodyParts,
  getMenusWithExercises,
  getWeightRecords,
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

/**
 * 体重記録を取得（新しい順）
 */
async function getWeightRecordsByUser(userId: number) {
  return getWeightRecords(userId);
}

export default async function SettingsPage() {
  const userId = 1;
  const [exercises, menus, weightRecords, bodyParts] = await Promise.all([
    getExercises(userId),
    getMenus(userId),
    getWeightRecordsByUser(userId),
    getBodyParts(),
  ]);

  return (
    <SettingsClient
      initialExercises={exercises}
      initialMenus={menus}
      initialWeightRecords={weightRecords}
      initialBodyParts={bodyParts}
    />
  );
}
