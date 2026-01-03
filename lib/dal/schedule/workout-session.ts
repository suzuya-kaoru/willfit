/**
 * WorkoutSession DAL
 * ワークアウトセッションのCRUD操作
 */
import { prisma } from "@/lib/db/prisma";
import type {
  WorkoutSession,
  WorkoutSessionWithExercises,
  WorkoutSessionWithRules,
} from "@/lib/types";
import { toBigInt } from "../_internal/helpers";
import {
  mapScheduleReminder,
  mapScheduleRule,
  mapWorkoutSession,
  mapWorkoutSessionWithExercises,
} from "../_internal/mappers";

/**
 * ワークアウトセッションを作成
 */
export async function createWorkoutSession(input: {
  userId: number;
  templateId: number;
  name: string;
  description?: string;
  exercises: {
    exerciseId: number;
    displayOrder: number;
    targetWeight?: number;
    targetReps?: number;
    targetSets?: number;
    restSeconds?: number;
    note?: string;
  }[];
}): Promise<WorkoutSession> {
  const row = await prisma.workoutSession.create({
    data: {
      userId: toBigInt(input.userId, "userId"),
      templateId: toBigInt(input.templateId, "templateId"),
      name: input.name,
      description: input.description,
      exercises: {
        create: input.exercises.map((ex) => ({
          exerciseId: toBigInt(ex.exerciseId, "exerciseId"),
          displayOrder: ex.displayOrder,
          targetWeight: ex.targetWeight,
          targetReps: ex.targetReps,
          targetSets: ex.targetSets,
          restSeconds: ex.restSeconds,
          note: ex.note,
        })),
      },
    },
  });
  return mapWorkoutSession(row);
}

/**
 * ワークアウトセッション一覧を取得（削除済み除く）
 */
export async function getWorkoutSessions(
  userId: number,
): Promise<WorkoutSessionWithExercises[]> {
  const rows = await prisma.workoutSession.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      deletedAt: null,
    },
    include: {
      template: true,
      exercises: {
        include: {
          exercise: {
            include: {
              bodyParts: {
                include: { bodyPart: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapWorkoutSessionWithExercises);
}

/**
 * ワークアウトセッションを取得（種目・ルール・リマインダー付き）
 */
export async function getWorkoutSessionWithDetails(
  userId: number,
  workoutSessionId: number,
): Promise<WorkoutSessionWithRules | null> {
  const row = await prisma.workoutSession.findFirst({
    where: {
      id: toBigInt(workoutSessionId, "workoutSessionId"),
      userId: toBigInt(userId, "userId"),
      deletedAt: null,
    },
    include: {
      template: true,
      exercises: {
        include: {
          exercise: {
            include: {
              bodyParts: {
                include: { bodyPart: true },
              },
            },
          },
        },
      },
      scheduleRules: {
        where: { deletedAt: null },
      },
      reminders: true,
    },
  });
  if (!row) return null;
  return {
    ...mapWorkoutSessionWithExercises(row),
    scheduleRules: row.scheduleRules.map(mapScheduleRule),
    reminders: row.reminders.map(mapScheduleReminder),
  };
}

/**
 * ワークアウトセッションを更新
 */
export async function updateWorkoutSession(input: {
  workoutSessionId: number;
  userId: number;
  name?: string;
  description?: string;
  exercises?: {
    exerciseId: number;
    displayOrder: number;
    targetWeight?: number;
    targetReps?: number;
    targetSets?: number;
    restSeconds?: number;
    note?: string;
  }[];
}): Promise<WorkoutSession> {
  const row = await prisma.$transaction(async (tx) => {
    // 種目の更新がある場合は削除して再作成
    if (input.exercises) {
      await tx.workoutSessionExercise.deleteMany({
        where: {
          workoutSessionId: toBigInt(
            input.workoutSessionId,
            "workoutSessionId",
          ),
        },
      });
    }

    return tx.workoutSession.update({
      where: { id: toBigInt(input.workoutSessionId, "workoutSessionId") },
      data: {
        name: input.name,
        description: input.description,
        exercises: input.exercises
          ? {
              create: input.exercises.map((ex) => ({
                exerciseId: toBigInt(ex.exerciseId, "exerciseId"),
                displayOrder: ex.displayOrder,
                targetWeight: ex.targetWeight,
                targetReps: ex.targetReps,
                targetSets: ex.targetSets,
                restSeconds: ex.restSeconds,
                note: ex.note,
              })),
            }
          : undefined,
      },
    });
  });
  return mapWorkoutSession(row);
}

/**
 * ワークアウトセッションを論理削除
 */
export async function deleteWorkoutSession(
  _userId: number,
  workoutSessionId: number,
): Promise<void> {
  await prisma.workoutSession.update({
    where: { id: toBigInt(workoutSessionId, "workoutSessionId") },
    data: { deletedAt: new Date() },
  });
}
