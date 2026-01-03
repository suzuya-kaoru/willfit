import { getWorkoutSessionWithDetails } from "@/lib/dal/schedule/workout-session";
import { getTemplateWithExercises } from "@/lib/dal/template";
import {
  getWorkoutRecordExercisesByRecordIds,
  getWorkoutRecordSetsByRecordExerciseIds,
  getWorkoutRecordsByTemplateIds,
} from "@/lib/dal/workout-record";
import { toDateKey } from "@/lib/date-key";
import type { WorkoutRecordExercise, WorkoutRecordSet } from "@/lib/types";
import { WorkoutClient } from "./_components/workout-client";

/**
 * ============================================================================
 * Server Component: データ取得と計算（サーバー側で実行）
 * ============================================================================
 *
 * DBアクセス層からメニュー・前回記録を取得し、前回記録の計算はサーバー側で行う。
 */

/**
 * 指定されたテンプレートIDの前回記録を取得
 */
async function getPreviousRecord(userId: number, templateId: number) {
  const records = await getWorkoutRecordsByTemplateIds(userId, [templateId]);
  return records[0] ?? null;
}

/**
 * 各種目の前回記録を計算
 * この関数は DB 移行後もサーバー側で実行される
 */
async function calculatePreviousRecords(
  userId: number,
  templateId: number,
  exerciseIds: number[],
): Promise<Record<number, string>> {
  const previousRecords: Record<number, string> = {};
  const previousWorkoutRecord = await getPreviousRecord(userId, templateId);

  if (!previousWorkoutRecord) {
    return previousRecords;
  }

  const exerciseRecords = await getWorkoutRecordExercisesByRecordIds([
    previousWorkoutRecord.id,
  ]);
  const exerciseRecordIds = exerciseRecords.map(
    (er: WorkoutRecordExercise) => er.id,
  );
  const sets = await getWorkoutRecordSetsByRecordExerciseIds(exerciseRecordIds);
  const setsByWorkoutRecordExerciseId: Record<number, WorkoutRecordSet[]> = {};
  for (const set of sets) {
    if (!setsByWorkoutRecordExerciseId[set.workoutRecordExerciseId]) {
      setsByWorkoutRecordExerciseId[set.workoutRecordExerciseId] = [];
    }
    setsByWorkoutRecordExerciseId[set.workoutRecordExerciseId].push(set);
  }
  const exerciseRecordByExerciseId = new Map(
    exerciseRecords.map((er: WorkoutRecordExercise) => [er.exerciseId, er]),
  );

  // 各種目ごとに前回記録を計算
  for (const exerciseId of exerciseIds) {
    const exerciseRecord = exerciseRecordByExerciseId.get(exerciseId);
    if (!exerciseRecord) continue;
    const previousSets = setsByWorkoutRecordExerciseId[exerciseRecord.id] ?? [];

    if (previousSets.length > 0) {
      // セットをセット番号順にソート
      const sortedSets = [...previousSets].sort(
        (a, b) => a.setNumber - b.setNumber,
      );
      const recordString = sortedSets
        .map((s) => `${s.weight}kg x ${s.reps}`)
        .join(", ");
      previousRecords[exerciseId] = recordString;
    }
  }

  return previousRecords;
}

/**
 * Workout Page (Server Component)
 */
interface PageProps {
  params: Promise<{ menuId: string }>;
  searchParams: Promise<{ date?: string; planId?: string; taskId?: string }>;
}

export default async function ActiveWorkoutPage({
  params,
  searchParams,
}: PageProps) {
  const { menuId: templateIdStr } = await params;
  const { date, planId: sessionIdStr, taskId: taskIdStr } = await searchParams;

  // dateが指定されていなければ今日の日付を使用
  const scheduledDateKey = date ?? toDateKey(new Date());
  // URLパラメータは文字列で来るため、数値に変換
  const templateId = parseInt(templateIdStr, 10);
  const userId = 1;

  if (Number.isNaN(templateId)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">テンプレートが見つかりません</p>
      </div>
    );
  }

  // ============================================================================
  // データ取得（将来的に DB アクセス層に置き換え）
  // ============================================================================
  const template = await getTemplateWithExercises(userId, templateId);

  if (!template) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">テンプレートが見つかりません</p>
      </div>
    );
  }

  // ============================================================================
  // Workout Session 取得 (Option)
  // ============================================================================
  let workoutSession = null;
  if (sessionIdStr) {
    const sessionId = parseInt(sessionIdStr, 10);
    if (!Number.isNaN(sessionId)) {
      workoutSession = await getWorkoutSessionWithDetails(userId, sessionId);
    }
  }

  // ============================================================================
  // 前回記録の計算（サーバー側で実行）
  // ============================================================================
  const exerciseIds = template.exercises.map((e) => e.id);
  const previousRecords = await calculatePreviousRecords(
    userId,
    templateId,
    exerciseIds,
  );

  // ============================================================================
  // Client Component に props として渡す
  // ============================================================================
  return (
    <WorkoutClient
      template={template}
      previousRecords={previousRecords}
      scheduledDateKey={scheduledDateKey}
      workoutSession={workoutSession}
      scheduledTaskId={taskIdStr ? parseInt(taskIdStr, 10) : undefined}
    />
  );
}
