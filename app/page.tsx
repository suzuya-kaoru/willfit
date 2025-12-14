import { eachDayOfInterval, endOfWeek, getDay, startOfWeek } from "date-fns";
import {
  getMenuWithExercises,
  mockSessions,
  mockWeekSchedule,
} from "@/lib/mock-data";
import { DashboardClient } from "./_components/dashboard-client";

export default function DashboardPage() {
  // ============================================================================
  // Server Component: 日付計算とデータ取得（サーバー側で実行）
  // ============================================================================

  // 現在の日付を取得（サーバー側で実行されるため、一貫性が保証される）
  const today = new Date();
  const dayOfWeek = getDay(today);

  // 週の開始日と終了日を計算
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // 月曜日開始
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // 日曜日終了
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: weekEnd,
  });

  // 今日のスケジュールを取得
  const todaySchedule = mockWeekSchedule.find((s) => s.dayOfWeek === dayOfWeek);
  const todayMenu = todaySchedule
    ? (getMenuWithExercises(todaySchedule.menuId) ?? null)
    : null;

  // 前回のセッションメモを取得
  const previousSession = todayMenu
    ? (mockSessions.find((s) => s.menuId === todayMenu.id) ?? null)
    : null;

  // 今週のセッション数を計算
  const sessionsThisWeek = mockSessions.filter((s) => {
    const sessionDate = new Date(s.startedAt);
    return sessionDate >= weekStart && sessionDate <= today;
  });
  const weeklyGoal = mockWeekSchedule.length;
  const weeklyCompleted = sessionsThisWeek.length;

  // 週の各日のステータスを計算
  const weekDayStatuses = weekDays.map((dayDate) => {
    const dayOfWeekIndex = getDay(dayDate);
    const scheduleDay = mockWeekSchedule.find(
      (s) => s.dayOfWeek === dayOfWeekIndex,
    );
    const dayDateString = dayDate.toISOString().split("T")[0];
    const isCompleted = mockSessions.some(
      (s) => s.startedAt.toISOString().split("T")[0] === dayDateString,
    );
    const isToday = dayDateString === today.toISOString().split("T")[0];

    return {
      dateString: dayDateString,
      dayOfWeekIndex,
      isCompleted,
      isToday,
      hasSchedule: !!scheduleDay,
    };
  });

  // 日付フォーマット（サーバー側で実行）
  const todayFormatted = today.toLocaleDateString("ja-JP", {
    month: "long",
    day: "numeric",
    weekday: "short",
  });

  // ============================================================================
  // Client Component に props として渡す
  // ============================================================================
  return (
    <DashboardClient
      todayFormatted={todayFormatted}
      todayMenu={todayMenu}
      previousSession={previousSession}
      weeklyCompleted={weeklyCompleted}
      weeklyGoal={weeklyGoal}
      weekDayStatuses={weekDayStatuses}
    />
  );
}
