"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { parseDateKey } from "@/lib/date-key";
import {
  createRoutine,
  deleteRoutine,
  getRoutineByMenuId,
  updateRoutine,
} from "@/lib/db/queries";

// =============================================================================
// Zodスキーマ
// =============================================================================

const weeklyRoutineSchema = z.object({
  menuId: z.number().int().positive("メニューIDは正の整数である必要があります"),
  routineType: z.literal("weekly"),
  weekdays: z
    .number()
    .int()
    .min(1, "曜日を1つ以上選択してください")
    .max(127, "無効な曜日の組み合わせです"),
});

const intervalRoutineSchema = z.object({
  menuId: z.number().int().positive("メニューIDは正の整数である必要があります"),
  routineType: z.literal("interval"),
  intervalDays: z
    .number()
    .int()
    .min(1, "間隔は1日以上である必要があります")
    .max(365, "間隔は365日以下である必要があります"),
  startDateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "日付形式が不正です"),
});

const createRoutineSchema = z.discriminatedUnion("routineType", [
  weeklyRoutineSchema,
  intervalRoutineSchema,
]);

const updateRoutineSchema = z
  .object({
    routineId: z.number().int().positive(),
    routineType: z.enum(["weekly", "interval"]).optional(),
    weekdays: z.number().int().min(1).max(127).optional().nullable(),
    intervalDays: z.number().int().min(1).max(365).optional().nullable(),
    startDateKey: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .optional()
      .nullable(),
    isEnabled: z.boolean().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.routineType === "weekly" && !data.weekdays) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["weekdays"],
        message: "週次ルーティンでは曜日が必須です",
      });
    }
    if (data.routineType === "interval") {
      if (!data.intervalDays) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["intervalDays"],
          message: "間隔ルーティンでは日数が必須です",
        });
      }
      if (!data.startDateKey) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["startDateKey"],
          message: "間隔ルーティンでは開始日が必須です",
        });
      }
    }
  });

// =============================================================================
// 型定義
// =============================================================================

export type CreateRoutineInput = z.infer<typeof createRoutineSchema>;
export type UpdateRoutineInput = z.infer<typeof updateRoutineSchema>;

// =============================================================================
// Server Actions
// =============================================================================

/**
 * ルーティンを作成
 */
export async function createRoutineAction(input: CreateRoutineInput) {
  const data = createRoutineSchema.parse(input);
  const userId = 1; // TODO: 認証実装後に動的取得

  // 同一メニューに既存ルーティンがないか確認
  const existing = await getRoutineByMenuId(userId, data.menuId);
  if (existing) {
    throw new Error("このメニューには既にルーティンが設定されています");
  }

  const routine = await createRoutine({
    userId,
    menuId: data.menuId,
    routineType: data.routineType,
    weekdays: data.routineType === "weekly" ? data.weekdays : undefined,
    intervalDays:
      data.routineType === "interval" ? data.intervalDays : undefined,
    startDate:
      data.routineType === "interval"
        ? parseDateKey(data.startDateKey)
        : undefined,
  });

  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/settings");

  return { id: routine.id };
}

/**
 * ルーティンを更新
 */
export async function updateRoutineAction(input: UpdateRoutineInput) {
  const data = updateRoutineSchema.parse(input);
  // const userId = 1; // TODO: 認証実装後に動的取得

  await updateRoutine(data.routineId, {
    routineType: data.routineType,
    weekdays: data.weekdays,
    intervalDays: data.intervalDays,
    startDate: data.startDateKey ? parseDateKey(data.startDateKey) : null,
    isEnabled: data.isEnabled,
  });

  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/settings");

  return { success: true };
}

/**
 * ルーティンを削除（論理削除）
 */
export async function deleteRoutineAction(routineId: number) {
  const validId = z.number().int().positive().parse(routineId);
  // const userId = 1; // TODO: 認証実装後に動的取得

  await deleteRoutine(validId);

  revalidatePath("/");
  revalidatePath("/schedule");
  revalidatePath("/settings");

  return { success: true };
}
