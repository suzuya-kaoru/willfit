"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { upsertScheduleCheck } from "@/lib/db/queries";

const checkSchema = z.object({
  scheduleId: z.number().int().positive(),
  dateKey: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  status: z.enum(["completed", "skipped"]).optional(),
});

export async function checkScheduleAction(input: {
  scheduleId: number;
  dateKey: string;
  status?: "completed" | "skipped";
}) {
  const { scheduleId, dateKey, status } = checkSchema.parse(input);
  const userId = 1; // TODO: auth

  await upsertScheduleCheck({
    userId,
    weekScheduleId: scheduleId,
    scheduledDateKey: dateKey,
    status: status ?? "completed",
  });

  revalidatePath("/");
}
