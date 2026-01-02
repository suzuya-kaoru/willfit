"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createSessionPlan,
  deleteSessionPlan,
  updateSessionPlan,
} from "@/lib/db/queries";

// =============================================================================
// 入力型定義
// =============================================================================

export interface SessionPlanExerciseInput {
  exerciseId: number;
  displayOrder: number;
  targetWeight?: number;
  targetReps?: number;
  targetSets?: number;
  restSeconds?: number;
  note?: string;
}

export interface CreateSessionPlanInput {
  menuId: number;
  name: string;
  description?: string;
  exercises: SessionPlanExerciseInput[];
}

export interface UpdateSessionPlanInput {
  id: number;
  name: string;
  description?: string;
  exercises: SessionPlanExerciseInput[];
}

// =============================================================================
// バリデーションスキーマ
// =============================================================================

const sessionPlanExerciseSchema = z.object({
  exerciseId: z.number().int().positive("種目IDは正の整数"),
  displayOrder: z.number().int().min(1, "表示順は1以上"),
  targetWeight: z.number().min(0, "重量は0以上").optional(),
  targetReps: z.number().int().min(1, "回数は1以上").optional(),
  targetSets: z.number().int().min(1, "セット数は1以上").optional(),
  restSeconds: z.number().int().min(0, "休憩時間は0以上").optional(),
  note: z.string().max(500, "メモは500文字以内").optional(),
});

const createSessionPlanSchema = z.object({
  menuId: z.number().int().positive("テンプレIDは正の整数"),
  name: z
    .string()
    .min(1, "セッション名は必須です")
    .max(100, "セッション名は100文字以内"),
  description: z.string().max(1000, "説明は1000文字以内").optional(),
  exercises: z
    .array(sessionPlanExerciseSchema)
    .min(1, "種目を1つ以上追加してください"),
});

const updateSessionPlanSchema = z.object({
  id: z.number().int().positive("IDは正の整数"),
  name: z
    .string()
    .min(1, "セッション名は必須です")
    .max(100, "セッション名は100文字以内"),
  description: z.string().max(1000, "説明は1000文字以内").optional(),
  exercises: z
    .array(sessionPlanExerciseSchema)
    .min(1, "種目を1つ以上追加してください"),
});

// =============================================================================
// Server Actions
// =============================================================================

/**
 * セッションプランを作成
 */
export async function createSessionPlanAction(input: CreateSessionPlanInput) {
  const data = createSessionPlanSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  const plan = await createSessionPlan({
    userId,
    menuId: data.menuId,
    name: data.name,
    description: data.description,
    exercises: data.exercises,
  });

  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/settings");

  return { id: plan.id, name: plan.name };
}

/**
 * セッションプランを更新
 */
export async function updateSessionPlanAction(input: UpdateSessionPlanInput) {
  const data = updateSessionPlanSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  await updateSessionPlan({
    sessionPlanId: data.id,
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
 * セッションプランを削除（論理削除）
 */
export async function deleteSessionPlanAction(id: number) {
  const validId = z.number().int().positive().parse(id);
  const userId = 1; // TODO: 認証実装後に動的取得

  await deleteSessionPlan(userId, validId);

  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/settings");

  return { success: true };
}
