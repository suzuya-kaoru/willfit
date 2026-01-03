/**
 * Workout Record Mapper
 */
import type { Prisma } from "@prisma/client";
import type {
  WorkoutRecord,
  WorkoutRecordExercise,
  WorkoutRecordSet,
} from "@/lib/types";
import { toDecimalNumber, toSafeNumber } from "./helpers";

export function mapWorkoutRecord(row: {
  id: bigint;
  userId: bigint;
  templateId: bigint;
  startedAt: Date;
  endedAt: Date | null;
  condition: number;
  fatigue: number;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}): WorkoutRecord {
  return {
    id: toSafeNumber(row.id, "workout_records.id"),
    userId: toSafeNumber(row.userId, "workout_records.user_id"),
    templateId: toSafeNumber(row.templateId, "workout_records.template_id"),
    startedAt: row.startedAt,
    endedAt: row.endedAt ?? undefined,
    condition: row.condition,
    fatigue: row.fatigue,
    note: row.note ?? "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapWorkoutRecordExercise(row: {
  id: bigint;
  recordId: bigint;
  exerciseId: bigint;
  createdAt: Date;
  updatedAt: Date;
}): WorkoutRecordExercise {
  return {
    id: toSafeNumber(row.id, "workout_record_exercises.id"),
    recordId: toSafeNumber(row.recordId, "workout_record_exercises.record_id"),
    exerciseId: toSafeNumber(
      row.exerciseId,
      "workout_record_exercises.exercise_id",
    ),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapWorkoutRecordSet(row: {
  id: bigint;
  workoutRecordExerciseId: bigint;
  setNumber: number;
  weight: Prisma.Decimal;
  reps: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}): WorkoutRecordSet {
  return {
    id: toSafeNumber(row.id, "workout_record_sets.id"),
    workoutRecordExerciseId: toSafeNumber(
      row.workoutRecordExerciseId,
      "workout_record_sets.workout_record_exercise_id",
    ),
    setNumber: row.setNumber,
    weight: toDecimalNumber(row.weight),
    reps: row.reps,
    completed: row.completed,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
