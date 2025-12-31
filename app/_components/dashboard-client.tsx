"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import {
  completeScheduleAction,
  skipScheduleAction,
} from "@/app/_actions/daily-schedule-actions";
import { DailySchedule } from "@/app/_components/dashboard/daily-schedule";
import type {
  DailySchedulesViewModel,
  WeekDayStatus,
} from "@/app/_components/dashboard/types";
import { WeeklyProgress } from "@/app/_components/dashboard/weekly-progress";
import { AppHeader } from "@/components/app-header";
import { BottomNavigation } from "@/components/bottom-navigation";

interface DashboardClientProps {
  todayFormatted: string;
  dailySchedules: DailySchedulesViewModel[];
  weeklyCompleted: number;
  weeklyGoal: number;
  weekDayStatuses: WeekDayStatus[];
}

export function DashboardClient({
  todayFormatted,
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

  // Effects
  React.useEffect(() => {
    setOptimisticHidden(new Set());
    if (!dailySchedules.some((day) => day.dateKey === activeDateKey)) {
      setActiveDateKey(dailySchedules[0]?.dateKey ?? "");
    }
  }, [dailySchedules, activeDateKey]);

  // Handlers
  const handleCompleteSchedule = (routineId: number, dateKey: string) => {
    const key = `${dateKey}:${routineId}`;
    setOptimisticHidden((prev) => new Set(prev).add(key));

    startTransition(async () => {
      try {
        await completeScheduleAction({ routineId, dateKey });
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

  const handleSkipSchedule = (routineId: number, dateKey: string) => {
    const key = `${dateKey}:${routineId}`;
    setOptimisticHidden((prev) => new Set(prev).add(key));

    startTransition(async () => {
      try {
        await skipScheduleAction({ routineId, dateKey });
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
        <DailySchedule
          todayFormatted={todayFormatted}
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
