"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dateKeySchema } from "@/lib/date-key";
import { createWorkoutRecord, updateWorkoutRecord } from "@/lib/db/queries";

// =============================================================================
// 入力型定義
// =============================================================================

export interface SaveWorkoutRecordInput {
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
      note?: string;
    }[];
  }[];
}

export interface UpdateWorkoutRecordInput {
  recordId: number;
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
      note?: string;
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
  note: z.string().optional(),
});

const exerciseRecordSchema = z.object({
  exerciseId: z.number().int().positive(),
  sets: z.array(workoutSetSchema).min(1),
});

const saveWorkoutRecordSchema = z.object({
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

const updateWorkoutRecordSchema = z.object({
  recordId: z.number().int().positive(),
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
 * トレーニング記録を保存
 *
 * - WorkoutRecord, ExerciseRecord, WorkoutSet を一括保存
 * - 該当日のDailySchedule または ScheduledTask をcompletedに更新
 */
export async function saveWorkoutRecordAction(
  input: SaveWorkoutRecordInput,
): Promise<{ success: true; recordId: number }> {
  const data = saveWorkoutRecordSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  const record = await createWorkoutRecord(userId, {
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

  return { success: true, recordId: Number(record.id) };
}

/**
 * トレーニング記録を更新（編集・再開用）
 *
 * - 既存の ExerciseRecord, WorkoutSet を削除して再作成
 * - 記録のメタ情報を更新
 */
export async function updateWorkoutRecordAction(
  input: UpdateWorkoutRecordInput,
): Promise<{ success: true }> {
  const data = updateWorkoutRecordSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  await updateWorkoutRecord(userId, {
    recordId: data.recordId,
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
