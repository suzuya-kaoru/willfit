import {
  getAllExercisesWithBodyParts,
  mockSessions,
  mockSets,
  mockWeightRecords,
} from "@/lib/mock-data";
import type { ExerciseWithBodyParts } from "@/lib/types";
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
 * セッションごとに最大重量、推定1RM、総ボリュームを計算
 *
 * TODO: DB移行時は、DB側で集計クエリを実行することを検討
 * （例: GROUP BY session_id, MAX(weight), SUM(weight * reps) など）
 */
function calculateExerciseData(
  sessions: typeof mockSessions,
  sets: typeof mockSets,
): ExerciseDataPoint[] {
  const sessionData = sessions
    .map((session) => {
      // このセッションのセットを取得
      // Note: 現在の実装では全セットを取得しているが、
      // 将来的には sessionId でフィルタリングする必要がある
      const sessionSets = sets.filter((set) =>
        set.exerciseLogId.startsWith("log-"),
      );

      if (sessionSets.length === 0) return null;

      const maxWeight = Math.max(...sessionSets.map((s) => s.weight));
      const maxReps = Math.max(
        ...sessionSets.filter((s) => s.weight === maxWeight).map((s) => s.reps),
      );
      const estimated1RM = maxWeight * (1 + maxReps / 30); // Epley formula
      const totalVolume = sessionSets.reduce(
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
      // このセッションのセットを取得
      // Note: 現在の実装では全セットを取得しているが、
      // 将来的には sessionId と exerciseId でフィルタリングする必要がある
      const sessionSets = sets.filter((set) =>
        set.exerciseLogId.startsWith("log-"),
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
        id: exercise.id,
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
  const exerciseData = calculateExerciseData(sessions, sets);
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
      allExerciseData={exerciseData}
      personalBests={personalBests}
    />
  );
}
