"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createWorkoutSession,
  deleteWorkoutSession,
  updateWorkoutSession,
} from "@/lib/dal/schedule/workout-session";

// =============================================================================
// 入力型定義
// =============================================================================

export interface WorkoutSessionExerciseInput {
  exerciseId: number;
  displayOrder: number;
  targetWeight?: number;
  targetReps?: number;
  targetSets?: number;
  restSeconds?: number;
  note?: string;
}

export interface CreateWorkoutSessionInput {
  templateId: number;
  name: string;
  description?: string;
  exercises: WorkoutSessionExerciseInput[];
}

export interface UpdateWorkoutSessionInput {
  id: number;
  name: string;
  description?: string;
  exercises: WorkoutSessionExerciseInput[];
}

// =============================================================================
// バリデーションスキーマ
// =============================================================================

const workoutSessionExerciseSchema = z.object({
  exerciseId: z.number().int().positive("種目IDは正の整数"),
  displayOrder: z.number().int().min(1, "表示順は1以上"),
  targetWeight: z.number().min(0, "重量は0以上").optional(),
  targetReps: z.number().int().min(1, "回数は1以上").optional(),
  targetSets: z.number().int().min(1, "セット数は1以上").optional(),
  restSeconds: z.number().int().min(0, "休憩時間は0以上").optional(),
  note: z.string().max(500, "メモは500文字以内").optional(),
});

const createWorkoutSessionSchema = z.object({
  templateId: z.number().int().positive("テンプレートIDは正の整数"),
  name: z
    .string()
    .min(1, "セッション名は必須です")
    .max(100, "セッション名は100文字以内"),
  description: z.string().max(1000, "説明は1000文字以内").optional(),
  exercises: z
    .array(workoutSessionExerciseSchema)
    .min(1, "種目を1つ以上追加してください"),
});

const updateWorkoutSessionSchema = z.object({
  id: z.number().int().positive("IDは正の整数"),
  name: z
    .string()
    .min(1, "セッション名は必須です")
    .max(100, "セッション名は100文字以内"),
  description: z.string().max(1000, "説明は1000文字以内").optional(),
  exercises: z
    .array(workoutSessionExerciseSchema)
    .min(1, "種目を1つ以上追加してください"),
});

// =============================================================================
// Server Actions
// =============================================================================

/**
 * ワークアウトセッションを作成
 */
export async function createWorkoutSessionAction(
  input: CreateWorkoutSessionInput,
) {
  const data = createWorkoutSessionSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  const session = await createWorkoutSession({
    userId,
    templateId: data.templateId,
    name: data.name,
    description: data.description,
    exercises: data.exercises,
  });

  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/settings");

  return { id: session.id, name: session.name };
}

/**
 * ワークアウトセッションを更新
 */
export async function updateWorkoutSessionAction(
  input: UpdateWorkoutSessionInput,
) {
  const data = updateWorkoutSessionSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  await updateWorkoutSession({
    workoutSessionId: data.id,
    userId,
    name: data.name,
    description: data.description,
    exercises: data.exercises,
  });

  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/settings");

  return { success: true };
}

/**
 * ワークアウトセッションを削除（論理削除）
 */
export async function deleteWorkoutSessionAction(id: number) {
  const validId = z.number().int().positive().parse(id);
  const userId = 1; // TODO: 認証実装後に動的取得

  await deleteWorkoutSession(userId, validId);

  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/settings");

  return { success: true };
}

// =============================================================================
// 後方互換性エイリアス（移行期間中のみ使用）
// =============================================================================

/**
 * @deprecated Use createWorkoutSessionAction instead
 */
export const createSessionPlanAction = createWorkoutSessionAction;

/**
 * @deprecated Use updateWorkoutSessionAction instead
 */
export const updateSessionPlanAction = updateWorkoutSessionAction;

/**
 * @deprecated Use deleteWorkoutSessionAction instead
 */
export const deleteSessionPlanAction = deleteWorkoutSessionAction;

/**
 * @deprecated Use WorkoutSessionExerciseInput instead
 */
export type SessionPlanExerciseInput = WorkoutSessionExerciseInput;

/**
 * @deprecated Use CreateWorkoutSessionInput instead
 */
export type CreateSessionPlanInput = CreateWorkoutSessionInput;

/**
 * @deprecated Use UpdateWorkoutSessionInput instead
 */
export type UpdateSessionPlanInput = UpdateWorkoutSessionInput;
