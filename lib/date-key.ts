import { parseISO } from "date-fns";
import { formatInTimeZone } from "date-fns-tz";
import { z } from "zod";

export const dateKeySchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "日付形式が不正です");

/**
 * 表示用タイムゾーン
 * カレンダー表示やスケジュールの日付判定はJSTで行う
 */
const DISPLAY_TIMEZONE = "Asia/Tokyo";

/**
 * UTC DateオブジェクトからJSTの日付キー文字列を生成
 *
 * 重要: DBにはUTCで保存されているが、ユーザーへの表示やカレンダー上の
 * 日付判定はJSTで行う必要がある。
 *
 * 例: UTC 2024-01-01T15:00:00Z → JST 2024-01-02 → "2024-01-02"
 */
export function toDateKey(date: Date): string {
  return formatInTimeZone(date, DISPLAY_TIMEZONE, "yyyy-MM-dd");
}

/**
 * 日付キー文字列（JST日付）からUTC Dateオブジェクトを生成
 *
 * 日付キーはJST日付として解釈し、その日の JST 00:00:00 を UTC に変換する。
 * 例: "2024-01-02" → JST 2024-01-02T00:00:00+09:00 → UTC 2024-01-01T15:00:00Z
 *
 * 注意: DATE型（日付のみ）の保存には parseDateKeyForDateType() を使用すること。
 * この関数は「JST の特定日の開始時刻（UTC表現）」を返す。
 */
export function parseDateKey(dateKey: string): Date {
  // 1. 形式チェック
  const result = dateKeySchema.safeParse(dateKey);
  if (!result.success) {
    throw new Error(`Invalid date key format: ${dateKey}`);
  }

  // 2. パース (JST の 00:00:00 として解釈し、UTC に変換)
  const date = new Date(`${dateKey}T00:00:00+09:00`);

  // 3. 有効性チェック
  if (Number.isNaN(date.getTime())) {
    throw new Error(`Invalid date value: ${dateKey}`);
  }

  return date;
}

/**
 * 日付キー文字列からDATE型用のUTC Dateオブジェクトを生成
 *
 * DATE型（日付のみ）として保存する場合は、タイムゾーンを意識せず
 * 単純に UTC 00:00:00 として保存する。
 *
 * 例: "2024-01-02" → UTC 2024-01-02T00:00:00Z
 */
export function parseDateKeyForDateType(dateKey: string): Date {
  return parseISO(`${dateKey}T00:00:00Z`);
}

/**
 * 年月日から日付キー文字列を生成
 *
 * タイムゾーン計算を行わず、渡された数値をそのまま文字列化する。
 * カレンダー生成などで、既にJST基準の年月日が分かっている場合に使用する。
 *
 * @param year JST年
 * @param month JST月 (0-11) Note: Date.getMonth() と合わせるため 0-based
 * @param day JST日
 */
export function formatDateKey(
  year: number,
  month: number,
  day: number,
): string {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}
