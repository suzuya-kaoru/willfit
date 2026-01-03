/**
 * WeightRecord DAL
 * 体重記録のCRUD操作
 */
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db/prisma";
import type { WeightRecord } from "@/lib/types";
import { toBigInt } from "./_internal/helpers";
import { mapWeightRecord } from "./_internal/mappers";

// =============================================================================
// Query Functions
// =============================================================================

/**
 * ユーザーの全体重記録を取得
 */
export async function getWeightRecords(
  userId: number,
): Promise<WeightRecord[]> {
  const rows = await prisma.weightRecord.findMany({
    where: { userId: toBigInt(userId, "userId") },
    orderBy: { recordedAt: "desc" },
  });
  return rows.map(mapWeightRecord);
}

// =============================================================================
// Mutation Types
// =============================================================================

export interface SaveWeightRecordParams {
  weight: number;
  bodyFat?: number;
  recordedAt: Date;
}

// =============================================================================
// Mutation Functions
// =============================================================================

/**
 * 体重記録を作成または更新
 */
export async function upsertWeightRecord(
  userId: number,
  params: SaveWeightRecordParams,
  dateRange: { start: Date; end: Date },
) {
  const { weight, bodyFat, recordedAt } = params;
  const { start, end } = dateRange;
  const userBigId = toBigInt(userId, "userId");

  const weightDecimal = new Prisma.Decimal(weight);
  const bodyFatDecimal =
    bodyFat !== undefined && bodyFat !== null
      ? new Prisma.Decimal(bodyFat)
      : null;

  const existingRecord = await prisma.weightRecord.findFirst({
    where: {
      userId: userBigId,
      recordedAt: { gte: start, lte: end },
    },
  });

  if (existingRecord) {
    await prisma.weightRecord.update({
      where: { id: existingRecord.id },
      data: {
        weight: weightDecimal,
        bodyFat: bodyFatDecimal,
        recordedAt,
      },
    });
  } else {
    await prisma.weightRecord.create({
      data: {
        userId: userBigId,
        weight: weightDecimal,
        bodyFat: bodyFatDecimal,
        recordedAt,
      },
    });
  }
}

/**
 * 体重記録を削除
 */
export async function deleteWeightRecord(userId: number, recordId: number) {
  await prisma.weightRecord.delete({
    where: {
      id: toBigInt(recordId, "recordId"),
      userId: toBigInt(userId, "userId"),
    },
  });
}
