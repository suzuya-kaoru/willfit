"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  createWorkoutMenu,
  deleteWorkoutMenu,
  updateWorkoutMenu,
} from "@/lib/db/queries";

// =============================================================================
// 入力型定義
// =============================================================================

export interface CreateMenuInput {
  name: string;
  exerciseIds: number[];
}

export interface UpdateMenuInput extends CreateMenuInput {
  id: number;
}

// =============================================================================
// バリデーションスキーマ
// =============================================================================

const menuBaseSchema = z.object({
  name: z
    .string()
    .min(1, "メニュー名は必須です")
    .max(100, "メニュー名は100文字以内"),
  exerciseIds: z.array(z.number().int().positive()),
});

const createMenuSchema = menuBaseSchema;

const updateMenuSchema = menuBaseSchema.extend({
  id: z.number().int().positive("IDは正の整数"),
});

// =============================================================================
// Server Actions
// =============================================================================

export async function createMenuAction(input: CreateMenuInput) {
  const data = createMenuSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  const menu = await createWorkoutMenu(userId, {
    name: data.name,
    exerciseIds: data.exerciseIds,
  });

  revalidatePath("/settings");
  return {
    id: Number(menu.id),
    name: menu.name,
  };
}

export async function updateMenuAction(input: UpdateMenuInput) {
  const data = updateMenuSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  await updateWorkoutMenu(userId, {
    id: data.id,
    name: data.name,
    exerciseIds: data.exerciseIds,
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function deleteMenuAction(id: number) {
  const validId = z.number().int().positive().parse(id);
  const userId = 1; // TODO: 認証実装後に動的取得

  await deleteWorkoutMenu(userId, validId);

  revalidatePath("/settings");
  return { success: true };
}
