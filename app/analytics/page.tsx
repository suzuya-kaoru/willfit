import { toDateKey } from "@/lib/date-key";
import {
  getExerciseRecordsBySessionIds,
  getExercisesWithBodyParts,
  getMonthlyStats,
  getWeightRecords,
  getWorkoutSessions,
  getWorkoutSetsByExerciseRecordIds,
} from "@/lib/db/queries";
import { formatDateTime } from "@/lib/timezone";
import type {
  ExerciseRecord,
  ExerciseWithBodyParts,
  WorkoutSession,
  WorkoutSet,
} from "@/lib/types";
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
 * DBアクセス層から取得したデータを集計してクライアントへ渡す。
 */

// ============================================================================
// 計算関数（サーバー側で実行）
// ============================================================================

/**
 * 種目別の成長データを計算
 * 指定された種目のセッションごとに最大重量、推定1RM、総ボリュームを計算
 *
 * 将来的に集計が重くなった場合は、DB側の集計クエリへの移行を検討。
 */
function calculateExerciseData(
  sessions: WorkoutSession[],
  exerciseRecordKeyMap: Map<string, ExerciseRecord>,
  setsByExerciseRecordId: Map<number, WorkoutSet[]>,
  exerciseId: number,
): ExerciseDataPoint[] {
  const sessionData = sessions
    .map((session) => {
      const record = exerciseRecordKeyMap.get(`${session.id}:${exerciseId}`);
      if (!record) return null;

      const exerciseSets = setsByExerciseRecordId.get(record.id) ?? [];

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
        date: formatDateTime(session.startedAt, "M/d"),
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
 * 将来的に集計が重くなった場合は、DB側の集計クエリへの移行を検討。
 */
function calculatePersonalBests(
  exercises: ExerciseWithBodyParts[],
  exerciseRecords: ExerciseRecord[],
  setsByExerciseRecordId: Map<number, WorkoutSet[]>,
  sessionDateById: Map<number, Date>,
): PersonalBest[] {
  const bests: PersonalBest[] = [];

  // 各種目の最大重量を計算
  for (const exercise of exercises) {
    let maxWeight = 0;
    let bestDate = "";

    const recordsForExercise = exerciseRecords.filter(
      (record) => record.exerciseId === exercise.id,
    );
    for (const record of recordsForExercise) {
      const sessionSets = setsByExerciseRecordId.get(record.id) ?? [];
      const sessionDate = sessionDateById.get(record.sessionId);
      for (const set of sessionSets) {
        if (set.weight > maxWeight) {
          maxWeight = set.weight;
          if (sessionDate) {
            bestDate = toDateKey(sessionDate);
          }
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
  const userId = 1;
  const now = new Date();
  const [weightRecords, sessions, exercises, monthlyStats] = await Promise.all([
    getWeightRecords(userId),
    getWorkoutSessions(userId),
    getExercisesWithBodyParts(userId),
    getMonthlyStats(userId, now.getFullYear(), now.getMonth()),
  ]);
  const sessionsAsc = [...sessions].sort(
    (a, b) => a.startedAt.getTime() - b.startedAt.getTime(),
  );
  const sessionIds = sessions.map((session) => session.id);
  const exerciseRecords = await getExerciseRecordsBySessionIds(sessionIds);
  const exerciseRecordIds = exerciseRecords.map((record) => record.id);
  const sets = await getWorkoutSetsByExerciseRecordIds(exerciseRecordIds);
  const setsByExerciseRecordId = new Map<number, WorkoutSet[]>();
  for (const set of sets) {
    const list = setsByExerciseRecordId.get(set.exerciseRecordId) ?? [];
    list.push(set);
    setsByExerciseRecordId.set(set.exerciseRecordId, list);
  }
  const exerciseRecordKeyMap = new Map<string, ExerciseRecord>();
  for (const record of exerciseRecords) {
    exerciseRecordKeyMap.set(
      `${record.sessionId}:${record.exerciseId}`,
      record,
    );
  }
  const sessionDateById = new Map(
    sessions.map((session) => [session.id, session.startedAt]),
  );

  // 計算処理（サーバー側で実行）
  // 各種目ごとの成長データを計算（クライアント側で種目選択時にフィルタリング）
  // Note: Next.jsはMapをシリアライズできないため、オブジェクトに変換
  const exerciseDataByExerciseId: Record<number, ExerciseDataPoint[]> = {};
  for (const exercise of exercises) {
    const data = calculateExerciseData(
      sessionsAsc,
      exerciseRecordKeyMap,
      setsByExerciseRecordId,
      exercise.id,
    );
    exerciseDataByExerciseId[exercise.id] = data;
  }
  const personalBests = calculatePersonalBests(
    exercises,
    exerciseRecords,
    setsByExerciseRecordId,
    sessionDateById,
  );

  // クライアント側に渡すデータを準備
  // Note: Date オブジェクトはシリアライズできないため、Date オブジェクトとして渡す
  // Next.js は Date オブジェクトを自動的にシリアライズしてくれる
  const allWeightRecords = [...weightRecords]
    .sort((a, b) => a.recordedAt.getTime() - b.recordedAt.getTime())
    .map((r) => ({
      recordedAt: r.recordedAt,
      weight: r.weight,
      bodyFat: r.bodyFat,
    }));

  return (
    <AnalyticsClient
      allExercises={exercises}
      allWeightRecords={allWeightRecords}
      exerciseDataByExerciseId={exerciseDataByExerciseId}
      personalBests={personalBests}
      monthlyStats={monthlyStats}
    />
  );
}
