"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getEndOfDay, getStartOfDay } from "@/lib/timezone";

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
    const startOfDay = getStartOfDay(data.recordedAt);
    const endOfDay = getEndOfDay(data.recordedAt);

    // Decimal型に変換
    const weightDecimal = new Prisma.Decimal(data.weight);
    // 0も有効な値として扱うために null/undefined チェックに変更
    const bodyFatDecimal =
      data.bodyFat !== null && data.bodyFat !== undefined
        ? new Prisma.Decimal(data.bodyFat)
        : null;

    // 同日の記録があるか確認
    const existingRecord = await prisma.weightRecord.findFirst({
      where: {
        userId,
        recordedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    if (existingRecord) {
      // 既存レコードがあれば更新
      await prisma.weightRecord.update({
        where: { id: existingRecord.id },
        data: {
          weight: weightDecimal,
          bodyFat: bodyFatDecimal,
          recordedAt: data.recordedAt,
        },
      });
    } else {
      // なければ新規作成
      await prisma.weightRecord.create({
        data: {
          userId,
          weight: weightDecimal,
          bodyFat: bodyFatDecimal,
          recordedAt: data.recordedAt,
        },
      });
    }

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

  await prisma.weightRecord.delete({
    where: {
      id: validId,
      userId,
    },
  });

  revalidatePath("/analytics");
  return { success: true };
}
