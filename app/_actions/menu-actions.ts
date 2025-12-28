"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db/prisma";

export async function createMenuAction(input: {
  name: string;
  exerciseIds: number[];
}) {
  const userId = 1;
  const menu = await prisma.workoutMenu.create({
    data: {
      userId: BigInt(userId),
      name: input.name,
      menuExercises: {
        create: input.exerciseIds.map((exerciseId, index) => ({
          exerciseId: BigInt(exerciseId),
          displayOrder: index + 1,
        })),
      },
    },
  });

  revalidatePath("/settings");
  return {
    id: Number(menu.id),
    name: menu.name,
  };
}
