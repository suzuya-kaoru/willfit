import { format } from "date-fns";
import { ja } from "date-fns/locale";

/**
 * タイムゾーン設定
 *
 * 設計方針:
 * - DBには Asia/Tokyo で保存（Prisma接続文字列に timezone=Asia/Tokyo を指定）
 * - Node.jsプロセスも TZ=Asia/Tokyo
 * - new Date() は Asia/Tokyo の日時として扱われる
 * - SQLで見ても直感的、ツール連携も楽
 */
export const APP_TIMEZONE = "Asia/Tokyo";

/**
 * 今日の開始時刻を取得（Asia/Tokyo）
 * 例: 2024-12-24 00:00:00
 */
export function getTodayStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/**
 * 今日の終了時刻を取得（Asia/Tokyo）
 * 例: 2024-12-24 23:59:59.999
 */
export function getTodayEnd(): Date {
  const now = new Date();
  return new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23,
    59,
    59,
    999,
  );
}

/**
 * 指定した年月の開始日を取得（Asia/Tokyo）
 */
export function getMonthStart(year: number, month: number): Date {
  return new Date(year, month, 1, 0, 0, 0, 0);
}

/**
 * 指定した年月の終了日を取得（Asia/Tokyo）
 */
export function getMonthEnd(year: number, month: number): Date {
  return new Date(year, month + 1, 0, 23, 59, 59, 999);
}

/**
 * 日時をフォーマット（Asia/Tokyo）
 */
export function formatDateTime(date: Date | string, formatStr: string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: ja });
}

/**
 * 日付のみをフォーマット
 */
export function formatDate(date: Date | string): string {
  return formatDateTime(date, "yyyy-MM-dd");
}

/**
 * 時刻のみをフォーマット
 */
export function formatTime(date: Date | string): string {
  return formatDateTime(date, "HH:mm");
}

/**
 * 日本語形式でフォーマット
 * 例: "2024年12月24日 15:30"
 */
export function formatDateTimeJa(date: Date | string): string {
  return formatDateTime(date, "yyyy年M月d日 HH:mm");
}

/**
 * 2つの日付が同じ日かどうかを判定
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return formatDate(date1) === formatDate(date2);
}

/**
 * DB保存用に日付をUTC化する（時刻を00:00:00 UTCにする）
 * Prisma/PostgreSQLのDATE型保存時のタイムゾーンずれ対策
 *
 * 例: JST 2024-01-01 00:00:00 -> UTC 2024-01-01 00:00:00
 * (本来なら JST 00:00 は UTC 前日15:00 だが、そうするとDATE型が前日になってしまうため)
 */
export function toUtcDateOnly(date: Date): Date {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
}
