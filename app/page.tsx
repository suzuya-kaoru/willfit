import {
  addDays,
  eachDayOfInterval,
  endOfDay,
  endOfWeek,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { toDateKey } from "@/lib/date-key";
import {
  getActiveRoutines,
  getDailySchedulesByDateRange,
  getMenus,
  getWorkoutSessionsByDateRange,
} from "@/lib/db/queries";
import { getSchedulesForDate } from "@/lib/schedule-utils";
import { formatDateTimeJa } from "@/lib/timezone";
import { DashboardClient } from "./_components/dashboard-client";

export default async function DashboardPage() {
  // ============================================================================
  // Server Component: 日付計算とデータ取得（サーバー側で実行）
  // ============================================================================

  // 現在の日付を取得（Asia/Tokyo）
  const userId = 1;
  const today = new Date();
  const todayDateKey = toDateKey(today);

  // 週の開始日と終了日を計算
  const weekStart = startOfWeek(today, { weekStartsOn: 1 }); // 月曜日開始
  const weekEnd = endOfWeek(today, { weekStartsOn: 1 }); // 日曜日終了
  const weekDays = eachDayOfInterval({
    start: weekStart,
    end: weekEnd,
  });

  // 前後1日の範囲
  const dailySessionStart = startOfDay(addDays(today, -1));
  const dailySessionEnd = endOfDay(addDays(today, 1));

  // データ取得
  const [routines, menus, dailySchedulesMap, dailySessions, weeklySessions] =
    await Promise.all([
      getActiveRoutines(userId),
      getMenus(userId),
      getDailySchedulesByDateRange(userId, dailySessionStart, dailySessionEnd),
      getWorkoutSessionsByDateRange(userId, dailySessionStart, dailySessionEnd),
      getWorkoutSessionsByDateRange(userId, weekStart, endOfDay(today)),
    ]);

  const menusById = new Map(menus.map((menu) => [menu.id, menu]));

  // セッションを日付ごとにマッピング
  const dailySessionsByDateKey = new Map<string, typeof dailySessions>();
  for (const session of dailySessions) {
    const dateKey = toDateKey(session.startedAt);
    const list = dailySessionsByDateKey.get(dateKey) ?? [];
    list.push(session);
    dailySessionsByDateKey.set(dateKey, list);
  }

  // 前後1日（昨日・今日・明日）のスケジュールを構築
  const dailyOffsets = [-1, 0, 1] as const;
  const dailySchedules = dailyOffsets.map((offset) => {
    const date = addDays(today, offset);
    const dateKey = toDateKey(date);
    const dayOfWeek = date.getDay();

    // その日のスケジュールを計算
    const calculatedSchedules = getSchedulesForDate(
      routines,
      menusById,
      date,
      dailySchedulesMap,
    );

    // その日すでに実施済みのメニューを除外
    const daySessions = dailySessionsByDateKey.get(dateKey) ?? [];
    const completedMenuIds = new Set(daySessions.map((s) => s.menuId));

    // 未完了かつ未スキップのスケジュールのみ残す
    const remainingSchedules = calculatedSchedules.filter((s) => {
      // すでにセッションがあれば除外
      if (completedMenuIds.has(s.menuId)) return false;
      // daily_scheduleで完了/スキップ済みなら除外
      if (s.dailySchedule?.status === "completed") return false;
      if (s.dailySchedule?.status === "skipped") return false;
      if (s.dailySchedule?.status === "rescheduled") return false;
      return true;
    });

    const schedules = remainingSchedules.map((schedule) => {
      const menu = menusById.get(schedule.menuId);
      return {
        routineId: schedule.routineId,
        menuId: schedule.menuId,
        menuName: menu?.name ?? "不明なメニュー",
        routineType: schedule.routineType,
        isFromReschedule: schedule.isFromReschedule,
      };
    });

    const label = offset === -1 ? "昨日" : offset === 0 ? "今日" : "明日";

    return {
      dateKey,
      label,
      isToday: dateKey === todayDateKey,
      dayOfWeek,
      schedules,
    };
  });

  // 今週のスケジュール目標数を計算（全日のスケジュール数）
  const weeklyDailySchedulesMap = await getDailySchedulesByDateRange(
    userId,
    weekStart,
    weekEnd,
  );

  let weeklyGoal = 0;
  let weeklyCompleted = 0;
  const weekDayStatuses = weekDays.map((dayDate) => {
    const dayDateString = toDateKey(dayDate);
    const dayOfWeekIndex = dayDate.getDay();

    // その日のスケジュールを計算
    const daySchedules = getSchedulesForDate(
      routines,
      menusById,
      dayDate,
      weeklyDailySchedulesMap,
    );

    weeklyGoal += daySchedules.length;

    // 完了判定（セッションがある or daily_scheduleがcompleted）
    const dayHasSession = weeklySessions.some(
      (s) => toDateKey(s.startedAt) === dayDateString,
    );
    const completedCount = daySchedules.filter(
      (s) => s.dailySchedule?.status === "completed",
    ).length;
    weeklyCompleted += completedCount;

    // その日が「完了」とみなすか（少なくとも1つ完了していればOK）
    const isCompleted = dayHasSession || completedCount > 0;
    const isToday = dayDateString === todayDateKey;

    return {
      dateString: dayDateString,
      dayOfWeekIndex,
      isCompleted,
      isToday,
      hasSchedule: daySchedules.length > 0,
    };
  });

  // 日付フォーマット（Asia/Tokyo）
  const todayFormatted = formatDateTimeJa(today).split(" ")[0]; // "2024年12月24日"

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
