/**
 * Weight Record Mapper
 */
import type { Prisma } from "@prisma/client";
import type { WeightRecord } from "@/lib/types";
import { toDecimalNumber, toSafeNumber } from "./helpers";

export function mapWeightRecord(row: {
  id: bigint;
  userId: bigint;
  recordedAt: Date;
  weight: Prisma.Decimal;
  bodyFat: Prisma.Decimal | null;
  photoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}): WeightRecord {
  return {
    id: toSafeNumber(row.id, "weight_records.id"),
    userId: toSafeNumber(row.userId, "weight_records.user_id"),
    recordedAt: row.recordedAt,
    weight: toDecimalNumber(row.weight),
    bodyFat: row.bodyFat ? toDecimalNumber(row.bodyFat) : undefined,
    photoUrl: row.photoUrl ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
