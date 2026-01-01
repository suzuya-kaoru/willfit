import { toDateKey } from "@/lib/date-key";
import {
  getExerciseRecordsBySessionIds,
  getMenuWithExercises,
  getSessionPlanWithDetails,
  getWorkoutSessionsByMenuIds,
  getWorkoutSetsByExerciseRecordIds,
} from "@/lib/db/queries";
import { WorkoutClient } from "./_components/workout-client";

/**
 * ============================================================================
 * Server Component: データ取得と計算（サーバー側で実行）
 * ============================================================================
 *
 * DBアクセス層からメニュー・前回記録を取得し、前回記録の計算はサーバー側で行う。
 */

/**
 * 指定されたメニューIDの前回セッションを取得
 */
async function getPreviousSession(userId: number, menuId: number) {
  const sessions = await getWorkoutSessionsByMenuIds(userId, [menuId]);
  return sessions[0] ?? null;
}

/**
 * 各種目の前回記録を計算
 * この関数は DB 移行後もサーバー側で実行される
 */
async function calculatePreviousRecords(
  userId: number,
  menuId: number,
  exerciseIds: number[],
): Promise<Map<number, string>> {
  const previousRecords = new Map<number, string>();
  const previousSession = await getPreviousSession(userId, menuId);

  if (!previousSession) {
    return previousRecords;
  }

  const exerciseRecords = await getExerciseRecordsBySessionIds([
    previousSession.id,
  ]);
  const exerciseRecordIds = exerciseRecords.map((record) => record.id);
  const sets = await getWorkoutSetsByExerciseRecordIds(exerciseRecordIds);
  const setsByRecordId = new Map<number, typeof sets>();
  for (const set of sets) {
    const list = setsByRecordId.get(set.exerciseRecordId) ?? [];
    list.push(set);
    setsByRecordId.set(set.exerciseRecordId, list);
  }
  const recordByExerciseId = new Map(
    exerciseRecords.map((record) => [record.exerciseId, record]),
  );

  // 各種目ごとに前回記録を計算
  for (const exerciseId of exerciseIds) {
    const record = recordByExerciseId.get(exerciseId);
    if (!record) continue;
    const previousSets = setsByRecordId.get(record.id) ?? [];

    if (previousSets.length > 0) {
      // セットをセット番号順にソート
      const sortedSets = [...previousSets].sort(
        (a, b) => a.setNumber - b.setNumber,
      );
      const recordString = sortedSets
        .map((s) => `${s.weight}kg x ${s.reps}`)
        .join(", ");
      previousRecords.set(exerciseId, recordString);
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
  const { menuId: menuIdStr } = await params;
  const { date, planId: planIdStr, taskId: taskIdStr } = await searchParams;

  // dateが指定されていなければ今日の日付を使用
  const scheduledDateKey = date ?? toDateKey(new Date());
  // URLパラメータは文字列で来るため、数値に変換
  const menuId = parseInt(menuIdStr, 10);
  const userId = 1;

  if (Number.isNaN(menuId)) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">メニューが見つかりません</p>
      </div>
    );
  }

  // ============================================================================
  // データ取得（将来的に DB アクセス層に置き換え）
  // ============================================================================
  const menu = await getMenuWithExercises(userId, menuId);

  if (!menu) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">メニューが見つかりません</p>
      </div>
    );
  }

  // ============================================================================
  // Session Plan 取得 (Option)
  // ============================================================================
  let sessionPlan = null;
  if (planIdStr) {
    const planId = parseInt(planIdStr, 10);
    if (!Number.isNaN(planId)) {
      sessionPlan = await getSessionPlanWithDetails(userId, planId);
    }
  }

  // ============================================================================
  // 前回記録の計算（サーバー側で実行）
  // ============================================================================
  const exerciseIds = menu.exercises.map((e) => e.id);
  const previousRecords = await calculatePreviousRecords(
    userId,
    menuId,
    exerciseIds,
  );

  // ============================================================================
  // Client Component に props として渡す
  // ============================================================================
  return (
    <WorkoutClient
      menu={menu}
      previousRecords={previousRecords}
      scheduledDateKey={scheduledDateKey}
      sessionPlan={sessionPlan}
      scheduledTaskId={taskIdStr ? parseInt(taskIdStr, 10) : undefined}
    />
  );
}
