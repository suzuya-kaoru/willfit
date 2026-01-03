/**
 * BodyPart DAL
 * 部位（読み取りのみ）
 */
import { prisma } from "@/lib/db/prisma";
import type { BodyPart } from "@/lib/types";
import { mapBodyPart } from "./_internal/body-part.mapper";

/**
 * 全部位を表示順で取得
 */
export async function getBodyParts(): Promise<BodyPart[]> {
  const rows = await prisma.bodyPart.findMany({
    orderBy: { displayOrder: "asc" },
  });
  return rows.map(mapBodyPart);
}
