"use client";

import { ChevronRight, Info, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { AppHeader } from "@/components/app-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ExerciseWithBodyParts } from "@/lib/types";
import { cn } from "@/lib/utils";

type TodayScheduleViewModel = {
  scheduleId: number;
  menuId: number;
  menuName: string;
  exercises: ExerciseWithBodyParts[];
  previousNote: string | null;
};

type DailySchedulesViewModel = {
  dateKey: string;
  label: string;
  isToday: boolean;
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

  const moveDay = (direction: "prev" | "next") => {
    if (!dailySchedules.length) return;
    const currentIndex = dailySchedules.findIndex(
      (d) => d.dateKey === activeDateKey,
    );
    if (currentIndex === -1) return;

    if (direction === "prev" && currentIndex > 0) {
      setActiveDateKey(dailySchedules[currentIndex - 1]?.dateKey);
    }
    if (direction === "next" && currentIndex < dailySchedules.length - 1) {
      setActiveDateKey(dailySchedules[currentIndex + 1]?.dateKey);
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
                    {
                      ["日", "月", "火", "水", "木", "金", "土"][
                        status.dayOfWeekIndex
                      ]
                    }
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
                {dailySchedules.map((day) => (
                  <div key={day.dateKey} className="w-full shrink-0 space-y-4">
                    {day.schedules.length > 0 ? (
                      <>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            この日のスケジュール
                          </p>
                          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                            残り {day.schedules.length} 件
                          </span>
                        </div>

                        <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                          {day.schedules.map((schedule) => (
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
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}
