import { getExercisesWithBodyParts } from "@/lib/dal/exercise";
import { getWeightRecords } from "@/lib/dal/weight-record";
import {
  getMonthlyStats,
  getWorkoutRecordExercisesByRecordIds,
  getWorkoutRecordSetsByExerciseIds,
  getWorkoutRecords,
} from "@/lib/dal/workout-record";
import { toDateKey } from "@/lib/date-key";
import { formatDateTimeJST } from "@/lib/timezone";

import type {
  ExerciseWithBodyParts,
  WorkoutRecord,
  WorkoutRecordExercise,
  WorkoutRecordSet,
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
  records: WorkoutRecord[],
  exerciseRecordKeyMap: Map<string, WorkoutRecordExercise>,
  setsByWorkoutRecordExerciseId: Map<number, WorkoutRecordSet[]>,
  exerciseId: number,
): ExerciseDataPoint[] {
  const recordData = records
    .map((workoutRecord) => {
      const record = exerciseRecordKeyMap.get(
        `${workoutRecord.id}:${exerciseId}`,
      );
      if (!record) return null;

      const exerciseSets = setsByWorkoutRecordExerciseId.get(record.id) ?? [];

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
        date: formatDateTimeJST(workoutRecord.startedAt, "M/d"),
        weight: maxWeight,
        "1rm": Math.round(estimated1RM * 10) / 10,
        volume: totalVolume,
      };
    })
    .filter((d): d is ExerciseDataPoint => d !== null);

  return recordData;
}

/**
 * 自己ベストを計算
 * 各種目の最大重量とその日付を計算
 *
 * 将来的に集計が重くなった場合は、DB側の集計クエリへの移行を検討。
 */
function calculatePersonalBests(
  exercises: ExerciseWithBodyParts[],
  exerciseRecords: WorkoutRecordExercise[],
  setsByWorkoutRecordExerciseId: Map<number, WorkoutRecordSet[]>,
  recordDateById: Map<number, Date>,
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
      const sessionSets = setsByWorkoutRecordExerciseId.get(record.id) ?? [];
      const recordDate = recordDateById.get(record.recordId);
      for (const set of sessionSets) {
        if (set.weight > maxWeight) {
          maxWeight = set.weight;
          if (recordDate) {
            bestDate = toDateKey(recordDate);
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
  const [weightRecords, workoutRecords, exercises, monthlyStats] =
    await Promise.all([
      getWeightRecords(userId),
      getWorkoutRecords(userId),
      getExercisesWithBodyParts(userId),
      getMonthlyStats(userId, now.getFullYear(), now.getMonth()),
    ]);
  const recordsAsc = [...workoutRecords].sort(
    (a, b) => a.startedAt.getTime() - b.startedAt.getTime(),
  );
  const recordIds = workoutRecords.map((record: WorkoutRecord) => record.id);
  const exerciseRecords = await getWorkoutRecordExercisesByRecordIds(recordIds);
  const exerciseRecordIds = exerciseRecords.map((record) => record.id);
  const sets = await getWorkoutRecordSetsByExerciseIds(exerciseRecordIds);
  const setsByWorkoutRecordExerciseId = new Map<number, WorkoutRecordSet[]>();
  for (const set of sets) {
    const list =
      setsByWorkoutRecordExerciseId.get(set.workoutRecordExerciseId) ?? [];
    list.push(set);
    setsByWorkoutRecordExerciseId.set(set.workoutRecordExerciseId, list);
  }
  const exerciseRecordKeyMap = new Map<string, WorkoutRecordExercise>();
  for (const record of exerciseRecords) {
    exerciseRecordKeyMap.set(`${record.recordId}:${record.exerciseId}`, record);
  }
  const recordDateById = new Map<number, Date>(
    workoutRecords.map((record: WorkoutRecord) => [
      record.id,
      record.startedAt,
    ]),
  );

  // 計算処理（サーバー側で実行）
  // 各種目ごとの成長データを計算（クライアント側で種目選択時にフィルタリング）
  // Note: Next.jsはMapをシリアライズできないため、オブジェクトに変換
  const exerciseDataByExerciseId: Record<number, ExerciseDataPoint[]> = {};
  for (const exercise of exercises) {
    const data = calculateExerciseData(
      recordsAsc,
      exerciseRecordKeyMap,
      setsByWorkoutRecordExerciseId,
      exercise.id,
    );
    exerciseDataByExerciseId[exercise.id] = data;
  }
  const personalBests = calculatePersonalBests(
    exercises,
    exerciseRecords,
    setsByWorkoutRecordExerciseId,
    recordDateById,
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
