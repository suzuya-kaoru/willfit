import {
  getMenuWithExercises,
  mockMenuExercises,
  mockMenus,
  mockSessions,
  mockSets,
  mockWeekSchedule,
} from "@/lib/mock-data";
import type { MenuExercise, WorkoutSession } from "@/lib/types";
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
 * 将来的に DB に切り替える際は、以下の関数を DB アクセス層に置き換える：
 * - getSessionsByDateRange() → DB クエリ
 * - getSetsBySessionIds() → DB クエリ
 * - getMenusByIds() → DB クエリ
 * - calculateSessionStats() → サーバー側の計算ロジック（変更なし）
 */

/**
 * 指定された年月のセッションを取得
 * TODO: DB移行時は、この関数を DB アクセス層に置き換える
 */
function getSessionsByDateRange(year: number, month: number): WorkoutSession[] {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59, 999);

  return mockSessions.filter((session) => {
    const sessionDate = new Date(session.startedAt);
    return sessionDate >= startDate && sessionDate <= endDate;
  });
}

/**
 * 全セットを取得（将来的に DB アクセス層に置き換える）
 * TODO: DB移行時は、この関数を DB アクセス層に置き換える
 */
function getAllSets() {
  return mockSets;
}

/**
 * セッションIDと種目IDから exercise_record_id を算出
 * - mockデータのIDはセッション順 × メニュー内の並び順で連番
 * - DB移行時は exercise_records をJOINして取得する想定
 */
function getExerciseRecordId(sessionId: number, exerciseId: number) {
  const session = mockSessions.find((s) => s.id === sessionId);
  if (!session) return null;

  // セッションIDより前のセッションに含まれる種目数を合計
  const countBefore = mockSessions
    .filter((s) => s.id < sessionId)
    .reduce((acc: number, s) => {
      const exercisesInMenu = mockMenuExercises.filter(
        (me: MenuExercise) => me.menuId === s.menuId,
      );
      return acc + exercisesInMenu.length;
    }, 0);

  // 現在のセッションのメニュー内での順序を取得
  const menuExercises = mockMenuExercises
    .filter((me: MenuExercise) => me.menuId === session.menuId)
    .sort(
      (a: MenuExercise, b: MenuExercise) => a.displayOrder - b.displayOrder,
    );
  const exerciseOrder = menuExercises.findIndex(
    (me) => me.exerciseId === exerciseId,
  );
  if (exerciseOrder === -1) return null;

  return countBefore + exerciseOrder + 1;
}

/**
 * セッションの統計情報を計算
 * sessionIdベースでexercise_record_idを算出し、それに紐づくセットを集計
 * この関数は DB 移行後もサーバー側で実行される
 */
function calculateSessionStats(
  session: WorkoutSession,
  allSets: typeof mockSets,
): {
  volume: number;
  setCount: number;
  exerciseCount: number;
} {
  // このセッションに紐づく exercise_record_id を算出
  const menuExercises = mockMenuExercises
    .filter((me: MenuExercise) => me.menuId === session.menuId)
    .sort(
      (a: MenuExercise, b: MenuExercise) => a.displayOrder - b.displayOrder,
    );
  const recordIdsForSession = menuExercises
    .map((me: MenuExercise) => getExerciseRecordId(session.id, me.exerciseId))
    .filter((id): id is number => id !== null);

  // このセッションに紐づくセットのみを取得
  const sessionSets = allSets.filter((set) =>
    recordIdsForSession.includes(set.exerciseRecordId),
  );

  const volume = sessionSets.reduce((total, set) => {
    return total + set.weight * set.reps;
  }, 0);

  const setCount = sessionSets.length;

  // メニューから種目数を取得
  const menu = getMenuWithExercises(session.menuId);
  const exerciseCount = menu?.exercises.length ?? 0;

  return { volume, setCount, exerciseCount };
}

/**
 * セッションに統計情報とメニュー名を付与
 */
function enrichSessionWithStats(
  session: WorkoutSession,
  allSets: typeof mockSets,
): WorkoutSessionWithStats {
  const menu = mockMenus.find((m) => m.id === session.menuId);
  const stats = calculateSessionStats(session, allSets);

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
    const dateStr = new Date(session.startedAt).toISOString().split("T")[0];
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
    const dateString = date.toISOString().split("T")[0];
    const dayOfWeek = date.getDay();
    const isScheduled = mockWeekSchedule.some((s) => s.dayOfWeek === dayOfWeek);
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
        todayDateString={today.toISOString().split("T")[0]}
      />
    );
  }

  // ============================================================================
  // データ取得（将来的に DB アクセス層に置き換え）
  // ============================================================================
  const sessionsInMonth = getSessionsByDateRange(year, month);
  const allSets = getAllSets(); // セットとセッションの関連付けは日付ベースで行う

  // ============================================================================
  // データ計算（サーバー側で実行）
  // ============================================================================
  const sessionsWithStats: WorkoutSessionWithStats[] = sessionsInMonth.map(
    (session) => enrichSessionWithStats(session, allSets),
  );

  // セッション一覧（新しい順にソート）
  const sessionsList = [...sessionsWithStats].sort(
    (a, b) => new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime(),
  );

  // カレンダーの日付情報を生成
  const todayDateString = today.toISOString().split("T")[0];
  const calendarDays = generateCalendarDays(
    year,
    month,
    sessionsWithStats,
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
