import {
  getAllExercisesWithBodyParts,
  getAllMenusWithExercises,
  mockWeightRecords,
} from "@/lib/mock-data";
import { SettingsClient } from "./_components/settings-client";

/**
 * ============================================================================
 * Server Component: データ取得（サーバー側で実行）
 * ============================================================================
 *
 * 将来的に DB に切り替える際は、以下の関数を DB アクセス層に置き換える：
 * - getAllExercisesWithBodyParts() → DB クエリ
 * - getAllMenusWithExercises() → DB クエリ
 * - getWeightRecords() → DB クエリ
 */

/**
 * 全種目を取得
 * TODO: DB移行時は、この関数を DB アクセス層に置き換える
 */
function getExercises() {
  return getAllExercisesWithBodyParts();
}

/**
 * 全メニューを取得
 * TODO: DB移行時は、この関数を DB アクセス層に置き換える
 */
function getMenus() {
  return getAllMenusWithExercises();
}

/**
 * 体重記録を取得（新しい順）
 * TODO: DB移行時は、この関数を DB アクセス層に置き換える
 */
function getWeightRecords() {
  return [...mockWeightRecords].sort(
    (a, b) => b.recordedAt.getTime() - a.recordedAt.getTime(),
  );
}

export default function SettingsPage() {
  const exercises = getExercises();
  const menus = getMenus();
  const weightRecords = getWeightRecords();

  return (
    <SettingsClient
      initialExercises={exercises}
      initialMenus={menus}
      initialWeightRecords={weightRecords}
    />
  );
}
