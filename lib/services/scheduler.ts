/**
 * TaskSchedulerService
 * スケジュールタスク生成サービス
 *
 * このサービスはDALを経由してデータベース操作を行います。
 */
import { addDays, differenceInDays, eachDayOfInterval, getDay } from "date-fns";
import {
  createScheduledTaskRaw,
  deleteFuturePendingTasksByRule,
  findScheduledTask,
  findScheduledTasksForDates,
} from "@/lib/dal/schedule/internal";
import { getAllActiveRulesForCron } from "@/lib/dal/schedule/schedule-rule";
import {
  createScheduledTask,
  createScheduledTasks,
  deleteFuturePendingTasks,
} from "@/lib/dal/schedule/scheduled-task";
import { parseDateKey, toDateKey } from "@/lib/date-key";
import { isWeekdayInBitmask } from "@/lib/schedule-utils";
import { getStartOfDayUTC, toUtcDateOnly } from "@/lib/timezone";
import type { ScheduleRule } from "@/lib/types";

// =============================================================================
// スケジュール機能（WorkoutSession ベース）
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
 * スケジュール機能用のタスク生成サービス
 */
export const TaskSchedulerService = {
  /**
   * 指定されたルールに基づいてスケジュールタスクを生成する
   * 既に存在するレコードはスキップされる（冪等性あり）
   *
   * @param userId ユーザーID
   * @param ruleId ルールID
   * @param workoutSessionId ワークアウトセッションID
   * @param rule スケジュールルール（DBから取得済み）
   * @param fromDate 開始日
   * @param toDate 終了日
   */
  async generateTasks(
    userId: number,
    ruleId: number,
    workoutSessionId: number,
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
        const existing = await findScheduledTask(
          userId,
          workoutSessionId,
          toUtcDateOnly(onceDate),
        );
        if (!existing) {
          await createScheduledTaskRaw({
            userId,
            ruleId,
            workoutSessionId,
            scheduledDate: toUtcDateOnly(onceDate),
            status: "pending",
          });
          return 1;
        }
      }
      return 0;
    }

    // weekly / interval タイプの処理
    const interval = eachDayOfInterval({
      start: getStartOfDayUTC(fromDate),
      end: getStartOfDayUTC(effectiveToDate),
    });

    const dataToCreate: {
      userId: number;
      ruleId: number;
      workoutSessionId: number;
      scheduledDate: Date;
    }[] = [];

    for (const date of interval) {
      if (!isRuleScheduledDate(rule, date)) {
        continue;
      }
      dataToCreate.push({
        userId,
        ruleId,
        workoutSessionId,
        scheduledDate: toUtcDateOnly(date),
      });
    }

    if (dataToCreate.length === 0) return 0;

    // 既に存在する日付をDBから取得
    const existingTasks = await findScheduledTasksForDates(
      userId,
      workoutSessionId,
      dataToCreate.map((d) => d.scheduledDate),
    );

    const existingDateSet = new Set(
      existingTasks.map((s) => toDateKey(s.scheduledDate)),
    );

    // 存在しないものだけをフィルタリング
    const finalCreates = dataToCreate.filter(
      (d) => !existingDateSet.has(toDateKey(d.scheduledDate)),
    );

    if (finalCreates.length > 0) {
      await createScheduledTasks(
        finalCreates.map((d) => ({
          userId: d.userId,
          ruleId: d.ruleId,
          workoutSessionId: d.workoutSessionId,
          scheduledDate: d.scheduledDate,
        })),
      );
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
    workoutSessionId: number,
    rule: ScheduleRule,
  ): Promise<void> {
    const today = getStartOfDayUTC(new Date());

    // 1. 未来の未完了タスクを物理削除
    const deleteCount = await deleteFuturePendingTasksByRule(
      userId,
      ruleId,
      today,
    );

    console.log(
      `[TaskScheduler] Deleted ${deleteCount} pending tasks for rule ${ruleId}`,
    );

    // 2. 向こう3ヶ月分を再生成
    const threeMonthsLater = addDays(today, 90);

    await this.generateTasks(
      userId,
      ruleId,
      workoutSessionId,
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
    const today = getStartOfDayUTC(new Date());
    // Note: この関数はuserIdを必要としないので、DALに追加の関数が必要
    // 今回はdeleteFuturePendingTasksを直接使用

    await deleteFuturePendingTasks(ruleId, today);
  },

  /**
   * 手動でタスクを追加（ルールなし）
   */
  async createManualTask(
    userId: number,
    workoutSessionId: number,
    scheduledDate: Date,
  ): Promise<void> {
    await createScheduledTask({
      userId,
      workoutSessionId,
      scheduledDate: toUtcDateOnly(scheduledDate),
    });
  },

  /**
   * 全ユーザーの全ルールについて、向こう90日分のタスクを生成
   * Cronジョブ用
   */
  async generateAllUsersTasks(): Promise<void> {
    const today = getStartOfDayUTC(new Date());
    const threeMonthsLater = addDays(today, 90);

    // 有効なルールを全て取得
    const rules = await getAllActiveRulesForCron();

    for (const rule of rules) {
      await this.generateTasks(
        rule.userId,
        rule.id,
        rule.workoutSessionId,
        rule,
        today,
        threeMonthsLater,
      );
    }
  },
};
