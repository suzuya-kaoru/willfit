"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import {
  completeTaskAction,
  skipTaskAction,
} from "@/app/_actions/scheduled-task-actions";
import { DailySchedule } from "@/app/_components/dashboard/daily-schedule";
import type {
  DailySchedulesViewModel,
  WeekDayStatus,
} from "@/app/_components/dashboard/types";
import { WeeklyProgress } from "@/app/_components/dashboard/weekly-progress";
import { AppHeader } from "@/components/app-header";
import { BottomNavigation } from "@/components/bottom-navigation";

interface DashboardClientProps {
  dailySchedules: DailySchedulesViewModel[];
  weeklyCompleted: number;
  weeklyGoal: number;
  weekDayStatuses: WeekDayStatus[];
}

export function DashboardClient({
  dailySchedules,
  weeklyCompleted,
  weeklyGoal,
  weekDayStatuses,
}: DashboardClientProps) {
  const router = useRouter();

  const defaultDateKey =
    dailySchedules.find((d) => d.isToday)?.dateKey ??
    dailySchedules[0]?.dateKey ??
    "";

  // Global State
  const [activeDateKey, setActiveDateKey] =
    React.useState<string>(defaultDateKey);

  const [isPending, startTransition] = React.useTransition();
  const [optimisticHidden, setOptimisticHidden] = React.useState<Set<string>>(
    () => new Set(),
  );

  // 前回のdailySchedulesを保持して変更を検知
  const prevDailySchedulesRef = React.useRef(dailySchedules);

  // Effects: データ更新時にoptimisticHiddenをリセット
  React.useEffect(() => {
    if (prevDailySchedulesRef.current !== dailySchedules) {
      setOptimisticHidden(new Set());
      prevDailySchedulesRef.current = dailySchedules;
    }
  }, [dailySchedules]);

  // activeDateKeyが無効になった場合のみリセット（日付が変わった場合など）
  React.useEffect(() => {
    if (
      activeDateKey &&
      !dailySchedules.some((day) => day.dateKey === activeDateKey)
    ) {
      const todayKey = dailySchedules.find((d) => d.isToday)?.dateKey;
      setActiveDateKey(todayKey ?? dailySchedules[0]?.dateKey ?? "");
    }
  }, [dailySchedules, activeDateKey]);

  // Handlers
  const handleCompleteSchedule = (taskId: number, dateKey: string) => {
    const key = `${dateKey}:${taskId}`;
    setOptimisticHidden((prev) => new Set(prev).add(key));

    startTransition(async () => {
      try {
        await completeTaskAction(taskId);
        router.refresh();
      } catch {
        setOptimisticHidden((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    });
  };

  const handleSkipSchedule = (taskId: number, dateKey: string) => {
    const key = `${dateKey}:${taskId}`;
    setOptimisticHidden((prev) => new Set(prev).add(key));

    startTransition(async () => {
      try {
        await skipTaskAction(taskId);
        router.refresh();
      } catch {
        setOptimisticHidden((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />

      <main className="mx-auto max-w-md space-y-4 p-4">
        {/* Weekly Progress */}
        <WeeklyProgress
          weeklyCompleted={weeklyCompleted}
          weeklyGoal={weeklyGoal}
          weekDayStatuses={weekDayStatuses}
        />

        {/* Daily Schedule Carousel */}
        {/* keyを追加して日付変更時に強制再マウントさせる */}
        <DailySchedule
          key={activeDateKey}
          dailySchedules={dailySchedules}
          activeDateKey={activeDateKey}
          onActiveDateChange={setActiveDateKey}
          hiddenIds={optimisticHidden}
          isPending={isPending}
          onComplete={handleCompleteSchedule}
          onSkip={handleSkipSchedule}
        />
      </main>

      <BottomNavigation />
    </div>
  );
}
