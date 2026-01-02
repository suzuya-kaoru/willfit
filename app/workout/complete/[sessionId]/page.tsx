import { notFound } from "next/navigation";
import { getWorkoutRecordWithDetails } from "@/lib/db/queries";
import { CompleteClient } from "./_components/complete-client";

interface WorkoutRecordExerciseForStats {
  sets: { completed: boolean; weight: number; reps: number }[];
}

/**
 * Server Component: トレーニング完了画面
 * 記録詳細を取得してサマリーを表示
 */
export default async function WorkoutCompletePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const userId = 1; // TODO: 認証実装後に動的取得
  const { sessionId } = await params;
  const recordIdNum = Number.parseInt(sessionId, 10);

  if (Number.isNaN(recordIdNum)) {
    notFound();
  }

  const workoutRecord = await getWorkoutRecordWithDetails(userId, recordIdNum);

  if (!workoutRecord) {
    notFound();
  }

  // サマリー計算
  const totalSets = workoutRecord.workoutRecordExercises.reduce(
    (acc: number, er: WorkoutRecordExerciseForStats) => acc + er.sets.length,
    0,
  );
  const completedSets = workoutRecord.workoutRecordExercises.reduce(
    (acc: number, er: WorkoutRecordExerciseForStats) =>
      acc + er.sets.filter((s) => s.completed).length,
    0,
  );
  const totalVolume = workoutRecord.workoutRecordExercises.reduce(
    (acc: number, er: WorkoutRecordExerciseForStats) =>
      acc +
      er.sets.reduce(
        (setAcc: number, s) =>
          s.completed ? setAcc + s.weight * s.reps : setAcc,
        0,
      ),
    0,
  );
  const duration = workoutRecord.endedAt
    ? Math.floor(
        (workoutRecord.endedAt.getTime() - workoutRecord.startedAt.getTime()) /
          1000,
      )
    : 0;

  return (
    <CompleteClient
      workoutRecord={workoutRecord}
      summary={{
        totalSets,
        completedSets,
        totalVolume,
        duration,
      }}
    />
  );
}
