import { Check, Target, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { WEEKDAY_LABELS } from "@/lib/schedule-utils";
import { cn } from "@/lib/utils";

interface WeeklyProgressProps {
  weeklyCompleted: number;
  weeklyGoal: number;
  weekDayStatuses: Array<{
    dateString: string;
    dayOfWeekIndex: number;
    status: "completed" | "incomplete" | "none";
    isToday: boolean;
    hasSchedule: boolean;
  }>;
}

export function WeeklyProgress({
  weeklyCompleted,
  weeklyGoal,
  weekDayStatuses,
}: WeeklyProgressProps) {
  // 完了率を計算（100%達成時のトロフィー表示用）
  const progressPercent =
    weeklyGoal > 0 ? Math.round((weeklyCompleted / weeklyGoal) * 100) : 0;

  return (
    <Card className="overflow-hidden border-0 bg-linear-to-br from-card to-primary/5 shadow-lg">
      <CardContent className="p-4">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
              <Target className="h-4 w-4 text-primary" />
            </div>
            <span className="font-semibold text-foreground">今週の進捗</span>
          </div>
          <div className="flex items-center gap-2">
            {progressPercent === 100 && (
              <Trophy className="h-5 w-5 text-yellow-500" />
            )}
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl font-bold text-primary">
                {weeklyCompleted}
              </span>
              <span className="text-sm text-muted-foreground">
                /{weeklyGoal}
              </span>
            </div>
          </div>
        </div>

        {/* Weekly Days - grid-cols-7 で均等配置 */}
        <div className="grid grid-cols-7 gap-2">
          {weekDayStatuses.map((dayStatus) => (
            <div
              key={dayStatus.dateString}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl text-xs font-semibold transition-all",
                  dayStatus.status === "completed"
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : dayStatus.status === "incomplete"
                      ? "bg-muted border border-primary/30 text-primary"
                      : dayStatus.isToday
                        ? "bg-primary/20 text-primary ring-2 ring-primary"
                        : "bg-muted/50 text-muted-foreground/50",
                )}
              >
                {dayStatus.status === "completed" ? (
                  <Check className="h-5 w-5 stroke-[2.5]" />
                ) : dayStatus.status === "incomplete" ? (
                  <div className="flex flex-col items-center justify-center">
                    <span className="text-[10px] leading-none mb-0.5">
                      {WEEKDAY_LABELS[dayStatus.dayOfWeekIndex]}
                    </span>
                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  </div>
                ) : (
                  WEEKDAY_LABELS[dayStatus.dayOfWeekIndex]
                )}
              </div>
              {dayStatus.isToday && (
                <div className="h-1 w-1 rounded-full bg-primary" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
