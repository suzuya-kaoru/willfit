"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  deleteScheduledTask,
  rescheduleTask,
  updateScheduledTaskStatus,
  upsertScheduledTask,
} from "@/lib/dal/schedule";
import { dateKeySchema, parseDateKey } from "@/lib/date-key";
import { TaskSchedulerService } from "@/lib/services/scheduler";
import type { ScheduledTaskStatus } from "@/lib/types";

// =============================================================================
// 入力型定義
// =============================================================================

export interface UpdateTaskStatusInput {
  taskId: number;
  status: ScheduledTaskStatus;
}

export interface RescheduleTaskInput {
  taskId: number;
  newDateKey: string;
}

export interface CreateManualTaskInput {
  workoutSessionId: number;
  scheduledDateKey: string;
}

// =============================================================================
// バリデーションスキーマ
// =============================================================================

const updateTaskStatusSchema = z.object({
  taskId: z.number().int().positive("タスクIDは正の整数"),
  status: z.enum(["pending", "completed", "skipped", "rescheduled"], {
    errorMap: () => ({ message: "無効なステータスです" }),
  }),
});

const rescheduleTaskSchema = z.object({
  taskId: z.number().int().positive("タスクIDは正の整数"),
  newDateKey: dateKeySchema,
});

const createManualTaskSchema = z.object({
  workoutSessionId: z.number().int().positive("セッションIDは正の整数"),
  scheduledDateKey: dateKeySchema,
});

// =============================================================================
// Server Actions
// =============================================================================

/**
 * タスクのステータスを更新
 */
export async function updateTaskStatusAction(input: UpdateTaskStatusInput) {
  const data = updateTaskStatusSchema.parse(input);

  await updateScheduledTaskStatus({
    taskId: data.taskId,
    status: data.status,
    completedAt: data.status === "completed" ? new Date() : undefined,
  });

  revalidatePath("/");
  revalidatePath("/schedule");

  return { success: true };
}

/**
 * タスクを完了としてマーク
 */
export async function completeTaskAction(taskId: number) {
  const validId = z.number().int().positive().parse(taskId);
  const _userId = 1; // TODO: 認証実装後に動的取得

  await updateScheduledTaskStatus({
    taskId: validId,
    status: "completed",
    completedAt: new Date(),
  });

  revalidatePath("/");
  revalidatePath("/schedule");

  return { success: true };
}

/**
 * タスクをスキップとしてマーク
 */
export async function skipTaskAction(taskId: number) {
  const validId = z.number().int().positive().parse(taskId);
  const _userId = 1; // TODO: 認証実装後に動的取得

  await updateScheduledTaskStatus({
    taskId: validId,
    status: "skipped",
  });

  revalidatePath("/");
  revalidatePath("/schedule");

  return { success: true };
}

/**
 * タスクを振り替え（元のタスクはrescheduled、新日付に新タスク作成）
 */
export async function rescheduleTaskAction(input: RescheduleTaskInput) {
  const data = rescheduleTaskSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  const newDate = parseDateKey(data.newDateKey);
  await rescheduleTask({
    userId,
    taskId: data.taskId,
    toDate: newDate,
  });

  revalidatePath("/");
  revalidatePath("/schedule");

  return { success: true };
}

/**
 * 手動でタスクを追加（ルールなし）
 */
export async function createManualTaskAction(input: CreateManualTaskInput) {
  const data = createManualTaskSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  const scheduledDate = parseDateKey(data.scheduledDateKey);

  await TaskSchedulerService.createManualTask(
    userId,
    data.workoutSessionId,
    scheduledDate,
  );

  revalidatePath("/");
  revalidatePath("/schedule");

  return { success: true };
}

/**
 * 特定の日付にタスクを追加または更新（upsert）
 * カレンダーからの直接追加用
 */
export async function upsertTaskAction(input: CreateManualTaskInput) {
  const data = createManualTaskSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  const scheduledDate = parseDateKey(data.scheduledDateKey);

  await upsertScheduledTask({
    userId,
    workoutSessionId: data.workoutSessionId,
    scheduledDate,
    status: "pending",
  });

  revalidatePath("/");
  revalidatePath("/schedule");

  return { success: true };
}

/**
 * タスクを削除（pending状態のみ）
 */
export async function deleteTaskAction(taskId: number) {
  const validId = z.number().int().positive().parse(taskId);
  const userId = 1; // TODO: 認証実装後に動的取得

  await deleteScheduledTask(userId, validId);

  revalidatePath("/");
  revalidatePath("/schedule");

  return { success: true };
}
