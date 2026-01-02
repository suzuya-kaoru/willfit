"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createWorkoutTemplate,
  deleteWorkoutTemplate,
  updateWorkoutTemplate,
} from "@/lib/db/queries";

// =============================================================================
// 入力型定義
// =============================================================================

export interface CreateTemplateInput {
  name: string;
  exerciseIds: number[];
}

export interface UpdateTemplateInput extends CreateTemplateInput {
  id: number;
}

// =============================================================================
// バリデーションスキーマ
// =============================================================================

const templateBaseSchema = z.object({
  name: z
    .string()
    .min(1, "テンプレート名は必須です")
    .max(100, "テンプレート名は100文字以内"),
  exerciseIds: z.array(z.number().int().positive()),
});

const createTemplateSchema = templateBaseSchema;

const updateTemplateSchema = templateBaseSchema.extend({
  id: z.number().int().positive("IDは正の整数"),
});

// =============================================================================
// Server Actions
// =============================================================================

export async function createTemplateAction(input: CreateTemplateInput) {
  const data = createTemplateSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  const template = await createWorkoutTemplate(userId, {
    name: data.name,
    exerciseIds: data.exerciseIds,
  });

  revalidatePath("/settings");
  return {
    id: Number(template.id),
    name: template.name,
  };
}

export async function updateTemplateAction(input: UpdateTemplateInput) {
  const data = updateTemplateSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  await updateWorkoutTemplate(userId, {
    id: data.id,
    name: data.name,
    exerciseIds: data.exerciseIds,
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function deleteTemplateAction(id: number) {
  const validId = z.number().int().positive().parse(id);
  const userId = 1; // TODO: 認証実装後に動的取得

  await deleteWorkoutTemplate(userId, validId);

  revalidatePath("/settings");
  return { success: true };
}

// =============================================================================
// 後方互換性エイリアス（移行期間中のみ使用）
// =============================================================================

/**
 * @deprecated Use createTemplateAction instead
 */
export const createMenuAction = createTemplateAction;

/**
 * @deprecated Use updateTemplateAction instead
 */
export const updateMenuAction = updateTemplateAction;

/**
 * @deprecated Use deleteTemplateAction instead
 */
export const deleteMenuAction = deleteTemplateAction;

/**
 * @deprecated Use CreateTemplateInput instead
 */
export type CreateMenuInput = CreateTemplateInput;

/**
 * @deprecated Use UpdateTemplateInput instead
 */
export type UpdateMenuInput = UpdateTemplateInput;
