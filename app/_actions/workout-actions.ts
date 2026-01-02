"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dateKeySchema } from "@/lib/date-key";
import { createWorkoutSession, updateWorkoutSession } from "@/lib/db/queries";

// =============================================================================
// 入力型定義
// =============================================================================

export interface SaveWorkoutSessionInput {
  menuId: number;
  sessionPlanId?: number; // 新規追加
  scheduledTaskId?: number; // 新規追加
  scheduledDateKey: string; // スケジュールの日付キー（YYYY-MM-DD）
  startedAt: Date;
  endedAt: Date;
  condition: number;
  fatigue: number;
  note: string;
  exercises: {
    exerciseId: number;
    sets: {
      setNumber: number;
      weight: number;
      reps: number;
      completed: boolean;
    }[];
  }[];
}

export interface UpdateWorkoutSessionInput {
  sessionId: number;
  endedAt: Date;
  condition: number;
  fatigue: number;
  note: string;
  exercises: {
    exerciseId: number;
    sets: {
      setNumber: number;
      weight: number;
      reps: number;
      completed: boolean;
    }[];
  }[];
}

// =============================================================================
// バリデーションスキーマ
// =============================================================================

const workoutSetSchema = z.object({
  setNumber: z.number().int().positive(),
  weight: z.number().min(0),
  reps: z.number().int().min(0),
  completed: z.boolean(),
});

const exerciseRecordSchema = z.object({
  exerciseId: z.number().int().positive(),
  sets: z.array(workoutSetSchema).min(1),
});

const saveWorkoutSessionSchema = z.object({
  menuId: z.number().int().positive(),
  sessionPlanId: z.number().int().positive().optional(),
  scheduledTaskId: z.number().int().positive().optional(),
  scheduledDateKey: dateKeySchema,
  startedAt: z.date(),
  endedAt: z.date(),
  condition: z.number().int().min(1).max(10),
  fatigue: z.number().int().min(1).max(10),
  note: z.string(),
  exercises: z.array(exerciseRecordSchema).min(1),
});

const updateWorkoutSessionSchema = z.object({
  sessionId: z.number().int().positive(),
  endedAt: z.date(),
  condition: z.number().int().min(1).max(10),
  fatigue: z.number().int().min(1).max(10),
  note: z.string(),
  exercises: z.array(exerciseRecordSchema).min(1),
});

// =============================================================================
// Helper Functions
// =============================================================================

// toBigInt helper is no longer needed here as it is handled in queries.ts

// =============================================================================
// Server Actions
// =============================================================================

/**
 * トレーニングセッションを保存
 *
 * - WorkoutSession, ExerciseRecord, WorkoutSet を一括保存
 * - 該当日のDailySchedule または ScheduledTask をcompletedに更新
 */
export async function saveWorkoutSessionAction(
  input: SaveWorkoutSessionInput,
): Promise<{ success: true; sessionId: number }> {
  const data = saveWorkoutSessionSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  const session = await createWorkoutSession(userId, {
    menuId: data.menuId,
    sessionPlanId: data.sessionPlanId,
    scheduledTaskId: data.scheduledTaskId,
    startedAt: data.startedAt,
    endedAt: data.endedAt,
    condition: data.condition,
    fatigue: data.fatigue,
    note: data.note,
    exercises: data.exercises,
  });

  revalidatePath("/");
  revalidatePath("/schedule");

  return { success: true, sessionId: Number(session.id) };
}

/**
 * トレーニングセッションを更新（編集・再開用）
 *
 * - 既存の ExerciseRecord, WorkoutSet を削除して再作成
 * - セッションのメタ情報を更新
 */
export async function updateWorkoutSessionAction(
  input: UpdateWorkoutSessionInput,
): Promise<{ success: true }> {
  const data = updateWorkoutSessionSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  await updateWorkoutSession(userId, {
    sessionId: data.sessionId,
    endedAt: data.endedAt,
    condition: data.condition,
    fatigue: data.fatigue,
    note: data.note,
    exercises: data.exercises,
  });

  revalidatePath("/");
  revalidatePath("/schedule");

  return { success: true };
}
