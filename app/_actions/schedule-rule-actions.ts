"use server";

import { addDays } from "date-fns";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { dateKeySchema, parseDateKey } from "@/lib/date-key";
import {
  createScheduleRule,
  deleteScheduleRule,
  getScheduleRuleById,
  updateScheduleRule,
} from "@/lib/db/queries";
import { TaskSchedulerService } from "@/lib/services/scheduler";
import { getStartOfDayUTC } from "@/lib/timezone";
import type { ScheduleRule } from "@/lib/types";

// =============================================================================
// 入力型定義
// =============================================================================

export interface CreateWeeklyRuleInput {
  sessionPlanId: number;
  ruleType: "weekly";
  weekdays: number; // ビットマスク
  endDateKey?: string;
}

export interface CreateIntervalRuleInput {
  sessionPlanId: number;
  ruleType: "interval";
  intervalDays: number;
  startDateKey: string;
  endDateKey?: string;
}

export interface CreateOnceRuleInput {
  sessionPlanId: number;
  ruleType: "once";
  startDateKey: string;
}

export type CreateScheduleRuleInput =
  | CreateWeeklyRuleInput
  | CreateIntervalRuleInput
  | CreateOnceRuleInput;

export interface UpdateScheduleRuleInput {
  ruleId: number;
  ruleType?: "weekly" | "interval" | "once";
  weekdays?: number | null;
  intervalDays?: number | null;
  startDateKey?: string | null;
  endDateKey?: string | null;
  isEnabled?: boolean;
}

// =============================================================================
// バリデーションスキーマ
// =============================================================================

const weeklyRuleSchema = z.object({
  sessionPlanId: z.number().int().positive("セッションプランIDは正の整数"),
  ruleType: z.literal("weekly"),
  weekdays: z
    .number()
    .int()
    .min(1, "曜日を1つ以上選択してください")
    .max(127, "無効な曜日の組み合わせです"),
  endDateKey: dateKeySchema.optional(),
});

const intervalRuleSchema = z.object({
  sessionPlanId: z.number().int().positive("セッションプランIDは正の整数"),
  ruleType: z.literal("interval"),
  intervalDays: z
    .number()
    .int()
    .min(1, "間隔は1日以上である必要があります")
    .max(365, "間隔は365日以下である必要があります"),
  startDateKey: dateKeySchema,
  endDateKey: dateKeySchema.optional(),
});

const onceRuleSchema = z.object({
  sessionPlanId: z.number().int().positive("セッションプランIDは正の整数"),
  ruleType: z.literal("once"),
  startDateKey: dateKeySchema,
});

const createScheduleRuleSchema = z.discriminatedUnion("ruleType", [
  weeklyRuleSchema,
  intervalRuleSchema,
  onceRuleSchema,
]);

const updateScheduleRuleSchema = z
  .object({
    ruleId: z.number().int().positive(),
    ruleType: z.enum(["weekly", "interval", "once"]).optional(),
    weekdays: z.number().int().min(1).max(127).optional().nullable(),
    intervalDays: z.number().int().min(1).max(365).optional().nullable(),
    startDateKey: dateKeySchema.optional().nullable(),
    endDateKey: dateKeySchema.optional().nullable(),
    isEnabled: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.ruleType === "weekly" && data.weekdays === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["weekdays"],
        message: "週次ルールでは曜日が必須です",
      });
    }
    if (data.ruleType === "interval") {
      if (data.intervalDays === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["intervalDays"],
          message: "間隔ルールでは日数が必須です",
        });
      }
      if (data.startDateKey === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["startDateKey"],
          message: "間隔ルールでは開始日が必須です",
        });
      }
    }
    if (data.ruleType === "once" && data.startDateKey === null) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startDateKey"],
        message: "単発ルールでは日付が必須です",
      });
    }
  });

// =============================================================================
// Server Actions
// =============================================================================

/**
 * スケジュールルールを作成
 */
export async function createScheduleRuleAction(input: CreateScheduleRuleInput) {
  const data = createScheduleRuleSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  const rule = await createScheduleRule({
    userId,
    sessionPlanId: data.sessionPlanId,
    ruleType: data.ruleType,
    weekdays: data.ruleType === "weekly" ? data.weekdays : undefined,
    intervalDays: data.ruleType === "interval" ? data.intervalDays : undefined,
    startDate:
      data.ruleType === "interval" || data.ruleType === "once"
        ? parseDateKey(data.startDateKey)
        : undefined,
    endDate:
      "endDateKey" in data && data.endDateKey
        ? parseDateKey(data.endDateKey)
        : undefined,
  });

  // ドメイン型に変換してタスク生成
  const mappedRule: ScheduleRule = {
    id: rule.id,
    userId: rule.userId,
    sessionPlanId: rule.sessionPlanId,
    ruleType: rule.ruleType,
    weekdays: rule.weekdays ?? undefined,
    intervalDays: rule.intervalDays ?? undefined,
    startDate: rule.startDate ?? undefined,
    endDate: rule.endDate ?? undefined,
    isEnabled: rule.isEnabled,
    createdAt: rule.createdAt,
    updatedAt: rule.updatedAt,
    deletedAt: rule.deletedAt ?? undefined,
  };

  // 初回生成: 今日から90日後まで
  const today = getStartOfDayUTC(new Date());
  await TaskSchedulerService.generateTasks(
    userId,
    rule.id,
    rule.sessionPlanId,
    mappedRule,
    today,
    addDays(today, 90),
  );

  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/settings");

  return { id: rule.id };
}

/**
 * スケジュールルールを更新
 */
export async function updateScheduleRuleAction(input: UpdateScheduleRuleInput) {
  const data = updateScheduleRuleSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  // 既存ルールを取得
  const existingRule = await getScheduleRuleById(userId, data.ruleId);
  if (!existingRule) {
    throw new Error("スケジュールルールが見つかりません");
  }

  const updatedRule = await updateScheduleRule({
    ruleId: data.ruleId,
    weekdays: data.weekdays ?? undefined,
    intervalDays: data.intervalDays ?? undefined,
    startDate: data.startDateKey ? parseDateKey(data.startDateKey) : undefined,
    endDate: data.endDateKey ? parseDateKey(data.endDateKey) : undefined,
    isEnabled: data.isEnabled,
  });

  // Sync on Save: 未来のタスクを再生成
  const mappedRule: ScheduleRule = {
    id: updatedRule.id,
    userId: updatedRule.userId,
    sessionPlanId: updatedRule.sessionPlanId,
    ruleType: updatedRule.ruleType,
    weekdays: updatedRule.weekdays ?? undefined,
    intervalDays: updatedRule.intervalDays ?? undefined,
    startDate: updatedRule.startDate ?? undefined,
    endDate: updatedRule.endDate ?? undefined,
    isEnabled: updatedRule.isEnabled,
    createdAt: updatedRule.createdAt,
    updatedAt: updatedRule.updatedAt,
    deletedAt: updatedRule.deletedAt ?? undefined,
  };

  await TaskSchedulerService.syncRuleTasks(
    userId,
    data.ruleId,
    updatedRule.sessionPlanId,
    mappedRule,
  );

  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/settings");

  return { success: true };
}

/**
 * スケジュールルールを削除（論理削除）
 */
export async function deleteScheduleRuleAction(ruleId: number) {
  const validId = z.number().int().positive().parse(ruleId);
  const _userId = 1; // TODO: 認証実装後に動的取得

  // 未来のpendingタスクを物理削除
  await TaskSchedulerService.cleanupFutureTasks(validId);

  await deleteScheduleRule(validId);

  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/settings");

  return { success: true };
}
