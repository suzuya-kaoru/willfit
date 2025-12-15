"use client";

import { ChevronRight, Info, Play } from "lucide-react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app-header";
import { BottomNavigation } from "@/components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { WorkoutMenuWithExercises, WorkoutSession } from "@/lib/types";

interface DashboardClientProps {
  todayFormatted: string;
  todayMenu: WorkoutMenuWithExercises | null;
  previousSession: WorkoutSession | null;
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
  todayMenu,
  previousSession,
  weeklyCompleted,
  weeklyGoal,
  weekDayStatuses,
}: DashboardClientProps) {
  const router = useRouter();

  const handleStartWorkout = () => {
    if (todayMenu) {
      router.push(`/workout/${todayMenu.id}`);
    }
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
        {/* Today's Plan Card */}
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
          <CardContent className="pt-4">
            {todayMenu ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground">
                    {todayMenu.name}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {todayMenu.exercises.map((ex) => (
                      <span
                        key={ex.id}
                        className="rounded-full bg-secondary px-2.5 py-1 text-xs text-secondary-foreground"
                      >
                        {ex.name}
                      </span>
                    ))}
                  </div>
                </div>

                {previousSession?.note && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <div className="mb-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Info className="h-3.5 w-3.5" />
                      前回のメモ
                    </div>
                    <p className="text-sm text-foreground">
                      {previousSession.note}
                    </p>
                  </div>
                )}

                <Button
                  onClick={handleStartWorkout}
                  className="w-full gap-2"
                  size="lg"
                >
                  <Play className="h-5 w-5" />
                  トレーニングを開始する
                </Button>
              </div>
            ) : (
              <div className="py-6 text-center">
                <p className="text-muted-foreground">今日は休息日です</p>
                <Button
                  variant="outline"
                  className="mt-4 bg-transparent"
                  onClick={() => router.push("/settings")}
                >
                  メニューを選択して開始
                  <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BottomNavigation />
    </div>
  );
}
