"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

// 種目作成の入力型
export interface CreateExerciseInput {
  name: string;
  bodyPartIds: number[];
  formNote?: string;
  videoUrl?: string;
}

// 種目更新の入力型
export interface UpdateExerciseInput extends CreateExerciseInput {
  id: number;
}

export async function createExerciseAction(input: CreateExerciseInput) {
  const userId = 1;

  const exercise = await prisma.exercise.create({
    data: {
      userId: BigInt(userId),
      name: input.name,
      formNote: input.formNote || null,
      videoUrl: input.videoUrl || null,
      bodyParts: {
        create: input.bodyPartIds.map((bodyPartId) => ({
          bodyPartId: BigInt(bodyPartId),
        })),
      },
    },
  });

  revalidatePath("/settings");
  return { id: Number(exercise.id), name: exercise.name };
}

export async function updateExerciseAction(input: UpdateExerciseInput) {
  const userId = 1;
  const exerciseId = BigInt(input.id);

  await prisma.$transaction(async (tx) => {
    // 既存のbodyParts関連を削除
    await tx.exerciseBodyPart.deleteMany({
      where: { exerciseId },
    });

    // 種目を更新（bodyPartsも再作成）
    await tx.exercise.update({
      where: { id: exerciseId, userId: BigInt(userId) },
      data: {
        name: input.name,
        formNote: input.formNote || null,
        videoUrl: input.videoUrl || null,
        bodyParts: {
          create: input.bodyPartIds.map((bodyPartId) => ({
            bodyPartId: BigInt(bodyPartId),
          })),
        },
      },
    });
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function deleteExerciseAction(id: number) {
  const userId = 1;

  await prisma.exercise.update({
    where: { id: BigInt(id), userId: BigInt(userId) },
    data: { deletedAt: new Date() },
  });

  revalidatePath("/settings");
  return { success: true };
}
