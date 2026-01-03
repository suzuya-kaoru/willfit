/**
 * Schedule Mapper
 * WorkoutSession, ScheduleRule, ScheduledTask, ScheduleReminder
 */
import type { Prisma } from "@prisma/client";
import type {
  ReminderType,
  ScheduledTask,
  ScheduledTaskStatus,
  ScheduledTaskWithSession,
  ScheduleReminder,
  ScheduleRule,
  ScheduleRuleType,
  WorkoutSession,
  WorkoutSessionExercise,
  WorkoutSessionExerciseWithDetails,
  WorkoutSessionWithExercises,
} from "@/lib/types";
import { mapExerciseWithBodyParts } from "./exercise.mapper";
import { normalizeTimeOfDay, toDecimalNumber, toSafeNumber } from "./helpers";
import { mapTemplate } from "./template.mapper";

// =============================================================================
// Row Types
// =============================================================================

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
