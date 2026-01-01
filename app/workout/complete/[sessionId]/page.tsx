import { notFound } from "next/navigation";
import { getWorkoutSessionWithDetails } from "@/lib/db/queries";
import { CompleteClient } from "./_components/complete-client";

/**
 * Server Component: トレーニング完了画面
 * セッション詳細を取得してサマリーを表示
 */
export default async function WorkoutCompletePage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const userId = 1; // TODO: 認証実装後に動的取得
  const { sessionId } = await params;
  const sessionIdNum = Number.parseInt(sessionId, 10);

  if (Number.isNaN(sessionIdNum)) {
    notFound();
  }

  const session = await getWorkoutSessionWithDetails(userId, sessionIdNum);

  if (!session) {
    notFound();
  }

  // サマリー計算
  const totalSets = session.exerciseRecords.reduce(
    (acc, er) => acc + er.sets.length,
    0,
  );
  const completedSets = session.exerciseRecords.reduce(
    (acc, er) => acc + er.sets.filter((s) => s.completed).length,
    0,
  );
  const totalVolume = session.exerciseRecords.reduce(
    (acc, er) =>
      acc +
      er.sets.reduce(
        (setAcc, s) => (s.completed ? setAcc + s.weight * s.reps : setAcc),
        0,
      ),
    0,
  );
  const duration = session.endedAt
    ? Math.floor(
        (session.endedAt.getTime() - session.startedAt.getTime()) / 1000,
      )
    : 0;

  return (
    <CompleteClient
      session={session}
      summary={{
        totalSets,
        completedSets,
        totalVolume,
        duration,
      }}
    />
  );
}
