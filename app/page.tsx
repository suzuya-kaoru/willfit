import {
  addDays,
  eachDayOfInterval,
  endOfWeek as endOfWeekTz,
  startOfWeek as startOfWeekTz,
  subDays,
} from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { parseDateKey, toDateKey } from "@/lib/date-key";
import {
  getScheduledTasksWithPlanByDateRange,
  getWorkoutSessionsByDateRange,
} from "@/lib/db/queries";
import { APP_TIMEZONE, toUtcDateTimeFromJstString } from "@/lib/timezone";
import { DashboardClient } from "./_components/dashboard-client";

/**
 * JSTの週開始日（月曜日）を取得
 */
function getJstWeekStart(date: Date): Date {
  // 現在のUTC時刻をJSTに変換
  const jstDate = toZonedTime(date, APP_TIMEZONE);
  // JSTでの週開始日を計算
  const jstWeekStart = startOfWeekTz(jstDate, { weekStartsOn: 1 });
  // その日のJST 00:00をUTCに変換
  const dateKey = `${jstWeekStart.getFullYear()}-${String(jstWeekStart.getMonth() + 1).padStart(2, "0")}-${String(jstWeekStart.getDate()).padStart(2, "0")}`;
  return parseDateKey(dateKey);
}

/**
 * JSTの週終了日（日曜日）を取得
 */
function getJstWeekEnd(date: Date): Date {
  const jstDate = toZonedTime(date, APP_TIMEZONE);
  const jstWeekEnd = endOfWeekTz(jstDate, { weekStartsOn: 1 });
  const dateKey = `${jstWeekEnd.getFullYear()}-${String(jstWeekEnd.getMonth() + 1).padStart(2, "0")}-${String(jstWeekEnd.getDate()).padStart(2, "0")}`;
  // 週末の終わりなので、翌日の00:00 - 1ms = 23:59:59.999
  const endOfDayUtc = parseDateKey(dateKey);
  const nextDay = addDays(endOfDayUtc, 1);
  return new Date(nextDay.getTime() - 1);
}

export default async function DashboardPage() {
  // ============================================================================
  // Server Component: 日付計算とデータ取得（サーバー側で実行）
  // ============================================================================

  // 現在の日付を取得（JST基準）
  const userId = 1;
  const now = new Date();
  const todayDateKey = toDateKey(now);

  // JSTの「今日」の開始時刻（UTC表現）
  // 1. UTCの現在時刻を取得 (new Date())
  // 2. それをJSTの日付文字列(YYYY-MM-DD)に変換 (toDateKey)
  // 3. そのJST日付の00:00をUTC時刻として取得 (toUtcDateTimeFromJstString)
  const todayStart = toUtcDateTimeFromJstString(toDateKey(new Date()));

  // 週の開始日と終了日を計算（JST基準）
  const weekStart = getJstWeekStart(now);
  const weekEnd = getJstWeekEnd(now);

  // JSTの今日を基準に週の日付を生成
  const jstToday = toZonedTime(now, APP_TIMEZONE);
  const jstWeekStart = startOfWeekTz(jstToday, { weekStartsOn: 1 });
  const jstWeekEnd = endOfWeekTz(jstToday, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({
    start: jstWeekStart,
    end: jstWeekEnd,
  });

  // 前後1日の範囲（JST基準）
  // 前後1日の範囲（JST基準）
  // 昨日のJST 00:00
  const dailySessionStart = subDays(todayStart, 1);
  // 明日のJST 23:59:59 (明後日の00:00 - 1ms)
  const dayAfterTomorrowStart = addDays(todayStart, 2);
  const dailySessionEnd = new Date(dayAfterTomorrowStart.getTime() - 1);

  // データ取得
  const [scheduledTasks, dailySessions, weeklySessions] = await Promise.all([
    getScheduledTasksWithPlanByDateRange(
      userId,
      dailySessionStart,
      dailySessionEnd,
    ),
    getWorkoutSessionsByDateRange(userId, dailySessionStart, dailySessionEnd),
    getWorkoutSessionsByDateRange(
      userId,
      weekStart,
      new Date(addDays(todayStart, 1).getTime() - 1),
    ),
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
    // JSTの「今日」を基準にオフセット計算
    const jstDate = addDays(jstToday, offset);
    const dateKey = `${jstDate.getFullYear()}-${String(jstDate.getMonth() + 1).padStart(2, "0")}-${String(jstDate.getDate()).padStart(2, "0")}`;
    const dayOfWeek = jstDate.getDay();

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
    // JSTの日付をフォーマット
    const formattedDate = `${jstDate.getFullYear()}年${jstDate.getMonth() + 1}月${jstDate.getDate()}日`;

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
