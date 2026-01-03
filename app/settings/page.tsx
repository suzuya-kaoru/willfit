import { getBodyParts } from "@/lib/dal/body-part";
import { getExercisesWithBodyParts } from "@/lib/dal/exercise";
import { getWorkoutSessions } from "@/lib/dal/schedule";
import { getTemplatesWithExercises } from "@/lib/dal/template";
import { SettingsClient } from "./_components/settings-client";

/**
 * ============================================================================
 * Server Component: データ取得（サーバー側で実行）
 * ============================================================================
 *
 * DBアクセス層から必要なデータを取得してクライアントへ渡す。
 */

/**
 * 全種目を取得
 */
async function getExercises(userId: number) {
  return getExercisesWithBodyParts(userId);
}

/**
 * 全テンプレートを取得
 */
async function getTemplates(userId: number) {
  return getTemplatesWithExercises(userId);
}

/**
 * 全ワークアウトセッションを取得
 */
async function getSessions(userId: number) {
  return getWorkoutSessions(userId);
}

export default async function SettingsPage() {
  const userId = 1;
  const [exercises, templates, workoutSessions, bodyParts] = await Promise.all([
    getExercises(userId),
    getTemplates(userId),
    getSessions(userId),
    getBodyParts(),
  ]);

  return (
    <SettingsClient
      initialExercises={exercises}
      initialTemplates={templates}
      initialWorkoutSessions={workoutSessions}
      initialBodyParts={bodyParts}
    />
  );
}
