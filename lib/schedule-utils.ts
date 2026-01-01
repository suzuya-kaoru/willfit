/**
 * スケジュールユーティリティ
 *
 * ビットマスク変換とスケジュール計算のヘルパー関数
 */

export const WEEKDAY_LABELS = [
  "日",
  "月",
  "火",
  "水",
  "木",
  "金",
  "土",
] as const;

export const MONTH_LABELS = [
  "1月",
  "2月",
  "3月",
  "4月",
  "5月",
  "6月",
  "7月",
  "8月",
  "9月",
  "10月",
  "11月",
  "12月",
] as const;

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

/**
 * 曜日を日本語に変換
 */
export function weekdayToJapanese(dayOfWeek: number): string {
  return WEEKDAY_LABELS[dayOfWeek] ?? "";
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
