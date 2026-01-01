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
  getPopulatedDailySchedules,
  getWorkoutSessionsByDateRange,
} from "@/lib/db/queries";
// import { getSchedulesForDate } from "@/lib/schedule-utils"; // Removed
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
  const [populatedSchedules, dailySessions, weeklySessions] = await Promise.all(
    [
      getPopulatedDailySchedules(userId, dailySessionStart, dailySessionEnd),
      getWorkoutSessionsByDateRange(userId, dailySessionStart, dailySessionEnd),
      getWorkoutSessionsByDateRange(userId, weekStart, endOfDay(today)),
    ],
  );

  // const menusById = new Map(menus.map((menu) => [menu.id, menu])); // Removed unused

  // セッションを日付ごとにマッピング
  const dailySessionsByDateKey = new Map<string, typeof dailySessions>();
  for (const session of dailySessions) {
    const dateKey = toDateKey(session.startedAt);
    const list = dailySessionsByDateKey.get(dateKey) ?? [];
    list.push(session);
    dailySessionsByDateKey.set(dateKey, list);
  }

  // スケジュールを日付ごとにマッピング
  const schedulesByDateKey = new Map<string, typeof populatedSchedules>();
  for (const schedule of populatedSchedules) {
    const dateKey = toDateKey(schedule.scheduledDate);
    const list = schedulesByDateKey.get(dateKey) ?? [];
    list.push(schedule);
    schedulesByDateKey.set(dateKey, list);
  }

  // 前後1日（昨日・今日・明日）のスケジュールを構築
  const dailyOffsets = [-1, 0, 1] as const;
  const dailySchedules = dailyOffsets.map((offset) => {
    const date = addDays(today, offset);
    const dateKey = toDateKey(date);
    const dayOfWeek = date.getDay();

    // その日のスケジュールをDBから取得
    const dbSchedules = schedulesByDateKey.get(dateKey) ?? [];

    // その日すでに実施済みのメニューを除外（WorkoutSessionベース）
    const daySessions = dailySessionsByDateKey.get(dateKey) ?? [];
    const completedMenuIds = new Set(daySessions.map((s) => s.menuId));

    // 未完了(pending)かつ未実施のスケジュールのみ残す
    // ※ completed, skipped, rescheduled はDBレベルで除外されているわけではないのでここでフィルタ
    //    (getPopulatedDailySchedulesは全ステータスを返す)
    const remainingSchedules = dbSchedules.filter((s) => {
      // すでにセッションがあれば除外
      if (completedMenuIds.has(s.routine.menuId)) return false;

      // ステータスチェック
      if (s.status === "completed") return false;
      if (s.status === "skipped") return false;
      if (s.status === "rescheduled") return false;

      return true;
    });

    const schedules = remainingSchedules.map((schedule) => {
      return {
        routineId: schedule.routineId,
        menuId: schedule.routine.menuId,
        menuName: schedule.routine.menu.name,
        routineType: schedule.routine.routineType,
        isFromReschedule: schedule.rescheduledFrom != null,
      };
    });

    const label = offset === -1 ? "昨日" : offset === 0 ? "今日" : "明日";
    const formattedDate = formatDateTimeJa(date).split(" ")[0];

    return {
      dateKey,
      label,
      formattedDate,
      isToday: dateKey === todayDateKey,
      dayOfWeek,
      schedules,
    };
  });

  // 今週のスケジュール目標数を計算（全日のスケジュール数）
  // ※ ここも本当はDBから取得すべきだが、週次統計は今回は簡易対応として
  //    現状のロジック（getSchedulesForDate）を残すか、ここだけgetPopulatedDailySchedulesを呼ぶか。
  //    一貫性のため、週次もDBから取得するように変更する。

  const weeklyPopulatedSchedules = await getPopulatedDailySchedules(
    userId,
    weekStart,
    weekEnd,
  );

  // マッピング
  const weeklySchedulesByDateKey = new Map<
    string,
    typeof weeklyPopulatedSchedules
  >();
  for (const schedule of weeklyPopulatedSchedules) {
    const dateKey = toDateKey(schedule.scheduledDate);
    const list = weeklySchedulesByDateKey.get(dateKey) ?? [];
    list.push(schedule);
    weeklySchedulesByDateKey.set(dateKey, list);
  }

  let weeklyGoal = 0;
  let weeklyCompleted = 0;
  const weekDayStatuses = weekDays.map((dayDate) => {
    const dayDateString = toDateKey(dayDate);
    const dayOfWeekIndex = dayDate.getDay();

    // その日のスケジュールをDBから取得
    const daySchedules = weeklySchedulesByDateKey.get(dayDateString) ?? [];

    // 目標数に含まれるのは pending, completed, skipped (rescheduledは移動しているので元の日には含まない？)
    // ここでは単純に「その日に予定されていたもの」とする
    // ただし rescheduled されたものは移動先にあるはず。
    // pending, completed, skipped をカウント。
    // rescheduled は除外。
    const targetSchedules = daySchedules.filter(
      (s) => s.status !== "rescheduled",
    );
    weeklyGoal += targetSchedules.length;

    // その日にセッション履歴があるか
    const dayHasSession = weeklySessions.some(
      (s) => toDateKey(s.startedAt) === dayDateString,
    );

    // 完了数（skippedも含む）
    const completedCount = daySchedules.filter(
      (s) => s.status === "completed" || s.status === "skipped",
    ).length;
    weeklyCompleted += completedCount;

    // pending数
    const pendingCount = targetSchedules.filter(
      (s) => s.status === "pending",
    ).length;

    // ステータス判定
    // 1. 予定がないのにセッション履歴がある -> completed (エクストラ)
    // 2. 予定があり、pendingが0 (すべて完了/スキップ) -> completed
    // 3. 予定があり、pending > 0 -> incomplete
    // 4. 予定がない -> none
    let status: "completed" | "incomplete" | "none" = "none";
    if (targetSchedules.length > 0) {
      if (pendingCount === 0) {
        status = "completed";
      } else {
        status = "incomplete";
      }
    } else {
      if (dayHasSession) {
        status = "completed";
      }
    }

    const isToday = dayDateString === todayDateKey;

    return {
      dateString: dayDateString,
      dayOfWeekIndex,
      status,
      isToday,
      hasSchedule: targetSchedules.length > 0,
    };
  });

  // ============================================================================
  // Client Component に props として渡す
  // ============================================================================
  return (
    <DashboardClient
      dailySchedules={dailySchedules}
      weeklyCompleted={weeklyCompleted}
      weeklyGoal={weeklyGoal}
      weekDayStatuses={weekDayStatuses}
    />
  );
}
