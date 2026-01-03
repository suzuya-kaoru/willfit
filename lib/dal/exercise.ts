/**
 * Exercise DAL
 * 種目のCRUD操作
 */
import { prisma } from "@/lib/db/prisma";
import type { ExerciseWithBodyParts } from "@/lib/types";
import { toBigInt, toBigIntArray } from "./_internal/helpers";
import { mapExerciseWithBodyParts } from "./_internal/mappers";

// =============================================================================
// Query Functions
// =============================================================================

/**
 * ユーザーの全種目を取得（部位情報付き）
 */
export async function getExercisesWithBodyParts(
  userId: number,
): Promise<ExerciseWithBodyParts[]> {
  const userIdBig = toBigInt(userId, "userId");
  const rows = await prisma.exercise.findMany({
    where: { userId: userIdBig, deletedAt: null },
    orderBy: { id: "asc" },
    include: {
      bodyParts: {
        include: { bodyPart: true },
        orderBy: { bodyPart: { displayOrder: "asc" } },
      },
    },
  });

  return rows.map(mapExerciseWithBodyParts);
}

/**
 * 指定IDの種目を取得（部位情報付き）
 */
export async function getExercisesWithBodyPartsByIds(
  userId: number,
  exerciseIds: number[],
): Promise<ExerciseWithBodyParts[]> {
  if (exerciseIds.length === 0) return [];
  const userIdBig = toBigInt(userId, "userId");
  const exerciseIdList = toBigIntArray(exerciseIds, "exerciseIds");

  const rows = await prisma.exercise.findMany({
    where: {
      userId: userIdBig,
      deletedAt: null,
      id: { in: exerciseIdList },
    },
    orderBy: { id: "asc" },
    include: {
      bodyParts: {
        include: { bodyPart: true },
        orderBy: { bodyPart: { displayOrder: "asc" } },
      },
    },
  });

  return rows.map(mapExerciseWithBodyParts);
}

// =============================================================================
// Mutation Types
// =============================================================================

export interface CreateExerciseParams {
  name: string;
  bodyPartIds: number[];
  formNote?: string;
  videoUrl?: string;
}

export interface UpdateExerciseParams extends CreateExerciseParams {
  id: number;
}

// =============================================================================
// Mutation Functions
// =============================================================================

/**
 * 種目を作成
 */
export async function createExercise(
  userId: number,
  params: CreateExerciseParams,
) {
  const { name, bodyPartIds, formNote, videoUrl } = params;
  return await prisma.exercise.create({
    data: {
      userId: toBigInt(userId, "userId"),
      name,
      formNote: formNote || null,
      videoUrl: videoUrl || null,
      bodyParts: {
        create: bodyPartIds.map((bodyPartId) => ({
          bodyPartId: toBigInt(bodyPartId, "bodyPartId"),
        })),
      },
    },
  });
}

/**
 * 種目を更新
 */
export async function updateExercise(
  userId: number,
  params: UpdateExerciseParams,
) {
  const { id, name, bodyPartIds, formNote, videoUrl } = params;
  const exerciseId = toBigInt(id, "exerciseId");
  const userBigId = toBigInt(userId, "userId");

  await prisma.$transaction(async (tx) => {
    // 関連BodyPartを一旦削除
    await tx.exerciseBodyPart.deleteMany({
      where: { exerciseId },
    });

    // 本体更新とBodyPart再作成
    await tx.exercise.update({
      where: { id: exerciseId, userId: userBigId },
      data: {
        name,
        formNote: formNote || null,
        videoUrl: videoUrl || null,
        bodyParts: {
          create: bodyPartIds.map((bodyPartId) => ({
            bodyPartId: toBigInt(bodyPartId, "bodyPartId"),
          })),
        },
      },
    });
  });
}

/**
 * 種目を論理削除
 */
export async function deleteExercise(userId: number, exerciseId: number) {
  await prisma.exercise.update({
    where: {
      id: toBigInt(exerciseId, "exerciseId"),
      userId: toBigInt(userId, "userId"),
    },
    data: { deletedAt: new Date() },
  });
}
