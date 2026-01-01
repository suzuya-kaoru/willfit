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
  getScheduledTasksWithPlanByDateRange,
  getWorkoutSessionsByDateRange,
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

  // 前後1日の範囲
  const dailySessionStart = startOfDay(addDays(today, -1));
  const dailySessionEnd = endOfDay(addDays(today, 1));

  // データ取得
  const [scheduledTasks, dailySessions, weeklySessions] = await Promise.all([
    getScheduledTasksWithPlanByDateRange(
      userId,
      dailySessionStart,
      dailySessionEnd,
    ),
    getWorkoutSessionsByDateRange(userId, dailySessionStart, dailySessionEnd),
    getWorkoutSessionsByDateRange(userId, weekStart, endOfDay(today)),
  ]);

  // セッションを日付ごとにマッピング
  const dailySessionsByDateKey = new Map<string, typeof dailySessions>();
  for (const session of dailySessions) {
    const dateKey = toDateKey(session.startedAt);
    const list = dailySessionsByDateKey.get(dateKey) ?? [];
    list.push(session);
    dailySessionsByDateKey.set(dateKey, list);
  }

  // スケジュールを日付ごとにマッピング
  const tasksByDateKey = new Map<string, typeof scheduledTasks>();
  for (const task of scheduledTasks) {
    const dateKey = toDateKey(task.scheduledDate);
    const list = tasksByDateKey.get(dateKey) ?? [];
    list.push(task);
    tasksByDateKey.set(dateKey, list);
  }

  // 前後1日（昨日・今日・明日）のスケジュールを構築
  const dailyOffsets = [-1, 0, 1] as const;
  const dailySchedules = dailyOffsets.map((offset) => {
    const date = addDays(today, offset);
    const dateKey = toDateKey(date);
    const dayOfWeek = date.getDay();

    // その日のスケジュールをDBから取得
    const dbTasks = tasksByDateKey.get(dateKey) ?? [];

    // その日すでに実施済みのメニューを除外（WorkoutSessionベース）
    // NOTE: 新システムでは sessionPlanId をチェックすべき
    const daySessions = dailySessionsByDateKey.get(dateKey) ?? [];
    // sessionPlanIdを持つセッションのセット
    const completedPlanIds = new Set(
      daySessions
        .map((s) => (s.sessionPlanId ? Number(s.sessionPlanId) : null))
        .filter(Boolean),
    );

    // 未完了(pending)かつ未実施のスケジュールのみ残す
    const remainingTasks = dbTasks.filter((task) => {
      // すでにセッションがあれば除外
      if (completedPlanIds.has(Number(task.sessionPlanId))) return false;

      // ステータスチェック
      if (task.status === "completed") return false;
      if (task.status === "skipped") return false;
      if (task.status === "rescheduled") return false;

      return true;
    });

    const schedules = remainingTasks.map((task) => {
      return {
        taskId: Number(task.id),
        sessionPlanId: Number(task.sessionPlanId),
        menuId: Number(task.sessionPlan.menu.id),
        menuName: task.sessionPlan.name,
        ruleType: task.rule?.ruleType,
        isFromReschedule: task.rescheduledFrom != null,
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

  // 今週のスケジュール目標数を計算
  const weeklyScheduledTasks = await getScheduledTasksWithPlanByDateRange(
    userId,
    weekStart,
    weekEnd,
  );

  // マッピング
  const weeklyTasksByDateKey = new Map<string, typeof weeklyScheduledTasks>();
  for (const task of weeklyScheduledTasks) {
    const dateKey = toDateKey(task.scheduledDate);
    const list = weeklyTasksByDateKey.get(dateKey) ?? [];
    list.push(task);
    weeklyTasksByDateKey.set(dateKey, list);
  }

  let weeklyGoal = 0;
  let weeklyCompleted = 0;
  const weekDayStatuses = weekDays.map((dayDate) => {
    const dayDateString = toDateKey(dayDate);
    const dayOfWeekIndex = dayDate.getDay();

    // その日のスケジュールをDBから取得
    const dayTasks = weeklyTasksByDateKey.get(dayDateString) ?? [];

    // 目標数に含まれるのは pending, completed, skipped
    const targetTasks = dayTasks.filter((s) => s.status !== "rescheduled");
    weeklyGoal += targetTasks.length;

    // その日にセッション履歴があるか
    const dayHasSession = weeklySessions.some(
      (s) => toDateKey(s.startedAt) === dayDateString,
    );

    // 完了数（skippedも含む）
    const completedCount = dayTasks.filter(
      (s) => s.status === "completed" || s.status === "skipped",
    ).length;
    weeklyCompleted += completedCount;

    // pending数
    const pendingCount = targetTasks.filter(
      (s) => s.status === "pending",
    ).length;

    // ステータス判定
    let status: "completed" | "incomplete" | "none" = "none";
    if (targetTasks.length > 0) {
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
      hasSchedule: targetTasks.length > 0,
    };
  });

  return (
    <DashboardClient
      dailySchedules={dailySchedules}
      weeklyCompleted={weeklyCompleted}
      weeklyGoal={weeklyGoal}
      weekDayStatuses={weekDayStatuses}
    />
  );
}
