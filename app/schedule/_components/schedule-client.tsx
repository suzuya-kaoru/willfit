"use client";

import { Calendar, List } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  completeScheduleAction,
  rescheduleAction,
  skipScheduleAction,
} from "@/app/_actions/daily-schedule-actions";
import {
  createRoutineAction,
  deleteRoutineAction,
} from "@/app/_actions/routine-actions";
import { AppHeader } from "@/components/app-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toDateKey } from "@/lib/date-key";
import type {
  CalculatedSchedule,
  ScheduleRoutine,
  WorkoutMenu,
} from "@/lib/types";
import { CalendarView } from "./calendar-view";
import { ListView } from "./list-view";
import { RescheduleDialog } from "./reschedule-dialog";
import { RoutineEditDialog } from "./routine-edit-dialog";
import { ScheduleDayDialog } from "./schedule-day-dialog";
import type {
  CalendarDay,
  RoutineFormData,
  WorkoutSessionWithStats,
} from "./types";

/**
 * Schedule Client Component Props
 */
export interface ScheduleClientProps {
  year: number;
  month: number;
  calendarDays: CalendarDay[];
  sessionsList: WorkoutSessionWithStats[];
  todayDateString: string;
  menus: WorkoutMenu[];
}

/**
 * Schedule Client Component
 * インタラクティブな操作（月移動、日付選択、タブ切り替え）を担当
 */
export function ScheduleClient({
  year,
  month,
  calendarDays,
  sessionsList,
  menus,
}: ScheduleClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  // 日付選択状態
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // ダイアログ状態
  const [dayDialogOpen, setDayDialogOpen] = useState(false);
  const [routineDialogOpen, setRoutineDialogOpen] = useState(false);
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<ScheduleRoutine | null>(
    null,
  );
  const [rescheduleTarget, setRescheduleTarget] = useState<{
    schedule: CalculatedSchedule;
    fromDate: Date;
  } | null>(null);

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

  const selectedSession = selectedCalendarDay?.session ?? null;
  const selectedSchedules = selectedCalendarDay?.schedules ?? [];

  // 日付クリック時
  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    setDayDialogOpen(true);
  };

  // スケジュール完了
  const handleComplete = async (routineId: number) => {
    if (!selectedDate) return;
    startTransition(async () => {
      await completeScheduleAction({
        routineId,
        dateKey: toDateKey(selectedDate),
      });
      setDayDialogOpen(false);
      router.refresh();
    });
  };

  // スケジュールスキップ
  const handleSkip = async (routineId: number) => {
    if (!selectedDate) return;
    startTransition(async () => {
      await skipScheduleAction({
        routineId,
        dateKey: toDateKey(selectedDate),
      });
      setDayDialogOpen(false);
      router.refresh();
    });
  };

  // 振替ダイアログを開く
  const handleOpenReschedule = (routineId: number) => {
    if (!selectedDate) return;
    const schedule = selectedSchedules.find((s) => s.routineId === routineId);
    if (schedule) {
      setRescheduleTarget({ schedule, fromDate: selectedDate });
      setRescheduleDialogOpen(true);
      setDayDialogOpen(false);
    }
  };

  // 振替確定
  const handleConfirmReschedule = async (toDate: Date) => {
    if (!rescheduleTarget) return;
    startTransition(async () => {
      await rescheduleAction({
        routineId: rescheduleTarget.schedule.routineId,
        fromDateKey: toDateKey(rescheduleTarget.fromDate),
        toDateKey: toDateKey(toDate),
      });
      setRescheduleDialogOpen(false);
      setRescheduleTarget(null);
      router.refresh();
    });
  };

  // ルーティン追加ダイアログを開く
  const handleOpenRoutineDialog = () => {
    setEditingRoutine(null);
    setRoutineDialogOpen(true);
    setDayDialogOpen(false);
  };

  // ルーティン保存
  const handleSaveRoutine = async (data: RoutineFormData) => {
    startTransition(async () => {
      if (data.routineType === "weekly") {
        if (data.weekdays == null) return;
        await createRoutineAction({
          menuId: data.menuId,
          routineType: "weekly",
          weekdays: data.weekdays,
        });
      } else {
        if (data.intervalDays == null || !data.startDateKey) return;
        await createRoutineAction({
          menuId: data.menuId,
          routineType: "interval",
          intervalDays: data.intervalDays,
          startDateKey: data.startDateKey,
        });
      }
      router.refresh();
    });
  };

  // ルーティン削除
  const handleDeleteRoutine = async (routineId: number) => {
    startTransition(async () => {
      await deleteRoutineAction(routineId);
      router.refresh();
    });
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader title="スケジュール" />

      <main className="mx-auto max-w-md p-4">
        <Tabs defaultValue="calendar" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="h-4 w-4" />
              カレンダー
            </TabsTrigger>
            <TabsTrigger value="list" className="gap-2">
              <List className="h-4 w-4" />
              リスト
            </TabsTrigger>
          </TabsList>

          <TabsContent value="calendar">
            <CalendarView
              year={year}
              month={month}
              calendarDays={calendarDays}
              selectedDate={selectedDate}
              selectedSession={selectedSession}
              onNavigateMonth={navigateMonth}
              onSelectDate={handleSelectDate}
            />
          </TabsContent>

          <TabsContent value="list">
            <ListView sessions={sessionsList} />
          </TabsContent>
        </Tabs>
      </main>

      <BottomNavigation />

      {/* 日付選択ダイアログ */}
      <ScheduleDayDialog
        isOpen={dayDialogOpen && !isPending}
        date={selectedDate}
        session={selectedSession}
        schedules={selectedSchedules}
        onClose={() => setDayDialogOpen(false)}
        onComplete={handleComplete}
        onSkip={handleSkip}
        onReschedule={handleOpenReschedule}
        onCreateRoutine={handleOpenRoutineDialog}
      />

      {/* ルーティン設定ダイアログ */}
      <RoutineEditDialog
        isOpen={routineDialogOpen && !isPending}
        routine={editingRoutine}
        menus={menus}
        onClose={() => setRoutineDialogOpen(false)}
        onSave={handleSaveRoutine}
        onDelete={editingRoutine ? handleDeleteRoutine : undefined}
      />

      {/* 振替ダイアログ */}
      <RescheduleDialog
        isOpen={rescheduleDialogOpen && !isPending}
        schedule={rescheduleTarget?.schedule ?? null}
        fromDate={rescheduleTarget?.fromDate ?? null}
        onClose={() => {
          setRescheduleDialogOpen(false);
          setRescheduleTarget(null);
        }}
        onConfirm={handleConfirmReschedule}
      />
    </div>
  );
}
