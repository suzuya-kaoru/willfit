"use client";

import { CalendarClock, Check, Play, RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { DailySchedulesViewModel, TodayScheduleViewModel } from "./types";

interface ScheduleCardProps {
  schedule: TodayScheduleViewModel;
  day: DailySchedulesViewModel;
  isPending: boolean;
  onComplete: (taskId: number, dateKey: string) => void;
  onSkip: (taskId: number, dateKey: string) => void;
}

export function ScheduleCard({
  schedule,
  day,
  isPending,
  onComplete,
  onSkip,
}: ScheduleCardProps) {
  const router = useRouter();

  const getRoutineTypeLabel = () => {
    if (schedule.ruleType === "weekly") {
      return "曜日ベース";
    }
    if (schedule.ruleType === "interval") {
      return "間隔ベース";
    }
    if (schedule.ruleType === "once") {
      return "単発";
    }
    return "手動";
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-linear-to-br from-card to-muted/30 p-4 shadow-sm">
      {/* Menu name & routine info */}
      <div className="flex items-start justify-between">
        <h3 className="text-base font-bold text-foreground">
          {schedule.menuName}
        </h3>
        <div className="flex items-center gap-1.5">
          {schedule.isFromReschedule && (
            <span className="rounded-full bg-info/10 px-2 py-0.5 text-xs text-info">
              <RefreshCw className="mr-1 inline h-3 w-3" />
              振替
            </span>
          )}
        </div>
      </div>

      {/* Routine type info */}
      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
        <CalendarClock className="h-3 w-3" />
        {getRoutineTypeLabel()}
      </p>

      {/* Start button */}
      <Button
        onClick={() =>
          router.push(`/workout/${schedule.menuId}?taskId=${schedule.taskId}`)
        }
        className="mt-4 w-full gap-2 rounded-xl font-semibold shadow-lg shadow-primary/20"
        size="lg"
      >
        <Play className="h-4 w-4" />
        トレーニング開始
      </Button>

      {/* Action buttons */}
      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="flex-1 gap-1.5 rounded-xl"
          disabled={isPending}
          onClick={() => onComplete(schedule.taskId, day.dateKey)}
        >
          <Check className="h-4 w-4" />
          完了
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-1.5 rounded-xl"
          disabled={isPending}
          onClick={() => onSkip(schedule.taskId, day.dateKey)}
        >
          <X className="h-4 w-4" />
          スキップ
        </Button>
      </div>
    </div>
  );
}
