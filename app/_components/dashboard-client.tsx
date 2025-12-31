"use client";

import { useRouter } from "next/navigation";
import * as React from "react";
import {
  deleteScheduleReminderAction,
  saveScheduleReminderAction,
} from "@/app/_actions/reminder-actions";
import { checkScheduleAction } from "@/app/_actions/schedule-actions";
import { DailySchedule } from "@/app/_components/dashboard/daily-schedule";
import { ReminderDialog } from "@/app/_components/dashboard/reminder-dialog";
import type {
  DailySchedulesViewModel,
  ReminderFormState,
  ReminderTarget,
  TodayScheduleViewModel,
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
  const [reminderTarget, setReminderTarget] =
    React.useState<ReminderTarget | null>(null);

  // Effects
  React.useEffect(() => {
    setOptimisticHidden(new Set());
    if (!dailySchedules.some((day) => day.dateKey === activeDateKey)) {
      setActiveDateKey(dailySchedules[0]?.dateKey ?? "");
    }
  }, [dailySchedules, activeDateKey]);

  // Handlers
  const handleCheckSchedule = (scheduleId: number, dateKey: string) => {
    const key = `${dateKey}:${scheduleId}`;
    setOptimisticHidden((prev) => new Set(prev).add(key));

    startTransition(async () => {
      try {
        await checkScheduleAction({ scheduleId, dateKey });
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

  const handleOpenReminder = (
    schedule: TodayScheduleViewModel,
    day: DailySchedulesViewModel,
  ) => {
    setReminderTarget({
      scheduleId: schedule.scheduleId,
      menuName: schedule.menuName,
      dateKey: day.dateKey,
      dayOfWeek: day.dayOfWeek,
      reminder: schedule.reminder,
    });
  };

  const handleSaveReminder = (
    target: ReminderTarget,
    form: ReminderFormState,
  ) => {
    startTransition(async () => {
      const dayOfWeekValue = Number(form.dayOfWeek);
      const dayOfMonthValue = Number(form.dayOfMonth);
      await saveScheduleReminderAction({
        scheduleId: target.scheduleId,
        frequency: form.frequency,
        timeOfDay: form.timeOfDay,
        startDateKey: form.startDateKey,
        dayOfWeek:
          form.frequency === "weekly"
            ? Number.isNaN(dayOfWeekValue)
              ? undefined
              : dayOfWeekValue
            : undefined,
        dayOfMonth:
          form.frequency === "monthly"
            ? dayOfMonthValue >= 1
              ? dayOfMonthValue
              : undefined
            : undefined,
        isEnabled: form.isEnabled,
      });
      setReminderTarget(null);
      router.refresh();
    });
  };

  const handleDeleteReminder = (target: ReminderTarget) => {
    startTransition(async () => {
      await deleteScheduleReminderAction({
        scheduleId: target.scheduleId,
      });
      setReminderTarget(null);
      router.refresh();
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
          onCheckSchedule={handleCheckSchedule}
          onEditReminder={handleOpenReminder}
        />
      </main>

      <ReminderDialog
        target={reminderTarget}
        onOpenChange={(open) => !open && setReminderTarget(null)}
        onSave={handleSaveReminder}
        onDelete={handleDeleteReminder}
        isPending={isPending}
      />

      <BottomNavigation />
    </div>
  );
}
