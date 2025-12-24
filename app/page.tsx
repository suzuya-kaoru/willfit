import {
  addDays,
  eachDayOfInterval,
  endOfDay,
  endOfWeek,
  getDay,
  startOfDay,
  startOfWeek,
} from "date-fns";
import { toDateKey } from "@/lib/date-key";
import {
  getMenusWithExercises,
  getScheduleCheckMap,
  getScheduleRemindersMap,
  getWeekSchedules,
  getWorkoutSessionsByDateRange,
  getWorkoutSessionsByMenuIds,
} from "@/lib/db/queries";
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

  const dailyOffsets = [-1, 0, 1] as const;
  const dailyDates = dailyOffsets.map((offset) => {
    const date = new Date(today);
    date.setDate(today.getDate() + offset);
    return {
      offset,
      date,
      // YYYY-MM-DDの形式に変換
      dateKey: toDateKey(date),
      // 曜日（0-6）を取得
      dayOfWeek: getDay(date),
    };
  });

  const weekSchedules = await getWeekSchedules(userId);
  const menus = await getMenusWithExercises(userId);
  const menusById = new Map(menus.map((menu) => [menu.id, menu]));
  const menuIds = [
    ...new Set(weekSchedules.map((schedule) => schedule.menuId)),
  ];
  const dailySessionStart = startOfDay(addDays(today, -1));
  const dailySessionEnd = endOfDay(addDays(today, 1));
  const dailySessions = await getWorkoutSessionsByDateRange(
    userId,
    dailySessionStart,
    dailySessionEnd,
  );
  const weeklySessions = await getWorkoutSessionsByDateRange(
    userId,
    weekStart,
    endOfDay(today),
  );
  const sessionsByMenu = await getWorkoutSessionsByMenuIds(userId, menuIds);

  const scheduleChecksByDate = await getScheduleCheckMap(
    userId,
    dailyDates.map((day) => day.dateKey),
  );
  const remindersByScheduleId = await getScheduleRemindersMap(userId);

  const dailySessionsByDateKey = new Map<string, typeof dailySessions>();
  for (const session of dailySessions) {
    const dateKey = toDateKey(session.startedAt);
    const list = dailySessionsByDateKey.get(dateKey) ?? [];
    list.push(session);
    dailySessionsByDateKey.set(dateKey, list);
  }

  const sessionsByMenuId = new Map<number, typeof sessionsByMenu>();
  for (const session of sessionsByMenu) {
    const list = sessionsByMenuId.get(session.menuId) ?? [];
    list.push(session);
    sessionsByMenuId.set(session.menuId, list);
  }

  // 前後1日（昨日・今日・明日）のスケジュールを構築
  const dailySchedules = dailyDates.map((day) => {
    const dateKey = day.dateKey;
    const dayOfWeek = day.dayOfWeek;

    // その日のスケジュール（作成日時の昇順）
    const daySchedulesRaw = weekSchedules
      .filter((s) => s.dayOfWeek === dayOfWeek)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());

    // その日すでに実施済みのメニューを判定
    const daySessions = dailySessionsByDateKey.get(dateKey) ?? [];
    const completedScheduleIds = new Set<number>();
    for (const session of daySessions) {
      for (const schedule of daySchedulesRaw) {
        if (schedule.menuId === session.menuId) {
          completedScheduleIds.add(schedule.id);
        }
      }
    }
    const checkedScheduleIds = scheduleChecksByDate.get(dateKey) ?? new Set();

    // 「まだ実施していない」スケジュールのみを残す
    const remainingSchedules = daySchedulesRaw.filter(
      (s) => !completedScheduleIds.has(s.id) && !checkedScheduleIds.has(s.id),
    );

    const schedules = remainingSchedules
      .map((schedule) => {
        const menu = menusById.get(schedule.menuId);
        if (!menu) return null;

        const previousSession = sessionsByMenuId.get(menu.id)?.[0] ?? null;
        const reminder = remindersByScheduleId.get(schedule.id);
        const reminderView = reminder
          ? {
              frequency: reminder.frequency,
              timeOfDay: reminder.timeOfDay,
              dayOfWeek: reminder.dayOfWeek ?? null,
              dayOfMonth: reminder.dayOfMonth ?? null,
              startDateKey: toDateKey(reminder.startDate),
              isEnabled: reminder.isEnabled,
            }
          : null;

        return {
          scheduleId: schedule.id,
          menuId: menu.id,
          menuName: menu.name,
          exercises: menu.exercises,
          previousNote: previousSession?.note ?? null,
          reminder: reminderView,
        };
      })
      .filter((s): s is NonNullable<typeof s> => s !== null);

    const label =
      day.offset === -1 ? "昨日" : day.offset === 0 ? "今日" : "明日";

    return {
      dateKey,
      label,
      isToday: dateKey === todayDateKey,
      dayOfWeek,
      schedules,
    };
  });

  // 今週のセッション数を計算
  const weeklyGoal = weekSchedules.length;
  const weekDateKeys = weekDays.map((dayDate) => toDateKey(dayDate));
  const scheduleChecksThisWeek = await getScheduleCheckMap(
    userId,
    weekDateKeys,
  );

  const completedScheduleKeys = new Set<string>();
  for (const session of weeklySessions) {
    const sessionDate = new Date(session.startedAt);
    const dateKey = toDateKey(sessionDate);
    const sessionDayOfWeek = getDay(sessionDate);
    const matchedSchedules = weekSchedules.filter(
      (schedule) =>
        schedule.dayOfWeek === sessionDayOfWeek &&
        schedule.menuId === session.menuId,
    );
    for (const schedule of matchedSchedules) {
      completedScheduleKeys.add(`${dateKey}:${schedule.id}`);
    }
  }

  for (const [dateKey, scheduleIds] of scheduleChecksThisWeek) {
    for (const scheduleId of scheduleIds) {
      completedScheduleKeys.add(`${dateKey}:${scheduleId}`);
    }
  }

  const weeklyCompleted = completedScheduleKeys.size;

  // 週の各日のステータスを計算
  const weekDayStatuses = weekDays.map((dayDate) => {
    const dayOfWeekIndex = getDay(dayDate);
    const scheduleDay = weekSchedules.find(
      (s) => s.dayOfWeek === dayOfWeekIndex,
    );
    const dayDateString = toDateKey(dayDate);
    const isCompletedBySession = weeklySessions.some(
      (s) => toDateKey(s.startedAt) === dayDateString,
    );
    const checkedScheduleIds = scheduleChecksThisWeek.get(dayDateString);
    const isCompleted =
      isCompletedBySession || (checkedScheduleIds?.size ?? 0) > 0;
    const isToday = dayDateString === todayDateKey;

    return {
      dateString: dayDateString,
      dayOfWeekIndex,
      isCompleted,
      isToday,
      hasSchedule: !!scheduleDay,
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
