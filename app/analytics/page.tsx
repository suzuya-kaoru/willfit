import {
  getAllExercisesWithBodyParts,
  mockMenuExercises,
  mockSessions,
  mockSets,
  mockWeightRecords,
} from "@/lib/mock-data";
import type { ExerciseWithBodyParts, MenuExercise } from "@/lib/types";
import {
  AnalyticsClient,
  type ExerciseDataPoint,
  type PersonalBest,
} from "./_components/analytics-client";

/**
 * ============================================================================
 * Server Component: データ取得と計算（サーバー側で実行）
 * ============================================================================
 *
 * 将来的に DB に切り替える際は、以下の関数を DB アクセス層に置き換える：
 * - getWeightRecords(): 体重記録を取得
 * - getSessions(): 全セッションを取得
 * - getSets(): 全セットを取得
 * - getAllExercises(): 全種目を取得
 * - calculateExerciseData(): 種目別の成長データを計算
 * - calculatePersonalBests(): 自己ベストを計算
 */

// ============================================================================
// データ取得関数（DB移行時に置き換え）
// ============================================================================

/**
 * 体重記録を取得
 * TODO: DB移行時に DB アクセス層に置き換える
 */
function getWeightRecords() {
  return mockWeightRecords;
}

/**
 * 全セッションを取得
 * TODO: DB移行時に DB アクセス層に置き換える
 */
function getSessions() {
  return mockSessions;
}

/**
 * 全セットを取得
 * TODO: DB移行時に DB アクセス層に置き換える
 */
function getSets() {
  return mockSets;
}

/**
 * セッションIDと種目IDから exercise_record_id を算出
 * - mockデータのIDはセッション順 × メニュー内の並び順で連番
 * - DB移行時は exercise_records をJOINして取得する想定
 */
function getExerciseRecordId(sessionId: number, exerciseId: number) {
  const session = mockSessions.find((s) => s.id === sessionId);
  if (!session) return null;

  // セッションIDより前のセッションに含まれる種目数を合計
  const countBefore = mockSessions
    .filter((s) => s.id < sessionId)
    .reduce((acc: number, s) => {
      const exercisesInMenu = mockMenuExercises.filter(
        (me: MenuExercise) => me.menuId === s.menuId,
      );
      return acc + exercisesInMenu.length;
    }, 0);

  // 現在のセッションのメニュー内での順序を取得
  const menuExercises = mockMenuExercises
    .filter((me: MenuExercise) => me.menuId === session.menuId)
    .sort(
      (a: MenuExercise, b: MenuExercise) => a.displayOrder - b.displayOrder,
    );
  const exerciseOrder = menuExercises.findIndex(
    (me) => me.exerciseId === exerciseId,
  );
  if (exerciseOrder === -1) return null;

  return countBefore + exerciseOrder + 1;
}

/**
 * 全種目を取得
 * TODO: DB移行時に DB アクセス層に置き換える
 */
function getAllExercises(): ExerciseWithBodyParts[] {
  return getAllExercisesWithBodyParts();
}

// ============================================================================
// 計算関数（サーバー側で実行）
// ============================================================================

/**
 * 種目別の成長データを計算
 * 指定された種目のセッションごとに最大重量、推定1RM、総ボリュームを計算
 *
 * TODO: DB移行時は、DB側で集計クエリを実行することを検討
 * （例: GROUP BY session_id, exercise_id, MAX(weight), SUM(weight * reps) など）
 */
function calculateExerciseData(
  sessions: typeof mockSessions,
  sets: typeof mockSets,
  exerciseId: number,
): ExerciseDataPoint[] {
  const sessionData = sessions
    .map((session) => {
      // 指定された種目のexercise_record_idを算出
      const recordId = getExerciseRecordId(session.id, exerciseId);
      if (recordId === null) return null;

      // このexercise_record_idに紐づくセットのみを取得
      const exerciseSets = sets.filter(
        (set) => set.exerciseRecordId === recordId,
      );

      if (exerciseSets.length === 0) return null;

      const maxWeight = Math.max(...exerciseSets.map((s) => s.weight));
      const maxReps = Math.max(
        ...exerciseSets
          .filter((s) => s.weight === maxWeight)
          .map((s) => s.reps),
      );
      const estimated1RM = maxWeight * (1 + maxReps / 30); // Epley formula
      const totalVolume = exerciseSets.reduce(
        (sum, s) => sum + s.weight * s.reps,
        0,
      );

      return {
        date: new Date(session.startedAt).toLocaleDateString("ja-JP", {
          month: "short",
          day: "numeric",
        }),
        weight: maxWeight,
        "1rm": Math.round(estimated1RM * 10) / 10,
        volume: totalVolume,
      };
    })
    .filter((d): d is ExerciseDataPoint => d !== null);

  return sessionData;
}

/**
 * 自己ベストを計算
 * 各種目の最大重量とその日付を計算
 *
 * TODO: DB移行時は、DB側で集計クエリを実行することを検討
 * （例: GROUP BY exercise_id, MAX(weight), MAX(date) など）
 */
function calculatePersonalBests(
  exercises: ExerciseWithBodyParts[],
  sessions: typeof mockSessions,
  sets: typeof mockSets,
): PersonalBest[] {
  const bests: PersonalBest[] = [];

  // 各種目の最大重量を計算
  for (const exercise of exercises) {
    let maxWeight = 0;
    let bestDate = "";

    for (const session of sessions) {
      const recordId = getExerciseRecordId(session.id, exercise.id);
      if (recordId === null) continue;

      const sessionSets = sets.filter(
        (set) => set.exerciseRecordId === recordId,
      );
      for (const set of sessionSets) {
        if (set.weight > maxWeight) {
          maxWeight = set.weight;
          bestDate = session.startedAt.toISOString().split("T")[0];
        }
      }
    }

    if (maxWeight > 0) {
      bests.push({
        id: exercise.id, // number型
        exerciseName: exercise.name,
        weight: maxWeight,
        date: bestDate,
      });
    }
  }

  return bests;
}

// ============================================================================
// Server Component
// ============================================================================

export default async function AnalyticsPage() {
  // データ取得（将来的に DB アクセス層に置き換え）
  const weightRecords = getWeightRecords();
  const sessions = getSessions();
  const sets = getSets();
  const exercises = getAllExercises();

  // 計算処理（サーバー側で実行）
  // 各種目ごとの成長データを計算（クライアント側で種目選択時にフィルタリング）
  // Note: Next.jsはMapをシリアライズできないため、オブジェクトに変換
  const exerciseDataByExerciseId: Record<number, ExerciseDataPoint[]> = {};
  for (const exercise of exercises) {
    const data = calculateExerciseData(sessions, sets, exercise.id);
    exerciseDataByExerciseId[exercise.id] = data;
  }
  const personalBests = calculatePersonalBests(exercises, sessions, sets);

  // クライアント側に渡すデータを準備
  // Note: Date オブジェクトはシリアライズできないため、Date オブジェクトとして渡す
  // Next.js は Date オブジェクトを自動的にシリアライズしてくれる
  const allWeightRecords = weightRecords.map((r) => ({
    recordedAt: r.recordedAt,
    weight: r.weight,
  }));

  return (
    <AnalyticsClient
      allExercises={exercises}
      allWeightRecords={allWeightRecords}
      exerciseDataByExerciseId={exerciseDataByExerciseId}
      personalBests={personalBests}
    />
  );
}
