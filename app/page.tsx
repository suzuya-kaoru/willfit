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
  const todayDateString = today.toISOString().split("T")[0];

  // 週の開始日と終了日を計算
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // 月曜日開始
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // 日曜日終了
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: weekEnd,
  });

  // 前後1日（昨日・今日・明日）のスケジュールを構築
  const dailySchedules = [-1, 0, 1].map((offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    const dateKey = date.toISOString().split("T")[0];
    const dayOfWeek = getDay(date);

    // その日のスケジュール（作成日時の昇順）
    const daySchedulesRaw = mockWeekSchedule
      .filter((s) => s.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // その日すでに実施済みのメニューを判定
    const daySessions = mockSessions.filter(
      (s) => s.startedAt.toISOString().split("T")[0] === dateKey,
    );
    const completedMenuIds = new Set(daySessions.map((s) => s.menuId));

    // 「まだ実施していない」スケジュールのみを残す
    const remainingSchedules = daySchedulesRaw.filter(
      (s) => !completedMenuIds.has(s.menuId),
    );

    const schedules = remainingSchedules
      .map((schedule) => {
        const menu = getMenuWithExercises(schedule.menuId);
        if (!menu) return null;

        const previousSession =
          mockSessions.find((session) => session.menuId === menu.id) ?? null;

        return {
          scheduleId: schedule.id,
          menuId: menu.id,
          menuName: menu.name,
          exercises: menu.exercises,
          previousNote: previousSession?.note ?? null,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    const label = offset === -1 ? "昨日" : offset === 0 ? "今日" : "明日";

    return {
      dateKey,
      label,
      isToday: dateKey === todayDateString,
      schedules,
    };
  });

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
    const isToday = dayDateString === todayDateString;

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
      dailySchedules={dailySchedules}
      weeklyCompleted={weeklyCompleted}
      weeklyGoal={weeklyGoal}
      weekDayStatuses={weekDayStatuses}
    />
  );
}
