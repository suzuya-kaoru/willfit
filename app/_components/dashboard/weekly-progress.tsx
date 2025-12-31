import { Check, Target, Trophy } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const dayLabels = ["日", "月", "火", "水", "木", "金", "土"];

interface WeeklyProgressProps {
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
          {weekDayStatuses.map((status) => (
            <div
              key={status.dateString}
              className="flex flex-col items-center gap-1"
            >
              <div
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl text-xs font-semibold transition-all",
                  status.isCompleted
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/30"
                    : status.isToday
                      ? "bg-primary/20 text-primary ring-2 ring-primary"
                      : status.hasSchedule
                        ? "bg-muted text-muted-foreground"
                        : "bg-muted/50 text-muted-foreground/50",
                )}
              >
                {status.isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  dayLabels[status.dayOfWeekIndex]
                )}
              </div>
              {status.isToday && (
                <div className="h-1 w-1 rounded-full bg-primary" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
