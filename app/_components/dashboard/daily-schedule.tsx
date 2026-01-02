"use client";

import { Check, ChevronRight, Flame, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ScheduleCard } from "./schedule-card";
import type { DailySchedulesViewModel } from "./types";

interface DailyScheduleProps {
  dailySchedules: DailySchedulesViewModel[];
  activeDateKey: string;
  onActiveDateChange: (dateKey: string) => void;
  // hiddenIds は `${dateKey}:${taskId}` の形式
  hiddenIds: Set<string>;
  isPending: boolean;
  onComplete: (taskId: number, dateKey: string) => void;
  onSkip: (taskId: number, dateKey: string) => void;
}

export function DailySchedule({
  dailySchedules,
  activeDateKey,
  onActiveDateChange,
  hiddenIds,
  isPending,
  onComplete,
  onSkip,
}: DailyScheduleProps) {
  const router = useRouter();
  const [touchStartX, setTouchStartX] = React.useState<number | null>(null);

  // インデックス計算ではなく、直接日付キーで検索する（なければ先頭）
  const activeDay =
    dailySchedules.find((d) => d.dateKey === activeDateKey) ??
    dailySchedules[0];

  const moveDay = (direction: "prev" | "next") => {
    if (!dailySchedules.length) return;
    const currentIndex = dailySchedules.findIndex(
      (d) => d.dateKey === activeDateKey,
    );
    if (currentIndex === -1) return;

    if (direction === "prev" && currentIndex > 0) {
      onActiveDateChange(dailySchedules[currentIndex - 1].dateKey);
    }
    if (direction === "next" && currentIndex < dailySchedules.length - 1) {
      onActiveDateChange(dailySchedules[currentIndex + 1].dateKey);
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

  // 現在選択されている日のスケジュールを取得
  const visibleSchedules = activeDay
    ? activeDay.schedules.filter(
        (schedule) => !hiddenIds.has(`${activeDay.dateKey}:${schedule.taskId}`),
      )
    : [];

  return (
    <Card className="overflow-hidden border-0 shadow-lg">
      {/* Header with gradient */}
      <div className="flex items-center justify-between bg-linear-to-r from-primary/10 to-transparent px-4 py-3">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="font-semibold text-foreground">
            {activeDay?.formattedDate}
          </span>
        </div>
        {/* Day tabs */}
        <div className="flex gap-1 rounded-full bg-muted/50 p-1">
          {dailySchedules.map((day) => (
            <button
              key={day.dateKey}
              type="button"
              onClick={() => onActiveDateChange(day.dateKey)}
              className={cn(
                "rounded-full px-3 py-1 text-xs font-medium transition-all",
                day.dateKey === activeDateKey
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <CardContent
        className="p-4"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {activeDay && (
          <div className="space-y-4">
            {visibleSchedules.length > 0 ? (
              <>
                {/* Count badge */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {activeDay.isToday ? "今日" : activeDay.label}のスケジュール
                  </span>
                  <div className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1">
                    <Flame className="h-3 w-3 text-primary" />
                    <span className="text-xs font-medium text-primary">
                      {visibleSchedules.length}件
                    </span>
                  </div>
                </div>

                {/* Schedule cards */}
                <div className="space-y-3">
                  {visibleSchedules.map((schedule) => (
                    <ScheduleCard
                      key={schedule.taskId}
                      schedule={schedule}
                      day={activeDay}
                      isPending={isPending}
                      onComplete={onComplete}
                      onSkip={onSkip}
                    />
                  ))}
                </div>
              </>
            ) : (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-linear-to-br from-primary/20 to-primary/5">
                  <Check className="h-8 w-8 text-primary" />
                </div>
                <p className="font-semibold text-foreground">
                  {activeDay.isToday
                    ? "今日のワークアウトは完了！"
                    : "予定はありません"}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {activeDay.isToday
                    ? "素晴らしい！お疲れ様でした"
                    : "ゆっくり休みましょう"}
                </p>
                {activeDay.isToday && (
                  <Button
                    variant="outline"
                    className="mt-5 gap-2 rounded-xl border-primary/30 text-primary hover:bg-primary/5"
                    onClick={() => router.push("/schedule")}
                  >
                    スケジュールを確認
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
