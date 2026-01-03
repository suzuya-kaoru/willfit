import { notFound } from "next/navigation";
import {
  getTemplateWithExercises,
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
  const { menuId: templateIdStr, sessionId } = await params;
  const templateIdNum = Number.parseInt(templateIdStr, 10);
  const recordIdNum = Number.parseInt(sessionId, 10);

  if (Number.isNaN(templateIdNum) || Number.isNaN(recordIdNum)) {
    notFound();
  }

  const [template, workoutRecord] = await Promise.all([
    getTemplateWithExercises(userId, templateIdNum),
    getWorkoutRecordWithDetails(userId, recordIdNum),
  ]);

  if (!template || !workoutRecord) {
    notFound();
  }

  // 記録のテンプレートIDが一致するか確認
  if (workoutRecord.templateId !== templateIdNum) {
    notFound();
  }

  return (
    <WorkoutEditClient template={template} workoutRecord={workoutRecord} />
  );
}
