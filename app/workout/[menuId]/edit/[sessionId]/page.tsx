import { notFound } from "next/navigation";
import {
  getMenuWithExercises,
  getWorkoutRecordWithDetails,
} from "@/lib/db/queries";
import { WorkoutEditClient } from "./_components/workout-edit-client";

/**
 * Server Component: トレーニング編集（再開）画面
 * 既存記録を初期値として読み込み、編集可能にする
 */
export default async function WorkoutEditPage({
  params,
}: {
  params: Promise<{ menuId: string; sessionId: string }>;
}) {
  const userId = 1; // TODO: 認証実装後に動的取得
  const { menuId, sessionId } = await params;
  const menuIdNum = Number.parseInt(menuId, 10);
  const recordIdNum = Number.parseInt(sessionId, 10);

  if (Number.isNaN(menuIdNum) || Number.isNaN(recordIdNum)) {
    notFound();
  }

  const [menu, workoutRecord] = await Promise.all([
    getMenuWithExercises(userId, menuIdNum),
    getWorkoutRecordWithDetails(userId, recordIdNum),
  ]);

  if (!menu || !workoutRecord) {
    notFound();
  }

  // 記録のメニューIDが一致するか確認
  if (workoutRecord.menuId !== menuIdNum) {
    notFound();
  }

  return <WorkoutEditClient menu={menu} workoutRecord={workoutRecord} />;
}
