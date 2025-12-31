"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseDateKey } from "@/lib/date-key";
import {
  deleteScheduleReminder,
  upsertScheduleReminder,
} from "@/lib/db/queries";
import { calcNextReminderAt } from "@/lib/reminder";

// リマインダー保存の入力型
export interface SaveScheduleReminderInput {
  scheduleId: number;
  frequency: "daily" | "weekly" | "monthly";
  timeOfDay: string;
  startDateKey: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  isEnabled?: boolean;
}

// リマインダー削除の入力型
export interface DeleteScheduleReminderInput {
  scheduleId: number;
}

const reminderSchema = z
  .object({
    scheduleId: z.number().int().positive(),
    frequency: z.enum(["daily", "weekly", "monthly"]),
    timeOfDay: z.string().regex(/^\d{2}:\d{2}$/),
    startDateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    dayOfWeek: z.number().int().min(0).max(6).optional(),
    dayOfMonth: z.number().int().min(1).max(31).optional(),
    isEnabled: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    if (value.frequency === "weekly" && typeof value.dayOfWeek !== "number") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dayOfWeek"],
        message: "weeklyではdayOfWeekが必須です。",
      });
    }
    if (value.frequency === "monthly" && typeof value.dayOfMonth !== "number") {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["dayOfMonth"],
        message: "monthlyではdayOfMonthが必須です。",
      });
    }
  });

export async function saveScheduleReminderAction(
  input: SaveScheduleReminderInput,
) {
  const data = reminderSchema.parse(input);
  const userId = 1; // TODO: auth
  const startDate = parseDateKey(data.startDateKey);
  const rule = {
    frequency: data.frequency,
    timeOfDay: data.timeOfDay,
    startDate,
    dayOfWeek: data.dayOfWeek,
    dayOfMonth: data.dayOfMonth,
  };
  const nextFireAt = calcNextReminderAt(rule, new Date()) ?? startDate;
  const isEnabled = data.isEnabled ?? true;

  await upsertScheduleReminder({
    userId,
    weekScheduleId: data.scheduleId,
    frequency: data.frequency,
    timeOfDay: data.timeOfDay,
    startDate,
    dayOfWeek: data.dayOfWeek,
    dayOfMonth: data.dayOfMonth,
    timezone: "Asia/Tokyo",
    nextFireAt,
    isEnabled,
  });

  revalidatePath("/");
  revalidatePath("/settings");
}

export async function deleteScheduleReminderAction(
  input: DeleteScheduleReminderInput,
) {
  const { scheduleId } = z
    .object({ scheduleId: z.number().int().positive() })
    .parse(input);
  const userId = 1; // TODO: auth

  await deleteScheduleReminder(userId, scheduleId);
  revalidatePath("/");
  revalidatePath("/settings");
}
