import { notFound } from "next/navigation";
import {
  getMenuWithExercises,
  getWorkoutSessionWithDetails,
} from "@/lib/db/queries";
import { WorkoutEditClient } from "./_components/workout-edit-client";

/**
 * Server Component: トレーニング編集（再開）画面
 * 既存セッションを初期値として読み込み、編集可能にする
 */
export default async function WorkoutEditPage({
  params,
}: {
  params: Promise<{ menuId: string; sessionId: string }>;
}) {
  const userId = 1; // TODO: 認証実装後に動的取得
  const { menuId, sessionId } = await params;
  const menuIdNum = Number.parseInt(menuId, 10);
  const sessionIdNum = Number.parseInt(sessionId, 10);

  if (Number.isNaN(menuIdNum) || Number.isNaN(sessionIdNum)) {
    notFound();
  }

  const [menu, session] = await Promise.all([
    getMenuWithExercises(userId, menuIdNum),
    getWorkoutSessionWithDetails(userId, sessionIdNum),
  ]);

  if (!menu || !session) {
    notFound();
  }

  // セッションのメニューIDが一致するか確認
  if (session.menuId !== menuIdNum) {
    notFound();
  }

  return <WorkoutEditClient menu={menu} session={session} />;
}
