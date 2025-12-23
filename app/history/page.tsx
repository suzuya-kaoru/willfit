import {
  getExerciseRecordsBySessionIds,
  getMenusByIds,
  getWeekSchedules,
  getWorkoutSessionsByDateRange,
  getWorkoutSetsByExerciseRecordIds,
} from "@/lib/db/queries";
import { toDateKey } from "@/lib/date-key";
import type { ExerciseLog, WorkoutSession, WorkoutSet } from "@/lib/types";
import {
  type CalendarDay,
  HistoryClient,
  type WorkoutSessionWithStats,
} from "./_components/history-client";

/**
 * ============================================================================
 * Server Component: データ取得と計算（サーバー側で実行）
 * ============================================================================
 *
 * DBアクセス層を使用して、セッション・セット・メニュー情報を取得する。
 * 集計ロジックはサーバー側に保持し、UIは表示専用にする。
 */

/**
 * 指定された年月のセッションを取得
 */
async function getSessionsByDateRange(
  userId: number,
  year: number,
  month: number,
): Promise<WorkoutSession[]> {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  return getWorkoutSessionsByDateRange(userId, startDate, endDate);
}

function buildExerciseRecordsBySessionId(
  records: ExerciseLog[],
): Map<number, ExerciseLog[]> {
  const map = new Map<number, ExerciseLog[]>();
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
  exerciseRecordsBySessionId: Map<number, ExerciseLog[]>,
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
  exerciseRecordsBySessionId: Map<number, ExerciseLog[]>,
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
 */
function generateCalendarDays(
  year: number,
  month: number,
  sessions: WorkoutSessionWithStats[],
  weekSchedules: { dayOfWeek: number }[],
  todayDateString: string,
): CalendarDay[] {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startPadding = firstDay.getDay();
  const totalDays = lastDay.getDate();

  const days: CalendarDay[] = [];

  // セッションを日付文字列でマッピング（高速検索用）
  // 同日に複数セッションがある場合を考慮して配列で保持
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
      isScheduled: false,
      isToday: false,
    });
  }

  // 実際の日付
  for (let day = 1; day <= totalDays; day++) {
    const date = new Date(year, month, day);
    const dateString = toDateKey(date);
    const dayOfWeek = date.getDay();
    const isScheduled = weekSchedules.some((s) => s.dayOfWeek === dayOfWeek);
    // 同日に複数セッションがある場合は最初の1つを表示（将来は複数対応可能）
    const sessionsForDate = sessionsByDate.get(dateString) ?? [];
    const session = sessionsForDate.length > 0 ? sessionsForDate[0] : null;

    days.push({
      day,
      dateString,
      session,
      isScheduled,
      isToday: dateString === todayDateString,
    });
  }

  return days;
}

/**
 * History Page (Server Component)
 */
interface HistoryPageProps {
  searchParams: Promise<{
    year?: string;
    month?: string;
  }>;
}

export default async function HistoryPage({ searchParams }: HistoryPageProps) {
  // ============================================================================
  // URL パラメータから年月を取得（デフォルトは現在の年月）
  // ============================================================================
  const params = await searchParams;
  const userId = 1;
  const today = new Date();
  const year = params.year ? parseInt(params.year, 10) : today.getFullYear();
  const month = params.month
    ? parseInt(params.month, 10) - 1 // URL は 1-based、Date は 0-based
    : today.getMonth();

  // バリデーション
  if (Number.isNaN(year) || Number.isNaN(month) || month < 0 || month > 11) {
    // 無効なパラメータの場合は現在の年月を使用
    const validYear = today.getFullYear();
    const validMonth = today.getMonth();
    return (
      <HistoryClient
        year={validYear}
        month={validMonth}
        calendarDays={[]}
        sessionsList={[]}
        todayDateString={toDateKey(today)}
      />
    );
  }

  // ============================================================================
  // データ取得（将来的に DB アクセス層に置き換え）
  // ============================================================================
  const [sessionsInMonth, weekSchedules] = await Promise.all([
    getSessionsByDateRange(userId, year, month),
    getWeekSchedules(userId),
  ]);
  const sessionIds = sessionsInMonth.map((session) => session.id);
  const exerciseRecords = await getExerciseRecordsBySessionIds(sessionIds);
  const exerciseRecordIds = exerciseRecords.map((record) => record.id);
  const sets = await getWorkoutSetsByExerciseRecordIds(exerciseRecordIds);
  const menus = await getMenusByIds(
    userId,
    [...new Set(sessionsInMonth.map((session) => session.menuId))],
  );
  const menusById = new Map(menus.map((menu) => [menu.id, menu]));
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

  // カレンダーの日付情報を生成
  const todayDateString = toDateKey(today);
  const calendarDays = generateCalendarDays(
    year,
    month,
    sessionsWithStats,
    weekSchedules,
    todayDateString,
  );

  // ============================================================================
  // Client Component に props として渡す
  // ============================================================================
  return (
    <HistoryClient
      year={year}
      month={month}
      calendarDays={calendarDays}
      sessionsList={sessionsList}
      todayDateString={todayDateString}
    />
  );
}
