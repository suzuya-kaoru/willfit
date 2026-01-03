/**
 * WorkoutRecord DAL
 * ワークアウト記録のCRUD操作
 */
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type {
  ExerciseWithBodyParts,
  WorkoutRecord,
  WorkoutRecordExercise,
  WorkoutRecordSet,
} from "@/lib/types";
import { mapExerciseWithBodyParts } from "./_internal/exercise.mapper";
import { toBigInt, toBigIntArray, toSafeNumber } from "./_internal/helpers";
import {
  mapWorkoutRecord,
  mapWorkoutRecordExercise,
  mapWorkoutRecordSet,
} from "./_internal/workout-record.mapper";

// =============================================================================
// Types
// =============================================================================

/**
 * トレーニング記録詳細（種目・セット情報含む）
 */
export interface WorkoutRecordWithDetails extends WorkoutRecord {
  template: {
    id: number;
    name: string;
  };
  workoutRecordExercises: {
    id: number;
    exerciseId: number;
    exercise: ExerciseWithBodyParts;
    sets: WorkoutRecordSet[];
  }[];
}

export interface SaveWorkoutRecordParams {
  templateId: number;
  workoutSessionId?: number;
  scheduledTaskId?: number;
  startedAt: Date;
  endedAt: Date;
  condition: number;
  fatigue: number;
  note: string;
  exercises: {
    exerciseId: number;
    sets: {
      setNumber: number;
      weight: number;
      reps: number;
      completed: boolean;
      note?: string;
    }[];
  }[];
}

export interface UpdateWorkoutRecordParams {
  recordId: number;
  endedAt: Date;
  condition: number;
  fatigue: number;
  note: string;
  exercises: {
    exerciseId: number;
    sets: {
      setNumber: number;
      weight: number;
      reps: number;
      completed: boolean;
      note?: string;
    }[];
  }[];
}

// =============================================================================
// Query Functions
// =============================================================================

/**
 * 期間内のワークアウト記録を取得
 */
export async function getWorkoutRecordsByDateRange(
  userId: number,
  startDate: Date,
  endDate: Date,
): Promise<WorkoutRecord[]> {
  const rows = await prisma.workoutRecord.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      startedAt: { gte: startDate, lte: endDate },
    },
    orderBy: { startedAt: "desc" },
  });
  return rows.map(mapWorkoutRecord);
}

/**
 * 月間の統計情報を取得
 */
export async function getMonthlyStats(
  userId: number,
  year: number,
  month: number,
): Promise<{ totalVolume: number; workoutCount: number }> {
  // 月初と月末を計算
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  // 指定期間のセッションを取得
  const records = await prisma.workoutRecord.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      startedAt: { gte: startDate, lte: endDate },
    },
    select: { id: true },
  });

  const recordIds = records.map((s: { id: bigint }) => s.id);

  if (recordIds.length === 0) {
    return { totalVolume: 0, workoutCount: 0 };
  }

  // 期間内のセット情報を取得してボリュームを計算
  const workoutRecordSets = await prisma.workoutRecordSet.findMany({
    where: {
      workoutRecordExercise: {
        recordId: { in: recordIds },
      },
      completed: true,
    },
    select: {
      weight: true,
      reps: true,
    },
  });

  // 総重量計算 (kg * reps)
  const totalVolume = workoutRecordSets.reduce(
    (sum: number, set: { weight: Prisma.Decimal; reps: number }) => {
      return sum + set.weight.toNumber() * set.reps;
    },
    0,
  );

  return {
    totalVolume,
    workoutCount: recordIds.length,
  };
}

/**
 * 指定テンプレートのワークアウト記録を取得
 */
export async function getWorkoutRecordsByTemplateIds(
  userId: number,
  templateIds: number[],
): Promise<WorkoutRecord[]> {
  if (templateIds.length === 0) return [];
  const rows = await prisma.workoutRecord.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      templateId: { in: toBigIntArray(templateIds, "templateIds") },
    },
    orderBy: { startedAt: "desc" },
  });
  return rows.map(mapWorkoutRecord);
}

/**
 * ユーザーの全ワークアウト記録を取得
 */
export async function getWorkoutRecords(
  userId: number,
): Promise<WorkoutRecord[]> {
  const rows = await prisma.workoutRecord.findMany({
    where: { userId: toBigInt(userId, "userId") },
    orderBy: { startedAt: "desc" },
  });
  return rows.map(mapWorkoutRecord);
}

/**
 * 指定記録IDの種目一覧を取得
 */
export async function getWorkoutRecordExercisesByRecordIds(
  recordIds: number[],
): Promise<WorkoutRecordExercise[]> {
  if (recordIds.length === 0) return [];
  const rows = await prisma.workoutRecordExercise.findMany({
    where: { recordId: { in: toBigIntArray(recordIds, "recordIds") } },
  });
  return rows.map(mapWorkoutRecordExercise);
}

/**
 * 指定ワークアウト実施種目IDのセット一覧を取得
 */
export async function getWorkoutRecordSetsByRecordExerciseIds(
  workoutRecordExerciseIds: number[],
): Promise<WorkoutRecordSet[]> {
  if (workoutRecordExerciseIds.length === 0) return [];
  const rows = await prisma.workoutRecordSet.findMany({
    where: {
      workoutRecordExerciseId: {
        in: toBigIntArray(workoutRecordExerciseIds, "workoutRecordExerciseIds"),
      },
    },
    orderBy: [{ workoutRecordExerciseId: "asc" }, { setNumber: "asc" }],
  });
  return rows.map(mapWorkoutRecordSet);
}

/**
 * ワークアウト記録詳細を取得（種目・セット情報含む）
 */
export async function getWorkoutRecordWithDetails(
  userId: number,
  recordId: number,
): Promise<WorkoutRecordWithDetails | null> {
  const row = await prisma.workoutRecord.findFirst({
    where: {
      id: toBigInt(recordId, "recordId"),
      userId: toBigInt(userId, "userId"),
    },
    include: {
      template: true,
      workoutRecordExercises: {
        include: {
          exercise: {
            include: {
              bodyParts: {
                include: { bodyPart: true },
                orderBy: { bodyPart: { displayOrder: "asc" } },
              },
            },
          },
          workoutRecordSets: {
            orderBy: { setNumber: "asc" },
          },
        },
      },
    },
  });

  if (!row) return null;

  return {
    ...mapWorkoutRecord(row),
    template: {
      id: toSafeNumber(row.template.id, "workout_templates.id"),
      name: row.template.name,
    },
    // biome-ignore lint/suspicious/noExplicitAny: implicit any from prisma inference
    workoutRecordExercises: row.workoutRecordExercises.map((er: any) => ({
      id: toSafeNumber(er.id, "workout_record_exercises.id"),
      exerciseId: toSafeNumber(
        er.exerciseId,
        "workout_record_exercises.exercise_id",
      ),
      exercise: mapExerciseWithBodyParts(er.exercise),
      sets: er.workoutRecordSets.map(mapWorkoutRecordSet),
    })),
  };
}

// =============================================================================
// Mutation Functions
// =============================================================================

/**
 * ワークアウト記録を作成
 */
export async function createWorkoutRecord(
  userId: number,
  params: SaveWorkoutRecordParams,
) {
  const {
    templateId,
    workoutSessionId,
    scheduledTaskId,
    startedAt,
    endedAt,
    condition,
    fatigue,
    note,
    exercises,
  } = params;

  const userBigId = toBigInt(userId, "userId");

  return await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const newRecord = await tx.workoutRecord.create({
      data: {
        userId: userBigId,
        templateId: toBigInt(templateId, "templateId"),
        workoutSessionId: workoutSessionId
          ? toBigInt(workoutSessionId, "workoutSessionId")
          : null,
        scheduledTaskId: scheduledTaskId
          ? toBigInt(scheduledTaskId, "scheduledTaskId")
          : null,
        startedAt,
        endedAt,
        condition,
        fatigue,
        note,
        workoutRecordExercises: {
          create: exercises.map((ex) => ({
            exerciseId: toBigInt(ex.exerciseId, "exerciseId"),
            workoutRecordSets: {
              create: ex.sets.map((set) => ({
                setNumber: set.setNumber,
                weight: set.weight,
                reps: set.reps,
                completed: set.completed,
                note: set.note,
              })),
            },
          })),
        },
      },
    });

    if (scheduledTaskId) {
      await tx.scheduledTask.update({
        where: {
          id: toBigInt(scheduledTaskId, "scheduledTaskId"),
          userId: userBigId,
        },
        data: {
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    return newRecord;
  });
}

/**
 * ワークアウト記録を更新
 */
export async function updateWorkoutRecord(
  userId: number,
  params: UpdateWorkoutRecordParams,
) {
  const { recordId, endedAt, condition, fatigue, note, exercises } = params;
  const recordBigId = toBigInt(recordId, "recordId");
  const userBigId = toBigInt(userId, "userId");

  await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    const existingRecord = await tx.workoutRecord.findFirst({
      where: {
        id: recordBigId,
        userId: userBigId,
      },
    });

    if (!existingRecord) {
      throw new Error("記録が見つかりません");
    }

    await tx.workoutRecordExercise.deleteMany({
      where: { recordId: recordBigId },
    });

    await tx.workoutRecord.update({
      where: { id: recordBigId },
      data: {
        endedAt,
        condition,
        fatigue,
        note,
        workoutRecordExercises: {
          create: exercises.map((ex) => ({
            exerciseId: toBigInt(ex.exerciseId, "exerciseId"),
            workoutRecordSets: {
              create: ex.sets.map((set) => ({
                setNumber: set.setNumber,
                weight: set.weight,
                reps: set.reps,
                completed: set.completed,
                note: set.note,
              })),
            },
          })),
        },
      },
    });
  });
}
