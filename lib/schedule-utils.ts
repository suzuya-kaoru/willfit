/**
 * スケジュールユーティリティ
 *
 * ビットマスク変換とスケジュール計算のヘルパー関数
 */

import { differenceInDays, getDay } from "date-fns";

import { parseDateKey, toDateKey } from "./date-key";
import type {
  CalculatedSchedule,
  DailySchedule,
  ScheduleRoutine,
  WorkoutMenu,
} from "./types";

// =============================================================================
// ビットマスク変換
// =============================================================================

/**
 * ビットマスクから曜日配列を取得
 * @param bitmask ビットマスク (日=1, 月=2, 火=4, 水=8, 木=16, 金=32, 土=64)
 * @returns 曜日配列 [0, 1, 3] = 日, 月, 水
 */
export function weekdaysFromBitmask(bitmask: number): number[] {
  const days: number[] = [];
  for (let i = 0; i < 7; i++) {
    if ((bitmask & (1 << i)) !== 0) {
      days.push(i);
    }
  }
  return days;
}

/**
 * 曜日配列からビットマスクを生成
 * @param days 曜日配列 [0, 1, 3] = 日, 月, 水
 * @returns ビットマスク
 */
export function bitmaskFromWeekdays(days: number[]): number {
  return days.reduce((mask, day) => mask | (1 << day), 0);
}

/**
 * 特定の曜日がビットマスクに含まれるか判定
 * @param bitmask ビットマスク
 * @param dayOfWeek 曜日 (0-6)
 */
export function isWeekdayInBitmask(
  bitmask: number,
  dayOfWeek: number,
): boolean {
  return (bitmask & (1 << dayOfWeek)) !== 0;
}

// =============================================================================
// スケジュール計算
// =============================================================================

/**
 * ルーティンが特定の日にスケジュールされているか判定
 * @param routine ルーティン
 * @param date 判定対象日
 */
export function isScheduledDate(routine: ScheduleRoutine, date: Date): boolean {
  if (!routine.isEnabled) return false;

  if (routine.routineType === "weekly" && routine.weekdays != null) {
    const dayOfWeek = getDay(date);
    return isWeekdayInBitmask(routine.weekdays, dayOfWeek);
  }

  if (
    routine.routineType === "interval" &&
    routine.intervalDays != null &&
    routine.startDate != null
  ) {
    // 日付の違いによる誤差を防ぐため、一度文字列（yyyy-MM-dd）に正規化してから比較
    const targetDate = parseDateKey(toDateKey(date));
    const startDate = parseDateKey(toDateKey(routine.startDate));
    const diffDays = differenceInDays(targetDate, startDate);
    return diffDays >= 0 && diffDays % routine.intervalDays === 0;
  }

  return false;
}

/**
 * 特定日のスケジュールを計算
 * @param routines ルーティン一覧
 * @param menus メニュー一覧（ID→名前マッピング用）
 * @param date 対象日
 * @param dailySchedules 日別スケジュール（オーバーライド用）
 */
export function getSchedulesForDate(
  routines: ScheduleRoutine[],
  menus: Map<number, WorkoutMenu>,
  date: Date,
  dailySchedules: Map<string, DailySchedule>,
): CalculatedSchedule[] {
  const dateKey = toDateKey(date);
  const result: CalculatedSchedule[] = [];

  for (const routine of routines) {
    const dailyKey = `${routine.id}:${dateKey}`;
    const daily = dailySchedules.get(dailyKey);
    const menu = menus.get(routine.menuId);

    if (!menu) continue;

    // 日別スケジュールに記録がある場合
    if (daily) {
      // rescheduled, completed, skipped は表示しない
      if (daily.status === "pending") {
        result.push({
          routineId: routine.id,
          menuId: routine.menuId,
          menuName: menu.name,
          routineType: routine.routineType,
          weekdays:
            routine.weekdays != null
              ? weekdaysFromBitmask(routine.weekdays)
              : undefined,
          intervalDays: routine.intervalDays ?? undefined,
          dailySchedule: daily,
          isFromReschedule: daily.rescheduledFrom != null,
        });
      }
      continue;
    }

    // ルーティンから計算
    if (isScheduledDate(routine, date)) {
      result.push({
        routineId: routine.id,
        menuId: routine.menuId,
        menuName: menu.name,
        routineType: routine.routineType,
        weekdays:
          routine.weekdays != null
            ? weekdaysFromBitmask(routine.weekdays)
            : undefined,
        intervalDays: routine.intervalDays ?? undefined,
        dailySchedule: undefined,
        isFromReschedule: false,
      });
    }
  }

  return result;
}

/**
 * 曜日を日本語に変換
 */
export function weekdayToJapanese(dayOfWeek: number): string {
  const days = ["日", "月", "火", "水", "木", "金", "土"];
  return days[dayOfWeek] ?? "";
}

/**
 * ビットマスクを日本語曜日文字列に変換
 * @param bitmask ビットマスク
 * @returns "月・水・金" のような文字列
 */
export function weekdayBitmaskToString(bitmask: number): string {
  const days = weekdaysFromBitmask(bitmask);
  return days.map(weekdayToJapanese).join("・");
}

/**
 * ルーティンの説明文を生成
 */
export function getRoutineDescription(routine: ScheduleRoutine): string {
  if (routine.routineType === "weekly" && routine.weekdays != null) {
    return `毎週 ${weekdayBitmaskToString(routine.weekdays)}`;
  }

  if (routine.routineType === "interval" && routine.intervalDays != null) {
    return `${routine.intervalDays}日ごと`;
  }

  return "";
}
