import { Prisma } from "@prisma/client";
import { toUtcDateOnly } from "@/lib/timezone";
import type {
  BodyPart,
  Exercise,
  WorkoutRecordExercise,
  ExerciseWithBodyParts,
  TemplateExercise,
  ReminderType,
  ScheduledTask,
  ScheduledTaskStatus,
  ScheduledTaskWithSession,
  ScheduleReminder,
  ScheduleRule,
  ScheduleRuleType,
  // スケジュール機能
  WorkoutSession,
  WorkoutSessionExercise,
  WorkoutSessionExerciseWithDetails,
  WorkoutSessionWithExercises,
  WorkoutSessionWithRules,
  WeightRecord,
  WorkoutTemplate,
  WorkoutTemplateWithExercises,
  WorkoutRecord,
  WorkoutRecordSet,
} from "@/lib/types";
import { prisma } from "./prisma";

const MAX_SAFE_INTEGER = BigInt(Number.MAX_SAFE_INTEGER);

function toSafeNumber(value: bigint, label: string): number {
  if (value > MAX_SAFE_INTEGER || value < -MAX_SAFE_INTEGER) {
    throw new Error(`${label} が安全な数値範囲を超えています。`);
  }
  return Number(value);
}

function toBigInt(value: number, label: string): bigint {
  if (!Number.isInteger(value)) {
    throw new Error(`${label} は整数である必要があります。`);
  }
  return BigInt(value);
}

function toBigIntArray(values: number[], label: string): bigint[] {
  return values.map((value, index) => toBigInt(value, `${label}[${index}]`));
}

function toDecimalNumber(value: Prisma.Decimal | number): number {
  return typeof value === "number" ? value : value.toNumber();
}

function normalizeTimeOfDay(value: Date | string): string {
  if (value instanceof Date) {
    const hours = value.getUTCHours();
    const minutes = value.getUTCMinutes();
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(
      2,
      "0",
    )}`;
  }
  const [hours, minutes] = value.split(":");
  if (!hours || !minutes) return value;
  return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`;
}

function timeOfDayToDate(value: string): Date {
  const [hoursRaw, minutesRaw] = value.split(":");
  const hours = Number(hoursRaw);
  const minutes = Number(minutesRaw);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    throw new Error(`timeOfDayが不正です: ${value}`);
  }
  return new Date(Date.UTC(1970, 0, 1, hours, minutes, 0, 0));
}

// function toUtcDateOnly moved to @/lib/timezone

type ExerciseWithBodyPartsRow = Prisma.ExerciseGetPayload<{
  include: {
    bodyParts: {
      include: { bodyPart: true };
    };
  };
}>;

type WorkoutTemplateWithExercisesRow = Prisma.WorkoutTemplateGetPayload<{
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

function mapBodyPart(row: {
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

function mapExercise(row: {
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

function mapTemplate(row: {
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

function mapTemplateExercise(row: {
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

function mapWorkoutRecord(row: {
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

function mapWorkoutRecordExercise(row: {
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

function mapWorkoutRecordSet(row: {
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

function mapWeightRecord(row: {
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

function mapExerciseWithBodyParts(
  row: ExerciseWithBodyPartsRow,
): ExerciseWithBodyParts {
  return {
    ...mapExercise(row),
    bodyParts: row.bodyParts.map((part) => mapBodyPart(part.bodyPart)),
  };
}

function mapTemplateWithExercises(
  row: WorkoutTemplateWithExercisesRow,
): WorkoutTemplateWithExercises {
  return {
    ...mapTemplate(row),
    exercises: row.templateExercises.map((entry) =>
      mapExerciseWithBodyParts(entry.exercise),
    ),
  };
}

export async function getBodyParts(): Promise<BodyPart[]> {
  const rows = await prisma.bodyPart.findMany({
    orderBy: { displayOrder: "asc" },
  });
  return rows.map(mapBodyPart);
}

export async function getExercisesWithBodyPartsByIds(
  userId: number,
  exerciseIds: number[],
): Promise<ExerciseWithBodyParts[]> {
  if (exerciseIds.length === 0) return [];
  const userIdBig = toBigInt(userId, "userId");
  const exerciseIdList = toBigIntArray(exerciseIds, "exerciseIds");

  const rows = await prisma.exercise.findMany({
    where: {
      userId: userIdBig,
      deletedAt: null,
      id: { in: exerciseIdList },
    },
    orderBy: { id: "asc" },
    include: {
      bodyParts: {
        include: { bodyPart: true },
        orderBy: { bodyPart: { displayOrder: "asc" } },
      },
    },
  });

  return rows.map(mapExerciseWithBodyParts);
}

export async function getExercisesWithBodyParts(
  userId: number,
): Promise<ExerciseWithBodyParts[]> {
  const userIdBig = toBigInt(userId, "userId");
  const rows = await prisma.exercise.findMany({
    where: { userId: userIdBig, deletedAt: null },
    orderBy: { id: "asc" },
    include: {
      bodyParts: {
        include: { bodyPart: true },
        orderBy: { bodyPart: { displayOrder: "asc" } },
      },
    },
  });

  return rows.map(mapExerciseWithBodyParts);
}

export async function getTemplateWithExercises(
  userId: number,
  templateId: number,
): Promise<WorkoutTemplateWithExercises | null> {
  const template = await prisma.workoutTemplate.findFirst({
    where: {
      id: toBigInt(templateId, "templateId"),
      userId: toBigInt(userId, "userId"),
      deletedAt: null,
    },
    include: {
      templateExercises: {
        where: { exercise: { deletedAt: null } },
        orderBy: { displayOrder: "asc" },
        include: {
          exercise: {
            include: {
              bodyParts: {
                include: { bodyPart: true },
                orderBy: { bodyPart: { displayOrder: "asc" } },
              },
            },
          },
        },
      },
    },
  });

  if (!template) return null;
  return mapTemplateWithExercises(template);
}

export async function getTemplatesWithExercises(
  userId: number,
): Promise<WorkoutTemplateWithExercises[]> {
  const rows = await prisma.workoutTemplate.findMany({
    where: { userId: toBigInt(userId, "userId"), deletedAt: null },
    orderBy: { createdAt: "asc" },
    include: {
      templateExercises: {
        where: { exercise: { deletedAt: null } },
        orderBy: { displayOrder: "asc" },
        include: {
          exercise: {
            include: {
              bodyParts: {
                include: { bodyPart: true },
                orderBy: { bodyPart: { displayOrder: "asc" } },
              },
            },
          },
        },
      },
    },
  });

  return rows.map(mapTemplateWithExercises);
}

export async function getTemplates(userId: number): Promise<WorkoutTemplate[]> {
  const rows = await prisma.workoutTemplate.findMany({
    where: { userId: toBigInt(userId, "userId"), deletedAt: null },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapTemplate);
}

export async function getTemplatesByIds(
  userId: number,
  templateIds: number[],
): Promise<WorkoutTemplate[]> {
  if (templateIds.length === 0) return [];
  const rows = await prisma.workoutTemplate.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      deletedAt: null,
      id: { in: toBigIntArray(templateIds, "templateIds") },
    },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapTemplate);
}

export async function getTemplateExercisesByTemplateIds(
  templateIds: number[],
): Promise<TemplateExercise[]> {
  if (templateIds.length === 0) return [];
  const rows = await prisma.templateExercise.findMany({
    where: { templateId: { in: toBigIntArray(templateIds, "templateIds") } },
    orderBy: [{ templateId: "asc" }, { displayOrder: "asc" }],
  });
  return rows.map(mapTemplateExercise);
}

export async function getWorkoutRecordsByDateRange(
  userId: number,
  startDate: Date,
  endDate: Date,
): Promise<WorkoutRecord[]> {
  const rows = await prisma.workoutRecord.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      startedAt: { gte: startDate, lte: endDate },
    },
    orderBy: { startedAt: "desc" },
  });
  return rows.map(mapWorkoutRecord);
}

/**
 * 月間の統計情報を取得
 */
export async function getMonthlyStats(
  userId: number,
  year: number,
  month: number,
): Promise<{ totalVolume: number; workoutCount: number }> {
  // 月初と月末を計算
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  // 指定期間のセッションを取得
  const records = await prisma.workoutRecord.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      startedAt: { gte: startDate, lte: endDate },
    },
    select: { id: true },
  });

  const recordIds = records.map((s: { id: bigint }) => s.id);

  if (recordIds.length === 0) {
    return { totalVolume: 0, workoutCount: 0 };
  }

  // 期間内のセット情報を取得してボリュームを計算
  const workoutRecordSets = await prisma.workoutRecordSet.findMany({
    where: {
      workoutRecordExercise: {
        recordId: { in: recordIds },
      },
      completed: true,
    },
    select: {
      weight: true,
      reps: true,
    },
  });

  // 総重量計算 (kg * reps)
  const totalVolume = workoutRecordSets.reduce((sum, set) => {
    return sum + set.weight.toNumber() * set.reps;
  }, 0);

  return {
    totalVolume,
    workoutCount: recordIds.length,
  };
}

export async function getWorkoutRecordsByTemplateIds(
  userId: number,
  templateIds: number[],
): Promise<WorkoutRecord[]> {
  if (templateIds.length === 0) return [];
  const rows = await prisma.workoutRecord.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      templateId: { in: toBigIntArray(templateIds, "templateIds") },
    },
    orderBy: { startedAt: "desc" },
  });
  return rows.map(mapWorkoutRecord);
}

export async function getWorkoutRecords(
  userId: number,
): Promise<WorkoutRecord[]> {
  const rows = await prisma.workoutRecord.findMany({
    where: { userId: toBigInt(userId, "userId") },
    orderBy: { startedAt: "desc" },
  });
  return rows.map(mapWorkoutRecord);
}

export async function getWorkoutRecordExercisesByRecordIds(
  recordIds: number[],
): Promise<WorkoutRecordExercise[]> {
  if (recordIds.length === 0) return [];
  const rows = await prisma.workoutRecordExercise.findMany({
    where: { recordId: { in: toBigIntArray(recordIds, "recordIds") } },
  });
  return rows.map(mapWorkoutRecordExercise);
}

export async function getWorkoutRecordSetsByExerciseIds(
  workoutRecordExerciseIds: number[],
): Promise<WorkoutRecordSet[]> {
  if (workoutRecordExerciseIds.length === 0) return [];
  const rows = await prisma.workoutRecordSet.findMany({
    where: {
      workoutRecordExerciseId: {
        in: toBigIntArray(workoutRecordExerciseIds, "workoutRecordExerciseIds"),
      },
    },
    orderBy: [{ workoutRecordExerciseId: "asc" }, { setNumber: "asc" }],
  });
  return rows.map(mapWorkoutRecordSet);
}

export async function getWeightRecords(
  userId: number,
): Promise<WeightRecord[]> {
  const rows = await prisma.weightRecord.findMany({
    where: { userId: toBigInt(userId, "userId") },
    orderBy: { recordedAt: "desc" },
  });
  return rows.map(mapWeightRecord);
}

/**
 * トレーニング記録詳細を取得（種目・セット情報含む）
 */
export interface WorkoutRecordWithDetails extends WorkoutRecord {
  template: {
    id: number;
    name: string;
  };
  workoutRecordExercises: {
    id: number;
    exerciseId: number;
    exercise: ExerciseWithBodyParts;
    sets: WorkoutRecordSet[];
  }[];
}

export async function getWorkoutRecordWithDetails(
  userId: number,
  recordId: number,
): Promise<WorkoutRecordWithDetails | null> {
  const row = await prisma.workoutRecord.findFirst({
    where: {
      id: toBigInt(recordId, "recordId"),
      userId: toBigInt(userId, "userId"),
    },
    include: {
      template: true,
      workoutRecordExercises: {
        include: {
          exercise: {
            include: {
              bodyParts: {
                include: { bodyPart: true },
                orderBy: { bodyPart: { displayOrder: "asc" } },
              },
            },
          },
          workoutRecordSets: {
            orderBy: { setNumber: "asc" },
          },
        },
      },
    },
  });

  if (!row) return null;

  return {
    ...mapWorkoutRecord(row),
    template: {
      id: toSafeNumber(row.template.id, "workout_templates.id"),
      name: row.template.name,
    },
    workoutRecordExercises: row.workoutRecordExercises.map((er) => ({
      id: toSafeNumber(er.id, "workout_record_exercises.id"),
      exerciseId: toSafeNumber(
        er.exerciseId,
        "workout_record_exercises.exercise_id",
      ),
      exercise: mapExerciseWithBodyParts(er.exercise),
      sets: er.workoutRecordSets.map(mapWorkoutRecordSet),
    })),
  };
}

// =============================================================================
// スケジュール機能（WorkoutSession ベース）
// =============================================================================

// -----------------------------------------------------------------------------
// マッパー関数
// -----------------------------------------------------------------------------

type WorkoutSessionRow = Prisma.WorkoutSessionGetPayload<object>;

function mapWorkoutSession(row: WorkoutSessionRow): WorkoutSession {
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

type WorkoutSessionExerciseRow =
  Prisma.WorkoutSessionExerciseGetPayload<object>;

function mapWorkoutSessionExercise(
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

type WorkoutSessionExerciseWithDetailsRow =
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

function mapWorkoutSessionExerciseWithDetails(
  row: WorkoutSessionExerciseWithDetailsRow,
): WorkoutSessionExerciseWithDetails {
  return {
    ...mapWorkoutSessionExercise(row),
    exercise: mapExerciseWithBodyParts(row.exercise),
  };
}

type WorkoutSessionWithExercisesRow = Prisma.WorkoutSessionGetPayload<{
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

function mapWorkoutSessionWithExercises(
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

type ScheduleRuleRow = Prisma.ScheduleRuleGetPayload<object>;

function mapScheduleRule(row: ScheduleRuleRow): ScheduleRule {
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

type ScheduledTaskRow = Prisma.ScheduledTaskGetPayload<object>;

function mapScheduledTask(row: ScheduledTaskRow): ScheduledTask {
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

type ScheduledTaskWithSessionRow = Prisma.ScheduledTaskGetPayload<{
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

function mapScheduledTaskWithSession(
  row: ScheduledTaskWithSessionRow,
): ScheduledTaskWithSession {
  return {
    ...mapScheduledTask(row),
    workoutSession: mapWorkoutSessionWithExercises(row.workoutSession),
    rule: row.rule ? mapScheduleRule(row.rule) : undefined,
  };
}

type ScheduleReminderRow = Prisma.ScheduleReminderGetPayload<object>;

function mapScheduleReminder(row: ScheduleReminderRow): ScheduleReminder {
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

// -----------------------------------------------------------------------------
// WorkoutSession CRUD
// -----------------------------------------------------------------------------

/**
 * ワークアウトセッションを作成
 */
export async function createWorkoutSession(input: {
  userId: number;
  templateId: number;
  name: string;
  description?: string;
  exercises: {
    exerciseId: number;
    displayOrder: number;
    targetWeight?: number;
    targetReps?: number;
    targetSets?: number;
    restSeconds?: number;
    note?: string;
  }[];
}): Promise<WorkoutSession> {
  const row = await prisma.workoutSession.create({
    data: {
      userId: toBigInt(input.userId, "userId"),
      templateId: toBigInt(input.templateId, "templateId"),
      name: input.name,
      description: input.description,
      exercises: {
        create: input.exercises.map((ex) => ({
          exerciseId: toBigInt(ex.exerciseId, "exerciseId"),
          displayOrder: ex.displayOrder,
          targetWeight: ex.targetWeight,
          targetReps: ex.targetReps,
          targetSets: ex.targetSets,
          restSeconds: ex.restSeconds,
          note: ex.note,
        })),
      },
    },
  });
  return mapWorkoutSession(row);
}

/**
 * ワークアウトセッション一覧を取得（削除済み除く）
 */
export async function getWorkoutSessions(
  userId: number,
): Promise<WorkoutSessionWithExercises[]> {
  const rows = await prisma.workoutSession.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      deletedAt: null,
    },
    include: {
      template: true,
      exercises: {
        include: {
          exercise: {
            include: {
              bodyParts: {
                include: { bodyPart: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return rows.map(mapWorkoutSessionWithExercises);
}

/**
 * ワークアウトセッションを取得（種目・ルール・リマインダー付き）
 */
export async function getWorkoutSessionWithDetails(
  userId: number,
  workoutSessionId: number,
): Promise<WorkoutSessionWithRules | null> {
  const row = await prisma.workoutSession.findFirst({
    where: {
      id: toBigInt(workoutSessionId, "workoutSessionId"),
      userId: toBigInt(userId, "userId"),
      deletedAt: null,
    },
    include: {
      template: true,
      exercises: {
        include: {
          exercise: {
            include: {
              bodyParts: {
                include: { bodyPart: true },
              },
            },
          },
        },
      },
      scheduleRules: {
        where: { deletedAt: null },
      },
      reminders: true,
    },
  });
  if (!row) return null;
  return {
    ...mapWorkoutSessionWithExercises(row),
    scheduleRules: row.scheduleRules.map(mapScheduleRule),
    reminders: row.reminders.map(mapScheduleReminder),
  };
}

/**
 * ワークアウトセッションを更新
 */
export async function updateWorkoutSession(input: {
  workoutSessionId: number;
  userId: number;
  name?: string;
  description?: string;
  exercises?: {
    exerciseId: number;
    displayOrder: number;
    targetWeight?: number;
    targetReps?: number;
    targetSets?: number;
    restSeconds?: number;
    note?: string;
  }[];
}): Promise<WorkoutSession> {
  const row = await prisma.$transaction(async (tx) => {
    // 種目の更新がある場合は削除して再作成
    if (input.exercises) {
      await tx.workoutSessionExercise.deleteMany({
        where: {
          workoutSessionId: toBigInt(
            input.workoutSessionId,
            "workoutSessionId",
          ),
        },
      });
    }

    return tx.workoutSession.update({
      where: { id: toBigInt(input.workoutSessionId, "workoutSessionId") },
      data: {
        name: input.name,
        description: input.description,
        exercises: input.exercises
          ? {
              create: input.exercises.map((ex) => ({
                exerciseId: toBigInt(ex.exerciseId, "exerciseId"),
                displayOrder: ex.displayOrder,
                targetWeight: ex.targetWeight,
                targetReps: ex.targetReps,
                targetSets: ex.targetSets,
                restSeconds: ex.restSeconds,
                note: ex.note,
              })),
            }
          : undefined,
      },
    });
  });
  return mapWorkoutSession(row);
}

/**
 * ワークアウトセッションを論理削除
 */
export async function deleteWorkoutSession(
  _userId: number,
  workoutSessionId: number,
): Promise<void> {
  await prisma.workoutSession.update({
    where: { id: toBigInt(workoutSessionId, "workoutSessionId") },
    data: { deletedAt: new Date() },
  });
}

// -----------------------------------------------------------------------------
// ScheduleRule CRUD
// -----------------------------------------------------------------------------

/**
 * スケジュールルールを作成
 */
export async function createScheduleRule(input: {
  userId: number;
  workoutSessionId: number;
  ruleType: ScheduleRuleType;
  weekdays?: number;
  intervalDays?: number;
  startDate?: Date;
  endDate?: Date;
}): Promise<ScheduleRule> {
  const row = await prisma.scheduleRule.create({
    data: {
      userId: toBigInt(input.userId, "userId"),
      workoutSessionId: toBigInt(input.workoutSessionId, "workoutSessionId"),
      ruleType: input.ruleType,
      weekdays: input.weekdays,
      intervalDays: input.intervalDays,
      startDate: input.startDate ? toUtcDateOnly(input.startDate) : null,
      endDate: input.endDate ? toUtcDateOnly(input.endDate) : null,
      isEnabled: true,
    },
  });
  return mapScheduleRule(row);
}

/**
 * 有効なスケジュールルール一覧を取得
 */
export async function getActiveScheduleRules(
  userId: number,
): Promise<ScheduleRule[]> {
  const rows = await prisma.scheduleRule.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      isEnabled: true,
      deletedAt: null,
    },
  });
  return rows.map(mapScheduleRule);
}

/**
 * ワークアウトセッションのスケジュールルール一覧を取得
 */
export async function getScheduleRulesBySession(
  userId: number,
  workoutSessionId: number,
): Promise<ScheduleRule[]> {
  const rows = await prisma.scheduleRule.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      workoutSessionId: toBigInt(workoutSessionId, "workoutSessionId"),
      deletedAt: null,
    },
  });
  return rows.map(mapScheduleRule);
}

/**
 * 特定のスケジュールルールを取得
 */
export async function getScheduleRuleById(
  userId: number,
  ruleId: number,
): Promise<ScheduleRule | null> {
  const row = await prisma.scheduleRule.findFirst({
    where: {
      id: toBigInt(ruleId, "ruleId"),
      userId: toBigInt(userId, "userId"),
      deletedAt: null,
    },
  });
  return row ? mapScheduleRule(row) : null;
}

/**
 * スケジュールルールを更新
 */
export async function updateScheduleRule(input: {
  ruleId: number;
  weekdays?: number;
  intervalDays?: number;
  startDate?: Date;
  endDate?: Date;
  isEnabled?: boolean;
}): Promise<ScheduleRule> {
  const row = await prisma.scheduleRule.update({
    where: { id: toBigInt(input.ruleId, "ruleId") },
    data: {
      weekdays: input.weekdays,
      intervalDays: input.intervalDays,
      startDate: input.startDate ? toUtcDateOnly(input.startDate) : undefined,
      endDate: input.endDate ? toUtcDateOnly(input.endDate) : undefined,
      isEnabled: input.isEnabled,
    },
  });
  return mapScheduleRule(row);
}

/**
 * スケジュールルールを論理削除
 */
export async function deleteScheduleRule(ruleId: number): Promise<void> {
  await prisma.scheduleRule.update({
    where: { id: toBigInt(ruleId, "ruleId") },
    data: { deletedAt: new Date() },
  });
}

// -----------------------------------------------------------------------------
// ScheduledTask CRUD
// -----------------------------------------------------------------------------

/**
 * スケジュールタスクを作成
 */
export async function createScheduledTask(input: {
  userId: number;
  ruleId?: number;
  workoutSessionId: number;
  scheduledDate: Date;
}): Promise<ScheduledTask> {
  const row = await prisma.scheduledTask.create({
    data: {
      userId: toBigInt(input.userId, "userId"),
      ruleId: input.ruleId ? toBigInt(input.ruleId, "ruleId") : null,
      workoutSessionId: toBigInt(input.workoutSessionId, "workoutSessionId"),
      scheduledDate: toUtcDateOnly(input.scheduledDate),
      status: "pending",
    },
  });
  return mapScheduledTask(row);
}

/**
 * スケジュールタスクを一括作成
 */
export async function createScheduledTasks(
  tasks: {
    userId: number;
    ruleId?: number;
    workoutSessionId: number;
    scheduledDate: Date;
  }[],
): Promise<number> {
  const result = await prisma.scheduledTask.createMany({
    data: tasks.map((t) => ({
      userId: toBigInt(t.userId, "userId"),
      ruleId: t.ruleId ? toBigInt(t.ruleId, "ruleId") : null,
      workoutSessionId: toBigInt(t.workoutSessionId, "workoutSessionId"),
      scheduledDate: toUtcDateOnly(t.scheduledDate),
      status: "pending" as const,
    })),
    skipDuplicates: true,
  });
  return result.count;
}

/**
 * 期間内のスケジュールタスクを取得
 */
export async function getScheduledTasksByDateRange(
  userId: number,
  fromDate: Date,
  toDate: Date,
): Promise<ScheduledTask[]> {
  const rows = await prisma.scheduledTask.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      scheduledDate: {
        gte: toUtcDateOnly(fromDate),
        lte: toUtcDateOnly(toDate),
      },
    },
    orderBy: { scheduledDate: "asc" },
  });
  return rows.map(mapScheduledTask);
}

/**
 * 期間内のスケジュールタスクを取得（セッション情報付き）
 */
export async function getScheduledTasksWithSessionByDateRange(
  userId: number,
  fromDate: Date,
  toDate: Date,
): Promise<ScheduledTaskWithSession[]> {
  const rows = await prisma.scheduledTask.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      scheduledDate: {
        gte: toUtcDateOnly(fromDate),
        lte: toUtcDateOnly(toDate),
      },
    },
    include: {
      workoutSession: {
        include: {
          template: true,
          exercises: {
            include: {
              exercise: {
                include: {
                  bodyParts: {
                    include: { bodyPart: true },
                  },
                },
              },
            },
          },
        },
      },
      rule: true,
    },
    orderBy: { scheduledDate: "asc" },
  });
  return rows.map(mapScheduledTaskWithSession);
}

/**
 * スケジュールタスクのステータスを更新
 */
export async function updateScheduledTaskStatus(input: {
  taskId: number;
  status: ScheduledTaskStatus;
  completedAt?: Date;
}): Promise<ScheduledTask> {
  const row = await prisma.scheduledTask.update({
    where: { id: toBigInt(input.taskId, "taskId") },
    data: {
      status: input.status,
      completedAt: input.completedAt,
    },
  });
  return mapScheduledTask(row);
}

/**
 * スケジュールタスクを振替
 */
export async function rescheduleTask(input: {
  userId: number;
  taskId: number;
  toDate: Date;
}): Promise<{ originalTask: ScheduledTask; newTask: ScheduledTask }> {
  const result = await prisma.$transaction(async (tx) => {
    // 元のタスクを取得
    const original = await tx.scheduledTask.findUnique({
      where: { id: toBigInt(input.taskId, "taskId") },
    });
    if (!original) throw new Error("タスクが見つかりません");

    // 元のタスクを振替済みに更新
    const updatedOriginal = await tx.scheduledTask.update({
      where: { id: toBigInt(input.taskId, "taskId") },
      data: {
        status: "rescheduled",
        rescheduledTo: toUtcDateOnly(input.toDate),
      },
    });

    // 新しいタスクを作成
    const newTask = await tx.scheduledTask.create({
      data: {
        userId: original.userId,
        ruleId: original.ruleId,
        workoutSessionId: original.workoutSessionId,
        scheduledDate: toUtcDateOnly(input.toDate),
        status: "pending",
        rescheduledFrom: original.scheduledDate,
      },
    });

    return {
      originalTask: mapScheduledTask(updatedOriginal),
      newTask: mapScheduledTask(newTask),
    };
  });
  return result;
}

/**
 * 特定ルールの未来のpendingタスクを削除
 */
export async function deleteFuturePendingTasks(
  ruleId: number,
  fromDate: Date,
): Promise<number> {
  const result = await prisma.scheduledTask.deleteMany({
    where: {
      ruleId: toBigInt(ruleId, "ruleId"),
      scheduledDate: { gte: toUtcDateOnly(fromDate) },
      status: "pending",
    },
  });
  return result.count;
}

/**
 * 日付とワークアウトセッションでタスクを取得または作成
 */
export async function upsertScheduledTask(input: {
  userId: number;
  workoutSessionId: number;
  scheduledDate: Date;
  status: ScheduledTaskStatus;
  completedAt?: Date;
}): Promise<ScheduledTask> {
  const row = await prisma.scheduledTask.upsert({
    where: {
      userId_workoutSessionId_scheduledDate: {
        userId: toBigInt(input.userId, "userId"),
        workoutSessionId: toBigInt(input.workoutSessionId, "workoutSessionId"),
        scheduledDate: toUtcDateOnly(input.scheduledDate),
      },
    },
    create: {
      userId: toBigInt(input.userId, "userId"),
      workoutSessionId: toBigInt(input.workoutSessionId, "workoutSessionId"),
      scheduledDate: toUtcDateOnly(input.scheduledDate),
      status: input.status,
      completedAt: input.completedAt,
    },
    update: {
      status: input.status,
      completedAt: input.completedAt,
    },
  });
  return mapScheduledTask(row);
}

// -----------------------------------------------------------------------------
// ScheduleReminder CRUD
// -----------------------------------------------------------------------------

/**
 * スケジュールリマインダーを作成/更新
 */
export async function upsertScheduleReminder(input: {
  userId: number;
  workoutSessionId: number;
  reminderType: ReminderType;
  offsetMinutes?: number;
  fixedTimeOfDay?: string;
  timezone: string;
  isEnabled: boolean;
}): Promise<ScheduleReminder> {
  const fixedTime = input.fixedTimeOfDay
    ? timeOfDayToDate(input.fixedTimeOfDay)
    : null;

  // 既存のリマインダーを探す
  const existing = await prisma.scheduleReminder.findFirst({
    where: {
      userId: toBigInt(input.userId, "userId"),
      workoutSessionId: toBigInt(input.workoutSessionId, "workoutSessionId"),
    },
  });

  const row = existing
    ? await prisma.scheduleReminder.update({
        where: { id: existing.id },
        data: {
          reminderType: input.reminderType,
          offsetMinutes: input.offsetMinutes,
          fixedTimeOfDay: fixedTime,
          timezone: input.timezone,
          isEnabled: input.isEnabled,
        },
      })
    : await prisma.scheduleReminder.create({
        data: {
          userId: toBigInt(input.userId, "userId"),
          workoutSessionId: toBigInt(
            input.workoutSessionId,
            "workoutSessionId",
          ),
          reminderType: input.reminderType,
          offsetMinutes: input.offsetMinutes,
          fixedTimeOfDay: fixedTime,
          timezone: input.timezone,
          isEnabled: input.isEnabled,
        },
      });

  return mapScheduleReminder(row);
}

/**
 * スケジュールリマインダーを削除
 */
export async function deleteScheduleReminder(
  workoutSessionId: number,
): Promise<void> {
  await prisma.scheduleReminder.deleteMany({
    where: { workoutSessionId: toBigInt(workoutSessionId, "workoutSessionId") },
  });
}

// =============================================================================
// Mutation Queries (Actions から移動)
// =============================================================================

// -----------------------------------------------------------------------------
// Exercise
// -----------------------------------------------------------------------------

export interface CreateExerciseParams {
  name: string;
  bodyPartIds: number[];
  formNote?: string;
  videoUrl?: string;
}

export async function createExercise(
  userId: number,
  params: CreateExerciseParams,
) {
  const { name, bodyPartIds, formNote, videoUrl } = params;
  return await prisma.exercise.create({
    data: {
      userId: toBigInt(userId, "userId"),
      name,
      formNote: formNote || null,
      videoUrl: videoUrl || null,
      bodyParts: {
        create: bodyPartIds.map((bodyPartId) => ({
          bodyPartId: toBigInt(bodyPartId, "bodyPartId"),
        })),
      },
    },
  });
}

export interface UpdateExerciseParams extends CreateExerciseParams {
  id: number;
}

export async function updateExercise(
  userId: number,
  params: UpdateExerciseParams,
) {
  const { id, name, bodyPartIds, formNote, videoUrl } = params;
  const exerciseId = toBigInt(id, "exerciseId");
  const userBigId = toBigInt(userId, "userId");

  await prisma.$transaction(async (tx) => {
    // 関連BodyPartを一旦削除
    await tx.exerciseBodyPart.deleteMany({
      where: { exerciseId },
    });

    // 本体更新とBodyPart再作成
    await tx.exercise.update({
      where: { id: exerciseId, userId: userBigId },
      data: {
        name,
        formNote: formNote || null,
        videoUrl: videoUrl || null,
        bodyParts: {
          create: bodyPartIds.map((bodyPartId) => ({
            bodyPartId: toBigInt(bodyPartId, "bodyPartId"),
          })),
        },
      },
    });
  });
}

export async function deleteExercise(userId: number, exerciseId: number) {
  // 論理削除
  await prisma.exercise.update({
    where: {
      id: toBigInt(exerciseId, "exerciseId"),
      userId: toBigInt(userId, "userId"),
    },
    data: { deletedAt: new Date() },
  });
}

// -----------------------------------------------------------------------------
// WorkoutTemplate
// -----------------------------------------------------------------------------

export interface CreateTemplateParams {
  name: string;
  exerciseIds: number[];
}

export async function createWorkoutTemplate(
  userId: number,
  params: CreateTemplateParams,
) {
  const { name, exerciseIds } = params;
  return await prisma.workoutTemplate.create({
    data: {
      userId: toBigInt(userId, "userId"),
      name,
      templateExercises: {
        create: exerciseIds.map((exerciseId, index) => ({
          exerciseId: toBigInt(exerciseId, "exerciseId"),
          displayOrder: index + 1,
        })),
      },
    },
  });
}

export interface UpdateTemplateParams extends CreateTemplateParams {
  id: number;
}

export async function updateWorkoutTemplate(
  userId: number,
  params: UpdateTemplateParams,
) {
  const { id, name, exerciseIds } = params;
  const templateId = toBigInt(id, "templateId");

  await prisma.$transaction(async (tx) => {
    await tx.templateExercise.deleteMany({
      where: { templateId },
    });

    await tx.workoutTemplate.update({
      where: { id: templateId, userId: toBigInt(userId, "userId") },
      data: {
        name,
        templateExercises: {
          create: exerciseIds.map((exerciseId, index) => ({
            exerciseId: toBigInt(exerciseId, "exerciseId"),
            displayOrder: index + 1,
          })),
        },
      },
    });
  });
}

export async function deleteWorkoutTemplate(
  userId: number,
  templateId: number,
) {
  // 論理削除
  await prisma.workoutTemplate.update({
    where: {
      id: toBigInt(templateId, "templateId"),
      userId: toBigInt(userId, "userId"),
    },
    data: { deletedAt: new Date() },
  });
}

// -----------------------------------------------------------------------------
// WeightRecord
// -----------------------------------------------------------------------------

export interface SaveWeightRecordParams {
  weight: number;
  bodyFat?: number;
  recordedAt: Date;
}

export async function createOrUpdateWeightRecord(
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

export async function deleteWeightRecord(userId: number, recordId: number) {
  await prisma.weightRecord.delete({
    where: {
      id: toBigInt(recordId, "recordId"),
      userId: toBigInt(userId, "userId"),
    },
  });
}

// -----------------------------------------------------------------------------
// ScheduledTask
// -----------------------------------------------------------------------------

export async function deleteScheduledTask(userId: number, taskId: number) {
  const id = toBigInt(taskId, "taskId");
  const userBigId = toBigInt(userId, "userId");

  const task = await prisma.scheduledTask.findFirst({
    where: { id, userId: userBigId },
  });

  if (!task) {
    throw new Error("タスクが見つかりません");
  }
  if (task.status !== "pending") {
    throw new Error("完了済みまたはスキップ済みのタスクは削除できません");
  }

  await prisma.scheduledTask.delete({
    where: { id },
  });
}

// -----------------------------------------------------------------------------
// WorkoutRecord
// -----------------------------------------------------------------------------

export interface SaveWorkoutRecordParams {
  templateId: number;
  workoutSessionId?: number;
  scheduledTaskId?: number;
  startedAt: Date;
  endedAt: Date;
  condition: number;
  fatigue: number;
  note: string;
  exercises: {
    exerciseId: number;
    sets: {
      setNumber: number;
      weight: number;
      reps: number;
      completed: boolean;
      note?: string;
    }[];
  }[];
}

export async function createWorkoutRecord(
  userId: number,
  params: SaveWorkoutRecordParams,
) {
  const {
    templateId,
    workoutSessionId,
    scheduledTaskId,
    startedAt,
    endedAt,
    condition,
    fatigue,
    note,
    exercises,
  } = params;

  const userBigId = toBigInt(userId, "userId");

  return await prisma.$transaction(async (tx) => {
    const newRecord = await tx.workoutRecord.create({
      data: {
        userId: userBigId,
        templateId: toBigInt(templateId, "templateId"),
        workoutSessionId: workoutSessionId
          ? toBigInt(workoutSessionId, "workoutSessionId")
          : null,
        scheduledTaskId: scheduledTaskId
          ? toBigInt(scheduledTaskId, "scheduledTaskId")
          : null,
        startedAt,
        endedAt,
        condition,
        fatigue,
        note,
        workoutRecordExercises: {
          create: exercises.map((ex) => ({
            exerciseId: toBigInt(ex.exerciseId, "exerciseId"),
            workoutRecordSets: {
              create: ex.sets.map((set) => ({
                setNumber: set.setNumber,
                weight: new Prisma.Decimal(set.weight),
                reps: set.reps,
                completed: set.completed,
                note: set.note,
              })),
            },
          })),
        },
      },
    });

    if (scheduledTaskId) {
      await tx.scheduledTask.update({
        where: { id: toBigInt(scheduledTaskId, "scheduledTaskId") },
        data: {
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }

    return newRecord;
  });
}

export interface UpdateWorkoutRecordParams {
  recordId: number;
  endedAt: Date;
  condition: number;
  fatigue: number;
  note: string;
  exercises: {
    exerciseId: number;
    sets: {
      setNumber: number;
      weight: number;
      reps: number;
      completed: boolean;
      note?: string;
    }[];
  }[];
}

export async function updateWorkoutRecord(
  userId: number,
  params: UpdateWorkoutRecordParams,
) {
  const { recordId, endedAt, condition, fatigue, note, exercises } = params;
  const recordBigId = toBigInt(recordId, "recordId");
  const userBigId = toBigInt(userId, "userId");

  await prisma.$transaction(async (tx) => {
    const existingRecord = await tx.workoutRecord.findFirst({
      where: {
        id: recordBigId,
        userId: userBigId,
      },
    });

    if (!existingRecord) {
      throw new Error("記録が見つかりません");
    }

    await tx.workoutRecordExercise.deleteMany({
      where: { recordId: recordBigId },
    });

    await tx.workoutRecord.update({
      where: { id: recordBigId },
      data: {
        endedAt,
        condition,
        fatigue,
        note,
        workoutRecordExercises: {
          create: exercises.map((ex) => ({
            exerciseId: toBigInt(ex.exerciseId, "exerciseId"),
            workoutRecordSets: {
              create: ex.sets.map((set) => ({
                setNumber: set.setNumber,
                weight: new Prisma.Decimal(set.weight),
                reps: set.reps,
                completed: set.completed,
                note: set.note,
              })),
            },
          })),
        },
      },
    });
  });
}

// =============================================================================
// 後方互換性エイリアス（移行期間中のみ使用）
// =============================================================================

/**
 * @deprecated Use getTemplateWithExercises instead
 */
export const getMenuWithExercises = getTemplateWithExercises;

/**
 * @deprecated Use getTemplatesWithExercises instead
 */
export const getMenusWithExercises = getTemplatesWithExercises;

/**
 * @deprecated Use getTemplates instead
 */
export const getMenus = getTemplates;

/**
 * @deprecated Use getTemplatesByIds instead
 */
export const getMenusByIds = getTemplatesByIds;

/**
 * @deprecated Use getTemplateExercisesByTemplateIds instead
 */
export const getMenuExercisesByMenuIds = getTemplateExercisesByTemplateIds;

/**
 * @deprecated Use getWorkoutRecordsByTemplateIds instead
 */
export const getWorkoutRecordsByMenuIds = getWorkoutRecordsByTemplateIds;

/**
 * @deprecated Use getWorkoutRecordExercisesByRecordIds instead
 */
export const getExerciseRecordsByRecordIds =
  getWorkoutRecordExercisesByRecordIds;

/**
 * @deprecated Use getWorkoutRecordSetsByExerciseIds instead
 */
export const getWorkoutSetsByExerciseRecordIds =
  getWorkoutRecordSetsByExerciseIds;

/**
 * @deprecated Use createWorkoutSession instead
 */
export const createSessionPlan = createWorkoutSession;

/**
 * @deprecated Use getWorkoutSessions instead
 */
export const getSessionPlans = getWorkoutSessions;

/**
 * @deprecated Use getWorkoutSessionWithDetails instead
 */
export const getSessionPlanWithDetails = getWorkoutSessionWithDetails;

/**
 * @deprecated Use updateWorkoutSession instead
 */
export const updateSessionPlan = updateWorkoutSession;

/**
 * @deprecated Use deleteWorkoutSession instead
 */
export const deleteSessionPlan = deleteWorkoutSession;

/**
 * @deprecated Use getScheduleRulesBySession instead
 */
export const getScheduleRulesByPlan = getScheduleRulesBySession;

/**
 * @deprecated Use getScheduledTasksWithSessionByDateRange instead
 */
export const getScheduledTasksWithPlanByDateRange =
  getScheduledTasksWithSessionByDateRange;

/**
 * @deprecated Use createWorkoutTemplate instead
 */
export const createWorkoutMenu = createWorkoutTemplate;

/**
 * @deprecated Use updateWorkoutTemplate instead
 */
export const updateWorkoutMenu = updateWorkoutTemplate;

/**
 * @deprecated Use deleteWorkoutTemplate instead
 */
export const deleteWorkoutMenu = deleteWorkoutTemplate;
