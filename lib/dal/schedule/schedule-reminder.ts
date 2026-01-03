/**
 * ScheduleReminder DAL
 * スケジュールリマインダーのCRUD操作
 */
import { prisma } from "@/lib/db/prisma";
import type { ReminderType, ScheduleReminder } from "@/lib/types";
import { timeOfDayToDate, toBigInt } from "../_internal/helpers";
import { mapScheduleReminder } from "../_internal/mappers";

/**
 * スケジュールリマインダーを作成/更新
 */
export async function upsertScheduleReminder(input: {
  userId: number;
  workoutSessionId: number;
  reminderType: ReminderType;
  offsetMinutes?: number;
  fixedTimeOfDay?: string;
  timezone: string;
  isEnabled: boolean;
}): Promise<ScheduleReminder> {
  const fixedTime = input.fixedTimeOfDay
    ? timeOfDayToDate(input.fixedTimeOfDay)
    : null;

  // 既存のリマインダーを探す
  const existing = await prisma.scheduleReminder.findFirst({
    where: {
      userId: toBigInt(input.userId, "userId"),
      workoutSessionId: toBigInt(input.workoutSessionId, "workoutSessionId"),
    },
  });

  const row = existing
    ? await prisma.scheduleReminder.update({
        where: { id: existing.id },
        data: {
          reminderType: input.reminderType,
          offsetMinutes: input.offsetMinutes,
          fixedTimeOfDay: fixedTime,
          timezone: input.timezone,
          isEnabled: input.isEnabled,
        },
      })
    : await prisma.scheduleReminder.create({
        data: {
          userId: toBigInt(input.userId, "userId"),
          workoutSessionId: toBigInt(
            input.workoutSessionId,
            "workoutSessionId",
          ),
          reminderType: input.reminderType,
          offsetMinutes: input.offsetMinutes,
          fixedTimeOfDay: fixedTime,
          timezone: input.timezone,
          isEnabled: input.isEnabled,
        },
      });

  return mapScheduleReminder(row);
}

/**
 * スケジュールリマインダーを削除
 */
export async function deleteScheduleReminder(
  workoutSessionId: number,
): Promise<void> {
  await prisma.scheduleReminder.deleteMany({
    where: { workoutSessionId: toBigInt(workoutSessionId, "workoutSessionId") },
  });
}
