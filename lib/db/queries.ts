import type { Prisma } from "@prisma/client";
import { toDateKey } from "@/lib/date-key";
import type {
  BodyPart,
  DailySchedule,
  DailyScheduleStatus,
  Exercise,
  ExerciseRecord,
  ExerciseWithBodyParts,
  MenuExercise,
  RoutineType,
  ScheduleRoutine,
  ScheduleRoutineReminder,
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

function dateKeyToUtcDate(dateKey: string): Date {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

function toUtcDateOnly(date: Date): Date {
  return new Date(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
  );
}

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
  createdAt: Date;
  updatedAt: Date;
}): WeightRecord {
  return {
    id: toSafeNumber(row.id, "weight_records.id"),
    userId: toSafeNumber(row.userId, "weight_records.user_id"),
    recordedAt: row.recordedAt,
    weight: toDecimalNumber(row.weight),
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

// =============================================================================
// ルーティンスケジュール機能
// =============================================================================

function mapScheduleRoutine(row: {
  id: bigint;
  userId: bigint;
  menuId: bigint;
  routineType: "weekly" | "interval";
  weekdays: number | null;
  intervalDays: number | null;
  startDate: Date | null;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}): ScheduleRoutine {
  return {
    id: toSafeNumber(row.id, "schedule_routines.id"),
    userId: toSafeNumber(row.userId, "schedule_routines.user_id"),
    menuId: toSafeNumber(row.menuId, "schedule_routines.menu_id"),
    routineType: row.routineType as RoutineType,
    weekdays: row.weekdays ?? undefined,
    intervalDays: row.intervalDays ?? undefined,
    startDate: row.startDate ?? undefined,
    isEnabled: row.isEnabled,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    deletedAt: row.deletedAt ?? undefined,
  };
}

function mapDailySchedule(row: {
  id: bigint;
  userId: bigint;
  routineId: bigint;
  scheduledDate: Date;
  status: "pending" | "completed" | "skipped" | "rescheduled";
  rescheduledTo: Date | null;
  rescheduledFrom: Date | null;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): DailySchedule {
  return {
    id: toSafeNumber(row.id, "daily_schedules.id"),
    userId: toSafeNumber(row.userId, "daily_schedules.user_id"),
    routineId: toSafeNumber(row.routineId, "daily_schedules.routine_id"),
    scheduledDate: row.scheduledDate,
    status: row.status as DailyScheduleStatus,
    rescheduledTo: row.rescheduledTo ?? undefined,
    rescheduledFrom: row.rescheduledFrom ?? undefined,
    completedAt: row.completedAt ?? undefined,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

function mapScheduleRoutineReminder(row: {
  id: bigint;
  userId: bigint;
  routineId: bigint;
  frequency: "daily" | "weekly" | "monthly";
  timeOfDay: Date;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  startDate: Date;
  timezone: string;
  nextFireAt: Date;
  isEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}): ScheduleRoutineReminder {
  return {
    id: toSafeNumber(row.id, "schedule_routine_reminders.id"),
    userId: toSafeNumber(row.userId, "schedule_routine_reminders.user_id"),
    routineId: toSafeNumber(
      row.routineId,
      "schedule_routine_reminders.routine_id",
    ),
    frequency: row.frequency,
    timeOfDay: normalizeTimeOfDay(row.timeOfDay),
    dayOfWeek: row.dayOfWeek ?? undefined,
    dayOfMonth: row.dayOfMonth ?? undefined,
    startDate: row.startDate,
    timezone: row.timezone,
    nextFireAt: row.nextFireAt,
    isEnabled: row.isEnabled,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

/**
 * 有効なルーティン一覧を取得
 */
export async function getActiveRoutines(
  userId: number,
): Promise<ScheduleRoutine[]> {
  const rows = await prisma.scheduleRoutine.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      deletedAt: null,
      isEnabled: true,
    },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapScheduleRoutine);
}

/**
 * 全ルーティン一覧を取得（削除済み除く）
 */
export async function getAllRoutines(
  userId: number,
): Promise<ScheduleRoutine[]> {
  const rows = await prisma.scheduleRoutine.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      deletedAt: null,
    },
    orderBy: { createdAt: "asc" },
  });
  return rows.map(mapScheduleRoutine);
}

/**
 * メニューIDでルーティンを取得
 */
export async function getRoutineByMenuId(
  userId: number,
  menuId: number,
): Promise<ScheduleRoutine | null> {
  const row = await prisma.scheduleRoutine.findFirst({
    where: {
      userId: toBigInt(userId, "userId"),
      menuId: toBigInt(menuId, "menuId"),
      deletedAt: null,
    },
  });
  return row ? mapScheduleRoutine(row) : null;
}

/**
 * 日別スケジュールを日付範囲で取得
 */
export async function getDailySchedulesByDateRange(
  userId: number,
  startDate: Date,
  endDate: Date,
): Promise<Map<string, DailySchedule>> {
  const rows = await prisma.dailySchedule.findMany({
    where: {
      userId: toBigInt(userId, "userId"),
      scheduledDate: {
        gte: toUtcDateOnly(startDate),
        lte: toUtcDateOnly(endDate),
      },
    },
  });

  const map = new Map<string, DailySchedule>();
  for (const row of rows) {
    const daily = mapDailySchedule(row);
    const key = `${daily.routineId}:${toDateKey(daily.scheduledDate)}`;
    map.set(key, daily);
  }
  return map;
}

/**
 * 日別スケジュールをupsert
 */
export async function upsertDailySchedule(input: {
  userId: number;
  routineId: number;
  scheduledDate: Date;
  status: DailyScheduleStatus;
  rescheduledTo?: Date;
  rescheduledFrom?: Date;
  completedAt?: Date;
}): Promise<void> {
  const now = new Date();
  const userId = toBigInt(input.userId, "userId");
  const routineId = toBigInt(input.routineId, "routineId");
  const scheduledDate = toUtcDateOnly(input.scheduledDate);
  const rescheduledTo = input.rescheduledTo
    ? toUtcDateOnly(input.rescheduledTo)
    : null;
  const rescheduledFrom = input.rescheduledFrom
    ? toUtcDateOnly(input.rescheduledFrom)
    : null;

  await prisma.dailySchedule.upsert({
    where: {
      userId_routineId_scheduledDate: {
        userId,
        routineId,
        scheduledDate,
      },
    },
    create: {
      userId,
      routineId,
      scheduledDate,
      status: input.status,
      rescheduledTo,
      rescheduledFrom,
      completedAt: input.completedAt ?? null,
      createdAt: now,
      updatedAt: now,
    },
    update: {
      status: input.status,
      rescheduledTo,
      rescheduledFrom,
      completedAt: input.completedAt ?? null,
      updatedAt: now,
    },
  });
}

/**
 * ルーティンを作成
 */
export async function createRoutine(input: {
  userId: number;
  menuId: number;
  routineType: RoutineType;
  weekdays?: number;
  intervalDays?: number;
  startDate?: Date;
}): Promise<ScheduleRoutine> {
  const now = new Date();
  const row = await prisma.scheduleRoutine.create({
    data: {
      userId: toBigInt(input.userId, "userId"),
      menuId: toBigInt(input.menuId, "menuId"),
      routineType: input.routineType,
      weekdays: input.weekdays ?? null,
      intervalDays: input.intervalDays ?? null,
      startDate: input.startDate ? toUtcDateOnly(input.startDate) : null,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    },
  });
  return mapScheduleRoutine(row);
}

/**
 * ルーティンを更新
 */
export async function updateRoutine(
  routineId: number,
  input: {
    routineType?: RoutineType;
    weekdays?: number | null;
    intervalDays?: number | null;
    startDate?: Date | null;
    isEnabled?: boolean;
  },
): Promise<void> {
  const now = new Date();
  await prisma.scheduleRoutine.update({
    where: { id: toBigInt(routineId, "routineId") },
    data: {
      ...(input.routineType !== undefined && {
        routineType: input.routineType,
      }),
      ...(input.weekdays !== undefined && { weekdays: input.weekdays }),
      ...(input.intervalDays !== undefined && {
        intervalDays: input.intervalDays,
      }),
      ...(input.startDate !== undefined && {
        startDate: input.startDate ? toUtcDateOnly(input.startDate) : null,
      }),
      ...(input.isEnabled !== undefined && { isEnabled: input.isEnabled }),
      updatedAt: now,
    },
  });
}

/**
 * ルーティンを論理削除
 */
export async function deleteRoutine(routineId: number): Promise<void> {
  const now = new Date();
  await prisma.scheduleRoutine.update({
    where: { id: toBigInt(routineId, "routineId") },
    data: {
      deletedAt: now,
      updatedAt: now,
    },
  });
}

/**
 * ルーティン用リマインダーを取得
 */
export async function getRoutineRemindersMap(
  userId: number,
): Promise<Map<number, ScheduleRoutineReminder>> {
  const rows = await prisma.scheduleRoutineReminder.findMany({
    where: { userId: toBigInt(userId, "userId") },
  });
  const map = new Map<number, ScheduleRoutineReminder>();
  for (const row of rows) {
    const reminder = mapScheduleRoutineReminder(row);
    map.set(reminder.routineId, reminder);
  }
  return map;
}

/**
 * ルーティン用リマインダーをupsert
 */
export async function upsertRoutineReminder(input: {
  userId: number;
  routineId: number;
  frequency: "daily" | "weekly" | "monthly";
  timeOfDay: string;
  dayOfWeek?: number;
  dayOfMonth?: number;
  startDate: Date;
  timezone: string;
  nextFireAt: Date;
  isEnabled: boolean;
}): Promise<void> {
  const now = new Date();
  const userId = toBigInt(input.userId, "userId");
  const routineId = toBigInt(input.routineId, "routineId");
  const timeOfDay = timeOfDayToDate(input.timeOfDay);
  const startDate = toUtcDateOnly(input.startDate);

  await prisma.scheduleRoutineReminder.upsert({
    where: { routineId },
    create: {
      userId,
      routineId,
      frequency: input.frequency,
      timeOfDay,
      dayOfWeek: input.dayOfWeek ?? null,
      dayOfMonth: input.dayOfMonth ?? null,
      startDate,
      timezone: input.timezone,
      nextFireAt: input.nextFireAt,
      isEnabled: input.isEnabled,
      createdAt: now,
      updatedAt: now,
    },
    update: {
      frequency: input.frequency,
      timeOfDay,
      dayOfWeek: input.dayOfWeek ?? null,
      dayOfMonth: input.dayOfMonth ?? null,
      startDate,
      timezone: input.timezone,
      nextFireAt: input.nextFireAt,
      isEnabled: input.isEnabled,
      updatedAt: now,
    },
  });
}

/**
 * ルーティン用リマインダーを削除
 */
export async function deleteRoutineReminder(routineId: number): Promise<void> {
  await prisma.scheduleRoutineReminder.deleteMany({
    where: { routineId: toBigInt(routineId, "routineId") },
  });
}
