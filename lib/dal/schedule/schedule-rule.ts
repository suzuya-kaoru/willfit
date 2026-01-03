/**
 * ScheduleRule DAL
 * スケジュールルールのCRUD操作
 */

import { prisma } from "@/lib/db/prisma";
import { toUtcDateOnly } from "@/lib/timezone";
import type { ScheduleRule, ScheduleRuleType } from "@/lib/types";
import { toBigInt } from "../_internal/helpers";
import { mapScheduleRule } from "../_internal/schedule.mapper";

/**
 * スケジュールルールを作成
 */
export async function createScheduleRule(input: {
  userId: number;
  workoutSessionId: number;
  ruleType: ScheduleRuleType;
  weekdays?: number;
  intervalDays?: number;
  startDate?: Date;
  endDate?: Date;
}): Promise<ScheduleRule> {
  const row = await prisma.scheduleRule.create({
    data: {
      userId: toBigInt(input.userId, "userId"),
      workoutSessionId: toBigInt(input.workoutSessionId, "workoutSessionId"),
      ruleType: input.ruleType,
      weekdays: input.weekdays,
      intervalDays: input.intervalDays,
      startDate: input.startDate ? toUtcDateOnly(input.startDate) : null,
      endDate: input.endDate ? toUtcDateOnly(input.endDate) : null,
      isEnabled: true,
    },
  });
  return mapScheduleRule(row);
}

/**
 * 有効なスケジュールルール一覧を取得
 */
export async function getActiveScheduleRules(
  userId: number,
): Promise<ScheduleRule[]> {
  const rows = await prisma.scheduleRule.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      isEnabled: true,
      deletedAt: null,
    },
  });
  return rows.map(mapScheduleRule);
}

/**
 * ワークアウトセッションのスケジュールルール一覧を取得
 */
export async function getScheduleRulesByWorkoutSession(
  userId: number,
  workoutSessionId: number,
): Promise<ScheduleRule[]> {
  const rows = await prisma.scheduleRule.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      workoutSessionId: toBigInt(workoutSessionId, "workoutSessionId"),
      deletedAt: null,
    },
  });
  return rows.map(mapScheduleRule);
}

/**
 * 特定のスケジュールルールを取得
 */
export async function getScheduleRuleById(
  userId: number,
  ruleId: number,
): Promise<ScheduleRule | null> {
  const row = await prisma.scheduleRule.findFirst({
    where: {
      id: toBigInt(ruleId, "ruleId"),
      userId: toBigInt(userId, "userId"),
      deletedAt: null,
    },
  });
  return row ? mapScheduleRule(row) : null;
}

/**
 * スケジュールルールを更新
 */
export async function updateScheduleRule(input: {
  userId: number;
  ruleId: number;
  weekdays?: number;
  intervalDays?: number;
  startDate?: Date;
  endDate?: Date;
  isEnabled?: boolean;
}): Promise<ScheduleRule> {
  const result = await prisma.scheduleRule.updateMany({
    where: {
      id: toBigInt(input.ruleId, "ruleId"),
      userId: toBigInt(input.userId, "userId"),
      deletedAt: null,
    },
    data: {
      weekdays: input.weekdays,
      intervalDays: input.intervalDays,
      startDate: input.startDate ? toUtcDateOnly(input.startDate) : undefined,
      endDate: input.endDate ? toUtcDateOnly(input.endDate) : undefined,
      isEnabled: input.isEnabled,
    },
  });
  if (result.count === 0) {
    throw new Error("ルールが見つかりません");
  }
  // 更新後のデータを取得して返す
  const row = await prisma.scheduleRule.findUnique({
    where: { id: toBigInt(input.ruleId, "ruleId") },
  });
  if (!row) throw new Error("ルールが見つかりません");
  return mapScheduleRule(row);
}

/**
 * スケジュールルールを論理削除
 */
export async function deleteScheduleRule(
  userId: number,
  ruleId: number,
): Promise<void> {
  const result = await prisma.scheduleRule.updateMany({
    where: {
      id: toBigInt(ruleId, "ruleId"),
      userId: toBigInt(userId, "userId"),
      deletedAt: null,
    },
    data: { deletedAt: new Date() },
  });
  if (result.count === 0) {
    throw new Error("ルールが見つかりません");
  }
}

/**
 * 全ユーザーの有効なスケジュールルールを取得（Cronジョブ用）
 * scheduler.ts から使用される
 */
export async function getAllActiveRulesForCron(): Promise<ScheduleRule[]> {
  const rows = await prisma.scheduleRule.findMany({
    where: {
      isEnabled: true,
      deletedAt: null,
    },
  });
  return rows.map(mapScheduleRule);
}
