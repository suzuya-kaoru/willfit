"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseDateKey } from "@/lib/date-key";
import { upsertDailySchedule } from "@/lib/db/queries";

// =============================================================================
// Zodスキーマ
// =============================================================================

const completeScheduleSchema = z.object({
  routineId: z.number().int().positive(),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const skipScheduleSchema = z.object({
  routineId: z.number().int().positive(),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const rescheduleSchema = z.object({
  routineId: z.number().int().positive(),
  fromDateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  toDateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

// =============================================================================
// 型定義
// =============================================================================

export type CompleteScheduleInput = z.infer<typeof completeScheduleSchema>;
export type SkipScheduleInput = z.infer<typeof skipScheduleSchema>;
export type RescheduleInput = z.infer<typeof rescheduleSchema>;

// =============================================================================
// Server Actions
// =============================================================================

/**
 * スケジュールを完了としてマーク
 */
export async function completeScheduleAction(input: CompleteScheduleInput) {
  const data = completeScheduleSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  await upsertDailySchedule({
    userId,
    routineId: data.routineId,
    scheduledDate: parseDateKey(data.dateKey),
    status: "completed",
    completedAt: new Date(),
  });

  revalidatePath("/");
  revalidatePath("/schedule");

  return { success: true };
}

/**
 * スケジュールをスキップとしてマーク
 */
export async function skipScheduleAction(input: SkipScheduleInput) {
  const data = skipScheduleSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  await upsertDailySchedule({
    userId,
    routineId: data.routineId,
    scheduledDate: parseDateKey(data.dateKey),
    status: "skipped",
  });

  revalidatePath("/");
  revalidatePath("/schedule");

  return { success: true };
}

/**
 * スケジュールを振替
 */
export async function rescheduleAction(input: RescheduleInput) {
  const data = rescheduleSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  const fromDate = parseDateKey(data.fromDateKey);
  const toDate = parseDateKey(data.toDateKey);

  // 元の日付を振替済みとしてマーク
  await upsertDailySchedule({
    userId,
    routineId: data.routineId,
    scheduledDate: fromDate,
    status: "rescheduled",
    rescheduledTo: toDate,
  });

  // 新しい日付に予定を追加
  await upsertDailySchedule({
    userId,
    routineId: data.routineId,
    scheduledDate: toDate,
    status: "pending",
    rescheduledFrom: fromDate,
  });

  revalidatePath("/");
  revalidatePath("/schedule");

  return { success: true };
}
