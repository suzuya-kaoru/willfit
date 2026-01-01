import {
  addDays,
  differenceInDays,
  eachDayOfInterval,
  getDay,
  startOfDay,
} from "date-fns";
import { parseDateKey, toDateKey } from "@/lib/date-key";
import { prisma } from "@/lib/db/prisma";
import { isWeekdayInBitmask } from "@/lib/schedule-utils";
import { toUtcDateOnly } from "@/lib/timezone";
import type { ScheduleRule, ScheduleRuleType } from "@/lib/types";

// =============================================================================
// 新スケジュール機能（SessionPlan ベース）
// =============================================================================

/**
 * ルールに基づいて特定の日付がスケジュール対象かどうか判定
 */
function isRuleScheduledDate(rule: ScheduleRule, date: Date): boolean {
  if (!rule.isEnabled) return false;

  // weekly: 曜日ビットマスクで判定
  if (rule.ruleType === "weekly" && rule.weekdays != null) {
    const dayOfWeek = getDay(date);
    return isWeekdayInBitmask(rule.weekdays, dayOfWeek);
  }

  // interval: 起点日からの差分で判定
  if (
    rule.ruleType === "interval" &&
    rule.intervalDays != null &&
    rule.startDate != null
  ) {
    const targetDate = parseDateKey(toDateKey(date));
    const startDate = parseDateKey(toDateKey(rule.startDate));
    const diffDays = differenceInDays(targetDate, startDate);
    return diffDays >= 0 && diffDays % rule.intervalDays === 0;
  }

  // once: 開始日のみ
  if (rule.ruleType === "once" && rule.startDate != null) {
    return toDateKey(date) === toDateKey(rule.startDate);
  }

  return false;
}

/**
 * 新スケジュール機能用のタスク生成サービス
 */
export const TaskSchedulerService = {
  /**
   * 指定されたルールに基づいてスケジュールタスクを生成する
   * 既に存在するレコードはスキップされる（冪等性あり）
   *
   * @param userId ユーザーID
   * @param ruleId ルールID
   * @param sessionPlanId セッションプランID
   * @param rule スケジュールルール（DBから取得済み）
   * @param fromDate 開始日
   * @param toDate 終了日
   */
  async generateTasks(
    userId: number,
    ruleId: number,
    sessionPlanId: number,
    rule: ScheduleRule,
    fromDate: Date,
    toDate: Date,
  ): Promise<number> {
    if (!rule.isEnabled) return 0;

    // 終了日の考慮
    const effectiveToDate =
      rule.endDate && rule.endDate < toDate ? rule.endDate : toDate;

    // onceタイプの場合は特別処理
    if (rule.ruleType === "once" && rule.startDate) {
      const onceDate = rule.startDate;
      if (onceDate >= fromDate && onceDate <= effectiveToDate) {
        // 既存チェック
        const existing = await prisma.scheduledTask.findUnique({
          where: {
            userId_sessionPlanId_scheduledDate: {
              userId: BigInt(userId),
              sessionPlanId: BigInt(sessionPlanId),
              scheduledDate: toUtcDateOnly(onceDate),
            },
          },
        });
        if (!existing) {
          await prisma.scheduledTask.create({
            data: {
              userId: BigInt(userId),
              ruleId: BigInt(ruleId),
              sessionPlanId: BigInt(sessionPlanId),
              scheduledDate: toUtcDateOnly(onceDate),
              status: "pending",
            },
          });
          return 1;
        }
      }
      return 0;
    }

    // weekly / interval タイプの処理
    const interval = eachDayOfInterval({
      start: startOfDay(fromDate),
      end: startOfDay(effectiveToDate),
    });

    const dataToCreate: {
      userId: number;
      ruleId: number;
      sessionPlanId: number;
      scheduledDate: Date;
    }[] = [];

    for (const date of interval) {
      if (!isRuleScheduledDate(rule, date)) {
        continue;
      }
      dataToCreate.push({
        userId,
        ruleId,
        sessionPlanId,
        scheduledDate: toUtcDateOnly(date),
      });
    }

    if (dataToCreate.length === 0) return 0;

    // 既に存在する日付をDBから取得
    const existingTasks = await prisma.scheduledTask.findMany({
      where: {
        userId: BigInt(userId),
        sessionPlanId: BigInt(sessionPlanId),
        scheduledDate: {
          in: dataToCreate.map((d) => d.scheduledDate),
        },
      },
      select: { scheduledDate: true },
    });

    const existingDateSet = new Set(
      existingTasks.map((s) => toDateKey(s.scheduledDate)),
    );

    // 存在しないものだけをフィルタリング
    const finalCreates = dataToCreate.filter(
      (d) => !existingDateSet.has(toDateKey(d.scheduledDate)),
    );

    if (finalCreates.length > 0) {
      await prisma.scheduledTask.createMany({
        data: finalCreates.map((d) => ({
          userId: BigInt(d.userId),
          ruleId: BigInt(d.ruleId),
          sessionPlanId: BigInt(d.sessionPlanId),
          scheduledDate: d.scheduledDate,
          status: "pending" as const,
        })),
      });
      console.log(
        `[TaskScheduler] Created ${finalCreates.length} tasks for rule ${ruleId}`,
      );
    }

    return finalCreates.length;
  },

  /**
   * ルール設定変更時に、未来のスケジュールを同期（再生成）する
   * - 未来の未完了(status=pending)レコードを物理削除
   * - 新しいルールで再生成
   */
  async syncRuleTasks(
    userId: number,
    ruleId: number,
    sessionPlanId: number,
    rule: ScheduleRule,
  ): Promise<void> {
    const today = startOfDay(new Date());

    // 1. 未来の未完了タスクを物理削除
    const deleteResult = await prisma.scheduledTask.deleteMany({
      where: {
        userId: BigInt(userId),
        ruleId: BigInt(ruleId),
        scheduledDate: { gte: today },
        status: "pending",
      },
    });

    console.log(
      `[TaskScheduler] Deleted ${deleteResult.count} pending tasks for rule ${ruleId}`,
    );

    // 2. 向こう3ヶ月分を再生成
    const threeMonthsLater = addDays(today, 90);

    await this.generateTasks(
      userId,
      ruleId,
      sessionPlanId,
      rule,
      today,
      threeMonthsLater,
    );
  },

  /**
   * ルール削除時のクリーンアップ
   * 未来の未完了タスクのみ削除する
   */
  async cleanupFutureTasks(ruleId: number): Promise<void> {
    const today = startOfDay(new Date());
    await prisma.scheduledTask.deleteMany({
      where: {
        ruleId: BigInt(ruleId),
        scheduledDate: { gte: today },
        status: "pending",
      },
    });
  },

  /**
   * 手動でタスクを追加（ルールなし）
   */
  async createManualTask(
    userId: number,
    sessionPlanId: number,
    scheduledDate: Date,
  ): Promise<void> {
    await prisma.scheduledTask.create({
      data: {
        userId: BigInt(userId),
        sessionPlanId: BigInt(sessionPlanId),
        scheduledDate: toUtcDateOnly(scheduledDate),
        status: "pending",
      },
    });
  },

  /**
   * 全ユーザーの全ルールについて、向こう90日分のタスクを生成
   * Cronジョブ用
   */
  async generateAllUsersTasks(): Promise<void> {
    const today = startOfDay(new Date());
    const threeMonthsLater = addDays(today, 90);

    // 有効なルールを全て取得
    const rules = await prisma.scheduleRule.findMany({
      where: {
        isEnabled: true,
        deletedAt: null,
      },
    });

    for (const rule of rules) {
      const mappedRule: ScheduleRule = {
        id: Number(rule.id),
        userId: Number(rule.userId),
        sessionPlanId: Number(rule.sessionPlanId),
        ruleType: rule.ruleType as ScheduleRuleType,
        weekdays: rule.weekdays ?? undefined,
        intervalDays: rule.intervalDays ?? undefined,
        startDate: rule.startDate ?? undefined,
        endDate: rule.endDate ?? undefined,
        isEnabled: rule.isEnabled,
        createdAt: rule.createdAt,
        updatedAt: rule.updatedAt,
        deletedAt: rule.deletedAt ?? undefined,
      };

      await this.generateTasks(
        Number(rule.userId),
        Number(rule.id),
        Number(rule.sessionPlanId),
        mappedRule,
        today,
        threeMonthsLater,
      );
    }
  },
};
