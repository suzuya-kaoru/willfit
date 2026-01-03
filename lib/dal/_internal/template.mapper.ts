/**
 * Template Mapper
 */
import type { Prisma } from "@prisma/client";
import type {
  TemplateExercise,
  WorkoutTemplate,
  WorkoutTemplateWithExercises,
} from "@/lib/types";
import { mapExerciseWithBodyParts } from "./exercise.mapper";
import { toSafeNumber } from "./helpers";

export type WorkoutTemplateWithExercisesRow = Prisma.WorkoutTemplateGetPayload<{
  include: {
    templateExercises: {
      include: {
        exercise: {
          include: {
            bodyParts: {
              include: { bodyPart: true };
            };
          };
        };
      };
    };
  };
}>;

export function mapTemplate(row: {
  id: bigint;
  userId: bigint;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): WorkoutTemplate {
  return {
    id: toSafeNumber(row.id, "workout_templates.id"),
    userId: toSafeNumber(row.userId, "workout_templates.user_id"),
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? undefined,
  };
}

export function mapTemplateExercise(row: {
  id: bigint;
  templateId: bigint;
  exerciseId: bigint;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): TemplateExercise {
  return {
    id: toSafeNumber(row.id, "template_exercises.id"),
    templateId: toSafeNumber(row.templateId, "template_exercises.template_id"),
    exerciseId: toSafeNumber(row.exerciseId, "template_exercises.exercise_id"),
    displayOrder: row.displayOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapTemplateWithExercises(
  row: WorkoutTemplateWithExercisesRow,
): WorkoutTemplateWithExercises {
  return {
    ...mapTemplate(row),
    exercises: row.templateExercises.map((entry) =>
      mapExerciseWithBodyParts(entry.exercise),
    ),
  };
}
