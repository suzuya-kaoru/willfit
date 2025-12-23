"use client";

import { Bell, Check, ChevronRight, Info, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { AppHeader } from "@/components/app-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { checkScheduleAction } from "@/app/_actions/schedule-actions";
import {
  deleteScheduleReminderAction,
  saveScheduleReminderAction,
} from "@/app/_actions/reminder-actions";
import type { ExerciseWithBodyParts } from "@/lib/types";
import { cn } from "@/lib/utils";

type TodayScheduleViewModel = {
  scheduleId: number;
  menuId: number;
  menuName: string;
  exercises: ExerciseWithBodyParts[];
  previousNote: string | null;
  reminder: ScheduleReminderViewModel | null;
};

type ScheduleReminderViewModel = {
  frequency: "daily" | "weekly" | "monthly";
  timeOfDay: string;
  dayOfWeek: number | null;
  dayOfMonth: number | null;
  startDateKey: string;
  isEnabled: boolean;
};

type DailySchedulesViewModel = {
  dateKey: string;
  label: string;
  isToday: boolean;
  dayOfWeek: number;
  schedules: TodayScheduleViewModel[];
};

interface DashboardClientProps {
  todayFormatted: string;
  dailySchedules: DailySchedulesViewModel[];
  weeklyCompleted: number;
  weeklyGoal: number;
  weekDayStatuses: Array<{
    dateString: string;
    dayOfWeekIndex: number;
    isCompleted: boolean;
    isToday: boolean;
    hasSchedule: boolean;
  }>;
}

type ReminderTarget = {
  scheduleId: number;
  menuName: string;
  dateKey: string;
  dayOfWeek: number;
  reminder: ScheduleReminderViewModel | null;
};

type ReminderFormState = {
  frequency: "daily" | "weekly" | "monthly";
  timeOfDay: string;
  startDateKey: string;
  dayOfWeek: string;
  dayOfMonth: string;
  isEnabled: boolean;
};

const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];

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

  const [activeDateKey, setActiveDateKey] =
    React.useState<string>(defaultDateKey);

  const activeIndex = Math.max(
    0,
    dailySchedules.findIndex((d) => d.dateKey === activeDateKey),
  );

  const [touchStartX, setTouchStartX] = React.useState<number | null>(null);
  const [isPending, startTransition] = React.useTransition();
  const [optimisticHidden, setOptimisticHidden] = React.useState<Set<string>>(
    () => new Set(),
  );
  const [reminderTarget, setReminderTarget] =
    React.useState<ReminderTarget | null>(null);
  const [reminderForm, setReminderForm] =
    React.useState<ReminderFormState | null>(null);

  React.useEffect(() => {
    setOptimisticHidden(new Set());
    if (!dailySchedules.some((day) => day.dateKey === activeDateKey)) {
      setActiveDateKey(dailySchedules[0]?.dateKey ?? "");
    }
  }, [dailySchedules, activeDateKey]);

  const buildReminderForm = React.useCallback((target: ReminderTarget) => {
    const reminder = target.reminder;
    const defaultDayOfMonth = Number.parseInt(
      target.dateKey.split("-")[2] ?? "1",
      10,
    );

    return {
      frequency: reminder?.frequency ?? "weekly",
      timeOfDay: reminder?.timeOfDay ?? "19:00",
      startDateKey: reminder?.startDateKey ?? target.dateKey,
      dayOfWeek: String(
        typeof reminder?.dayOfWeek === "number"
          ? reminder.dayOfWeek
          : target.dayOfWeek,
      ),
      dayOfMonth: String(
        typeof reminder?.dayOfMonth === "number"
          ? reminder.dayOfMonth
          : Number.isNaN(defaultDayOfMonth)
            ? 1
            : defaultDayOfMonth,
      ),
      isEnabled: reminder?.isEnabled ?? true,
    };
  }, []);

  const formatReminderSummary = React.useCallback(
    (reminder: ScheduleReminderViewModel) => {
      if (reminder.frequency === "daily") {
        return `毎日 ${reminder.timeOfDay}`;
      }
      if (reminder.frequency === "weekly") {
        const label = dayLabels[reminder.dayOfWeek ?? 0] ?? "";
        return `毎週 ${label} ${reminder.timeOfDay}`;
      }
      return `毎月 ${reminder.dayOfMonth ?? 1}日 ${reminder.timeOfDay}`;
    },
    [],
  );

  const openReminderDialog = (
    schedule: TodayScheduleViewModel,
    day: DailySchedulesViewModel,
  ) => {
    const target: ReminderTarget = {
      scheduleId: schedule.scheduleId,
      menuName: schedule.menuName,
      dateKey: day.dateKey,
      dayOfWeek: day.dayOfWeek,
      reminder: schedule.reminder,
    };
    setReminderTarget(target);
    setReminderForm(buildReminderForm(target));
  };

  const closeReminderDialog = () => {
    setReminderTarget(null);
    setReminderForm(null);
  };

  const handleReminderDialogChange = (open: boolean) => {
    if (!open) {
      closeReminderDialog();
    }
  };

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

  const handleSaveReminder = () => {
    if (!reminderTarget || !reminderForm) return;

    startTransition(async () => {
      const dayOfWeekValue = Number(reminderForm.dayOfWeek);
      const dayOfMonthValue = Number(reminderForm.dayOfMonth);
      await saveScheduleReminderAction({
        scheduleId: reminderTarget.scheduleId,
        frequency: reminderForm.frequency,
        timeOfDay: reminderForm.timeOfDay,
        startDateKey: reminderForm.startDateKey,
        dayOfWeek:
          reminderForm.frequency === "weekly"
            ? Number.isNaN(dayOfWeekValue)
              ? undefined
              : dayOfWeekValue
            : undefined,
        dayOfMonth:
          reminderForm.frequency === "monthly"
            ? dayOfMonthValue >= 1
              ? dayOfMonthValue
              : undefined
            : undefined,
        isEnabled: reminderForm.isEnabled,
      });
      closeReminderDialog();
      router.refresh();
    });
  };

  const handleDeleteReminder = () => {
    if (!reminderTarget) return;

    startTransition(async () => {
      await deleteScheduleReminderAction({
        scheduleId: reminderTarget.scheduleId,
      });
      closeReminderDialog();
      router.refresh();
    });
  };

  const moveDay = (direction: "prev" | "next") => {
    if (!dailySchedules.length) return;
    const currentIndex = dailySchedules.findIndex(
      (d) => d.dateKey === activeDateKey,
    );
    if (currentIndex === -1) return;

    if (direction === "prev" && currentIndex > 0) {
      setActiveDateKey(dailySchedules[currentIndex - 1].dateKey);
    }
    if (direction === "next" && currentIndex < dailySchedules.length - 1) {
      setActiveDateKey(dailySchedules[currentIndex + 1].dateKey);
    }
  };

  const handleTouchStart: React.TouchEventHandler<HTMLDivElement> = (event) => {
    const firstTouch = event.touches[0];
    setTouchStartX(firstTouch.clientX);
  };

  const handleTouchEnd: React.TouchEventHandler<HTMLDivElement> = (event) => {
    if (touchStartX === null) return;
    const touchEndX = event.changedTouches[0]?.clientX ?? touchStartX;
    const deltaX = touchEndX - touchStartX;

    const threshold = 50; // スワイプ判定のしきい値(px)
    if (deltaX > threshold) {
      // 右にスワイプ → 前日へ
      moveDay("prev");
    } else if (deltaX < -threshold) {
      // 左にスワイプ → 翌日へ
      moveDay("next");
    }

    setTouchStartX(null);
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <AppHeader />

      <main className="mx-auto max-w-md space-y-4 p-4">
        {/* Weekly Progress */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">今週の進捗</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                {weekDayStatuses.map((status) => (
                  <div
                    key={status.dateString}
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-colors ${
                      status.isCompleted
                        ? "bg-primary text-primary-foreground"
                        : status.hasSchedule
                          ? status.isToday
                            ? "bg-primary/20 text-primary ring-2 ring-primary"
                            : "bg-secondary text-secondary-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {dayLabels[status.dayOfWeekIndex]}
                  </div>
                ))}
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-foreground">
                  {weeklyCompleted}/{weeklyGoal}
                </p>
                <p className="text-xs text-muted-foreground">完了</p>
              </div>
            </div>
          </CardContent>
        </Card>
        {/* Today's / Previous / Next Plan Card */}
        <Card className="overflow-hidden border-primary/20">
          <CardHeader className="bg-primary/5 pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-medium">
                今日の予定
              </CardTitle>
              <span className="text-xs text-muted-foreground">
                {todayFormatted}
              </span>
            </div>
          </CardHeader>
          <CardContent
            className="space-y-4 pt-4"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            {/* 日タブ（昨日・今日・明日） */}
            <div className="-mx-2 overflow-x-auto pb-1">
              <div className="flex gap-2 px-2">
                {dailySchedules.map((day) => (
                  <button
                    key={day.dateKey}
                    type="button"
                    onClick={() => setActiveDateKey(day.dateKey)}
                    className={cn(
                      "whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      day.dateKey === activeDateKey
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 日ごとの内容（カルーセル） */}
            <div className="relative overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-out"
                style={{
                  transform: `translateX(-${activeIndex * 100}%)`,
                }}
              >
                {dailySchedules.map((day) => {
                  const visibleSchedules = day.schedules.filter(
                    (schedule) =>
                      !optimisticHidden.has(
                        `${day.dateKey}:${schedule.scheduleId}`,
                      ),
                  );

                  return (
                    <div key={day.dateKey} className="w-full shrink-0 space-y-4">
                      {visibleSchedules.length > 0 ? (
                        <>
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              この日のスケジュール
                            </p>
                            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                              残り {visibleSchedules.length} 件
                            </span>
                          </div>

                          <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                            {visibleSchedules.map((schedule) => (
                              <div
                                key={schedule.scheduleId}
                                className="rounded-lg border border-border bg-card p-3 shadow-sm"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <h3 className="text-sm font-semibold text-foreground">
                                      {schedule.menuName}
                                    </h3>
                                    <div className="mt-2 flex flex-wrap gap-1.5">
                                      {schedule.exercises.map((ex) => (
                                        <span
                                          key={ex.id}
                                          className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                                        >
                                          {ex.name}
                                        </span>
                                      ))}
                                    </div>
                                    {schedule.reminder && (
                                      <p className="mt-2 text-xs text-muted-foreground">
                                        リマインド:{" "}
                                        {schedule.reminder.isEnabled
                                          ? formatReminderSummary(
                                              schedule.reminder,
                                            )
                                          : "停止中"}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                {schedule.previousNote && (
                                  <div className="mt-3 rounded-md bg-muted/60 p-2">
                                    <div className="mb-1 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                                      <Info className="h-3 w-3" />
                                      前回のメモ
                                    </div>
                                    <p className="text-xs text-foreground">
                                      {schedule.previousNote}
                                    </p>
                                  </div>
                                )}

                                <Button
                                  onClick={() => {
                                    router.push(`/workout/${schedule.menuId}`);
                                  }}
                                  className="mt-3 w-full gap-2"
                                  size="sm"
                                >
                                  <Play className="h-4 w-4" />
                                  このメニューでトレーニング開始
                                </Button>

                                <div className="mt-2 flex flex-wrap gap-2">
                                  {day.isToday && (
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="sm"
                                      className="flex-1 gap-1"
                                      disabled={isPending}
                                      onClick={() =>
                                        handleCheckSchedule(
                                          schedule.scheduleId,
                                          day.dateKey,
                                        )
                                      }
                                    >
                                      <Check className="h-4 w-4" />
                                      完了
                                    </Button>
                                  )}
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className={`gap-1 ${
                                      day.isToday ? "flex-1" : "w-full"
                                    }`}
                                    disabled={isPending}
                                    onClick={() =>
                                      openReminderDialog(schedule, day)
                                    }
                                  >
                                    <Bell className="h-4 w-4" />
                                    {schedule.reminder
                                      ? "リマインド編集"
                                      : "リマインド設定"}
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      ) : (
                        <div className="py-6 text-center">
                          <p className="text-sm text-muted-foreground">
                            この日のメニューはすべて完了しました。
                          </p>
                          {day.isToday && (
                            <Button
                              variant="outline"
                              className="mt-4 bg-transparent"
                              onClick={() => router.push("/settings")}
                            >
                              メニューを選択して開始
                              <ChevronRight className="ml-1 h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <Dialog open={!!reminderTarget} onOpenChange={handleReminderDialogChange}>
        <DialogContent className="max-w-[95vw] rounded-xl sm:max-w-md">
          <DialogHeader>
            <DialogTitle>リマインド設定</DialogTitle>
          </DialogHeader>
          {reminderTarget && reminderForm && (
            <div className="space-y-4 py-2">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {reminderTarget.menuName}
                </p>
                <p className="text-xs text-muted-foreground">
                  スケジュールに合わせて通知を設定します
                </p>
              </div>

              <div className="space-y-2">
                <Label>頻度</Label>
                <Select
                  value={reminderForm.frequency}
                  onValueChange={(value) =>
                    setReminderForm((prev) =>
                      prev
                        ? {
                            ...prev,
                            frequency: value as ReminderFormState["frequency"],
                          }
                        : prev,
                    )
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="頻度を選択" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">毎日</SelectItem>
                    <SelectItem value="weekly">毎週</SelectItem>
                    <SelectItem value="monthly">毎月</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>時刻</Label>
                  <Input
                    type="time"
                    value={reminderForm.timeOfDay}
                    onChange={(event) =>
                      setReminderForm((prev) =>
                        prev
                          ? { ...prev, timeOfDay: event.target.value }
                          : prev,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>開始日</Label>
                  <Input
                    type="date"
                    value={reminderForm.startDateKey}
                    onChange={(event) =>
                      setReminderForm((prev) =>
                        prev
                          ? { ...prev, startDateKey: event.target.value }
                          : prev,
                      )
                    }
                  />
                </div>
              </div>

              {reminderForm.frequency === "weekly" && (
                <div className="space-y-2">
                  <Label>曜日</Label>
                  <Select
                    value={reminderForm.dayOfWeek}
                    onValueChange={(value) =>
                      setReminderForm((prev) =>
                        prev ? { ...prev, dayOfWeek: value } : prev,
                      )
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="曜日を選択" />
                    </SelectTrigger>
                    <SelectContent>
                      {dayLabels.map((label, index) => (
                        <SelectItem key={label} value={String(index)}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {reminderForm.frequency === "monthly" && (
                <div className="space-y-2">
                  <Label>日付</Label>
                  <Input
                    type="number"
                    min="1"
                    max="31"
                    value={reminderForm.dayOfMonth}
                    onChange={(event) =>
                      setReminderForm((prev) =>
                        prev
                          ? { ...prev, dayOfMonth: event.target.value }
                          : prev,
                      )
                    }
                  />
                </div>
              )}

              <div className="flex items-center justify-between rounded-md border border-border px-3 py-2">
                <div>
                  <Label className="text-sm">リマインドを有効化</Label>
                  <p className="text-xs text-muted-foreground">
                    次回通知のスケジュールを更新します
                  </p>
                </div>
                <Switch
                  checked={reminderForm.isEnabled}
                  onCheckedChange={(value) =>
                    setReminderForm((prev) =>
                      prev ? { ...prev, isEnabled: value } : prev,
                    )
                  }
                />
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-3">
            {reminderTarget?.reminder && (
              <Button
                type="button"
                variant="outline"
                onClick={handleDeleteReminder}
                disabled={isPending}
              >
                削除
              </Button>
            )}
            <Button
              type="button"
              onClick={handleSaveReminder}
              disabled={!reminderForm || isPending}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <BottomNavigation />
    </div>
  );
}
