import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * @param name Cookie 名
 * @param value Cookie 値
 * @param maxAge 有効期限（秒）
 */
export function setCookie(name: string, value: string, maxAge: number): void {
  // サーバー側実行を防ぐ（SSRでエラーになるのを回避）
  if (typeof document === "undefined") return;

  // 値と名前をエンコードして XSS を防ぐ
  const encodedName = encodeURIComponent(name);
  const encodedValue = encodeURIComponent(value);
  // biome-ignore lint/suspicious: Cookie 設定はユーティリティ関数内で安全に処理（エンコード済み）
  document.cookie = `${encodedName}=${encodedValue}; path=/; max-age=${maxAge}`;
}
