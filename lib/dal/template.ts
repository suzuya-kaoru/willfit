/**
 * Template DAL
 * ワークアウトテンプレートのCRUD操作
 */
import { prisma } from "@/lib/db/prisma";
import type {
  TemplateExercise,
  WorkoutTemplate,
  WorkoutTemplateWithExercises,
} from "@/lib/types";
import { toBigInt, toBigIntArray } from "./_internal/helpers";
import {
  mapTemplate,
  mapTemplateExercise,
  mapTemplateWithExercises,
} from "./_internal/template.mapper";

// =============================================================================
// Query Functions
// =============================================================================

/**
 * 指定テンプレートを取得（種目情報付き）
 */
export async function getTemplateWithExercises(
  userId: number,
  templateId: number,
): Promise<WorkoutTemplateWithExercises | null> {
  const template = await prisma.workoutTemplate.findFirst({
    where: {
      id: toBigInt(templateId, "templateId"),
      userId: toBigInt(userId, "userId"),
      deletedAt: null,
    },
    include: {
      templateExercises: {
        where: { exercise: { deletedAt: null } },
        orderBy: { displayOrder: "asc" },
        include: {
          exercise: {
            include: {
              bodyParts: {
                include: { bodyPart: true },
                orderBy: { bodyPart: { displayOrder: "asc" } },
              },
            },
          },
        },
      },
    },
  });

  if (!template) return null;
  return mapTemplateWithExercises(template);
}

/**
 * ユーザーの全テンプレートを取得（種目情報付き）
 */
export async function getTemplatesWithExercises(
  userId: number,
): Promise<WorkoutTemplateWithExercises[]> {
  const rows = await prisma.workoutTemplate.findMany({
    where: { userId: toBigInt(userId, "userId"), deletedAt: null },
    orderBy: { createdAt: "asc" },
    include: {
      templateExercises: {
        where: { exercise: { deletedAt: null } },
        orderBy: { displayOrder: "asc" },
        include: {
          exercise: {
            include: {
              bodyParts: {
                include: { bodyPart: true },
                orderBy: { bodyPart: { displayOrder: "asc" } },
              },
            },
          },
        },
      },
    },
  });

  return rows.map(mapTemplateWithExercises);
}

/**
 * ユーザーの全テンプレートを取得（基本情報のみ）
 */
export async function getTemplates(userId: number): Promise<WorkoutTemplate[]> {
  const rows = await prisma.workoutTemplate.findMany({
    where: { userId: toBigInt(userId, "userId"), deletedAt: null },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapTemplate);
}

/**
 * 指定IDのテンプレートを取得
 */
export async function getTemplatesByIds(
  userId: number,
  templateIds: number[],
): Promise<WorkoutTemplate[]> {
  if (templateIds.length === 0) return [];
  const rows = await prisma.workoutTemplate.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      deletedAt: null,
      id: { in: toBigIntArray(templateIds, "templateIds") },
    },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapTemplate);
}

/**
 * 指定テンプレートIDの種目一覧を取得
 */
export async function getTemplateExercisesByTemplateIds(
  templateIds: number[],
): Promise<TemplateExercise[]> {
  if (templateIds.length === 0) return [];
  const rows = await prisma.templateExercise.findMany({
    where: { templateId: { in: toBigIntArray(templateIds, "templateIds") } },
    orderBy: [{ templateId: "asc" }, { displayOrder: "asc" }],
  });
  return rows.map(mapTemplateExercise);
}

// =============================================================================
// Mutation Types
// =============================================================================

export interface CreateTemplateParams {
  name: string;
  exerciseIds: number[];
}

export interface UpdateTemplateParams extends CreateTemplateParams {
  id: number;
}

// =============================================================================
// Mutation Functions
// =============================================================================

/**
 * テンプレートを作成
 */
export async function createWorkoutTemplate(
  userId: number,
  params: CreateTemplateParams,
) {
  const { name, exerciseIds } = params;
  return await prisma.workoutTemplate.create({
    data: {
      userId: toBigInt(userId, "userId"),
      name,
      templateExercises: {
        create: exerciseIds.map((exerciseId, index) => ({
          exerciseId: toBigInt(exerciseId, "exerciseId"),
          displayOrder: index + 1,
        })),
      },
    },
  });
}

/**
 * テンプレートを更新
 */
export async function updateWorkoutTemplate(
  userId: number,
  params: UpdateTemplateParams,
) {
  const { id, name, exerciseIds } = params;
  const templateId = toBigInt(id, "templateId");

  await prisma.$transaction(async (tx) => {
    await tx.templateExercise.deleteMany({
      where: { templateId },
    });

    await tx.workoutTemplate.update({
      where: { id: templateId, userId: toBigInt(userId, "userId") },
      data: {
        name,
        templateExercises: {
          create: exerciseIds.map((exerciseId, index) => ({
            exerciseId: toBigInt(exerciseId, "exerciseId"),
            displayOrder: index + 1,
          })),
        },
      },
    });
  });
}

/**
 * テンプレートを論理削除
 */
export async function deleteWorkoutTemplate(
  userId: number,
  templateId: number,
) {
  await prisma.workoutTemplate.update({
    where: {
      id: toBigInt(templateId, "templateId"),
      userId: toBigInt(userId, "userId"),
    },
    data: { deletedAt: new Date() },
  });
}
