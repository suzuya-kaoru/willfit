/**
 * ScheduledTask DAL
 * スケジュールタスクのCRUD操作
 */

import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import { toUtcDateOnly } from "@/lib/timezone";
import type {
  ScheduledTask,
  ScheduledTaskStatus,
  ScheduledTaskWithSession,
} from "@/lib/types";
import { toBigInt } from "../_internal/helpers";
import {
  mapScheduledTask,
  mapScheduledTaskWithSession,
} from "../_internal/schedule.mapper";

// =============================================================================
// Query Functions
// =============================================================================

/**
 * 期間内のスケジュールタスクを取得
 */
export async function getScheduledTasksByDateRange(
  userId: number,
  fromDate: Date,
  toDate: Date,
): Promise<ScheduledTask[]> {
  const rows = await prisma.scheduledTask.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      scheduledDate: {
        gte: toUtcDateOnly(fromDate),
        lte: toUtcDateOnly(toDate),
      },
    },
    orderBy: { scheduledDate: "asc" },
  });
  return rows.map(mapScheduledTask);
}

/**
 * 期間内のスケジュールタスクを取得（セッション情報付き）
 */
export async function getScheduledTasksWithSessionByDateRange(
  userId: number,
  fromDate: Date,
  toDate: Date,
): Promise<ScheduledTaskWithSession[]> {
  const rows = await prisma.scheduledTask.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      scheduledDate: {
        gte: toUtcDateOnly(fromDate),
        lte: toUtcDateOnly(toDate),
      },
    },
    include: {
      workoutSession: {
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
      },
      rule: true,
    },
    orderBy: { scheduledDate: "asc" },
  });
  return rows.map(mapScheduledTaskWithSession);
}

// =============================================================================
// Mutation Functions
// =============================================================================

/**
 * スケジュールタスクを作成
 */
export async function createScheduledTask(input: {
  userId: number;
  ruleId?: number;
  workoutSessionId: number;
  scheduledDate: Date;
}): Promise<ScheduledTask> {
  const row = await prisma.scheduledTask.create({
    data: {
      userId: toBigInt(input.userId, "userId"),
      ruleId: input.ruleId ? toBigInt(input.ruleId, "ruleId") : null,
      workoutSessionId: toBigInt(input.workoutSessionId, "workoutSessionId"),
      scheduledDate: toUtcDateOnly(input.scheduledDate),
      status: "pending",
    },
  });
  return mapScheduledTask(row);
}

/**
 * スケジュールタスクのステータスを更新
 */
export async function updateScheduledTaskStatus(input: {
  userId: number;
  taskId: number;
  status: ScheduledTaskStatus;
  completedAt?: Date;
}): Promise<ScheduledTask> {
  const result = await prisma.scheduledTask.updateMany({
    where: {
      id: toBigInt(input.taskId, "taskId"),
      userId: toBigInt(input.userId, "userId"),
    },
    data: {
      status: input.status,
      completedAt: input.completedAt,
    },
  });
  if (result.count === 0) {
    throw new Error("タスクが見つかりません");
  }
  // 更新後のデータを取得
  const row = await prisma.scheduledTask.findUnique({
    where: { id: toBigInt(input.taskId, "taskId") },
  });
  if (!row) throw new Error("タスクが見つかりません");
  return mapScheduledTask(row);
}

/**
 * スケジュールタスクを振替
 */
export async function rescheduleTask(input: {
  userId: number;
  taskId: number;
  toDate: Date;
}): Promise<{ originalTask: ScheduledTask; newTask: ScheduledTask }> {
  const userBigId = toBigInt(input.userId, "userId");
  const taskBigId = toBigInt(input.taskId, "taskId");

  const result = await prisma.$transaction(
    async (tx: Prisma.TransactionClient) => {
      // 元のタスクを取得（userId スコープ付き）
      const original = await tx.scheduledTask.findFirst({
        where: { id: taskBigId, userId: userBigId },
      });
      if (!original) throw new Error("タスクが見つかりません");

      // 元のタスクを振替済みに更新
      const updatedOriginal = await tx.scheduledTask.update({
        where: { id: taskBigId },
        data: {
          status: "rescheduled",
          rescheduledTo: toUtcDateOnly(input.toDate),
        },
      });

      // 新しいタスクを作成
      const newTask = await tx.scheduledTask.create({
        data: {
          userId: original.userId,
          ruleId: original.ruleId,
          workoutSessionId: original.workoutSessionId,
          scheduledDate: toUtcDateOnly(input.toDate),
          status: "pending",
          rescheduledFrom: original.scheduledDate,
        },
      });

      return {
        originalTask: mapScheduledTask(updatedOriginal),
        newTask: mapScheduledTask(newTask),
      };
    },
  );
  return result;
}

/**
 * 日付とワークアウトセッションでタスクを取得または作成
 */
export async function upsertScheduledTask(input: {
  userId: number;
  workoutSessionId: number;
  scheduledDate: Date;
  status: ScheduledTaskStatus;
  completedAt?: Date;
}): Promise<ScheduledTask> {
  const row = await prisma.scheduledTask.upsert({
    where: {
      userId_workoutSessionId_scheduledDate: {
        userId: toBigInt(input.userId, "userId"),
        workoutSessionId: toBigInt(input.workoutSessionId, "workoutSessionId"),
        scheduledDate: toUtcDateOnly(input.scheduledDate),
      },
    },
    create: {
      userId: toBigInt(input.userId, "userId"),
      workoutSessionId: toBigInt(input.workoutSessionId, "workoutSessionId"),
      scheduledDate: toUtcDateOnly(input.scheduledDate),
      status: input.status,
      completedAt: input.completedAt,
    },
    update: {
      status: input.status,
      completedAt: input.completedAt,
    },
  });
  return mapScheduledTask(row);
}

/**
 * スケジュールタスクを削除
 */
export async function deleteScheduledTask(userId: number, taskId: number) {
  const id = toBigInt(taskId, "taskId");
  const userBigId = toBigInt(userId, "userId");

  const task = await prisma.scheduledTask.findFirst({
    where: { id, userId: userBigId },
  });

  if (!task) {
    throw new Error("タスクが見つかりません");
  }
  if (task.status !== "pending") {
    throw new Error("完了済みまたはスキップ済みのタスクは削除できません");
  }

  await prisma.scheduledTask.delete({
    where: { id },
  });
}
