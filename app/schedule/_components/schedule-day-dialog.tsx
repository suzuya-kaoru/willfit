"use client";

import { Check, Dumbbell, Play, Plus, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { weekdayToJapanese } from "@/lib/schedule-utils";
import { formatDateJaWithWeekday, formatTimeJST } from "@/lib/timezone";
import type { CalculatedTask } from "@/lib/types";
import type { ScheduleDayDialogProps, WorkoutSessionWithStats } from "./types";

export function ScheduleDayDialog({
  isOpen,
  date,
  session,
  schedules,
  onClose,
  onComplete,
  onSkip,
  onReschedule,
  onAddPlan,
  onStartWorkout,
}: ScheduleDayDialogProps) {
  if (!date) return null;

  /* const dayOfWeek = date.getDay(); */
  const dateString = formatDateJaWithWeekday(date);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-[95vw] overflow-y-auto rounded-xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{dateString}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* セッション情報 */}
          {session && <SessionInfo session={session} />}

          {/* スケジュール一覧 */}
          {schedules.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">
                予定
              </h3>
              {schedules.map((schedule) => {
                // Task ID must exist for scheduled tasks (DB backed)
                const id = schedule.taskId;

                if (!id) return null;

                return (
                  <ScheduleCard
                    key={`task-${id}`}
                    schedule={schedule}
                    onComplete={() => onComplete(id)}
                    onSkip={() => onSkip(id)}
                    onReschedule={() => onReschedule(id)}
                    isToday={
                      !!(
                        date &&
                        new Date().toDateString() === date.toDateString()
                      )
                    }
                    onStartWorkout={() =>
                      onStartWorkout?.(
                        id,
                        schedule.sessionPlanId,
                        schedule.menuId,
                      )
                    }
                  />
                );
              })}
            </div>
          )}

          {/* 空の状態 */}
          {!session && schedules.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              この日の予定はありません
            </p>
          )}

          {/* セッション追加ボタン */}
          <Button className="w-full" onClick={onAddPlan}>
            <Plus className="mr-2 h-4 w-4" />
            セッションを追加
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

interface SessionInfoProps {
  session: WorkoutSessionWithStats;
}

function SessionInfo({ session }: SessionInfoProps) {
  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                <Dumbbell className="h-4 w-4 text-primary" />
              </div>
              <span className="font-medium">{session.menuName}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {formatTimeJST(session.startedAt)} -{" "}
              {session.endedAt ? formatTimeJST(session.endedAt) : "-"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-lg bg-background/50 p-3">
            <div className="text-center">
              <p className="text-lg font-bold">{session.exerciseCount}</p>
              <p className="text-xs text-muted-foreground">種目</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">{session.setCount}</p>
              <p className="text-xs text-muted-foreground">セット</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold">
                {(session.volume / 1000).toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground">ton</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ScheduleCardProps {
  schedule: CalculatedTask;
  onComplete: () => void;
  onSkip: () => void;
  onReschedule: () => void;
  isToday?: boolean;
  onStartWorkout?: () => void;
}

function ScheduleCard({
  schedule,
  onComplete,
  onSkip,
  onReschedule,
  isToday,
  onStartWorkout,
}: ScheduleCardProps) {
  let routineInfo = "";

  // New Task Description logic
  if (schedule.ruleType === "weekly" && schedule.weekdays) {
    const days = schedule.weekdays.map((d) => weekdayToJapanese(d)).join("・");
    routineInfo = `毎週 ${days}`;
  } else if (schedule.ruleType === "interval") {
    routineInfo = `${schedule.intervalDays}日ごと`;
  } else if (schedule.ruleType === "once") {
    routineInfo = "単発";
  } else {
    routineInfo = "手動追加";
  }

  const menuName = schedule.sessionPlanName || schedule.menuName;
  const isRescheduled = schedule.isFromReschedule;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{menuName}</p>
              <p className="text-sm text-muted-foreground">{routineInfo}</p>
            </div>
            {isRescheduled && (
              <span className="rounded-full bg-info/10 px-2 py-0.5 text-xs text-info">
                振替
              </span>
            )}
          </div>

          <div className="flex gap-2">
            {isToday && onStartWorkout ? (
              <Button
                size="sm"
                className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                onClick={onStartWorkout}
              >
                <Play className="mr-1 h-4 w-4" />
                開始
              </Button>
            ) : (
              <Button
                size="sm"
                variant="default"
                className="flex-1"
                onClick={onComplete}
              >
                <Check className="mr-1 h-4 w-4" />
                完了
              </Button>
            )}
            <Button size="sm" variant="outline" onClick={onSkip}>
              <X className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={onReschedule}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
