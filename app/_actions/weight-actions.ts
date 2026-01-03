"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import {
  deleteWeightRecord,
  upsertWeightRecord,
} from "@/lib/dal/weight-record";
import { getEndOfDayUTC, getStartOfDayUTC } from "@/lib/timezone";

// =============================================================================
// 入力型定義
// =============================================================================

export interface CreateWeightInput {
  weight: number;
  bodyFat?: number;
  recordedAt: Date;
}

export interface UpdateWeightInput extends CreateWeightInput {
  id: bigint;
}

// =============================================================================
// バリデーションスキーマ
// =============================================================================

const createWeightSchema = z.object({
  weight: z
    .number()
    .min(1, "体重は1kg以上")
    .max(500, "体重は500kg以下")
    .default(70),
  bodyFat: z
    .number()
    .min(0, "体脂肪率は0%以上")
    .max(100, "体脂肪率は100%以下")
    .default(0),
  recordedAt: z.date(),
});

// =============================================================================
// Server Actions
// =============================================================================

export async function createWeightRecordAction(
  input: CreateWeightInput,
): Promise<{ success: boolean; error?: string }> {
  try {
    const data = createWeightSchema.parse(input);
    const userId = 1; // TODO: Auth

    // 入力された日付の開始と終了を計算
    const startOfDay = getStartOfDayUTC(data.recordedAt);
    const endOfDay = getEndOfDayUTC(data.recordedAt);

    await upsertWeightRecord(
      userId,
      {
        weight: data.weight,
        bodyFat:
          data.bodyFat !== undefined && data.bodyFat !== null
            ? data.bodyFat
            : undefined,
        recordedAt: data.recordedAt,
      },
      { start: startOfDay, end: endOfDay },
    );

    revalidatePath("/analytics");
    revalidatePath("/settings");
    return { success: true };
  } catch (error) {
    console.error("[createWeightRecordAction] Error:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0]?.message ?? "入力が不正です",
      };
    }
    return { success: false, error: "記録の保存に失敗しました" };
  }
}

export async function deleteWeightRecordAction(id: number) {
  const validId = z.number().int().positive().parse(id);
  const userId = 1; // TODO: 認証実装後に動的取得

  await deleteWeightRecord(userId, validId);

  revalidatePath("/analytics");
  return { success: true };
}
