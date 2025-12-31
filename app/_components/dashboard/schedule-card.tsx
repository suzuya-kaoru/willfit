"use client";

import { Bell, Check, Info, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { DailySchedulesViewModel, TodayScheduleViewModel } from "./types";

const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];

interface ScheduleCardProps {
  schedule: TodayScheduleViewModel;
  day: DailySchedulesViewModel;
  isPending: boolean;
  onCheck: (scheduleId: number, dateKey: string) => void;
  onEditReminder: (
    schedule: TodayScheduleViewModel,
    day: DailySchedulesViewModel,
  ) => void;
}

export function ScheduleCard({
  schedule,
  day,
  isPending,
  onCheck,
  onEditReminder,
}: ScheduleCardProps) {
  const router = useRouter();

  const formatReminderSummary = React.useCallback(
    (reminder: NonNullable<TodayScheduleViewModel["reminder"]>) => {
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

  return (
    <div className="rounded-2xl border border-border/50 bg-linear-to-br from-card to-muted/30 p-4 shadow-sm">
      {/* Menu name */}
      <h3 className="text-base font-bold text-foreground">
        {schedule.menuName}
      </h3>

      {/* Exercise tags */}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {schedule.exercises.map((ex) => (
          <span
            key={ex.id}
            className="rounded-lg bg-secondary/80 px-2.5 py-1 text-xs font-medium text-secondary-foreground"
          >
            {ex.name}
          </span>
        ))}
      </div>

      {/* Reminder info */}
      {schedule.reminder && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Bell className="h-3 w-3" />
          {schedule.reminder.isEnabled
            ? formatReminderSummary(schedule.reminder)
            : "リマインド停止中"}
        </p>
      )}

      {/* Previous note */}
      {schedule.previousNote && (
        <div className="mt-3 rounded-xl bg-muted/50 p-3">
          <div className="mb-1 flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
            <Info className="h-3 w-3" />
            前回のメモ
          </div>
          <p className="text-xs text-foreground/80">{schedule.previousNote}</p>
        </div>
      )}

      {/* Start button */}
      <Button
        onClick={() => router.push(`/workout/${schedule.menuId}`)}
        className="mt-4 w-full gap-2 rounded-xl font-semibold shadow-lg shadow-primary/20"
        size="lg"
      >
        <Play className="h-4 w-4" />
        トレーニング開始
      </Button>

      {/* Action buttons */}
      <div className="mt-3 flex gap-2">
        {day.isToday && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex-1 gap-1.5 rounded-xl"
            disabled={isPending}
            onClick={() => onCheck(schedule.scheduleId, day.dateKey)}
          >
            <Check className="h-4 w-4" />
            完了
          </Button>
        )}
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            "gap-1.5 rounded-xl",
            day.isToday ? "flex-1" : "w-full",
          )}
          disabled={isPending}
          onClick={() => onEditReminder(schedule, day)}
        >
          <Bell className="h-4 w-4" />
          {schedule.reminder ? "リマインド編集" : "リマインド設定"}
        </Button>
      </div>
    </div>
  );
}
