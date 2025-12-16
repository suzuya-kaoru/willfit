import {
  getMenuWithExercises,
  mockMenuExercises,
  mockSessions,
  mockSets,
} from "@/lib/mock-data";
import { WorkoutClient } from "./_components/workout-client";

/**
 * ============================================================================
 * Server Component: データ取得と計算（サーバー側で実行）
 * ============================================================================
 *
 * 将来的に DB に切り替える際は、以下の関数を DB アクセス層に置き換える：
 * - getMenuWithExercises() → DB クエリ
 * - getPreviousSession() → DB クエリ
 * - getPreviousSetsByExercise() → DB クエリ
 * - calculatePreviousRecords() → サーバー側の計算ロジック（変更なし）
 */

/**
 * 指定されたメニューIDの前回セッションを取得
 * TODO: DB移行時は、この関数を DB アクセス層に置き換える
 * 例: SELECT * FROM workout_records WHERE menu_id = ? AND user_id = ? ORDER BY started_at DESC LIMIT 1
 */
function getPreviousSession(menuId: number) {
  return mockSessions
    .filter((s) => s.menuId === menuId)
    .sort(
      (a, b) =>
        new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
    )[0];
}

/**
 * 指定された種目IDの前回セットを取得
 * TODO: DB移行時は、この関数を DB アクセス層に置き換える
 * 例: SELECT * FROM workout_set_records WHERE exercise_record_id IN (
 *   SELECT id FROM exercise_records WHERE exercise_id = ? AND session_id = ?
 * ) ORDER BY set_number
 */
function getPreviousSetsByExercise(
  exerciseId: number,
  sessionId: number,
): typeof mockSets {
  const session = mockSessions.find((s) => s.id === sessionId);
  if (!session) return [];

  // セッションのメニューから種目の順序を取得
  const menuExercises = mockMenuExercises
    .filter((me) => me.menuId === session.menuId)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  // 指定された種目IDの順序（displayOrder）を取得
  const exerciseOrder = menuExercises.findIndex(
    (me) => me.exerciseId === exerciseId,
  );

  if (exerciseOrder === -1) return [];

  // exerciseRecordIdの計算: セッションごとに連番を割り当て
  // session-001 (id: 1) の1番目の種目 → exerciseRecordId: 1
  // session-001 (id: 1) の2番目の種目 → exerciseRecordId: 2
  // session-002 (id: 2) の1番目の種目 → exerciseRecordId: 3
  let exerciseRecordIdCounter = 1;
  // session.idより小さいIDのセッションのみをカウント（自分自身は除外）
  const prevSessions = mockSessions.filter((s) => s.id < session.id);
  for (const prevSession of prevSessions) {
    const prevMenuExercises = mockMenuExercises.filter(
      (me) => me.menuId === prevSession.menuId,
    );
    exerciseRecordIdCounter += prevMenuExercises.length;
  }

  const expectedRecordId = exerciseRecordIdCounter + exerciseOrder;

  // 該当するexerciseRecordIdのセットを取得
  return mockSets.filter((set) => set.exerciseRecordId === expectedRecordId);
}

/**
 * 各種目の前回記録を計算
 * この関数は DB 移行後もサーバー側で実行される
 */
function calculatePreviousRecords(
  menuId: number,
  exerciseIds: number[],
): Map<number, string> {
  const previousRecords = new Map<number, string>();
  const previousSession = getPreviousSession(menuId);

  if (!previousSession) {
    return previousRecords;
  }

  // 各種目ごとに前回記録を計算
  for (const exerciseId of exerciseIds) {
    const previousSets = getPreviousSetsByExercise(
      exerciseId,
      previousSession.id,
    );

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
}

export default async function ActiveWorkoutPage({ params }: PageProps) {
  const { menuId: menuIdStr } = await params;
  // URLパラメータは文字列で来るため、数値に変換
  const menuId = parseInt(menuIdStr, 10);

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
  const menu = getMenuWithExercises(menuId);

  if (!menu) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">メニューが見つかりません</p>
      </div>
    );
  }

  // ============================================================================
  // 前回記録の計算（サーバー側で実行）
  // ============================================================================
  const exerciseIds = menu.exercises.map((e) => e.id);
  const previousRecords = calculatePreviousRecords(menuId, exerciseIds);

  // ============================================================================
  // Client Component に props として渡す
  // ============================================================================
  return <WorkoutClient menu={menu} previousRecords={previousRecords} />;
}
