"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";

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

  const menu = await prisma.workoutMenu.create({
    data: {
      userId: BigInt(userId),
      name: data.name,
      menuExercises: {
        create: data.exerciseIds.map((exerciseId, index) => ({
          exerciseId: BigInt(exerciseId),
          displayOrder: index + 1,
        })),
      },
    },
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
  const menuId = BigInt(data.id);

  await prisma.$transaction(async (tx) => {
    await tx.menuExercise.deleteMany({
      where: { menuId },
    });

    await tx.workoutMenu.update({
      where: { id: menuId, userId: BigInt(userId) },
      data: {
        name: data.name,
        menuExercises: {
          create: data.exerciseIds.map((exerciseId, index) => ({
            exerciseId: BigInt(exerciseId),
            displayOrder: index + 1,
          })),
        },
      },
    });
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function deleteMenuAction(id: number) {
  const validId = z.number().int().positive().parse(id);
  const userId = 1; // TODO: 認証実装後に動的取得

  await prisma.workoutMenu.update({
    where: { id: BigInt(validId), userId: BigInt(userId) },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/settings");
  return { success: true };
}
