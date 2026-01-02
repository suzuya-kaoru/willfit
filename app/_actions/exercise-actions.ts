"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createExercise,
  deleteExercise,
  updateExercise,
} from "@/lib/db/queries";

// =============================================================================
// 入力型定義
// =============================================================================

export interface CreateExerciseInput {
  name: string;
  bodyPartIds: number[];
  formNote?: string;
  videoUrl?: string;
}

export interface UpdateExerciseInput extends CreateExerciseInput {
  id: number;
}

// =============================================================================
// バリデーションスキーマ
// =============================================================================

const exerciseBaseSchema = z.object({
  name: z.string().min(1, "種目名は必須です").max(100, "種目名は100文字以内"),
  bodyPartIds: z.array(z.number().int().positive()).min(1, "部位を1つ以上選択"),
  formNote: z.string().max(1000).optional(),
  videoUrl: z.string().url("有効なURLを入力").optional().or(z.literal("")),
});

const createExerciseSchema = exerciseBaseSchema;

const updateExerciseSchema = exerciseBaseSchema.extend({
  id: z.number().int().positive("IDは正の整数"),
});

// =============================================================================
// Server Actions
// =============================================================================

export async function createExerciseAction(input: CreateExerciseInput) {
  const data = createExerciseSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  const exercise = await createExercise(userId, {
    name: data.name,
    bodyPartIds: data.bodyPartIds,
    formNote: data.formNote || undefined,
    videoUrl: data.videoUrl || undefined,
  });

  revalidatePath("/settings");
  return { id: Number(exercise.id), name: exercise.name };
}

export async function updateExerciseAction(input: UpdateExerciseInput) {
  const data = updateExerciseSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  await updateExercise(userId, {
    id: data.id,
    name: data.name,
    bodyPartIds: data.bodyPartIds,
    formNote: data.formNote || undefined,
    videoUrl: data.videoUrl || undefined,
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function deleteExerciseAction(id: number) {
  const validId = z.number().int().positive().parse(id);
  const userId = 1; // TODO: 認証実装後に動的取得

  await deleteExercise(userId, validId);

  revalidatePath("/settings");
  return { success: true };
}
