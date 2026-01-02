import { Prisma } from "@prisma/client";
import { toUtcDateOnly } from "@/lib/timezone";
import type {
  BodyPart,
  Exercise,
  ExerciseRecord,
  ExerciseWithBodyParts,
  MenuExercise,
  ReminderType,
  ScheduledTask,
  ScheduledTaskStatus,
  ScheduledTaskWithPlan,
  ScheduleReminder,
  ScheduleRule,
  ScheduleRuleType,
  // 新スケジュール機能
  SessionPlan,
  SessionPlanExercise,
  SessionPlanExerciseWithDetails,
  SessionPlanWithExercises,
  SessionPlanWithRules,
  WeightRecord,
  WorkoutMenu,
  WorkoutMenuWithExercises,
  WorkoutSession,
  WorkoutSet,
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

type WorkoutMenuWithExercisesRow = Prisma.WorkoutMenuGetPayload<{
  include: {
    menuExercises: {
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

function mapMenu(row: {
  id: bigint;
  userId: bigint;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): WorkoutMenu {
  return {
    id: toSafeNumber(row.id, "workout_menus.id"),
    userId: toSafeNumber(row.userId, "workout_menus.user_id"),
    name: row.name,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? undefined,
  };
}

function mapMenuExercise(row: {
  id: bigint;
  menuId: bigint;
  exerciseId: bigint;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}): MenuExercise {
  return {
    id: toSafeNumber(row.id, "menu_exercises.id"),
    menuId: toSafeNumber(row.menuId, "menu_exercises.menu_id"),
    exerciseId: toSafeNumber(row.exerciseId, "menu_exercises.exercise_id"),
    displayOrder: row.displayOrder,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapSession(row: {
  id: bigint;
  userId: bigint;
  menuId: bigint;
  startedAt: Date;
  endedAt: Date | null;
  condition: number;
  fatigue: number;
  note: string;
  createdAt: Date;
  updatedAt: Date;
}): WorkoutSession {
  return {
    id: toSafeNumber(row.id, "workout_records.id"),
    userId: toSafeNumber(row.userId, "workout_records.user_id"),
    menuId: toSafeNumber(row.menuId, "workout_records.menu_id"),
    startedAt: row.startedAt,
    endedAt: row.endedAt ?? undefined,
    condition: row.condition,
    fatigue: row.fatigue,
    note: row.note ?? "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapExerciseRecord(row: {
  id: bigint;
  sessionId: bigint;
  exerciseId: bigint;
  createdAt: Date;
  updatedAt: Date;
}): ExerciseRecord {
  return {
    id: toSafeNumber(row.id, "exercise_records.id"),
    sessionId: toSafeNumber(row.sessionId, "exercise_records.session_id"),
    exerciseId: toSafeNumber(row.exerciseId, "exercise_records.exercise_id"),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapWorkoutSet(row: {
  id: bigint;
  exerciseRecordId: bigint;
  setNumber: number;
  weight: Prisma.Decimal;
  reps: number;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}): WorkoutSet {
  return {
    id: toSafeNumber(row.id, "workout_set_records.id"),
    exerciseRecordId: toSafeNumber(
      row.exerciseRecordId,
      "workout_set_records.exercise_record_id",
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

function mapMenuWithExercises(
  row: WorkoutMenuWithExercisesRow,
): WorkoutMenuWithExercises {
  return {
    ...mapMenu(row),
    exercises: row.menuExercises.map((entry) =>
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

export async function getMenuWithExercises(
  userId: number,
  menuId: number,
): Promise<WorkoutMenuWithExercises | null> {
  const menu = await prisma.workoutMenu.findFirst({
    where: {
      id: toBigInt(menuId, "menuId"),
      userId: toBigInt(userId, "userId"),
      deletedAt: null,
    },
    include: {
      menuExercises: {
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

  if (!menu) return null;
  return mapMenuWithExercises(menu);
}

export async function getMenusWithExercises(
  userId: number,
): Promise<WorkoutMenuWithExercises[]> {
  const rows = await prisma.workoutMenu.findMany({
    where: { userId: toBigInt(userId, "userId"), deletedAt: null },
    orderBy: { createdAt: "asc" },
    include: {
      menuExercises: {
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

  return rows.map(mapMenuWithExercises);
}

export async function getMenus(userId: number): Promise<WorkoutMenu[]> {
  const rows = await prisma.workoutMenu.findMany({
    where: { userId: toBigInt(userId, "userId"), deletedAt: null },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapMenu);
}

export async function getMenusByIds(
  userId: number,
  menuIds: number[],
): Promise<WorkoutMenu[]> {
  if (menuIds.length === 0) return [];
  const rows = await prisma.workoutMenu.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      deletedAt: null,
      id: { in: toBigIntArray(menuIds, "menuIds") },
    },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapMenu);
}

export async function getMenuExercisesByMenuIds(
  menuIds: number[],
): Promise<MenuExercise[]> {
  if (menuIds.length === 0) return [];
  const rows = await prisma.menuExercise.findMany({
    where: { menuId: { in: toBigIntArray(menuIds, "menuIds") } },
    orderBy: [{ menuId: "asc" }, { displayOrder: "asc" }],
  });
  return rows.map(mapMenuExercise);
}

export async function getWorkoutSessionsByDateRange(
  userId: number,
  startDate: Date,
  endDate: Date,
): Promise<WorkoutSession[]> {
  const rows = await prisma.workoutSession.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      startedAt: { gte: startDate, lte: endDate },
    },
    orderBy: { startedAt: "desc" },
  });
  return rows.map(mapSession);
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
  const sessions = await prisma.workoutSession.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      startedAt: { gte: startDate, lte: endDate },
    },
    select: { id: true },
  });

  const sessionIds = sessions.map((s) => s.id);

  if (sessionIds.length === 0) {
    return { totalVolume: 0, workoutCount: 0 };
  }

  // 期間内のセット情報を取得してボリュームを計算
  // Note: Prismaの集計機能を使うとより効率的だが、現在の構造上セットレベルでの結合が必要
  // ここでは一度生クエリに近い形で集計するか、既存のリレーションを辿る
  const workoutSets = await prisma.workoutSet.findMany({
    where: {
      exerciseRecord: {
        sessionId: { in: sessionIds },
      },
      completed: true,
    },
    select: {
      weight: true,
      reps: true,
    },
  });

  // 総重量計算 (kg * reps)
  const totalVolume = workoutSets.reduce((sum, set) => {
    return sum + set.weight.toNumber() * set.reps;
  }, 0);

  return {
    totalVolume,
    workoutCount: sessionIds.length,
  };
}

export async function getWorkoutSessionsByMenuIds(
  userId: number,
  menuIds: number[],
): Promise<WorkoutSession[]> {
  if (menuIds.length === 0) return [];
  const rows = await prisma.workoutSession.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      menuId: { in: toBigIntArray(menuIds, "menuIds") },
    },
    orderBy: { startedAt: "desc" },
  });
  return rows.map(mapSession);
}

export async function getWorkoutSessions(
  userId: number,
): Promise<WorkoutSession[]> {
  const rows = await prisma.workoutSession.findMany({
    where: { userId: toBigInt(userId, "userId") },
    orderBy: { startedAt: "desc" },
  });
  return rows.map(mapSession);
}

export async function getExerciseRecordsBySessionIds(
  sessionIds: number[],
): Promise<ExerciseRecord[]> {
  if (sessionIds.length === 0) return [];
  const rows = await prisma.exerciseRecord.findMany({
    where: { sessionId: { in: toBigIntArray(sessionIds, "sessionIds") } },
  });
  return rows.map(mapExerciseRecord);
}

export async function getWorkoutSetsByExerciseRecordIds(
  exerciseRecordIds: number[],
): Promise<WorkoutSet[]> {
  if (exerciseRecordIds.length === 0) return [];
  const rows = await prisma.workoutSet.findMany({
    where: {
      exerciseRecordId: {
        in: toBigIntArray(exerciseRecordIds, "exerciseRecordIds"),
      },
    },
    orderBy: [{ exerciseRecordId: "asc" }, { setNumber: "asc" }],
  });
  return rows.map(mapWorkoutSet);
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
 * セッション詳細を取得（種目・セット情報含む）
 */
export interface WorkoutSessionWithDetails extends WorkoutSession {
  menu: {
    id: number;
    name: string;
  };
  exerciseRecords: {
    id: number;
    exerciseId: number;
    exercise: ExerciseWithBodyParts;
    sets: WorkoutSet[];
  }[];
}

export async function getWorkoutSessionWithDetails(
  userId: number,
  sessionId: number,
): Promise<WorkoutSessionWithDetails | null> {
  const row = await prisma.workoutSession.findFirst({
    where: {
      id: toBigInt(sessionId, "sessionId"),
      userId: toBigInt(userId, "userId"),
    },
    include: {
      menu: true,
      exerciseRecords: {
        include: {
          exercise: {
            include: {
              bodyParts: {
                include: { bodyPart: true },
                orderBy: { bodyPart: { displayOrder: "asc" } },
              },
            },
          },
          workoutSets: {
            orderBy: { setNumber: "asc" },
          },
        },
      },
    },
  });

  if (!row) return null;

  return {
    ...mapSession(row),
    menu: {
      id: toSafeNumber(row.menu.id, "workout_menus.id"),
      name: row.menu.name,
    },
    exerciseRecords: row.exerciseRecords.map((er) => ({
      id: toSafeNumber(er.id, "exercise_records.id"),
      exerciseId: toSafeNumber(er.exerciseId, "exercise_records.exercise_id"),
      exercise: mapExerciseWithBodyParts(er.exercise),
      sets: er.workoutSets.map(mapWorkoutSet),
    })),
  };
}

// =============================================================================
// 新スケジュール機能（SessionPlan ベース）
// =============================================================================

// -----------------------------------------------------------------------------
// マッパー関数
// -----------------------------------------------------------------------------

type SessionPlanRow = Prisma.SessionPlanGetPayload<object>;

function mapSessionPlan(row: SessionPlanRow): SessionPlan {
  return {
    id: toSafeNumber(row.id, "sessionPlan.id"),
    userId: toSafeNumber(row.userId, "sessionPlan.userId"),
    menuId: toSafeNumber(row.menuId, "sessionPlan.menuId"),
    name: row.name,
    description: row.description ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? undefined,
  };
}

type SessionPlanExerciseRow = Prisma.SessionPlanExerciseGetPayload<object>;

function mapSessionPlanExercise(
  row: SessionPlanExerciseRow,
): SessionPlanExercise {
  return {
    id: toSafeNumber(row.id, "sessionPlanExercise.id"),
    sessionPlanId: toSafeNumber(
      row.sessionPlanId,
      "sessionPlanExercise.sessionPlanId",
    ),
    exerciseId: toSafeNumber(row.exerciseId, "sessionPlanExercise.exerciseId"),
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

type SessionPlanExerciseWithDetailsRow = Prisma.SessionPlanExerciseGetPayload<{
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

function mapSessionPlanExerciseWithDetails(
  row: SessionPlanExerciseWithDetailsRow,
): SessionPlanExerciseWithDetails {
  return {
    ...mapSessionPlanExercise(row),
    exercise: mapExerciseWithBodyParts(row.exercise),
  };
}

type SessionPlanWithExercisesRow = Prisma.SessionPlanGetPayload<{
  include: {
    menu: true;
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

function mapSessionPlanWithExercises(
  row: SessionPlanWithExercisesRow,
): SessionPlanWithExercises {
  return {
    ...mapSessionPlan(row),
    menu: mapMenu(row.menu),
    exercises: row.exercises
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(mapSessionPlanExerciseWithDetails),
  };
}

type ScheduleRuleRow = Prisma.ScheduleRuleGetPayload<object>;

function mapScheduleRule(row: ScheduleRuleRow): ScheduleRule {
  return {
    id: toSafeNumber(row.id, "scheduleRule.id"),
    userId: toSafeNumber(row.userId, "scheduleRule.userId"),
    sessionPlanId: toSafeNumber(
      row.sessionPlanId,
      "scheduleRule.sessionPlanId",
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
    sessionPlanId: toSafeNumber(
      row.sessionPlanId,
      "scheduledTask.sessionPlanId",
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

type ScheduledTaskWithPlanRow = Prisma.ScheduledTaskGetPayload<{
  include: {
    sessionPlan: {
      include: {
        menu: true;
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

function mapScheduledTaskWithPlan(
  row: ScheduledTaskWithPlanRow,
): ScheduledTaskWithPlan {
  return {
    ...mapScheduledTask(row),
    sessionPlan: mapSessionPlanWithExercises(row.sessionPlan),
    rule: row.rule ? mapScheduleRule(row.rule) : undefined,
  };
}

type ScheduleReminderRow = Prisma.ScheduleReminderGetPayload<object>;

function mapScheduleReminder(row: ScheduleReminderRow): ScheduleReminder {
  return {
    id: toSafeNumber(row.id, "scheduleReminder.id"),
    userId: toSafeNumber(row.userId, "scheduleReminder.userId"),
    sessionPlanId: toSafeNumber(
      row.sessionPlanId,
      "scheduleReminder.sessionPlanId",
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
// SessionPlan CRUD
// -----------------------------------------------------------------------------

/**
 * セッションプランを作成
 */
export async function createSessionPlan(input: {
  userId: number;
  menuId: number;
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
}): Promise<SessionPlan> {
  const row = await prisma.sessionPlan.create({
    data: {
      userId: toBigInt(input.userId, "userId"),
      menuId: toBigInt(input.menuId, "menuId"),
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
  return mapSessionPlan(row);
}

/**
 * セッションプラン一覧を取得（削除済み除く）
 */
export async function getSessionPlans(
  userId: number,
): Promise<SessionPlanWithExercises[]> {
  const rows = await prisma.sessionPlan.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      deletedAt: null,
    },
    include: {
      menu: true,
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
  return rows.map(mapSessionPlanWithExercises);
}

/**
 * セッションプランを取得（種目・ルール・リマインダー付き）
 */
export async function getSessionPlanWithDetails(
  userId: number,
  sessionPlanId: number,
): Promise<SessionPlanWithRules | null> {
  const row = await prisma.sessionPlan.findFirst({
    where: {
      id: toBigInt(sessionPlanId, "sessionPlanId"),
      userId: toBigInt(userId, "userId"),
      deletedAt: null,
    },
    include: {
      menu: true,
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
    ...mapSessionPlanWithExercises(row),
    scheduleRules: row.scheduleRules.map(mapScheduleRule),
    reminders: row.reminders.map(mapScheduleReminder),
  };
}

/**
 * セッションプランを更新
 */
export async function updateSessionPlan(input: {
  sessionPlanId: number;
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
}): Promise<SessionPlan> {
  const row = await prisma.$transaction(async (tx) => {
    // 種目の更新がある場合は削除して再作成
    if (input.exercises) {
      await tx.sessionPlanExercise.deleteMany({
        where: {
          sessionPlanId: toBigInt(input.sessionPlanId, "sessionPlanId"),
        },
      });
    }

    return tx.sessionPlan.update({
      where: { id: toBigInt(input.sessionPlanId, "sessionPlanId") },
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
  return mapSessionPlan(row);
}

/**
 * セッションプランを論理削除
 */
export async function deleteSessionPlan(
  _userId: number,
  sessionPlanId: number,
): Promise<void> {
  await prisma.sessionPlan.update({
    where: { id: toBigInt(sessionPlanId, "sessionPlanId") },
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
  sessionPlanId: number;
  ruleType: ScheduleRuleType;
  weekdays?: number;
  intervalDays?: number;
  startDate?: Date;
  endDate?: Date;
}): Promise<ScheduleRule> {
  const row = await prisma.scheduleRule.create({
    data: {
      userId: toBigInt(input.userId, "userId"),
      sessionPlanId: toBigInt(input.sessionPlanId, "sessionPlanId"),
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
 * セッションプランのスケジュールルール一覧を取得
 */
export async function getScheduleRulesByPlan(
  userId: number,
  sessionPlanId: number,
): Promise<ScheduleRule[]> {
  const rows = await prisma.scheduleRule.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      sessionPlanId: toBigInt(sessionPlanId, "sessionPlanId"),
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
  sessionPlanId: number;
  scheduledDate: Date;
}): Promise<ScheduledTask> {
  const row = await prisma.scheduledTask.create({
    data: {
      userId: toBigInt(input.userId, "userId"),
      ruleId: input.ruleId ? toBigInt(input.ruleId, "ruleId") : null,
      sessionPlanId: toBigInt(input.sessionPlanId, "sessionPlanId"),
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
    sessionPlanId: number;
    scheduledDate: Date;
  }[],
): Promise<number> {
  const result = await prisma.scheduledTask.createMany({
    data: tasks.map((t) => ({
      userId: toBigInt(t.userId, "userId"),
      ruleId: t.ruleId ? toBigInt(t.ruleId, "ruleId") : null,
      sessionPlanId: toBigInt(t.sessionPlanId, "sessionPlanId"),
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
 * 期間内のスケジュールタスクを取得（プラン情報付き）
 */
export async function getScheduledTasksWithPlanByDateRange(
  userId: number,
  fromDate: Date,
  toDate: Date,
): Promise<ScheduledTaskWithPlan[]> {
  const rows = await prisma.scheduledTask.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      scheduledDate: {
        gte: toUtcDateOnly(fromDate),
        lte: toUtcDateOnly(toDate),
      },
    },
    include: {
      sessionPlan: {
        include: {
          menu: true,
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
  return rows.map(mapScheduledTaskWithPlan);
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
        sessionPlanId: original.sessionPlanId,
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
 * 日付とセッションプランでタスクを取得または作成
 */
export async function upsertScheduledTask(input: {
  userId: number;
  sessionPlanId: number;
  scheduledDate: Date;
  status: ScheduledTaskStatus;
  completedAt?: Date;
}): Promise<ScheduledTask> {
  const row = await prisma.scheduledTask.upsert({
    where: {
      userId_sessionPlanId_scheduledDate: {
        userId: toBigInt(input.userId, "userId"),
        sessionPlanId: toBigInt(input.sessionPlanId, "sessionPlanId"),
        scheduledDate: toUtcDateOnly(input.scheduledDate),
      },
    },
    create: {
      userId: toBigInt(input.userId, "userId"),
      sessionPlanId: toBigInt(input.sessionPlanId, "sessionPlanId"),
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
  sessionPlanId: number;
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
      sessionPlanId: toBigInt(input.sessionPlanId, "sessionPlanId"),
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
          sessionPlanId: toBigInt(input.sessionPlanId, "sessionPlanId"),
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
  sessionPlanId: number,
): Promise<void> {
  await prisma.scheduleReminder.deleteMany({
    where: { sessionPlanId: toBigInt(sessionPlanId, "sessionPlanId") },
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
// WorkoutMenu
// -----------------------------------------------------------------------------

export interface CreateMenuParams {
  name: string;
  exerciseIds: number[];
}

export async function createWorkoutMenu(
  userId: number,
  params: CreateMenuParams,
) {
  const { name, exerciseIds } = params;
  return await prisma.workoutMenu.create({
    data: {
      userId: toBigInt(userId, "userId"),
      name,
      menuExercises: {
        create: exerciseIds.map((exerciseId, index) => ({
          exerciseId: toBigInt(exerciseId, "exerciseId"),
          displayOrder: index + 1,
        })),
      },
    },
  });
}

export interface UpdateMenuParams extends CreateMenuParams {
  id: number;
}

export async function updateWorkoutMenu(
  userId: number,
  params: UpdateMenuParams,
) {
  const { id, name, exerciseIds } = params;
  const menuId = toBigInt(id, "menuId");

  await prisma.$transaction(async (tx) => {
    await tx.menuExercise.deleteMany({
      where: { menuId },
    });

    await tx.workoutMenu.update({
      where: { id: menuId, userId: toBigInt(userId, "userId") },
      data: {
        name,
        menuExercises: {
          create: exerciseIds.map((exerciseId, index) => ({
            exerciseId: toBigInt(exerciseId, "exerciseId"),
            displayOrder: index + 1,
          })),
        },
      },
    });
  });
}

export async function deleteWorkoutMenu(userId: number, menuId: number) {
  // 論理削除
  await prisma.workoutMenu.update({
    where: {
      id: toBigInt(menuId, "menuId"),
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
// WorkoutSession
// -----------------------------------------------------------------------------

export interface SaveWorkoutSessionParams {
  menuId: number;
  sessionPlanId?: number;
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

export async function createWorkoutSession(
  userId: number,
  params: SaveWorkoutSessionParams,
) {
  const {
    menuId,
    sessionPlanId,
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
    const newSession = await tx.workoutSession.create({
      data: {
        userId: userBigId,
        menuId: toBigInt(menuId, "menuId"),
        sessionPlanId: sessionPlanId
          ? toBigInt(sessionPlanId, "sessionPlanId")
          : null,
        scheduledTaskId: scheduledTaskId
          ? toBigInt(scheduledTaskId, "scheduledTaskId")
          : null,
        startedAt,
        endedAt,
        condition,
        fatigue,
        note,
        exerciseRecords: {
          create: exercises.map((ex) => ({
            exerciseId: toBigInt(ex.exerciseId, "exerciseId"),
            workoutSets: {
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

    return newSession;
  });
}

export interface UpdateWorkoutSessionParams {
  sessionId: number;
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

export async function updateWorkoutSession(
  userId: number,
  params: UpdateWorkoutSessionParams,
) {
  const { sessionId, endedAt, condition, fatigue, note, exercises } = params;
  const sessionBigId = toBigInt(sessionId, "sessionId");
  const userBigId = toBigInt(userId, "userId");

  await prisma.$transaction(async (tx) => {
    const existingSession = await tx.workoutSession.findFirst({
      where: {
        id: sessionBigId,
        userId: userBigId,
      },
    });

    if (!existingSession) {
      throw new Error("セッションが見つかりません");
    }

    await tx.exerciseRecord.deleteMany({
      where: { sessionId: sessionBigId },
    });

    await tx.workoutSession.update({
      where: { id: sessionBigId },
      data: {
        endedAt,
        condition,
        fatigue,
        note,
        exerciseRecords: {
          create: exercises.map((ex) => ({
            exerciseId: toBigInt(ex.exerciseId, "exerciseId"),
            workoutSets: {
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
