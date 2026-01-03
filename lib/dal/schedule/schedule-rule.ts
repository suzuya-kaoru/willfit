/**
 * ScheduleRule DAL
 * スケジュールルールのCRUD操作
 */

import { prisma } from "@/lib/db/prisma";
import { toUtcDateOnly } from "@/lib/timezone";
import type { ScheduleRule, ScheduleRuleType } from "@/lib/types";
import { toBigInt } from "../_internal/helpers";
import { mapScheduleRule } from "../_internal/mappers";

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
  ruleId: number;
  weekdays?: number;
  intervalDays?: number;
  startDate?: Date;
  endDate?: Date;
  isEnabled?: boolean;
}): Promise<ScheduleRule> {
  const row = await prisma.scheduleRule.update({
    where: { id: toBigInt(input.ruleId, "ruleId") },
    data: {
      weekdays: input.weekdays,
      intervalDays: input.intervalDays,
      startDate: input.startDate ? toUtcDateOnly(input.startDate) : undefined,
      endDate: input.endDate ? toUtcDateOnly(input.endDate) : undefined,
      isEnabled: input.isEnabled,
    },
  });
  return mapScheduleRule(row);
}

/**
 * スケジュールルールを論理削除
 */
export async function deleteScheduleRule(ruleId: number): Promise<void> {
  await prisma.scheduleRule.update({
    where: { id: toBigInt(ruleId, "ruleId") },
    data: { deletedAt: new Date() },
  });
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
