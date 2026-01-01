"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { getEndOfDay, getStartOfDay } from "@/lib/timezone";

// =============================================================================
// バリデーションスキーマ
// =============================================================================

const createWeightSchema = z.object({
  weight: z.number().min(1).max(500),
  bodyFat: z.number().min(1).max(100).optional(),
  recordedAt: z.date(),
});

const updateWeightSchema = createWeightSchema.extend({
  id: z.bigint(),
});

// =============================================================================
// 入力型定義
// =============================================================================

export type CreateWeightInput = z.infer<typeof createWeightSchema>;
export type UpdateWeightInput = z.infer<typeof updateWeightSchema>;

// =============================================================================
// Server Actions
// =============================================================================

export async function createWeightRecordAction(input: CreateWeightInput) {
  const data = createWeightSchema.parse(input);
  const userId = 1; // TODO: Auth

  // 入力された日付の開始と終了を計算
  const startOfDay = getStartOfDay(data.recordedAt);
  const endOfDay = getEndOfDay(data.recordedAt);

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
        weight: data.weight,
        bodyFat: data.bodyFat,
        recordedAt: data.recordedAt, // 時刻も最新の入力に合わせて更新
      },
    });
  } else {
    // なければ新規作成
    await prisma.weightRecord.create({
      data: {
        userId,
        weight: data.weight,
        bodyFat: data.bodyFat,
        recordedAt: data.recordedAt,
      },
    });
  }

  revalidatePath("/analytics");
  revalidatePath("/settings"); // 旧画面も念のため
  return { success: true };
}

export async function deleteWeightRecordAction(id: number) {
  const userId = 1;

  await prisma.weightRecord.delete({
    where: {
      id,
      userId,
    },
  });

  revalidatePath("/analytics");
  return { success: true };
}
