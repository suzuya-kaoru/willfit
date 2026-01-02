"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { createScheduleRuleAction } from "@/app/_actions/schedule-rule-actions";
import {
  completeTaskAction,
  createManualTaskAction,
  rescheduleTaskAction,
  skipTaskAction,
} from "@/app/_actions/scheduled-task-actions";
import { AppHeader } from "@/components/app-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { toDateKey } from "@/lib/date-key";
import type { WorkoutSessionWithExercises } from "@/lib/types";
import { CalendarView } from "./calendar-view";
import {
  type PlanSelectionData,
  PlanSelectionDialog,
} from "./plan-selection-dialog";
import { RescheduleDialog } from "./reschedule-dialog";
import { ScheduleDayDialog } from "./schedule-day-dialog";
import type { CalendarDay, WorkoutRecordWithStats } from "./types";

/**
 * Schedule Client Component Props
 */
export interface ScheduleClientProps {
  year: number;
  month: number;
  calendarDays: CalendarDay[];
  recordsList: WorkoutRecordWithStats[];
  todayDateString: string;
  plans: WorkoutSessionWithExercises[];
}

/**
 * Schedule Client Component
 * インタラクティブな操作（月移動、日付選択、タブ切り替え）を担当
 */
export function ScheduleClient({
  year,
  month,
  calendarDays,
  plans,
}: ScheduleClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // 日付選択状態
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // ダイアログ状態
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [planSelectionDialogOpen, setPlanSelectionDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);

  // 振替対象の状態
  const [rescheduleTargetId, setRescheduleTargetId] = useState<number | null>(
    null,
  );

  // 月移動処理（URL パラメータを更新）
  const navigateMonth = (direction: number) => {
    const newDate = new Date(year, month + direction, 1);
    const newYear = newDate.getFullYear();
    const newMonth = newDate.getMonth();
    const params = new URLSearchParams(searchParams.toString());
    params.set("year", String(newYear));
    params.set("month", String(newMonth + 1)); // 1-based for URL
    router.push(`/schedule?${params.toString()}`);
    setSelectedDate(null);
  };

  // 選択されたカレンダー日情報を取得
  const selectedCalendarDay = selectedDate
    ? (calendarDays.find((day) => day.dateString === toDateKey(selectedDate)) ??
      null)
    : null;

  const selectedRecord = selectedCalendarDay?.record ?? null;
  const selectedSchedules = selectedCalendarDay?.schedules ?? [];

  // 振替対象のタスクオブジェクトを取得
  const rescheduleTask = rescheduleTargetId
    ? (selectedSchedules.find((s) => s.taskId === rescheduleTargetId) ?? null)
    : null;

  // 日付クリック時
  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setDayDialogOpen(true);
  };

  // スケジュール完了
  const handleComplete = async (id: number) => {
    if (!selectedDate) return;
    startTransition(async () => {
      await completeTaskAction(id);
      setDayDialogOpen(false);
      router.refresh();
    });
  };

  // スケジュールスキップ
  const handleSkip = async (id: number) => {
    if (!selectedDate) return;
    startTransition(async () => {
      await skipTaskAction(id);
      setDayDialogOpen(false);
      router.refresh();
    });
  };

  // 振替ダイアログを開く
  const handleOpenReschedule = (id: number) => {
    if (!selectedDate) return;
    setRescheduleTargetId(id);
    setRescheduleDialogOpen(true);
    setDayDialogOpen(false);
  };

  // 振替確定
  const handleConfirmReschedule = async (toDate: Date) => {
    if (!rescheduleTargetId) return;
    startTransition(async () => {
      await rescheduleTaskAction({
        taskId: rescheduleTargetId,
        newDateKey: toDateKey(toDate),
      });
      setRescheduleDialogOpen(false);
      setRescheduleTargetId(null);
      router.refresh();
    });
  };

  // プラン選択ダイアログを開く
  const handleOpenPlanSelection = () => {
    setPlanSelectionDialogOpen(true);
    setDayDialogOpen(false);
  };

  // トレーニング開始（カレンダーダイアログから）
  const handleStartWorkout = (
    taskId: number,
    planId: number,
    menuId: number,
  ) => {
    router.push(`/workout/${menuId}?taskId=${taskId}&planId=${planId}`);
  };

  // プラン追加確定
  const handleConfirmAddPlan = async (data: PlanSelectionData) => {
    if (!selectedDate) return;

    startTransition(async () => {
      if (data.type === "manual") {
        await createManualTaskAction({
          workoutSessionId: data.workoutSessionId,
          scheduledDateKey: toDateKey(selectedDate),
        });
      } else if (data.type === "weekly") {
        if (!data.weekdays) return;
        await createScheduleRuleAction({
          workoutSessionId: data.workoutSessionId,
          ruleType: "weekly",
          weekdays: data.weekdays,
        });
      } else if (data.type === "interval") {
        if (!data.intervalDays) return;
        await createScheduleRuleAction({
          workoutSessionId: data.workoutSessionId,
          ruleType: "interval",
          intervalDays: data.intervalDays,
          startDateKey: toDateKey(selectedDate),
        });
      }
      setPlanSelectionDialogOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="スケジュール" />

      <main className="mx-auto max-w-md p-4">
        {/* Calendar View Only */}
        <CalendarView
          year={year}
          month={month}
          calendarDays={calendarDays}
          selectedDate={selectedDate}
          selectedRecord={selectedRecord}
          onNavigateMonth={navigateMonth}
          onSelectDate={handleSelectDate}
        />
      </main>

      <BottomNavigation />

      {/* 日付選択ダイアログ */}
      <ScheduleDayDialog
        isOpen={dayDialogOpen && !isPending}
        date={selectedDate}
        record={selectedRecord}
        schedules={selectedSchedules}
        onClose={() => setDayDialogOpen(false)}
        onComplete={handleComplete}
        onSkip={handleSkip}
        onReschedule={handleOpenReschedule}
        onAddPlan={handleOpenPlanSelection}
        onStartWorkout={handleStartWorkout}
      />

      {/* プラン選択ダイアログ */}
      <PlanSelectionDialog
        isOpen={planSelectionDialogOpen && !isPending}
        plans={plans}
        onClose={() => setPlanSelectionDialogOpen(false)}
        onConfirm={handleConfirmAddPlan}
      />

      {/* 振替ダイアログ */}
      <RescheduleDialog
        isOpen={rescheduleDialogOpen && !isPending}
        schedule={rescheduleTask}
        fromDate={selectedDate}
        onClose={() => {
          setRescheduleDialogOpen(false);
          setRescheduleTargetId(null);
        }}
        onConfirm={handleConfirmReschedule}
      />
    </div>
  );
}
