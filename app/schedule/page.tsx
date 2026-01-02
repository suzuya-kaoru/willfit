import { toZonedTime } from "date-fns-tz";
import { formatDateKey, toDateKey } from "@/lib/date-key";
import {
  getExerciseRecordsBySessionIds,
  getMenusByIds,
  getScheduledTasksWithPlanByDateRange,
  getSessionPlans,
  getWorkoutSessionsByDateRange,
  getWorkoutSetsByExerciseRecordIds,
} from "@/lib/db/queries";
import { weekdaysFromBitmask } from "@/lib/schedule-utils";
import { APP_TIMEZONE, getMonthEndUTC, getMonthStartUTC } from "@/lib/timezone";
import type {
  CalculatedTask,
  ExerciseRecord,
  WorkoutSession,
  WorkoutSet,
} from "@/lib/types";
import { ScheduleClient } from "./_components/schedule-client";
import type { CalendarDay, WorkoutSessionWithStats } from "./_components/types";

/**
 * ============================================================================
 * Server Component: データ取得と計算（サーバー側で実行）
 * ============================================================================
 *
 * DBアクセス層を使用して、セッション・セット・メニュー情報を取得する。
 * 集計ロジックはサーバー側に保持し、UIは表示専用にする。
 */

/**
 * 指定された年月のセッションを取得（Asia/Tokyo）
 */
async function getSessionsByDateRange(
  userId: number,
  year: number,
  month: number,
): Promise<WorkoutSession[]> {
  const startDate = getMonthStartUTC(year, month);
  const endDate = getMonthEndUTC(year, month);

  return getWorkoutSessionsByDateRange(userId, startDate, endDate);
}

function buildExerciseRecordsBySessionId(
  records: ExerciseRecord[],
): Map<number, ExerciseRecord[]> {
  const map = new Map<number, ExerciseRecord[]>();
  for (const record of records) {
    const list = map.get(record.sessionId) ?? [];
    list.push(record);
    map.set(record.sessionId, list);
  }
  return map;
}

function buildSetsByExerciseRecordId(
  sets: WorkoutSet[],
): Map<number, WorkoutSet[]> {
  const map = new Map<number, WorkoutSet[]>();
  for (const set of sets) {
    const list = map.get(set.exerciseRecordId) ?? [];
    list.push(set);
    map.set(set.exerciseRecordId, list);
  }
  return map;
}

/**
 * セッションの統計情報を計算
 * sessionIdベースでexercise_record_idを算出し、それに紐づくセットを集計
 * この関数は DB 移行後もサーバー側で実行される
 */
function calculateSessionStats(
  session: WorkoutSession,
  exerciseRecordsBySessionId: Map<number, ExerciseRecord[]>,
  setsByExerciseRecordId: Map<number, WorkoutSet[]>,
): {
  volume: number;
  setCount: number;
  exerciseCount: number;
} {
  const records = exerciseRecordsBySessionId.get(session.id) ?? [];
  const recordIds = records.map((record) => record.id);
  const sessionSets = recordIds.flatMap(
    (recordId) => setsByExerciseRecordId.get(recordId) ?? [],
  );

  const volume = sessionSets.reduce((total, set) => {
    return total + set.weight * set.reps;
  }, 0);

  const setCount = sessionSets.length;
  const exerciseCount = records.length;

  return { volume, setCount, exerciseCount };
}

/**
 * セッションに統計情報とメニュー名を付与
 */
function enrichSessionWithStats(
  session: WorkoutSession,
  menusById: Map<number, { name: string }>,
  exerciseRecordsBySessionId: Map<number, ExerciseRecord[]>,
  setsByExerciseRecordId: Map<number, WorkoutSet[]>,
): WorkoutSessionWithStats {
  const menu = menusById.get(session.menuId);
  const stats = calculateSessionStats(
    session,
    exerciseRecordsBySessionId,
    setsByExerciseRecordId,
  );

  return {
    ...session,
    menuName: menu?.name ?? "不明なメニュー",
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
  sessions: WorkoutSessionWithStats[],
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

  // セッションを日付文字列でマッピング（高速検索用）
  // toDateKey はUTCの Date を JST の日付文字列に変換する
  const sessionsByDate = new Map<string, WorkoutSessionWithStats[]>();
  for (const session of sessions) {
    const dateStr = toDateKey(session.startedAt);
    const existing = sessionsByDate.get(dateStr) ?? [];
    existing.push(session);
    sessionsByDate.set(dateStr, existing);
  }

  // 空セル（月初めのパディング）
  for (let i = 0; i < startPadding; i++) {
    days.push({
      day: null,
      dateString: "",
      session: null,
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
    // 同日に複数セッションがある場合は最初の1つを表示（将来は複数対応可能）
    const sessionsForDate = sessionsByDate.get(dateString) ?? [];
    const session = sessionsForDate.length > 0 ? sessionsForDate[0] : null;

    days.push({
      day,
      dateString,
      session,
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
        sessionsList={[]}
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

  const [sessionsInMonth, sessionPlans, scheduledTasks] = await Promise.all([
    getSessionsByDateRange(userId, year, month),
    getSessionPlans(userId),
    getScheduledTasksWithPlanByDateRange(userId, startDate, endDate),
  ]);

  const sessionIds = sessionsInMonth.map((session) => session.id);
  const exerciseRecords = await getExerciseRecordsBySessionIds(sessionIds);
  const exerciseRecordIds = exerciseRecords.map((record) => record.id);
  const sets = await getWorkoutSetsByExerciseRecordIds(exerciseRecordIds);
  const menusByIds = await getMenusByIds(userId, [
    ...new Set(sessionsInMonth.map((session) => session.menuId)),
  ]);
  const menusById = new Map(menusByIds.map((menu) => [menu.id, menu]));
  const exerciseRecordsBySessionId =
    buildExerciseRecordsBySessionId(exerciseRecords);
  const setsByExerciseRecordId = buildSetsByExerciseRecordId(sets);

  // ============================================================================
  // データ計算（サーバー側で実行）
  // ============================================================================
  const sessionsWithStats: WorkoutSessionWithStats[] = sessionsInMonth.map(
    (session) =>
      enrichSessionWithStats(
        session,
        menusById,
        exerciseRecordsBySessionId,
        setsByExerciseRecordId,
      ),
  );

  // セッション一覧（新しい順にソート）
  const sessionsList = [...sessionsWithStats].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );

  // 各日付のスケジュールを計算
  // 各日付のスケジュールを計算
  const schedulesMap = new Map<string, CalculatedTask[]>();

  for (const task of scheduledTasks) {
    const dateKey = toDateKey(task.scheduledDate);
    const existing = schedulesMap.get(dateKey) ?? [];

    if (task.status === "completed") continue; // セッション履歴として表示されるためスキップ？

    const mappedTask: CalculatedTask = {
      taskId: Number(task.id),
      sessionPlanId: Number(task.sessionPlanId),
      sessionPlanName: task.sessionPlan.name,
      menuId: Number(task.sessionPlan.menuId),
      menuName: task.sessionPlan.menu.name,
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
    sessionsWithStats,
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
      sessionsList={sessionsList}
      todayDateString={todayDateString}
      plans={sessionPlans}
    />
  );
}
