/**
 * Scheduler Internal DAL
 * スケジューラエンジン/Worker専用の内部関数
 * UIやAPIからは直接使用しないこと
 */
import { prisma } from "@/lib/db/prisma";
import { toUtcDateOnly } from "@/lib/timezone";
import type { ScheduledTask } from "@/lib/types";
import { toBigInt } from "../_internal/helpers";
import { mapScheduledTask } from "../_internal/mappers";

/**
 * 既存のスケジュールタスクを検索（冪等性チェック用）
 */
export async function findScheduledTask(
  userId: number,
  workoutSessionId: number,
  scheduledDate: Date,
): Promise<ScheduledTask | null> {
  const row = await prisma.scheduledTask.findUnique({
    where: {
      userId_workoutSessionId_scheduledDate: {
        userId: toBigInt(userId, "userId"),
        workoutSessionId: toBigInt(workoutSessionId, "workoutSessionId"),
        scheduledDate: toUtcDateOnly(scheduledDate),
      },
    },
  });
  return row ? mapScheduledTask(row) : null;
}

/**
 * スケジュールタスクを直接作成（scheduler用）
 */
export async function createScheduledTaskRaw(data: {
  userId: number;
  ruleId: number;
  workoutSessionId: number;
  scheduledDate: Date;
  status: "pending";
}): Promise<ScheduledTask> {
  const row = await prisma.scheduledTask.create({
    data: {
      userId: toBigInt(data.userId, "userId"),
      ruleId: toBigInt(data.ruleId, "ruleId"),
      workoutSessionId: toBigInt(data.workoutSessionId, "workoutSessionId"),
      scheduledDate: toUtcDateOnly(data.scheduledDate),
      status: data.status,
    },
  });
  return mapScheduledTask(row);
}

/**
 * 指定日付リストの既存タスクを取得（scheduler用）
 */
export async function findScheduledTasksForDates(
  userId: number,
  workoutSessionId: number,
  scheduledDates: Date[],
): Promise<ScheduledTask[]> {
  const rows = await prisma.scheduledTask.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      workoutSessionId: toBigInt(workoutSessionId, "workoutSessionId"),
      scheduledDate: {
        in: scheduledDates.map((d) => toUtcDateOnly(d)),
      },
    },
    select: {
      scheduledDate: true,
      id: true,
      userId: true,
      workoutSessionId: true,
      ruleId: true,
      status: true,
      rescheduledTo: true,
      rescheduledFrom: true,
      completedAt: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  return rows.map(mapScheduledTask);
}

/**
 * 特定ルールの未来のpendingタスクを削除（scheduler用）
 */
export async function deleteFuturePendingTasksByRule(
  userId: number,
  ruleId: number,
  fromDate: Date,
): Promise<number> {
  const result = await prisma.scheduledTask.deleteMany({
    where: {
      userId: toBigInt(userId, "userId"),
      ruleId: toBigInt(ruleId, "ruleId"),
      scheduledDate: { gte: toUtcDateOnly(fromDate) },
      status: "pending",
    },
  });
  return result.count;
}
