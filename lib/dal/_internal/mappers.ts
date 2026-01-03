/**
 * DAL内部マッパー関数
 * Prisma行データをアプリケーション型に変換
 */
import type { Prisma } from "@prisma/client";
import type {
  BodyPart,
  Exercise,
  ExerciseWithBodyParts,
  ReminderType,
  ScheduledTask,
  ScheduledTaskStatus,
  ScheduledTaskWithSession,
  ScheduleReminder,
  ScheduleRule,
  ScheduleRuleType,
  TemplateExercise,
  WeightRecord,
  WorkoutRecord,
  WorkoutRecordExercise,
  WorkoutRecordSet,
  WorkoutSession,
  WorkoutSessionExercise,
  WorkoutSessionExerciseWithDetails,
  WorkoutSessionWithExercises,
  WorkoutTemplate,
  WorkoutTemplateWithExercises,
} from "@/lib/types";
import { normalizeTimeOfDay, toDecimalNumber, toSafeNumber } from "./helpers";

// =============================================================================
// Row Types (Prisma GetPayload types)
// =============================================================================

export type ExerciseWithBodyPartsRow = Prisma.ExerciseGetPayload<{
  include: {
    bodyParts: {
      include: { bodyPart: true };
    };
  };
}>;

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

export type WorkoutSessionRow = Prisma.WorkoutSessionGetPayload<object>;

export type WorkoutSessionExerciseRow =
  Prisma.WorkoutSessionExerciseGetPayload<object>;

export type WorkoutSessionExerciseWithDetailsRow =
  Prisma.WorkoutSessionExerciseGetPayload<{
    include: {
      exercise: {
        include: {
          bodyParts: {
            include: { bodyPart: true };
          };
        };
      };
    };
  }>;

export type WorkoutSessionWithExercisesRow = Prisma.WorkoutSessionGetPayload<{
  include: {
    template: true;
    exercises: {
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

export type ScheduleRuleRow = Prisma.ScheduleRuleGetPayload<object>;

export type ScheduledTaskRow = Prisma.ScheduledTaskGetPayload<object>;

export type ScheduledTaskWithSessionRow = Prisma.ScheduledTaskGetPayload<{
  include: {
    workoutSession: {
      include: {
        template: true;
        exercises: {
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
    };
    rule: true;
  };
}>;

export type ScheduleReminderRow = Prisma.ScheduleReminderGetPayload<object>;

// =============================================================================
// Mapper Functions
// =============================================================================

export function mapBodyPart(row: {
  id: bigint;
  name: string;
  nameEn: string;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): BodyPart {
  return {
    id: toSafeNumber(row.id, "body_parts.id"),
    name: row.name,
    nameEn: row.nameEn,
    displayOrder: row.displayOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapExercise(row: {
  id: bigint;
  userId: bigint;
  name: string;
  formNote: string | null;
  videoUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): Exercise {
  return {
    id: toSafeNumber(row.id, "exercises.id"),
    userId: toSafeNumber(row.userId, "exercises.user_id"),
    name: row.name,
    formNote: row.formNote ?? undefined,
    videoUrl: row.videoUrl ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? undefined,
  };
}

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

export function mapExerciseWithBodyParts(
  row: ExerciseWithBodyPartsRow,
): ExerciseWithBodyParts {
  return {
    ...mapExercise(row),
    bodyParts: row.bodyParts.map((part) => mapBodyPart(part.bodyPart)),
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

// =============================================================================
// Schedule Mappers
// =============================================================================

export function mapWorkoutSession(row: WorkoutSessionRow): WorkoutSession {
  return {
    id: toSafeNumber(row.id, "workoutSession.id"),
    userId: toSafeNumber(row.userId, "workoutSession.userId"),
    templateId: toSafeNumber(row.templateId, "workoutSession.templateId"),
    name: row.name,
    description: row.description ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? undefined,
  };
}

export function mapWorkoutSessionExercise(
  row: WorkoutSessionExerciseRow,
): WorkoutSessionExercise {
  return {
    id: toSafeNumber(row.id, "workoutSessionExercise.id"),
    workoutSessionId: toSafeNumber(
      row.workoutSessionId,
      "workoutSessionExercise.workoutSessionId",
    ),
    exerciseId: toSafeNumber(
      row.exerciseId,
      "workoutSessionExercise.exerciseId",
    ),
    displayOrder: row.displayOrder,
    targetWeight: row.targetWeight
      ? toDecimalNumber(row.targetWeight)
      : undefined,
    targetReps: row.targetReps ?? undefined,
    targetSets: row.targetSets ?? undefined,
    restSeconds: row.restSeconds ?? undefined,
    note: row.note ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapWorkoutSessionExerciseWithDetails(
  row: WorkoutSessionExerciseWithDetailsRow,
): WorkoutSessionExerciseWithDetails {
  return {
    ...mapWorkoutSessionExercise(row),
    exercise: mapExerciseWithBodyParts(row.exercise),
  };
}

export function mapWorkoutSessionWithExercises(
  row: WorkoutSessionWithExercisesRow,
): WorkoutSessionWithExercises {
  return {
    ...mapWorkoutSession(row),
    template: mapTemplate(row.template),
    exercises: row.exercises
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(mapWorkoutSessionExerciseWithDetails),
  };
}

export function mapScheduleRule(row: ScheduleRuleRow): ScheduleRule {
  return {
    id: toSafeNumber(row.id, "scheduleRule.id"),
    userId: toSafeNumber(row.userId, "scheduleRule.userId"),
    workoutSessionId: toSafeNumber(
      row.workoutSessionId,
      "scheduleRule.workoutSessionId",
    ),
    ruleType: row.ruleType as ScheduleRuleType,
    weekdays: row.weekdays ?? undefined,
    intervalDays: row.intervalDays ?? undefined,
    startDate: row.startDate ?? undefined,
    endDate: row.endDate ?? undefined,
    isEnabled: row.isEnabled,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? undefined,
  };
}

export function mapScheduledTask(row: ScheduledTaskRow): ScheduledTask {
  return {
    id: toSafeNumber(row.id, "scheduledTask.id"),
    userId: toSafeNumber(row.userId, "scheduledTask.userId"),
    ruleId: row.ruleId
      ? toSafeNumber(row.ruleId, "scheduledTask.ruleId")
      : undefined,
    workoutSessionId: toSafeNumber(
      row.workoutSessionId,
      "scheduledTask.workoutSessionId",
    ),
    scheduledDate: row.scheduledDate,
    status: row.status as ScheduledTaskStatus,
    rescheduledTo: row.rescheduledTo ?? undefined,
    rescheduledFrom: row.rescheduledFrom ?? undefined,
    completedAt: row.completedAt ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

export function mapScheduledTaskWithSession(
  row: ScheduledTaskWithSessionRow,
): ScheduledTaskWithSession {
  return {
    ...mapScheduledTask(row),
    workoutSession: mapWorkoutSessionWithExercises(row.workoutSession),
    rule: row.rule ? mapScheduleRule(row.rule) : undefined,
  };
}

export function mapScheduleReminder(
  row: ScheduleReminderRow,
): ScheduleReminder {
  return {
    id: toSafeNumber(row.id, "scheduleReminder.id"),
    userId: toSafeNumber(row.userId, "scheduleReminder.userId"),
    workoutSessionId: toSafeNumber(
      row.workoutSessionId,
      "scheduleReminder.workoutSessionId",
    ),
    reminderType: row.reminderType as ReminderType,
    offsetMinutes: row.offsetMinutes ?? undefined,
    fixedTimeOfDay: row.fixedTimeOfDay
      ? normalizeTimeOfDay(row.fixedTimeOfDay)
      : undefined,
    timezone: row.timezone,
    isEnabled: row.isEnabled,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}
