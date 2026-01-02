import { ja } from "date-fns/locale";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

/**
 * タイムゾーン設定
 *
 * 設計方針（UTC標準化）:
 * - DB保存: すべてUTC
 * - サーバー処理: すべてUTC
 * - クライアント表示: ユーザーのタイムゾーン（日本ならJST）で変換
 */
export const APP_TIMEZONE = "Asia/Tokyo";

/**
 * 指定した日付の開始時刻（00:00:00.000）をUTCで取得
 */
export function getStartOfDayUTC(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
}

/**
 * 指定した日付の終了時刻（23:59:59.999）をUTCで取得
 */
export function getEndOfDayUTC(date: Date): Date {
  return new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      23,
      59,
      59,
      999,
    ),
  );
}

/**
 * 指定した年月の開始日を取得（UTC）
 */
export function getMonthStartUTC(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
}

/**
 * 指定した年月の終了日を取得（UTC）
 */
export function getMonthEndUTC(year: number, month: number): Date {
  return new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
}

/**
 * 日時をJSTでフォーマット（表示用）
 */
export function formatDateTimeJST(
  date: Date | string,
  formatStr: string,
): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatInTimeZone(dateObj, APP_TIMEZONE, formatStr, { locale: ja });
}

/**
 * 日付のみをフォーマット（JST）
 */
export function formatDateJST(date: Date | string): string {
  return formatDateTimeJST(date, "yyyy-MM-dd");
}

/**
 * 時刻のみをフォーマット（JST）
 */
export function formatTimeJST(date: Date | string): string {
  return formatDateTimeJST(date, "HH:mm");
}

/**
 * 日本語形式でフォーマット（JST）
 * 例: "2024年12月24日 15:30"
 */
export function formatDateTimeJa(date: Date | string): string {
  return formatDateTimeJST(date, "yyyy年M月d日 HH:mm");
}

/**
 * 日本語形式（曜日付き）でフォーマット（JST）
 * 例: "1月2日(木)"
 */
export function formatDateJaWithWeekday(date: Date | string): string {
  return formatDateTimeJST(date, "M月d日(E)");
}

/**
 * UTCの日付文字列から、JSTの特定時刻のUTC Dateを生成
 * 例: "2024-01-01" + JST 09:00 → UTC 2024-01-01T00:00:00Z
 * @param dateStr "YYYY-MM-DD" works as JST date
 * @param hours default 0
 * @param minutes default 0
 */
export function toUtcDateTimeFromJstString(
  dateStr: string,
  hours = 0,
  minutes = 0,
): Date {
  // ISO8601 offset format: YYYY-MM-DDTHH:mm:ss+09:00
  const isoStr = `${dateStr}T${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00+09:00`;
  return new Date(isoStr);
}

/**
 * DATE型（日付のみ）として保存するための変換関数
 *
 * 入力された Date オブジェクトを JST として解釈し、
 * その日付部分を UTC 00:00:00 として返す。
 *
 * 用途: ScheduleRule.startDate, ScheduledTask.scheduledDate など
 * DATE型カラムへの保存時に使用。
 *
 * 設計思想:
 * - DBのDATE型カラムは「JSTの日付」を保持する意図がある。
 * - しかしPrisma/DBはUTCとして解釈するため、時間を「UTCの00:00」に合わせることで、
 *   意図した「日付」として保存・取得できるようにするハック。
 *
 * 例: UTC 2024-01-01T20:00:00Z (= JST 2024-01-02T05:00) → UTC 2024-01-02T00:00:00Z
 *
 * 注意: この関数は「JSTの日付」をDATE型として保存するためのもの。
 * JSTの日時を表す場合は formatInTimeZone で変換してから渡すこと。
 */
export function toUtcDateOnly(date: Date): Date {
  // JST に変換して日付部分を取得
  const jstDate = toZonedTime(date, APP_TIMEZONE);
  const year = jstDate.getFullYear();
  const month = jstDate.getMonth();
  const day = jstDate.getDate();

  // その日付を UTC 00:00:00 として返す
  return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}
