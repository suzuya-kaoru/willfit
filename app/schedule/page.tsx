import { toZonedTime } from "date-fns-tz";
import {
  getScheduledTasksWithSessionByDateRange,
  getWorkoutSessions,
} from "@/lib/dal/schedule";
import { getTemplatesByIds } from "@/lib/dal/template";
import {
  getWorkoutRecordExercisesByRecordIds,
  getWorkoutRecordSetsByExerciseIds,
  getWorkoutRecordsByDateRange,
} from "@/lib/dal/workout-record";
import { formatDateKey, toDateKey } from "@/lib/date-key";
import { weekdaysFromBitmask } from "@/lib/schedule-utils";

import { APP_TIMEZONE, getMonthEndUTC, getMonthStartUTC } from "@/lib/timezone";
import type {
  CalculatedTask,
  WorkoutRecord,
  WorkoutRecordExercise,
  WorkoutRecordSet,
} from "@/lib/types";
import { ScheduleClient } from "./_components/schedule-client";
import type { CalendarDay, WorkoutRecordWithStats } from "./_components/types";

/**
 * ============================================================================
 * Server Component: データ取得と計算（サーバー側で実行）
 * ============================================================================
 *
 * DBアクセス層を使用して、記録・セット・メニュー情報を取得する。
 * 集計ロジックはサーバー側に保持し、UIは表示専用にする。
 */

/**
 * 指定された年月の記録を取得（Asia/Tokyo）
 */
async function getRecordsByDateRange(
  userId: number,
  year: number,
  month: number,
): Promise<WorkoutRecord[]> {
  const startDate = getMonthStartUTC(year, month);
  const endDate = getMonthEndUTC(year, month);

  return getWorkoutRecordsByDateRange(userId, startDate, endDate);
}

function buildExerciseRecordsByRecordId(
  records: WorkoutRecordExercise[],
): Map<number, WorkoutRecordExercise[]> {
  const map = new Map<number, WorkoutRecordExercise[]>();
  for (const record of records) {
    const list = map.get(record.recordId) ?? [];
    list.push(record);
    map.set(record.recordId, list);
  }
  return map;
}

function buildSetsByWorkoutRecordExerciseId(
  sets: WorkoutRecordSet[],
): Map<number, WorkoutRecordSet[]> {
  const map = new Map<number, WorkoutRecordSet[]>();
  for (const set of sets) {
    const list = map.get(set.workoutRecordExerciseId) ?? [];
    list.push(set);
    map.set(set.workoutRecordExerciseId, list);
  }
  return map;
}

/**
 * 記録の統計情報を計算
 * recordIdベースでexercise_record_idを算出し、それに紐づくセットを集計
 * この関数は DB 移行後もサーバー側で実行される
 */
function calculateRecordStats(
  workoutRecord: WorkoutRecord,
  exerciseRecordsByRecordId: Map<number, WorkoutRecordExercise[]>,
  setsByWorkoutRecordExerciseId: Map<number, WorkoutRecordSet[]>,
): {
  volume: number;
  setCount: number;
  exerciseCount: number;
} {
  const exerciseRecords = exerciseRecordsByRecordId.get(workoutRecord.id) ?? [];
  const exerciseRecordIds = exerciseRecords.map((er) => er.id);
  const recordSets = exerciseRecordIds.flatMap(
    (erId) => setsByWorkoutRecordExerciseId.get(erId) ?? [],
  );

  const volume = recordSets.reduce((total, set) => {
    return total + set.weight * set.reps;
  }, 0);

  const setCount = recordSets.length;
  const exerciseCount = exerciseRecords.length;

  return { volume, setCount, exerciseCount };
}

/**
 * 記録に統計情報とメニュー名を付与
 */
function enrichRecordWithStats(
  workoutRecord: WorkoutRecord,
  templatesById: Map<number, { name: string }>,
  exerciseRecordsByRecordId: Map<number, WorkoutRecordExercise[]>,
  setsByWorkoutRecordExerciseId: Map<number, WorkoutRecordSet[]>,
): WorkoutRecordWithStats {
  const template = templatesById.get(workoutRecord.templateId);
  const stats = calculateRecordStats(
    workoutRecord,
    exerciseRecordsByRecordId,
    setsByWorkoutRecordExerciseId,
  );

  return {
    ...workoutRecord,
    menuName: template?.name ?? "不明なテンプレート",
    ...stats,
  };
}

/**
 * カレンダーの日付情報を生成
 *
 * 注意: year/month はJSTの年月として扱う。
 * カレンダー上の日付はJSTで表示されるため、日付文字列もJST基準で生成する。
 */
function generateCalendarDays(
  year: number,
  month: number,
  records: WorkoutRecordWithStats[],
  todayDateString: string,
  schedulesMap: Map<string, CalculatedTask[]>,
): CalendarDay[] {
  // JST基準で月の最初と最後の日を計算
  // ここでは純粋にカレンダー表示用なので、UTCではなくJSTの日付として扱う
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days: CalendarDay[] = [];

  // 記録を日付文字列でマッピング（高速検索用）
  // toDateKey はUTCの Date を JST の日付文字列に変換する
  const recordsByDate = new Map<string, WorkoutRecordWithStats[]>();
  for (const record of records) {
    const dateStr = toDateKey(record.startedAt);
    const existing = recordsByDate.get(dateStr) ?? [];
    existing.push(record);
    recordsByDate.set(dateStr, existing);
  }

  // 空セル（月初めのパディング）
  for (let i = 0; i < startPadding; i++) {
    days.push({
      day: null,
      dateString: "",
      record: null,
      schedules: [],
      isScheduled: false,
      isToday: false,
    });
  }

  // 実際の日付（JST基準の日付文字列を生成）
  for (let day = 1; day <= totalDays; day++) {
    // JSTの日付文字列を生成（数値から直接生成）
    const dateString = formatDateKey(year, month, day);
    const schedules = schedulesMap.get(dateString) ?? [];
    // 同日に複数記録がある場合は最初の1つを表示（将来は複数対応可能）
    const recordsForDate = recordsByDate.get(dateString) ?? [];
    const record = recordsForDate.length > 0 ? recordsForDate[0] : null;

    days.push({
      day,
      dateString,
      record,
      schedules,
      isScheduled: schedules.length > 0,
      isToday: dateString === todayDateString,
    });
  }

  return days;
}

/**
 * Schedule Page (Server Component)
 */
interface SchedulePageProps {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
}

export default async function SchedulePage({
  searchParams,
}: SchedulePageProps) {
  // ============================================================================
  // URL パラメータから年月を取得（デフォルトは現在の年月）
  // ============================================================================
  const params = await searchParams;
  const userId = 1;
  const now = new Date();
  // JSTの「今日」を取得
  const jstToday = toZonedTime(now, APP_TIMEZONE);
  const year = params.year ? parseInt(params.year, 10) : jstToday.getFullYear();
  const month = params.month
    ? parseInt(params.month, 10) - 1 // URL は 1-based、Date は 0-based
    : jstToday.getMonth();

  // バリデーション
  if (Number.isNaN(year) || Number.isNaN(month) || month < 0 || month > 11) {
    // 無効なパラメータの場合は現在の年月を使用
    const validYear = jstToday.getFullYear();
    const validMonth = jstToday.getMonth();
    return (
      <ScheduleClient
        year={validYear}
        month={validMonth}
        calendarDays={[]}
        recordsList={[]}
        todayDateString={toDateKey(now)}
        plans={[]}
      />
    );
  }

  // ============================================================================
  // データ取得
  // ============================================================================
  const startDate = getMonthStartUTC(year, month);
  const endDate = getMonthEndUTC(year, month);

  const [recordsInMonth, workoutSessions, scheduledTasks] = await Promise.all([
    getRecordsByDateRange(userId, year, month),
    getWorkoutSessions(userId),
    getScheduledTasksWithSessionByDateRange(userId, startDate, endDate),
  ]);

  const workoutRecordIds = recordsInMonth.map((record) => record.id);
  const exerciseRecords =
    await getWorkoutRecordExercisesByRecordIds(workoutRecordIds);
  const exerciseRecordIds = exerciseRecords.map(
    (er: WorkoutRecordExercise) => er.id,
  );
  const sets = await getWorkoutRecordSetsByExerciseIds(exerciseRecordIds);
  const templatesByIds = await getTemplatesByIds(userId, [
    ...new Set(recordsInMonth.map((record) => record.templateId)),
  ]);
  const templatesById = new Map(
    templatesByIds.map((template) => [template.id, template]),
  );
  const exerciseRecordsByRecordId =
    buildExerciseRecordsByRecordId(exerciseRecords);
  const setsByWorkoutRecordExerciseId =
    buildSetsByWorkoutRecordExerciseId(sets);

  // ============================================================================
  // データ計算（サーバー側で実行）
  // ============================================================================
  const recordsWithStats: WorkoutRecordWithStats[] = recordsInMonth.map(
    (record) =>
      enrichRecordWithStats(
        record,
        templatesById,
        exerciseRecordsByRecordId,
        setsByWorkoutRecordExerciseId,
      ),
  );

  // 記録一覧（新しい順にソート）
  const recordsList = [...recordsWithStats].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );

  // 各日付のスケジュールを計算
  const schedulesMap = new Map<string, CalculatedTask[]>();

  for (const task of scheduledTasks) {
    const dateKey = toDateKey(task.scheduledDate);
    const existing = schedulesMap.get(dateKey) ?? [];

    if (task.status === "completed") continue; // 記録履歴として表示されるためスキップ

    const mappedTask: CalculatedTask = {
      taskId: Number(task.id),
      workoutSessionId: Number(task.workoutSessionId),
      workoutSessionName: task.workoutSession.name,
      templateId: Number(task.workoutSession.templateId),
      templateName: task.workoutSession.template.name,
      ruleId: task.ruleId ? Number(task.ruleId) : undefined,
      ruleType: task.rule?.ruleType,
      weekdays:
        task.rule?.ruleType === "weekly" && task.rule.weekdays
          ? weekdaysFromBitmask(task.rule.weekdays)
          : undefined,
      intervalDays: task.rule?.intervalDays ?? undefined,
      scheduledTask: task,
      isFromReschedule: !!task.rescheduledFrom,
    };

    existing.push(mappedTask);
    schedulesMap.set(dateKey, existing);
  }

  // カレンダーの日付情報を生成
  const todayDateString = toDateKey(now);
  const calendarDays = generateCalendarDays(
    year,
    month,
    recordsWithStats,
    todayDateString,
    schedulesMap,
  );

  // ============================================================================
  // Client Component に props として渡す
  // ============================================================================
  return (
    <ScheduleClient
      year={year}
      month={month}
      calendarDays={calendarDays}
      recordsList={recordsList}
      todayDateString={todayDateString}
      plans={workoutSessions}
    />
  );
}
