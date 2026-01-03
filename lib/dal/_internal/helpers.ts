/**
 * DAL内部ヘルパー関数
 * bigint/number変換、Decimal変換、時刻変換を提供
 */
import type { Prisma } from "@prisma/client";

const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);

/**
 * bigintを安全なnumberに変換
 * @throws 安全な数値範囲を超えた場合
 */
export function toSafeNumber(value: bigint, label: string): number {
  if (value > MAX_SAFE_INTEGER || value < -MAX_SAFE_INTEGER) {
    throw new Error(`${label} が安全な数値範囲を超えています。`);
  }
  return Number(value);
}

/**
 * numberをbigintに変換
 * @throws 整数でない場合
 */
export function toBigInt(value: number, label: string): bigint {
  if (!Number.isInteger(value)) {
    throw new Error(`${label} は整数である必要があります。`);
  }
  return BigInt(value);
}

/**
 * number配列をbigint配列に変換
 */
export function toBigIntArray(values: number[], label: string): bigint[] {
  return values.map((value, index) => toBigInt(value, `${label}[${index}]`));
}

/**
 * Prisma.Decimalまたはnumberをnumberに変換
 */
export function toDecimalNumber(value: Prisma.Decimal | number): number {
  return typeof value === "number" ? value : value.toNumber();
}

/**
 * Date/stringから時刻文字列(HH:MM)に正規化
 */
export function normalizeTimeOfDay(value: Date | string): string {
  if (value instanceof Date) {
    const hours = value.getUTCHours();
    const minutes = value.getUTCMinutes();
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}`;
  }
  const [hours, minutes] = value.split(":");
  if (!hours || !minutes) return value;
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

/**
 * 時刻文字列(HH:MM)をDateに変換
 * @throws 不正な形式の場合
 */
export function timeOfDayToDate(value: string): Date {
  const [hoursRaw, minutesRaw] = value.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new Error(`timeOfDayが不正です: ${value}`);
  }
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0, 0));
}
